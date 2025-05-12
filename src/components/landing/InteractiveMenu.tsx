
import MenuItemCard from './MenuItemCard';
import { menuItems } from '@/data/menu'; // Import from data file

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
          {menuItems.map((item, index) => ( // Use imported menuItems
            <div key={item.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <MenuItemCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
