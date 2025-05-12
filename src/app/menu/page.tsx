
"use client"; // Add "use client" directive here

import type { Metadata } from 'next';
import Header from '@/components/landing/Header'; // Reusing landing header
import Footer from '@/components/landing/Footer'; // Reusing landing footer
import FullMenuDisplay from '@/components/menu/FullMenuDisplay';
import { useLanguage } from '@/context/LanguageContext'; // Need provider potentially if metadata depends on it, or use hook directly if metadata is static/english
import enCommon from '@/locales/en/common.json'; // For default metadata - metadata generation still happens server-side


// !!! IMPORTANT: Metadata generation remains server-side !!!
// We cannot use hooks like useLanguage directly in metadata generation.
// This metadata will use the 'en' default or needs a different i18n strategy (e.g., path-based).
// export const metadata: Metadata = {
//   title: `${enCommon['page.menu.title']} | ${enCommon.restaurantName}`,
//   description: enCommon['page.menu.description'].replace('{restaurantName}', enCommon.restaurantName),
// };

// Component to use the hook *after* provider is set
function MenuPageContent() {
  const { t, translations } = useLanguage(); // This hook call is now valid because of "use client"
  const restaurantName = translations.common.restaurantName;

  // Set document title dynamically on the client side
  useEffect(() => {
    document.title = `${t('common:page.menu.title')} | ${restaurantName}`;
    // You might also want to update meta description tag if needed, though less common client-side
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
          <FullMenuDisplay />
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Page component wraps content with provider if needed, though AppInitializer handles it globally
export default function MenuPage() {
  // LanguageProvider is already in RootLayout, so we don't need it here again.
  // MenuPageContent is now a Client Component due to "use client" at the top.
  return <MenuPageContent />;
}

// Helper hook for client-side title setting (optional abstraction)
import { useEffect } from 'react';

function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
