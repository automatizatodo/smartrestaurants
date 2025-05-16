import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// --- Configuration for Google Sheets ---
// IMPORTANT: Replace this with your actual "Publish to web" CSV URL for the menu sheet
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaa24KcQUVl_kLjJHeG9F-2JYbsA_2JfCcVnF3LEZTGzqe_11Fv4u6VLec7BSpCQGSo27w8qhgckQ0/pub?output=csv';

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

// Expected headers for validation
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
      console.warn(`API_ROUTE_MAP_CATEGORY: Unknown category encountered: '${categoryEN}'. Defaulting to '${lowerCategory.replace(/\s+/g, '') || 'other'}'.`);
      return lowerCategory.replace(/\s+/g, '') || 'other'; // Fallback for unknown categories
  }
}

function parseCSV(csvText: string): Record<string, string>[] {
  console.log(`API_ROUTE_PARSE_CSV: Received CSV text length: ${csvText.length}`);
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== ''); // Handles different line endings and filters empty lines

  if (lines.length < 2) {
    console.warn(`API_ROUTE_PARSE_CSV: CSV content is too short (less than 2 lines) or headers are missing. Lines found: ${lines.length}`);
    if (lines.length === 1) console.warn(`API_ROUTE_PARSE_CSV: Headers received: ${lines[0]}`);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, '')); // Trim and remove quotes from headers
  console.log(`API_ROUTE_PARSE_CSV: Headers found in sheet: [${headersFromSheet.join(", ")}]`);
  console.log(`API_ROUTE_PARSE_CSV: Expected headers: [${EXPECTED_HEADERS.join(", ")}]`);

  // Validate headers
  const missingHeaders = EXPECTED_HEADERS.filter(eh => !headersFromSheet.includes(eh));
  if (missingHeaders.length > 0) {
    console.error(`API_ROUTE_PARSE_CSV: Critical header mismatch. Missing expected headers: [${missingHeaders.join(", ")}]. Sheet headers: [${headersFromSheet.join(", ")}]. Cannot process sheet.`);
    return []; // Stop processing if critical headers are missing
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
    // Split by comma, but not if comma is inside quotes
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

function isValidHttpUrl(string: string) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;  
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

export async function GET() {
  console.log("API_ROUTE_GET_MENU: /api/menu GET handler called.");
  const googleSheetCsvUrl = GOOGLE_SHEET_CSV_URL;

  console.log(`API_ROUTE_GET_MENU: Fetching menu from URL: ${googleSheetCsvUrl}`);

  let allMenuItems: MenuItemData[] = [];
  let parsedData: Record<string, string>[] = []; 

  try {
    const response = await fetch(googleSheetCsvUrl, { cache: 'no-store' }); // Use no-store for testing to ensure fresh data

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API_ROUTE_GET_MENU: Failed to fetch CSV. Status: ${response.status} ${response.statusText}. URL: ${googleSheetCsvUrl}. Response: ${errorText.substring(0, 500)}...`);
      return NextResponse.json({ error: "Failed to fetch menu data", details: errorText.substring(0,200) }, { status: response.status });
    }

    const csvText = await response.text();
    console.log(`API_ROUTE_GET_MENU: Successfully fetched CSV. Length: ${csvText.length}. Preview (first 500 chars): ${csvText.substring(0,500)}`);
    // ADDED LOG: Log the full CSV text if it's short, or a longer preview
    if (csvText.length < 2000) {
      console.log(`API_ROUTE_GET_MENU: Full fetched CSV content:\\n${csvText}`);
    } else {
      console.log(`API_ROUTE_GET_MENU: Fetched CSV content preview (first 2000 chars):\\n${csvText.substring(0,2000)}`);
    }

    if (!csvText.trim()) {
      console.warn(`API_ROUTE_GET_MENU: Fetched CSV is empty. URL: ${googleSheetCsvUrl}. Ensure sheet is published and has content.`);
      return NextResponse.json({ error: "Fetched menu data is empty" }, { status: 500 });
    }

    parsedData = parseCSV(csvText);
    console.log(`API_ROUTE_GET_MENU: Parsed ${parsedData.length} items from CSV.`);
    // ADDED LOG: Log the parsed data itself
    console.log(`API_ROUTE_GET_MENU: Parsed data output from parseCSV:`, JSON.stringify(parsedData, null, 2));

    if (parsedData.length === 0) {
        console.warn("API_ROUTE_GET_MENU: No data rows parsed from CSV. Check CSV structure, headers, and content in Google Sheet.");
    }

    let visibleItemsCount = 0;
    allMenuItems = parsedData.map((item: Record<string, string>, index: number) => {
      // Log raw item data for each row
      console.log(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Row ${index + 2} RAW: ${JSON.stringify(item)}`);

      // Check visibility first
      const visibleString = (item[VISIBLE_COL] || "TRUE").trim(); // Default to TRUE if column is missing or empty, and trim
      if (visibleString.toUpperCase() === "FALSE" || visibleString === "0") {
        console.log(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Item '${item[NAME_EN_COL] || `Row ${index + 2}`}' is marked as NOT VISIBLE. Skipping.`);
        return null; // Skip this item if not visible
      }
      visibleItemsCount++;
      console.log(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Item '${item[NAME_EN_COL] || `Row ${index + 2}`}' IS VISIBLE.`);

      // Essential data checks
      const nameES = item[NOMBRE_ES_COL];
      const nameEN = item[NAME_EN_COL];
      const categoryEN = item[CATEGORY_EN_COL];
      let price = item[PRECIO_COL];
      const linkImagen = item[LINK_IMAGEN_COL];
      const sugerenciaChefString = item[SUGERENCIA_CHEF_COL] || "FALSE";
      const alergenosString = item[ALERGENOS_COL] || "";

      if (!nameES || !nameEN || !categoryEN) {
        console.warn(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Item at row ${index + 2} (Visible) is MISSING ESSENTIAL DATA (Name ES/EN or Category EN). Skipping. Data: ${JSON.stringify(item)}`);
        return null;
      }

      // Image URL processing
      let finalImageUrl = `https://placehold.co/400x300.png`; // Default placeholder
      if (linkImagen && linkImagen.toUpperCase() !== "FALSE" && isValidHttpUrl(linkImagen)) {
        finalImageUrl = linkImagen;
      }
      
      // Generate image hint (prefers Name EN, then Category EN)
      let imageHint = (nameEN || "food item").toLowerCase().split(' ').slice(0, 2).join(' ');
      if (!imageHint || imageHint === "food item") { // if nameEN was empty or just generic
        imageHint = (categoryEN || "food plate").toLowerCase(); // fallback to category if name is not descriptive
      }
      if (finalImageUrl.includes('placehold.co')) {
        console.log(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Item '${nameEN}' using placeholder. Hint: '${imageHint}'`);
      }


      // Price processing
      let formattedPrice: string | undefined = undefined;
      if (price !== undefined && price !== null && price.trim() !== "" && price.toUpperCase() !== "FALSE" && price.toUpperCase() !== "N/A") {
        // Replace comma with dot for decimal conversion, then parse
        const numericPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(numericPrice)) {
            formattedPrice = `€${numericPrice.toFixed(2)}`;
        } else {
            console.warn(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Item '${nameEN}' (row ${index + 2}) has unparseable price: '${item[PRECIO_COL]}'. Setting to undefined.`);
        }
      }
      
      // Allergens processing
      const allergens = alergenosString.split(',')
        .map(a => a.trim().toLowerCase())
        .filter(a => a.length > 0);

      // Chef's Suggestion processing
      const isChefSuggestion = ['true', 'verdadero', 'sí', 'si', '1', 'TRUE'].includes(sugerenciaChefString.toLowerCase());

      const categoryKey = mapCategoryToKey(categoryEN);
      
      console.log(`API_ROUTE_GET_MENU_ITEM_PROCESSING: Successfully processed item '${nameEN}'.`);
      return {
        id: `${categoryKey}-${index}-${Date.now()}`, // More unique ID
        name: { en: nameEN.trim(), es: nameES.trim() },
        description: {
          en: (item[DESCRIPTION_EN_COL] || "No description available.").trim(),
          es: (item[DESCRIPCION_ES_COL] || "Descripción no disponible.").trim()
        },
        price: formattedPrice, 
        categoryKey: categoryKey,
        imageUrl: finalImageUrl,
        imageHint: imageHint, // Ensure imageHint is always present
        allergens: allergens.length > 0 ? allergens : undefined,
        isChefSuggestion: isChefSuggestion,
      };
    }).filter(item => item !== null) as MenuItemData[]; // Filter out nulls from invisible/invalid items
    console.log(`API_ROUTE_GET_MENU: Total items marked as visible: ${visibleItemsCount}`);
    console.log(`API_ROUTE_GET_MENU: Mapped to ${allMenuItems.length} valid MenuItemData objects after filtering invisible and invalid items.`);

  } catch (error: any) {
    console.error(`API_ROUTE_GET_MENU: Unhandled error fetching/parsing menu: ${error.message}`, error.stack);
    return NextResponse.json({ error: "Internal server error while fetching menu", details: error.message }, { status: 500 });
  }

  console.log(`API_ROUTE_GET_MENU: Total menu items processed: ${allMenuItems.length}. Sending response.`);
  // ADDED LOG: Log allMenuItems before sending response
  console.log(`API_ROUTE_GET_MENU: Final allMenuItems before NextResponse.json:`, JSON.stringify(allMenuItems, null, 2));
  if (allMenuItems.length === 0 && parsedData.length > 0) {
    console.warn("API_ROUTE_GET_MENU: All parsed items were filtered out or invalid during mapping. Check mapping logic and data consistency, especially the 'Visible' column and essential fields like names/categories.");
  } else if (allMenuItems.length === 0) {
    // This condition is hit if GOOGLE_SHEET_CSV_URL is bad, sheet is empty, or headers are completely mismatched.
    console.warn("API_ROUTE_GET_MENU: No menu items were successfully processed. Check GID, sheet publishing status (File > Share > Publish to web > CSV), header names, and data content in your Google Sheet.");
  }
  return NextResponse.json(allMenuItems, { status: 200 });
}
