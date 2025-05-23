
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
import { addMinutes, parseISO, formatISO, parse } from 'date-fns';
import { google } from 'googleapis';

// console.log('CALENDAR_CREATE_EVENT_FLOW_LOAD: Flow file loaded.');
// console.log('CALENDAR_CREATE_EVENT_FLOW_LOAD: Initial GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
// console.log('CALENDAR_CREATE_EVENT_FLOW_LOAD: Initial GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);


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
  // console.log('CALENDAR_CREATE_EVENT_HELPER_DTR: Parsing date ' + dateStr + ' and time ' + timeStr + ' with duration ' + durationMinutes + ' mins.');
  let parsedDate: Date;
  try {
    parsedDate = parse(dateStr + " " + timeStr, 'yyyy-MM-dd h:mm a', new Date());
    if (isNaN(parsedDate.getTime())) {
      // console.log('CALENDAR_CREATE_EVENT_HELPER_DTR: First parse (h:mm a) resulted in NaN. Trying HH:mm.');
      parsedDate = parse(dateStr + " " + timeStr, 'yyyy-MM-dd HH:mm', new Date());
    }
  } catch (e: any) {
     console.error('CALENDAR_CREATE_EVENT_HELPER_DTR: Error parsing date/time string: ' + dateStr + ' ' + timeStr, e.message, e.stack);
     throw new Error("Invalid date/time format for event.");
  }

  if (isNaN(parsedDate.getTime())) {
      console.error('CALENDAR_CREATE_EVENT_HELPER_DTR: Parsed date is invalid for ' + dateStr + ' ' + timeStr + ' after all attempts.');
      throw new Error("Invalid date/time format for event after parsing attempts.");
  }
  // console.log('CALENDAR_CREATE_EVENT_HELPER_DTR: Successfully parsed to Date object:', parsedDate.toISOString());

  const startTimeIso = formatISO(parsedDate);
  const endTimeIso = formatISO(addMinutes(parsedDate, durationMinutes));
  // console.log('CALENDAR_CREATE_EVENT_HELPER_DTR: ISO range: startTimeIso=' + startTimeIso + ', endTimeIso=' + endTimeIso);
  return { startTimeIso, endTimeIso };
};


// Exported wrapper function
export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CreateCalendarEventOutput> {
  // console.log('CALENDAR_CREATE_EVENT_FLOW: Wrapper function called with input:', input);
  return createCalendarEventFlow(input);
}

