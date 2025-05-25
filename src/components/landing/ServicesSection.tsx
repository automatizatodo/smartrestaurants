
"use client";

import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { Utensils, Fish, Cake } from 'lucide-react'; // Changed icons

const servicesList = [
  {
    icon: Utensils, // Changed from Coffee
    titleKey: "landing:services.paellasAndTapas.title", // NEW KEY
    descriptionKey: "landing:services.paellasAndTapas.description" // NEW KEY
  },
  {
    icon: Fish, // Changed from ChefHat
    titleKey: "landing:services.fishAndGrilledMeats.title", // NEW KEY
    descriptionKey: "landing:services.fishAndGrilledMeats.description" // NEW KEY
  },
  {
    icon: Cake, // Changed from ClipboardList
    titleKey: "landing:services.dessertsAndWines.title", // NEW KEY
    descriptionKey: "landing:services.dessertsAndWines.description" // NEW KEY
  }
];

export default function ServicesSection() {
  const { t } = useLanguage();
  const restaurantName = t('common:restaurantName'); // Get restaurant name for alt text

  return (
    <section id="services" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4" suppressHydrationWarning>
            {t('landing:services.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto" suppressHydrationWarning>
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
