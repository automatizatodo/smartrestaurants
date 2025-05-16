
'use server';
/**
 * @fileOverview A Genkit flow to check Google Calendar availability for a booking.
 *
 * - checkCalendarAvailability - A function that checks if a time slot is available.
 * - CheckCalendarAvailabilityInput - The input type for the function.
 * - CheckCalendarAvailabilityOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import restaurantConfig from '@/config/restaurant.config';
import { google } from 'googleapis';
import { addMinutes, parse, formatISO } from 'date-fns';

console.log('CALENDAR_CHECK_AVAIL_FLOW_LOAD: Flow file loaded.');
console.log('CALENDAR_CHECK_AVAIL_FLOW_LOAD: Initial GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
console.log('CALENDAR_CHECK_AVAIL_FLOW_LOAD: Initial GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
console.log('CALENDAR_CHECK_AVAIL_FLOW_LOAD: VERCEL env var:', process.env.VERCEL);
console.log('CALENDAR_CHECK_AVAIL_FLOW_LOAD: GOOGLE_CREDENTIALS_JSON env var (first 50 chars):', process.env.GOOGLE_CREDENTIALS_JSON?.substring(0, 50));


const CheckCalendarAvailabilityInputSchema = z.object({
  date: z.string().describe('The desired date for the booking (YYYY-MM-DD).'),
  time: z.string().describe('The desired time for the booking (e.g., "5:00 PM").'),
  guests: z.number().int().min(1).describe('The number of guests for the booking.'),
});
export type CheckCalendarAvailabilityInput = z.infer<typeof CheckCalendarAvailabilityInputSchema>;

const CheckCalendarAvailabilityOutputSchema = z.object({
  isAvailable: z.boolean().describe('Whether the time slot is available.'),
  reasonKey: z.string().optional().describe('A translation key for the reason if not available (e.g., "booking.error.slotUnavailable").'),
  maxGuestsForSlot: z.number().optional().describe('If partially available, indicates remaining guest capacity.'),
});
export type CheckCalendarAvailabilityOutput = z.infer<typeof CheckCalendarAvailabilityOutputSchema>;

// Helper to parse time string and combine with date
const getEventDateTimeRange = (dateStr: string, timeStr: string, durationMinutes: number) => {
  console.log(`CALENDAR_CHECK_AVAIL_HELPER_DTR: Parsing date '${dateStr}' and time '${timeStr}' with duration ${durationMinutes} mins.`);
  let parsedDate: Date;
  try {
    parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    if (isNaN(parsedDate.getTime())) {
      console.log(`CALENDAR_CHECK_AVAIL_HELPER_DTR: First parse (h:mm a) resulted in NaN. Trying HH:mm.`);
      parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    }
  } catch (e: any) {
     console.error(`CALENDAR_CHECK_AVAIL_HELPER_DTR: Error parsing date/time string: ${dateStr} ${timeStr}`, e.message, e.stack);
     throw new Error("Invalid date/time format for event.");
  }

  if (isNaN(parsedDate.getTime())) {
      console.error(`CALENDAR_CHECK_AVAIL_HELPER_DTR: Parsed date is invalid for ${dateStr} ${timeStr} after all attempts.`);
      throw new Error("Invalid date/time format for event after parsing attempts.");
  }
  console.log(`CALENDAR_CHECK_AVAIL_HELPER_DTR: Successfully parsed to Date object:`, parsedDate.toISOString());

  const timeMin = formatISO(parsedDate);
  const timeMax = formatISO(addMinutes(parsedDate, durationMinutes));
  console.log(`CALENDAR_CHECK_AVAIL_HELPER_DTR: ISO range: timeMin=${timeMin}, timeMax=${timeMax}`);
  return { timeMin, timeMax };
};

// Function to parse guest count from event summary/description
const parseGuestsFromEvent = (event: any): number => {
  const summary = event.summary || '';
  const description = event.description || '';
  console.log(`CALENDAR_CHECK_AVAIL_HELPER_PGE: Parsing guests from event. Summary: "${summary}"`);

  const combinedText = `${summary} ${description}`;
  const guestsMatch = combinedText.match(/\((\d+)\s*(guest|guests|comensal|comensales)\)/i);

  if (guestsMatch && guestsMatch[1]) {
    const count = parseInt(guestsMatch[1], 10);
    console.log(`CALENDAR_CHECK_AVAIL_HELPER_PGE: Found ${count} guests via regex.`);
    return count;
  }

  const customMarkerMatch = description.match(/GuestCount:\s*(\d+)/i);
   if (customMarkerMatch && customMarkerMatch[1]) {
    const count = parseInt(customMarkerMatch[1], 10);
    console.log(`CALENDAR_CHECK_AVAIL_HELPER_PGE: Found ${count} guests via custom marker.`);
    return count;
  }
  console.warn(`CALENDAR_CHECK_AVAIL_HELPER_PGE: Could not parse guest count from event: "${summary}". Description: "${description}". Defaulting to 0.`);
  return 0;
};


// Exported wrapper function
export async function checkCalendarAvailability(input: CheckCalendarAvailabilityInput): Promise<CheckCalendarAvailabilityOutput> {
  console.log('CALENDAR_CHECK_AVAIL_FLOW: Wrapper function called with input:', input);
  console.log('CALENDAR_CHECK_AVAIL_FLOW: Using GOOGLE_APPLICATION_CREDENTIALS (local):', process.env.GOOGLE_APPLICATION_CREDENTIALS);
  console.log('CALENDAR_CHECK_AVAIL_FLOW: Using GOOGLE_CREDENTIALS_JSON (Vercel - first 50 chars):', process.env.GOOGLE_CREDENTIALS_JSON?.substring(0,50));
  console.log('CALENDAR_CHECK_AVAIL_FLOW: Using GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
  return checkCalendarAvailabilityFlow(input);
}

const checkCalendarAvailabilityFlow = ai.defineFlow(
  {
    name: 'checkCalendarAvailabilityFlow',
    inputSchema: CheckCalendarAvailabilityInputSchema,
    outputSchema: CheckCalendarAvailabilityOutputSchema,
  },
  async (input) => {
    console.log('CALENDAR_CHECK_AVAIL_FLOW: Genkit flow execution started with input:', input);
    console.log('CALENDAR_CHECK_AVAIL_FLOW_ENV_CHECK: GOOGLE_APPLICATION_CREDENTIALS (local):', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('CALENDAR_CHECK_AVAIL_FLOW_ENV_CHECK: GOOGLE_CREDENTIALS_JSON (Vercel - first 50 chars):', process.env.GOOGLE_CREDENTIALS_JSON?.substring(0,50));
    console.log('CALENDAR_CHECK_AVAIL_FLOW_ENV_CHECK: GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);


    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const googleCredentialsJson = process.env.GOOGLE_CREDENTIALS_JSON; // For Vercel
    const googleAppCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS; // For local dev

    if (!calendarId) {
        console.error('CALENDAR_CHECK_AVAIL_FLOW: CRITICAL - GOOGLE_CALENDAR_ID is not set in environment variables.');
        return { isAvailable: false, reasonKey: 'landing:booking.error.calendarConfigError' };
    }
    console.log('CALENDAR_CHECK_AVAIL_FLOW: GOOGLE_CALENDAR_ID found:', calendarId);

    let authOptions: any = {
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    };

    if (googleCredentialsJson) { // Prioritize JSON content for Vercel/production
        try {
            const credentials = JSON.parse(googleCredentialsJson);
            authOptions.credentials = credentials;
            console.log('CALENDAR_CHECK_AVAIL_FLOW: Using GOOGLE_CREDENTIALS_JSON for auth.');
        } catch (e: any) {
            console.error('CALENDAR_CHECK_AVAIL_FLOW: CRITICAL - Failed to parse GOOGLE_CREDENTIALS_JSON:', e.message, e.stack);
            console.error('CALENDAR_CHECK_AVAIL_FLOW: GOOGLE_CREDENTIALS_JSON (first 100 chars):', googleCredentialsJson.substring(0,100));
            return { isAvailable: false, reasonKey: 'landing:booking.error.calendarConfigError' };
        }
    } else if (googleAppCredentialsPath) { // Fallback to path for local dev
        authOptions.keyFile = googleAppCredentialsPath;
        console.log('CALENDAR_CHECK_AVAIL_FLOW: Using GOOGLE_APPLICATION_CREDENTIALS path for auth.');
    } else {
        console.error('CALENDAR_CHECK_AVAIL_FLOW: CRITICAL - Neither GOOGLE_CREDENTIALS_JSON nor GOOGLE_APPLICATION_CREDENTIALS is set.');
        return { isAvailable: false, reasonKey: 'landing:booking.error.calendarConfigError' };
    }


    let eventDateTime;
    try {
        console.log('CALENDAR_CHECK_AVAIL_FLOW: Attempting to parse event date and time.');
        eventDateTime = getEventDateTimeRange(input.date, input.time, restaurantConfig.bookingSlotDurationMinutes);
        console.log('CALENDAR_CHECK_AVAIL_FLOW: Successfully parsed event date/time range:', eventDateTime);
    } catch (error: any) {
        console.error("CALENDAR_CHECK_AVAIL_FLOW: Error processing event date/time:", error.message, error.stack);
        return { isAvailable: false, reasonKey: "landing:booking.error.invalidDateTime" };
    }
    const { timeMin, timeMax } = eventDateTime;

    try {
      console.log('CALENDAR_CHECK_AVAIL_FLOW: Initializing Google Auth with options:', authOptions.credentials ? {...authOptions, credentials: '***REDACTED***'} : authOptions);
      const auth = new google.auth.GoogleAuth(authOptions);
      const authClient = await auth.getClient();
      google.options({ auth: authClient }); // Set auth options globally for googleapis
      console.log('CALENDAR_CHECK_AVAIL_FLOW: Google Auth initialized successfully.');

      const calendar = google.calendar({ version: 'v3' });
      console.log(`CALENDAR_CHECK_AVAIL_FLOW: Fetching events from calendar '${calendarId}' between ${timeMin} and ${timeMax} (TimeZone: ${restaurantConfig.timeZone})`);

      const response = await calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        timeZone: restaurantConfig.timeZone,
      });
      console.log('CALENDAR_CHECK_AVAIL_FLOW: Successfully fetched events from Google Calendar API.');

      const events = response.data.items;
      let totalGuestsInSlot = 0;

      if (events && events.length > 0) {
        console.log(`CALENDAR_CHECK_AVAIL_FLOW: Found ${events.length} existing event(s) in this slot.`);
        events.forEach(event => {
          totalGuestsInSlot += parseGuestsFromEvent(event);
        });
         console.log(`CALENDAR_CHECK_AVAIL_FLOW: Total guests already booked in this slot: ${totalGuestsInSlot}`);
      } else {
        console.log('CALENDAR_CHECK_AVAIL_FLOW: No existing events found in this slot.');
      }

      const maxGuestsAllowed = restaurantConfig.bookingMaxGuestsPerSlot || 8; // Default to 8 if not set
      const remainingCapacity = maxGuestsAllowed - totalGuestsInSlot;

      if (input.guests > remainingCapacity) {
        if (remainingCapacity <= 0) {
            console.log(`CALENDAR_CHECK_AVAIL_FLOW: Slot fully booked. Requested ${input.guests}, capacity ${maxGuestsAllowed}, booked ${totalGuestsInSlot}.`);
            return {
                isAvailable: false,
                reasonKey: 'landing:booking.error.slotUnavailable.fullyBooked',
            };
        } else {
            console.log(`CALENDAR_CHECK_AVAIL_FLOW: Not enough capacity. Requested ${input.guests}, remaining ${remainingCapacity}.`);
            return {
                isAvailable: false,
                reasonKey: 'landing:booking.error.slotUnavailable.tooManyGuests',
                maxGuestsForSlot: remainingCapacity,
            };
        }
      }

      console.log(`CALENDAR_CHECK_AVAIL_FLOW: Slot available. Requested ${input.guests}, remaining capacity ${remainingCapacity}.`);
      return { isAvailable: true };

    } catch (error: any) {
      console.error('CALENDAR_CHECK_AVAIL_FLOW: ERROR during Google Calendar API interaction.');
      console.error('CALENDAR_CHECK_AVAIL_FLOW: Ensure GOOGLE_CREDENTIALS_JSON (Vercel) or GOOGLE_APPLICATION_CREDENTIALS (local) is set correctly.');
      console.error('CALENDAR_CHECK_AVAIL_FLOW: Ensure the service account has permissions on the calendar and Calendar API is enabled.');
      console.error('CALENDAR_CHECK_AVAIL_FLOW: Detailed error:', error.response?.data || error.message, error.stack);
      return {
        isAvailable: false,
        reasonKey: 'landing:booking.error.calendarCheckFailed',
      };
    }
  }
);
        
        
