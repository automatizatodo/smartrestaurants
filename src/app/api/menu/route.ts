
import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// --- Configuration for Google Sheets ---
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR6P9RLviBEd9-MJetEer_exzZDGv1hBRLmq83sRN3WP07tVkF4zvxBEcF9ELmckqYza-le1O_rv3C7/pub?output=csv';

// Column names from the Google Sheet structure (ensure these EXACTLY match your sheet headers)
const VISIBLE_COL = "Visible";
const CATEGORIA_ES_COL = "Categoría (ES)";
const CATEGORY_EN_COL = "Category (EN)";
const NOMBRE_ES_COL = "Nombre (ES)";
const NAME_EN_COL = "Name (EN)";
const DESCRIPCION_ES_COL = "Descripción (ES)";
const DESCRIPTION_EN_COL = "Description (EN)";
const PRECIO_COL = "Precio (€)";
const LINK_IMAGEN_COL = "Link Imagen";
const SUGERENCIA_CHEF_COL = "Sugerencia Chef";
const ALERGENOS_COL = "Alergenos";
// const ELIMINAR_COL = "Eliminar"; // Not currently used in logic, but was in logs

// Expected headers for validation - Reverted to original strict expectation.
// User should fix their Google Sheet to match these headers.
const EXPECTED_HEADERS = [
  VISIBLE_COL,
  CATEGORIA_ES_COL, CATEGORY_EN_COL,
  NOMBRE_ES_COL, NAME_EN_COL,
  DESCRIPCION_ES_COL, DESCRIPTION_EN_COL,
  PRECIO_COL,
  LINK_IMAGEN_COL, SUGERENCIA_CHEF_COL, ALERGENOS_COL
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
    case 'beverages': // Accept "Beverages" as an alternative for drinks
    case 'drinks':
      return 'drinks';
    default:
      console.warn(`API_ROUTE_LOGIC_MAP_CATEGORY: Unknown category encountered: '${categoryEN}'. Defaulting to '${lowerCategory.replace(/\s+/g, '') || 'other'}'.`);
      return lowerCategory.replace(/\s+/g, '') || 'other'; // Fallback for unknown categories
  }
}

