
'use server';

import { NextResponse } from 'next/server';
import type { MenuItemData } from '@/data/menu';
import restaurantConfig from '@/config/restaurant.config';
import { parse as parseTime, isValid as isValidDate, format as formatDate, getDay, isWithinInterval, setHours, setMinutes, setSeconds, setMilliseconds, addMinutes, parseISO } from 'date-fns';
import { ca as caLocale, es as esLocale, enUS as enLocale } from 'date-fns/locale';

// URL for the MAIN MENU sheet
let GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1qXfoypzWxtmNfJMhVWkoeqH9iLg7_Qzf-QSoBCzeaAL0hJRcyBTDzfyuqLx3pmK37l6iyINlRCeP/pub?gid=0&single=true&output=csv';

// URL for the "preciosmenu" sheet
let PRICES_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT1qXfoypzWxtmNfJMhVWkoeqH9iLg7_Qzf-QSoBCzeaAL0hJRcyBTDzfyuqLx3pmK37l6iyINlRCeP/pub?gid=1458714483&single=true&output=csv';


// Column names from the Google Sheet structure
const VISIBLE_COL = "Visible";
const MENU_COL = "Menu"; // New column
const SUGERENCIA_CHEF_COL = "Sugerencia Chef";
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
const SUPLEMENTO_COL = "Suplemento (€)"; // New column
const ALERGENOS_COL = "Alergenos";
const LINK_IMAGEN_COL = "Link Imagen";


// Expected headers for validation for the main menu sheet
const EXPECTED_MENU_HEADERS = [
  VISIBLE_COL, MENU_COL, SUGERENCIA_CHEF_COL,
  CATEGORIA_CA_COL, CATEGORIA_ES_COL, CATEGORY_EN_COL,
  NOM_CA_COL, NOMBRE_ES_COL, NAME_EN_COL,
  DESCRIPCIO_CA_COL, DESCRIPCION_ES_COL, DESCRIPTION_EN_COL,
  PRECIO_COL, SUPLEMENTO_COL,
  ALERGENOS_COL, LINK_IMAGEN_COL
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
  franjaStart: Date;
  franjaEnd: Date;
  precio: string;
}

export interface PriceSummary {
  weekdayPrice?: string;
  weekdayLabelKey?: string;
  weekendPrice?: string;
  weekendLabelKey?: string;
}

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
      // console.warn(API_ROUTE_MAP_CATEGORY: Unmapped category EN: "${categoryEN}" - using direct key: "${lowerCategory.replace(/\s+/g, '')}");
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
  let urlToParse = urlStr;
  try {
    if (!urlToParse.startsWith('http://') && !urlToParse.startsWith('https://') && urlToParse.includes('.') && !urlToParse.includes(' ')) {
      urlToParse = 'https://' + urlToParse;
    }
    const url = new URL(urlToParse);
    const isValid = url.protocol === "http:" || url.protocol === "https:";
    // if (!isValid) {
    //   console.warn(API_ROUTE_LOGIC_IS_VALID_URL: URL '${urlStr}' (parsed as '${urlToParse}') is NOT valid (protocol: ${url.protocol}). Expected 'http:' or 'https:'.`);
    // }
    return isValid;
  } catch (e: any) {
    // console.warn(API_ROUTE_LOGIC_IS_VALID_URL: Failed to parse URL '${urlStr}' (attempted as '${urlToParse}'). Error: ${e.message}`);
    return false;
  }
}

