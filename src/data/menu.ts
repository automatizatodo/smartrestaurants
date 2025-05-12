
export interface MenuItemData {
  id: string;
  nameKey: string; // e.g., "menu:item1.name"
  descriptionKey: string; // e.g., "menu:item1.description"
  price: string;
  imageUrl: string;
  imageHint: string;
}

export const menuItems: MenuItemData[] = [
  {
    id: '1',
    nameKey: 'menu:item1.name',
    descriptionKey: 'menu:item1.description',
    price: '$28',
    imageUrl: 'https://picsum.photos/seed/risotto/400/300',
    imageHint: 'risotto elegant',
  },
  {
    id: '2',
    nameKey: 'menu:item2.name',
    descriptionKey: 'menu:item2.description',
    price: '$35',
    imageUrl: 'https://picsum.photos/seed/scallops/400/300',
    imageHint: 'scallops gourmet',
  },
  {
    id: '3',
    nameKey: 'menu:item3.name',
    descriptionKey: 'menu:item3.description',
    price: '$65',
    imageUrl: 'https://picsum.photos/seed/wagyu/400/300',
    imageHint: 'wagyu beef steak',
  },
  {
    id: '4',
    nameKey: 'menu:item4.name',
    descriptionKey: 'menu:item4.description',
    price: '$48',
    imageUrl: 'https://picsum.photos/seed/lobster/400/300',
    imageHint: 'lobster dish seafood',
  },
  {
    id: '5',
    nameKey: 'menu:item5.name',
    descriptionKey: 'menu:item5.description',
    price: '$18',
    imageUrl: 'https://picsum.photos/seed/tiramisu-dessert/400/300',
    imageHint: 'tiramisu dessert elegant',
  },
  {
    id: '6',
    nameKey: 'menu:item6.name',
    descriptionKey: 'menu:item6.description',
    price: '$1000',
    imageUrl: 'https://picsum.photos/seed/gold-sundae/400/300',
    imageHint: 'gold dessert luxury',
  },
];
