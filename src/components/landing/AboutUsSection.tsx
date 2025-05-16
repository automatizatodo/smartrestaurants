
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const images = [
    {
      src: "/façana.webp",
      altKey: "landing:aboutUs.imageAltExterior",
      hint: "restaurant exterior facade",
      delay: "0.1s",
    },
    {
      src: "/interior2.webp",
      altKey: "landing:aboutUs.imageAltInterior",
      hint: "restaurant interior dining",
      delay: "0.2s",
    },
    {
      src: "/terrassa1.webp",
      altKey: "landing:aboutUs.imageAltTerrace",
      hint: "restaurant terrace patio",
      delay: "0.3s",
    },
  ];

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

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-6 text-foreground/90 order-2 md:order-1">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>

          {/* Image container: Stacks images vertically on xs, then adapts for larger screens */}
          <div className="space-y-4 order-1 md:order-2">
            {/* Image 1 (Exterior - larger) */}
            <div
              className="relative w-full aspect-[16/10] rounded-lg overflow-hidden shadow-xl group animate-fade-in-up"
              style={{ animationDelay: images[0].delay }}
            >
              <Image
                src={images[0].src}
                alt={t(images[0].altKey)}
                data-ai-hint={images[0].hint}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
            </div>

            {/* Sub-grid for images 2 (Interior) and 3 (Terrace) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.slice(1).map((image, index) => (
                <div
                  key={image.altKey}
                  className="relative w-full aspect-square rounded-lg overflow-hidden shadow-xl group animate-fade-in-up"
                  style={{ animationDelay: image.delay }}
                >
                  <Image
                    src={image.src}
                    alt={t(image.altKey)}
                    data-ai-hint={image.hint}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
