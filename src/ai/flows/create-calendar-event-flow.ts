
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

    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!calendarId) {
        console.error('CALENDAR_CREATE_EVENT: GOOGLE_CALENDAR_ID is not set in environment variables.');
        return { success: false, errorKey: 'landing:booking.error.calendarConfigError' };
    }
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.error('CALENDAR_CREATE_EVENT: GOOGLE_APPLICATION_CREDENTIALS is not set.');
      return { success: false, errorKey: 'landing:booking.error.calendarConfigError' };
    }

    let eventTimes;
    try {
        eventTimes = getEventDateTime(input.date, input.time, restaurantConfig.bookingSlotDurationMinutes);
    } catch (error: any) {
        console.error("CALENDAR_CREATE_EVENT: Error processing event date/time:", error.message);
        return { success: false, errorKey: "landing:booking.error.invalidDateTime" };
    }
    
    const { startTimeIso, endTimeIso } = eventTimes;

    const eventSummary = `Reserva para ${input.name} (${input.guests} ${input.guests === 1 ? 'comensal' : 'comensales'})`;
    const eventDescription = `Reserva realizada a través del sitio web.\n\nNombre: ${input.name}\nEmail: ${input.email}\nTeléfono: ${input.phone}\nComensales: ${input.guests}\nNotas: ${input.notes || 'N/A'}\n\n---\nGuestCount: ${input.guests} <!-- Simple marker for parsing -->`;

    const event = {
      summary: eventSummary,
      description: eventDescription,
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
      //   { email: input.email }, // Customer's email
      //   // { email: 'your-restaurant-notifications@example.com' } // Your internal notification email
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
      const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
        // GOOGLE_APPLICATION_CREDENTIALS env var is used automatically
      });
      const authClient = await auth.getClient();
      google.options({ auth: authClient });

      const calendar = google.calendar({ version: 'v3' });

      const createdEvent = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });

      if (createdEvent.data.id) {
        console.log(`CALENDAR_CREATE_EVENT: Successfully created event (ID: ${createdEvent.data.id}) from ${startTimeIso} to ${endTimeIso}.`);
        return {
          success: true,
          eventId: createdEvent.data.id,
        };
      } else {
        console.error('CALENDAR_CREATE_EVENT: Event created but no ID returned from API.');
        return {
          success: false,
          errorKey: 'landing:booking.error.calendarError',
        };
      }
    } catch (error: any) {
      console.error('CALENDAR_CREATE_EVENT: Error creating Google Calendar event:', error.response?.data || error.message, error.stack);
      return {
        success: false,
        errorKey: 'landing:booking.error.calendarError',
      };
    }
  }
);
