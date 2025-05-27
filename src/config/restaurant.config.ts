
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

interface MenuDelDiaConfig {
  price: string; 
  priceDescriptionKey: string; 
  notesKey?: string; 
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
  menuDelDia?: MenuDelDiaConfig; 
  allergenConfig: AllergenDisplayConfig;
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantDisplayName: 'La Bodega de la Ferradura', // NOU NOM
  logoUrl: '/logo-ferradura-placeholder.webp', // TODO: Replace with actual logo for La Ferradura (e.g., /la-ferradura-logo.webp)
  address: 'Plaça Major, 5, 17538 Alp, Girona', // NOU - Adreça real
  phone: '972 89 00 18', // NOU - Telèfon real
  phoneHref: 'tel:+34972890018', // NOU - Corregit
  email: 'reservas@labodegadelaferradura.com', // TODO: Replace with actual email for La Ferradura
  emailHref: 'mailto:reservas@labodegadelaferradura.com', // TODO: Replace
  socialMediaLinks: {
    facebook: '#', // TODO: Replace
    instagram: '#', // TODO: Replace
    twitter: '#', // TODO: Replace
    youtube: '#', // TODO: Replace
  },
  heroImageUrl: '/background-ferradura-placeholder.jpg', // TODO: Replace with a suitable hero image for La Ferradura
  heroImageHint: 'muntanyes Alp restaurant rústic', // NOU
  bookingTimeSlots: [ 
    "12:00", "12:15", "12:30", "12:45",
    "13:00", "13:15", "13:30", "13:45",
    "14:00", "14:15", "14:30", "14:45",
    "15:00", "15:15", "15:30", "15:45",
    "16:00", "16:15", "16:30", "16:45",
    "19:00", "19:15", "19:30", "19:45",
    "20:00", "20:15", "20:30", "20:45",
    "21:00", "21:15", "21:30", "21:45",
    "22:00", "22:15", "22:30", "22:45",
    "23:00"
  ],
  bookingSlotDurationMinutes: 90, // Ajustat per a una durada de reserva típica
  timeZone: 'Europe/Madrid',
  theme: {
    primary: 'hsl(205 55% 48%)', // Blau Ferradura (ajustat per ser consistent amb globals.css)
  },
  showMenuItemImages: true,
  showAISommelierSection: false,
  bookingMaxGuestsPerSlot: 8,
  // IMPORTANT: Setting bookingMethod to 'calendar' will make live calls to Google Calendar API.
  // Ensure credentials and API access are correctly configured.
  bookingMethod: 'whatsapp', // O 'calendar'
  whatsappBookingNumber: '+34972890018', // NOU - Número de WhatsApp (exemple, hauria de ser el real si és per WhatsApp)
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2932.602183117748!2d1.8875868154670866!3d42.37263747918573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a58f8f0b17d63f%3A0x5e9f7f9e4e7e6f84!2sRestaurante%20La%20Ferradura!5e0!3m2!1ses!2ses!4v1620000000000!5m2!1ses!2ses', // URL d'exemple per a La Ferradura a Alp, cal verificar-la o actualitzar-la
  googleMapsLink: 'https://maps.google.com/?q=Restaurante+La+Ferradura+Plaça+Major+5+Alp+Girona', // URL d'exemple
  googleReviewUrl: 'TODO: YOUR_LA_FERRADURA_GOOGLE_REVIEW_URL', // TODO: Get and replace Place ID
  tripAdvisorReviewUrl: 'TODO: YOUR_LA_FERRADURA_TRIPADVISOR_REVIEW_URL_HERE',
  openingHours: { // NOUS HORARIS
    mon: "13:00 – 16:00",
    tue: "13:00 – 16:00",
    wed: "13:00 – 16:00",
    thu: "13:00 – 16:00",
    fri: "13:00 – 16:00 / 20:00 – 23:00",
    sat: "13:00 – 16:00 / 20:00 – 23:30",
    sun: "12:00 – 17:00",
  },
  menuDelDia: {
    price: "18,00€", // TODO: Actualitzar amb el preu real del menú del dia de La Ferradura
    priceDescriptionKey: "menu:menuDelDia.priceIncludes",
    notesKey: "menu:menuDelDia.notes",
  },
  allergenConfig: {
    showAsText: false, 
  },
};

export default restaurantConfig;
