
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  return (
    <section id="about-us" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:aboutUs.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('landing:aboutUs.introduction', { restaurantName })}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-xl group">
            <Image
              src="https://placehold.co/800x600.png"
              alt={t('landing:aboutUs.imageAlt', { restaurantName })}
              data-ai-hint="restaurant chefs kitchen"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 ease-in-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300"></div>
          </div>
          <div className="space-y-6 text-foreground/90">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

    