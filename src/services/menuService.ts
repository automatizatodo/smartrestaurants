
'use server'; 

import type { MenuItemData } from '@/data/menu';

export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  // This function now fetches from the `/api/menu` route.
  // The actual Google Sheet fetching is handled by that API route.
  const internalApiUrl = '/api/menu'; 
  let fullApiUrl = internalApiUrl;

  // When running server-side (e.g. in a Server Component or another Server Action),
  // we need the full URL to fetch from our own API route.
  if (typeof window === 'undefined') {
    const host = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'); // Fallback to port 9002
    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL: ${fullApiUrl}`);
  } else {
    console.log(`SERVICE_FETCH_MENU: Running on client. Using relative API URL: ${fullApiUrl}`);
  }

  console.log(`SERVICE_FETCH_MENU: Attempting to fetch menu from ${fullApiUrl}`);

  try {
    const response = await fetch(fullApiUrl, { 
      next: { revalidate: 3600 } // Revalidate every hour for calls made via Next.js patched fetch
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SERVICE_FETCH_MENU: Failed to fetch menu from ${fullApiUrl}. Status: ${response.status} ${response.statusText}. Response body: ${errorText}`);
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
    console.error(`SERVICE_FETCH_MENU: Error fetching or parsing menu from ${fullApiUrl}:`, error.message, error.stack);
    return [];
  }
}

