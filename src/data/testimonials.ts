
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
    avatarUrl: 'https://picsum.photos/seed/person1/100/100',
    avatarHint: 'woman smiling',
    testimonialKey: 'testimonials:t1.testimonial',
    rating: 5,
    titleKey: 'testimonials:t1.title',
  },
  {
    id: '2',
    nameKey: 'testimonials:t2.name',
    avatarUrl: 'https://picsum.photos/seed/person2/100/100',
    avatarHint: 'man professional',
    testimonialKey: 'testimonials:t2.testimonial', // This key will be interpolated with restaurantName
    rating: 5,
    titleKey: 'testimonials:t2.title',
  },
  {
    id: '3',
    nameKey: 'testimonials:t3.name',
    avatarUrl: 'https://picsum.photos/seed/person3/100/100',
    avatarHint: 'woman elegant',
    testimonialKey: 'testimonials:t3.testimonial',
    rating: 4.5,
    titleKey: 'testimonials:t3.title',
  },
  {
    id: '4',
    nameKey: 'testimonials:t4.name',
    testimonialKey: 'testimonials:t4.testimonial',
    rating: 5,
    titleKey: 'testimonials:t4.title',
  },
];
