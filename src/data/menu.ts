
export interface MenuItemText {
  ca: string;
  en: string;
  es: string;
}

export interface MenuItemData {
  id: string;
  name: MenuItemText;
  description: MenuItemText;
  price?: string;
  categoryKey: string; // e.g., "starters", "mainCourses", "secondCourses", "desserts"
  imageUrl: string;
  imageHint: string;
  allergens?: string[];
  isChefSuggestion?: boolean;
}

export interface MenuCategory {
  key: string;
  order: number;
}

// Define category keys and their display order for top-level accordions
// "Guarnició Brasa" (grilledGarnish) and "Salses" (sauces) will be nested
// within "Segon Plat" (secondCourses) and won't appear as top-level items here.
export const menuCategories: MenuCategory[] = [
  { key: 'starters', order: 1 },        // Entrants
  { key: 'mainCourses', order: 2 },     // Primers Plats
  { key: 'secondCourses', order: 3 },   // Segon Plat
  { key: 'desserts', order: 4 },       // Postres
  { key: 'breads', order: 5 },         // Pans
  { key: 'beverages', order: 6 },     // Begudes
  { key: 'wines', order: 7 },           // Vins
  // Note: 'grilledGarnish' and 'sauces' are intentionally omitted here for top-level accordion
  // They will be handled as sub-categories within 'secondCourses'.
];
