
// Define interfaces for structure (optional but good practice)
interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

interface ThemeColors {
  primary: string; // Example: '#FFD700' (Gold) - Corresponds to HSL var in globals.css
}

interface OpeningHours {
  [key: string]: string; // Allows for keys like "tueWed", "thuSat", "sun", "mon"
}

interface MenuDelDiaConfig {
  price: string; // This will now serve as a FALLBACK price if dynamic pricing fails
  priceDescriptionKey: string; // e.g., "menu:menuDelDia.priceIncludes" (like "IVA inclòs")
  notesKey?: string; // Optional notes for the menu, e.g., "Pa, aigua i vi inclosos"
}

interface AllergenDisplayConfig {
  // For now, we'll just display text. Later, this could map keys to icon components or image paths.
  // Example: gluten: { icon: <GlutenFreeIcon/>, textKey: 'allergens:gluten' }
  showAsText: boolean; // If true, display allergen strings directly. If false, icons (future)
}

interface RestaurantConfig {
  // Non-translatable details
  restaurantDisplayName: string; // Name used for internal messages like WhatsApp
  logoUrl: string; // Path to the logo image in /public folder e.g., /logo.png
  address: string;
  phone: string;
  phoneHref: string; // Tel link format
  email: string;
  emailHref: string; // Mailto link format
  socialMediaLinks: SocialMediaLinks;
  heroImageUrl: string;
  heroImageHint: string;
  bookingTimeSlots: string[];
  bookingSlotDurationMinutes: number;
  timeZone: string;
  theme: ThemeColors;
  showMenuItemImages: boolean;
  showAISommelierSection: boolean;
  bookingMaxGuestsPerSlot?: number;
  // IMPORTANT: Setting bookingMethod to 'calendar' will make live calls to Google Calendar API.
  // Ensure credentials and API access are correctly configured. 'whatsapp' is safer if not fully set up.
  bookingMethod: 'calendar' | 'whatsapp';
  whatsappBookingNumber?: string;
  googleMapsEmbedUrl: string; // For the iframe embed
  googleMapsLink: string; // For a direct link to Google Maps
  googleReviewUrl?: string; // Link to leave a Google Review
  tripAdvisorReviewUrl?: string; // Link to leave a TripAdvisor Review
  openingHours: OpeningHours;
  menuDelDia?: MenuDelDiaConfig; // Optional, if the restaurant has a Menu del Dia
  allergenConfig: AllergenDisplayConfig;
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantDisplayName: 'Restaurant Rossinyol', // UPDATED
  logoUrl: '/nou-logo-rossinyol.png', // TODO: User needs to provide this new logo
  address: 'Granollers, Barcelona (Especificar carrer i número)', // UPDATED - User needs to provide full address
  phone: '930 000 000', // TODO: User needs to update
  phoneHref: 'tel:+34930000000', // TODO: User needs to update
  email: 'reserves@restaurantrossinyol.com', // TODO: User needs to update
  emailHref: 'mailto:reserves@restaurantrossinyol.com', // TODO: User needs to update
  socialMediaLinks: {
    facebook: '#', // TODO: User needs to update
    instagram: '#', // TODO: User needs to update
    twitter: '#', // TODO: User needs to update
    youtube: '#', // TODO: User needs to update
  },
  heroImageUrl: '/hero-rossinyol.jpg', // TODO: User needs to provide this new image
  heroImageHint: 'ambiente restaurant rossinyol', // UPDATED
  bookingTimeSlots: [ 
    "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
    "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM"
  ],
  bookingSlotDurationMinutes: 120,
  timeZone: 'Europe/Madrid', 
  theme: {
    primary: 'hsl(205 75% 58%)', // Current blue, user might want to change this for Rossinyol
  },
  showMenuItemImages: true,
  showAISommelierSection: false,
  bookingMaxGuestsPerSlot: 8,
  bookingMethod: 'whatsapp', // Or 'calendar' if preferred and configured for Rossinyol
  whatsappBookingNumber: '+34600000001', // TODO: User needs to update with Rossinyol's WhatsApp
  googleMapsEmbedUrl: 'YOUR_GOOGLE_MAPS_EMBED_URL_FOR_ROSSINYOL', // TODO: User needs to update
  googleMapsLink: 'YOUR_GOOGLE_MAPS_DIRECT_LINK_FOR_ROSSINYOL', // TODO: User needs to update
  googleReviewUrl: 'YOUR_GOOGLE_REVIEW_LINK_FOR_ROSSINYOL', // TODO: User needs to update (using Place ID)
  tripAdvisorReviewUrl: 'YOUR_TRIPADVISOR_REVIEW_URL_FOR_ROSSINYOL', // TODO: User needs to update
  openingHours: { 
    tueWed: "08:00 - 17:00", // Example, user needs to confirm Rossinyol's hours
    thuSat: "08:00 - 24:00", 
    sun: "08:00 - 19:00",
    mon: "CLOSED", 
  },
  menuDelDia: {
    price: "15,00€", // Fallback price for Rossinyol, adjust as needed
    priceDescriptionKey: "menu:menuDelDia.priceIncludes",
    notesKey: "menu:menuDelDia.notes",
  },
  allergenConfig: {
    showAsText: false, 
  },
};

export default restaurantConfig;
