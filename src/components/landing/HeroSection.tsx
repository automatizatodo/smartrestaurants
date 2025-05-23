
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

  const fullSeoTitle = t('landing:hero.seoTitle'); // Example: "Can Fanals: Restaurant a Sabadell..."
  let mainTitle = restaurantName; // Fallback to just restaurant name
  let subTitlePart = "";

  // Try to split by the first colon to separate brand name from tagline
  const separatorIndex = fullSeoTitle.indexOf(': ');
  if (separatorIndex !== -1) {
    mainTitle = fullSeoTitle.substring(0, separatorIndex);
    subTitlePart = fullSeoTitle.substring(separatorIndex + 2);
  } else if (fullSeoTitle.startsWith(restaurantName)) {
    // Fallback if no colon: assume restaurant name is at the start
    mainTitle = restaurantName;
    subTitlePart = fullSeoTitle.substring(restaurantName.length).trim();
    // Remove leading colon if it was accidentally included in the seoTitle without a space
    if (subTitlePart.startsWith(':')) { 
        subTitlePart = subTitlePart.substring(1).trim();
    }
  }


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
          className="opacity-0 pointer-events-none" // Hidden for assistive tech, bg is decorative
        />
         <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="relative z-10 p-4 sm:p-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h1
          className="font-bold text-white shadow-text uppercase"
          suppressHydrationWarning
        >
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-2" style={{ fontFamily: 'var(--font-cinzel), serif' }}>
            {mainTitle}
          </span>
          {subTitlePart && (
            <span 
              className="block text-xl sm:text-2xl md:text-3xl text-gray-200 font-normal normal-case mt-1 sm:mt-2" 
              style={{ fontFamily: 'var(--font-cinzel), serif' }} // Using Cinzel for the SEO part as well
            >
              {subTitlePart}
            </span>
          )}
        </h1>
        {/* Tagline <p> element removed */}
        <div className="flex flex-col space-y-4 items-center sm:flex-row sm:space-y-0 sm:space-x-4 justify-center mt-10">
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
