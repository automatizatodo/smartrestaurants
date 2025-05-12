
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import restaurantConfig from '@/config/restaurant.config'; // For heroImageUrl, imageHint
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const [offsetY, setOffsetY] = useState(0);
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName; // Get from common translations

  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{ transform: `translateY(${offsetY * 0.3}px)` }} // Parallax effect
      >
        <Image
          src={restaurantConfig.heroImageUrl}
          alt={t('landing:hero.title')} // Alt text can be localized hero title
          data-ai-hint={restaurantConfig.heroImageHint}
          layout="fill"
          objectFit="cover"
          quality={80}
          priority
          className="brightness-50" // Darken image for text readability
        />
      </div>

      <div className="relative z-10 p-4 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 shadow-text">
          {restaurantName}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-10 max-w-3xl mx-auto font-sans shadow-text">
          {t('landing:hero.tagline')}
        </p>
        <div className="space-x-4">
          <Link href="#menu" passHref>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 rounded-md shadow-lg transition-transform hover:scale-105">
              {t('landing:hero.viewMenuButton')}
            </Button>
          </Link>
          <Link href="#booking" passHref>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 rounded-md shadow-lg transition-transform hover:scale-105">
              {t('landing:hero.bookTableButton')}
            </Button>
          </Link>
        </div>
      </div>
      <style jsx>{`
        .shadow-text {
          text-shadow: 0 2px 4px rgba(0,0,0,0.7);
        }
      `}</style>
    </section>
  );
}
