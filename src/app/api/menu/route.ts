
'use server';

import { NextResponse } from 'next/server';
import type { MenuItemData, MenuItemText } from '@/data/menu';
import restaurantConfig from '@/config/restaurant.config'; // For fallback price
import { parse as parseTime, isValid as isValidDate, format as formatDate } from 'date-fns';

// URL for the MAIN MENU sheet
let GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRaa24KcQUVl_kLjJHeG9F-2JYbsA_2JfCcVnF3LEZTGzqe_11Fv4u6VLec7BSpCQGSo27w8qhgckQ0/pub?output=csv';

// URL for the "preciosmenu" sheet
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

const EXPECTED_MENU_HEADERS = [
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
    case 'main courses': return 'mainCourses';
    case 'second courses': return 'secondCourses';
    case 'grilled garnish': return 'grilledGarnish';
    case 'sauces': return 'sauces';
    case 'desserts': return 'desserts';
    case 'breads': return 'breads';
    case 'beverages': return 'beverages';
    case 'wines': return 'wines';
    default:
      return lowerCategory.replace(/\s+/g, '') || 'other';
  }
}

function parseCSV(csvText: string, expectedHeaders: string[], logPrefix: string = "PARSE_CSV"): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n|\r/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    // console.warn(logPrefix + ': CSV content is too short (less than 2 lines) or headers are missing. Lines found: ' + lines.length);
    // if (lines.length === 1) console.warn(logPrefix + ': Headers received: ' + lines[0]);
    return [];
  }

  const headersFromSheet = lines[0].split(',').map(header => header.trim().replace(/^"|"$/g, ''));

  const missingHeaders = expectedHeaders.filter(eh => !headersFromSheet.includes(eh));
  if (missingHeaders.length > 0) {
    console.error(logPrefix + ': Critical header mismatch. Missing expected headers: [' + missingHeaders.join(", ") + ']. Sheet headers: [' + headersFromSheet.join(", ") + ']. Cannot process sheet.');
    return [];
  }

  const extraHeaders = headersFromSheet.filter(sh => !expectedHeaders.includes(sh));
  if (extraHeaders.length > 0) {
    // console.warn(logPrefix + ': Warning: Sheet contains extra headers not in expected_headers: [' + extraHeaders.join(", ") + ']. These will be ignored.');
  }

  const jsonData = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) {
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
      // console.warn(logPrefix + ': Skipping malformed CSV line ' + (i + 1) + '. Expected at least ' + headersFromSheet.length + ' values, got ' + values.length + '. Line content: "' + lines[i] + '"');
    }
  }
  return jsonData;
}

function isValidHttpUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;
  let url;
  try {
    // Attempt to prepend https if protocol is missing and it looks like a domain
    if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://') && urlStr.includes('.') && !urlStr.includes(' ')) {
      urlStr = 'https://' + urlStr;
    }
    url = new URL(urlStr);
  } catch (e: any) {
    // console.warn("API_ROUTE_LOGIC_IS_VALID_URL: Failed to parse URL '" + urlStr + "'. Error: " + e.message);
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https://";
}


