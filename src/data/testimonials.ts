
export interface TestimonialData {
  id: string;
  nameKey: string; // e.g., "testimonials:t1.name"
  avatarUrl?: string;
  avatarHint?: string;
  testimonialKey: string; // e.g., "testimonials:t1.testimonial"
  rating: number;
  titleKey?: string; // e.g., "testimonials:t1.title"
}

export const testimonials: TestimonialData[] = [
  {
    id: '1',
    nameKey: 'testimonials:t1.name',
    avatarUrl: 'https://placehold.co/100x100.png', // Updated to placehold.co
    avatarHint: 'smiling person', // Updated hint
    testimonialKey: 'testimonials:t1.testimonial',
    rating: 5,
    titleKey: 'testimonials:t1.title',
  },
  {
    id: '2',
    nameKey: 'testimonials:t2.name',
    avatarUrl: 'https://placehold.co/100x100.png', // Updated to placehold.co
    avatarHint: 'happy customer', // Updated hint
    testimonialKey: 'testimonials:t2.testimonial', // This key will be interpolated with restaurantName
    rating: 5,
    titleKey: 'testimonials:t2.title',
  },
  {
    id: '3',
    nameKey: 'testimonials:t3.name',
    avatarUrl: 'https://placehold.co/100x100.png', // Updated to placehold.co
    avatarHint: 'person dining', // Updated hint
    testimonialKey: 'testimonials:t3.testimonial',
    rating: 4.5,
    titleKey: 'testimonials:t3.title',
  },
  {
    id: '4',
    nameKey: 'testimonials:t4.name',
    // avatarUrl: 'https://placehold.co/100x100.png', // Example if avatar was desired
    avatarHint: 'food enthusiast', // Updated hint, even if no avatar, for consistency
    testimonialKey: 'testimonials:t4.testimonial',
    rating: 5,
    titleKey: 'testimonials:t4.title',
  },
];
