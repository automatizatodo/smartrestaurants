
"use client";
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import type { TestimonialData } from '@/data/testimonials'; 
import { useLanguage } from '@/context/LanguageContext';

export default function TestimonialCard({ testimonialItem }: { testimonialItem: TestimonialData }) {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;


  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(testimonialItem.rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 text-primary fill-primary" />);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-5 w-5 text-primary/30" />);
    }
    return stars;
  };
  
  const testimonialText = t(testimonialItem.testimonialKey, { restaurantName });


  return (
    <Card className="h-full flex flex-col bg-card text-card-foreground shadow-lg p-6 rounded-lg">
      <CardContent className="flex flex-col items-center text-center flex-grow p-0">
        {testimonialItem.avatarUrl && (
          <div className="relative w-20 h-20 mb-4 rounded-full overflow-hidden shadow-md">
            <Image
              src={testimonialItem.avatarUrl}
              alt={t(testimonialItem.nameKey)}
              data-ai-hint={testimonialItem.avatarHint || "person portrait"}
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>
        )}
        <div className="flex mb-3">{renderStars()}</div>
        <p className="text-muted-foreground italic mb-4 text-md flex-grow">&ldquo;{testimonialText}&rdquo;</p>
        <h4 className="font-semibold font-serif text-lg text-primary">{t(testimonialItem.nameKey)}</h4>
        {testimonialItem.titleKey && <p className="text-xs text-muted-foreground">{t(testimonialItem.titleKey)}</p>}
      </CardContent>
    </Card>
  );
}
