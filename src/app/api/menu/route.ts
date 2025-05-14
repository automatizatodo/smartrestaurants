
import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// --- Configuration for Google Sheets ---
// IMPORTANT: This is the Spreadsheet ID from your Google Sheet URL
const SPREADSHEET_ID = '1zXWQRP-YsyM_8pii8xPXV29ao9SvkC5BJjM0S2kVviI';

// How to find GID:
// 1. Open your Google Sheet.
// 2. Click on the tab for the sheet (e.g., "Entrantes").
// 3. Look at the URL in the browser's address bar. It will end with something like #gid=123456789. That number is the GID.
const SHEETS_CONFIG = [
  { name: 'Entrantes', gid: '0', categoryKey: 'menu:category.starters', expectedHeaders: ["Nombre del Plato", "Descripción", "Precio (€)"] },
  { name: 'Platos Principales', gid: '1881659107', categoryKey: 'menu:category.mainCourses', expectedHeaders: ["Nombre del Plato", "Descripción", "Precio (€)"] },
  { name: 'Postres', gid: '1794450508', categoryKey: 'menu:category.desserts', expectedHeaders: ["Nombre del Plato", "Descripción", "Precio (€)"] },
  { name: 'Bebidas', gid: '2130971891', categoryKey: 'menu:category.drinks', expectedHeaders: ["Nombre de la Bebida", "Descripción", "Precio (€)"] },
];

// Column names from your Spanish sheets
const NAME_COLUMN_ES = "Nombre del Plato";
const DRINK_NAME_COLUMN_ES = "Nombre de la Bebida";
const DESCRIPTION_COLUMN_ES = "Descripción";
const PRICE_COLUMN_ES = "Precio (€)";


