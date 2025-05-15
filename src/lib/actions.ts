
"use server";

import { aiSommelier, type AISommelierInput, type AISommelierOutput } from "@/ai/flows/ai-sommelier";
import { checkCalendarAvailability, type CheckCalendarAvailabilityInput, type CheckCalendarAvailabilityOutput } from "@/ai/flows/check-calendar-availability-flow";
import { createCalendarEvent, type CreateCalendarEventInput, type CreateCalendarEventOutput } from "@/ai/flows/create-calendar-event-flow";
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
import { z } from "zod";
import restaurantConfig from "@/config/restaurant.config"; // For booking duration

// Validation schemas remain the same
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

// Helper function to format menu items for the AI.
const formatMenuForAI = (menuItems: MenuItemData[]): string => {
  if (!menuItems || menuItems.length === 0) {
    return "No menu items available.";
  }
  // Use English names and descriptions for the AI for consistency.
  return menuItems.map(item =>
    `Dish: ${item.name.en}\nDescription: ${item.description.en}\nPrice: ${item.price}\nCategory: ${item.categoryKey}`
  ).join("\n\n");
};


export async function getAISommelierRecommendations(
  prevState: SommelierFormState | null,
  formData: FormData
): Promise<SommelierFormState> {
  const validatedFields = SommelierRequestSchema.safeParse({
    tastePreferences: formData.get("tastePreferences"),
  });

  if (!validatedFields.success) {
    return {
      messageKey: "common:form.error.invalidInput",
      recommendations: null,
      errors: validatedFields.error.flatten().fieldErrors,
      messageParams: null,
    };
  }

  let menuInformationString = "Menu information is currently unavailable.";
  try {
    const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();
    if (menuItems.length > 0) {
      menuInformationString = formatMenuForAI(menuItems);
    }
  } catch (error) {
    console.error("AI_SOMMELIER_ACTION: Failed to fetch menu for AI Sommelier:", error);
    // Continue with potentially unavailable menu, AI might still give general advice
  }


  const input: AISommelierInput = {
    tastePreferences: validatedFields.data.tastePreferences,
    menuInformation: menuInformationString,
  };

  try {
    const result: AISommelierOutput = await aiSommelier(input);
    if (result.dishRecommendations) {
      return {
        messageKey: "landing:aiSommelier.toast.successDescriptionKey",
        recommendations: result.dishRecommendations,
        errors: null,
        messageParams: null,
      };
    } else {
      return {
        messageKey: "landing:aiSommelier.toast.errorDescriptionKey", // Consider a more specific key if AI returns no recommendation
        recommendations: null,
        errors: null,
        messageParams: null,
      };
    }
  } catch (error) {
    console.error("AI_SOMMELIER_ACTION: AI Sommelier Flow Error:", error);
    let errorMessageKey = "common:form.error.generic";
    // Check if the error is a Genkit "NO_RESPONSE" type, if such a specific error can be identified
    if (error instanceof Error && (error.message.includes("NO_RESPONSE") || error.message.includes("generation error"))) {
        errorMessageKey = "landing:aiSommelier.error.couldNotGenerate";
    }
    return {
      messageKey: errorMessageKey,
      recommendations: null,
      errors: null, // No form validation errors here, but an operational error
      messageParams: null,
    };
  }
}

const BookingSchema = z.object({
  name: z.string().min(1, "landing:booking.error.nameRequired"),
  email: z.string().email("landing:booking.error.emailInvalid"),
  phone: z.string().min(1, "landing:booking.error.phoneRequired"),
  date: z.string().min(1, "landing:booking.error.dateRequired"), // Should be YYYY-MM-DD
  time: z.string().min(1, "landing:booking.error.timeRequired"), // e.g., "5:00 PM"
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
    general?: string[]; // For errors not tied to a specific field
  } | null;
}

