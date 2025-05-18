
export interface TestimonialData {
  id: string;
  nameKey: string; // e.g., "testimonials:t1.name"
  avatarUrl?: string;
  avatarHint?: string;
  testimonialKey: string; // e.g., "testimonials:t1.testimonial"
  rating: number;
  titleKey?: string; // e.g., "testimonials:t1.title" for the highlight/tagline
}

export const testimonials: TestimonialData[] = [
  {
    id: '1',
    nameKey: 'testimonials:t1.name',
    // avatarUrl: 'https://placehold.co/100x100.png',
    // avatarHint: 'smiling person',
    testimonialKey: 'testimonials:t1.testimonial',
    rating: 5,
    titleKey: 'testimonials:t1.title',
  },
  {
    id: '2',
    nameKey: 'testimonials:t2.name',
    // avatarUrl: 'https://placehold.co/100x100.png',
    // avatarHint: 'happy customer',
    testimonialKey: 'testimonials:t2.testimonial',
    rating: 5,
    titleKey: 'testimonials:t2.title',
  },
  {
    id: '3',
    nameKey: 'testimonials:t3.name',
    // avatarUrl: 'https://placehold.co/100x100.png',
    // avatarHint: 'person dining',
    testimonialKey: 'testimonials:t3.testimonial',
    rating: 5,
    titleKey: 'testimonials:t3.title',
  },
  {
    id: '4',
    nameKey: 'testimonials:t4.name',
    // avatarUrl: 'https://placehold.co/100x100.png',
    // avatarHint: 'food enthusiast',
    testimonialKey: 'testimonials:t4.testimonial',
    rating: 5,
    titleKey: 'testimonials:t4.title',
  },
];
