
"use client";

import type { ElementType } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface ServiceCardProps {
  icon: ElementType;
  titleKey: string;
  descriptionKey: string;
  animationDelay?: string;
}

export default function ServiceCard({ icon: Icon, titleKey, descriptionKey, animationDelay = '0s' }: ServiceCardProps) {
  const { t } = useLanguage();
  return (
    <div className="h-full animate-fade-in-up" style={{ animationDelay }}>
      <Card className="h-full text-center p-6 sm:p-8 flex flex-col items-center justify-start shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
        <Icon className="h-12 w-12 sm:h-14 sm:w-14 text-primary mb-5" strokeWidth={1.5} />
        <CardTitle className="font-serif text-xl sm:text-2xl mb-3 text-foreground">
          {t(titleKey)}
        </CardTitle>
        <CardDescription className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t(descriptionKey)}
        </CardDescription>
      </Card>
    </div>
  );
}
