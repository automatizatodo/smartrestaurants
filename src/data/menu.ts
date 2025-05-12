
export interface MenuItemData {
  id: string;
  nameKey: string; // e.g., "menu:item1.name"
  descriptionKey: string; // e.g., "menu:item1.description"
  price: string;
  categoryKey: string; // e.g., "menu:category.mainCourse"
  imageUrl: string;
  imageHint: string;
}

// Define category keys and their display order
export const menuCategories = [
  { key: 'menu:category.appetizer', order: 1 },
  { key: 'menu:category.mainCourse', order: 2 },
  { key: 'menu:category.dessert', order: 3 },
  { key: 'menu:category.luxury', order: 4 }, // Keep luxury separate for showcase
];

export const menuItems: MenuItemData[] = [
  {
    id: '1',
    nameKey: 'menu:item1.name',
    descriptionKey: 'menu:item1.description',
    price: '$28',
    categoryKey: 'menu:category.mainCourse',
    imageUrl: 'https://picsum.photos/seed/risotto/400/300',
    imageHint: 'risotto elegant',
  },
  {
    id: '2',
    nameKey: 'menu:item2.name',
    descriptionKey: 'menu:item2.description',
    price: '$35',
    categoryKey: 'menu:category.appetizer', // Changed category
    imageUrl: 'https://picsum.photos/seed/scallops/400/300',
    imageHint: 'scallops gourmet',
  },
  {
    id: '3',
    nameKey: 'menu:item3.name',
    descriptionKey: 'menu:item3.description',
    price: '$65',
    categoryKey: 'menu:category.mainCourse',
    imageUrl: 'https://picsum.photos/seed/wagyu/400/300',
    imageHint: 'wagyu beef steak',
  },
  {
    id: '4',
    nameKey: 'menu:item4.name',
    descriptionKey: 'menu:item4.description',
    price: '$48',
    categoryKey: 'menu:category.mainCourse',
    imageUrl: 'https://picsum.photos/seed/lobster/400/300',
    imageHint: 'lobster dish seafood',
  },
  {
    id: '5',
    nameKey: 'menu:item5.name',
    descriptionKey: 'menu:item5.description',
    price: '$18',
    categoryKey: 'menu:category.dessert',
    imageUrl: 'https://picsum.photos/seed/tiramisu-dessert/400/300',
    imageHint: 'tiramisu dessert elegant',
  },
  {
    id: '6',
    nameKey: 'menu:item6.name',
    descriptionKey: 'menu:item6.description',
    price: '$1000',
    categoryKey: 'menu:category.luxury', // Specific category for unique items
    imageUrl: 'https://picsum.photos/seed/gold-sundae/400/300',
    imageHint: 'gold dessert luxury',
  },
   // Add a couple more items for variety
  {
    id: '7',
    nameKey: 'menu:item7.name',
    descriptionKey: 'menu:item7.description',
    price: '$22',
    categoryKey: 'menu:category.appetizer',
    imageUrl: 'https://picsum.photos/seed/burrata/400/300',
    imageHint: 'burrata appetizer fresh',
  },
  {
    id: '8',
    nameKey: 'menu:item8.name',
    descriptionKey: 'menu:item8.description',
    price: '$16',
    categoryKey: 'menu:category.dessert',
    imageUrl: 'https://picsum.photos/seed/creme-brulee/400/300',
    imageHint: 'creme brulee dessert classic',
  },
];
