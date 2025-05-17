
"use client";

import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { Coffee, ClipboardList, ChefHat } from 'lucide-react';
// Removed Image import as it's no longer used for background

const servicesList = [
  {
    icon: Coffee,
    titleKey: "landing:services.breakfasts.title",
    descriptionKey: "landing:services.breakfasts.description"
  },
  {
    icon: ChefHat, 
    titleKey: "landing:services.traditionalAndGrilled.title",
    descriptionKey: "landing:services.traditionalAndGrilled.description"
  },
  {
    icon: ClipboardList, 
    titleKey: "landing:services.setMenus.title",
    descriptionKey: "landing:services.setMenus.description"
  }
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-16 sm:py-24 bg-background">
      {/* Background Image and Overlay Removed */}
      {/* <Image
        src="/carnebrasa.jpg"
        alt={t('landing:services.backgroundImageAlt', {restaurantName: t('common:restaurantName')})}
        data-ai-hint="grilled meat barbecue"
        fill
        style={{ objectFit: 'cover' }}
        className="absolute inset-0 z-0"
        quality={70}
        priority={false}
      />
      <div className="absolute inset-0 bg-background/60 dark:bg-background/75 z-0"></div> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8"> {/* Removed relative z-10 */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:services.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('landing:services.sectionDescription')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service, index) => (
            <ServiceCard 
              key={service.titleKey} 
              icon={service.icon} 
              titleKey={service.titleKey} 
              descriptionKey={service.descriptionKey}
              animationDelay={`${index * 0.1}s`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
