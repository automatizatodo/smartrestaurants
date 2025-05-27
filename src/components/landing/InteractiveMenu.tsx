
"use client";

import { useState } from 'react';
import Link from 'next/link';
import MenuItemCard from './MenuItemCard';
import { menuCategories } from '@/data/menu';
import type { MenuItemData } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { UtensilsCrossed, AlertTriangle } from 'lucide-react';
// import restaurantConfig from '@/config/restaurant.config'; // No longer needed for price here
// import type { PriceSummary } from '@/app/api/menu/route'; // No longer needed for price here

interface InteractiveMenuProps {
  menuItems: MenuItemData[];
  // currentMenuPrice and priceSummary removed as per new requirements
}

export default function InteractiveMenu({ menuItems }: InteractiveMenuProps) {
  const { t } = useLanguage();

  const availableCategoryKeys = Array.from(new Set(menuItems.map(item => item.categoryKey).filter(Boolean)));

  const sortedCategories = menuCategories
    .filter(cat => availableCategoryKeys.includes(cat.key))
    .sort((a, b) => a.order - b.order);

  const defaultCategory = sortedCategories.length > 0 ? sortedCategories[0].key : 'all';
  const [activeTab, setActiveTab] = useState<string>(defaultCategory);

  // const menuDelDiaPriceDescription = restaurantConfig.menuDelDia?.priceDescriptionKey
  //   ? t(restaurantConfig.menuDelDia.priceDescriptionKey)
  //   : "";

  if (!menuItems || menuItems.length === 0) {
    return (
      <section id="menu" className="py-16 sm:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl sm:text-5xl font-anton font-bold text-foreground mb-3 sm:mb-4"
            suppressHydrationWarning
          >
            {t('landing:menu.sectionTitle')}
          </h2>
           {/* Removed currentMenuPrice and priceDescription display */}
           <div className="flex flex-col items-center justify-center text-muted-foreground bg-card p-8 rounded-lg shadow-md">
            <AlertTriangle className="w-12 h-12 mb-4 text-destructive" />
            <p className="text-lg mb-2">{t('landing:menu.loadingErrorTitle')}</p>
            <p className="text-sm">{t('landing:menu.loadingError')}</p>
          </div>
           <div className="text-center mt-12 sm:mt-16">
            <Link href="/menu" passHref>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform hover:scale-105"
                suppressHydrationWarning
              >
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                {t('common:button.viewFullMenu')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (sortedCategories.length === 0) {
    return (
      <section id="menu" className="py-16 sm:py-24 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl sm:text-5xl font-anton font-bold text-foreground mb-4"
            suppressHydrationWarning
          >
            {t('landing:menu.sectionTitle')}
          </h2>
          {/* Removed currentMenuPrice and priceDescription display */}
           <div className="flex flex-col items-center justify-center text-muted-foreground bg-card p-8 rounded-lg shadow-md">
            <AlertTriangle className="w-16 h-16 mb-6 text-primary" />
            <p className="text-lg mb-2">{t('landing:menu.noCategoriesTitle')}</p>
            <p className="text-sm">{t('landing:menu.noCategoriesError')}</p>
          </div>
           <div className="text-center mt-12 sm:mt-16">
            <Link href="/menu" passHref>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform hover:scale-105"
                suppressHydrationWarning
              >
                <UtensilsCrossed className="mr-2 h-5 w-5" />
                {t('common:button.viewFullMenu')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }


  return (
    <section id="menu" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-4xl sm:text-5xl font-anton font-bold text-foreground mb-3 sm:mb-4" suppressHydrationWarning>
            {t('landing:menu.sectionTitle')}
          </h2>

          {/* Removed Price Summary Display and currentMenuPrice display */}

          {t('landing:menu.sectionDescription').trim() && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 sm:mb-12" suppressHydrationWarning>
              {t('landing:menu.sectionDescription')}
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full flex items-center justify-start overflow-x-auto scrollbar-hide mb-10 sm:mb-12 sm:flex-wrap sm:justify-center sm:overflow-x-visible">
            {sortedCategories.map((category) => (
              <TabsTrigger
                key={category.key}
                value={category.key}
                className="flex-shrink-0 text-sm md:text-base sm:flex-shrink mx-1"
                suppressHydrationWarning
              >
                {t(`menu:${category.key}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {sortedCategories.map((category) => (
            <TabsContent key={category.key} value={category.key}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {menuItems
                  .filter(item => item.categoryKey === category.key)
                  .slice(0, 3) // Show only 3 items per category on the homepage
                  .map((item, index) => (
                    <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <MenuItemCard item={item} />
                    </div>
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="text-center mt-12 sm:mt-16">
          <Link href="/menu" passHref>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform hover:scale-105"
              suppressHydrationWarning
            >
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              {t('common:button.viewFullMenu')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
