
"use client";

import { menuCategories } from '@/data/menu';
import type { MenuItemData } from '@/data/menu'; 
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MenuItemCard from '@/components/landing/MenuItemCard'; 
import { AlertTriangle } from 'lucide-react';


interface FullMenuDisplayProps {
  menuItems: MenuItemData[];
}

export default function FullMenuDisplay({ menuItems }: FullMenuDisplayProps) {
  const { t } = useLanguage();

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center py-10 flex flex-col items-center justify-center text-muted-foreground bg-card p-8 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 mb-6 text-destructive" />
        <p className="text-2xl font-serif mb-2">{t('landing:menu.loadingErrorTitle')}</p>
        <p className="text-md">{t('landing:menu.loadingError')}</p>
      </div>
    );
  }

  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.categoryKey;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItemData[]>);

  // Sort categories based on the predefined order in menuCategories
  const sortedCategoryKeys = Object.keys(groupedMenu).sort((a, b) => {
    const orderA = menuCategories.find(cat => cat.key === a)?.order ?? 99;
    const orderB = menuCategories.find(cat => cat.key === b)?.order ?? 99;
    return orderA - orderB;
  });

  const defaultOpenValue = sortedCategoryKeys.length > 0 ? [sortedCategoryKeys[0]] : [];

  if (sortedCategoryKeys.length === 0) {
     return (
      <div className="text-center py-10 flex flex-col items-center justify-center text-muted-foreground bg-card p-8 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 mb-6 text-primary" />
        <p className="text-2xl font-serif mb-2">{t('landing:menu.noCategoriesTitle')}</p>
        <p className="text-md">{t('landing:menu.noCategoriesError')}</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={defaultOpenValue} className="w-full space-y-3 sm:space-y-4"> {/* Reduced space-y */}
      {sortedCategoryKeys.map((categoryKey) => {
        const itemsInCategory = groupedMenu[categoryKey];
        if (!itemsInCategory || itemsInCategory.length === 0) {
          return null; 
        }
        // Construct the translation key for the category title
        const categoryTitleKey = `menu:${categoryKey}`;
        return (
          <AccordionItem key={categoryKey} value={categoryKey} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
            <AccordionTrigger className="px-4 py-3 sm:px-6 sm:py-4 text-lg sm:text-xl font-serif text-primary hover:no-underline hover:bg-accent/50 transition-colors"> {/* Reduced padding and font size */}
              {t(categoryTitleKey)}
            </AccordionTrigger>
            <AccordionContent className="px-3 sm:px-4 pb-3 sm:pb-4 pt-0"> {/* Reduced padding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 items-start"> {/* Reduced gap */}
                {itemsInCategory.map((item, index) => (
                  <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                    <MenuItemCard item={item} />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
    
