
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
  restaurantDisplayName: 'Can Fanals',
  logoUrl: '/canfanals-logo.png',
  address: 'Plaça Josep Barangé Bachs, 13, 08402 Granollers, Barcelona',
  phone: '938 79 34 93',
  phoneHref: 'tel:+34938793493',
  email: 'reserves@canfanals.com', // TODO: User needs to update
  emailHref: 'mailto:reserves@canfanals.com', // TODO: User needs to update
  socialMediaLinks: {
    facebook: '#', // TODO: User needs to update
    instagram: '#', // TODO: User needs to update
    twitter: '#', // TODO: User needs to update
    youtube: '#', // TODO: User needs to update
  },
  heroImageUrl: '/background_rest.jpg',
  heroImageHint: 'restaurant interior modern',
  bookingTimeSlots: [
    "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
    "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM",
    "2:00 PM", "2:15 PM", "2:30 PM", "2:45 PM",
    "3:00 PM", "3:15 PM", "3:30 PM", "3:45 PM",
    "4:00 PM", "4:15 PM", "4:30 PM", "4:45 PM",
    "8:00 PM", "8:15 PM", "8:30 PM", "8:45 PM",
    "9:00 PM", "9:15 PM", "9:30 PM", "9:45 PM",
    "10:00 PM", "10:15 PM", "10:30 PM", "10:45 PM",
    "11:00 PM"
  ],
  bookingSlotDurationMinutes: 120,
  timeZone: 'Europe/Madrid',
  theme: {
    primary: 'hsl(205 75% 58%)', // Mediterranean Coastal Primary Blue
  },
  showMenuItemImages: true,
  showAISommelierSection: false, // Set to false by default
  bookingMaxGuestsPerSlot: 8,
  // IMPORTANT: Set bookingMethod to 'calendar' to make live calls to Google Calendar API.
  // Ensure GOOGLE_APPLICATION_CREDENTIALS and GOOGLE_CALENDAR_ID environment variables are set.
  // Defaulting to 'whatsapp' is safer if calendar integration is not fully configured.
  bookingMethod: 'whatsapp', // or 'calendar'
  whatsappBookingNumber: '+34608123872', // TODO: User needs to update with Can Fanals's WhatsApp
  googleMapsEmbedUrl: 'YOUR_GOOGLE_MAPS_EMBED_URL_FOR_CAN_FANALS', // TODO: User needs to update
  googleMapsLink: 'YOUR_GOOGLE_MAPS_DIRECT_LINK_FOR_CAN_FANALS', // TODO: User needs to update
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJrxjmUa-VpBIRenLu0Swg6cM',
  tripAdvisorReviewUrl: 'YOUR_TRIPADVISOR_REVIEW_URL_FOR_CAN_FANALS', // TODO: User needs to update
  openingHours: {
    mon: "13:00 – 16:00",
    tue: "13:00 – 16:00",
    wed: "13:00 – 16:00",
    thu: "13:00 – 16:00",
    fri: "13:00 – 16:00 / 20:00 – 23:00",
    sat: "13:00 – 16:00 / 20:00 – 23:30",
    sun: "12:00 – 17:00",
  },
  menuDelDia: {
    price: "16,50€", // Example price for Menu del Dia
    priceDescriptionKey: "menu:menuDelDia.priceIncludes", // Example: "IVA inclòs. Pa, beguda i postre o cafè."
    notesKey: "menu:menuDelDia.notes", // Example: "Disponible de dimarts a divendres al migdia, excepte festius."
  },
  allergenConfig: {
    showAsText: false, // Set to false to attempt to show icons
  },
};

export default restaurantConfig;
