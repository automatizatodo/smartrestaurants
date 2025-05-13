
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
// This could also be fetched from Google Sheets if needed, e.g., from a separate tab.
export const menuCategories: MenuCategory[] = [
  { key: 'menu:category.appetizer', order: 1 },
  { key: 'menu:category.mainCourse', order: 2 },
  { key: 'menu:category.dessert', order: 3 },
  { key: 'menu:category.luxury', order: 4 },
];

// The static menuItems array has been removed.
// Menu data will now be fetched dynamically using the fetchMenuFromGoogleSheet function
// in src/services/menuService.ts.
