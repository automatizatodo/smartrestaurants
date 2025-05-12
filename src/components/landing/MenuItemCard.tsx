
"use client";
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { MenuItemData } from '@/data/menu'; // Import the updated interface
import { useLanguage } from '@/context/LanguageContext';

export default function MenuItemCard({ item }: { item: MenuItemData }) {
  const { t } = useLanguage();
  // Ensure the URL has a protocol
  const imageUrl = item.imageUrl.startsWith('http') ? item.imageUrl : `https://${item.imageUrl}`;

  return (
    <div className="h-full transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-1">
      <Card className="overflow-hidden h-full flex flex-col group shadow-lg hover:shadow-xl bg-card text-card-foreground transition-all duration-300 ease-out">
        <div className="relative w-full h-56 sm:h-64 overflow-hidden">
          <Image
            src={imageUrl}
            alt={t(item.nameKey)} // Use translated name for alt text
            data-ai-hint={item.imageHint}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl lg:text-2xl font-serif group-hover:text-primary transition-colors duration-300">
            {t(item.nameKey)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <CardDescription className="text-sm text-muted-foreground mb-3 flex-grow">
            {t(item.descriptionKey)}
          </CardDescription>
          <p className="text-lg font-semibold text-primary mt-2">{item.price}</p>
        </CardContent>
      </Card>
    </div>
  );
}
