
"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu as MenuIcon, X as XIcon, Wine } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import restaurantConfig from '@/config/restaurant.config'; // Import config

const navItems = [
  { label: 'Our Menu', href: '#menu' },
  { label: 'AI Sommelier', href: '#ai-sommelier' },
  { label: 'Book a Table', href: '#booking' },
  { label: 'Testimonials', href: '#testimonials' },
];

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav className={`flex ${inSheet ? 'flex-col space-y-4' : 'space-x-6 items-center'}`}>
      {navItems.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
          onClick={() => inSheet && setIsSheetOpen(false)}
        >
          {item.label}
        </Link>
      ))}
      {!inSheet && (
         <Link href="#booking" passHref>
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Book Now
            </Button>
         </Link>
      )}
       {inSheet && (
         <Link href="#booking" passHref>
            <Button variant="default" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsSheetOpen(false)}>
                Book Now
            </Button>
         </Link>
      )}
    </nav>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            <Wine className="h-8 w-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-foreground">{restaurantConfig.restaurantName}</span>
          </Link>

          {isMobile ? (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background p-6">
                <div className="flex justify-between items-center mb-8">
                    <Link href="/" className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                        <Wine className="h-7 w-7 text-primary" />
                        <span className="text-xl font-serif font-bold text-foreground">{restaurantConfig.restaurantName}</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}>
                        <XIcon className="h-6 w-6" />
                        <span className="sr-only">Close menu</span>
                    </Button>
                </div>
                <NavLinks inSheet={true} />
              </SheetContent>
            </Sheet>
          ) : (
            <NavLinks />
          )}
        </div>
      </div>
    </header>
  );
}
