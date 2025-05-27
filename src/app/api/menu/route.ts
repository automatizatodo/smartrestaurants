
'use server';

import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';
// import restaurantConfig from '@/config/restaurant.config'; // No longer needed for prices
// import { parse as parseTime, isValid as isValidDate, format as formatDate, isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday } from 'date-fns'; // No longer needed for prices

// URL for the MAIN MENU sheet
let GOOGLE_SHEET_CSV_URL = process.env.GOOGLE_SHEET_MENU_CSV_URL || 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaa24KcQUVl_kLjJHeG9F-2JYbsA_2JfCcVnF3LEZTGzqe_11Fv4u6VLec7BSpCQGSo27w8qhgckQ0/pub?gid=0&single=true&output=csv';

// URL for the "preciosmenu" sheet - This logic will be removed/commented out
// let PRICES_SHEET_CSV_URL = process.env.GOOGLE_SHEET_PRICES_CSV_URL || 'REPLACE_WITH_YOUR_PRICES_SHEET_PUBLISH_TO_WEB_CSV_URL_HERE';


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

// Expected headers for validation for the main menu sheet
const EXPECTED_MENU_HEADERS = [
  VISIBLE_COL,
  CATEGORIA_CA_COL, CATEGORIA_ES_COL, CATEGORY_EN_COL,
  NOM_CA_COL, NOMBRE_ES_COL, NAME_EN_COL,
  DESCRIPCIO_CA_COL, DESCRIPCION_ES_COL, DESCRIPTION_EN_COL,
  PRECIO_COL,
  LINK_IMAGEN_COL, SUGERENCIA_CHEF_COL, ALERGENOS_COL
];

// Column Names for PRICES Sheet - This logic will be removed/commented out
// const DIA_COL_PRICE = "Día";
// const FRANJA_HORARIA_COL_PRICE = "Franja horaria";
// const PRECIO_MENU_COL_PRICE = "Precio (€)";

// const EXPECTED_PRICE_HEADERS = [
//   DIA_COL_PRICE, FRANJA_HORARIA_COL_PRICE, PRECIO_MENU_COL_PRICE
// ];

// interface PriceEntry {
//   dia: string;
//   franjaStart: string;
//   franjaEnd: string;
//   precio: string;
// }

export interface PriceSummary {
  weekdayPrice?: string;
  weekdayLabelKey?: string;
  weekendPrice?: string;
  weekendLabelKey?: string;
}

// Helper to map English category names from sheet to consistent categoryKeys
function mapCategoryToKey(categoryEN: string): string {
  if (!categoryEN) return 'other';
  const lowerCategory = categoryEN.toLowerCase().trim();
  switch (lowerCategory) {
    case 'starters': return 'starters';
    case 'main courses': return 'mainCourses'; // For "Primers Plats"
    case 'second courses': return 'secondCourses'; // For "Segon Plat"
    case 'grilled garnish': return 'grilledGarnish';
    case 'sauces': return 'sauces';
    case 'desserts': return 'desserts';
    case 'breads': return 'breads';
    case 'beverages': return 'beverages';
    case 'wines': return 'wines';
    default:
      // console.warn(`API_ROUTE_MAP_CATEGORY: Unmapped category EN: "${categoryEN}" - using direct key: "${lowerCategory.replace(/\s+/g, '')}"`);
      return lowerCategory.replace(/\s+/g, '') || 'other';
  }
}