async function fetchRawCsvData(url: string, logPrefix: string): Promise<string | null> {
  if (!url || url.includes('YOUR_') || url.includes('REPLACE_WITH_')) {
    console.error(logPrefix + ': CRITICAL - URL is not configured correctly: ' + url + '. Please update it in src/app/api/menu/route.ts');
    return null;
  }

  const fetchUrl = url + '&timestamp=' + new Date().getTime(); // Cache busting

  try {
    const response = await fetch(fetchUrl, { cache: 'no-store' }); 

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = logPrefix + ': Failed to fetch CSV. Status: ' + response.status + '. URL: ' + fetchUrl + '. Response: ' + errorText.substring(0, 500) + '...';
      if (response.status === 401 || response.status === 403) {
        errorMessage += ' This often means the Google Sheet is not published correctly or access is restricted. Please check "File > Share > Publish to web" settings for the sheet and ensure it\'s public.';
      } else if (response.status === 400 && errorText.toLowerCase().includes('page not found')) {
        errorMessage += ' This "Page Not Found" error from Google Sheets usually means the specific published CSV link is incorrect, has changed, or the sheet/document is no longer published as expected. Verify the "Publish to web" CSV link for the specific sheet.';
      }
      console.error(errorMessage);
      return null;
    }

    const csvText = await response.text();

    if (!csvText.trim()) {
      // console.warn(logPrefix + ': Fetched CSV is empty. URL: ' + fetchUrl + '. Ensure sheet is published and has content.');
      return null;
    }
    return csvText;
  } catch (error: any) {
    console.error(logPrefix + ': Unhandled error fetching CSV: ' + error.message, error.stack);
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
    currentDayNameInSpain = new Date().toLocaleDateString('es-ES', { weekday: 'long' });
    currentDayNameInSpain = currentDayNameInSpain.charAt(0).toUpperCase() + currentDayNameInSpain.slice(1);
  }

  let currentTimeFormattedInSpain;
  try {
    const timeFormatter = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
    currentTimeFormattedInSpain = timeFormatter.format(nowUtc);
  } catch (e) {
    console.error("API_ROUTE_GET_PRICE: Error formatting time for timezone", timeZone, e);
    const localNow = new Date();
    currentTimeFormattedInSpain = String(localNow.getHours()).padStart(2, '0') + ':' + String(localNow.getMinutes()).padStart(2, '0');
  }
  

  for (const entry of priceEntries) {
    if (entry.dia.toLowerCase() === currentDayNameInSpain.toLowerCase()) {
      try {
        const baseDateStr = formatDate(nowUtc, 'yyyy-MM-dd');
        const entryStartTime = parseTime(baseDateStr + " " + entry.franjaStart, 'yyyy-MM-dd HH:mm', new Date());
        const entryEndTime = parseTime(baseDateStr + " " + entry.franjaEnd, 'yyyy-MM-dd HH:mm', new Date());
        const currentTime = parseTime(baseDateStr + " " + currentTimeFormattedInSpain, 'yyyy-MM-dd HH:mm', new Date());
        
        if (isValidDate(entryStartTime) && isValidDate(entryEndTime) && isValidDate(currentTime)) {
            if (currentTime >= entryStartTime && currentTime <= entryEndTime) {
              return entry.precio;
            }
        } else {
            // console.warn(API_ROUTE_GET_PRICE: Invalid date parsed for entry time comparison: ${JSON.stringify(entry)}, currentTime: ${currentTimeFormattedInSpain}`);
        }
      } catch (e) {
        // console.warn("API_ROUTE_GET_PRICE: Could not parse time range for entry: " + JSON.stringify(entry), e);
      }
    }
  }

  return restaurantConfig.menuDelDia?.price || null;
}


