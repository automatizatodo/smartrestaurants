
// Define interfaces for structure (optional but good practice)
interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

interface ThemeColors {
  primary: string;
}

export interface OpeningHours {
  [key: string]: string; // Allows for keys like "mon", "tue", "wed", etc.
}

interface AllergenDisplayConfig {
  showAsText: boolean;
}

interface RestaurantConfig {
  restaurantDisplayName: string;
  logoUrl: string;
  address: string;
  phone: string;
  phoneHref: string;
  phone2?: string; // Optional second phone
  phoneHref2?: string; // Optional href for second phone
  email: string;
  emailHref: string;
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
  bookingMethod: 'calendar' | 'whatsapp';
  whatsappBookingNumber?: string;
  googleMapsEmbedUrl: string;
  googleMapsLink: string;
  googleReviewUrl?: string;
  tripAdvisorReviewUrl?: string;
  openingHours: OpeningHours;
  allergenConfig: AllergenDisplayConfig;
  defaultLocale?: 'ca' | 'es' | 'en'; // Optional: Define a default locale for date formatting if needed
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantDisplayName: 'La Bodega de la Ferradura',
  logoUrl: '/logo.webp', // USER ACTION: Replace with actual logo for La Bodega de la Ferradura (e.g., /la-bodega-ferradura-logo.webp)
  address: 'Plaça Nova, 2, 17538 Alp, Girona, España', // Maintained from "La Ferradura"
  phone: '+34 972 89 07 35', // Maintained from "La Ferradura"
  phoneHref: 'tel:+34972890735',
  phone2: '+34 617 12 38 70', // Maintained from "La Ferradura"
  phoneHref2: 'tel:+34617123870',
  email: 'alpferradura@gmail.com', // Maintained from "La Ferradura", USER ACTION: Update if different for La Bodega de la Ferradura
  emailHref: 'mailto:alpferradura@gmail.com',
  socialMediaLinks: {
    facebook: 'TODO_YOUR_LA_BODEGA_FERRADURA_FACEBOOK_URL',
    instagram: 'TODO_YOUR_LA_BODEGA_FERRADURA_INSTAGRAM_URL',
    twitter: 'TODO_YOUR_LA_BODEGA_FERRADURA_TWITTER_URL',
    youtube: 'TODO_YOUR_LA_BODEGA_FERRADURA_YOUTUBE_URL',
  },
  heroImageUrl: '/background_rest.jpg', // USER ACTION: Replace with a suitable hero image for La Bodega de la Ferradura
  heroImageHint: 'restaurant alp la cerdanya',
  bookingTimeSlots: [
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30",
    "20:00", "20:15", "20:30", "20:45",
    "21:00", "21:15", "21:30", "21:45",
    "22:00", "22:15", "22:30"
  ],
  bookingSlotDurationMinutes: 90,
  timeZone: 'Europe/Madrid',
  theme: {
    primary: 'hsl(205 55% 48%)', // Maintained from previous "La Ferradura" rustic blue theme
  },
  showMenuItemImages: true,
  showAISommelierSection: false,
  bookingMaxGuestsPerSlot: 8,
  bookingMethod: 'whatsapp',
  whatsappBookingNumber: '+34617123870', // Maintained from "La Ferradura", USER ACTION: Update if different
  googleMapsEmbedUrl: 'TODO_YOUR_LA_BODEGA_FERRADURA_GOOGLE_MAPS_EMBED_URL_ALP',
  googleMapsLink: 'TODO_YOUR_LA_BODEGA_FERRADURA_GOOGLE_MAPS_LINK_ALP',
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID_FOR_LA_BODEGA_FERRADURA_ALP', // USER ACTION: Update with new Place ID
  tripAdvisorReviewUrl: 'TODO_YOUR_LA_BODEGA_FERRADURA_TRIPADVISOR_REVIEW_URL_ALP',
  openingHours: { // Maintained from "La Ferradura"
    mon: "13:00 – 16:00 / 20:00 – 23:00",
    tue: "13:00 – 16:00 / 20:00 – 23:00",
    wed: "13:00 – 16:00 / 20:00 – 23:00",
    thu: "13:00 – 16:00 / 20:00 – 23:00",
    fri: "13:00 – 16:00 / 20:00 – 23:00",
    sat: "13:00 – 16:00 / 20:00 – 23:00",
    sun: "13:00 – 16:00 / 20:00 – 23:00",
  },
  allergenConfig: {
    showAsText: false,
  },
  defaultLocale: 'ca',
};

export default restaurantConfig;
