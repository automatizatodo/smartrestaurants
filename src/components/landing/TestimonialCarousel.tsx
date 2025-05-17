
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import TestimonialCard from './TestimonialCard';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MessageSquareText, StarIcon as GoogleIcon } from 'lucide-react'; // Using StarIcon for Google as a placeholder
import { testimonials } from '@/data/testimonials';
import { useLanguage } from '@/context/LanguageContext';
import restaurantConfig from '@/config/restaurant.config';

// Placeholder for TripAdvisor Icon - Lucide doesn't have it.
// You might use a generic icon or find a suitable SVG.
const TripAdvisorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4"></circle>
    <line x1="22" x2="18" y1="12" y2="12"></line>
    <line x1="6" x2="2" y1="12" y2="12"></line>
    <line x1="12" x2="12" y1="6" y2="2"></line>
    <line x1="12" x2="12" y1="22" y2="18"></line>
  </svg>
);


export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const nextTestimonial = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, []);

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (testimonials.length <= 1) return; 
    const timer = setTimeout(nextTestimonial, 7000); 
    return () => clearTimeout(timer);
  }, [currentIndex, nextTestimonial]);

  if (!testimonials || testimonials.length === 0) {
    return null; 
  }

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:testimonials.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing:testimonials.sectionDescription', { restaurantName: restaurantName })}
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
                aria-label={t('common:previous')}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1/2 right-0 sm:-right-10 transform -translate-y-1/2 rounded-full bg-background/70 hover:bg-background text-foreground"
                onClick={nextTestimonial}
                aria-label={t('common:next')}
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
                aria-label={t('common:goToTestimonial', { number: index + 1})}
                className={`w-3 h-3 rounded-full transition-all ${currentIndex === index ? 'bg-primary scale-125' : 'bg-muted hover:bg-muted-foreground/50'}`}
              />
            ))}
          </div>

        <div className="mt-12 sm:mt-16 text-center space-y-5 sm:space-y-0 sm:flex sm:justify-center sm:space-x-6"> {/* Changed space-y-4 to space-y-5 */}
          {restaurantConfig.googleReviewUrl && (
            <Link href={restaurantConfig.googleReviewUrl} target="_blank" rel="noopener noreferrer" passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                <GoogleIcon className="mr-2 h-5 w-5" /> {/* Using a placeholder Google icon */}
                {t('landing:testimonials.leaveGoogleReview')}
              </Button>
            </Link>
          )}
          {restaurantConfig.tripAdvisorReviewUrl && (
            <Link href={restaurantConfig.tripAdvisorReviewUrl} target="_blank" rel="noopener noreferrer" passHref>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto">
                <TripAdvisorIcon /> {/* Using a placeholder TripAdvisor icon */}
                {t('landing:testimonials.leaveTripAdvisorReview')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

