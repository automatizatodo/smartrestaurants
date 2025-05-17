
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

  const hasRealImage = item.imageUrl && !item.imageUrl.includes('placehold.co');
  const shouldShowImage = restaurantConfig.showMenuItemImages && hasRealImage;

  return (
    <div className={cn(
        "transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1",
        item.isChefSuggestion && "relative" 
    )}>
      <Card className={cn(
          "overflow-hidden flex flex-col group shadow-lg hover:shadow-xl bg-card text-card-foreground transition-all duration-300 ease-out", // Removed h-full if it was there
          item.isChefSuggestion && "border-2 border-primary/70 pt-2" 
        )}>

        {item.isChefSuggestion && (
          <Badge
            variant="default"
            className="absolute top-0 right-0 -mt-3 -mr-2 z-10 bg-primary text-primary-foreground text-xs px-2 py-1 flex items-center gap-1"
          >
             <Sparkles className="h-3 w-3" /> {t('menu:chefsSuggestion')}
          </Badge>
        )}
        
        {shouldShowImage && (
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] overflow-hidden">
            <Image
              src={imageUrl}
              alt={displayName} 
              data-ai-hint={item.imageHint}
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-500 ease-in-out group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}
        <CardHeader className={cn(
            "pb-2", 
            !shouldShowImage ? 'pt-6' : 'pt-4' 
          )}>
          <CardTitle className="text-xl lg:text-2xl font-serif group-hover:text-primary transition-colors duration-300">
            {displayName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col justify-between flex-1"> {/* Added flex-1 here to ensure content area can grow if needed, but description won't over-expand */}
          <CardDescription className="text-sm text-muted-foreground mb-3"> {/* Removed flex-grow */}
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
        </CardContent>
      </Card>
    </div>
  );
}

    