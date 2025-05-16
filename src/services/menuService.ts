
'use server';

import type { MenuItemData } from '@/data/menu';

export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl;

  if (typeof window === 'undefined') {
    // Server-side
    let host: string;
    const servicePort = process.env.PORT || '8080'; // PORT is set by App Hosting and similar environments

    // K_SERVICE is a common environment variable in Google Cloud managed services (like Cloud Run, which App Hosting uses)
    // NODE_ENV might also be 'production' in these environments.
    if (process.env.K_SERVICE || (process.env.NODE_ENV === 'production' && process.env.PORT)) {
      host = `http://127.0.0.1:${servicePort}`;
      console.log(`SERVICE_FETCH_MENU: Detected Google Cloud managed/production environment. Internal host set to: ${host}`);
    } else if (process.env.NODE_ENV === 'development') {
      // Local development via 'npm run dev'
      const devPort = '9003'; // Match the port in your package.json dev script
      host = `http://127.0.0.1:${devPort}`;
      console.log(`SERVICE_FETCH_MENU: Running on server in development. Internal host set to: ${host}`);
    } else {
      // Fallback for other server environments, assuming http and a common port
      host = `http://127.0.0.1:${servicePort}`;
      console.log(`SERVICE_FETCH_MENU: Running on server in generic environment. Internal host set to: ${host}`);
    }

    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL for internal fetch: ${fullApiUrl}. (Detected port: ${servicePort}, Env: ${process.env.NODE_ENV})`);

  } else {
    // Client-side, use relative path
    console.log(`SERVICE_FETCH_MENU: Running on client. Using relative API URL: ${fullApiUrl}`);
  }

  console.log(`SERVICE_FETCH_MENU: Attempting to fetch menu from ${fullApiUrl}`);

  try {
    const response = await fetch(fullApiUrl, {
      cache: 'no-store', // Ensure fresh data
    });

    console.log(`SERVICE_FETCH_MENU: Response status from ${fullApiUrl}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.text();
      } catch (e) {
        // Ignore
      }
      console.error(`SERVICE_FETCH_MENU: Failed to fetch menu. Status: ${response.status} ${response.statusText}. URL: ${fullApiUrl}. Body: ${errorBody.substring(0, 500)}`);
      return [];
    }

    const menuItems: MenuItemData[] = await response.json();
    const itemCount = Array.isArray(menuItems) ? menuItems.length : 0;

    console.log(`SERVICE_FETCH_MENU: Successfully fetched and parsed ${itemCount} menu items from ${fullApiUrl}.`);

    if (itemCount > 0) {
      console.log(`SERVICE_FETCH_MENU: First item preview:`, JSON.stringify(menuItems[0], null, 2));
    } else if (itemCount === 0) {
      console.log(`SERVICE_FETCH_MENU: Parsed data is an empty array from ${fullApiUrl}. This might be due to issues in /api/menu or the Google Sheet itself.`);
    } else {
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
    // Log the full error object to see all available properties
    console.error(`SERVICE_FETCH_MENU: Full error object:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return [];
  }
}
