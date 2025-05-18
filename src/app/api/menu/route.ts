
'use server';

import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';
import restaurantConfig from '@/config/restaurant.config';
import { parse as parseTime, isValid as isValidDate, format as formatDate } from 'date-fns';

// URL for the MAIN MENU sheet
let GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaa24KcQUVl_kLjJHeG9F-2JYbsA_2JfCcVnF3LEZTGzqe_11Fv4u6VLec7BSpCQGSo27w8qhgckQ0/pub?output=csv';

// URL for the "preciosmenu" sheet - MAKE SURE THIS IS THE CORRECT PUBLISHED CSV LINK FOR THE "preciosmenu" TAB
let PRICES_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaa24KcQUVl_kLjJHeG9F-2JYbsA_2JfCcVnF3LEZTGzqe_11Fv4u6VLec7BSpCQGSo27w8qhgckQ0/pub?gid=1458714483&single=true&output=csv';


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

// Expected headers for validation
const EXPECTED_HEADERS = [
  VISIBLE_COL,
  CATEGORIA_CA_COL, CATEGORIA_ES_COL, CATEGORY_EN_COL,
  NOM_CA_COL, NOMBRE_ES_COL, NAME_EN_COL,
  DESCRIPCIO_CA_COL, DESCRIPCION_ES_COL, DESCRIPTION_EN_COL,
  PRECIO_COL,
  LINK_IMAGEN_COL, SUGERENCIA_CHEF_COL, ALERGENOS_COL
];

// Column Names for PRICES Sheet
const DIA_COL_PRICE = "Día";
const FRANJA_HORARIA_COL_PRICE = "Franja horaria";
const PRECIO_MENU_COL_PRICE = "Precio (€)";

const EXPECTED_PRICE_HEADERS = [
  DIA_COL_PRICE, FRANJA_HORARIA_COL_PRICE, PRECIO_MENU_COL_PRICE
];

interface PriceEntry {
  dia: string;
  franjaStart: string;
  franjaEnd: string;
  precio: string;
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
      // console.warn("API_ROUTE_MAP_CATEGORY: Unmapped category EN: " + categoryEN + " - using direct key: " + lowerCategory.replace(/\s+/g, ''));
      return lowerCategory.replace(/\s+/g, '') || 'other';
  }
}

function parseCSV(csvText: string, expectedHeaders: string[], logPrefix: string = "PARSE_CSV"): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== '');
  // console.log(logPrefix + ": Received CSV text length: " + csvText.length);

  if (lines.length < 2) {
    // console.warn(logPrefix + ": CSV content is too short (less than 2 lines) or headers are missing. Lines found: " + lines.length);
    // if (lines.length === 1) console.warn(logPrefix + ": Headers received: " + lines[0]);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));
  // console.log(logPrefix + ": Headers found in sheet: [" + headersFromSheet.join(", ") + "]");
  // console.log(logPrefix + ": Expected headers: [" + expectedHeaders.join(", ") + "]");


  const missingHeaders = expectedHeaders.filter(eh => !headersFromSheet.includes(eh));
  if (missingHeaders.length > 0) {
    console.error(logPrefix + ": Critical header mismatch. Missing expected headers: [" + missingHeaders.join(", ") + "]. Sheet headers: [" + headersFromSheet.join(", ") + "]. Cannot process sheet.");
    return [];
  }

  const extraHeaders = headersFromSheet.filter(sh => !expectedHeaders.includes(sh));
  if (extraHeaders.length > 0) {
    // console.warn(logPrefix + ": Warning: Sheet contains extra headers not in expected_headers: [" + extraHeaders.join(", ") + "]. These will be ignored.");
  }

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
      // console.warn(logPrefix + ": Skipping empty CSV line " + (i + 1));
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
      // console.warn(logPrefix + ": Skipping malformed CSV line " + (i + 1) + ". Expected at least " + headersFromSheet.length + " values, got " + values.length + ". Line content: "" + lines[i] + """);
    }
  }
  // console.log(logPrefix + ": Parsed " + jsonData.length + " data rows.");
  return jsonData;
}

function isValidHttpUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  let url;
  try {
    // Attempt to prepend https if protocol is missing and it looks like a domain
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://') && urlStr.includes('.') && !urlStr.includes(' ')) {
      // console.log(`API_ROUTE_LOGIC_IS_VALID_URL: Prepending https:// to '${urlStr}'`);
      urlStr = 'https://' + urlStr;
    }
    url = new URL(urlStr);
  } catch (e: any) {
    // console.warn("API_ROUTE_LOGIC_IS_VALID_URL: Failed to parse URL '" + urlStr + "'. Error: " + e.message);
    return false;
  }
  const isValid = url.protocol === "http:" || url.protocol === "https://";
  // if (isValid) console.log(`API_ROUTE_LOGIC_IS_VALID_URL: URL '${urlStr}' is valid.`);
  // else console.warn(`API_ROUTE_LOGIC_IS_VALID_URL: URL '${urlStr}' is NOT valid (protocol: ${url.protocol}).`);
  return isValid;
}

