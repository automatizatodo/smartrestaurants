
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

interface RestaurantConfig {
  // Non-translatable details
  restaurantDisplayName: string; // Name used for internal messages like WhatsApp
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
  bookingMaxGuestsPerSlot?: number;
  bookingMethod: 'calendar' | 'whatsapp';
  whatsappBookingNumber?: string;
  googleMapsEmbedUrl: string; // For the iframe embed
  googleMapsLink: string; // For a direct link to Google Maps
  googleReviewUrl?: string; // Link to leave a Google Review
  tripAdvisorReviewUrl?: string; // Link to leave a TripAdvisor Review
  openingHours: OpeningHours;
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantDisplayName: 'Can Fanals', // Updated
  address: 'Carrer Font Nova, 29, 08202 Sabadell, Barcelona', // Updated
  phone: '(123) 456-7890', // Keep placeholder or update
  phoneHref: 'tel:+1234567890', // Keep placeholder or update
  email: 'reservations@canfanals.com', // Example update
  emailHref: 'mailto:reservations@canfanals.com', // Example update
  socialMediaLinks: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    youtube: '#',
  },
  heroImageUrl: '/background_rest.jpg',
  heroImageHint: 'restaurant interior dining',
  bookingTimeSlots: [
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
  ],
  bookingSlotDurationMinutes: 120,
  timeZone: 'Europe/Madrid',
  theme: {
    primary: 'hsl(51, 100%, 50%)',
  },
  showMenuItemImages: true,
  bookingMaxGuestsPerSlot: 8,
  bookingMethod: 'whatsapp', // or 'calendar'
  whatsappBookingNumber: '+34600000000', // Example, replace with actual number
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2987.891622017595!2d2.100059515416829!3d41.50661897925279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4941a5d3c3c7b%3A0x6e26a1a51b08715!2sCarrer%20de%20la%20Font%20Nova%2C%2029%2C%2008202%20Sabadell%2C%20Barcelona%2C%20Spain!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus', // Replace with your actual embed URL for Can Fanals
  googleMapsLink: 'https://maps.google.com/?q=Carrer+Font+Nova,+29,+08202+Sabadell,+Barcelona', // Replace with your actual Google Maps link for Can Fanals
  googleReviewUrl: 'https://search.google.com/local/writereview?placeid=YOUR_PLACE_ID', // Replace YOUR_PLACE_ID for Can Fanals
  tripAdvisorReviewUrl: 'https://www.tripadvisor.com/UserReviewEdit-gXXXXXX-dYYYYYY-CanFanals.html', // Replace with your TripAdvisor link for Can Fanals
  openingHours: { // Added
    tueWed: "08:00 - 17:00",
    thuSat: "08:00 - 24:00",
    sun: "08:00 - 19:00",
    mon: "landing:contactMap.hours.closed", // Will use translation key
  },
};

export default restaurantConfig;
