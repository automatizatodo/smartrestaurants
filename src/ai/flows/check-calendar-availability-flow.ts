
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

    // !! IMPORTANT: Google Calendar API Integration Placeholder !!
    // You need to:
    // 1. Ensure GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CALENDAR_ID are set in your .env.local.
    // 2. The service account must have permissions to read the calendar.
    // 3. Implement robust logic to check for overlapping events and guest capacity.

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

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
      // const auth = new google.auth.GoogleAuth({
      //   scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
      // });
      // const authClient = await auth.getClient();
      // google.options({ auth: authClient });

      // const calendar = google.calendar({ version: 'v3' });

      // const response = await calendar.events.list({
      //   calendarId: calendarId,
      //   timeMin: timeMin,
      //   timeMax: timeMax,
      //   singleEvents: true, // Important for expanding recurring events
      //   orderBy: 'startTime',
      //   // q: 'Booking for', // Optional: filter by event summary if you have a consistent naming
      //   timeZone: restaurantConfig.timeZone,
      // });

      // const events = response.data.items;
      // if (events && events.length > 0) {
      //   // TODO: Implement logic to check total guests from existing events
      //   // and compare against restaurantConfig.bookingMaxGuestsPerSlot
      //   // For now, any event means it's booked.
      //   console.log(`CALENDAR_CHECK_AVAIL: Found ${events.length} existing event(s) in this slot.`);
      //   return {
      //     isAvailable: false,
      //     reasonKey: 'landing:booking.error.slotUnavailable.fullyBooked',
      //   };
      // }

      // Placeholder logic (remove or adapt when implementing real API calls):
      if (input.time === "7:00 PM" && input.guests > 4) {
        console.log('CALENDAR_CHECK_AVAIL: Simulated conflict for 7:00 PM with > 4 guests.');
        return {
          isAvailable: false,
          reasonKey: 'landing:booking.error.slotUnavailable.tooManyGuests',
        };
      }
      if (input.date === "2024-12-25") {
        console.log('CALENDAR_CHECK_AVAIL: Simulated fully booked for Christmas.');
        return {
          isAvailable: false,
          reasonKey: 'landing:booking.error.slotUnavailable.fullyBooked',
        };
      }

      console.log('CALENDAR_CHECK_AVAIL: Slot appears available (placeholder or no conflicts).');
      return { isAvailable: true };

    } catch (error: any) {
      console.error('CALENDAR_CHECK_AVAIL: Error querying Google Calendar API:', error.message);
      // Consider if this should be a user-facing error or just a log
      return {
        isAvailable: false, // Safer to assume not available if API call fails
        reasonKey: 'landing:booking.error.calendarCheckFailed',
      };
    }
  }
);
