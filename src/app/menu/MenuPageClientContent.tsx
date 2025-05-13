
"use client";

import { useEffect } from 'react';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FullMenuDisplay from '@/components/menu/FullMenuDisplay';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItemData } from '@/data/menu';

interface MenuPageClientContentProps {
  menuItems: MenuItemData[];
}

export default function MenuPageClientContent({ menuItems }: MenuPageClientContentProps) {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  useEffect(() => {
    document.title = `${t('common:page.menu.title')} | ${restaurantName}`;
  }, [t, restaurantName]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 pb-16 sm:pb-24"> {/* Add padding top to account for fixed header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4">
               {t('common:page.menu.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
               {t('common:page.menu.description', { restaurantName })}
            </p>
          </div>
          <FullMenuDisplay menuItems={menuItems} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