async function fetchRawCsvData(url: string, logPrefix: string): Promise<string | null> {
  if (!url || url.includes('REPLACE_WITH_YOUR_') || url.includes('URL_HERE')) {
    console.error(logPrefix + ": CRITICAL - URL is not configured correctly: " + url + ". Please update it in environment variables or src/app/api/menu/route.ts");
    return null;
  }

  const fetchUrl = url.includes('?') ? url + "&timestamp=" + new Date().getTime() : url + "?timestamp=" + new Date().getTime();

  try {
    // console.log(logPrefix + ": Fetching CSV from URL: " + fetchUrl);
    const response = await fetch(fetchUrl, { cache: 'no-store' });
    // console.log(logPrefix + ": Response status from Google Sheets: " + response.status + " " + response.statusText + " for URL: " + fetchUrl);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = logPrefix + ": Failed to fetch CSV. Status: " + response.status + ". URL: " + fetchUrl + ". Response: " + errorText.substring(0, 500) + "...";
      if (response.status === 401 || response.status === 403) {
        errorMessage += " This often means the Google Sheet is not published correctly or access is restricted. Please check \"File > Share > Publish to web\" settings for the sheet and ensure it's public.";
      } else if (response.status === 400 && errorText.toLowerCase().includes('page not found')) {
        errorMessage += " This \"Page Not Found\" error from Google Sheets usually means the specific published CSV link is incorrect, has changed, or the sheet/document is no longer published as expected. Verify the 'Publish to web' CSV link for the specific sheet.";
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
  // console.log("API_ROUTE_LOGIC_PRICE: getCurrentMenuPrice called.");

  const envPricesSheetUrl = process.env.GOOGLE_SHEET_PRICES_CSV_URL;
  if (envPricesSheetUrl && envPricesSheetUrl !== 'YOUR_ENV_VARIABLE_FOR_PRICES_SHEET_URL') {
    PRICES_SHEET_CSV_URL = envPricesSheetUrl;
  } else if (!envPricesSheetUrl && PRICES_SHEET_CSV_URL.includes('YOUR_PRECIOSMENU_SHEET_PUBLISH_TO_WEB_CSV_URL_HERE')) {
    // console.error("API_ROUTE_LOGIC_PRICE: CRITICAL - PRICES_SHEET_CSV_URL env var not set and code placeholder is active. Using fallback price.");
    return restaurantConfig.menuDelDia?.price || null;
  }
  // console.log(API_ROUTE_LOGIC_PRICE: Using prices sheet URL: ${PRICES_SHEET_CSV_URL});

  const pricesCsvText = await fetchRawCsvData(PRICES_SHEET_CSV_URL, "PRICE_SHEET_FETCH");
  if (!pricesCsvText) {
    // console.warn("API_ROUTE_LOGIC_PRICE: Could not fetch prices CSV. Using fallback price.");
    return restaurantConfig.menuDelDia?.price || null;
  }

  const parsedPriceData = parseCSV(pricesCsvText, EXPECTED_PRICE_HEADERS, "PRICE_SHEET_PARSE");
  // if (parsedPriceData.length === 0) console.warn("API_ROUTE_LOGIC_PRICE: No price data parsed from CSV. Using fallback price.");

  const now = new Date();
  const currentDayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: restaurantConfig.timeZone }).format(now);
  const currentTimeStr = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: restaurantConfig.timeZone }).format(now);
  const currentTime = parseTime(currentTimeStr, 'HH:mm', now);
  
  // console.log(API_ROUTE_LOGIC_PRICE: Current Day (ES): ${currentDayName}, Current Time: ${currentTimeStr});

  const priceEntries: PriceEntry[] = parsedPriceData
    .map(row => {
      const dia = row[DIA_COL_PRICE]?.trim().toLowerCase();
      const franja = row[FRANJA_HORARIA_COL_PRICE]?.trim();
      const precio = row[PRECIO_MENU_COL_PRICE]?.trim();

      if (!dia || !franja || !precio || !franja.includes('-')) return null;

      const [startStr, endStr] = franja.split(/\s*[-\u2013]\s*/).map(s => s.trim());
      if (!startStr || !endStr) return null;

      try {
        const franjaStart = parseTime(startStr, 'HH:mm', new Date(0)); // Base date for time parsing
        const franjaEnd = parseTime(endStr, 'HH:mm', new Date(0));
        if (isNaN(franjaStart.getTime()) || isNaN(franjaEnd.getTime())) return null;
        return { dia, franjaStart, franjaEnd, precio };
      } catch (e) {
        return null;
      }
    })
    .filter(entry => entry !== null) as PriceEntry[];

  for (const entry of priceEntries) {
    if (entry.dia === currentDayName.toLowerCase()) {
      if (isWithinInterval(currentTime, { start: entry.franjaStart, end: entry.franjaEnd })) {
        // console.log(API_ROUTE_LOGIC_PRICE: Found matching price entry for ${currentDayName} at ${currentTimeStr}: ${entry.precio});
        return entry.precio;
      }
    }
  }

  // console.warn(API_ROUTE_LOGIC_PRICE: No matching price entry found for ${currentDayName} at ${currentTimeStr}. Using fallback price.);
  return restaurantConfig.menuDelDia?.price || null;
}

