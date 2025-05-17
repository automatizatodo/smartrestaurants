
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

  const displayName = item.name[language] || item.name.en;
  const displayDescription = item.description[language] || item.description.en;

  return (
    <div className={cn("py-1.5 px-2 text-sm", className)}>
      <div className="flex justify-between items-baseline">
        <span className="font-medium text-foreground/90">{displayName}</span>
        {item.price && (
          <span className="text-xs text-muted-foreground ml-2">{item.price}</span>
        )}
      </div>
      {displayDescription && displayDescription !== "No description available." && displayDescription !== "Sin descripción." && displayDescription !== "Sense descripció." && (
        <p className="text-xs text-muted-foreground mt-0.5">{displayDescription}</p>
      )}
    </div>
  );
}
