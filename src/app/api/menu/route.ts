
'use server';

import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';

// --- Configuration for Google Sheets ---
let GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaa24KcQUVl_kLjJHeG9F-2JYbsA_2JfCcVnF3LEZTGzqe_11Fv4u6VLec7BSpCQGSo27w8qhgckQ0/pub?output=csv';

// Column names from the Google Sheet structure
const VISIBLE_COL = "Visible";
const CATEGORIA_CA_COL = "Categoría (CA)";
const CATEGORIA_ES_COL = "Categoría (ES)";
const CATEGORY_EN_COL = "Category (EN)";
const NOM_CA_COL = "Nom (CA)";
const NOMBRE_ES_COL = "Nombre (ES)";
const NAME_EN_COL = "Name (EN)";
const DESCRIPCIO_CA_COL = "Descripció CA";
const DESCRIPCION_ES_COL = "Descripción ES";
const DESCRIPTION_EN_COL = "Description EN";
const PRECIO_COL = "Precio (€)";
const LINK_IMAGEN_COL = "Link Imagen";
const SUGERENCIA_CHEF_COL = "Sugerencia Chef";
const ALERGENOS_COL = "Alergenos";
// const ELIMINAR_COL = "Eliminar"; // Not strictly needed if not used by logic

// Expected headers for validation - Reflects the new Excel structure including Catalan
const EXPECTED_HEADERS = [
  VISIBLE_COL,
  CATEGORIA_CA_COL, CATEGORIA_ES_COL, CATEGORY_EN_COL,
  NOM_CA_COL, NOMBRE_ES_COL, NAME_EN_COL,
  DESCRIPCIO_CA_COL, DESCRIPCION_ES_COL, DESCRIPTION_EN_COL,
  PRECIO_COL,
  LINK_IMAGEN_COL, SUGERENCIA_CHEF_COL, ALERGENOS_COL
];

