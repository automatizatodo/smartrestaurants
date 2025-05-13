
"use server";

import { aiSommelier, type AISommelierInput, type AISommelierOutput } from "@/ai/flows/ai-sommelier";
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
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

// Helper function to format menu items for the AI.
// This function assumes that you have a way to get the translated names and descriptions.
// For simplicity, it currently uses the keys directly. In a real app, you'd resolve these keys
// to the current language before sending to the AI if the AI needs to understand the specific language.
// However, often it's better to send keys + English (or a base language) and let the AI work with that,
// then re-translate AI output if needed. Here, we'll just pass the keys and raw price.
const formatMenuForAI = (menuItems: MenuItemData[]): string => {
  if (!menuItems || menuItems.length === 0) {
    return "No menu items available.";
  }
  return menuItems.map(item => 
    `Dish: ${item.nameKey}\nDescription: ${item.descriptionKey}\nPrice: ${item.price}\nCategory: ${item.categoryKey}`
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
      errors: validatedFields.error.flatten().fieldErrors, // These are already keys
      messageParams: null,
    };
  }

  let menuInformationString = "Menu information is currently unavailable.";
  try {
    const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();
    if (menuItems.length > 0) {
      // It's better to pass structured data, or at least clear textual data.
      // For now, we'll join nameKey, descriptionKey, and price.
      // The AI will see the translation keys. If it needs to understand the actual text,
      // you'd need to translate them here based on a default language or pass multiple languages.
      menuInformationString = menuItems.map(item => {
        return `Item Name Key: ${item.nameKey}\nDescription Key: ${item.descriptionKey}\nPrice: ${item.price}\nCategory Key: ${item.categoryKey}`;
      }).join('\n---\n');
    }
  } catch (error) {
    console.error("Failed to fetch menu for AI Sommelier:", error);
    // Optionally, you could inform the user or proceed without menu context if desired.
    // For now, the AI will get a "menu unavailable" message.
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
        messageKey: "landing:aiSommelier.toast.errorDescriptionKey",
        recommendations: null,
        errors: null,
        messageParams: null,
      };
    }
  } catch (error) {
    console.error("AI Sommelier Error:", error);
    // Check if error is a Genkit-specific error or a generic one for better user feedback
    let errorMessageKey = "common:form.error.generic";
    if (error instanceof Error && error.message.includes("NO_RESPONSE")) { // Example check
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

  // Simulate booking submission (e.g., API call, database insert)
  // For this example, we'll just log the data.
  // In a real application, replace this with actual booking logic.
  console.log("Booking submitted:", validatedFields.data);
  // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  // Example: If booking fails, return an error state
  // if (Math.random() > 0.8) { // Simulate a random failure
  //   return {
  //     messageKey: "landing:booking.error.failedToBook", // Add this key to locales
  //     success: false,
  //     errors: null,
  //     messageParams: null
  //   };
  // }

  return {
    messageKey: "landing:booking.successMessage", // This key should exist in your locale files
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

