
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

interface MenuDelDiaConfig {
  price?: string; // Fallback price if Excel sheet fails
  priceDescriptionKey: string; // e.g., "menu:menuDelDia.priceIncludes"
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
  menuDelDia: MenuDelDiaConfig; // Reinstated menuDelDia
  defaultLocale?: 'ca' | 'es' | 'en';
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantDisplayName: 'La Bodega de la Ferradura',
  logoUrl: '/logoFerradura.webp', // Reemplaça amb la ruta real al teu logo a la carpeta public
  address: 'Plaça Nova, 2, 17538 Alp, Girona, España',
  phone: '+34 972 89 07 35',
  phoneHref: 'tel:+34972890735',
  phone2: '+34 617 12 38 70',
  phoneHref2: 'tel:+34617123870',
  email: 'alpferradura@gmail.com', // TODO: Actualitza amb l'email real de La Bodega de la Ferradura
  emailHref: 'mailto:alpferradura@gmail.com', // TODO: Actualitza
  socialMediaLinks: {
    facebook: 'TODO_YOUR_LA_BODEGA_FERRADURA_FACEBOOK_URL',
    instagram: 'TODO_YOUR_LA_BODEGA_FERRADURA_INSTAGRAM_URL',
    twitter: 'TODO_YOUR_LA_BODEGA_FERRADURA_TWITTER_URL',
    youtube: 'TODO_YOUR_LA_BODEGA_FERRADURA_YOUTUBE_URL',
  },
  heroImageUrl: '/backgroundhero.webp', // Reemplaça amb la ruta real a la teva imatge a la carpeta public
  heroImageHint: 'restaurant alp la cerdanya',
  bookingTimeSlots: [
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30",
    "20:00", "20:15", "20:30", "20:45",
    "21:00", "21:15", "21:30", "21:45",
    "22:00", "22:15", "22:30"
  ],
  bookingSlotDurationMinutes: 120, // Example: 2 hours
  timeZone: 'Europe/Madrid',
  theme: {
    primary: 'hsl(206 53% 47%)', // Azul #3980b8
  },
  showMenuItemImages: true,
  showAISommelierSection: false, // AI Sommelier section is hidden by default
  bookingMaxGuestsPerSlot: 8,
  bookingMethod: 'whatsapp', // Can be 'calendar' or 'whatsapp'
  whatsappBookingNumber: '+34617123870', // TODO: Actualitza amb el número real
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2930.097915828272!2d1.886394615467891!3d42.372089979186!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a577669f5ca1ad%3A0xf61123edd270bbdb!2sLa%20Ferradura!5e0!3m2!1ses!2ses!4v1678886400000', // TODO: Actualitza amb la URL d'embed correcta per a La Bodega de la Ferradura a Alp
  googleMapsLink: 'https://maps.app.goo.gl/7y45H8JvYpT9mNnZ9', // TODO: Actualitza amb l'enllaç directe correcte
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJrxjmUa-VpBIRenLu0Swg6cM', // TODO: Actualitza amb el Place ID correcte
  tripAdvisorReviewUrl: 'TODO_YOUR_TRIPADVISOR_REVIEW_URL_HERE',
  openingHours: {
    mon: "13:00 – 16:00 / 20:00 – 23:00",
    tue: "13:00 – 16:00 / 20:00 – 23:00",
    wed: "13:00 – 16:00 / 20:00 – 23:00",
    thu: "13:00 – 16:00 / 20:00 – 23:00",
    fri: "13:00 – 16:00 / 20:00 – 23:00",
    sat: "13:00 – 16:00 / 20:00 – 23:30", // Adjusted as per last info
    sun: "12:00 – 17:00", // Adjusted as per last info
  },
  allergenConfig: {
    showAsText: false, // Set to true if you prefer text over icons for allergens
  },
  menuDelDia: { // Reinstated for priceDescriptionKey and optional fallback price
    price: "18,50€", // Example fallback price - the actual price comes from Excel
    priceDescriptionKey: "menu:menuDelDia.priceIncludes",
  },
  defaultLocale: 'ca',
};

export default restaurantConfig;
