
import MenuPageClientContent from './MenuPageClientContent';
import { fetchMenuDataWithPrice } from '@/services/menuService';
import type { PriceSummary } from '@/app/api/menu/route';
import type { Metadata } from 'next';
import restaurantConfig from '@/config/restaurant.config';

import caCommon from '@/locales/ca/common.json';
import caMenuPage from '@/locales/ca/page-specific/menu.json';

// Construct title for metadata
const menuPageTitle = caMenuPage.titleWithoutBrand || 'Menú del Dia'; // Updated fallback
const restaurantContext = caCommon.seo.pageContext || 'Restaurant a Sabadell';

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
  console.log("MENU_PAGE_SERVER_COMPONENT: Fetching menu data...");
  const { menuItems, currentMenuPrice, priceSummary } = await fetchMenuDataWithPrice();
  console.log("MENU_PAGE_SERVER_COMPONENT: Menu items fetched:", menuItems ? menuItems.length : 0, "Current Price:", currentMenuPrice);

  const menuDelDiaPriceDescriptionKey = restaurantConfig.menuDelDia?.priceDescriptionKey;

  return (
    <MenuPageClientContent
      menuItems={menuItems}
      currentMenuPrice={currentMenuPrice}
      menuDelDiaPriceDescriptionKey={menuDelDiaPriceDescriptionKey}
      priceSummary={priceSummary}
    />
  );
}
