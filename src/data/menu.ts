
export interface MenuItemText {
  ca: string; // Afegit per al català
  en: string;
  es: string;
}

export interface MenuItemData {
  id: string;
  name: MenuItemText;
  description: MenuItemText;
  price?: string; // Price is now optional, as it might not be displayed for individual items
  categoryKey: string; // e.g., "starters", "mainCourses", "desserts", "drinks"
  imageUrl: string;
  imageHint: string;
  allergens?: string[]; // New: list of allergen keys/names
  isChefSuggestion?: boolean; // New: to mark chef's suggestions
}

export interface MenuCategory {
  key: string; // "starters", "mainCourses", etc.
  order: number;
}

// Define category keys and their display order
// These keys will be derived from the 'Category (EN)' column in the Google Sheet
// and used to look up translations in menu.json (e.g., t('menu:starters'))
export const menuCategories: MenuCategory[] = [
  { key: 'starters', order: 1 },
  { key: 'mainCourses', order: 2 },
  { key: 'desserts', order: 3 },
  { key: 'drinks', order: 4 },
  // Add other categories if your "Menú del Día" has more sections
  // e.g., { key: 'primeros', order: 1 }, { key: 'segundos', order: 2 },
];
