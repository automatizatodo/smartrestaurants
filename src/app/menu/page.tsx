
import Header from '@/components/landing/Header'; // Still needed if MenuPageClientContent is structured differently
import Footer from '@/components/landing/Footer'; // Still needed
import { fetchMenuFromGoogleSheet } from '@/services/menuService';
import type { MenuItemData } from '@/data/menu';
import MenuPageClientContent from './MenuPageClientContent'; // New client component for UI logic

// Metadata can be generated here if needed (static or using fetched data)
// import type { Metadata } from 'next';
// import enCommon from '@/locales/en/common.json';
// export const metadata: Metadata = {
//   title: `${enCommon['page.menu.title']} | ${enCommon.restaurantName}`,
//   description: enCommon['page.menu.description'].replace('{restaurantName}', enCommon.restaurantName),
// };

export default async function MenuPage() {
  const menuItems: MenuItemData[] = await fetchMenuFromGoogleSheet();

  return <MenuPageClientContent menuItems={menuItems} />;
}
