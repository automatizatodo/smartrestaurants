
"use client";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MenuItemData } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import restaurantConfig from '@/config/restaurant.config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

export default function MenuItemCard({ item }: { item: MenuItemData }) {
  const { language, t } = useLanguage(); 
  
  const imageUrl = item.imageUrl; 

  const displayName = item.name[language] || item.name.en;
  const displayDescription = item.description[language] || item.description.en;

  const shouldShowImage = restaurantConfig.showMenuItemImages && item.imageUrl && !item.imageUrl.includes('placehold.co');

  return (
    <div className={cn(
        "transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-0.5", 
        item.isChefSuggestion && "relative" // Keep relative positioning on the wrapper for the badge
    )}>
      {item.isChefSuggestion && (
        <Badge
          variant="default"
          className="absolute top-0 right-0 -mt-2 -mr-1.5 z-20 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 flex items-center gap-0.5"
          suppressHydrationWarning
        >
           <Sparkles className="h-2.5 w-2.5" /> {t('menu:chefsSuggestion')}
        </Badge>
      )}
      <Card className={cn(
          "overflow-hidden flex flex-col group shadow-md hover:shadow-lg bg-card text-card-foreground transition-all duration-300 ease-out",
          item.isChefSuggestion && "pt-2" // Add padding-top to card if it's a chef suggestion to make space for the badge
        )}>
        
        {shouldShowImage && (
          <div 
            className="relative w-full aspect-video sm:aspect-[16/9] md:aspect-video overflow-hidden h-28 sm:h-32 md:h-28"
            suppressHydrationWarning // Added to help with alt text mismatch
          > 
            <Image
              src={imageUrl}
              alt={displayName}
              data-ai-hint={item.imageHint}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 ease-in-out group-hover:scale-105" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              suppressHydrationWarning
            />
          </div>
        )}
        <CardHeader className={cn(
            "pb-1 pt-3 px-3 sm:px-4", 
            !shouldShowImage && !item.isChefSuggestion ? 'pt-4' : '', // Adjust top padding if no image AND no suggestion
            !shouldShowImage && item.isChefSuggestion ? 'pt-2 sm:pt-3' : '', // Keep existing logic for no image but suggestion
            shouldShowImage && !item.isChefSuggestion ? 'pt-2 sm:pt-3' : '' // Keep existing logic for image but no suggestion
          )}>
          <CardTitle 
            className="text-base lg:text-lg font-serif group-hover:text-primary transition-colors duration-300 leading-tight"
            suppressHydrationWarning
          > 
            {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-1 px-3 sm:px-4 pb-3 pt-0"> 
          <CardDescription className="text-xs text-muted-foreground mb-2 line-clamp-3" suppressHydrationWarning> 
            {displayDescription}
          </CardDescription>
          
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-1.5 mb-2"> 
              <p className="text-[10px] font-medium text-muted-foreground mb-0.5" suppressHydrationWarning>{t('menu:allergensTitle')}</p> 
              <div className="flex flex-wrap gap-1.5 items-center">
                {item.allergens.map(allergen => {
                  // Sanitize allergen name for filename:
                  // 1. Convert to lowercase
                  // 2. Normalize to remove accents (e.g., "Frutos de cáscara" -> "frutos de cascara")
                  // 3. Replace spaces with hyphens
                  // 4. Remove any remaining non-alphanumeric characters except hyphens
                  const iconName = allergen
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                    .replace(/\s+/g, '-') 
                    .replace(/[^a-z0-9-]/g, '');
                  
                  const capitalizedAllergen = allergen.charAt(0).toUpperCase() + allergen.slice(1);

                  return (
                    <div key={allergen} className="relative h-4 w-4" title={capitalizedAllergen}>
                      <Image
                        src={`/alergenos/${iconName}.svg`} // Assuming SVG format
                        alt={capitalizedAllergen}
                        fill
                        style={{ objectFit: 'contain' }}
                        // You might want to add a class here if your SVG icons are single-color (e.g., black)
                        // and you want them to invert in dark mode, for example:
                        // className="dark:filter dark:invert"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
    
