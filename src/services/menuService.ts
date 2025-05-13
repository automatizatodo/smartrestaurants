'use server';

import type { MenuItemData } from '@/data/menu';

// !! IMPORTANT: Replace this URL with your actual Google Sheet CSV export URL !!
// To get this URL:
// 1. In Google Sheets, go to File > Share > Publish to web.
// 2. Select the specific sheet containing your menu data.
// 3. Choose "Comma-separated values (.csv)" as the format.
// 4. Click "Publish".
// 5. Copy the generated URL and paste it here.
// Example Google Sheet columns: id,nameKey,descriptionKey,price,categoryKey,imageUrl,imageHint
const GOOGLE_SHEET_CSV_URL = 'YOUR_GOOGLE_SHEET_CSV_URL_HERE';

// Basic CSV to JSON parser.
// Note: This is a very basic parser. It assumes:
// - The first row contains headers.
// - Values do not contain commas or newlines unless the entire CSV is simple.
// - For production, consider a more robust CSV parsing library if your data is complex.
function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split(/\r\n|\n/); // Handles both CRLF and LF line endings
  if (lines.length < 2) return []; // Need at least headers and one data row

  const headers = lines[0].split(',').map(header => header.trim());
  const jsonData = [];

  for (let i = 1; i < lines.length; i++) {
    // This simple split won't handle commas within quoted fields correctly.
    // For example, a field like "Description, with comma" will be split.
    const values = lines[i].split(',').map(value => value.trim().replace(/^"|"$/g, '')); // Trim and remove surrounding quotes
    if (values.length === headers.length) {
      const entry: Record<string, string> = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      jsonData.push(entry);
    } else {
      console.warn(`Skipping malformed CSV line ${i + 1}: expected ${headers.length} values, got ${values.length}`);
    }
  }
  return jsonData;
}


export async function fetchMenuFromGoogleSheet(): Promise<MenuItemData[]> {
  if (GOOGLE_SHEET_CSV_URL === 'YOUR_GOOGLE_SHEET_CSV_URL_HERE' || !GOOGLE_SHEET_CSV_URL) {
    console.warn(
      'Google Sheet CSV URL is not configured. Serving empty menu. Please update GOOGLE_SHEET_CSV_URL in src/services/menuService.ts'
    );
    return [];
  }

  try {
    // Fetch with revalidation strategy (e.g., revalidate every hour)
    const response = await fetch(GOOGLE_SHEET_CSV_URL, { next: { revalidate: 3600 } }); 
    if (!response.ok) {
      console.error(`Failed to fetch menu from Google Sheet: ${response.status} ${response.statusText}`);
      return [];
    }
    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    return parsedData.map((item: Record<string, string>, index: number) => ({
      id: item.id || `item-${index}-${Math.random().toString(36).substring(2, 7)}`, // Ensure ID exists, fallback to generated
      nameKey: item.nameKey || '',
      descriptionKey: item.descriptionKey || '',
      price: item.price || '$0.00',
      categoryKey: item.categoryKey || '',
      // Ensure imageUrl starts with http or https, otherwise default to a placeholder or handle error
      imageUrl: item.imageUrl && (item.imageUrl.startsWith('http://') || item.imageUrl.startsWith('https://')) 
                  ? item.imageUrl 
                  : 'https://picsum.photos/seed/placeholder/400/300', // Fallback image
      imageHint: item.imageHint || 'food item',
    })).filter(item => item.nameKey && item.categoryKey); // Filter out items missing essential keys
  } catch (error) {
    console.error('Error fetching or parsing menu from Google Sheet:', error);
    return []; 
  }
}
