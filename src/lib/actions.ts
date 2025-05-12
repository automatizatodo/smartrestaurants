
"use server";

import { aiSommelier, type AISommelierInput, type AISommelierOutput } from "@/ai/flows/ai-sommelier";
import { z } from "zod";
import restaurantConfig from "@/config/restaurant.config"; // Import config if needed, e.g., for restaurant name

const SommelierRequestSchema = z.object({
  tastePreferences: z.string().min(10, "Please describe your preferences in more detail.").max(500, "Description too long."),
});

export interface SommelierFormState {
  message: string | null;
  recommendations: string | null;
  errors?: {
    tastePreferences?: string[];
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
      message: "Invalid input. Please check your preferences.",
      recommendations: null,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const input: AISommelierInput = {
    tastePreferences: validatedFields.data.tastePreferences,
  };

  try {
    const result: AISommelierOutput = await aiSommelier(input);
    if (result.dishRecommendations) {
      return {
        message: "Here are your personalized recommendations!",
        recommendations: result.dishRecommendations,
        errors: null,
      };
    } else {
      return {
        message: "Could not generate recommendations at this time. Please try again.",
        recommendations: null,
        errors: null,
      };
    }
  } catch (error) {
    console.error("AI Sommelier Error:", error);
    return {
      message: "An unexpected error occurred. Please try again later.",
      recommendations: null,
      errors: null,
    };
  }
}

// Mock booking action
const BookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  date: z.string().min(1, "Date is required"), // Ideally, this should be a date object
  time: z.string().min(1, "Time is required"),
  guests: z.coerce.number().min(1, "At least one guest is required"),
});

export interface BookingFormState {
  message: string | null;
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
      message: "Invalid input. Please check your booking details.",
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // In a real app, you would process the booking here (e.g., save to DB, call API)
  console.log("Booking submitted:", validatedFields.data);

  // Use a slightly more generic success message, or interpolate restaurant name from config if desired
  return {
    message: `Thank you, ${validatedFields.data.name}! Your booking request for ${validatedFields.data.guests} guest(s) on ${validatedFields.data.date} at ${validatedFields.data.time} has been received. We will contact you shortly to confirm.`,
    // Example using config: `Thank you, ${validatedFields.data.name}! Your booking request at ${restaurantConfig.restaurantName} ...`
    success: true,
    errors: null,
  };
}
