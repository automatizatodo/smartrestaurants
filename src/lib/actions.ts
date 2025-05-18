
"use server";

import { config } from 'dotenv'; // Import dotenv
config(); // Load environment variables

import { aiSommelier, type AISommelierInput, type AISommelierOutput } from "@/ai/flows/ai-sommelier";
import { checkCalendarAvailability, type CheckCalendarAvailabilityInput, type CheckCalendarAvailabilityOutput } from "@/ai/flows/check-calendar-availability-flow";
import { createCalendarEvent, type CreateCalendarEventInput, type CreateCalendarEventOutput } from "@/ai/flows/create-calendar-event-flow";
import { fetchMenuDataWithPrice } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
import { z } from "zod";
import restaurantConfig from "@/config/restaurant.config";
import { format, parseISO } from "date-fns";

const SommelierRequestSchema = z.object({
  tastePreferences: z.string().min(10, "landing:aiSommelier.error.preferencesRequired").max(500, "landing:aiSommelier.error.preferencesTooLong"),
});

export interface SommelierFormState {
  messageKey: string | null;
  messageParams?: Record<string, string | number> | null;
  recommendations: string | null;
  errors?: {
    tastePreferences?: string[];
  } | null;
}

const formatMenuForAI = (menuItems: MenuItemData[]): string => {
  if (!menuItems || menuItems.length === 0) {
    return "No menu items available.";
  }
  return menuItems.map(item =>
    "Dish: " + item.name.en +
    "\nDescription: " + item.description.en +
    "\nPrice: " + (item.price || 'N/A') +
    "\nCategory: " + item.categoryKey
  ).join("\n\n");
};


export async function getAISommelierRecommendations(
  prevState: SommelierFormState | null,
  formData: FormData
): Promise<SommelierFormState> {
  // console.log("ACTIONS_AISOMMELIER: getAISommelierRecommendations called.");
  const validatedFields = SommelierRequestSchema.safeParse({
    tastePreferences: formData.get("tastePreferences"),
  });

  if (!validatedFields.success) {
    // console.warn("ACTIONS_AISOMMELIER: Validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      messageKey: "common:form.error.invalidInput",
      recommendations: null,
      errors: validatedFields.error.flatten().fieldErrors,
      messageParams: null,
    };
  }

  let menuInformationString = "Menu information is currently unavailable.";
  try {
    // console.log("ACTIONS_AISOMMELIER: Fetching menu for AI Sommelier...");
    const { menuItems } = await fetchMenuDataWithPrice(); // Corrected function call
    if (menuItems && menuItems.length > 0) {
      menuInformationString = formatMenuForAI(menuItems);
      // console.log("ACTIONS_AISOMMELIER: Menu fetched and formatted.");
    } else {
      // console.warn("ACTIONS_AISOMMELIER: No menu items fetched for AI Sommelier.");
    }
  } catch (error) {
    console.error("ACTIONS_AISOMMELIER: Failed to fetch menu for AI Sommelier:", error);
  }


  const input: AISommelierInput = {
    tastePreferences: validatedFields.data.tastePreferences,
    menuInformation: menuInformationString,
  };

  try {
    // console.log("ACTIONS_AISOMMELIER: Calling aiSommelier flow with input:", input);
    const result: AISommelierOutput = await aiSommelier(input);
    // console.log("ACTIONS_AISOMMELIER: aiSommelier flow result:", result);
    if (result.dishRecommendations) {
      return {
        messageKey: "landing:aiSommelier.toast.successDescriptionKey",
        recommendations: result.dishRecommendations,
        errors: null,
        messageParams: null,
      };
    } else {
      return {
        messageKey: "landing:aiSommelier.toast.errorDescriptionKey",
        recommendations: null,
        errors: null,
        messageParams: null,
      };
    }
  } catch (error) {
    console.error("ACTIONS_AISOMMELIER: AI Sommelier Flow Error:", error);
    let errorMessageKey = "common:form.error.generic";
    if (error instanceof Error && (error.message.includes("NO_RESPONSE") || error.message.includes("generation error"))) {
        errorMessageKey = "landing:aiSommelier.error.couldNotGenerate";
    }
    return {
      messageKey: errorMessageKey,
      recommendations: null,
      errors: null,
      messageParams: null,
    };
  }
}

