
import MenuPageClientContent from './MenuPageClientContent';
import { fetchMenuDataWithPrice } from '@/services/menuService';
import type { PriceSummary } from '@/app/api/menu/route';
import type { Metadata } from 'next';
import restaurantConfig from '@/config/restaurant.config';

import caCommon from '@/locales/ca/common.json';
import caMenuPage from '@/locales/ca/page-specific/menu.json';

// Construct title for metadata
const menuPageTitle = caMenuPage.titleWithoutBrand || 'Menú del Dia i Carta';
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
  const { menuItems, currentMenuPrice, priceSummary } = await fetchMenuDataWithPrice();
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
