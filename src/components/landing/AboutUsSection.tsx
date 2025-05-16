
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
      src: "/façana.webp", 
      altKey: "landing:aboutUs.imageAltExterior",
      hint: "restaurant exterior facade",
      desktopClass: "relative z-10 w-10/12 md:w-9/12 aspect-[4/3] shadow-xl rounded-lg transform group-hover:scale-105 group-hover:rotate-[-2deg] transition-all duration-500 ease-in-out rotate-[-1deg] mx-auto",
      priority: true,
    },
    {
      src: "/interior2.webp", 
      altKey: "landing:aboutUs.imageAltInterior",
      hint: "restaurant interior dining",
      desktopClass: "absolute z-20 top-[-5%] right-[-5%] w-3/5 sm:w-7/12 aspect-[5/4] rotate-[6deg] group-hover:rotate-[2deg] group-hover:scale-105 transition-all duration-500 ease-in-out border-4 border-background dark:border-card shadow-2xl rounded-md",
      priority: false,
    },
    {
      src: "/terrassa1.webp",
      altKey: "landing:aboutUs.imageAltTerrace",
      hint: "restaurant terrace patio",
      desktopClass: "", 
      priority: false,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? componentImages.length - 1 : prevIndex - 1));
  };

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === componentImages.length - 1 ? 0 : prevIndex + 1));
  }, [componentImages.length]);

  useEffect(() => {
    if (componentImages.length <=1) return;
    const timer = setTimeout(nextSlide, 7000);
    return () => clearTimeout(timer);
  }, [currentIndex, nextSlide, componentImages.length]);


  return (
    <section id="about-us" className="py-8 sm:py-10 bg-background relative z-30">
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
          <div className="space-y-6 text-foreground/90 order-2 md:order-1 flex flex-col justify-center">
            <p className="text-base sm:text-lg leading-relaxed">
              {t('landing:aboutUs.paragraph1', { restaurantName })}
            </p>
          </div>
          
          <div className="hidden md:flex md:col-span-1 order-1 md:order-2 items-center justify-center min-h-[280px] lg:min-h-[320px]">
            <div className="relative w-full max-w-sm lg:max-w-md group">
              <div
                className={cn(
                  componentImages[0].desktopClass
                )}
              >
                <Image
                  src={componentImages[0].src}
                  alt={t(componentImages[0].altKey)}
                  data-ai-hint={componentImages[0].hint}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority={componentImages[0].priority}
                  className="rounded-lg"
                />
              </div>

              {/* Commented out the third image for desktop view as per previous request to show only two */}
              {/* <div
                className={cn(
                  componentImages[2].desktopClass 
                )}
              >
                <Image
                  src={componentImages[2].src}
                  alt={t(componentImages[2].altKey)}
                  data-ai-hint={componentImages[2].hint}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
              </div> */}
              
              <div
                className={cn(
                  componentImages[1].desktopClass
                )}
              >
                <Image
                  src={componentImages[1].src}
                  alt={t(componentImages[1].altKey)}
                  data-ai-hint={componentImages[1].hint}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="rounded-md"
                />
              </div>
            </div>
          </div>

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
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    priority={index === 0 && image.priority} 
                  />
                </div>
              ))}
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
