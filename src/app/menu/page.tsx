
import type { Metadata } from 'next';
import Header from '@/components/landing/Header'; // Reusing landing header
import Footer from '@/components/landing/Footer'; // Reusing landing footer
import FullMenuDisplay from '@/components/menu/FullMenuDisplay';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext'; // Need provider potentially if metadata depends on it, or use hook directly if metadata is static/english
import enCommon from '@/locales/en/common.json'; // For default metadata

// Static metadata for now, as accessing language context server-side for metadata is complex.
// Consider path-based i18n (e.g., /en/menu, /es/menu) for fully dynamic metadata.
export const metadata: Metadata = {
  title: `${enCommon['page.menu.title']} | ${enCommon.restaurantName}`,
  description: enCommon['page.menu.description'].replace('{restaurantName}', enCommon.restaurantName),
};


// Component to use the hook *after* provider is set
function MenuPageContent() {
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;

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
  return <MenuPageContent />;
}

