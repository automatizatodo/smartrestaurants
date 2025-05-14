
import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// --- Configuration for Google Sheets ---
// IMPORTANT: Replace this with your Google Spreadsheet ID
const SPREADSHEET_ID = '1zXWQRP-YsyM_8pii8xPXV29ao9SvkC5BJjM0S2kVviI';

// IMPORTANT: You need to find the GID for each sheet.
// How to find GID:
// 1. Open your Google Sheet.
// 2. Click on the tab for the sheet (e.g., "Entrantes").
// 3. Look at the URL in the browser's address bar. It will end with something like #gid=123456789. That number is the GID.
//    - The first sheet created usually has GID=0.
const SHEETS_CONFIG = [
  { name: 'Entrantes', gid: '0', categoryKey: 'menu:category.starters', expectedHeaders: ["Nombre del Plato", "Descripción", "Precio (€)"] }, // Replace '0' with actual GID if not the first sheet
  { name: 'Platos Principales', gid: 'GID_PLATOS_PRINCIPALES', categoryKey: 'menu:category.mainCourses', expectedHeaders: ["Nombre del Plato", "Descripción", "Precio (€)"] },
  { name: 'Postres', gid: 'GID_POSTRES', categoryKey: 'menu:category.desserts', expectedHeaders: ["Nombre del Plato", "Descripción", "Precio (€)"] },
  { name: 'Bebidas', gid: 'GID_BEBIDAS', categoryKey: 'menu:category.drinks', expectedHeaders: ["Nombre de la Bebida", "Descripción", "Precio (€)"] },
];

// Column names from your sheets
const NAME_COLUMN_ES = "Nombre del Plato";
const DRINK_NAME_COLUMN_ES = "Nombre de la Bebida";
const DESCRIPTION_COLUMN_ES = "Descripción";
const PRICE_COLUMN_ES = "Precio (€)";


