
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

interface OpeningHours {
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
  // menuDelDia object removed as per new requirements
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantDisplayName: 'La Ferradura',
  logoUrl: '/logo.webp', // USER ACTION: Replace with actual logo for La Ferradura (e.g., /la-ferradura-logo.webp)
  address: 'Plaça Nova, 2, 17538 Alp, Girona, España',
  phone: '+34 972 89 07 35',
  phoneHref: 'tel:+34972890735',
  phone2: '+34 617 12 38 70', // Added second phone
  phoneHref2: 'tel:+34617123870', // Added second phone href
  email: 'alpferradura@gmail.com',
  emailHref: 'mailto:alpferradura@gmail.com',
  socialMediaLinks: {
    facebook: '#', // TODO: Replace with La Ferradura's Facebook
    instagram: '#', // TODO: Replace with La Ferradura's Instagram
    twitter: '#', // TODO: Replace
    youtube: '#', // TODO: Replace
  },
  heroImageUrl: '/background_rest.jpg', // USER ACTION: Replace with a suitable hero image for La Ferradura
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
    primary: 'hsl(205 55% 48%)', // Blue from #5096CB
  },
  showMenuItemImages: true,
  showAISommelierSection: false, // Kept as false as per previous instruction
  bookingMaxGuestsPerSlot: 8,
  bookingMethod: 'whatsapp', // Defaulting to whatsapp, can be changed
  whatsappBookingNumber: '+34617123870', // Example, USER ACTION: Update with actual WhatsApp number if method is 'whatsapp'
  googleMapsEmbedUrl: 'TODO_YOUR_LA_FERRADURA_GOOGLE_MAPS_EMBED_URL', // USER ACTION: Replace with actual embed URL for La Ferradura in Alp
  googleMapsLink: 'TODO_YOUR_LA_FERRADURA_GOOGLE_MAPS_LINK', // USER ACTION: Replace with actual Google Maps link
  googleReviewUrl: 'TODO_YOUR_LA_FERRADURA_GOOGLE_REVIEW_URL', // USER ACTION: Replace with actual Google Review link
  tripAdvisorReviewUrl: 'TODO_YOUR_LA_FERRADURA_TRIPADVISOR_REVIEW_URL_HERE',
  openingHours: {
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
};

export default restaurantConfig;
