
'use server';

import type { MenuItemData } from '@/data/menu';

// This function is intended to be called from Server Components or other server-side logic.
export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl; // Default for client-side scenarios

  if (typeof window === 'undefined') { // Server-side
    let host: string;
    const servicePort = process.env.PORT; // Standard port env var for many PaaS (like App Hosting)
    const devPort = '9003'; // Defined in package.json "dev" script

    if (process.env.K_SERVICE && servicePort) {
      // Production on Google Cloud (App Hosting / Cloud Run uses K_SERVICE)
      // Internal calls should be HTTP to the servicePort on 127.0.0.1
      host = `http://127.0.0.1:${servicePort}`;
      console.log(`SERVICE_FETCH_MENU: Detected Google Cloud managed environment. Internal host set to: ${host}`);
    } else if (process.env.NODE_ENV === 'development') {
      // For local development, use localhost and the dev port.
      host = `http://localhost:${devPort}`; // Reverted to localhost for local dev as per previous findings
      console.log(`SERVICE_FETCH_MENU: Running on server in development. Internal host set to: ${host}. (Dev port from package.json: ${devPort})`);
    } else {
      // Fallback for other server environments (like Firebase App Hosting if not K_SERVICE)
      // Ensure it's HTTP for internal calls in production-like environments if PORT is present.
      const fallbackPort = servicePort || '8080';
      const protocol = servicePort ? 'http' : 'http'; // Default to http for internal
      host = `${protocol}://127.0.0.1:${fallbackPort}`;
      console.log(`SERVICE_FETCH_MENU: Running on server in generic/unknown environment. Internal host set to: ${host}. (Service port: ${fallbackPort})`);
    }
    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL for internal fetch: ${fullApiUrl}. (Env: ${process.env.NODE_ENV}, PORT: ${process.env.PORT}, K_SERVICE: ${process.env.K_SERVICE})`);
  } else { // Client-side
    fullApiUrl = internalApiUrl; // Relative path for client-side fetches
    // console.log(`SERVICE_FETCH_MENU: Running on client. Using relative API URL for fetch: ${fullApiUrl}`);
  }

  const fetchOptions: RequestInit = {};

  if (typeof window === 'undefined') { // Server-side fetch options
    fetchOptions.cache = 'no-store'; // Ensures fresh data from the API route.
  } else { // Client-side fetch options (if this function were ever called client-side)
    fetchOptions.cache = 'default'; // Or whatever caching strategy is appropriate for client
  }

  console.log(`SERVICE_FETCH_MENU: PRE-FETCH LOG: Attempting to fetch menu from ${fullApiUrl} with options:`, JSON.stringify(fetchOptions));

  try {
    const response = await fetch(fullApiUrl, fetchOptions);

    // Log response status and a snippet of the body for non-OK responses
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

      if (itemCount === 0 && response.ok) {
        console.warn(`SERVICE_FETCH_MENU: Parsed data is an empty array from ${fullApiUrl}. This might be due to issues in /api/menu (e.g. Google Sheet parsing) or the Google Sheet itself being empty/filtered.`);
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
      // THIS IS THE MOST IMPORTANT LOG TO CHECK FOR "fetch failed"
      console.error(`SERVICE_FETCH_MENU: Fetch error cause:`, error.cause);
    }
    // Log the full error object to see all available properties, especially for 'fetch failed'
    console.error(`SERVICE_FETCH_MENU: Full error stack (if available):`, error.stack || error);
    return [];
  }
}
