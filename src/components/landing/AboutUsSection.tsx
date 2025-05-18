
"use client";

import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import restaurantConfig from '@/config/restaurant.config'; // Import config for logo

// Define component images array directly in the component or import if preferred
const componentImages = [
  {
    src: "/façana.webp",
    altKey: "landing:aboutUs.imageAltExterior",
    hint: "restaurant exterior facade",
    priority: true,
  },
  {
    src: "/interior2.webp",
    altKey: "landing:aboutUs.imageAltInterior",
    hint: "restaurant interior dining",
    priority: false,
  },
  // Terrassa image is not used in this new design based on the example.
];

export default function AboutUsSection() {
  const { t } = useLanguage();

  return (
    <section id="about-us" className="py-16 sm:py-20 bg-stone-800 text-gray-100 overflow-hidden"> {/* Dark background, light text */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-center mb-12 sm:mb-16">
          {t('landing:aboutUs.title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-x-10 lg:gap-x-16 gap-y-10 mb-12 sm:mb-16 items-start">
          {/* Left Column: Qui som */}
          <div className="relative">
            {restaurantConfig.logoUrl && (
              <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none select-none">
                <Image
                  src={restaurantConfig.logoUrl}
                  alt="" // Decorative, alt handled by main logo instances
                  width={300}
                  height={300}
                  className="object-contain opacity-5 md:opacity-[0.03]"
                />
              </div>
            )}
            <h3 className="text-3xl font-cinzel font-semibold mb-4 text-amber-500">
              {t('landing:aboutUs.whoWeAreTitle')}
            </h3>
            <p className="text-base sm:text-lg leading-relaxed text-gray-300 mb-6">
              {t('landing:aboutUs.introduction')}
            </p>
            <Button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-md text-sm font-medium">
              {t('landing:aboutUs.meetTheTeamButton')}
            </Button>
          </div>

          {/* Right Column: El nostre espai */}
          <div>
            <h3 className="text-3xl font-cinzel font-semibold mb-4 text-amber-500">
              {t('landing:aboutUs.ourSpaceTitle')}
            </h3>
            <p className="text-base sm:text-lg leading-relaxed text-gray-300">
              {t('landing:aboutUs.paragraph1')}
            </p>
          </div>
        </div>

        {/* Image Section */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center md:items-end">
          {/* Facade Image */}
          <div className="relative w-full max-w-md mx-auto md:mx-0 md:max-w-none transform -rotate-2 hover:rotate-0 transition-transform duration-300 ease-in-out">
            <Image
              src={componentImages[0].src}
              alt={t(componentImages[0].altKey)}
              width={600}
              height={450}
              className="rounded-lg shadow-2xl object-cover aspect-[4/3]"
              data-ai-hint={componentImages[0].hint}
              priority={componentImages[0].priority}
            />
          </div>

          {/* Interior Image with Border */}
          <div className="relative w-full max-w-md mx-auto md:mx-0 md:max-w-none transform rotate-2 hover:rotate-0 transition-transform duration-300 ease-in-out">
            <div className="p-2 sm:p-3 bg-white shadow-2xl rounded-sm">
              <Image
                src={componentImages[1].src}
                alt={t(componentImages[1].altKey)}
                width={600}
                height={400}
                className="object-cover aspect-[4/3]"
                data-ai-hint={componentImages[1].hint}
                priority={componentImages[1].priority}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
