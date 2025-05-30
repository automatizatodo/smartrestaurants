
import MenuPageClientContent from './MenuPageClientContent';
import { fetchMenuDetails } from '@/services/menuService'; // Updated function name
import type { PriceSummary } from '@/app/api/menu/route';
import type { Metadata } from 'next';

import caCommon from '@/locales/ca/common.json';
import caMenuPage from '@/locales/ca/page-specific/menu.json';

// Construct title for metadata
const menuPageTitle = caMenuPage.titleWithoutBrand || 'La Nostra Carta';
const restaurantContext = caCommon.seo.pageContext || 'Restaurant a Alp';

export const metadata: Metadata = {
  title: menuPageTitle + " | " + caCommon.restaurantName + " - " + restaurantContext,
  description: caMenuPage.description,
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: menuPageTitle + " | " + caCommon.restaurantName + " - " + restaurantContext,
    description: caMenuPage.description,
    url: (process.env.NEXT_PUBLIC_APP_URL || '') + '/menu',
    type: 'website',
  },
  twitter: {
    title: menuPageTitle + " | " + caCommon.restaurantName + " - " + restaurantContext,
    description: caMenuPage.description,
  },
};

export const dynamic = 'force-dynamic';

export default async function MenuPage() {
  const { menuItems: allMenuItems, currentMenuPrice, priceSummary } = await fetchMenuDetails();

  // Filter for "Carta" items (all visible items)
  const cartaItems = allMenuItems.filter(item => item.isVisible);

  return (
    <MenuPageClientContent
      menuItems={cartaItems}
      // Pass currentMenuPrice and priceSummary if you want to display them on the carta page,
      // otherwise, they are primarily for the "Menú del Dia" on the homepage.
      // For a "Carta", typically individual prices are shown per item, so these might not be needed here.
      currentMenuPrice={currentMenuPrice} // Can be removed if not used by MenuPageClientContent for Carta
      priceSummary={priceSummary} // Can be removed if not used by MenuPageClientContent for Carta
    />
  );
}
