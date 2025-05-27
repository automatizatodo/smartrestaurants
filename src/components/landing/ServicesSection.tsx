
"use client";

import { useLanguage } from '@/context/LanguageContext';
import ServiceCard from './ServiceCard';
import { Utensils, Fish, Cake } from 'lucide-react'; // Canvieu les icones si cal

const servicesList = [
  {
    icon: Utensils, // Per a Paelles i Tapes
    titleKey: "landing:services.paellasTapas.title",
    descriptionKey: "landing:services.paellasTapas.description"
  },
  {
    icon: Fish, // Per a Peix Fresc i Carns a la Brasa (Flame podria ser una altra opció)
    titleKey: "landing:services.pescadoBrasa.title",
    descriptionKey: "landing:services.pescadoBrasa.description"
  },
  {
    icon: Cake, // Per a Postres Casolanes i Vins
    titleKey: "landing:services.postresVinos.title",
    descriptionKey: "landing:services.postresVinos.description"
  }
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section id="services" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
