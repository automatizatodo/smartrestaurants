
"use server";

import { aiSommelier, type AISommelierInput, type AISommelierOutput } from "@/ai/flows/ai-sommelier";
import { z } from "zod";

// Validation schemas remain the same
const SommelierRequestSchema = z.object({
  tastePreferences: z.string().min(10, "landing:aiSommelier.error.preferencesRequired").max(500, "landing:aiSommelier.error.preferencesTooLong"),
});

export interface SommelierFormState {
  messageKey: string | null; // Key for localization
  messageParams?: Record<string, string | number> | null; // Params for interpolation
  recommendations: string | null; // AI recommendations are direct text from AI
  errors?: {
    tastePreferences?: string[]; // Error keys for localization
  } | null;
}

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
      errors: validatedFields.error.flatten().fieldErrors, // These are already keys
      messageParams: null,
    };
  }

  const input: AISommelierInput = {
    tastePreferences: validatedFields.data.tastePreferences,
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
        messageKey: "landing:aiSommelier.toast.errorDescriptionKey",
        recommendations: null,
        errors: null,
        messageParams: null,
      };
    }
  } catch (error) {
    console.error("AI Sommelier Error:", error);
    return {
      messageKey: "common:form.error.generic",
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
  guests: z.coerce.number().min(1, "landing:booking.error.guestsRequired"),
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
    date: formData.get("date"),
    time: formData.get("time"),
    guests: formData.get("guests"),
  };

  const validatedFields = BookingSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      messageKey: "common:form.error.invalidInput",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors, // These are already keys
      messageParams: null,
    };
  }

  console.log("Booking submitted:", validatedFields.data);

  return {
    messageKey: "landing:booking.successMessage",
    messageParams: { 
      name: validatedFields.data.name,
      guests: validatedFields.data.guests,
      date: validatedFields.data.date, // Consider formatting date based on locale on client
      time: validatedFields.data.time 
    },
    success: true,
    errors: null,
  };
}