const BookingSchema = z.object({
  name: z.string().min(1, "landing:booking.error.nameRequired"),
  email: z.string().email("landing:booking.error.emailInvalid"),
  phone: z.string().min(1, "landing:booking.error.phoneRequired"),
  date: z.string().min(1, "landing:booking.error.dateRequired"),
  time: z.string().min(1, "landing:booking.error.timeRequired"),
  guests: z.coerce.number().int().min(1, "landing:booking.error.guestsRequired").max(restaurantConfig.bookingMaxGuestsPerSlot || 8, "landing:booking.error.guestsTooMany"),
  notes: z.string().optional(),
});

export interface BookingFormState {
  messageKey: string | null;
  messageParams?: Record<string, string | number> | null;
  success: boolean;
  errors?: {
    name?: string[];
    email?: string[];
    phone?: string[];
    date?: string[];
    time?: string[];
    guests?: string[];
    notes?: string[];
    general?: string[];
  } | null;
  bookingMethod?: 'whatsapp' | 'calendar';
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export async function submitBooking(
  prevState: BookingFormState | null,
  formData: FormData
): Promise<BookingFormState> {
  // console.log("ACTIONS_BOOKING: submitBooking action initiated.");
  // console.log("ACTIONS_BOOKING: Raw form data:", Object.fromEntries(formData.entries()));

  const rawFormData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    date: formData.get("date"),
    time: formData.get("time"),
    guests: formData.get("guests"),
    notes: formData.get("notes") || undefined,
  };