function transformGoogleDriveLink(originalUrl: string): string | null {
  // console.log(`API_ROUTE_LOGIC_TRANSFORM_GDRIVE: Attempting to transform Google Drive link: ${originalUrl}`);
  if (originalUrl && originalUrl.includes('drive.google.com')) {
    const fileIdMatch = originalUrl.match(/file\/d\/([a-zA-Z0-9_-]+)\/view/);
    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      // console.log(`API_ROUTE_LOGIC_TRANSFORM_GDRIVE: Matched Google Drive file/d/ link. File ID: ${fileId}`);
      const transformed = `https://drive.google.com/uc?export=view&id=${fileId}`;
      // console.log(`API_ROUTE_LOGIC_TRANSFORM_GDRIVE: Transformed Google Drive link to: ${transformed}`);
      return transformed;
    }
    // console.log(`API_ROUTE_LOGIC_TRANSFORM_GDRIVE: Link is Google Drive but does not match file/d/ pattern: ${originalUrl}`);
  }
  // console.log(`API_ROUTE_LOGIC_TRANSFORM_GDRIVE: Link is not a transformable Google Drive link: ${originalUrl}`);
  return originalUrl; // Return original if not a GDrive link or no match
}

async function fetchRawCsvData(url: string, logPrefix: string): Promise<string | null> {
  if (!url || url.includes('YOUR_') || url.includes('REPLACE_WITH_')) {
    console.error(logPrefix + ": CRITICAL - URL is not configured correctly: " + url + ". Please update it in src/app/api/menu/route.ts");
    return null;
  }

  const fetchUrl = url + '&timestamp=' + new Date().getTime(); // Cache busting

  try {
    const response = await fetch(fetchUrl, { cache: 'no-store' }); 

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = logPrefix + ": Failed to fetch CSV. Status: " + response.status + ". URL: " + fetchUrl + ". Response: " + errorText.substring(0, 500) + "...";
      if (response.status === 401 || response.status === 403) {
        errorMessage += " This often means the Google Sheet is not published correctly or access is restricted. Please check 'File > Share > Publish to web' settings for the sheet and ensure it's public.";
      } else if (response.status === 400 && errorText.toLowerCase().includes('page not found')) {
        errorMessage += " This 'Page Not Found' error from Google Sheets usually means the specific published CSV link is incorrect, has changed, or the sheet/document is no longer published as expected. Verify the 'Publish to web' CSV link for the specific sheet.";
      }
      console.error(errorMessage);
      return null;
    }

    const csvText = await response.text();
    // console.log(logPrefix + ": Successfully fetched CSV. Length: " + csvText.length + ". Preview (first 500 chars): " + csvText.substring(0, 500));

    if (!csvText.trim()) {
      // console.warn(logPrefix + ": Fetched CSV is empty. URL: " + fetchUrl + ". Ensure sheet is published and has content.");
      return null;
    }
    return csvText;
  } catch (error: any) {
    console.error(logPrefix + ": Unhandled error fetching CSV from " + fetchUrl + ": " + error.message, error.stack);
    return null;
  }
}