// Helper to map English category names from sheet to consistent categoryKeys
function mapCategoryToKey(categoryEN: string): string {
  if (!categoryEN) return 'other';
  const lowerCategory = categoryEN.toLowerCase().trim();
  switch (lowerCategory) {
    case 'starters':
      return 'starters';
    case 'main courses': // For "Primers Plats"
      return 'mainCourses';
    case 'second courses': // For "Segon Plat"
      return 'secondCourses';
    case 'grilled garnish':
      return 'grilledGarnish';
    case 'sauces':
      return 'sauces';
    case 'desserts':
      return 'desserts';
    case 'breads':
      return 'breads';
    case 'beverages':
      return 'beverages';
    case 'wines':
      return 'wines';
    default:
      console.warn(`API_ROUTE_LOGIC_MAP_CATEGORY: Unknown category encountered: '${categoryEN}'. Defaulting to '${lowerCategory.replace(/\s+/g, '') || 'other'}'.`);
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

    if (values.length >= headersFromSheet.length) {
      const entry: Record<string, string> = {};
      headersFromSheet.forEach((header, index) => {
        if (values[index] !== undefined) {
          entry[header] = values[index];
        }
      });
      jsonData.push(entry);
    } else {
      console.warn(`API_ROUTE_PARSE_CSV: Skipping malformed CSV line ${i + 1}. Expected at least ${headersFromSheet.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  console.log(`API_ROUTE_PARSE_CSV: Parsed ${jsonData.length} data rows.`);
  return jsonData;
}

function isValidHttpUrl(string: string): boolean {
  if (!string || typeof string !== 'string') return false;
  let url;
  try {
    // Attempt to prepend https:// if it looks like a domain without a protocol
    if (!string.startsWith('http://') && !string.startsWith('https://') && string.includes('.') && !string.includes(' ')) {
      string = `https://${string}`;
      console.log(`API_ROUTE_LOGIC_IS_VALID_URL: Prepended https:// to: ${string}`);
    }
    url = new URL(string);
  } catch (e: any) {
    console.warn(`API_ROUTE_LOGIC_IS_VALID_URL: Failed to parse URL '${string}'. Error: ${e.message}`);
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
}

function transformGoogleDriveLink(url: string): string {
  if (typeof url !== 'string') return url;
  // Regex for Google Drive links like /file/d/.../view?usp=sharing or /view?usp=drive_link
  const driveFileRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view(?:\?usp=sharing|\?usp=drive_link)?/i;
  const match = url.match(driveFileRegex);
  if (match && match[1]) {
    const fileId = match[1];
    const newUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    console.log(`API_ROUTE_LOGIC_TRANSFORM_GDRIVE: Transformed Google Drive link from '${url}' to '${newUrl}'`);
    return newUrl;
  }
  return url;
}

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
    if (csvText.length < 2000 && csvText.length > 0) {
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

      const visibleString = (item[VISIBLE_COL] || "TRUE").trim();
      if (!(visibleString.toUpperCase() === "TRUE" || visibleString === "1" || visibleString.toUpperCase() === "SÍ" || visibleString.toUpperCase() === "VERDADERO")) {
        console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${item[NAME_EN_COL] || `Row ${index + 2}`}' is marked as NOT VISIBLE (Value: '${visibleString}'). Skipping.`);
        return null;
      }
      visibleItemsCount++;
      console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${item[NAME_EN_COL] || `Row ${index + 2}`}' IS VISIBLE.`);

      const nameCA = item[NOM_CA_COL];
      const nameES = item[NOMBRE_ES_COL];
      const nameEN = item[NAME_EN_COL];
      const descCA = item[DESCRIPCIO_CA_COL];
      const descES = item[DESCRIPCION_ES_COL];
      const descEN = item[DESCRIPTION_EN_COL];
      const categoryEN = item[CATEGORY_EN_COL];
      let price = item[PRECIO_COL];
      let linkImagen = item[LINK_IMAGEN_COL] || "";
      const sugerenciaChefString = item[SUGERENCIA_CHEF_COL] || "FALSE";
      const alergenosString = item[ALERGENOS_COL] || "";

      if (!nameEN || !categoryEN) {
        console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row ${index + 2} (Visible) is MISSING ESSENTIAL DATA (Name EN or Category EN). Skipping. Data: ${JSON.stringify(item)}`);
        return null;
      }

      let finalImageUrl = `https://placehold.co/400x300.png`;
      let originalLinkImagen = linkImagen;
      if (linkImagen && linkImagen.toUpperCase() !== "FALSE" && linkImagen.trim() !== "") {
        linkImagen = transformGoogleDriveLink(linkImagen);
        if (isValidHttpUrl(linkImagen)) {
          finalImageUrl = linkImagen;
          console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${nameEN}' using valid image URL: '${finalImageUrl}' (Original from sheet: '${originalLinkImagen}')`);
        } else {
          console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${nameEN}' has an invalid image URL from sheet: '${originalLinkImagen}' (Transformed: '${linkImagen}'). Using placeholder.`);
        }
      }
      
      let imageHint = (nameEN || "food item").toLowerCase().split(' ').slice(0, 2).join(' ');
      if (!imageHint || imageHint === "food item") {
        imageHint = (categoryEN || "food plate").toLowerCase();
      }
      if (finalImageUrl.includes('placehold.co') && originalLinkImagen && !originalLinkImagen.toUpperCase().includes('FALSE') && originalLinkImagen.trim() !== '') {
        console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${nameEN}' fell back to placeholder. Original link was: '${originalLinkImagen}', Hint: '${imageHint}'`);
      } else if (finalImageUrl.includes('placehold.co')) {
         console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${nameEN}' using placeholder by default. Hint: '${imageHint}'`);
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

      console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Successfully processed item '${nameEN}'. Category Key: '${categoryKey}'`);
      return {
        id: `${categoryKey}-${index}-${Date.now()}`,
        name: {
          ca: (nameCA || nameES || nameEN || "Plat sense nom").trim(),
          es: (nameES || nameEN || nameCA || "Plato sin nombre").trim(),
          en: (nameEN || nameES || nameCA || "Unnamed Dish").trim(),
        },
        description: {
          ca: (descCA || descES || descEN || "").trim(),
          es: (descES || descEN || descCA || "").trim(),
          en: (descEN || descES || descCA || "").trim(),
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
  console.log(`API_ROUTE_LOGIC: Final allMenuItems before NextResponse.json (first 2):`, JSON.stringify(allMenuItems.slice(0, 2), null, 2));
  return allMenuItems;
}


// This is the Next.js API route handler
export async function GET() {
  console.log("API_ROUTE_GET_HANDLER: /api/menu GET handler INVOKED.");
  const menuItems = await fetchAndProcessMenuData();
  console.log(`API_ROUTE_GET_HANDLER: Responding with ${menuItems.length} menu items.`);
  const headers = new Headers();
  headers.append('Cache-Control', 's-maxage=1, stale-while-revalidate=59'); 

  return NextResponse.json(menuItems, { status: 200, headers });
}
