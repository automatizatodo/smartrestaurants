
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
  
  const imageUrl = item.imageUrl.startsWith('http') ? item.imageUrl : `https://${item.imageUrl}`;

  const displayName = item.name[language] || item.name.en;
  const displayDescription = item.description[language] || item.description.en;

  return (
    <div className={cn(
        "h-full transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1",
        item.isChefSuggestion && "relative" // For positioning badge
    )}>
      <Card className={cn(
          "overflow-hidden h-full flex flex-col group shadow-lg hover:shadow-xl bg-card text-card-foreground transition-all duration-300 ease-out",
          item.isChefSuggestion && "border-2 border-primary/70 pt-2" // Add padding top if suggestion to not overlap border
        )}>

        {item.isChefSuggestion && (
          <Badge
            variant="default"
            className="absolute top-0 right-0 -mt-3 -mr-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 flex items-center gap-1"
            // Adjust top/right and -mt/-mr to position badge correctly over the border
          >
             <Sparkles className="h-3 w-3" /> {t('menu:chefsSuggestion')}
          </Badge>
        )}
        
        {(restaurantConfig.showMenuItemImages || item.imageUrl !== `https://placehold.co/400x300.png`) && item.imageUrl && (
          <div className="relative w-full h-56 sm:h-64 overflow-hidden">
            <Image
              src={imageUrl}
              alt={displayName} 
              data-ai-hint={item.imageHint}
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 ease-in-out group-hover:scale-110"
            />
          </div>
        )}
        <CardHeader className={cn(
            "pb-2", 
            !((restaurantConfig.showMenuItemImages || item.imageUrl !== `https://placehold.co/400x300.png`) && item.imageUrl) ? 'pt-6' : 'pt-4' // Adjust top padding if no image
          )}>
          <CardTitle className="text-xl lg:text-2xl font-serif group-hover:text-primary transition-colors duration-300">
            {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <CardDescription className="text-sm text-muted-foreground mb-3 flex-grow">
            {displayDescription}
          </CardDescription>
          
          {item.allergens && item.allergens.length > 0 && (
            <div className="mt-2 mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">{t('menu:allergensTitle')}</p>
              <div className="flex flex-wrap gap-1">
                {item.allergens.map(allergen => (
                  <Badge key={allergen} variant="outline" className="text-xs capitalize">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.price && (
            <p className="text-lg font-semibold text-primary mt-auto pt-2">{item.price}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    