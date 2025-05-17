
"use client";

import { menuCategories } from '@/data/menu';
import type { MenuItemData } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MenuItemCard from '@/components/landing/MenuItemCard';
import SubMenuItemDisplay from './SubMenuItemDisplay'; // Import the new component
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullMenuDisplayProps {
  menuItems: MenuItemData[];
}

// Define constants for subcategory keys for easier reference
const GRILLED_GARNISH_KEY = 'grilledGarnish';
const SAUCES_KEY = 'sauces';
const SECOND_COURSES_KEY = 'secondCourses';

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

  // Get top-level categories for accordion, excluding subcategories
  const topLevelCategoryKeys = menuCategories
    .map(cat => cat.key)
    .filter(key => key !== GRILLED_GARNISH_KEY && key !== SAUCES_KEY);

  const sortedTopLevelCategories = menuCategories
    .filter(cat => topLevelCategoryKeys.includes(cat.key))
    .sort((a, b) => a.order - b.order);

  const defaultOpenValue: string[] = [];

  if (sortedTopLevelCategories.length === 0 && !groupedMenu[SECOND_COURSES_KEY]?.length) { // Check if even second courses (which might contain subcats) are missing
     return (
      <div className="text-center py-10 flex flex-col items-center justify-center text-muted-foreground bg-card p-8 rounded-lg shadow-md">
        <AlertTriangle className="w-16 h-16 mb-6 text-primary" />
        <p className="text-2xl font-serif mb-2">{t('landing:menu.noCategoriesTitle')}</p>
        <p className="text-md">{t('landing:menu.noCategoriesError')}</p>
      </div>
    );
  }

  return (
    <Accordion type="multiple" defaultValue={defaultOpenValue} className="w-full space-y-1 sm:space-y-2">
      {sortedTopLevelCategories.map((category) => {
        const itemsInCategory = groupedMenu[category.key];
        if (!itemsInCategory || itemsInCategory.length === 0) {
          // If it's not second courses and it's empty, skip it.
          // Second courses might be "empty" of main items but have subcategories.
          if (category.key !== SECOND_COURSES_KEY) {
            return null;
          }
        }
        
        // For second courses, check if it has main items OR subcategory items
        if (category.key === SECOND_COURSES_KEY && 
            (!itemsInCategory || itemsInCategory.length === 0) &&
            (!groupedMenu[GRILLED_GARNISH_KEY] || groupedMenu[GRILLED_GARNISH_KEY].length === 0) &&
            (!groupedMenu[SAUCES_KEY] || groupedMenu[SAUCES_KEY].length === 0)
           ) {
          return null; // Skip second courses if it has no main items AND no subcategory items
        }

        const categoryTitleKey = `menu:${category.key}`;
        return (
          <AccordionItem key={category.key} value={category.key} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
            <AccordionTrigger className="px-3 py-2 sm:px-4 sm:py-3 text-md sm:text-lg font-serif text-primary hover:no-underline hover:bg-accent/50 transition-colors">
              {t(categoryTitleKey)}
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2 sm:px-3 sm:pb-3 pt-0">
              <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-x-2 sm:gap-x-3 pt-2 sm:pt-3">
                {itemsInCategory && itemsInCategory.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                        "mb-2 sm:mb-3 break-inside-avoid",
                        item.isChefSuggestion && "pt-2" 
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <MenuItemCard item={item} />
                  </div>
                ))}
              </div>

              {/* Handle subcategories for "Segon Plat" */}
              {category.key === SECOND_COURSES_KEY && (
                (groupedMenu[GRILLED_GARNISH_KEY] && groupedMenu[GRILLED_GARNISH_KEY].length > 0) ||
                (groupedMenu[SAUCES_KEY] && groupedMenu[SAUCES_KEY].length > 0)
              ) && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Columna Guarnició Brasa */}
                    <div>
                      {groupedMenu[GRILLED_GARNISH_KEY] && groupedMenu[GRILLED_GARNISH_KEY].length > 0 && (
                        <>
                          <h4 className="text-lg font-serif text-foreground/90 mb-2 px-1">{t('menu:grilledGarnish')}</h4>
                          <div className="divide-y divide-border/50 border border-border/50 rounded-md bg-secondary/30 p-1">
                            {groupedMenu[GRILLED_GARNISH_KEY].map(subItem => (
                              <SubMenuItemDisplay key={subItem.id} item={subItem} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    {/* Columna Salses */}
                    <div>
                      {groupedMenu[SAUCES_KEY] && groupedMenu[SAUCES_KEY].length > 0 && (
                        <>
                          <h4 className="text-lg font-serif text-foreground/90 mb-2 px-1">{t('menu:sauces')}</h4>
                           <div className="divide-y divide-border/50 border border-border/50 rounded-md bg-secondary/30 p-1">
                            {groupedMenu[SAUCES_KEY].map(subItem => (
                              <SubMenuItemDisplay key={subItem.id} item={subItem} />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