  const validatedFields = BookingSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    // console.warn("ACTIONS_BOOKING: Form validation failed:", validatedFields.error.flatten().fieldErrors);
    return {
      messageKey: "common:form.error.invalidInput",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      messageParams: null,
    };
  }
  // console.log("ACTIONS_BOOKING: Form data validated successfully:", validatedFields.data);

  const { name, email, phone, date, time, guests, notes } = validatedFields.data;

  if (restaurantConfig.bookingMethod === 'whatsapp') {
    // console.log("ACTIONS_BOOKING: Processing booking via WhatsApp method.");
    if (!restaurantConfig.whatsappBookingNumber) {
      console.error("ACTIONS_BOOKING: WhatsApp booking number is not configured in restaurantConfig.");
      return {
        messageKey: "landing:booking.error.whatsappConfigError",
        success: false,
        errors: { general: ["landing:booking.error.whatsappConfigError"] },
        messageParams: null,
      };
    }

    let formattedDate = date; // Default to YYYY-MM-DD
    try {
        const parsedDateObj = parseISO(date);
        formattedDate = format(parsedDateObj, "PPP"); // Use a locale-friendly format if parseISO succeeds
    } catch (e) {
        // console.warn(\`ACTIONS_BOOKING_WHATSAPP: Could not parse date '\${date}' with parseISO. Using original string.\`);
    }

    const restaurantNameForMsg = restaurantConfig.restaurantDisplayName || 'el restaurante';
    const messageParts = [
      "Hola " + restaurantNameForMsg + ",",
      "Quisiera solicitar una reserva:",
      "- Nombre: " + name,
      "- Email: " + email,
      "- Teléfono: " + phone,
      "- Fecha: " + formattedDate,
      "- Hora: " + time,
      "- Comensales: " + guests,
    ];
    if (notes) {
      messageParts.push("- Notas: " + notes);
    }
    const whatsappMessage = messageParts.join("\n");

    // console.log("ACTIONS_BOOKING: WhatsApp message prepared:", whatsappMessage);

    return {
      messageKey: "landing:booking.successMessageWhatsapp",
      success: true,
      errors: null,
      messageParams: { name },
      bookingMethod: 'whatsapp',
      whatsappNumber: restaurantConfig.whatsappBookingNumber.replace(/\D/g, ''),
      whatsappMessage: whatsappMessage,
    };

  } else if (restaurantConfig.bookingMethod === 'calendar') {
    // console.log("ACTIONS_BOOKING: Processing booking via Google Calendar method.");
    let availabilityResult: CheckCalendarAvailabilityOutput | undefined;
    try {
      // console.log("ACTIONS_BOOKING: Calling checkCalendarAvailability flow...");
      const availabilityInput: CheckCalendarAvailabilityInput = { date, time, guests };
      availabilityResult = await checkCalendarAvailability(availabilityInput);
      // console.log("ACTIONS_BOOKING: checkCalendarAvailability flow response:", availabilityResult);

      if (!availabilityResult || typeof availabilityResult.isAvailable === 'undefined') {
          console.error("SUBMIT_BOOKING_ACTION: CRITICAL - Invalid or undefined response from checkCalendarAvailability flow.", availabilityResult);
          return {
              messageKey: "landing:booking.error.calendarCheckFailed",
              success: false,
              errors: { general: ["landing:booking.error.calendarCheckFailed"] },
              messageParams: null,
          };
      }

      if (!availabilityResult.isAvailable) {
        const messageParams = availabilityResult.reasonKey === 'landing:booking.error.slotUnavailable.tooManyGuests'
          ? { time, date, guests: String(guests), maxGuestsForSlot: String(availabilityResult.maxGuestsForSlot || 0) }
          : { time, date };
        // console.warn("ACTIONS_BOOKING: Slot not available according to checkCalendarAvailability flow.", availabilityResult);
        return {
          messageKey: availabilityResult.reasonKey || "landing:booking.error.slotUnavailable",
          success: false,
          errors: { general: [availabilityResult.reasonKey || "landing:booking.error.slotUnavailable"] },
          messageParams: messageParams,
        };
      }
    } catch (error: any) {
      console.error("SUBMIT_BOOKING_ACTION: CRITICAL - Error during checkCalendarAvailability EXECUTION:", error.message, error.stack);
      return {
        messageKey: "landing:booking.error.calendarCheckFailed",
        success: false,
        errors: { general: ["landing:booking.error.calendarCheckFailed"] },
        messageParams: null,
      };
    }

    let eventResult: CreateCalendarEventOutput | undefined;
    try {
      // console.log("ACTIONS_BOOKING: Attempting to call createCalendarEvent flow...");
      const eventInput: CreateCalendarEventInput = { name, email, phone, date, time, guests, notes };
      eventResult = await createCalendarEvent(eventInput);
      // console.log("ACTIONS_BOOKING: createCalendarEvent flow response:", eventResult);

      if (!eventResult || typeof eventResult.success === 'undefined') {
          console.error("SUBMIT_BOOKING_ACTION: CRITICAL - Invalid or undefined response from createCalendarEvent flow.", eventResult);
          return {
              messageKey: "landing:booking.error.calendarError",
              success: false,
              errors: { general: ["landing:booking.error.calendarError"] },
              messageParams: null,
          };
      }

      if (!eventResult.success) {
        // console.warn("ACTIONS_BOOKING: Failed to create calendar event according to createCalendarEvent flow.", eventResult);
        return {
          messageKey: eventResult.errorKey || "landing:booking.error.calendarError",
          success: false,
          errors: { general: [eventResult.errorKey || "landing:booking.error.calendarError"] },
          messageParams: null,
        };
      }
      let formattedDate = date;
        try {
            const parsedDateObj = parseISO(date);
            formattedDate = format(parsedDateObj, "PPP");
        } catch (e) {
            // console.warn(\`ACTIONS_BOOKING_CALENDAR_SUCCESS: Could not parse date '\${date}' with parseISO for success message. Using original string.\`);
        }

      // console.log("ACTIONS_BOOKING: Booking successful. Event ID:", eventResult.eventId);
      return {
        messageKey: "landing:booking.successMessage",
        messageParams: {
          name: validatedFields.data.name,
          guests: String(validatedFields.data.guests),
          date: formattedDate, // Format for display
          time: validatedFields.data.time
        },
        success: true,
        errors: null,
        bookingMethod: 'calendar',
      };

    } catch (error: any) {
      console.error("SUBMIT_BOOKING_ACTION: CRITICAL - Error during createCalendarEvent EXECUTION:", error.message, error.stack);
      return {
        messageKey: "landing:booking.error.calendarError",
        success: false,
        errors: { general: ["landing:booking.error.calendarError"] },
        messageParams: null,
      };
    }
  } else {
    console.error("ACTIONS_BOOKING: Unknown booking method configured:", restaurantConfig.bookingMethod);
    return {
      messageKey: "landing:booking.error.unknownMethod",
      success: false,
      errors: { general: ["landing:booking.error.unknownMethod"] },
      messageParams: null,
    };
  }
}
