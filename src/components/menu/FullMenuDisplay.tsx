
"use client";

import { menuItems, menuCategories } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MenuItemCard from '@/components/landing/MenuItemCard'; // Reusing the card component

export default function FullMenuDisplay() {
  const { t } = useLanguage();

  // Group items by category
  const groupedMenu = menuItems.reduce((acc, item) => {
    const category = item.categoryKey;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  // Sort categories based on predefined order
  const sortedCategoryKeys = Object.keys(groupedMenu).sort((a, b) => {
    const orderA = menuCategories.find(cat => cat.key === a)?.order ?? 99;
    const orderB = menuCategories.find(cat => cat.key === b)?.order ?? 99;
    return orderA - orderB;
  });

  // Determine default open accordion items (e.g., first category)
  const defaultOpenValue = sortedCategoryKeys.length > 0 ? [sortedCategoryKeys[0]] : [];

  return (
    <Accordion type="multiple" defaultValue={defaultOpenValue} className="w-full space-y-4">
      {sortedCategoryKeys.map((categoryKey) => (
        <AccordionItem key={categoryKey} value={categoryKey} className="border-b-0 rounded-lg overflow-hidden shadow-md bg-card">
          <AccordionTrigger className="px-6 py-4 text-xl font-serif text-primary hover:no-underline hover:bg-accent/50 transition-colors">
            {t(categoryKey)}
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pt-4">
              {groupedMenu[categoryKey].map((item, index) => (
                <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
