
'use server';

import type { MenuItemData } from '@/data/menu';
// Directly import the core logic function from the API route file
import { fetchAndProcessMenuData } from '@/app/api/menu/route';

// This function is intended to be called from Server Components or other server-side logic.
export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  console.log("SERVICE_FETCH_MENU: Using direct call to fetchAndProcessMenuData (bypassing HTTP fetch).");

  try {
    // Directly call the extracted logic
    const menuItems: MenuItemData[] = await fetchAndProcessMenuData();
    const itemCount = Array.isArray(menuItems) ? menuItems.length : 0;

    console.log(`SERVICE_FETCH_MENU: Successfully processed ${itemCount} menu items via direct call.`);

    if (itemCount === 0) {
      console.warn(`SERVICE_FETCH_MENU: Direct call to fetchAndProcessMenuData resulted in 0 items. Check logs from 'API_ROUTE_LOGIC' in src/app/api/menu/route.ts for parsing details.`);
    } else if (!Array.isArray(menuItems)) {
      console.warn(`SERVICE_FETCH_MENU: Processed data via direct call is not an array or is null/undefined. Received:`, menuItems);
      return []; // Ensure we always return an array
    }
    return menuItems;

  } catch (error: any) {
    // This catch block might not be hit as often if errors are handled within fetchAndProcessMenuData,
    // but it's good to have for unexpected issues during the direct call itself.
    console.error(`SERVICE_FETCH_MENU: Error during direct call to fetchAndProcessMenuData. Error Type: ${error.name}, Message:`, error.message);
    if (error.cause) {
      console.error(`SERVICE_FETCH_MENU: Error cause:`, error.cause);
    }
    console.error(`SERVICE_FETCH_MENU: Full error object (direct call):`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error(`SERVICE_FETCH_MENU: Full error stack (if available, direct call):`, error.stack || error);
    return [];
  }
}
