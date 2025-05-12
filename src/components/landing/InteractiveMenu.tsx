
"use client";

import { useState } from 'react';
import Link from 'next/link';
import MenuItemCard from './MenuItemCard';
import { menuItems, menuCategories } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { UtensilsCrossed } from 'lucide-react'; // Icon for button

export default function InteractiveMenu() {
  const { t } = useLanguage();

  // Get unique category keys from menuItems and sort them based on defined order
  const availableCategoryKeys = Array.from(new Set(menuItems.map(item => item.categoryKey)));
  const sortedCategories = menuCategories
    .filter(cat => availableCategoryKeys.includes(cat.key))
    .sort((a, b) => a.order - b.order);

  // Determine the default active tab (e.g., the first category)
  const defaultCategory = sortedCategories.length > 0 ? sortedCategories[0].key : 'all'; // Fallback if no categories defined/matched
  const [activeTab, setActiveTab] = useState<string>(defaultCategory);

  return (
    <section id="menu" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            {t('landing:menu.sectionTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing:menu.sectionDescription')}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap justify-center mb-10">
             {/* Add an "All" tab */}
             {/*
             <TabsTrigger value="all" className="text-sm md:text-base">
               {t('common:allCategories')}
             </TabsTrigger>
             */}
            {sortedCategories.map((category) => (
              <TabsTrigger key={category.key} value={category.key} className="text-sm md:text-base">
                {t(category.key)}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Add content for "All" tab */}
           {/*
          <TabsContent value="all">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
              {menuItems.map((item, index) => (
                <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>
          </TabsContent>
          */}

          {sortedCategories.map((category) => (
            <TabsContent key={category.key} value={category.key}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
                {menuItems
                  .filter(item => item.categoryKey === category.key)
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
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg transition-transform hover:scale-105">
              <UtensilsCrossed className="mr-2 h-5 w-5" />
              {t('common:button.viewFullMenu')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
