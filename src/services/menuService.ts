
'use server';

import type { MenuItemData } from '@/data/menu';

export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl; // Default for client-side

  if (typeof window === 'undefined') {
    // Server-side
    let host: string;
    const servicePort = process.env.PORT || '8080'; // Default for App Hosting or similar PaaS

    if (process.env.K_SERVICE || (process.env.NODE_ENV === 'production' && process.env.PORT)) {
      // Production environment (like Google Cloud Run / App Hosting)
      // Internal calls should be HTTP to the servicePort on 127.0.0.1
      host = `http://127.0.0.1:${servicePort}`;
      console.log(`SERVICE_FETCH_MENU: Detected Google Cloud managed/production environment. Internal host set to: ${host}`);
    } else if (process.env.NODE_ENV === 'development') {
      // Local development via 'npm run dev'
      const devPort = '9003'; // Match the port in your package.json dev script
      host = `http://localhost:${devPort}`; // Reverted to localhost for local dev
      console.log(`SERVICE_FETCH_MENU: Running on server in development. Internal host set to: ${host}. (Dev port: ${devPort})`);
    } else {
      // Fallback for other server environments, might need adjustment
      host = `http://127.0.0.1:${servicePort}`;
      console.log(`SERVICE_FETCH_MENU: Running on server in generic environment. Internal host set to: ${host}. (Service port: ${servicePort})`);
    }
    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL for internal fetch: ${fullApiUrl}. (Env: ${process.env.NODE_ENV})`);
  } else {
    // Client-side, use relative path
    console.log(`SERVICE_FETCH_MENU: Running on client. Using relative API URL: ${fullApiUrl}`);
  }

  console.log(`SERVICE_FETCH_MENU: Attempting to fetch menu from ${fullApiUrl}`);

  try {
    const response = await fetch(fullApiUrl, {
      // For server-side fetches to own API routes, revalidation strategy might differ.
      // Using 'no-store' ensures freshness but opts out of caching.
      // For local dev, this is fine. For production, consider if this is appropriate.
      cache: 'no-store',
    });

    console.log(`SERVICE_FETCH_MENU: Response status from ${fullApiUrl}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.text();
      } catch (e) {
        // Ignore if reading error body fails
      }
      console.error(`SERVICE_FETCH_MENU: Failed to fetch menu. Status: ${response.status} ${response.statusText}. URL: ${fullApiUrl}. Body (preview): ${errorBody.substring(0, 500)}`);
      return [];
    }

    const menuItems: MenuItemData[] = await response.json();
    const itemCount = Array.isArray(menuItems) ? menuItems.length : 0;

    console.log(`SERVICE_FETCH_MENU: Successfully fetched and parsed ${itemCount} menu items from ${fullApiUrl}.`);

    if (itemCount > 0) {
      // console.log(`SERVICE_FETCH_MENU: First item preview:`, JSON.stringify(menuItems[0], null, 2));
    } else if (itemCount === 0 && response.ok) {
      console.log(`SERVICE_FETCH_MENU: Parsed data is an empty array from ${fullApiUrl}. This might be due to issues in /api/menu (e.g. Google Sheet parsing) or the Google Sheet itself being empty/filtered.`);
    } else if (!Array.isArray(menuItems)) {
      console.warn(`SERVICE_FETCH_MENU: Parsed data from ${fullApiUrl} is not an array or is null/undefined. Received:`, menuItems);
      return []; // Ensure we always return an array
    }
    return menuItems;

  } catch (error: any) {
    console.error(`SERVICE_FETCH_MENU: Error during fetch or JSON parsing from ${fullApiUrl}. Error Type: ${error.name}, Message:`, error.message);
    if (error.cause) {
      // The 'cause' property often contains more specific network or system-level error details
      console.error(`SERVICE_FETCH_MENU: Fetch error cause:`, error.cause);
    }
    // Log the full error object to see all available properties, especially for 'fetch failed'
    console.error(`SERVICE_FETCH_MENU: Full error stack (if available):`, error.stack || error);
    return [];
  }
}
