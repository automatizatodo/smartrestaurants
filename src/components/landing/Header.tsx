
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
import { cn } from '@/lib/utils';

// Navigation items definition
const navItemKeysBase = [
  // { labelKey: 'common:nav.menuDelDia', href: '/#menu' }, // Eliminat
  { labelKey: 'common:nav.carta', href: '/menu' },
  { labelKey: 'common:nav.services', href: '/#services' },
  { labelKey: 'common:nav.aboutUs', href: '/#about-us' },
];

// AI Sommelier item, added conditionally
const aiSommelierNavItem = { labelKey: 'common:nav.aiSommelier', href: '/#ai-sommelier' };

const navItemKeysEnd = [
  { labelKey: 'common:nav.contact', href: '/#contact-map' },
  { labelKey: 'common:nav.testimonials', href: '/#testimonials' },
];

const getNavItems = () => {
  let items = [...navItemKeysBase];
  if (restaurantConfig.showAISommelierSection) {
    const aboutUsIndex = items.findIndex(item => item.href === '/#about-us');
    if (aboutUsIndex !== -1) {
      items.splice(aboutUsIndex + 1, 0, aiSommelierNavItem); // Insert after About Us
    } else {
      items.push(aiSommelierNavItem);
    }
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
  const currentNavItems = getNavItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const NavLinks = ({ inSheet = false }: { inSheet?: boolean }) => (
    <nav className={cn(
      "flex items-center",
      inSheet ? 'flex-col space-y-3 items-start' : 'space-x-4 lg:space-x-6'
    )}>
      {currentNavItems.map((item) => (
        <Link
          key={item.labelKey}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors",
            !isScrolled && !inSheet && !isMobile ? "text-primary-foreground hover:text-primary-foreground/80" : "text-sidebar-foreground hover:text-primary",
            inSheet && "text-sidebar-foreground hover:text-primary"
          )}
          onClick={() => inSheet && setIsSheetOpen(false)}
        >
          {t(item.labelKey)}
        </Link>
      ))}
      {!inSheet && (
         <Link href="/#booking" passHref>
            <Button
              variant={!isScrolled && !isMobile ? "outline" : "default"}
              size="sm"
              className={cn(
                "ml-2",
                !isScrolled && !isMobile ? "border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
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
         <div className="pt-3 w-full border-t border-sidebar-border mt-2">
            <LanguageSelector />
         </div>
        </>
      )}
    </nav>
  );

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      !isScrolled ? "bg-transparent shadow-none" : "bg-sidebar-background/90 backdrop-blur-md shadow-lg"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
            "flex items-center justify-between",
            isMobile ? "h-20" : "sm:h-24" 
          )}>
          <Link href="/" className="flex items-center space-x-2">
            {restaurantConfig.logoUrl ? (
              <Image
                src={restaurantConfig.logoUrl}
                alt={t('common:restaurantName') + ' Logo'}
                width={240}
                height={80}
                className={cn(
                  "w-auto", 
                  isMobile ? "h-16" : "sm:h-20" 
                )}
                priority
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <span className={cn(
                "font-anton font-bold",
                isMobile ? "text-xl" : "text-xl sm:text-2xl",
                !isScrolled && !isMobile ? "text-primary-foreground" : "text-sidebar-foreground"
              )}>{restaurantName}</span>
            )}
          </Link>

          {isMobile ? (
            <div className="flex items-center">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={!isScrolled ? "text-primary-foreground hover:text-primary-foreground/80" : "text-sidebar-foreground hover:text-primary"}>
                    <MenuIcon className="h-6 w-6" />
                    <span className="sr-only">{t('common:nav.mobileMenuTitle')}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-sidebar-background p-6 flex flex-col">
                   <SheetTitle className="sr-only">{t('common:nav.mobileMenuTitle')}</SheetTitle>
                  <div className="flex justify-between items-center mb-6">
                      <Link href="/" className="flex items-center space-x-2" onClick={() => setIsSheetOpen(false)}>
                        {restaurantConfig.logoUrl ? (
                          <Image
                            src={restaurantConfig.logoUrl}
                            alt={t('common:restaurantName') + ' Logo'}
                            width={150} 
                            height={50} 
                            className="h-16 w-auto filter invert" 
                            style={{ objectFit: 'contain' }}
                          />
                        ) : (
                           <span className="text-xl font-anton font-bold text-sidebar-foreground">{restaurantName}</span>
                        )}
                      </Link>
                      <Button variant="ghost" size="icon" onClick={() => setIsSheetOpen(false)} className="-mr-2 text-sidebar-foreground hover:text-primary">
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
              <LanguageSelector variant={!isScrolled ? 'transparent-header' : 'default'} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
