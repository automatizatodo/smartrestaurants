
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  const images = [
    {
      src: "/façana.webp", // Façana
      altKey: "landing:aboutUs.imageAltExterior",
      hint: "restaurant exterior facade",
      customClass: "z-10 transform group-hover:rotate-[-2deg] group-hover:scale-105",
      priority: true,
    },
    {
      src: "/interior2.webp", // Interior
      altKey: "landing:aboutUs.imageAltInterior",
      hint: "restaurant interior dining",
      customClass: "z-20 top-[-15%] right-[-10%] sm:top-[-10%] sm:right-[-15%] w-3/5 rotate-[10deg] group-hover:rotate-[5deg] group-hover:scale-110 border-4 border-background dark:border-secondary shadow-lg",
      priority: false,
    },
    {
      src: "/terrassa1.webp", // Terrassa
      altKey: "landing:aboutUs.imageAltTerrace",
      hint: "restaurant terrace patio",
      customClass: "z-0 bottom-[-15%] left-[-10%] sm:bottom-[-10%] sm:left-[-15%] w-3/5 rotate-[-8deg] group-hover:rotate-[-3deg] group-hover:scale-110 border-4 border-background dark:border-secondary shadow-lg",
      priority: false,
    },
  ];

  // For mobile carousel
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, [images.length]);

  // Optional: auto-play for mobile carousel (uncomment if desired)
  // useEffect(() => {
  //   const timer = setTimeout(nextSlide, 7000); // Change slide every 7 seconds
  //   return () => clearTimeout(timer);
  // }, [currentIndex, nextSlide]);


  return (
    <section id="about-us" className="py-10 sm:py-14 bg-background overflow-hidden"> {/* Reduced py further */}
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
          {/* Text Column */}
          <div className="space-y-6 text-foreground/90 order-2 md:order-1 flex flex-col justify-center">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>

          {/* Image Area: Conditional rendering based on screen size */}
          {/* Desktop Image Composition (hidden on small screens, visible on md and up) */}
          <div className="hidden md:flex md:col-span-1 order-1 md:order-2 items-center justify-center min-h-[200px] sm:min-h-[250px] md:min-h-[300px]"> {/* Reduced min-h further */}
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md group"> {/* Removed aspect-[4/5] */}
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

              {/* Image 2: Interior */}
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

              {/* Image 3: Terrace - Removed from desktop view (already commented out)
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
              */}
            </div>
          </div>

          {/* Mobile Carousel (visible on small screens, hidden on md and up) */}
          <div className="md:hidden order-1 md:order-2"> {/* This div is shown on mobile, hidden on md+ */}
            <div className="relative w-full max-w-md mx-auto aspect-[16/10] overflow-hidden rounded-lg shadow-xl group">
              {images.map((image, index) => (
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
                    priority={index === 0 && image.priority} // Prioritize first image if marked
                  />
                </div>
              ))}
              {/* Carousel Controls */}
              {images.length > 1 && (
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
                  {/* Dots Indicator */}
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          currentIndex === index ? "bg-primary ring-1 ring-primary-foreground/50 ring-offset-1 ring-offset-background/30" : "bg-muted/70 hover:bg-muted"
                        )}
                        // Using a more generic key or create one like common:goToSlide
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

