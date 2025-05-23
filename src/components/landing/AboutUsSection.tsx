
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import restaurantConfig from '@/config/restaurant.config';
import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Definim les imatges aquí per a més claredat
const componentImages = [
  {
    src: "/façana.webp", // Façana
    altKey: "landing:aboutUs.imageAltExterior",
    hint: "restaurant exterior facade",
    desktopClass: "absolute inset-0 w-10/12 md:w-9/12 mx-auto transform rotate-[-1deg] group-hover:rotate-[-2deg] transition-transform duration-300 rounded-lg shadow-xl z-10",
    mobileClass: "w-full h-full object-cover",
    priority: true,
  },
  {
    src: "/interior2.webp", // Interior
    altKey: "landing:aboutUs.imageAltInterior",
    hint: "restaurant interior dining",
    desktopClass: "absolute top-[-5%] right-[-5%] w-3/5 sm:w-7/12 transform rotate-[6deg] group-hover:rotate-[3deg] group-hover:scale-105 transition-transform duration-300 rounded-lg border-4 border-background dark:border-secondary shadow-2xl z-20",
    mobileClass: "w-full h-full object-cover",
    priority: false,
  },
  {
    src: "/terrassa1.webp", // Terrassa - Aquesta es mostrarà només al carrusel
    altKey: "landing:aboutUs.imageAltTerrace",
    hint: "restaurant terrace patio",
    desktopClass: "hidden", // Oculta per defecte a l'escriptori si no es vol a la composició
    mobileClass: "w-full h-full object-cover",
    priority: false,
  },
];

const carouselImages = componentImages; // Totes les imatges per al carrusel

export default function AboutUsSection() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  }, []);

  const prevImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (carouselImages.length <= 1) return;
    const timer = setTimeout(nextImage, 7000);
    return () => clearTimeout(timer);
  }, [currentIndex, nextImage]);

  return (
    <section id="about-us" className="py-12 sm:py-16 bg-stone-800 text-gray-100 relative z-30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cinzel font-bold text-center mb-10 sm:mb-14">
          {t('landing:aboutUs.title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10 items-center">
          {/* Columna Esquerra: Textos */}
          <div className="space-y-8 md:space-y-10 order-2 md:order-1">
            {/* Qui som */}
            <div className="relative">
              {restaurantConfig.logoUrl && (
                <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none select-none">
                  <Image
                    src={restaurantConfig.logoUrl}
                    alt="" // Decoratiu
                    width={300}
                    height={300}
                    className="object-contain opacity-5 md:opacity-[0.03]"
                    priority={false}
                  />
                </div>
              )}
              <h3 className="text-2xl lg:text-3xl font-cinzel font-semibold mb-3 text-primary">
                {t('landing:aboutUs.whoWeAreTitle')}
              </h3>
              <p className="text-base sm:text-lg leading-relaxed text-gray-300 mb-5">
                {t('landing:aboutUs.introduction', { restaurantName })}
              </p>
              {/* Botó "Coneix l'equip" ocultat
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2.5 rounded-md text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
                {t('landing:aboutUs.meetTheTeamButton')}
              </Button>
              */}
            </div>

            {/* El nostre espai */}
            <div>
              <h3 className="text-2xl lg:text-3xl font-cinzel font-semibold mb-3 text-primary">
                {t('landing:aboutUs.ourSpaceTitle')}
              </h3>
              <p className="text-base sm:text-lg leading-relaxed text-gray-300">
                {t('landing:aboutUs.paragraph1', { restaurantName })}
              </p>
            </div>
          </div>

          {/* Columna Dreta: Carrusel d'Imatges amb Marc inclinat */}
          <div className="flex justify-center items-center md:h-full order-1 md:order-2">
             {/* Carrusel per a mòbils */}
            <div className="w-full max-w-md md:hidden">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-xl bg-secondary/20 border-2 border-primary/70 p-1.5">
                {carouselImages.map((image, index) => (
                  <div
                    key={image.src + "-mobile"}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700 ease-in-out",
                      index === currentIndex ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <Image
                      src={image.src}
                      alt={t(image.altKey, { restaurantName })}
                      fill
                      className={image.mobileClass}
                      data-ai-hint={image.hint}
                      priority={image.priority && index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ))}
                {carouselImages.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={prevImage}
                      className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white z-10"
                      aria-label={t('common:previous')}
                    >
                      <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={nextImage}
                      className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/30 hover:bg-black/50 text-white z-10"
                      aria-label={t('common:next')}
                    >
                      <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </>
                )}
              </div>
              {carouselImages.length > 1 && (
                  <div className="flex justify-center space-x-2 mt-3">
                    {carouselImages.map((_, index) => (
                      <button
                        key={"dot-" + index}
                        onClick={() => goToImage(index)}
                        aria-label={t('common:goToSlide', { number: index + 1 })}
                        className={cn(
                          "h-2.5 w-2.5 rounded-full transition-all duration-300",
                          currentIndex === index ? "bg-primary scale-125" : "bg-gray-400/70 hover:bg-gray-300/90"
                        )}
                      />
                    ))}
                  </div>
                )}
            </div>

            {/* Composició per a escriptori */}
            <div className="hidden md:block w-full max-w-sm lg:max-w-md relative group" style={{ minHeight: '380px' }}>
              {/* Imatge Base (Façana) */}
              <div className={cn(
                "relative rounded-lg overflow-hidden shadow-xl aspect-[4/3]",
                componentImages[0].desktopClass
              )}>
                <Image
                  src={componentImages[0].src}
                  alt={t(componentImages[0].altKey, { restaurantName })}
                  fill
                  className="object-cover"
                  data-ai-hint={componentImages[0].hint}
                  priority={componentImages[0].priority}
                  sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 0vw"
                />
              </div>
              {/* Imatge Superposada (Interior) */}
              <div className={cn(
                  "absolute rounded-lg overflow-hidden aspect-[5/4]", // Donem un aspect ratio per controlar alçada
                  componentImages[1].desktopClass,
                   "bottom-[-20%] transform translate-y-[-5%]" // Ajust per superposar a la secció següent
                )}>
                <Image
                  src={componentImages[1].src}
                  alt={t(componentImages[1].altKey, { restaurantName })}
                  fill
                  className="object-cover"
                  data-ai-hint={componentImages[1].hint}
                  priority={componentImages[1].priority}
                  sizes="(min-width: 1024px) 15vw, (min-width: 768px) 20vw, 0vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