async function generatePriceSummary(): Promise<PriceSummary> {
  // console.log("API_ROUTE_LOGIC_PRICE_SUMMARY: generatePriceSummary called.");
  const envPricesSheetUrl = process.env.GOOGLE_SHEET_PRICES_CSV_URL;
  if (envPricesSheetUrl && envPricesSheetUrl !== 'YOUR_ENV_VARIABLE_FOR_PRICES_SHEET_URL') {
    PRICES_SHEET_CSV_URL = envPricesSheetUrl;
  }

  const pricesCsvText = await fetchRawCsvData(PRICES_SHEET_CSV_URL, "PRICE_SUMMARY_FETCH");
  if (!pricesCsvText) {
    // console.warn("API_ROUTE_LOGIC_PRICE_SUMMARY: Could not fetch prices CSV for summary.");
    return {};
  }

  const parsedPriceData = parseCSV(pricesCsvText, EXPECTED_PRICE_HEADERS, "PRICE_SUMMARY_PARSE");
  const priceEntries: PriceEntry[] = parsedPriceData
    .map(row => {
      const dia = row[DIA_COL_PRICE]?.trim().toLowerCase();
      const franja = row[FRANJA_HORARIA_COL_PRICE]?.trim();
      const precio = row[PRECIO_MENU_COL_PRICE]?.trim();
      if (!dia || !franja || !precio || !franja.includes('-')) return null;
      try {
        const [startStr, endStr] = franja.split(/\s*[-\u2013]\s*/).map(s => s.trim());
        return { dia, franjaStart: parseTime(startStr, 'HH:mm', new Date(0)), franjaEnd: parseTime(endStr, 'HH:mm', new Date(0)), precio };
      } catch { return null; }
    })
    .filter(entry => entry !== null) as PriceEntry[];

  const weekdays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];
  let weekdayPrice: string | undefined;
  let weekendPrice: string | undefined;
  let hasMondayPrice = false;

  for (const day of weekdays) {
    const entry = priceEntries.find(p => p.dia === day && p.precio);
    if (entry) {
      if (day === 'lunes') hasMondayPrice = true;
      weekdayPrice = entry.precio; // Take the first one found for simplicity
      break; 
    }
  }
  // If no specific weekday price, try finding one for 'lunes' again for fallback
  if(!weekdayPrice) weekdayPrice = priceEntries.find(p => p.dia === 'lunes' && p.precio)?.precio;


  const weekendDays = ['sábado', 'domingo'];
  for (const day of weekendDays) {
    const entry = priceEntries.find(p => p.dia === day && p.precio);
    if (entry) {
      weekendPrice = entry.precio;
      break;
    }
  }
  // If no specific weekend price, try finding one for 'sábado' again for fallback
  if(!weekendPrice) weekendPrice = priceEntries.find(p => p.dia === 'sábado' && p.precio)?.precio;


  const summary: PriceSummary = {};
  if (weekdayPrice) {
    summary.weekdayPrice = weekdayPrice;
    summary.weekdayLabelKey = hasMondayPrice ? 'menu:weekdaysPriceLabel' : 'menu:tuesdayToFridayPriceLabel';
  }
  if (weekendPrice) {
    summary.weekendPrice = weekendPrice;
    summary.weekendLabelKey = 'menu:weekendsPriceLabel';
  }
  // console.log(API_ROUTE_LOGIC_PRICE_SUMMARY: Generated price summary: ${JSON.stringify(summary)});
  return summary;
}