async function getCurrentMenuPrice(): Promise<string | null> {
  const csvText = await fetchRawCsvData(PRICES_SHEET_CSV_URL, "PRICE_SHEET_FETCH");
  if (!csvText) {
    // console.warn("API_ROUTE_GET_PRICE: Failed to fetch price sheet CSV. Using fallback price.");
    return restaurantConfig.menuDelDia?.price || null;
  }

  const parsedPriceData = parseCSV(csvText, EXPECTED_PRICE_HEADERS, "PRICE_SHEET_PARSE");
  if (parsedPriceData.length === 0) {
    // console.warn("API_ROUTE_GET_PRICE: No data rows parsed from price sheet. Using fallback price.");
    return restaurantConfig.menuDelDia?.price || null;
  }

  const priceEntries: PriceEntry[] = parsedPriceData.map(row => {
    const [start, end] = (row[FRANJA_HORARIA_COL_PRICE] || "00:00-00:00").split(/\s*-\s*/);
    return {
      dia: (row[DIA_COL_PRICE] || "").trim(),
      franjaStart: start.trim(),
      franjaEnd: end.trim(),
      precio: (row[PRECIO_MENU_COL_PRICE] || "").trim()
    };
  }).filter(entry => entry.dia && entry.precio);

  const timeZone = restaurantConfig.timeZone;
  const nowUtc = new Date();

  let currentDayNameInSpain;
  try {
    const dayFormatter = new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone });
    const dayNameLower = dayFormatter.format(nowUtc);
    currentDayNameInSpain = dayNameLower.charAt(0).toUpperCase() + dayNameLower.slice(1);
  } catch (e) {
    console.error("API_ROUTE_GET_PRICE: Error formatting day for timezone", timeZone, e);
    currentDayNameInSpain = new Date().toLocaleDateString('es-ES', { weekday: 'long' }); // Fallback
    currentDayNameInSpain = currentDayNameInSpain.charAt(0).toUpperCase() + currentDayNameInSpain.slice(1);
  }

  let currentTimeFormattedInSpain;
  try {
    const timeFormatter = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    currentTimeFormattedInSpain = timeFormatter.format(nowUtc);
  } catch (e) {
    console.error("API_ROUTE_GET_PRICE: Error formatting time for timezone", timeZone, e);
    const localNow = new Date(); // Fallback
    currentTimeFormattedInSpain = String(localNow.getHours()).padStart(2, '0') + ':' + String(localNow.getMinutes()).padStart(2, '0');
  }
  

  for (const entry of priceEntries) {
    if (entry.dia.toLowerCase() === currentDayNameInSpain.toLowerCase()) {
      try {
        const baseDateStr = formatDate(nowUtc, 'yyyy-MM-dd'); // Use a consistent base date for parsing times
        const entryStartTime = parseTime(baseDateStr + " " + entry.franjaStart, 'yyyy-MM-dd HH:mm', new Date());
        const entryEndTime = parseTime(baseDateStr + " " + entry.franjaEnd, 'yyyy-MM-dd HH:mm', new Date());
        const currentTime = parseTime(baseDateStr + " " + currentTimeFormattedInSpain, 'yyyy-MM-dd HH:mm', new Date());
        
        if (isValidDate(entryStartTime) && isValidDate(entryEndTime) && isValidDate(currentTime)) {
            if (currentTime >= entryStartTime && currentTime <= entryEndTime) {
              // console.log("API_ROUTE_GET_PRICE: Matched price entry for " + entry.dia + " " + entry.franjaStart + "-" + entry.franjaEnd + ": " + entry.precio);
              return entry.precio;
            }
        } else {
            // console.warn("API_ROUTE_GET_PRICE: Invalid date parsed for entry time comparison: " + JSON.stringify(entry) + ", currentTime: " + currentTimeFormattedInSpain);
        }
      } catch (e) {
        // console.warn("API_ROUTE_GET_PRICE: Could not parse time range for entry: " + JSON.stringify(entry), e);
      }
    }
  }
  // console.log("API_ROUTE_GET_PRICE: No matching price entry found for " + currentDayNameInSpain + " " + currentTimeFormattedInSpain + ". Using fallback price.");
  return restaurantConfig.menuDelDia?.price || null;
}


