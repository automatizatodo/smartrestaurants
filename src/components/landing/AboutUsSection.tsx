
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const images = [
    {
      src: "/restaurant-exterior.jpg", // Updated path
      altKey: "landing:aboutUs.imageAltExterior",
      hint: "restaurant exterior facade",
      delay: "0.1s",
    },
    {
      src: "/restaurant-interior.jpg", // Updated path
      altKey: "landing:aboutUs.imageAltInterior",
      hint: "restaurant interior dining",
      delay: "0.2s",
    },
    {
      src: "/restaurant-terrace.jpg", // Updated path
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

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-foreground/90 order-2 md:order-1">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:col-span-1 order-1 md:order-2 md:grid-cols-1 lg:grid-cols-1 items-start">
            {images.slice(0, 1).map((image) => ( // For medium screens, show one larger image in the column
                 <div key={image.altKey} className="relative w-full h-64 sm:h-80 md:h-[400px] lg:h-[500px] rounded-lg overflow-hidden shadow-xl group animate-fade-in-up md:block hidden lg:block" style={{ animationDelay: image.delay }}>
                <Image
                  src={image.src}
                  alt={t(image.altKey)}
                  data-ai-hint={image.hint}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                  priority // Consider adding priority to the largest/first image if it's LCP
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
            ))}
             <div className="grid grid-cols-2 gap-4 sm:hidden md:hidden lg:hidden"> {/* On small screens, show two smaller images below main one */}
                {images.slice(1).map((image) => (
                  <div key={image.altKey} className="relative w-full h-40 rounded-lg overflow-hidden shadow-xl group animate-fade-in-up" style={{ animationDelay: image.delay }}>
                    <Image
                      src={image.src}
                      alt={t(image.altKey)}
                      data-ai-hint={image.hint}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                    />
                  </div>
                ))}
            </div>
             <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-2 lg:hidden gap-4 mt-4 md:mt-0 md:col-span-1"> {/* For medium screens, two smaller images */}
              {images.slice(1).map((image) => (
                <div key={image.altKey} className="relative w-full h-48 md:h-56 rounded-lg overflow-hidden shadow-xl group animate-fade-in-up" style={{ animationDelay: image.delay }}>
                  <Image
                    src={image.src}
                    alt={t(image.altKey)}
                    data-ai-hint={image.hint}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 ease-in-out group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