const createCalendarEventFlow = ai.defineFlow(
  {
    name: 'createCalendarEventFlow',
    inputSchema: CreateCalendarEventInputSchema,
    outputSchema: CreateCalendarEventOutputSchema,
  },
  async (input) => {
    // console.log('CALENDAR_CREATE_EVENT_FLOW: Genkit flow execution started with input:', input);
    // console.log('CALENDAR_CREATE_EVENT_FLOW_ENV_CHECK: GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    // console.log('CALENDAR_CREATE_EVENT_FLOW_ENV_CHECK: GOOGLE_CALENDAR_ID:', process.env.GOOGLE_CALENDAR_ID);
    // console.log('CALENDAR_CREATE_EVENT_FLOW_ENV_CHECK: GOOGLE_CREDENTIALS_JSON set:', !!process.env.GOOGLE_CREDENTIALS_JSON);

    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const googleCredentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
    const googleAppCredentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (!calendarId) {
        console.error('CALENDAR_CREATE_EVENT_FLOW: CRITICAL - GOOGLE_CALENDAR_ID is not set in environment variables.');
        return { success: false, errorKey: 'landing:booking.error.calendarConfigError' };
    }
    // console.log('CALENDAR_CREATE_EVENT_FLOW: GOOGLE_CALENDAR_ID found:', calendarId);

    let authOptions: any = {
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
    };

    if (googleCredentialsJson) {
      // console.log('CALENDAR_CREATE_EVENT_FLOW: Found GOOGLE_CREDENTIALS_JSON, attempting to use it.');
      try {
        authOptions.credentials = JSON.parse(googleCredentialsJson);
      } catch (e: any) {
        console.error('CALENDAR_CREATE_EVENT_FLOW: CRITICAL - Failed to parse GOOGLE_CREDENTIALS_JSON:', e.message);
        return { success: false, errorKey: 'landing:booking.error.calendarConfigError' };
      }
    } else if (googleAppCredentialsPath) {
      // console.log('CALENDAR_CREATE_EVENT_FLOW: GOOGLE_CREDENTIALS_JSON not found, using GOOGLE_APPLICATION_CREDENTIALS path:', googleAppCredentialsPath);
      authOptions.keyFile = googleAppCredentialsPath;
    } else {
      console.error('CALENDAR_CREATE_EVENT_FLOW: CRITICAL - Neither GOOGLE_CREDENTIALS_JSON nor GOOGLE_APPLICATION_CREDENTIALS are set.');
      return { success: false, errorKey: 'landing:booking.error.calendarConfigError' };
    }


    let eventTimes;
    try {
        // console.log('CALENDAR_CREATE_EVENT_FLOW: Attempting to parse event date and time.');
        eventTimes = getEventDateTime(input.date, input.time, restaurantConfig.bookingSlotDurationMinutes);
        // console.log('CALENDAR_CREATE_EVENT_FLOW: Successfully parsed event date/time range:', eventTimes);
    } catch (error: any) {
        // console.error("CALENDAR_CREATE_EVENT_FLOW: Error processing event date/time:", error.message, error.stack);
        return { success: false, errorKey: "landing:booking.error.invalidDateTime" };
    }

    const { startTimeIso, endTimeIso } = eventTimes;

    const eventSummary = 'Reserva para ' + input.name + ' (' + input.guests + (input.guests === 1 ? ' comensal' : ' comensales') + ')';
    const eventDescription = 'Reserva realizada a través del sitio web.\n\nNombre: ' + input.name + '\nEmail: ' + input.email + '\nTeléfono: ' + input.phone + '\nComensales: ' + input.guests + '\nNotas: ' + (input.notes || 'N/A') + '\n\n---\nGuestCount: ' + input.guests + ' <!-- Simple marker for parsing -->';

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
    };

    try {
      // console.log('CALENDAR_CREATE_EVENT_FLOW: Initializing Google Auth...');
      const auth = new google.auth.GoogleAuth(authOptions);
      const authClient = await auth.getClient();
      google.options({ auth: authClient });
      // console.log('CALENDAR_CREATE_EVENT_FLOW: Google Auth initialized successfully.');

      const calendar = google.calendar({ version: 'v3' });
      // console.log('CALENDAR_CREATE_EVENT_FLOW: Inserting event into calendar ' + calendarId + '...');

      const createdEvent = await calendar.events.insert({
        calendarId: calendarId,
        requestBody: event,
      });
      // console.log('CALENDAR_CREATE_EVENT_FLOW: Successfully inserted event into Google Calendar.');


      if (createdEvent.data.id) {
        // console.log('CALENDAR_CREATE_EVENT_FLOW: Successfully created event (ID: ' + createdEvent.data.id + ') from ' + startTimeIso + ' to ' + endTimeIso + '.');
        return {
          success: true,
          eventId: createdEvent.data.id,
        };
      } else {
        // console.error('CALENDAR_CREATE_EVENT_FLOW: Event created but no ID returned from API. This is unexpected.');
        return {
          success: false,
          errorKey: 'landing:booking.error.calendarError',
        };
      }
    } catch (error: any) {
      console.error('CALENDAR_CREATE_EVENT_FLOW: ERROR during Google Calendar API interaction (event insert).');
      console.error('CALENDAR_CREATE_EVENT_FLOW: Detailed error:', error.response?.data || error.message, error.stack);
      return {
        success: false,
        errorKey: 'landing:booking.error.calendarError',
      };
    }
  }
);
