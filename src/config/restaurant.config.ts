
import type { MenuItemProps } from '@/components/landing/MenuItemCard';
import type { TestimonialProps } from '@/components/landing/TestimonialCard';

// Define interfaces for structure (optional but good practice)
interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
}

interface ThemeColors {
  primary: string; // Example: '#FFD700' (Gold)
  // Add other theme color references if needed for documentation
}

interface RestaurantConfig {
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  phoneHref: string; // Tel link format
  email: string;
  emailHref: string; // Mailto link format
  socialMediaLinks: SocialMediaLinks;
  heroImageUrl: string;
  heroImageHint: string;
  bookingTimeSlots: string[];
  // Although theme is applied via globals.css, document key colors
  theme: ThemeColors;
}

// --- Configuration Object ---
const restaurantConfig: RestaurantConfig = {
  restaurantName: 'Gastronomic Canvas',
  tagline: 'Where every dish is a masterpiece, and every meal an unforgettable experience.',
  address: '123 Culinary Avenue, Flavor Town, CA 90210',
  phone: '(123) 456-7890',
  phoneHref: 'tel:+1234567890',
  email: 'reservations@gastronomiccanvas.com',
  emailHref: 'mailto:reservations@gastronomiccanvas.com',
  socialMediaLinks: {
    facebook: '#', // Replace with actual link
    instagram: '#', // Replace with actual link
    twitter: '#', // Replace with actual link
    youtube: '#', // Replace with actual link
  },
  heroImageUrl: 'https://picsum.photos/seed/restaurant-ambiance/1920/1080',
  heroImageHint: 'restaurant ambiance elegant',
  bookingTimeSlots: [
    "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM",
    "8:00 PM", "8:30 PM", "9:00 PM", "9:30 PM"
  ],
  theme: {
    primary: '#FFD700', // Corresponds to HSL 51 100% 50% in globals.css
  },
};

export default restaurantConfig;

// --- Data Exports (or keep in separate files like src/data/...) ---

// Note: It's often cleaner to keep larger data arrays in separate files (e.g., src/data/menu.ts)
// and import them here or directly in the components that use them.
// For simplicity in this example, they are included here.

export const menuItems: MenuItemProps[] = [
  {
    id: '1',
    name: 'Saffron Risotto Milanese',
    description: 'Creamy Arborio rice infused with saffron, Parmesan, and a hint of white wine, topped with gold leaf.',
    price: '$28',
    imageUrl: 'https://picsum.photos/seed/risotto/400/300',
    imageHint: 'risotto elegant',
  },
  {
    id: '2',
    name: 'Seared Scallops with Truffle',
    description: 'Pan-seared U10 scallops served with a black truffle-infused cauliflower purée and asparagus spears.',
    price: '$35',
    imageUrl: 'https://picsum.photos/seed/scallops/400/300',
    imageHint: 'scallops gourmet',
  },
  {
    id: '3',
    name: 'Wagyu Beef Medallions',
    description: 'A5 Wagyu beef, grilled to perfection, accompanied by a rich red wine reduction and potato gratin.',
    price: '$65',
    imageUrl: 'https://picsum.photos/seed/wagyu/400/300',
    imageHint: 'wagyu beef steak',
  },
  {
    id: '4',
    name: 'Lobster Thermidor',
    description: 'Classic French dish of lobster meat cooked in a rich wine sauce, stuffed back into the lobster shell, and browned.',
    price: '$48',
    imageUrl: 'https://picsum.photos/seed/lobster/400/300',
    imageHint: 'lobster dish seafood',
  },
  {
    id: '5',
    name: 'Deconstructed Tiramisu',
    description: 'An artistic take on the classic Italian dessert, with espresso-soaked ladyfingers, mascarpone cream, and cocoa dust.',
    price: '$18',
    imageUrl: 'https://picsum.photos/seed/tiramisu-dessert/400/300', // Corrected URL to include https:// and different seed
    imageHint: 'tiramisu dessert elegant',
  },
  {
    id: '6',
    name: 'Golden Opulence Sundae',
    description: 'Tahitian vanilla bean ice cream, Madagascar vanilla, 23k edible gold leaf, and rare Amedei Porcelana chocolate.',
    price: '$1000',
    imageUrl: 'https://picsum.photos/seed/gold-sundae/400/300',
    imageHint: 'gold dessert luxury',
  },
];


export const testimonials: TestimonialProps[] = [
  {
    id: '1',
    name: 'Alexandra Chen',
    avatarUrl: 'https://picsum.photos/seed/person1/100/100',
    avatarHint: 'woman smiling',
    testimonial: 'An absolutely sublime experience from start to finish. The ambiance, service, and of course, the food were all impeccable. The AI Sommelier suggested the perfect wine pairing!',
    rating: 5,
    title: 'Food Critic, Gourmet Magazine',
  },
  {
    id: '2',
    name: 'Marcus Rodriguez',
    avatarUrl: 'https://picsum.photos/seed/person2/100/100',
    avatarHint: 'man professional',
    testimonial: `${restaurantConfig.restaurantName} isn't just a restaurant; it's a culinary journey. Every dish was a work of art. I've already booked my next visit.`,
    rating: 5,
    title: 'Loyal Patron',
  },
  {
    id: '3',
    name: 'Sophie Dubois',
    avatarUrl: 'https://picsum.photos/seed/person3/100/100',
    avatarHint: 'woman elegant',
    testimonial: "The attention to detail is astounding. From the decor to the presentation of each plate, everything is thoughtfully curated. Highly recommended for special occasions.",
    rating: 4.5, // Will render as 4 full stars for simplicity with current Star component
    title: 'Anniversary Dinner',
  },
   {
    id: '4',
    name: 'David Kim',
    // Example without avatar
    testimonial: "A truly innovative dining concept. The interactive menu was fun, and the food was exceptional. The booking process online was seamless.",
    rating: 5,
    title: 'Tech Entrepreneur',
  },
];
