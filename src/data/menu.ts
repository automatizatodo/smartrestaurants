
export interface MenuItemText {
  ca: string;
  en: string;
  es: string;
}

export interface MenuItemData {
  id: string;
  name: MenuItemText;
  description: MenuItemText;
  price?: string; // Provindrà de la columna "Precio (€)"
  suplemento?: string; // Nova propietat per a "Suplemento (€)"
  categoryKey: string;
  imageUrl: string;
  imageHint: string;
  allergens?: string[];
  isChefSuggestion?: boolean;
  isVisible?: boolean; // Per filtrar a la carta
  isMenuDelDia?: boolean; // Nova propietat per filtrar al menú del dia
}

export interface MenuCategory {
  key: string;
  order: number;
}

// Define category keys and their display order for top-level accordions
export const menuCategories: MenuCategory[] = [
  { key: 'starters', order: 1 },
  { key: 'mainCourses', order: 2 },
  { key: 'secondCourses', order: 3 },
  { key: 'desserts', order: 4 },
  { key: 'breads', order: 5 },
  { key: 'beverages', order: 6 },
  { key: 'wines', order: 7 },
  // Note: 'grilledGarnish' and 'sauces' are handled as sub-categories within 'secondCourses'.
];
