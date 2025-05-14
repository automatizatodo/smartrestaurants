
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

interface RestaurantConfig {
  // Non-translatable details
  address: string;
  phone: string;
  phoneHref: string; // Tel link format
  email: string;
  emailHref: string; // Mailto link format
  socialMediaLinks: SocialMediaLinks;
  heroImageUrl: string; // Path should be relative to the `public` directory, e.g., /images/hero.jpg
  heroImageHint: string; // This could potentially be localized via a key
  bookingTimeSlots: string[];
  theme: ThemeColors;
  showMenuItemImages: boolean; // New flag to control menu item images
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  address: '123 Culinary Avenue, Flavor Town, CA 90210',
  phone: '(123) 456-7890',
  phoneHref: 'tel:+1234567890',
  email: 'reservations@gastronomiccanvas.com',
  emailHref: 'mailto:reservations@gastronomiccanvas.com',
  socialMediaLinks: {
    facebook: '#',
    instagram: '#',
    twitter: '#',
    youtube: '#',
  },
  heroImageUrl: 'https://placehold.co/1920x1080.png', // Reverted to placeholder
  heroImageHint: 'restaurant interior dining',
  bookingTimeSlots: [
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
  ],
  theme: {
    // Primary color HSL from globals.css: 51 100% 50% (Gold)
    primary: 'hsl(51, 100%, 50%)',
  },
  showMenuItemImages: true, // Set to true by default to show images
};

export default restaurantConfig;