function parseCSV(csvText: string, expectedHeaders: string[]): Record<string, string>[] {
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

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  console.log(`API_ROUTE_PARSE_CSV: Headers found in sheet: ${headersFromSheet.join(", ")}`);
  console.log(`API_ROUTE_PARSE_CSV: Expected headers: ${expectedHeaders.join(", ")}`);

  // Validate headers
  let validHeaders = true;
  const headerMap: Record<string, string> = {};

  expectedHeaders.forEach(expectedHeader => {
    if (!headersFromSheet.includes(expectedHeader)) {
      console.warn(`API_ROUTE_PARSE_CSV: Missing expected header '${expectedHeader}' in sheet. Found: ${headersFromSheet.join(", ")}`);
      validHeaders = false;
    }
  });

  if (!validHeaders && !expectedHeaders.every(eh => headersFromSheet.includes(eh))) {
     console.warn(`API_ROUTE_PARSE_CSV: Header mismatch. Sheet might not conform to expected structure for this category. Expected: ${expectedHeaders.join(", ")}, Got: ${headersFromSheet.join(", ")}`);
     // Depending on strictness, you might want to return [] here or try to parse anyway if some headers match
     // For now, we'll try to proceed if at least one expected header is present, but log a strong warning.
     if (!expectedHeaders.some(eh => headersFromSheet.includes(eh))) {
        return [];
     }
  }
  
  // Create a map for actual header names to standardized keys (e.g., "Nombre del Plato" -> "name")
  // This is useful if you want to abstract column names later. For now, we'll use direct access.

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
        console.log(`API_ROUTE_PARSE_CSV: Skipping empty line at index ${i}`);
        continue;
    }
    const values = lines[i].split(',').map(value => value.trim().replace(/^"|"$/g, ''));
    if (values.length === headersFromSheet.length) {
      const entry: Record<string, string> = {};
      headersFromSheet.forEach((header, index) => {
        entry[header] = values[index];
      });
      jsonData.push(entry);
    } else {
      console.warn(`API_ROUTE_PARSE_CSV: Skipping malformed CSV line ${i + 1} for sheet. Expected ${headersFromSheet.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  console.log(`API_ROUTE_PARSE_CSV: Parsed ${jsonData.length} data rows for one sheet.`);
  return jsonData;
}

export async function GET() {
  console.log("API_ROUTE_GET_MENU: /api/menu GET handler called.");
  let allMenuItems: MenuItemData[] = [];

  for (const sheetConfig of SHEETS_CONFIG) {
    if (sheetConfig.gid === `GID_${sheetConfig.name.toUpperCase().replace(/\s/g, '_')}`) {
      console.warn(`API_ROUTE_GET_MENU: Placeholder GID used for sheet "${sheetConfig.name}". Please update with actual GID in SHEETS_CONFIG.`);
      continue; // Skip fetching if placeholder GID is used
    }

    const googleSheetCsvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetConfig.gid}`;
    console.log(`API_ROUTE_GET_MENU: Fetching menu for category '${sheetConfig.name}' from Google Sheet URL: ${googleSheetCsvUrl}`);

    try {
      const response = await fetch(googleSheetCsvUrl, {
        cache: 'no-store', // Ensures fresh fetch every time
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API_ROUTE_GET_MENU: Failed to fetch from Google Sheet for category '${sheetConfig.name}'. Status: ${response.status} ${response.statusText}. URL: ${googleSheetCsvUrl}. Response: ${errorText}`);
        continue; // Skip to next sheet
      }

      const csvText = await response.text();
      console.log(`API_ROUTE_GET_MENU: Successfully fetched CSV data for '${sheetConfig.name}'. Length: ${csvText.length}`);

      if (!csvText.trim()) {
        console.warn(`API_ROUTE_GET_MENU: Fetched CSV from Google Sheet for '${sheetConfig.name}' is empty. URL: ${googleSheetCsvUrl}`);
        continue; // Skip to next sheet
      }

      const parsedData = parseCSV(csvText, sheetConfig.expectedHeaders);
      console.log(`API_ROUTE_GET_MENU: Parsed ${parsedData.length} items from CSV for '${sheetConfig.name}'.`);

      const nameColumn = sheetConfig.categoryKey === 'menu:category.drinks' ? DRINK_NAME_COLUMN_ES : NAME_COLUMN_ES;

      const categoryItems: MenuItemData[] = parsedData.map((item: Record<string, string>, index: number) => {
        const itemName = item[nameColumn] || `Unnamed Item ${index + 1}`;
        const itemDescription = item[DESCRIPTION_COLUMN_ES] || `Description for ${itemName}`;
        
        // Price formatting: "X,XX" or "X.XX" to "€X.XX"
        let price = item[PRICE_COLUMN_ES] || '0.00';
        price = price.replace(',', '.'); // Ensure decimal point is a period
        if (!price.includes('€')) {
            price = `€${price}`;
        }
        
        // For nameKey and descriptionKey, we'll use the Spanish text directly from the sheet.
        // For a fully internationalized app, you'd generate unique keys and add them to locale files.
        return {
          id: `${sheetConfig.categoryKey}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          nameKey: itemName, // Using direct Spanish name as key for now
          descriptionKey: itemDescription, // Using direct Spanish description as key
          price: price,
          categoryKey: sheetConfig.categoryKey,
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(itemName.substring(0,10))}${index}/400/300`,
          imageHint: `${sheetConfig.name.toLowerCase()} food item`, // Generic hint
        };
      }).filter(item => item.nameKey && !item.nameKey.startsWith('Unnamed Item')); // Filter out items that likely failed to parse name
      
      console.log(`API_ROUTE_GET_MENU: Mapped to ${categoryItems.length} valid MenuItemData objects for '${sheetConfig.name}'.`);
      allMenuItems = allMenuItems.concat(categoryItems);

    } catch (error: any) {
      console.error(`API_ROUTE_GET_MENU: Unhandled error fetching/parsing for category '${sheetConfig.name}': ${error.message}`, error.stack);
    }
  }

  console.log(`API_ROUTE_GET_MENU: Total menu items fetched from all sheets: ${allMenuItems.length}. Sending response.`);
  if (allMenuItems.length === 0) {
      console.warn("API_ROUTE_GET_MENU: No menu items were successfully fetched or parsed from any sheet. Check GIDs, sheet publishing settings, and header names.");
  }
  return NextResponse.json(allMenuItems, { status: 200 });
}
