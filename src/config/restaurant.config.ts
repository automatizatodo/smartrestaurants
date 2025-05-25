
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
  [key: string]: string; // Allows for keys like "mon", "tue", "wed", etc.
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
  restaurantDisplayName: 'Restaurant Rossinyol', // Updated
  logoUrl: '/canfanals-logo.png', // Placeholder - Update with Rossinyol's logo
  address: 'Plaça Josep Barangé Bachs, 13, 08402 Granollers, Barcelona', // Updated
  phone: '938 79 34 93', // Updated
  phoneHref: 'tel:+34938793493', // Updated
  email: 'reserves@restaurantrossinyol.com', // TODO: User needs to update for Rossinyol
  emailHref: 'mailto:reserves@restaurantrossinyol.com', // TODO: User needs to update for Rossinyol
  socialMediaLinks: {
    facebook: '#', // TODO: User needs to update for Rossinyol
    instagram: '#', // TODO: User needs to update for Rossinyol
    twitter: '#', // TODO: User needs to update for Rossinyol
    youtube: '#', // TODO: User needs to update for Rossinyol
  },
  heroImageUrl: '/background_rest.jpg', // Placeholder - Update with Rossinyol's hero image
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
    primary: 'hsl(205 75% 58%)',
  },
  showMenuItemImages: true,
  showAISommelierSection: false,
  bookingMaxGuestsPerSlot: 8,
  bookingMethod: 'whatsapp',
  whatsappBookingNumber: '+34938793493', // Updated to Rossinyol's phone, ensure it's WhatsApp enabled
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d763705.7819750104!2d1.0699324781249946!3d41.607630600000014!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4c7c5972e10c7%3A0x7b8fd17762a7d035!2sRestaurant%20Rossinyol!5e0!3m2!1sen!2ses!4v1748189156124!5m2!1sen!2ses', // TODO: User needs to update
  googleMapsLink: 'https://maps.app.goo.gl/MXHMvTsqnPhpANcV9', // TODO: User needs to update
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJxxAul8XHpBIRNdCnYnfRj3s', // TODO: User needs to update
  tripAdvisorReviewUrl: 'YOUR_TRIPADVISOR_REVIEW_URL_FOR_ROSSINYOL', // TODO: User needs to update
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
    price: "16,50€", // Example price for Menu del Dia - Update if needed
    priceDescriptionKey: "menu:menuDelDia.priceIncludes", // Example: "IVA inclòs. Pa, beguda i postre o cafè."
    notesKey: "menu:menuDelDia.notes", // Example: "Disponible de dimarts a divendres al migdia, excepte festius."
  },
  allergenConfig: {
    showAsText: false,
  },
};

export default restaurantConfig;
