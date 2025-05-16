
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const images = [
    {
      src: "/restaurant-exterior.jpg", // Façana
      altKey: "landing:aboutUs.imageAltExterior",
      hint: "restaurant exterior facade",
      customClass: "z-10 transform group-hover:rotate-[-2deg] group-hover:scale-105",
      priority: true,
    },
    {
      src: "/restaurant-interior.jpg", // Interior
      altKey: "landing:aboutUs.imageAltInterior",
      hint: "restaurant interior dining",
      customClass: "z-20 top-[-15%] right-[-10%] sm:top-[-10%] sm:right-[-15%] w-3/5 rotate-[10deg] group-hover:rotate-[5deg] group-hover:scale-110 border-4 border-background dark:border-secondary shadow-lg",
      priority: false,
    },
    {
      src: "/restaurant-terrace.jpg", // Terrassa
      altKey: "landing:aboutUs.imageAltTerrace",
      hint: "restaurant terrace patio",
      customClass: "z-0 bottom-[-15%] left-[-10%] sm:bottom-[-10%] sm:left-[-15%] w-3/5 rotate-[-8deg] group-hover:rotate-[-3deg] group-hover:scale-110 border-4 border-background dark:border-secondary shadow-lg",
      priority: false,
    },
  ];

  return (
    <section id="about-us" className="py-16 sm:py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:aboutUs.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('landing:aboutUs.introduction', { restaurantName })}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Text Column */}
          <div className="space-y-6 text-foreground/90 order-2 md:order-1 flex flex-col justify-center">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>

          {/* Image Composition Column */}
          <div className="md:col-span-1 order-1 md:order-2 flex items-center justify-center min-h-[300px] sm:min-h-[450px] md:min-h-[500px]">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg aspect-[4/5] group">
              {/* Image 1: Exterior (Façana - Centered in the pseudo-stack) */}
              <div
                className={cn(
                  "absolute w-[75%] sm:w-[70%] aspect-[4/3] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                  "rounded-lg overflow-hidden shadow-2xl transition-all duration-500 ease-in-out",
                  images[0].customClass
                )}
              >
                <Image
                  src={images[0].src}
                  alt={t(images[0].altKey)}
                  data-ai-hint={images[0].hint}
                  layout="fill"
                  objectFit="cover"
                  priority={images[0].priority}
                />
              </div>

              {/* Image 2: Interior (Smaller, Overlapping) */}
              <div
                className={cn(
                  "absolute aspect-square",
                  "rounded-md overflow-hidden transition-all duration-500 ease-in-out",
                  images[1].customClass
                )}
              >
                <Image
                  src={images[1].src}
                  alt={t(images[1].altKey)}
                  data-ai-hint={images[1].hint}
                  layout="fill"
                  objectFit="cover"
                />
              </div>

              {/* Image 3: Terrace (Smaller, Overlapping) */}
              <div
                className={cn(
                  "absolute aspect-[5/4]",
                  "rounded-md overflow-hidden transition-all duration-500 ease-in-out",
                  images[2].customClass
                )}
              >
                <Image
                  src={images[2].src}
                  alt={t(images[2].altKey)}
                  data-ai-hint={images[2].hint}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
