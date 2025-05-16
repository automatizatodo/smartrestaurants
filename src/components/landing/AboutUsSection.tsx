
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const componentImages = [
    {
      src: "/façana.webp", // Façana
      altKey: "landing:aboutUs.imageAltExterior",
      hint: "restaurant exterior facade",
      desktopClass: "relative z-10 w-11/12 md:w-10/12 aspect-[4/3] shadow-xl rounded-lg transform group-hover:scale-105 group-hover:rotate-[-2deg] transition-all duration-500 ease-in-out rotate-[-1deg]",
      priority: true,
    },
    {
      src: "/interior2.webp", // Interior
      altKey: "landing:aboutUs.imageAltInterior",
      hint: "restaurant interior dining",
      desktopClass: "absolute z-20 top-[-5%] right-[-5%] w-3/5 sm:w-7/12 aspect-[5/4] rotate-[6deg] group-hover:rotate-[2deg] group-hover:scale-105 transition-all duration-500 ease-in-out border-4 border-background dark:border-card shadow-2xl rounded-md",
      priority: false,
    },
    {
      src: "/terrassa1.webp", // Terrassa - Usada només en el carrusel mòbil
      altKey: "landing:aboutUs.imageAltTerrace",
      hint: "restaurant terrace patio",
      desktopClass: "", // No s'usa en escriptori
      priority: false,
    },
  ];

  // Per al carrusel mòbil
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? componentImages.length - 1 : prevIndex - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === componentImages.length - 1 ? 0 : prevIndex + 1));
  }, [componentImages.length]);

  // useEffect(() => {
  //   if (componentImages.length <=1) return;
  //   const timer = setTimeout(nextSlide, 7000);
  //   return () => clearTimeout(timer);
  // }, [currentIndex, nextSlide, componentImages.length]);


  return (
    <section id="about-us" className="py-10 sm:py-12 bg-background relative z-30"> {/* z-index per permetre la superposició */}
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
          {/* Columna de text */}
          <div className="space-y-6 text-foreground/90 order-2 md:order-1 flex flex-col justify-center">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>

          {/* Àrea d'imatges: Condicional segons mida de pantalla */}
          
          {/* Composició d'imatges per a escriptori (md i superiors) */}
          <div className="hidden md:flex md:col-span-1 order-1 md:order-2 items-center justify-center min-h-[300px] lg:min-h-[350px]">
            <div className="relative w-full max-w-sm lg:max-w-md group"> {/* Reduït max-w per a millor control */}
              {/* Imatge 1: Exterior (Façana) - Base */}
              <div
                className={cn(
                  componentImages[0].desktopClass,
                  "mx-auto" // Centrar la imatge base si és més petita que el contenidor
                )}
              >
                <Image
                  src={componentImages[0].src}
                  alt={t(componentImages[0].altKey)}
                  data-ai-hint={componentImages[0].hint}
                  layout="fill"
                  objectFit="cover"
                  priority={componentImages[0].priority}
                  className="rounded-lg"
                />
              </div>

              {/* Imatge 2: Interior - Superposada */}
              <div
                className={cn(
                  componentImages[1].desktopClass
                )}
              >
                <Image
                  src={componentImages[1].src}
                  alt={t(componentImages[1].altKey)}
                  data-ai-hint={componentImages[1].hint}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Carrusel per a mòbils (visible en pantalles petites) */}
          <div className="md:hidden order-1 md:order-2">
            <div className="relative w-full max-w-md mx-auto aspect-[16/10] overflow-hidden rounded-lg shadow-xl group">
              {componentImages.map((image, index) => (
                <div
                  key={image.src}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-700 ease-in-out",
                    index === currentIndex ? "opacity-100 z-10" : "opacity-0"
                  )}
                >
                  <Image
                    src={image.src}
                    alt={t(image.altKey)}
                    data-ai-hint={image.hint}
                    layout="fill"
                    objectFit="cover"
                    className="rounded-lg"
                    priority={index === 0 && image.priority} // Priority per a la primera imatge del carrusel
                  />
                </div>
              ))}
              {/* Controls del Carrusel */}
              {componentImages.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute top-1/2 left-2 sm:left-3 transform -translate-y-1/2 bg-background/60 hover:bg-background/90 text-foreground p-2 rounded-full shadow-md z-20 transition-colors"
                    aria-label={t('common:previous')}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute top-1/2 right-2 sm:right-3 transform -translate-y-1/2 bg-background/60 hover:bg-background/90 text-foreground p-2 rounded-full shadow-md z-20 transition-colors"
                    aria-label={t('common:next')}
                  >
                    <ChevronRight size={20} />
                  </button>
                  {/* Indicadors de Punts */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
                    {componentImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          currentIndex === index ? "bg-primary ring-1 ring-primary-foreground/50 ring-offset-1 ring-offset-background/30" : "bg-muted/70 hover:bg-muted"
                        )}
                        aria-label={t('common:goToTestimonial', { number: index + 1})}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
