
'use server';

import type { MenuItemData } from '@/data/menu';
// import type { PriceSummary } from '@/app/api/menu/route'; // No longer needed
// Directly import the core logic function from the API route file
import { fetchAndProcessMenuData } from '@/app/api/menu/route';

interface MenuServiceResponse {
  menuItems: MenuItemData[];
  // currentMenuPrice and priceSummary removed
}

// This function is intended to be called from Server Components or other server-side logic.
// Renamed from fetchMenuDataWithPrice to fetchMenuData
export async function fetchMenuData(): Promise<MenuItemData[]> {
  // console.log("SERVICE_FETCH_MENU: Using direct call to fetchAndProcessMenuData.");

  try {
    // Directly call the extracted logic
    // The fetchAndProcessMenuData function now returns an object { menuItems, currentMenuPrice, priceSummary }
    // We only need menuItems here now.
    const result = await fetchAndProcessMenuData();
    const menuItems = result.menuItems;
    const itemCount = Array.isArray(menuItems) ? menuItems.length : 0;

    // console.log(`SERVICE_FETCH_MENU: Processed ${itemCount} menu items via direct call.`);

    if (itemCount === 0) {
      // console.warn("SERVICE_FETCH_MENU: Direct call to fetchAndProcessMenuData resulted in 0 items. Check logs from 'API_ROUTE_LOGIC_MENU' in src/app/api/menu/route.ts for parsing details.");
    } else if (!Array.isArray(menuItems)) {
      // console.warn("SERVICE_FETCH_MENU: Processed menuItems via direct call is not an array or is null/undefined. Received:", menuItems);
      return []; // Ensure we always return an array for menuItems
    }
    return menuItems;

  } catch (error: any) {
    console.error("SERVICE_FETCH_MENU: Error during direct call to fetchAndProcessMenuData. Error Type: " + error.name + ", Message:", error.message);
    // if (error.cause) {
      // console.error("SERVICE_FETCH_MENU: Error cause:", error.cause);
    // }
    // console.error("SERVICE_FETCH_MENU: Full error object (direct call):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    // console.error("SERVICE_FETCH_MENU: Full error stack (if available, direct call):", error.stack || error);
    return [];
  }
}
