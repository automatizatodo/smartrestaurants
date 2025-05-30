
'use server';

import type { MenuItemData } from '@/data/menu';
import type { PriceSummary } from '@/app/api/menu/route';
import { fetchAndProcessMenuData } from '@/app/api/menu/route';

export interface MenuDetailsResponse {
  menuItems: MenuItemData[];
  currentMenuPrice: string | null;
  priceSummary: PriceSummary;
}

// Renamed from fetchMenuData to fetchMenuDetails
export async function fetchMenuDetails(): Promise<MenuDetailsResponse> {
  // console.log("SERVICE_FETCH_MENU_DETAILS: Using direct call to fetchAndProcessMenuData.");

  try {
    const result = await fetchAndProcessMenuData();
    const { allMenuItems, currentMenuPrice, priceSummary } = result;
    const itemCount = Array.isArray(allMenuItems) ? allMenuItems.length : 0;

    // console.log(SERVICE_FETCH_MENU_DETAILS: Processed ${itemCount} total menu items via direct call.);
    // console.log(SERVICE_FETCH_MENU_DETAILS: Current Menu Price: ${currentMenuPrice});
    // console.log(SERVICE_FETCH_MENU_DETAILS: Price Summary: ${JSON.stringify(priceSummary)});


    if (itemCount === 0 && !currentMenuPrice) {
      // console.warn("SERVICE_FETCH_MENU_DETAILS: Direct call to fetchAndProcessMenuData resulted in 0 items and no price. Check logs from 'API_ROUTE_LOGIC_MENU' in src/app/api/menu/route.ts for parsing details.");
    } else if (!Array.isArray(allMenuItems)) {
      // console.warn("SERVICE_FETCH_MENU_DETAILS: Processed allMenuItems via direct call is not an array or is null/undefined. Received:", allMenuItems);
      return { menuItems: [], currentMenuPrice, priceSummary };
    }
    return { menuItems: allMenuItems, currentMenuPrice, priceSummary };

  } catch (error: any) {
    console.error("SERVICE_FETCH_MENU_DETAILS: Error during direct call to fetchAndProcessMenuData. Error Type: " + error.name + ", Message:", error.message);
    // if (error.cause) {
      // console.error("SERVICE_FETCH_MENU_DETAILS: Error cause:", error.cause);
    // }
    // console.error("SERVICE_FETCH_MENU_DETAILS: Full error object (direct call):", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    // console.error("SERVICE_FETCH_MENU_DETAILS: Full error stack (if available, direct call):", error.stack || error);
    return { menuItems: [], currentMenuPrice: null, priceSummary: {} };
  }
}
