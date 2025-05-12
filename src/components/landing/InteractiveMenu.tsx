
import MenuItemCard, { type MenuItemProps } from './MenuItemCard';

const menuItems: MenuItemProps[] = [
  {
    id: '1',
    name: 'Saffron Risotto Milanese',
    description: 'Creamy Arborio rice infused with saffron, Parmesan, and a hint of white wine, topped with gold leaf.',
    price: '$28',
    imageUrl: 'https://picsum.photos/seed/risotto/400/300',
    imageHint: 'risotto elegant',
  },
  {
    id: '2',
    name: 'Seared Scallops with Truffle',
    description: 'Pan-seared U10 scallops served with a black truffle-infused cauliflower purée and asparagus spears.',
    price: '$35',
    imageUrl: 'https://picsum.photos/seed/scallops/400/300',
    imageHint: 'scallops gourmet',
  },
  {
    id: '3',
    name: 'Wagyu Beef Medallions',
    description: 'A5 Wagyu beef, grilled to perfection, accompanied by a rich red wine reduction and potato gratin.',
    price: '$65',
    imageUrl: 'https://picsum.photos/seed/wagyu/400/300',
    imageHint: 'wagyu beef steak',
  },
  {
    id: '4',
    name: 'Lobster Thermidor',
    description: 'Classic French dish of lobster meat cooked in a rich wine sauce, stuffed back into the lobster shell, and browned.',
    price: '$48',
    imageUrl: 'https://picsum.photos/seed/lobster/400/300',
    imageHint: 'lobster dish seafood',
  },
  {
    id: '5',
    name: 'Deconstructed Tiramisu',
    description: 'An artistic take on the classic Italian dessert, with espresso-soaked ladyfingers, mascarpone cream, and cocoa dust.',
    price: '$18',
    imageUrl: 'https://picsum.photos/seed/tiramisu/400/300', // Corrected URL: https://
    imageHint: 'tiramisu dessert elegant',
  },
  {
    id: '6',
    name: 'Golden Opulence Sundae',
    description: 'Tahitian vanilla bean ice cream, Madagascar vanilla, 23k edible gold leaf, and rare Amedei Porcelana chocolate.',
    price: '$1000', // Example of an extravagant item as per "luxury"
    imageUrl: 'https://picsum.photos/seed/gold-sundae/400/300',
    imageHint: 'gold dessert luxury',
  },
];

export default function InteractiveMenu() {
  return (
    <section id="menu" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground mb-4">
            Our Culinary Creations
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Each dish is crafted with the finest ingredients and artistic precision. Explore flavors that will tantalize your senses.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {menuItems.map((item, index) => (
            <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <MenuItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

