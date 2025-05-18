
'use server';

import type { MenuItemData } from '@/data/menu';
// Directly import the core logic function from the API route file
import { fetchAndProcessMenuData } from '@/app/api/menu/route';

interface MenuServiceResponse {
  menuItems: MenuItemData[];
  currentMenuPrice: string | null;
}

// This function is intended to be called from Server Components or other server-side logic.
export async function fetchMenuDataWithPrice(): Promise<MenuServiceResponse> {
  // console.log("SERVICE_FETCH_MENU: Using direct call to fetchAndProcessMenuData (bypassing HTTP fetch).");

  try {
    // Directly call the extracted logic
    const result: MenuServiceResponse = await fetchAndProcessMenuData();
    const itemCount = Array.isArray(result.menuItems) ? result.menuItems.length : 0;

    // console.log(\`SERVICE_FETCH_MENU: Successfully processed \${itemCount} menu items and price \${result.currentMenuPrice} via direct call.\`);

    if (itemCount === 0 && !result.currentMenuPrice) { 
      console.warn(\`SERVICE_FETCH_MENU: Direct call to fetchAndProcessMenuData resulted in 0 items and no price. Check logs from 'API_ROUTE_LOGIC_MENU' in src/app/api/menu/route.ts for parsing details.\`);
    } else if (!Array.isArray(result.menuItems)) {
      console.warn(\`SERVICE_FETCH_MENU: Processed menuItems via direct call is not an array or is null/undefined. Received:\`, result.menuItems);
      return { menuItems: [], currentMenuPrice: result.currentMenuPrice }; // Ensure we always return an array for menuItems
    }
    return result;

  } catch (error: any) {
    console.error(\`SERVICE_FETCH_MENU: Error during direct call to fetchAndProcessMenuData. Error Type: \${error.name}, Message:\`, error.message);
    if (error.cause) {
      console.error(\`SERVICE_FETCH_MENU: Error cause:\`, error.cause);
    }
    console.error(\`SERVICE_FETCH_MENU: Full error object (direct call):\`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error(\`SERVICE_FETCH_MENU: Full error stack (if available, direct call):\`, error.stack || error);
    return { menuItems: [], currentMenuPrice: null };
  }
}
