
import MenuPageClientContent from './MenuPageClientContent';
import { fetchMenuData } from '@/services/menuService'; // Updated function name
// import type { PriceSummary } from '@/app/api/menu/route'; // No longer needed
import type { Metadata } from 'next';
// import restaurantConfig from '@/config/restaurant.config'; // No longer needed for price key

import caCommon from '@/locales/ca/common.json';
import caMenuPage from '@/locales/ca/page-specific/menu.json';

// Construct title for metadata
const menuPageTitle = caMenuPage.titleWithoutBrand || 'La Nostra Carta';
const restaurantContext = caCommon.seo.pageContext || 'Restaurant a Alp';

export const metadata: Metadata = {
  title: `${menuPageTitle} | ${caCommon.restaurantName} - ${restaurantContext}`,
  description: caMenuPage.description,
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: `${menuPageTitle} | ${caCommon.restaurantName} - ${restaurantContext}`,
    description: caMenuPage.description,
    url: (process.env.NEXT_PUBLIC_APP_URL || '') + '/menu',
    type: 'website',
  },
  twitter: {
    title: `${menuPageTitle} | ${caCommon.restaurantName} - ${restaurantContext}`,
    description: caMenuPage.description,
  },
};

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  // const { menuItems, currentMenuPrice, priceSummary } = await fetchMenuDataWithPrice(); // Old call
  const menuItems = await fetchMenuData(); // New call
  // const menuDelDiaPriceDescriptionKey = restaurantConfig.menuDelDia?.priceDescriptionKey; // Removed

  return (
    <MenuPageClientContent
      menuItems={menuItems}
      // currentMenuPrice, menuDelDiaPriceDescriptionKey, priceSummary props removed
    />
  );
}
