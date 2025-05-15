
"use client";

import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { Coffee, ClipboardList, ChefHat, Flame } from 'lucide-react';

const servicesList = [
  {
    icon: Coffee,
    titleKey: "landing:services.breakfasts.title",
    descriptionKey: "landing:services.breakfasts.description"
  },
  {
    icon: ClipboardList,
    titleKey: "landing:services.setMenus.title",
    descriptionKey: "landing:services.setMenus.description"
  },
  {
    icon: ChefHat,
    titleKey: "landing:services.traditionalFood.title",
    descriptionKey: "landing:services.traditionalFood.description"
  },
  {
    icon: Flame,
    titleKey: "landing:services.grilledDinners.title",
    descriptionKey: "landing:services.grilledDinners.description"
  }
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:services.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('landing:services.sectionDescription')}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
