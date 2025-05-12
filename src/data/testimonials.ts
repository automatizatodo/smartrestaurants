
import type { TestimonialProps } from '@/components/landing/TestimonialCard';
import restaurantConfig from '@/config/restaurant.config'; // Import config if needed for dynamic text

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
    // Example using config value within the data file
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
