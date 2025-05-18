
"use client";

import type { MenuItemData } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface SubMenuItemDisplayProps {
  item: MenuItemData;
  className?: string;
}

export default function SubMenuItemDisplay({ item, className }: SubMenuItemDisplayProps) {
  const { language } = useLanguage();

  const displayName = item.name[language] || item.name.en || item.name.ca || item.name.es || "";
  const displayDescription = item.description[language] || item.description.en || item.description.ca || item.description.es || "";

  return (
    <div className={cn("py-1.5 px-2 text-sm", className)}>
      <div className="flex justify-between items-baseline">
        <span className="font-medium text-foreground/90">{displayName}</span>
        {item.price && (
          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
            + {item.price}
          </span>
        )}
      </div>
      {displayDescription && (
        <p className="text-xs text-muted-foreground mt-0.5">{displayDescription}</p>
      )}
    </div>
  );
}