export async function fetchAndProcessMenuData(): Promise<{ menuItems: MenuItemData[], currentMenuPrice: string | null }> {
  // console.log("API_ROUTE_LOGIC_MENU: fetchAndProcessMenuData called.");
  
  const menuCsvText = await fetchRawCsvData(GOOGLE_SHEET_CSV_URL, "MENU_SHEET_FETCH");
  let allMenuItems: MenuItemData[] = [];

  if (menuCsvText) {
    const parsedMenuData = parseCSV(menuCsvText, EXPECTED_HEADERS, "MENU_SHEET_PARSE");
    if (parsedMenuData.length === 0 && menuCsvText.trim().length > 0 && !menuCsvText.trim().startsWith(EXPECTED_HEADERS[0])) {
        // console.warn("API_ROUTE_LOGIC_MENU: Menu CSV parsing resulted in 0 items, but CSV text was not empty. This strongly suggests a header mismatch or structural issue with the CSV that parseCSV couldn't handle based on EXPECTED_HEADERS.");
    }

    let visibleItemsCount = 0;
    allMenuItems = parsedMenuData.map((item: Record<string, string>, index: number) => {
      // console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Row " + (index + 2) + " RAW: " + JSON.stringify(item));

      const visibleString = (item[VISIBLE_COL] || "TRUE").trim(); 
      const isVisible = (visibleString.toUpperCase() === "TRUE" || visibleString === "1" || visibleString.toUpperCase() === "SÍ" || visibleString.toUpperCase() === "VERDADERO");
      
      if (!isVisible) {
        // console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + (item[NAME_EN_COL] || item[NOMBRE_ES_COL] || "Unnamed") + "' at row " + (index + 2) + " is marked as NOT VISIBLE ('" + visibleString + "'). Skipping.");
        return null;
      }
      // console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + (item[NAME_EN_COL] || item[NOMBRE_ES_COL] || "Unnamed") + "' at row " + (index + 2) + " IS VISIBLE.");
      visibleItemsCount++;
      
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
        // console.warn("API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row " + (index + 2) + " (Visible) is MISSING ALL NAME DATA. Skipping. Data: " + JSON.stringify(item));
        return null;
      }
      const primaryCategoryEN = categoryEN || categoryES || categoryCA;
      if (!primaryCategoryEN) {
        //  console.warn("API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row " + (index + 2) + " (Visible) has NO CATEGORY AT ALL. Skipping. Data: " + JSON.stringify(item));
        return null;
      }
      const categoryKey = mapCategoryToKey(primaryCategoryEN);
      
      const primaryNameEN = nameEN || nameES || nameCA || "Unnamed Dish"; 
      
      let finalImageUrl = 'https://placehold.co/400x300.png'; // Default placeholder
      console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + primaryNameEN + "' has image link from sheet: '" + linkImagenFromSheet + "'");
      if (linkImagenFromSheet && linkImagenFromSheet.toUpperCase() !== "FALSE" && linkImagenFromSheet.trim() !== "") {
        const transformedUrl = transformGoogleDriveLink(linkImagenFromSheet);
        console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + primaryNameEN + "' transformed URL: '" + transformedUrl + "' (original: '" + linkImagenFromSheet + "')");
        
        if (transformedUrl && isValidHttpUrl(transformedUrl)) {
          finalImageUrl = transformedUrl;
          console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + primaryNameEN + "' using valid image URL from sheet (potentially transformed): '" + finalImageUrl + "'");
        } else {
            console.warn("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + primaryNameEN + "' has an invalid or unusable image URL from sheet: '" + linkImagenFromSheet + "' (transformed: '" + transformedUrl + "'). Using placeholder.");
        }
      } else {
        console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Item '" + primaryNameEN + "' has no image link or is marked FALSE. Using placeholder.");
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
        id: categoryKey + '-' + index + '-' + Date.now(), 
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
      // console.log("API_ROUTE_LOGIC_ITEM_PROCESSING: Successfully processed item: " + JSON.stringify(menuItem));
      return menuItem;
    }).filter(item => item !== null) as MenuItemData[];

    // console.log("API_ROUTE_LOGIC_MENU: Total items marked as visible: " + visibleItemsCount);
    // console.log("API_ROUTE_LOGIC_MENU: Mapped to " + allMenuItems.length + " valid MenuItemData objects after filtering invisible and invalid items.");
  
  } else {
     // console.warn("API_ROUTE_LOGIC_MENU: Menu CSV text was null. No menu items processed.");
  }

  if (allMenuItems.length === 0 && menuCsvText) {
    // console.warn("API_ROUTE_LOGIC_MENU: All parsed items were filtered out or invalid during mapping. Check mapping logic and data consistency, especially the 'Visible' column and essential fields like names/categories.");
  } else if (allMenuItems.length === 0) {
    // console.warn("API_ROUTE_LOGIC_MENU: No menu items were successfully processed. Check GID, sheet publishing status (File > Share > Publish to web > CSV), header names, and data content in your Google Sheet.");
  }
  
  const currentMenuPrice = await getCurrentMenuPrice();
  // console.log("API_ROUTE_LOGIC_MENU: Current menu price determined: " + currentMenuPrice);

  const result = { menuItems: allMenuItems, currentMenuPrice };
  // console.log("API_ROUTE_LOGIC_MENU: Final result before NextResponse.json: " + JSON.stringify(result).substring(0, 300) + "...");
  return result;
}

// GET handler for the /api/menu route
export async function GET() {
  // console.log("API_ROUTE_GET_MENU: /api/menu GET handler INVOKED.");
  const { menuItems, currentMenuPrice } = await fetchAndProcessMenuData();
  
  const headers = new Headers();
  // Cache for 1 second on CDN, allow stale-while-revalidate for 59 seconds
  // This means CDN will serve stale content for up to a minute while revalidating in the background
  // Good for dynamic content that doesn't need to be real-time to the millisecond
  headers.append('Cache-Control', 's-maxage=1, stale-while-revalidate=59'); 

  // console.log("API_ROUTE_GET_MENU: Total menu items processed: " + menuItems.length + ". Sending response.");
  return NextResponse.json({ menuItems, currentMenuPrice }, { status: 200, headers });
}

