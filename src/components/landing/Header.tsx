
"use client";

import Link from 'next/link';
import Image from 'next/image'; // Import next/image
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu as MenuIcon, X as XIcon } from 'lucide-react'; // Wine removed
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import restaurantConfig from '@/config/restaurant.config'; // Import restaurant config

const navItemKeys = [
  { labelKey: 'common:nav.ourMenu', href: '/#menu' },
  { labelKey: 'common:nav.fullMenu', href: '/menu' },
  { labelKey: 'common:nav.services', href: '/#services' },
  { labelKey: 'common:nav.aboutUs', href: '/#about-us' },
  { labelKey: 'common:nav.aiSommelier', href: '/#ai-sommelier' },
  { labelKey: 'common:nav.bookTable', href: '/#booking' },
  { labelKey: 'common:nav.contact', href: '/#contact-map' },
  { labelKey: 'common:nav.testimonials', href: '/#testimonials' },
];

export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav className={`flex ${inSheet ? 'flex-col space-y-4 items-start' : 'space-x-6 items-center'}`}>
      {navItemKeys.map((item) => (
        <Link
          key={item.labelKey}
          href={item.href}
          className="text-sm font-medium transition-colors hover:text-primary"
          onClick={() => inSheet && setIsSheetOpen(false)}
        >
          {t(item.labelKey)}
        </Link>
      ))}
      {!inSheet && (
         <Link href="/#booking" passHref>
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                {t('common:button.bookNow')}
            </Button>
         </Link>
      )}
       {inSheet && (
        <>
         <Link href="/#booking" passHref>
            <Button variant="default" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setIsSheetOpen(false)}>
                {t('common:button.bookNow')}
            </Button>
         </Link>
         <div className="pt-4 w-full">
            <LanguageSelector />
         </div>
        </>
      )}
    </nav>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center space-x-2">
            {restaurantConfig.logoUrl ? (
              <Image
                src={restaurantConfig.logoUrl}
                alt={`${restaurantName} Logo`}
                width={120} // Adjust width as needed, or use height and w-auto
                height={40} // Set a height
                className="h-10 w-auto dark:filter dark:invert" // Invert colors in dark mode
                priority
              />
            ) : (
              // Fallback if no logoUrl is provided, though we removed Wine icon
              <span className="text-2xl font-serif font-bold text-foreground">{restaurantName}</span>
            )}
            <span className="text-2xl font-serif font-bold text-foreground hidden sm:inline-block">{restaurantName}</span>
          </Link>

          {isMobile ? (
            <div className="flex items-center">
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
                        {restaurantConfig.logoUrl ? (
                          <Image
                            src={restaurantConfig.logoUrl}
                            alt={`${restaurantName} Logo`}
                            width={100}
                            height={32}
                            className="h-8 w-auto dark:filter dark:invert"
                          />
                        ) : (
                           <span className="text-xl font-serif font-bold text-foreground">{restaurantName}</span>
                        )}
                         <span className="text-xl font-serif font-bold text-foreground">{restaurantName}</span>
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)}>
                          <XIcon className="h-6 w-6" />
                          <span className="sr-only">Close menu</span>
                      </Button>
                  </div>
                  <NavLinks inSheet={true} />
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <NavLinks />
              <LanguageSelector />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
