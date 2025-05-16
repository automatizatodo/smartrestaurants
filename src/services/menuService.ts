
'use server';

import type { MenuItemData } from '@/data/menu';

// This function is intended to be called from Server Components or other server-side logic.
export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl; // Default for client-side scenarios, though this service is server-only.

  // This block should only execute on the server.
  if (typeof window === 'undefined') {
    let host: string;
    const servicePort = process.env.PORT; // Standard port env var for many PaaS (like App Hosting)
    const devPort = '9003'; // Defined in package.json "dev" script

    if (process.env.K_SERVICE && servicePort) {
      // Production on Google Cloud (App Hosting / Cloud Run uses K_SERVICE)
      // Internal calls should be HTTP to the servicePort on 127.0.0.1
      host = `http://127.0.0.1:${servicePort}`;
      console.log(`SERVICE_FETCH_MENU: Detected Google Cloud managed environment. Internal host set to: ${host}`);
    } else if (process.env.NODE_ENV === 'development') {
      // Local development
      host = `http://localhost:${devPort}`; // Reverted to localhost for local dev
      console.log(`SERVICE_FETCH_MENU: Running on server in development. Internal host set to: ${host}. (Dev port: ${devPort})`);
    } else {
      // Fallback for other server environments or if PORT isn't set in production.
      // This might need adjustment based on the specific deployment.
      const fallbackPort = servicePort || '8080'; // Default to 8080 if PORT not set
      host = `http://127.0.0.1:${fallbackPort}`; // Defaulting to 127.0.0.1 for other server environments
      console.log(`SERVICE_FETCH_MENU: Running on server in generic/unknown environment. Internal host set to: ${host}. (Service port: ${fallbackPort})`);
    }
    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL for internal fetch: ${fullApiUrl}. (Env: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}, K_SERVICE: ${process.env.K_SERVICE})`);
  } else {
    // This case should ideally not be hit if called from server components.
    console.warn(`SERVICE_FETCH_MENU: fetchMenuFromGoogleSheet was called from client-side? This is unexpected. Using relative API URL: ${fullApiUrl}`);
  }

  console.log(`SERVICE_FETCH_MENU: PRE-FETCH LOG: Attempting to fetch menu from ${fullApiUrl}`);

  try {
    const response = await fetch(fullApiUrl, {
      cache: 'no-store', // Ensures fresh data for internal API calls, causes dynamic rendering for pages using it.
    });

    console.log(`SERVICE_FETCH_MENU: Response status from ${fullApiUrl}: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorBody = 'Could not read error body';
      try {
        errorBody = await response.text();
      } catch (e) {
        // Ignore if reading error body fails
      }
      console.error(`SERVICE_FETCH_MENU: Failed to fetch menu from ${fullApiUrl}. Status: ${response.status} ${response.statusText}. Body (preview): ${errorBody.substring(0, 500)}`);
      return [];
    }

    // Check content type before parsing as JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
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
    } else {
        const textResponse = await response.text();
        console.error(`SERVICE_FETCH_MENU: Expected JSON response from ${fullApiUrl} but received content type: ${contentType}. Response text (preview): ${textResponse.substring(0, 500)}`);
        return [];
    }

  } catch (error: any) {
    console.error(`SERVICE_FETCH_MENU: Error during fetch or JSON parsing from ${fullApiUrl}. Error Type: ${error.name}, Message:`, error.message);
    if (error.cause) {
      // The 'cause' property often contains more specific network or system-level error details
      console.error(`SERVICE_FETCH_MENU: Fetch error cause:`, error.cause);
    }
    // Log the full error object to see all available properties, especially for 'fetch failed'
    console.error(`SERVICE_FETCH_MENU: Full error object (if available):`, error);
    return [];
  }
}
