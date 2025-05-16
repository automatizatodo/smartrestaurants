
import MenuPageClientContent from './MenuPageClientContent';
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
import type { Metadata } from 'next';

// Metadata for the menu page
// Note: For dynamic metadata based on language, you'd typically use generateMetadata
// For now, we'll use static metadata, assuming Catalan as primary for this example.
// The LanguageContext will handle on-page text translation.
import caCommon from '@/locales/ca/common.json';
import caMenuPage from '@/locales/ca/page-specific/menu.json';

export const metadata: Metadata = {
  title: `${caMenuPage.title} | ${caCommon.restaurantName}`,
  description: caMenuPage.description,
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: `${caMenuPage.title} | ${caCommon.restaurantName}`,
    description: caMenuPage.description,
    url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/menu`,
    type: 'website',
  },
  twitter: {
    title: `${caMenuPage.title} | ${caCommon.restaurantName}`,
    description: caMenuPage.description,
  },
};

export default async function MenuPage() {
  const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();
  return <MenuPageClientContent menuItems={menuItems} />;
}
