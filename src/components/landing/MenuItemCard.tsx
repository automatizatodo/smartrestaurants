
"use client";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MenuItemData } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import restaurantConfig from '@/config/restaurant.config';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function MenuItemCard({ item }: { item: MenuItemData }) {
  const { language, t } = useLanguage(); 
  
  const imageUrl = item.imageUrl; 

  const displayName = item.name[language] || item.name.ca || item.name.es || item.name.en || "";
  const displayDescription = item.description[language] || item.description.ca || item.description.es || item.description.en || "";

  const shouldShowImage = restaurantConfig.showMenuItemImages && item.imageUrl && !item.imageUrl.includes('placehold.co');

  return (
    <div className={cn(
        "transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-0.5",
        item.isChefSuggestion && "relative" 
    )}>
      {item.isChefSuggestion && (
        <Badge
          suppressHydrationWarning
          variant="default"
          className="absolute top-0 right-1 -mt-3 z-20 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 flex items-center gap-0.5"
        >
           <Sparkles className="h-2.5 w-2.5" /> {t('menu:chefsSuggestion')}
        </Badge>
      )}
      <Card className={cn(
          "flex flex-col group shadow-md hover:shadow-lg bg-card text-card-foreground transition-all duration-300 ease-out",
          item.isChefSuggestion && "border-2 border-primary" 
        )}>
        
        {shouldShowImage && (
          <div 
            className="relative w-full aspect-video overflow-hidden h-28 sm:h-32" 
            suppressHydrationWarning={true}
          > 
            <Image
              suppressHydrationWarning
              src={imageUrl}
              alt={displayName} 
              data-ai-hint={item.imageHint}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 ease-in-out group-hover:scale-105" 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader className={cn(
            "pb-1 pt-3 px-3 sm:px-4", 
            !shouldShowImage && item.isChefSuggestion ? 'pt-2 sm:pt-3' : '', 
            !shouldShowImage && !item.isChefSuggestion ? 'pt-4' : '',
            shouldShowImage && !item.isChefSuggestion ? 'pt-2 sm:pt-3' : ''
          )}>
          <div className="flex justify-between items-baseline">
            <CardTitle 
              suppressHydrationWarning
              className="text-lg lg:text-xl font-serif group-hover:text-primary transition-colors duration-300 leading-snug"
            > 
              {displayName}
            </CardTitle>
            {/* Display "Precio (€)" if available, for "Carta" items */}
            {item.price && (
              <span className="text-xs sm:text-sm text-primary font-semibold ml-2 whitespace-nowrap">
                {item.price} 
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-1 px-3 sm:px-4 pb-3 pt-0"> 
          <div>
            {displayDescription && (
              <CardDescription suppressHydrationWarning className="text-xs text-muted-foreground mb-2 line-clamp-3"> 
                {displayDescription}
              </CardDescription>
            )}
            {/* Display "Suplemento (€)" if available, always with a "+" */}
            {item.suplemento && (
              <p className="text-xs text-accent-foreground/80 font-medium mt-1 mb-2">
                + {item.suplemento} <span className="text-muted-foreground/70">({t('menu:suplemento') || 'Supl.'})</span>
              </p>
            )}
          </div>
          
          {item.allergens && item.allergens.length > 0 && (
            <TooltipProvider delayDuration={300}>
              <div className="mt-auto pt-1.5 mb-0.5 flex items-center flex-wrap gap-1.5">
                {item.allergens.map(allergen => {
                  const allergenKeyForIcon = allergen
                    .toLowerCase()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
                    .replace(/\s+/g, '-') 
                    .replace(/[^a-z0-9-]/g, '');
                  
                  const translatedAllergenName = t("menu:allergen." + allergenKeyForIcon);

                  return (
                    <Tooltip key={allergenKeyForIcon}>
                      <TooltipTrigger asChild>
                        <div className="relative h-6 w-6 cursor-pointer">
                          <Image
                            src={"/alergenos/" + allergenKeyForIcon + ".svg"}
                            alt={translatedAllergenName}
                            fill
                            style={{ objectFit: 'contain' }}
                            suppressHydrationWarning
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-foreground text-background text-xs p-1 px-2 rounded">
                        <p>{translatedAllergenName}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
