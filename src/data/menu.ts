
export interface MenuItemData {
  id: string;
  nameKey: string; 
  descriptionKey: string; 
  price: string;
  categoryKey: string; 
  imageUrl: string;
  imageHint: string;
}

export interface MenuCategory {
  key: string;
  order: number;
}

// Define category keys and their display order
// These keys must match those used in SHEETS_CONFIG in `src/app/api/menu/route.ts`
export const menuCategories: MenuCategory[] = [
  { key: 'menu:category.starters', order: 1 },       // Corresponds to "Entrantes"
  { key: 'menu:category.mainCourses', order: 2 }, // Corresponds to "Platos Principales"
  { key: 'menu:category.desserts', order: 3 },      // Corresponds to "Postres"
  { key: 'menu:category.drinks', order: 4 },        // Corresponds to "Bebidas"
  // Removed 'menu:category.luxury' as it's not in the new sheet structure. Add back if needed.
];

// The static menuItems array has been removed.
// Menu data will now be fetched dynamically via the /api/menu route,
// which in turn fetches from the configured Google Sheets.
