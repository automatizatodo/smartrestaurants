
'use server';

import type { MenuItemData } from '@/data/menu';

export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl;

  if (typeof window === 'undefined') {
    // Prefer VERCEL_URL if available (common in Vercel deployments)
    // Prefer NEXT_PUBLIC_APP_URL if set (useful for local or other deployments)
    // Fallback to 127.0.0.1 for local server-to-server calls
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://127.0.0.1:9002'); // Use 127.0.0.1 for local

    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL: ${fullApiUrl}`);
  } else {
    // Client-side, use relative path
    console.log(`SERVICE_FETCH_MENU: Running on client. Using relative API URL: ${fullApiUrl}`);
  }

  console.log(`SERVICE_FETCH_MENU: Attempting to fetch menu from ${fullApiUrl}`);

  try {
    const response = await fetch(fullApiUrl, {
      next: { revalidate: 3600 } // Revalidate every hour for calls made via Next.js patched fetch
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`SERVICE_FETCH_MENU: Failed to fetch menu from ${fullApiUrl}. Status: ${response.status} ${response.statusText}. Body: ${errorBody.substring(0, 500)}`);
      return [];
    }

    const menuItems: MenuItemData[] = await response.json();

    if (!Array.isArray(menuItems)) {
      console.error(`SERVICE_FETCH_MENU: Data received from ${fullApiUrl} is not an array. Received:`, menuItems);
      return [];
    }

    console.log(`SERVICE_FETCH_MENU: Successfully fetched and parsed ${menuItems.length} menu items from ${fullApiUrl}.`);
    return menuItems;

  } catch (error: any) {
    // Log the full error object for more details, especially for TypeError
    console.error(`SERVICE_FETCH_MENU: Error fetching or parsing menu from ${fullApiUrl}:`, error);
    if (error.cause) { // Node.js fetch often includes a 'cause' property for TypeErrors
        console.error(`SERVICE_FETCH_MENU: Fetch error cause:`, error.cause);
    }
    return [];
  }
}
