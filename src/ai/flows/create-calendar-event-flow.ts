
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
import { addMinutes, parse, formatISO } from 'date-fns';
import { google } from 'googleapis';

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
  let parsedDate: Date;
  try {
    parsedDate = parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    if (isNaN(parsedDate.getTime())) {
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

    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    let eventTimes;
    try {
        eventTimes = getEventDateTime(input.date, input.time, restaurantConfig.bookingSlotDurationMinutes);
    } catch (error: any) {
        console.error("CALENDAR_CREATE_EVENT: Error processing event date/time:", error.message);
        return { success: false, errorKey: "landing:booking.error.invalidDateTime" };
    }
    
    const { startTimeIso, endTimeIso } = eventTimes;

    // !! IMPORTANT: Google Calendar API Integration Placeholder !!
    // You need to:
    // 1. Ensure GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CALENDAR_ID are set in your .env.local.
    // 2. The service account must have permissions to write to the calendar.
    // 3. Adapt the event object below to your needs.

    const event = {
      summary: `Reserva para ${input.name} (${input.guests} ${input.guests === 1 ? 'comensal' : 'comensales'})`,
      description: `Reserva realizada a través del sitio web.\n\nNombre: ${input.name}\nEmail: ${input.email}\nTeléfono: ${input.phone}\nComensales: ${input.guests}\nNotas: ${input.notes || 'N/A'}`,
      start: {
        dateTime: startTimeIso,
        timeZone: restaurantConfig.timeZone,
      },
      end: {
        dateTime: endTimeIso,
        timeZone: restaurantConfig.timeZone,
      },
      // Optional: Add attendees
      // attendees: [
      //   { email: input.email },
      //   // { email: 'restaurant-booking-notifications@example.com' } // Your notification email
      // ],
      // Optional: Add reminders
      // reminders: {
      //   useDefault: false,
      //   overrides: [
      //     { method: 'email', minutes: 24 * 60 }, // 24 hours before
      //     { method: 'popup', minutes: 60 },      // 1 hour before
      //   ],
      // },
    };

    try {
      // Initialize Google Auth (Service Account)
      // const auth = new google.auth.GoogleAuth({
      //   scopes: ['https://www.googleapis.com/auth/calendar.events'],
      // });
      // const authClient = await auth.getClient();
      // google.options({ auth: authClient });

      // const calendar = google.calendar({ version: 'v3' });

      // const createdEvent = await calendar.events.insert({
      //   calendarId: calendarId,
      //   requestBody: event,
      // });

      // if (createdEvent.data.id) {
      //   console.log(`CALENDAR_CREATE_EVENT: Successfully created event (ID: ${createdEvent.data.id}) from ${startTimeIso} to ${endTimeIso}.`);
      //   return {
      //     success: true,
      //     eventId: createdEvent.data.id,
      //   };
      // } else {
      //   console.error('CALENDAR_CREATE_EVENT: Event created but no ID returned from API.');
      //   return {
      //     success: false,
      //     errorKey: 'landing:booking.error.calendarError',
      //   };
      // }

      // Placeholder logic (remove or adapt when implementing real API calls):
      const isSimulatedError = false; // Math.random() < 0.1; // Simulate a 10% chance of error
      if (isSimulatedError) {
        console.error('CALENDAR_CREATE_EVENT: Simulated error creating calendar event.');
        return {
          success: false,
          errorKey: 'landing:booking.error.calendarError',
        };
      }
      const simulatedEventId = `simulated_event_${Date.now()}`;
      console.log(`CALENDAR_CREATE_EVENT: Successfully created simulated event (ID: ${simulatedEventId}) from ${startTimeIso} to ${endTimeIso}. Event details:`, event);
      return {
        success: true,
        eventId: simulatedEventId,
      };

    } catch (error: any) {
      console.error('CALENDAR_CREATE_EVENT: Error creating Google Calendar event:', error.message, error.stack);
      return {
        success: false,
        errorKey: 'landing:booking.error.calendarError',
      };
    }
  }
);
