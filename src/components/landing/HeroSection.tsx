
"use client";
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import restaurantConfig from '@/config/restaurant.config';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const [offsetY, setOffsetY] = useState(0);
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const handleScroll = () => setOffsetY(window.pageYOffset);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center text-center overflow-hidden">
      <div
        className="absolute inset-0 z-0 parallax-bg"
        style={{
          backgroundImage: `url(${restaurantConfig.heroImageUrl})`,
          backgroundPositionY: `${offsetY * 0.3}px`
        }}
      >
        <Image
          src={restaurantConfig.heroImageUrl}
          alt={t('landing:hero.altText', { restaurantName })}
          data-ai-hint={restaurantConfig.heroImageHint}
          fill
          style={{ objectFit: 'cover' }}
          quality={80}
          priority
          className="opacity-0 pointer-events-none"
        />
         <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 shadow-text">
          {restaurantName}
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-10 max-w-3xl mx-auto font-sans shadow-text">
          {t('landing:hero.tagline')}
        </p>
        <div className="flex flex-col space-y-4 items-center sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
          <Link href="/menu" passHref>
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-4 rounded-md shadow-lg transition-transform hover:scale-105 w-full sm:w-auto">
              {t('landing:hero.viewMenuButton')}
            </Button>
          </Link>
          <Link href="#booking" passHref>
            <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 text-lg px-8 py-4 rounded-md shadow-lg transition-transform hover:scale-105 w-full sm:w-auto">
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