function parseCSV(csvText: string, expectedHeaders: string[], logPrefix: string = "PARSE_CSV"): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
  // console.log(`${logPrefix}: Received CSV text length: ${csvText.length}`);

  if (lines.length < 2) {
    // console.warn(`${logPrefix}: CSV content is too short (less than 2 lines) or headers are missing. Lines found: ${lines.length}`);
    // if (lines.length === 1) console.warn(`${logPrefix}: Headers received: ${lines[0]}`);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  // console.log(`${logPrefix}: Headers found in sheet: [${headersFromSheet.join(", ")}]`);
  // console.log(`${logPrefix}: Expected headers: [${expectedHeaders.join(", ")}]`);


  const missingHeaders = expectedHeaders.filter(eh => !headersFromSheet.includes(eh));
  if (missingHeaders.length > 0) {
    console.error(`${logPrefix}: Critical header mismatch. Missing expected headers: [${missingHeaders.join(", ")}]. Sheet headers: [${headersFromSheet.join(", ")}]. Cannot process sheet.`);
    return [];
  }

  const extraHeaders = headersFromSheet.filter(sh => !expectedHeaders.includes(sh));
  if (extraHeaders.length > 0) {
    // console.warn(`${logPrefix}: Warning: Sheet contains extra headers not in expected_headers: [${extraHeaders.join(", ")}]. These will be ignored.`);
  }

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
      // console.warn(`${logPrefix}: Skipping empty CSV line ${i + 1}`);
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
      // console.warn(`${logPrefix}: Skipping malformed CSV line ${i + 1}. Expected at least ${headersFromSheet.length} values, got ${values.length}. Line content: "${lines[i]}"`);
    }
  }
  // console.log(`${logPrefix}: Parsed ${jsonData.length} data rows.`);
  return jsonData;
}

function isValidHttpUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  let urlToParse = urlStr;
  try {
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://') && urlToParse.includes('.') && !urlToParse.includes(' ')) {
      urlToParse = 'https://' + urlToParse;
    }
    const url = new URL(urlToParse);
    const isValid = url.protocol === "http:" || url.protocol === "https:";
    // if (!isValid) {
    //   console.warn(`API_ROUTE_LOGIC_IS_VALID_URL: URL '${urlStr}' (parsed as '${urlToParse}') is NOT valid (protocol: ${url.protocol}). Expected 'http:' or 'https:'.`);
    // }
    return isValid;
  } catch (e: any) {
    // console.warn(`API_ROUTE_LOGIC_IS_VALID_URL: Failed to parse URL '${urlStr}' (attempted as '${urlToParse}'). Error: ${e.message}`);
    return false;
  }
}


async function fetchRawCsvData(url: string, logPrefix: string): Promise<string | null> {
  if (!url || url.includes('REPLACE_WITH_YOUR_') || url.includes('URL_HERE')) {
    console.error(`${logPrefix}: CRITICAL - URL is not configured correctly: ${url}. Please update it in environment variables or src/app/api/menu/route.ts`);
    return null;
  }

  const fetchUrl = url.includes('?') ? `${url}&timestamp=${new Date().getTime()}` : `${url}?timestamp=${new Date().getTime()}`;

  try {
    const response = await fetch(fetchUrl, { cache: 'no-store' }); // Always fetch fresh for GSheets
    // console.log(`${logPrefix}: Response status from Google Sheets: ${response.status} ${response.statusText} for URL: ${fetchUrl}`);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `${logPrefix}: Failed to fetch CSV. Status: ${response.status}. URL: ${fetchUrl}. Response: ${errorText.substring(0, 500)}...`;
      if (response.status === 401 || response.status === 403) {
        errorMessage += ` This often means the Google Sheet is not published correctly or access is restricted. Please check "File > Share > Publish to web" settings for the sheet and ensure it's public.`;
      } else if (response.status === 400 && errorText.toLowerCase().includes('page not found')) {
        errorMessage += ` This "Page Not Found" error from Google Sheets usually means the specific published CSV link is incorrect, has changed, or the sheet/document is no longer published as expected. Verify the 'Publish to web' CSV link for the specific sheet.`;
      }
      console.error(errorMessage);
      return null;
    }

    const csvText = await response.text();
    // console.log(`${logPrefix}: Successfully fetched CSV. Length: ${csvText.length}. Preview (first 500 chars): ${csvText.substring(0, 500)}`);

    if (!csvText.trim()) {
      // console.warn(`${logPrefix}: Fetched CSV is empty. URL: ${fetchUrl}. Ensure sheet is published and has content.`);
      return null;
    }
    return csvText;
  } catch (error: any) {
    console.error(`${logPrefix}: Unhandled error fetching CSV from ${fetchUrl}: ${error.message}`, error.stack);
    return null;
  }
}

