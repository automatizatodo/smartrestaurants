
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
  let parsedDate: Date;
  try {
    parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    if (isNaN(parsedDate.getTime())) {
      parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    }
  } catch (e) {
     console.error(`CALENDAR_CHECK_AVAIL: Error parsing date/time: ${dateStr} ${timeStr}`, e);
     throw new Error("Invalid date/time format for event.");
  }
  
  if (isNaN(parsedDate.getTime())) {
      console.error(`CALENDAR_CHECK_AVAIL: Parsed date is invalid for ${dateStr} ${timeStr}`);
      throw new Error("Invalid date/time format for event after parsing attempts.");
  }

  const timeMin = formatISO(parsedDate);
  const timeMax = formatISO(addMinutes(parsedDate, durationMinutes));
  return { timeMin, timeMax };
};

// Function to parse guest count from event summary/description
// Example: "Booking for John Doe (4 guests)" -> 4
// This is a simple parser and might need to be more robust.
const parseGuestsFromEvent = (event: any): number => {
  const summary = event.summary || '';
  const description = event.description || '';
  
  const combinedText = `${summary} ${description}`;
  const guestsMatch = combinedText.match(/\((\d+)\s*(guest|guests|comensal|comensales)\)/i);
  
  if (guestsMatch && guestsMatch[1]) {
    return parseInt(guestsMatch[1], 10);
  }
  return 0; // Default to 0 if not found, or handle as an error
};


// Exported wrapper function
export async function checkCalendarAvailability(input: CheckCalendarAvailabilityInput): Promise<CheckCalendarAvailabilityOutput> {
  return checkCalendarAvailabilityFlow(input);
}

const checkCalendarAvailabilityFlow = ai.defineFlow(
  {
    name: 'checkCalendarAvailabilityFlow',
    inputSchema: CheckCalendarAvailabilityInputSchema,
    outputSchema: CheckCalendarAvailabilityOutputSchema,
  },
  async (input) => {
    console.log('CALENDAR_CHECK_AVAIL: Checking availability for:', input);
    
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
        console.error('CALENDAR_CHECK_AVAIL: GOOGLE_CALENDAR_ID is not set in environment variables.');
        return { isAvailable: false, reasonKey: 'landing:booking.error.calendarConfigError' };
    }
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('CALENDAR_CHECK_AVAIL: GOOGLE_APPLICATION_CREDENTIALS is not set.');
      return { isAvailable: false, reasonKey: 'landing:booking.error.calendarConfigError' };
    }


    let eventDateTime;
    try {
        eventDateTime = getEventDateTimeRange(input.date, input.time, restaurantConfig.bookingSlotDurationMinutes);
    } catch (error: any) {
        console.error("CALENDAR_CHECK_AVAIL: Error processing event date/time:", error.message);
        return { isAvailable: false, reasonKey: "landing:booking.error.invalidDateTime" };
    }
    const { timeMin, timeMax } = eventDateTime;

    try {
      // Initialize Google Auth (Service Account)
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
        // GOOGLE_APPLICATION_CREDENTIALS env var is used automatically
      });
      const authClient = await auth.getClient();
      google.options({ auth: authClient });

      const calendar = google.calendar({ version: 'v3' });

      const response = await calendar.events.list({
        calendarId: calendarId,
        timeMin: timeMin,
        timeMax: timeMax,
        singleEvents: true, 
        orderBy: 'startTime',
        timeZone: restaurantConfig.timeZone,
      });

      const events = response.data.items;
      let totalGuestsInSlot = 0;

      if (events && events.length > 0) {
        console.log(`CALENDAR_CHECK_AVAIL: Found ${events.length} existing event(s) in this slot.`);
        events.forEach(event => {
          totalGuestsInSlot += parseGuestsFromEvent(event);
        });
         console.log(`CALENDAR_CHECK_AVAIL: Total guests already booked in this slot: ${totalGuestsInSlot}`);
      }

      const maxGuestsAllowed = restaurantConfig.bookingMaxGuestsPerSlot || 8; // Default to 8 if not set
      const remainingCapacity = maxGuestsAllowed - totalGuestsInSlot;

      if (input.guests > remainingCapacity) {
        if (remainingCapacity <= 0) {
            console.log(`CALENDAR_CHECK_AVAIL: Slot fully booked. Requested ${input.guests}, capacity ${maxGuestsAllowed}, booked ${totalGuestsInSlot}.`);
            return {
                isAvailable: false,
                reasonKey: 'landing:booking.error.slotUnavailable.fullyBooked',
            };
        } else {
            console.log(`CALENDAR_CHECK_AVAIL: Not enough capacity. Requested ${input.guests}, remaining ${remainingCapacity}.`);
            return {
                isAvailable: false,
                reasonKey: 'landing:booking.error.slotUnavailable.tooManyGuests',
                maxGuestsForSlot: remainingCapacity, // Inform user about remaining capacity
            };
        }
      }

      console.log(`CALENDAR_CHECK_AVAIL: Slot available. Requested ${input.guests}, remaining capacity ${remainingCapacity}.`);
      return { isAvailable: true };

    } catch (error: any) {
      console.error('CALENDAR_CHECK_AVAIL: Error querying Google Calendar API:', error.response?.data || error.message, error.stack);
      return {
        isAvailable: false, 
        reasonKey: 'landing:booking.error.calendarCheckFailed',
      };
    }
  }
);
