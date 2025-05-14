
import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// Ensure this URL is the correct "Publish to web" CSV export URL for your Google Sheet
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6P9RLviBEd9-MJetEer_exzZDGv1hBRLmq83sRN3WP07tVkF4zvxBEcF9ELmckqYza-le1O_rv3C7/pub?output=csv';

function parseCSV(csvText: string): Record<string, string>[] {
  console.log("API_ROUTE_PARSE_CSV: Received CSV text length:", csvText.length);
  const lines = csvText.trim().split(/\r\n|\n/);
  
  if (lines.length === 0) {
    console.warn("API_ROUTE_PARSE_CSV: CSV text is empty or only whitespace.");
    return [];
  }
  if (lines.length === 1 && lines[0].trim() === "") {
    console.warn("API_ROUTE_PARSE_CSV: CSV text is effectively empty after trim.");
    return [];
  }
  if (lines.length < 2 && lines.length > 0) {
     console.warn("API_ROUTE_PARSE_CSV: CSV text has less than 2 lines (only headers or less). Headers if present:", lines[0]);
     // If only headers, it's valid for parsing headers but will result in no data rows.
  }


  const headers = lines[0].split(',').map(header => header.trim());
  console.log("API_ROUTE_PARSE_CSV: Headers found:", headers);
  
  if (headers.length === 1 && headers[0] === '' && lines.length === 1) {
    console.warn("API_ROUTE_PARSE_CSV: CSV appears to be completely empty or malformed (single empty header).");
    return [];
  }

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
        console.log(`API_ROUTE_PARSE_CSV: Skipping empty line at index ${i}`);
        continue;
    }
    const values = lines[i].split(',').map(value => value.trim().replace(/^"|"$/g, ''));
    if (values.length === headers.length) {
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      jsonData.push(entry);
    } else {
      console.warn(`API_ROUTE_PARSE_CSV: Skipping malformed CSV line ${i + 1}. Expected ${headers.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  console.log(`API_ROUTE_PARSE_CSV: Parsed ${jsonData.length} data rows.`);
  return jsonData;
}

export async function GET() {
  console.log("API_ROUTE_GET_MENU: /api/menu GET handler called.");

  if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL.includes('YOUR_GOOGLE_SHEET_CSV_URL_HERE')) {
    console.error('API_ROUTE_GET_MENU: Google Sheet CSV URL is not configured correctly or is placeholder.');
    return NextResponse.json({ error: 'Google Sheet CSV URL is not configured on the server.' }, { status: 500 });
  }

  console.log(`API_ROUTE_GET_MENU: Fetching menu from Google Sheet URL: ${GOOGLE_SHEET_CSV_URL}`);

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL, {
      // For API routes, standard fetch cache headers are more common if caching is desired at this level.
      // Next.js fetch cache options (like next: { revalidate: ...}) are primarily for RSCs and server-side data fetching functions.
      // To ensure fresh data or control caching, you can use Cache-Control headers or no-cache.
      cache: 'no-store', // Ensures fresh fetch every time for debugging; adjust for production
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API_ROUTE_GET_MENU: Failed to fetch from Google Sheet. Status: ${response.status} ${response.statusText}. Response: ${errorText}`);
      return NextResponse.json({ error: `Failed to fetch menu from Google Sheet: ${response.statusText}` }, { status: response.status });
    }

    const csvText = await response.text();
    console.log("API_ROUTE_GET_MENU: Successfully fetched CSV data. Length:", csvText.length);

    if (!csvText.trim()) {
      console.warn('API_ROUTE_GET_MENU: Fetched CSV from Google Sheet is empty.');
      return NextResponse.json([], { status: 200 });
    }

    const parsedData = parseCSV(csvText);
    console.log(`API_ROUTE_GET_MENU: Parsed ${parsedData.length} items from CSV.`);

    const menuItems: MenuItemData[] = parsedData.map((item: Record<string, string>, index: number) => ({
      id: item.id || `item-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nameKey: item.nameKey || `menu:itemUnknown${index+1}.name`,
      descriptionKey: item.descriptionKey || `menu:itemUnknown${index+1}.description`,
      price: item.price || '$0.00',
      categoryKey: item.categoryKey || 'menu:category.uncategorized',
      imageUrl: item.imageUrl && (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')) 
                  ? item.imageUrl 
                  : `https://picsum.photos/seed/menuplaceholder${index}/400/300`,
      imageHint: item.imageHint || 'food item',
    })).filter(item => item.nameKey && item.categoryKey && !item.nameKey.startsWith('menu:itemUnknown') && item.categoryKey !== 'menu:category.uncategorized');
    
    console.log(`API_ROUTE_GET_MENU: Mapped to ${menuItems.length} valid MenuItemData objects. Sending response.`);
    if (menuItems.length === 0 && parsedData.length > 0) {
      console.warn("API_ROUTE_GET_MENU: All parsed items were filtered out. Check mapping logic and CSV headers (id, nameKey, descriptionKey, price, categoryKey, imageUrl, imageHint).");
    }


    return NextResponse.json(menuItems, { status: 200 });

  } catch (error: any) {
    console.error('API_ROUTE_GET_MENU: Unhandled error in /api/menu GET handler:', error.message, error.stack);
    return NextResponse.json({ error: `Internal server error: ${error.message}` }, { status: 500 });
  }
}