export async function submitBooking(
  prevState: BookingFormState | null,
  formData: FormData
): Promise<BookingFormState> {

  const rawFormData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    date: formData.get("date"), // Expecting "yyyy-MM-dd"
    time: formData.get("time"), // Expecting "HH:MM PM/AM" or "HH:MM"
    guests: formData.get("guests"),
    notes: formData.get("notes") || undefined,
  };

  const validatedFields = BookingSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      messageKey: "common:form.error.invalidInput",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      messageParams: null,
    };
  }

  const { name, email, phone, date, time, guests, notes } = validatedFields.data;

  // 1. Check calendar availability
  try {
    console.log("SUBMIT_BOOKING_ACTION: Checking calendar availability...");
    const availabilityInput: CheckCalendarAvailabilityInput = { date, time, guests };
    const availabilityResult: CheckCalendarAvailabilityOutput = await checkCalendarAvailability(availabilityInput);
    console.log("SUBMIT_BOOKING_ACTION: Availability check result:", availabilityResult);

    if (!availabilityResult.isAvailable) {
      const messageParams = availabilityResult.reasonKey === 'landing:booking.error.slotUnavailable.tooManyGuests' || availabilityResult.reasonKey === 'landing:booking.error.slotUnavailable'
        ? { time, date, guests: String(guests), maxGuestsForSlot: String(availabilityResult.maxGuestsForSlot) }
        : { time, date };
      return {
        messageKey: availabilityResult.reasonKey || "landing:booking.error.slotUnavailable",
        success: false,
        errors: { general: [availabilityResult.reasonKey || "landing:booking.error.slotUnavailable"] },
        messageParams: messageParams,
      };
    }
  } catch (error: any) { // Catch errors from checkCalendarAvailability flow itself
    console.error("SUBMIT_BOOKING_ACTION: Error during calendar availability check flow:", error.message, error.stack);
    return {
      messageKey: "landing:booking.error.calendarCheckFailed", // Generic key if flow fails unexpectedly
      success: false,
      errors: { general: ["landing:booking.error.calendarCheckFailed"] },
      messageParams: null,
    };
  }

  // 2. Create calendar event
  try {
    console.log("SUBMIT_BOOKING_ACTION: Creating calendar event...");
    const eventInput: CreateCalendarEventInput = { name, email, phone, date, time, guests, notes };
    const eventResult: CreateCalendarEventOutput = await createCalendarEvent(eventInput);
    console.log("SUBMIT_BOOKING_ACTION: Calendar event creation result:", eventResult);


    if (!eventResult.success) {
      return {
        messageKey: eventResult.errorKey || "landing:booking.error.calendarError",
        success: false,
        errors: { general: [eventResult.errorKey || "landing:booking.error.calendarError"] },
        messageParams: null, // No specific params needed for general calendar creation error
      };
    }

    console.log("SUBMIT_BOOKING_ACTION: Booking successful. Event ID:", eventResult.eventId);
    return {
      messageKey: "landing:booking.successMessage",
      messageParams: {
        name: validatedFields.data.name,
        guests: String(validatedFields.data.guests), // Ensure guests is a string for translations
        date: validatedFields.data.date,
        time: validatedFields.data.time
      },
      success: true,
      errors: null,
    };

  } catch (error: any) { // Catch errors from createCalendarEvent flow itself
    console.error("SUBMIT_BOOKING_ACTION: Error during calendar event creation flow:", error.message, error.stack);
    return {
      messageKey: "landing:booking.error.calendarError", // Generic key if flow fails unexpectedly
      success: false,
      errors: { general: ["landing:booking.error.calendarError"] },
      messageParams: null,
    };
  }
}
// Add to restaurant config an option for max guests per slot
declare module '@/config/restaurant.config' {
  interface RestaurantConfig {
    bookingMaxGuestsPerSlot?: number;
  }
}
restaurantConfig.bookingMaxGuestsPerSlot = 8; // Example: max 8 guests per slot

