
import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// --- Configuration for Google Sheets ---
// Use the more stable "Publish to web" CSV URL
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6P9RLviBEd9-MJetEer_exzZDGv1hBRLmq83sRN3WP07tVkF4zvxBEcF9ELmckqYza-le1O_rv3C7/pub?output=csv';

// Column names from the Google Sheet structure
const CATEGORIA_ES_COL = "Categoría (ES)";
const CATEGORY_EN_COL = "Category (EN)";
const NOMBRE_ES_COL = "Nombre (ES)";
const NAME_EN_COL = "Name (EN)";
const DESCRIPCION_ES_COL = "Descripción (ES)";
const DESCRIPTION_EN_COL = "Description (EN)";
const PRECIO_COL = "Precio (€)";

// Expected headers for validation
const EXPECTED_HEADERS = [
  CATEGORIA_ES_COL, CATEGORY_EN_COL,
  NOMBRE_ES_COL, NAME_EN_COL,
  DESCRIPCION_ES_COL, DESCRIPTION_EN_COL,
  PRECIO_COL
];

// Helper to map English category names from sheet to consistent categoryKeys
function mapCategoryToKey(categoryEN: string): string {
  const lowerCategory = categoryEN.toLowerCase().trim();
  switch (lowerCategory) {
    case 'starters':
      return 'starters';
    case 'main courses':
      return 'mainCourses';
    case 'desserts':
      return 'desserts';
    case 'beverages':
    case 'drinks':
      return 'drinks';
    default:
      console.warn(`API_ROUTE_MAP_CATEGORY: Unknown category encountered: '${categoryEN}'. Defaulting to '${lowerCategory.replace(/\s+/g, '') || 'other'}'.`);
      return lowerCategory.replace(/\s+/g, '') || 'other';
  }
}


