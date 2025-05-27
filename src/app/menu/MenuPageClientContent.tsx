
"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FullMenuDisplay from '@/components/menu/FullMenuDisplay';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItemData } from '@/data/menu';
import { Button } from '@/components/ui/button';
import restaurantConfig from '@/config/restaurant.config';
import { Star as GoogleIcon } from 'lucide-react'; // Assuming this is still the Google Icon
import { cn } from '@/lib/utils';
// import type { PriceSummary } from '@/app/api/menu/route'; // No longer needed for price display here

const TripAdvisorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4"></circle>
    <line x1="22" x2="18" y1="12" y2="12"></line>
    <line x1="6" x2="2" y1="12" y2="12"></line>
    <line x1="12" x2="12" y1="6" y2="2"></line>
    <line x1="12" x2="12" y1="22" y2="18"></line>
  </svg>
);

interface MenuPageClientContentProps {
  menuItems: MenuItemData[];
  // currentMenuPrice and priceSummary removed as per new requirements
}

export default function MenuPageClientContent({
  menuItems,
}: MenuPageClientContentProps) {
  const { t, language, setLanguage, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

  useEffect(() => {
    document.title = t('page-specific:menu:title'); // Adjusted title to use new key structure
  }, [t, language]); // Removed restaurantName as it's already in page-specific:menu:title

  // const menuDelDiaPriceDescription = menuDelDiaPriceDescriptionKey // Removed
  //   ? t(menuDelDiaPriceDescriptionKey)
  //   : "";

  const menuPageDescription = t('page-specific:menu:description').trim();

  const languageButtons = [
    { code: 'ca', name: 'Català' },
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 pt-0 lg:pt-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-anton font-bold text-foreground mb-4" suppressHydrationWarning>
               {t('page-specific:menu:titleWithoutBrand')}
            </h1>

            {/* Removed Price Summary and Current Menu Price display */}

            {menuPageDescription && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto" suppressHydrationWarning>
                {menuPageDescription}
              </p>
            )}
          </div>

          {/* Language Selector Buttons */}
          <div className="flex justify-center space-x-2 mb-6 sm:mb-8">
            {languageButtons.map((langButton) => (
              <Button
                key={langButton.code}
                variant={language === langButton.code ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage(langButton.code as 'ca' | 'es' | 'en')}
                className={cn(
                  language === langButton.code ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary/10'
                )}
                suppressHydrationWarning
              >
                {langButton.name}
              </Button>
            ))}
          </div>

          <FullMenuDisplay menuItems={menuItems} />

          {(restaurantConfig.googleReviewUrl || restaurantConfig.tripAdvisorReviewUrl) && (
            <div className="mt-12 sm:mt-16 text-center flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-6">
              {restaurantConfig.googleReviewUrl && restaurantConfig.googleReviewUrl !== 'TODO_YOUR_LA_FERRADURA_GOOGLE_REVIEW_URL' && (
                <Link href={restaurantConfig.googleReviewUrl} target="_blank" rel="noopener noreferrer" passHref className="w-full sm:w-auto">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto" suppressHydrationWarning>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    {t('landing:testimonials.leaveGoogleReview')}
                  </Button>
                </Link>
              )}
              {restaurantConfig.tripAdvisorReviewUrl && restaurantConfig.tripAdvisorReviewUrl !== 'TODO_YOUR_LA_FERRADURA_TRIPADVISOR_REVIEW_URL_HERE' && (
                <Link href={restaurantConfig.tripAdvisorReviewUrl} target="_blank" rel="noopener noreferrer" passHref className="w-full sm:w-auto">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto" suppressHydrationWarning>
                    <TripAdvisorIcon />
                    {t('landing:testimonials.leaveTripAdvisorReview')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
