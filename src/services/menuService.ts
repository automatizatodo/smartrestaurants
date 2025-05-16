
'use server';

import type { MenuItemData } from '@/data/menu';

export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl;

  if (typeof window === 'undefined') {
    // Server-side: construct the full URL
    const devPort = process.env.PORT || '9003'; // Get port from env or default to 9003
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    // For Cloud Workstations or similar, process.env.NEXT_PUBLIC_APP_URL might be set to the external URL.
    // For local development, we typically want 127.0.0.1 or localhost.
    let defaultHost = `${protocol}://127.0.0.1:${devPort}`;
    
    // If NEXT_PUBLIC_APP_URL is set and we are in development, it might be the proxied URL.
    // However, for server-to-server internal API calls, 127.0.0.1 is usually more reliable if NEXT_PUBLIC_APP_URL points to an external address.
    // If VERCEL_URL is present, it's a Vercel deployment, use it.
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') && !process.env.NEXT_PUBLIC_APP_URL.includes('127.0.0.1')
          ? process.env.NEXT_PUBLIC_APP_URL // Use if it's a non-local public URL
          : defaultHost); // Otherwise, default to local for server-side fetch

    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL for internal fetch: ${fullApiUrl}. (Dev port from env/default: ${devPort})`);
  } else {
    // Client-side, use relative path which is fine.
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
    console.error(`SERVICE_FETCH_MENU: Error fetching or parsing menu from ${fullApiUrl}. Error Message:`, error.message);
    if (error.cause) {
        console.error(`SERVICE_FETCH_MENU: Fetch error cause:`, error.cause);
    }
    // Logging the full error object can sometimes give more clues, especially with undici/Node fetch
    console.error(`SERVICE_FETCH_MENU: Full error object for fetch to ${fullApiUrl}:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return [];
  }
}