export async function fetchAndProcessMenuData(): Promise<{ allMenuItems: MenuItemData[], currentMenuPrice: string | null, priceSummary: PriceSummary }> {
  // console.log("API_ROUTE_LOGIC_MENU: fetchAndProcessMenuData called.");

  const envMenuSheetUrl = process.env.GOOGLE_SHEET_MENU_CSV_URL;
  if (envMenuSheetUrl && envMenuSheetUrl !== 'YOUR_ENV_VARIABLE_FOR_MENU_SHEET_URL') {
    GOOGLE_SHEET_CSV_URL = envMenuSheetUrl;
  } else if (!envMenuSheetUrl && GOOGLE_SHEET_CSV_URL.includes('REPLACE_WITH_YOUR_MAIN_MENU_SHEET_PUBLISH_TO_WEB_CSV_URL_HERE')) {
    console.error("API_ROUTE_LOGIC_MENU: CRITICAL - GOOGLE_SHEET_MENU_CSV_URL env var not set and code placeholder is active.");
    return { allMenuItems: [], currentMenuPrice: null, priceSummary: {} };
  }
  // console.log(API_ROUTE_LOGIC_MENU: Using menu sheet URL: ${GOOGLE_SHEET_CSV_URL});

  const menuCsvText = await fetchRawCsvData(GOOGLE_SHEET_CSV_URL, "MENU_SHEET_FETCH");
  let allMenuItems: MenuItemData[] = [];

  if (menuCsvText) {
    const parsedMenuData = parseCSV(menuCsvText, EXPECTED_MENU_HEADERS, "MENU_SHEET_PARSE");
    // if (parsedMenuData.length === 0 && menuCsvText.trim().length > 0 && !menuCsvText.trim().startsWith(EXPECTED_MENU_HEADERS[0])) {
        // console.warn("API_ROUTE_LOGIC_MENU: Menu CSV parsing resulted in 0 items, but CSV text was not empty. This strongly suggests a header mismatch or structural issue with the CSV that parseCSV couldn't handle based on EXPECTED_MENU_HEADERS.");
    // }
    allMenuItems = parsedMenuData.map((item: Record<string, string>, index: number) => {
      // console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Row ${index + 2} RAW: ${JSON.stringify(item)});

      const visibleString = (item[VISIBLE_COL] || "TRUE").trim();
      const isVisible = ["TRUE", "VERDADERO", "SÍ", "SI", "1"].includes(visibleString.toUpperCase());

      const menuDelDiaString = (item[MENU_COL] || "FALSE").trim();
      const isMenuDelDia = ["TRUE", "VERDADERO", "SÍ", "SI", "1"].includes(menuDelDiaString.toUpperCase());

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
      const suplementoFromSheet = item[SUPLEMENTO_COL];
      let linkImagenFromSheet = item[LINK_IMAGEN_COL] || "";
      const sugerenciaChefString = item[SUGERENCIA_CHEF_COL] || "FALSE";
      const alergenosString = item[ALERGENOS_COL] || "";

      if (!nameCA && !nameES && !nameEN) {
        // console.warn(API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row ${index + 2} is MISSING ALL NAME DATA. Skipping. Data: ${JSON.stringify(item)});
        return null;
      }
      const primaryCategoryEN = categoryEN || categoryES || categoryCA;
      if (!primaryCategoryEN) {
        // console.warn(API_ROUTE_LOGIC_ITEM_PROCESSING: Item at row ${index + 2} has NO CATEGORY AT ALL. Skipping. Data: ${JSON.stringify(item)});
        return null;
      }
      const categoryKey = mapCategoryToKey(primaryCategoryEN);
      const primaryNameEN = nameEN || nameES || nameCA || "Unnamed Dish";

      let finalImageUrl = 'https://placehold.co/400x300.png';
      // console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' has image link from sheet: '${linkImagenFromSheet}');
      if (linkImagenFromSheet && linkImagenFromSheet.toUpperCase() !== "FALSE" && linkImagenFromSheet.trim() !== "") {
        if (isValidHttpUrl(linkImagenFromSheet)) {
          finalImageUrl = linkImagenFromSheet;
          // console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' using valid image URL from sheet: '${finalImageUrl}');
        } else {
          // console.warn(API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' has an invalid or unusable image URL from sheet: '${linkImagenFromSheet}'. Using placeholder.);
        }
      } else {
        // console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' has no image link or is marked FALSE. Using placeholder.);
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
          // console.warn(API_ROUTE_LOGIC_ITEM_PROCESSING: Could not parse price '${priceFromSheet}' for item '${primaryNameEN}' into a number.);
        }
      }
      
      let formattedSuplemento: string | undefined = undefined;
      if (suplementoFromSheet !== undefined && suplementoFromSheet !== null && suplementoFromSheet.trim() !== "" && suplementoFromSheet.toUpperCase() !== "FALSE" && suplementoFromSheet.toUpperCase() !== "N/A") {
        const numericSuplemento = parseFloat(suplementoFromSheet.replace('€', '').replace(',', '.').trim());
        if (!isNaN(numericSuplemento)) {
          formattedSuplemento = '€' + numericSuplemento.toFixed(2);
        } else {
          // console.warn(API_ROUTE_LOGIC_ITEM_PROCESSING: Could not parse suplemento '${suplementoFromSheet}' for item '${primaryNameEN}' into a number.);
        }
      }

      const allergens = alergenosString.split(',')
        .map(a => a.trim().toLowerCase())
        .filter(a => a.length > 0 && a !== "false" && a !== "n/a");

      const isChefSuggestion = ['true', 'verdadero', 'sí', 'si', '1', 'TRUE', 'VERDADERO', 'SÍ', 'SI'].includes(sugerenciaChefString.toLowerCase().trim());
      // if (isChefSuggestion) console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Item '${primaryNameEN}' IS a chef suggestion.);

      const menuItem: MenuItemData = {
        id: categoryKey + "-" + index + "-" + Date.now(),
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
        suplemento: formattedSuplemento,
        categoryKey: categoryKey,
        imageUrl: finalImageUrl,
        imageHint: imageHint,
        allergens: allergens.length > 0 ? allergens : undefined,
        isChefSuggestion: isChefSuggestion,
        isVisible: isVisible,
        isMenuDelDia: isMenuDelDia,
      };
      // console.log(API_ROUTE_LOGIC_ITEM_PROCESSING: Successfully processed item: ${JSON.stringify(menuItem)});
      return menuItem;
    }).filter(item => item !== null) as MenuItemData[];

    // console.log(API_ROUTE_LOGIC_MENU: Total items processed: ${allMenuItems.length});
  } else {
    // console.warn("API_ROUTE_LOGIC_MENU: Menu CSV text was null. No menu items processed.");
  }

  const currentMenuPrice = await getCurrentMenuPrice();
  const priceSummaryData = await generatePriceSummary();

  // console.log(API_ROUTE_LOGIC_MENU: Current menu price: ${currentMenuPrice});
  // console.log(API_ROUTE_LOGIC_MENU: Price summary: ${JSON.stringify(priceSummaryData)});

  const result = { allMenuItems, currentMenuPrice, priceSummary: priceSummaryData };
  // console.log(API_ROUTE_LOGIC_MENU: Final result before NextResponse.json. Items count: ${result.allMenuItems ? result.allMenuItems.length : 0}. Price: ${result.currentMenuPrice}. Summary: ${JSON.stringify(result.priceSummary)});
  return result;
}

export async function GET() {
  // console.log("API_ROUTE_GET_MENU: /api/menu GET handler INVOKED.");
  const { allMenuItems, currentMenuPrice, priceSummary } = await fetchAndProcessMenuData();

  const headers = new Headers();
  // Cache for 1 min, stale for 5 min, to allow for Google Sheet updates to propagate
  // but still provide some caching for performance.
  headers.append('Cache-Control', 's-maxage=1, stale-while-revalidate=59');

  // console.log(API_ROUTE_GET_MENU: Total menu items processed: ${allMenuItems ? allMenuItems.length : 0}. Current price: ${currentMenuPrice}. Sending response with price summary: ${JSON.stringify(priceSummary)});
  return NextResponse.json({ menuItems: allMenuItems, currentMenuPrice, priceSummary }, { status: 200, headers });
}
