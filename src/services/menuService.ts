'use server';

import type { MenuItemData } from '@/data/menu';

export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  const internalApiUrl = '/api/menu';
  let fullApiUrl = internalApiUrl;

  if (typeof window === 'undefined') {
    // Server-side: construct the full URL
    const devPort = process.env.PORT || '9003'; // Get port from env or default
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // Changed 127.0.0.1 to localhost for potentially better local resolution
    let defaultHost = `${protocol}://localhost:${devPort}`; 
    
    const host = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL && !process.env.NEXT_PUBLIC_APP_URL.includes('localhost') && !process.env.NEXT_PUBLIC_APP_URL.includes('127.0.0.1')
          ? process.env.NEXT_PUBLIC_APP_URL 
          : defaultHost); 

    fullApiUrl = `${host}${internalApiUrl}`;
    console.log(`SERVICE_FETCH_MENU: Running on server. Using full API URL for internal fetch: ${fullApiUrl}. (Dev port from env/default: ${devPort})`);
  } else {
    // Client-side, use relative path
    console.log(`SERVICE_FETCH_MENU: Running on client. Using relative API URL: ${fullApiUrl}`);
  }

  console.log(`SERVICE_FETCH_MENU: Attempting to fetch menu from ${fullApiUrl}`);

  try {
    const response = await fetch(fullApiUrl, {
      cache: 'no-store', 
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
    
    console.log(`SERVICE_FETCH_MENU: Successfully fetched and parsed ${menuItems.length} menu items from ${fullApiUrl}.`);
    
    if (menuItems.length > 0) {
        console.log(`SERVICE_FETCH_MENU: First item preview:`, JSON.stringify(menuItems[0], null, 2));
    } else if (response.headers.get("content-type")?.includes("text/html")){
        console.warn(`SERVICE_FETCH_MENU: Expected JSON but received HTML from ${fullApiUrl}. This might indicate an error page from the API route.`);
    } else {
        console.log(`SERVICE_FETCH_MENU: Parsed data is an empty array from ${fullApiUrl}.`);
    }
    return menuItems;

  } catch (error: any) {
    console.error(`SERVICE_FETCH_MENU: Error during fetch or JSON parsing from ${fullApiUrl}. Error Type: ${error.name}, Message:`, error.message);
    if (error.cause) { 
        console.error(`SERVICE_FETCH_MENU: Fetch error cause:`, error.cause);
    }
    // Output the full error object for more details, especially for fetch errors
    console.error(`SERVICE_FETCH_MENU: Full error object:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
    console.error(`SERVICE_FETCH_MENU: Full error stack (if available):`, error.stack);
    return [];
  }
}