function parseCSV(csvText: string): Record<string, string>[] {
  console.log(`API_ROUTE_PARSE_CSV: Received CSV text length: ${csvText.length}`);
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    console.warn(`API_ROUTE_PARSE_CSV: CSV content is too short (less than 2 lines) or headers are missing. Lines found: ${lines.length}`);
    if (lines.length === 1) console.warn(`API_ROUTE_PARSE_CSV: Headers received: ${lines[0]}`);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  console.log(`API_ROUTE_PARSE_CSV: Headers found in sheet: [${headersFromSheet.join(", ")}]`);
  console.log(`API_ROUTE_PARSE_CSV: Expected headers: [${EXPECTED_HEADERS.join(", ")}]`);

  // Validate headers
  const missingHeaders = EXPECTED_HEADERS.filter(eh => !headersFromSheet.includes(eh));
  if (missingHeaders.length > 0) {
    console.error(`API_ROUTE_PARSE_CSV: Critical header mismatch. Missing expected headers: [${missingHeaders.join(", ")}]. Sheet headers: [${headersFromSheet.join(", ")}]. Cannot process sheet.`);
    return [];
  }

  const extraHeaders = headersFromSheet.filter(sh => !EXPECTED_HEADERS.includes(sh));
  if (extraHeaders.length > 0) {
    console.warn(`API_ROUTE_PARSE_CSV: Warning: Sheet contains extra headers not in EXPECTED_HEADERS: [${extraHeaders.join(", ")}]. These will be ignored.`);
  }

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
      console.log(`API_ROUTE_PARSE_CSV: Skipping empty line at index ${i}`);
      continue;
    }
    const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(value => value.trim().replace(/^"|"$/g, ''));

    if (values.length === headersFromSheet.length) {
      const entry: Record<string, string> = {};
      headersFromSheet.forEach((header, index) => {
        entry[header] = values[index];
      });
      jsonData.push(entry);
    } else {
      console.warn(`API_ROUTE_PARSE_CSV: Skipping malformed CSV line ${i + 1}. Expected ${headersFromSheet.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  console.log(`API_ROUTE_PARSE_CSV: Parsed ${jsonData.length} data rows.`);
  return jsonData;
}

export async function GET() {
  console.log("API_ROUTE_GET_MENU: /api/menu GET handler called.");
  const googleSheetCsvUrl = GOOGLE_SHEET_CSV_URL;
  console.log(`API_ROUTE_GET_MENU: Fetching menu from URL: ${googleSheetCsvUrl}`);

  let allMenuItems: MenuItemData[] = [];
  let parsedData: Record<string, string>[] = []; // Define parsedData here to check its length later

  try {
    const response = await fetch(googleSheetCsvUrl, { cache: 'no-store' });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API_ROUTE_GET_MENU: Failed to fetch CSV. Status: ${response.status} ${response.statusText}. URL: ${googleSheetCsvUrl}. Response: ${errorText.substring(0, 500)}...`);
      return NextResponse.json({ error: "Failed to fetch menu data", details: errorText.substring(0,200) }, { status: response.status });
    }

    const csvText = await response.text();
    console.log(`API_ROUTE_GET_MENU: Successfully fetched CSV. Length: ${csvText.length}`);


    if (!csvText.trim()) {
      console.warn(`API_ROUTE_GET_MENU: Fetched CSV is empty. URL: ${googleSheetCsvUrl}. Ensure sheet is published and has content.`);
      return NextResponse.json({ error: "Fetched menu data is empty" }, { status: 500 });
    }

    parsedData = parseCSV(csvText); // Assign to the outer scope variable
    console.log(`API_ROUTE_GET_MENU: Parsed ${parsedData.length} items from CSV.`);

    allMenuItems = parsedData.map((item: Record<string, string>, index: number) => {
      const nameES = item[NOMBRE_ES_COL];
      const nameEN = item[NAME_EN_COL];
      const categoryEN = item[CATEGORY_EN_COL];
      let price = item[PRECIO_COL];

      if (!nameES || !nameEN || !categoryEN) {
        console.warn(`API_ROUTE_GET_MENU: Item at row ${index + 2} is missing essential data (Name ES/EN or Category EN). Skipping. Data: ${JSON.stringify(item)}`);
        return null;
      }

      if (price === undefined || price === null || price.trim() === "") {
        console.warn(`API_ROUTE_GET_MENU: Item '${nameEN}' (row ${index + 2}) is missing price. Setting to 'N/A'.`);
        price = 'N/A';
      } else {
        const numericPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(numericPrice)) {
            price = `€${numericPrice.toFixed(2)}`;
        } else {
            price = `€ N/A`;
            console.warn(`API_ROUTE_GET_MENU: Item '${nameEN}' (row ${index + 2}) has unparseable price: '${item[PRECIO_COL]}'. Setting to '€ N/A'.`);
        }
      }

      const categoryKey = mapCategoryToKey(categoryEN);
      const nameENForHint = nameEN || "food item"; // Fallback for hint

      // Create a more specific image hint using the English name or category
      let imageHint = nameENForHint.toLowerCase().split(' ').slice(0, 2).join(' ');
      if (!imageHint || imageHint === "food item") {
        imageHint = categoryEN.toLowerCase() || "food plate";
      }


      return {
        id: `${categoryKey}-${index}-${Date.now()}`,
        name: { en: nameEN.trim(), es: nameES.trim() },
        description: {
          en: (item[DESCRIPTION_EN_COL] || "No description available.").trim(),
          es: (item[DESCRIPCION_ES_COL] || "Descripción no disponible.").trim()
        },
        price: price,
        categoryKey: categoryKey,
        imageUrl: `https://placehold.co/400x300.png`, // Using placehold.co
        imageHint: imageHint, // Using the generated hint
      };
    }).filter(item => item !== null) as MenuItemData[];

    console.log(`API_ROUTE_GET_MENU: Mapped to ${allMenuItems.length} valid MenuItemData objects.`);

  } catch (error: any) {
    console.error(`API_ROUTE_GET_MENU: Unhandled error fetching/parsing menu: ${error.message}`, error.stack);
    return NextResponse.json({ error: "Internal server error while fetching menu", details: error.message }, { status: 500 });
  }

  console.log(`API_ROUTE_GET_MENU: Total menu items processed: ${allMenuItems.length}. Sending response.`);
  if (allMenuItems.length === 0 && parsedData.length > 0) {
    console.warn("API_ROUTE_GET_MENU: All parsed items were filtered out or invalid during mapping. Check mapping logic and data consistency.");
  } else if (allMenuItems.length === 0) {
    console.warn("API_ROUTE_GET_MENU: No menu items were successfully processed. Check GID, sheet publishing status (File > Share > Publish to web > CSV), header names, and data content in your Google Sheet.");
  }
  return NextResponse.json(allMenuItems, { status: 200 });
}
