
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu as MenuIcon, X as XIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import restaurantConfig from '@/config/restaurant.config';

const navItemKeysBase = [
  // { labelKey: 'common:nav.ourMenu', href: '/#menu' }, // Removed
  { labelKey: 'common:nav.fullMenu', href: '/menu' },
  { labelKey: 'common:nav.services', href: '/#services' },
  { labelKey: 'common:nav.aboutUs', href: '/#about-us' },
];

const aiSommelierNavItem = { labelKey: 'common:nav.aiSommelier', href: '/#ai-sommelier' };

const navItemKeysEnd = [
  // { labelKey: 'common:nav.bookTable', href: '/#booking' }, // Removed
  { labelKey: 'common:nav.contact', href: '/#contact-map' },
  { labelKey: 'common:nav.testimonials', href: '/#testimonials' },
];

const getNavItems = () => {
  let items = [...navItemKeysBase];
  if (restaurantConfig.showAISommelierSection) {
    items.push(aiSommelierNavItem);
  }
  items.push(...navItemKeysEnd);
  return items;
};


export default function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isMobile = useIsMobile();
  const { t, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;
  const navItems = getNavItems();


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav className={`flex ${inSheet ? 'flex-col space-y-3 items-start' : 'space-x-4 lg:space-x-6 items-center'}`}>
      {navItems.map((item) => (
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
            <Button variant="default" size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 ml-2">
                {t('common:button.bookNow')}
            </Button>
         </Link>
      )}
       {inSheet && (
        <>
         <div className="pt-2 w-full">
           <Link href="/#booking" passHref>
              <Button variant="default" size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3" onClick={() => setIsSheetOpen(false)}>
                  {t('common:button.bookNow')}
              </Button>
           </Link>
         </div>
         <div className="pt-3 w-full border-t border-border mt-2">
            <LanguageSelector />
         </div>
        </>
      )}
    </nav>
  );

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-28"> {/* Reduced height for mobile to h-20, kept h-28 for sm and up */}
          <Link href="/" className="flex items-center space-x-2">
            {restaurantConfig.logoUrl ? (
              <Image
                src={restaurantConfig.logoUrl}
                alt={`${restaurantName} Logo`}
                width={288} 
                height={96} 
                className="h-16 sm:h-24 w-auto dark:filter dark:invert"  // Reduced logo height on mobile to h-16, sm and up is h-24
                priority
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <span className="text-xl sm:text-2xl font-serif font-bold text-foreground">{restaurantName}</span>
            )}

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
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-background p-6 flex flex-col">
                  <SheetTitle className="sr-only">{t('common:nav.mobileMenuTitle')}</SheetTitle>
                  <div className="flex justify-between items-center mb-6">
                      <Link href="/" className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                        {restaurantConfig.logoUrl ? (
                          <Image
                            src={restaurantConfig.logoUrl}
                            alt={`${restaurantName} Logo`}
                            width={192} // Adjusted width for h-16 (maintaining approx 3:1 aspect ratio)
                            height={64}  // Adjusted height for h-16
                            className="h-16 w-auto dark:filter dark:invert" // Reduced logo height in sheet to h-16
                            style={{ objectFit: 'contain' }}
                          />
                        ) : (
                           <span className="text-xl font-serif font-bold text-foreground">{restaurantName}</span>
                        )}
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="-mr-2">
                          <XIcon className="h-6 w-6" />
                          <span className="sr-only">Close menu</span>
                      </Button>
                  </div>
                  <div className="flex-grow overflow-y-auto">
                    <NavLinks inSheet={true} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex items-center space-x-3 lg:space-x-4">
              <NavLinks />
              <LanguageSelector />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
