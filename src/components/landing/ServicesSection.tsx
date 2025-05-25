
"use client";

import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { Utensils, Fish, Cake } from 'lucide-react'; // Changed icons

const servicesList = [
  {
    icon: Utensils, 
    titleKey: "landing:services.paellasAndTapas.title", 
    descriptionKey: "landing:services.paellasAndTapas.description" 
  },
  {
    icon: Fish, 
    titleKey: "landing:services.fishAndGrilledMeats.title", 
    descriptionKey: "landing:services.fishAndGrilledMeats.description" 
  },
  {
    icon: Cake, 
    titleKey: "landing:services.dessertsAndWines.title", 
    descriptionKey: "landing:services.dessertsAndWines.description" 
  }
];

export default function ServicesSection() {
  const { t } = useLanguage();
  const restaurantName = t('common:restaurantName'); 

  return (
    <section id="services" className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3 sm:mb-4" suppressHydrationWarning>
            {t('landing:services.sectionTitle')}
          </h2>
          <p className="text-md sm:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto" suppressHydrationWarning>
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