function parseCSV(csvText: string): Record<string, string>[] {
  console.log(`API_ROUTE_LOGIC_PARSE_CSV: Received CSV text length: ${csvText.length}`);
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    console.warn(`API_ROUTE_LOGIC_PARSE_CSV: CSV content is too short (less than 2 lines) or headers are missing. Lines found: ${lines.length}`);
    if (lines.length === 1) console.warn(`API_ROUTE_LOGIC_PARSE_CSV: Headers received: ${lines[0]}`);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  console.log(`API_ROUTE_LOGIC_PARSE_CSV: Headers found in sheet: [${headersFromSheet.join(", ")}]`);
  console.log(`API_ROUTE_LOGIC_PARSE_CSV: Expected headers: [${EXPECTED_HEADERS.join(", ")}]`);

  const missingHeaders = EXPECTED_HEADERS.filter(eh => !headersFromSheet.includes(eh));
  if (missingHeaders.length > 0) {
    console.error(`API_ROUTE_LOGIC_PARSE_CSV: Critical header mismatch. Missing expected headers: [${missingHeaders.join(", ")}]. Sheet headers: [${headersFromSheet.join(", ")}]. Cannot process sheet.`);
    return [];
  }

  const extraHeaders = headersFromSheet.filter(sh => !EXPECTED_HEADERS.includes(sh));
  if (extraHeaders.length > 0) {
    console.warn(`API_ROUTE_LOGIC_PARSE_CSV: Warning: Sheet contains extra headers not in EXPECTED_HEADERS: [${extraHeaders.join(", ")}]. These will be ignored.`);
  }

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
      console.log(`API_ROUTE_LOGIC_PARSE_CSV: Skipping empty line at index ${i}`);
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
      console.warn(`API_ROUTE_LOGIC_PARSE_CSV: Skipping malformed CSV line ${i + 1}. Expected ${headersFromSheet.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  console.log(`API_ROUTE_LOGIC_PARSE_CSV: Parsed ${jsonData.length} data rows.`);
  return jsonData;
}

function isValidHttpUrl(string: string) {
  if (!string) return false;
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

// Extracted core logic
export async function fetchAndProcessMenuData(): Promise<MenuItemData[]> {
  console.log(`API_ROUTE_LOGIC: fetchAndProcessMenuData called.`);
  if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL.includes('YOUR_GOOGLE_SHEET') || GOOGLE_SHEET_CSV_URL.includes('YOUR_NEW_GOOGLE_SHEET')) {
    console.error('API_ROUTE_LOGIC: CRITICAL - GOOGLE_SHEET_CSV_URL is not configured correctly. Please update it in src/app/api/menu/route.ts');
    return [];
  }

  const fetchUrl = `${GOOGLE_SHEET_CSV_URL}&timestamp=${new Date().getTime()}`;
  console.log(`API_ROUTE_LOGIC: Fetching menu from URL: ${fetchUrl}`);
  let parsedData: Record<string, string>[] = [];
  let allMenuItems: MenuItemData[] = [];

  try {
    const response = await fetch(fetchUrl, { cache: 'no-store' });
    console.log(`API_ROUTE_LOGIC: Response status from Google Sheets: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API_ROUTE_LOGIC: Failed to fetch CSV. Status: ${response.status}. URL: ${fetchUrl}. Response: ${errorText.substring(0, 500)}...`);
      return [];
    }

    const csvText = await response.text();
    console.log(`API_ROUTE_LOGIC: Successfully fetched CSV. Length: ${csvText.length}. Preview (first 500 chars): ${csvText.substring(0,500)}`);
    if (csvText.length < 2000 && csvText.length > 0) { // Log full content only if it's reasonably short but not empty
      console.log(`API_ROUTE_LOGIC: Full fetched CSV content (short):\n${csvText}`);
    }


    if (!csvText.trim()) {
      console.warn(`API_ROUTE_LOGIC: Fetched CSV is empty. URL: ${fetchUrl}. Ensure sheet is published and has content.`);
      return [];
    }

    parsedData = parseCSV(csvText);
    console.log(`API_ROUTE_LOGIC: Parsed ${parsedData.length} items from CSV.`);
    if (parsedData.length === 0 && csvText.trim().length > 0 && !csvText.trim().startsWith(EXPECTED_HEADERS[0])) {
         console.warn("API_ROUTE_LOGIC: CSV parsing resulted in 0 items, but CSV text was not empty. This strongly suggests a header mismatch or structural issue with the CSV that parseCSV couldn't handle based on EXPECTED_HEADERS.");
    }

    let visibleItemsCount = 0;
    allMenuItems = parsedData.map((item: Record<string, string>, index: number) => {
      console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Row ${index + 2} RAW: ${JSON.stringify(item)}`);

      const visibleString = (item[VISIBLE_COL] || "TRUE").trim(); // Default to TRUE if column is missing or empty
      if (!(visibleString.toUpperCase() === "TRUE" || visibleString === "1" || visibleString.toUpperCase() === "SÍ" || visibleString.toUpperCase() === "VERDADERO")) {
        console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${item[NAME_EN_COL] || `Row ${index + 2}`}' is marked as NOT VISIBLE (Value: '${visibleString}'). Skipping.`);
        return null;
      }
      visibleItemsCount++;
      console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${item[NAME_EN_COL] || `Row ${index + 2}`}' IS VISIBLE.`);

      const nameES = item[NOMBRE_ES_COL];
      const nameEN = item[NAME_EN_COL];
      const categoryEN = item[CATEGORY_EN_COL];
      let price = item[PRECIO_COL];
      const linkImagen = item[LINK_IMAGEN_COL];
      const sugerenciaChefString = item[SUGERENCIA_CHEF_COL] || "FALSE";
      const alergenosString = item[ALERGENOS_COL] || "";

      if (!nameES || !nameEN || !categoryEN) {
        console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row ${index + 2} (Visible) is MISSING ESSENTIAL DATA (Name ES/EN or Category EN). Skipping. Data: ${JSON.stringify(item)}`);
        return null;
      }

      let finalImageUrl = `https://placehold.co/400x300.png`;
      if (linkImagen && linkImagen.toUpperCase() !== "FALSE" && isValidHttpUrl(linkImagen)) {
        finalImageUrl = linkImagen;
      }
      let imageHint = (nameEN || "food item").toLowerCase().split(' ').slice(0, 2).join(' ');
      if (!imageHint || imageHint === "food item") {
        imageHint = (categoryEN || "food plate").toLowerCase();
      }
      if (finalImageUrl.includes('placehold.co')) {
        console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${nameEN}' using placeholder. Hint: '${imageHint}'`);
      }

      let formattedPrice: string | undefined = undefined;
      if (price !== undefined && price !== null && price.trim() !== "" && price.toUpperCase() !== "FALSE" && price.toUpperCase() !== "N/A") {
        const numericPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(numericPrice)) {
          formattedPrice = `€${numericPrice.toFixed(2)}`;
        } else {
          console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${nameEN}' (row ${index + 2}) has unparseable price: '${item[PRECIO_COL]}'. Setting to undefined.`);
        }
      }

      const allergens = alergenosString.split(',')
        .map(a => a.trim().toLowerCase())
        .filter(a => a.length > 0 && a !== "false" && a !== "n/a");

      const isChefSuggestion = ['true', 'verdadero', 'sí', 'si', '1', 'TRUE'].includes(sugerenciaChefString.toLowerCase());
      const categoryKey = mapCategoryToKey(categoryEN);

      console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Successfully processed item '${nameEN}'.`);
      return {
        id: `${categoryKey}-${index}-${Date.now()}`,
        name: { en: nameEN.trim(), es: nameES.trim() },
        description: {
          en: (item[DESCRIPTION_EN_COL] || "No description available.").trim(),
          es: (item[DESCRIPCION_ES_COL] || "Descripción no disponible.").trim()
        },
        price: formattedPrice,
        categoryKey: categoryKey,
        imageUrl: finalImageUrl,
        imageHint: imageHint,
        allergens: allergens.length > 0 ? allergens : undefined,
        isChefSuggestion: isChefSuggestion,
      };
    }).filter(item => item !== null) as MenuItemData[];
    console.log(`API_ROUTE_LOGIC: Total items marked as visible: ${visibleItemsCount}`);
    console.log(`API_ROUTE_LOGIC: Mapped to ${allMenuItems.length} valid MenuItemData objects after filtering invisible and invalid items.`);

  } catch (error: any) {
    console.error(`API_ROUTE_LOGIC: Unhandled error fetching/parsing menu: ${error.message}`, error.stack);
    return [];
  }

  console.log(`API_ROUTE_LOGIC: Total menu items processed: ${allMenuItems.length}.`);
  if (allMenuItems.length === 0 && parsedData.length > 0) {
    console.warn("API_ROUTE_LOGIC: All parsed items were filtered out or invalid during mapping. Check mapping logic and data consistency, especially the 'Visible' column and essential fields like names/categories.");
  } else if (allMenuItems.length === 0) {
    console.warn("API_ROUTE_LOGIC: No menu items were successfully processed. Check GID, sheet publishing status (File > Share > Publish to web > CSV), header names, and data content in your Google Sheet.");
  }
  console.log(`API_ROUTE_LOGIC: Final allMenuItems before NextResponse.json:`, JSON.stringify(allMenuItems.slice(0, 2), null, 2)); // Log first 2 items
  return allMenuItems;
}


export async function GET() {
  console.log("API_ROUTE_GET_HANDLER: /api/menu GET handler INVOKED.");
  const menuItems = await fetchAndProcessMenuData();
  console.log(`API_ROUTE_GET_HANDLER: Responding with ${menuItems.length} menu items.`);
  // Add cache control headers to prevent Vercel from caching an empty/error response for too long
  const headers = new Headers();
  headers.append('Cache-Control', 's-maxage=1, stale-while-revalidate=59'); // Cache for 1s, revalidate after 59s

  return NextResponse.json(menuItems, { status: 200, headers });
}
