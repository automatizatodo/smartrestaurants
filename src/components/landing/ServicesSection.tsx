
"use client";

import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { Utensils, Leaf, Cake } from 'lucide-react'; // Adjusted icons

const servicesList = [
  {
    icon: Utensils, // For Pasta & Pizza
    titleKey: "landing:services.pastaPizzas.title",
    descriptionKey: "landing:services.pastaPizzas.description"
  },
  {
    icon: Cake, // For Quiches & Crêpes (Cake can represent homemade baked goods)
    titleKey: "landing:services.quichesCrepes.title",
    descriptionKey: "landing:services.quichesCrepes.description"
  },
  {
    icon: Leaf, // For Salads & Vegan/Vegetarian options
    titleKey: "landing:services.saladsVegan.title",
    descriptionKey: "landing:services.saladsVegan.description"
  }
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-anton font-bold text-foreground mb-4">
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