function parseCSV(csvText: string, expectedHeaders: string[], sheetNameForLogging: string): Record<string, string>[] {
  console.log(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Received CSV text length: ${csvText.length}`);
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== ''); // Filter out empty lines robustly
  
  if (lines.length < 2) { // Expecting at least one header row and one data row
    console.warn(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: CSV content is too short (less than 2 lines) or headers are missing. Lines found: ${lines.length}`);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  console.log(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Headers found in sheet: [${headersFromSheet.join(", ")}]`);
  console.log(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Expected headers: [${expectedHeaders.join(", ")}]`);

  let allExpectedHeadersPresent = true;
  for (const expectedHeader of expectedHeaders) {
    if (!headersFromSheet.includes(expectedHeader)) {
      console.warn(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Missing expected header '${expectedHeader}'. Sheet headers: [${headersFromSheet.join(", ")}]`);
      allExpectedHeadersPresent = false;
    }
  }

  if (!allExpectedHeadersPresent) {
    console.warn(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Not all expected headers were found. Proceeding with available data, but menu items might be incomplete or incorrect for this category.`);
    // Decide if you want to stop processing this sheet or continue with partial data
    // For now, we'll continue if at least one expected header is present, as before.
    if (!expectedHeaders.some(eh => headersFromSheet.includes(eh))) {
       console.error(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Critical header mismatch. None of the expected headers found. Skipping this sheet.`);
       return [];
    }
  }
  
  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
        console.log(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Skipping empty line at index ${i}`);
        continue;
    }
    // This regex handles commas inside quoted fields
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(value => value.trim().replace(/^"|"$/g, ''));
    
    if (values.length === headersFromSheet.length) {
      const entry: Record<string, string> = {};
      headersFromSheet.forEach((header, index) => {
        entry[header] = values[index];
      });
      jsonData.push(entry);
    } else {
      console.warn(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Skipping malformed CSV line ${i + 1}. Expected ${headersFromSheet.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  console.log(`API_ROUTE_PARSE_CSV [${sheetNameForLogging}]: Parsed ${jsonData.length} data rows.`);
  return jsonData;
}

export async function GET() {
  console.log("API_ROUTE_GET_MENU: /api/menu GET handler called.");
  let allMenuItems: MenuItemData[] = [];

  for (const sheetConfig of SHEETS_CONFIG) {
    // The GID placeholder check is less critical now that specific GIDs are set,
    // but it's good to keep a general awareness for future changes.
    // It's important that the GIDs above are correct for SPREADSHEET_ID.

    const googleSheetCsvUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${sheetConfig.gid}`;
    console.log(`API_ROUTE_GET_MENU: Fetching menu for category '${sheetConfig.name}' (GID: ${sheetConfig.gid}) from URL: ${googleSheetCsvUrl}`);

    try {
      const response = await fetch(googleSheetCsvUrl, {
        cache: 'no-store', 
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API_ROUTE_GET_MENU: Failed to fetch CSV for '${sheetConfig.name}'. Status: ${response.status} ${response.statusText}. URL: ${googleSheetCsvUrl}. Response: ${errorText.substring(0, 500)}...`);
        continue; 
      }

      const csvText = await response.text();
      console.log(`API_ROUTE_GET_MENU: Successfully fetched CSV for '${sheetConfig.name}'. Length: ${csvText.length}`);

      if (!csvText.trim()) {
        console.warn(`API_ROUTE_GET_MENU: Fetched CSV for '${sheetConfig.name}' is empty. URL: ${googleSheetCsvUrl}. Ensure sheet is published and has content.`);
        continue; 
      }

      const parsedData = parseCSV(csvText, sheetConfig.expectedHeaders, sheetConfig.name);
      console.log(`API_ROUTE_GET_MENU: Parsed ${parsedData.length} items from CSV for '${sheetConfig.name}'.`);

      const nameColumnKey = sheetConfig.categoryKey === 'menu:category.drinks' ? DRINK_NAME_COLUMN_ES : NAME_COLUMN_ES;

      const categoryItems: MenuItemData[] = parsedData.map((item: Record<string, string>, index: number) => {
        const itemName = item[nameColumnKey];
        const itemDescription = item[DESCRIPTION_COLUMN_ES];
        let price = item[PRICE_COLUMN_ES];

        if (!itemName) {
            console.warn(`API_ROUTE_GET_MENU [${sheetConfig.name}]: Item at row ${index + 2} is missing name (expected column: '${nameColumnKey}'). Skipping.`);
            return null;
        }
        if (!itemDescription) {
            console.warn(`API_ROUTE_GET_MENU [${sheetConfig.name}]: Item '${itemName}' is missing description (expected column: '${DESCRIPTION_COLUMN_ES}').`);
        }
        if (!price) {
            console.warn(`API_ROUTE_GET_MENU [${sheetConfig.name}]: Item '${itemName}' is missing price (expected column: '${PRICE_COLUMN_ES}'). Setting to 'N/A'.`);
            price = 'N/A';
        }
        
        price = price.replace(',', '.'); 
        if (!price.includes('€')) {
            price = `€${parseFloat(price).toFixed(2)}`;
        } else {
            price = `€${parseFloat(price.replace('€','')).toFixed(2)}`;
        }
        
        return {
          id: `${sheetConfig.categoryKey}-${sheetConfig.gid}-${index}-${Date.now()}`, // More robust ID
          nameKey: itemName.trim(), 
          descriptionKey: (itemDescription || `Descripción para ${itemName}`).trim(),
          price: price,
          categoryKey: sheetConfig.categoryKey,
          imageUrl: `https://picsum.photos/seed/${encodeURIComponent(itemName.trim().substring(0,10))}${index}/400/300`,
          imageHint: `${sheetConfig.name.toLowerCase()} food item plate`, 
        };
      }).filter(item => item !== null) as MenuItemData[]; // Filter out nulls from skipped items
      
      console.log(`API_ROUTE_GET_MENU: Mapped to ${categoryItems.length} valid MenuItemData objects for '${sheetConfig.name}'.`);
      allMenuItems = allMenuItems.concat(categoryItems);

    } catch (error: any) {
      console.error(`API_ROUTE_GET_MENU: Unhandled error fetching/parsing for category '${sheetConfig.name}': ${error.message}`, error.stack);
    }
  }

  console.log(`API_ROUTE_GET_MENU: Total menu items fetched from all sheets: ${allMenuItems.length}. Sending response.`);
  if (allMenuItems.length === 0) {
      console.warn("API_ROUTE_GET_MENU: No menu items were successfully fetched or parsed from any sheet. Check GIDs, sheet publishing status (File > Share > Publish to web > CSV), and header names in your Google Sheet matching expected headers.");
  }
  return NextResponse.json(allMenuItems, { status: 200 });
}

