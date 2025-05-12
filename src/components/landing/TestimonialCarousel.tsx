
"use client";

import { useState, useEffect, useCallback } from 'react';
import TestimonialCard, { type TestimonialProps } from './TestimonialCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials: TestimonialProps[] = [
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
    testimonial: "Gastronomic Canvas isn't just a restaurant; it's a culinary journey. Every dish was a work of art. I've already booked my next visit.",
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
    testimonial: "A truly innovative dining concept. The interactive menu was fun, and the food was exceptional. The booking process online was seamless.",
    rating: 5,
    title: 'Tech Entrepreneur',
  },
];

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, []);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const timer = setTimeout(nextTestimonial, 7000); // Auto-scroll every 7 seconds
    return () => clearTimeout(timer);
  }, [currentIndex, nextTestimonial]);

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Words From Our Guests
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hear what our patrons are saying about their experience at Gastronomic Canvas.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonialItem={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {testimonials.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 left-0 sm:-left-10 transform -translate-y-1/2 rounded-full bg-background/70 hover:bg-background text-foreground"
                onClick={prevTestimonial}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-0 sm:-right-10 transform -translate-y-1/2 rounded-full bg-background/70 hover:bg-background text-foreground"
                onClick={nextTestimonial}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
         <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'}`}
              />
            ))}
          </div>
      </div>
    </section>
  );
}