export async function fetchAndProcessMenuData(): Promise<{ menuItems: MenuItemData[], currentMenuPrice: string | null }> {
  // console.log("API_ROUTE_LOGIC_MENU: fetchAndProcessMenuData called.");
  
  const menuCsvText = await fetchRawCsvData(GOOGLE_SHEET_CSV_URL, "MENU_SHEET_FETCH");
  let allMenuItems: MenuItemData[] = [];

  if (menuCsvText) {
    const parsedMenuData = parseCSV(menuCsvText, EXPECTED_MENU_HEADERS, "MENU_SHEET_PARSE");
    if (parsedMenuData.length === 0 && menuCsvText.trim().length > 0 && !menuCsvText.trim().startsWith(EXPECTED_MENU_HEADERS[0])) {
        //  console.warn("API_ROUTE_LOGIC_MENU: Menu CSV parsing resulted in 0 items, but CSV text was not empty. This strongly suggests a header mismatch or structural issue with the CSV that parseCSV couldn't handle based on EXPECTED_MENU_HEADERS.");
    }

    let visibleItemsCount = 0;
    allMenuItems = parsedMenuData.map((item: Record<string, string>, index: number) => {
      // console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Row ${index + 2} RAW: ${JSON.stringify(item)}`);

      const visibleString = (item[VISIBLE_COL] || "TRUE").trim(); 
      if (!(visibleString.toUpperCase() === "TRUE" || visibleString === "1" || visibleString.toUpperCase() === "SÍ" || visibleString.toUpperCase() === "VERDADERO")) {
        return null;
      }
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


      if (!nameEN && !nameES && !nameCA) {
        // console.warn("API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row " + (index + 2) + " (Visible) is MISSING ALL NAME DATA. Skipping. Data: " + JSON.stringify(item));
        return null;
      }
      const primaryCategoryEN = categoryEN || categoryES || categoryCA;
      if (!primaryCategoryEN) {
        //  console.warn("API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row " + (index + 2) + " (Visible) has NO CATEGORY AT ALL. Skipping. Data: " + JSON.stringify(item));
        return null;
      }
      const categoryKey = mapCategoryToKey(primaryCategoryEN);
      
      const primaryNameEN = nameEN || nameES || nameCA; 

      let finalImageUrl = 'https://placehold.co/400x300.png';
      if (linkImagenFromSheet && linkImagenFromSheet.toUpperCase() !== "FALSE" && linkImagenFromSheet.trim() !== "") {
          if (linkImagenFromSheet.startsWith('https://drive.google.com/file/d/')) {
              const fileIdMatch = linkImagenFromSheet.match(/file\/d\/([a-zA-Z0-9_-]+)/);
              if (fileIdMatch && fileIdMatch[1]) {
                  finalImageUrl = 'https://drive.google.com/uc?export=view&id=' + fileIdMatch[1];
              }
          } else if (isValidHttpUrl(linkImagenFromSheet)) {
              finalImageUrl = linkImagenFromSheet;
          }
      }
      
      let imageHint = (primaryNameEN || "food item").toLowerCase().split(' ').slice(0, 2).join(' ');
      if (!imageHint || imageHint === "food item") {
        imageHint = (primaryCategoryEN || "food plate").toLowerCase();
      }

      let formattedPrice: string | undefined = undefined;
      if (priceFromSheet !== undefined && priceFromSheet !== null && priceFromSheet.trim() !== "" && priceFromSheet.toUpperCase() !== "FALSE" && priceFromSheet.toUpperCase() !== "N/A") {
        const numericPrice = parseFloat(priceFromSheet.replace('€', '').replace(',', '.').trim());
        if (!isNaN(numericPrice)) {
          formattedPrice = '€' + numericPrice.toFixed(2);
        }
      }

      const allergens = alergenosString.split(',')
        .map(a => a.trim().toLowerCase())
        .filter(a => a.length > 0 && a !== "false" && a !== "n/a");

      const isChefSuggestion = ['true', 'verdadero', 'sí', 'si', '1', 'TRUE', 'VERDADERO', 'SÍ', 'SI'].includes(sugerenciaChefString.toLowerCase().trim());

      const menuItem: MenuItemData = {
        id: categoryKey + '-' + index + '-' + Date.now(), 
        name: {
          ca: (nameCA || nameES || nameEN || "").trim(),
          es: (nameES || nameEN || nameCA || "").trim(),
          en: (nameEN || nameES || nameCA || "").trim(),
        },
        description: {
          ca: (descCA || descES || descEN || "").trim() || "",
          es: (descES || descEN || descCA || "").trim() || "",
          en: (descEN || descES || descCA || "").trim() || "",
        },
        price: formattedPrice,
        categoryKey: categoryKey,
        imageUrl: finalImageUrl,
        imageHint: imageHint,
        allergens: allergens.length > 0 ? allergens : undefined,
        isChefSuggestion: isChefSuggestion,
      };
      return menuItem;
    }).filter(item => item !== null) as MenuItemData[];

    // console.log(API_ROUTE_LOGIC_MENU: Total items marked as visible: ${visibleItemsCount}`);
    // console.log(API_ROUTE_LOGIC_MENU: Mapped to ${allMenuItems.length} valid MenuItemData objects after filtering invisible and invalid items.`);
  
  } else {
    //  console.warn("API_ROUTE_LOGIC_MENU: Menu CSV text was null. No menu items processed.");
  }

  if (allMenuItems.length === 0 && menuCsvText) {
    // console.warn("API_ROUTE_LOGIC_MENU: All parsed items were filtered out or invalid during mapping. Check mapping logic and data consistency, especially the 'Visible' column and essential fields like names/categories.");
  } else if (allMenuItems.length === 0) {
    // console.warn("API_ROUTE_LOGIC_MENU: No menu items were successfully processed. Check GID, sheet publishing status (File > Share > Publish to web > CSV), header names, and data content in your Google Sheet.");
  }
  
  const currentMenuPrice = await getCurrentMenuPrice();

  const result = { menuItems: allMenuItems, currentMenuPrice };
  return result;
}

// GET handler for the /api/menu route
export async function GET() {
  // console.log("API_ROUTE_GET_MENU: /api/menu GET handler INVOKED.");
  const { menuItems, currentMenuPrice } = await fetchAndProcessMenuData();
  
  const headers = new Headers();
  headers.append('Cache-Control', 's-maxage=1, stale-while-revalidate=59'); 

  return NextResponse.json({ menuItems, currentMenuPrice }, { status: 200, headers });
}