// Commenting out price fetching logic as it's no longer used
/*
async function getCurrentMenuPrice(): Promise<string | null> {
  // ... (previous logic for fetching and determining price from PRICES_SHEET_CSV_URL)
  return restaurantConfig.menuDelDia?.price || null; // Fallback if dynamic price is removed
}

async function generatePriceSummary(): Promise<PriceSummary> {
  // ... (previous logic for fetching and determining price summary from PRICES_SHEET_CSV_URL)
  return {}; // Return empty summary if dynamic price is removed
}
*/

export async function fetchAndProcessMenuData(): Promise<{ menuItems: MenuItemData[], currentMenuPrice: string | null, priceSummary: PriceSummary }> {
  // console.log("API_ROUTE_LOGIC_MENU: fetchAndProcessMenuData called.");

  // Ensure GOOGLE_SHEET_CSV_URL is updated with the correct value
  if (GOOGLE_SHEET_CSV_URL === 'REPLACE_WITH_YOUR_MAIN_MENU_SHEET_PUBLISH_TO_WEB_CSV_URL_HERE') {
      console.error("API_ROUTE_LOGIC_MENU: CRITICAL - GOOGLE_SHEET_CSV_URL is still set to the placeholder. Update it in src/app/api/menu/route.ts or environment variables.");
      return { menuItems: [], currentMenuPrice: null, priceSummary: {} };
  }
  if (process.env.GOOGLE_SHEET_MENU_CSV_URL && process.env.GOOGLE_SHEET_MENU_CSV_URL !== 'YOUR_ENV_VARIABLE_FOR_MENU_SHEET_URL') {
    GOOGLE_SHEET_CSV_URL = process.env.GOOGLE_SHEET_MENU_CSV_URL;
  } else if (!process.env.GOOGLE_SHEET_MENU_CSV_URL && GOOGLE_SHEET_CSV_URL.includes('REPLACE_WITH_YOUR_MAIN_MENU_SHEET_PUBLISH_TO_WEB_CSV_URL_HERE')) {
    console.error("API_ROUTE_LOGIC_MENU: CRITICAL - GOOGLE_SHEET_MENU_CSV_URL env var not set and code placeholder is active.");
    return { menuItems: [], currentMenuPrice: null, priceSummary: {} };
  }
  // console.log(`API_ROUTE_LOGIC_MENU: Using menu sheet URL: ${GOOGLE_SHEET_CSV_URL}`);

  const menuCsvText = await fetchRawCsvData(GOOGLE_SHEET_CSV_URL, "MENU_SHEET_FETCH");
  let allMenuItems: MenuItemData[] = [];

  if (menuCsvText) {
    const parsedMenuData = parseCSV(menuCsvText, EXPECTED_MENU_HEADERS, "MENU_SHEET_PARSE");
    // if (parsedMenuData.length === 0 && menuCsvText.trim().length > 0 && !menuCsvText.trim().startsWith(EXPECTED_MENU_HEADERS[0])) {
        // console.warn("API_ROUTE_LOGIC_MENU: Menu CSV parsing resulted in 0 items, but CSV text was not empty. This strongly suggests a header mismatch or structural issue with the CSV that parseCSV couldn't handle based on EXPECTED_MENU_HEADERS.");
    // }

    // let visibleItemsCount = 0;
    allMenuItems = parsedMenuData.map((item: Record<string, string>, index: number) => {
      // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Row ${index + 2} RAW: ${JSON.stringify(item)}`);

      const visibleString = (item[VISIBLE_COL] || "TRUE").trim();
      const isVisible = ["TRUE", "VERDADERO", "SÍ", "SI", "1"].includes(visibleString.toUpperCase());


      if (!isVisible) {
        // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${(item[NAME_EN_COL] || item[NOMBRE_ES_COL] || "Unnamed")}' at row ${index + 2} is marked as NOT VISIBLE ('${visibleString}'). Skipping.`);
        return null;
      }
      // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${(item[NAME_EN_COL] || item[NOMBRE_ES_COL] || "Unnamed")}' at row ${index + 2} IS VISIBLE.`);
      // visibleItemsCount++;

      const nameCA = item[NOM_CA_COL];
      const nameES = item[NOMBRE_ES_COL];
      const nameEN = item[NAME_EN_COL];
      const descCA = item[DESCRIPCIO_CA_COL] || "";
      const descES = item[DESCRIPCION_ES_COL] || "";
      const descEN = item[DESCRIPTION_EN_COL] || "";
      const categoryCA = item[CATEGORIA_CA_COL];
      const categoryES = item[CATEGORIA_ES_COL];
      const categoryEN = item[CATEGORY_EN_COL];
      const priceFromSheet = item[PRECIO_COL];
      let linkImagenFromSheet = item[LINK_IMAGEN_COL] || "";
      const sugerenciaChefString = item[SUGERENCIA_CHEF_COL] || "FALSE";
      const alergenosString = item[ALERGENOS_COL] || "";

      if (!nameCA && !nameES && !nameEN) {
        // console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row ${index + 2} (Visible) is MISSING ALL NAME DATA. Skipping. Data: ${JSON.stringify(item)}`);
        return null;
      }
      const primaryCategoryEN = categoryEN || categoryES || categoryCA; // Prefer English for key mapping
      if (!primaryCategoryEN) {
         // console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row ${index + 2} (Visible) has NO CATEGORY AT ALL. Skipping. Data: ${JSON.stringify(item)}`);
        return null;
      }
      const categoryKey = mapCategoryToKey(primaryCategoryEN);

      const primaryNameEN = nameEN || nameES || nameCA || "Unnamed Dish";

      let finalImageUrl = 'https://placehold.co/400x300.png'; // Default placeholder
      // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' has image link from sheet: '${linkImagenFromSheet}'`);

      if (linkImagenFromSheet && linkImagenFromSheet.toUpperCase() !== "FALSE" && linkImagenFromSheet.trim() !== "") {
        if (isValidHttpUrl(linkImagenFromSheet)) {
          finalImageUrl = linkImagenFromSheet;
          // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' using valid image URL from sheet: '${finalImageUrl}'`);
        } else {
            // console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' has an invalid or unusable image URL from sheet: '${linkImagenFromSheet}'. Using placeholder.`);
        }
      } else {
        // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' has no image link or is marked FALSE. Using placeholder.`);
      }

      let imageHint = (nameEN || nameES || nameCA || "food item").toLowerCase().split(' ').slice(0, 2).join(' ');
      if (!imageHint || imageHint === "food item") {
        imageHint = (categoryEN || categoryES || categoryCA || "food plate").toLowerCase();
      }

      let formattedPrice: string | undefined = undefined;
      if (priceFromSheet !== undefined && priceFromSheet !== null && priceFromSheet.trim() !== "" && priceFromSheet.toUpperCase() !== "FALSE" && priceFromSheet.toUpperCase() !== "N/A") {
        const numericPrice = parseFloat(priceFromSheet.replace('€', '').replace(',', '.').trim());
        if (!isNaN(numericPrice)) {
          formattedPrice = '€' + numericPrice.toFixed(2);
        } else {
          // console.warn(`API_ROUTE_LOGIC_ITEM_PROCESSING: Could not parse price '${priceFromSheet}' for item '${primaryNameEN}' into a number.`);
        }
      }

      const allergens = alergenosString.split(',')
        .map(a => a.trim().toLowerCase())
        .filter(a => a.length > 0 && a !== "false" && a !== "n/a");

      const isChefSuggestion = ['true', 'verdadero', 'sí', 'si', '1', 'TRUE', 'VERDADERO', 'SÍ', 'SI'].includes(sugerenciaChefString.toLowerCase().trim());
      // if (isChefSuggestion) console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' IS a chef suggestion.`);

      const menuItem: MenuItemData = {
        id: `${categoryKey}-${index}-${Date.now()}`, // More unique ID
        name: {
          ca: (nameCA || nameES || nameEN || "").trim(),
          es: (nameES || nameCA || nameEN || "").trim(),
          en: (nameEN || nameES || nameCA || "").trim(),
        },
        description: {
          ca: (descCA || descES || descEN || "").trim() || "",
          es: (descES || descCA || descEN || "").trim() || "",
          en: (descEN || descES || descCA || "").trim() || "",
        },
        price: formattedPrice,
        categoryKey: categoryKey,
        imageUrl: finalImageUrl,
        imageHint: imageHint,
        allergens: allergens.length > 0 ? allergens : undefined,
        isChefSuggestion: isChefSuggestion,
      };
      // console.log(`API_ROUTE_LOGIC_ITEM_PROCESSING: Successfully processed item: ${JSON.stringify(menuItem)}`);
      return menuItem;
    }).filter(item => item !== null) as MenuItemData[];

    // console.log(`API_ROUTE_LOGIC_MENU: Total items marked as visible: ${visibleItemsCount}`);
    // console.log(`API_ROUTE_LOGIC_MENU: Mapped to ${allMenuItems.length} valid MenuItemData objects after filtering invisible and invalid items.`);

  } else {
    // console.warn("API_ROUTE_LOGIC_MENU: Menu CSV text was null. No menu items processed.");
  }

  // if (allMenuItems.length === 0 && menuCsvText) {
    // console.warn("API_ROUTE_LOGIC_MENU: All parsed items were filtered out or invalid during mapping. Check mapping logic and data consistency, especially the 'Visible' column and essential fields like names/categories.");
  // } else if (allMenuItems.length === 0) {
    // console.warn("API_ROUTE_LOGIC_MENU: No menu items were successfully processed. Check GID, sheet publishing status (File > Share > Publish to web > CSV), header names, and data content in your Google Sheet.");
  // }

  // Removed dynamic price fetching
  const currentMenuPrice = null; // restaurantConfig.menuDelDia?.price || null;
  const priceSummaryData = {}; // Removed call to generatePriceSummary()

  // console.log(`API_ROUTE_LOGIC_MENU: Current menu price (fallback): ${currentMenuPrice}`);
  // console.log(`API_ROUTE_LOGIC_MENU: Price summary (empty): ${JSON.stringify(priceSummaryData)}`);

  const result = { menuItems: allMenuItems, currentMenuPrice, priceSummary: priceSummaryData };
  // console.log(`API_ROUTE_LOGIC_MENU: Final result before NextResponse.json. Items count: ${result.menuItems ? result.menuItems.length : 0}. Price: ${result.currentMenuPrice}. Summary: ${JSON.stringify(result.priceSummary)}`);
  return result;
}

// GET handler for the /api/menu route
export async function GET() {
  // console.log("API_ROUTE_GET_MENU: /api/menu GET handler INVOKED.");
  const { menuItems, currentMenuPrice, priceSummary } = await fetchAndProcessMenuData();

  const headers = new Headers();
  headers.append('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache for 1 min, stale for 5 min

  // console.log(`API_ROUTE_GET_MENU: Total menu items processed: ${menuItems ? menuItems.length : 0}. Current price: ${currentMenuPrice}. Sending response with price summary: ${JSON.stringify(priceSummary)}`);
  return NextResponse.json({ menuItems, currentMenuPrice, priceSummary }, { status: 200, headers });
}
