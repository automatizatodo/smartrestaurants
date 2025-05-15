
'use server';
/**
 * @fileOverview A Genkit flow to create a booking event in Google Calendar.
 *
 * - createCalendarEvent - A function to create the calendar event.
 * - CreateCalendarEventInput - The input type for the function.
 * - CreateCalendarEventOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import restaurantConfig from '@/config/restaurant.config';
import { addMinutes, parse, formatISO } from 'date-fns'; // Using date-fns for date manipulation

// Define Zod schema for input
const CreateCalendarEventInputSchema = z.object({
  name: z.string().describe('Name of the person making the booking.'),
  email: z.string().email().describe('Email of the person making the booking.'),
  phone: z.string().describe('Phone number of the person making the booking.'),
  date: z.string().describe('Date of the booking (YYYY-MM-DD).'),
  time: z.string().describe('Time of the booking (e.g., "7:00 PM" or "19:00").'),
  guests: z.number().int().min(1).describe('Number of guests.'),
  notes: z.string().optional().describe('Any special notes for the booking.'),
});
export type CreateCalendarEventInput = z.infer<typeof CreateCalendarEventInputSchema>;

// Define Zod schema for output
const CreateCalendarEventOutputSchema = z.object({
  success: z.boolean().describe('Whether the event creation was successful.'),
  eventId: z.string().optional().describe('The ID of the created Google Calendar event.'),
  errorKey: z.string().optional().describe('A translation key for an error message if creation failed (e.g., "booking.error.calendarError").'),
});
export type CreateCalendarEventOutput = z.infer<typeof CreateCalendarEventOutputSchema>;


// Helper to parse time string (e.g., "5:00 PM") and combine with date
const getEventDateTime = (dateStr: string, timeStr: string, durationMinutes: number) => {
  // Parse combined date and time string. Handles "h:mm a" (e.g., "5:00 PM") and "HH:mm" (e.g., "17:00")
  let parsedDate: Date;
  try {
    // Attempt to parse with AM/PM first
    parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    if (isNaN(parsedDate.getTime())) {
      // If AM/PM parse fails, try 24-hour format
      parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date());
    }
  } catch (e) {
     console.error(`CALENDAR_CREATE_EVENT: Error parsing date/time: ${dateStr} ${timeStr}`, e);
     throw new Error("Invalid date/time format for event.");
  }
  
  if (isNaN(parsedDate.getTime())) {
      console.error(`CALENDAR_CREATE_EVENT: Parsed date is invalid for ${dateStr} ${timeStr}`);
      throw new Error("Invalid date/time format for event after parsing attempts.");
  }

  const startTimeIso = formatISO(parsedDate);
  const endTimeIso = formatISO(addMinutes(parsedDate, durationMinutes));
  return { startTimeIso, endTimeIso };
};


// Exported wrapper function
export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CreateCalendarEventOutput> {
  return createCalendarEventFlow(input);
}

const createCalendarEventFlow = ai.defineFlow(
  {
    name: 'createCalendarEventFlow',
    inputSchema: CreateCalendarEventInputSchema,
    outputSchema: CreateCalendarEventOutputSchema,
  },
  async (input) => {
    console.log('CALENDAR_CREATE_EVENT: Attempting to create event for:', input);

    let eventTimes;
    try {
        eventTimes = getEventDateTime(input.date, input.time, restaurantConfig.bookingSlotDurationMinutes);
    } catch (error: any) {
        console.error("CALENDAR_CREATE_EVENT: Error processing event date/time:", error.message);
        return { success: false, errorKey: "landing:booking.error.invalidDateTime" };
    }
    
    const { startTimeIso, endTimeIso } = eventTimes;

    // !! IMPORTANT !!
    // This is a placeholder. In a real application, you would:
    // 1. Use the Google Calendar API (e.g., via 'googleapis' library).
    // 2. Authenticate with Google (OAuth 2.0).
    // 3. Construct an event object with:
    //    - summary: `Booking for ${input.name} (${input.guests} guests)`
    //    - description: `Email: ${input.email}\nPhone: ${input.phone}\nGuests: ${input.guests}\nNotes: ${input.notes || 'N/A'}`
    //    - start: { dateTime: startTimeIso, timeZone: 'Your/Restaurant/TimeZone' } (e.g., 'America/New_York')
    //    - end: { dateTime: endTimeIso, timeZone: 'Your/Restaurant/TimeZone' }
    //    - attendees: [{ email: input.email }, { email: 'restaurant-bookings@example.com' }] (optional)
    // 4. Insert the event into the primary calendar.
    // 5. Handle API errors from Google.

    // Placeholder logic:
    const isSimulatedError = false; // Math.random() < 0.1; // Simulate a 10% chance of error

    if (isSimulatedError) {
      console.error('CALENDAR_CREATE_EVENT: Simulated error creating calendar event.');
      return {
        success: false,
        errorKey: 'landing:booking.error.calendarError', // Generic calendar error key
      };
    }

    const simulatedEventId = `simulated_event_${Date.now()}`;
    console.log(`CALENDAR_CREATE_EVENT: Successfully created simulated event (ID: ${simulatedEventId}) from ${startTimeIso} to ${endTimeIso}.`);
    return {
      success: true,
      eventId: simulatedEventId,
    };
  }
);
