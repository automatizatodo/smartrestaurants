
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FullMenuDisplay from '@/components/menu/FullMenuDisplay';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItemData } from '@/data/menu';
import { menuCategories, GRILLED_GARNISH_KEY, SAUCES_KEY, SECOND_COURSES_KEY } from '@/data/menu';
import { Button } from '@/components/ui/button';
import restaurantConfig from '@/config/restaurant.config';
import { Star as GoogleIcon, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PriceSummary } from '@/app/api/menu/route';
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";
import { format as formatDateFns } from 'date-fns';

const TripAdvisorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-5 w-5">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4"></circle>
    <line x1="22" x2="18" y1="12" y2="12"></line>
    <line x1="6" x2="2" y1="12" y2="12"></line>
    <line x1="12" x2="12" y1="6" y2="2"></line>
    <line x1="12" x2="12" y1="22" y2="18"></line>
  </svg>
);

interface MenuPageClientContentProps {
  menuItems: MenuItemData[];
  currentMenuPrice?: string | null;
  menuDelDiaPriceDescriptionKey?: string;
  priceSummary: PriceSummary;
}

export default function MenuPageClientContent({
  menuItems,
  currentMenuPrice,
  menuDelDiaPriceDescriptionKey,
  priceSummary,
}: MenuPageClientContentProps) {
  const { t, language, setLanguage, translations } = useLanguage();
  const restaurantName = translations.common.restaurantName;
  const { toast, dismiss } = useToast();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const generatingToastIdRef = useRef<string | null>(null);
  
  // Aquesta referència ja no s'utilitza per html2canvas, però la deixem per si es necessita per a una altra cosa
  const menuContentRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    document.title = t('common:page.menu.title') + " | " + restaurantName;
  }, [t, restaurantName, language]);

  const menuDelDiaPriceDescription = menuDelDiaPriceDescriptionKey
    ? t(menuDelDiaPriceDescriptionKey)
    : "";

  const menuPageDescription = t('common:page.menu.description', { restaurantName });

  const languageButtons = [
    { code: 'ca', name: 'Català' },
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    const { id: newToastId } = toast({
      title: t('common:pdf.generatingTitle'),
      description: t('common:pdf.generating'),
      duration: Infinity,
    });
    generatingToastIdRef.current = newToastId;

    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10; // Reduït marge
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin + 2; // Reduït marge superior inicial

      // Mides de font i alçades de línia ajustades per a més compactació
      const mainTitleFontSize = 18; // Reduït
      const priceTextFontSize = 11; // Reduït
      const descriptionFontSize = 9; // Reduït
      const categoryTitleFontSize = 14; // Reduït
      const dishNameFontSize = 10; // Mantingut
      const dishDescriptionFontSize = 8; // Reduït
      const dishPriceFontSize = 9; // Mantingut
      const subCategoryTitleFontSize = 12; // Reduït
      const subDishNameFontSize = 9; // Reduït
      const subDishDescriptionFontSize = 7; // Reduït

      const mainTitleLineHeight = 7; // Reduït
      const regularLineHeight = 5; // Reduït
      const smallLineHeight = 3.5; // Reduït
      const itemSpacing = 1.5; // Reduït
      const sectionSpacing = 4; // Reduït

      const checkAndAddPage = (currentY: number, neededHeight: number = regularLineHeight * 1.5): number => {
        if (currentY + neededHeight > pageHeight - margin) {
          doc.addPage();
          return margin + 2; 
        }
        return currentY;
      };
      
      const addTextWithWrap = (text: string, x: number, y: number, options: any, maxWidth: number, fontType?: 'bold' | 'normal' | 'italic', fontSize?: number) => {
        if (fontSize) doc.setFontSize(fontSize);
        doc.setFont(undefined, fontType || 'normal');

        const lines = doc.splitTextToSize(text, maxWidth);
        let currentY = y;
        let textBlockHeight = 0;
        for (const line of lines) {
          if (currentY > pageHeight - margin - (fontSize && fontSize < 10 ? smallLineHeight * 0.9 : smallLineHeight)) { 
             doc.addPage();
             currentY = margin + 2;
          }
          doc.text(line, x, currentY, options);
          const singleLineHeight = (fontSize && fontSize < 10 ? smallLineHeight * 0.9 : smallLineHeight);
          currentY += singleLineHeight;
          textBlockHeight += singleLineHeight;
        }
        return textBlockHeight; 
      };

      // TÍTOL DEL MENÚ
      yPosition = checkAndAddPage(yPosition, mainTitleLineHeight * 1.5);
      addTextWithWrap(t('menu:menuDelDia.title'), pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'bold', mainTitleFontSize);
      yPosition += mainTitleLineHeight * 1.5;

      // PREU ACTUAL DEL MENÚ I DESCRIPCIÓ
      if (currentMenuPrice) {
        yPosition = checkAndAddPage(yPosition, regularLineHeight);
        addTextWithWrap(currentMenuPrice, pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'normal', priceTextFontSize);
        yPosition += regularLineHeight;
      }
      if (menuDelDiaPriceDescription) {
           yPosition = checkAndAddPage(yPosition, regularLineHeight);
           const descHeight = addTextWithWrap(menuDelDiaPriceDescription, pageWidth / 2, yPosition, {align: 'center'}, contentWidth, 'italic', descriptionFontSize);
           yPosition += descHeight;
      }
      yPosition += regularLineHeight * 1.5; // Espai després de la capçalera


      const groupedMenu: Record<string, MenuItemData[]> = menuItems.reduce((acc, item) => {
        const categoryKey = item.categoryKey;
        if (!acc[categoryKey]) {
          acc[categoryKey] = [];
        }
        acc[categoryKey].push(item);
        return acc;
      }, {});

      const sortedCategories = menuCategories
        .filter(cat => {
            const itemsInCategory = groupedMenu[cat.key];
            const hasDirectItems = itemsInCategory && itemsInCategory.length > 0;
            if (cat.key === SECOND_COURSES_KEY) {
                const hasSubCategoryItems = 
                    (groupedMenu[GRILLED_GARNISH_KEY] && groupedMenu[GRILLED_GARNISH_KEY].length > 0) ||
                    (groupedMenu[SAUCES_KEY] && groupedMenu[SAUCES_KEY].length > 0);
                return hasDirectItems || hasSubCategoryItems;
            }
            return hasDirectItems;
        })
        .sort((a, b) => a.order - b.order);

      for (const category of sortedCategories) {
        yPosition = checkAndAddPage(yPosition, categoryTitleFontSize + sectionSpacing); 
        addTextWithWrap(t(`menu:${category.key}`), pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'bold', categoryTitleFontSize);
        yPosition += regularLineHeight; 
        
        doc.setDrawColor(200); 
        doc.line(margin, yPosition, pageWidth - margin, yPosition); 
        yPosition += regularLineHeight * 1.2;

        const itemsToDisplay = groupedMenu[category.key] || [];
        for (const item of itemsToDisplay) {
          yPosition = checkAndAddPage(yPosition, regularLineHeight * 1.2); 
          const itemName = item.name[language] || item.name.en || "";
          const itemPrice = item.price || "";
          const itemDescription = item.description[language] || item.description.en || "";

          let nameYPos = yPosition;
          
          const itemNameMaxWidth = itemPrice ? contentWidth - doc.getTextWidth(itemPrice) - 5 : contentWidth; // Reduït gap per preu
          const nameHeight = addTextWithWrap(itemName, margin, nameYPos, {}, itemNameMaxWidth, 'normal', dishNameFontSize);
          
          if (itemPrice) {
            addTextWithWrap(itemPrice, pageWidth - margin, yPosition, { align: 'right' }, doc.getTextWidth(itemPrice) + 1, 'normal', dishPriceFontSize);
          }
          yPosition += nameHeight;

          if (itemDescription) {
            yPosition = checkAndAddPage(yPosition, smallLineHeight * 0.8);
            doc.setTextColor(100);
            const descHeight = addTextWithWrap(itemDescription, margin + 3, yPosition, {}, contentWidth - 3, 'italic', dishDescriptionFontSize);
            yPosition += descHeight;
            doc.setTextColor(0);
          }
          yPosition += itemSpacing; 
        }
        yPosition += sectionSpacing / 2; 

        if (category.key === SECOND_COURSES_KEY) {
          const subCategories = [
            { key: GRILLED_GARNISH_KEY, items: groupedMenu[GRILLED_GARNISH_KEY] },
            { key: SAUCES_KEY, items: groupedMenu[SAUCES_KEY] },
          ];

          for (const subCat of subCategories) {
            if (subCat.items && subCat.items.length > 0) {
              yPosition = checkAndAddPage(yPosition, regularLineHeight * 1.2 + sectionSpacing / 2);
              addTextWithWrap(t(`menu:${subCat.key}`), pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'bold', subCategoryTitleFontSize); // Centrat
              yPosition += regularLineHeight * 1.0;
              doc.setTextColor(0);

              for (const subItem of subCat.items) {
                yPosition = checkAndAddPage(yPosition, regularLineHeight * 0.9);
                const subItemName = subItem.name[language] || subItem.name.en || "";
                const subItemPrice = subItem.price || "";
                const subItemDescription = subItem.description[language] || subItem.description.en || "";
                
                let subNameYPos = yPosition;
                const subItemNameMaxWidth = subItemPrice ? contentWidth - 5 - doc.getTextWidth(subItemPrice) - 4 : contentWidth -5;
                const subNameHeight = addTextWithWrap(subItemName, margin, subNameYPos, {}, subItemNameMaxWidth, 'normal', subDishNameFontSize); // Alineat a l'esquerra

                if (subItemPrice) {
                    addTextWithWrap(subItemPrice, pageWidth - margin, yPosition, { align: 'right' }, doc.getTextWidth(subItemPrice) + 1, 'normal', dishPriceFontSize);
                }
                yPosition += subNameHeight;

                if (subItemDescription) {
                    yPosition = checkAndAddPage(yPosition, smallLineHeight * 0.7);
                    doc.setTextColor(120);
                    const subDescHeight = addTextWithWrap(subItemDescription, margin + 3, yPosition, {}, contentWidth - 3, 'italic', subDishDescriptionFontSize);
                    yPosition += subDescHeight;
                    doc.setTextColor(0);
                }
                 yPosition += itemSpacing * 0.8; 
              }
              yPosition += sectionSpacing / 2;
            }
          }
        }
      }

      const safeRestaurantName = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const today = new Date();
      const formattedDateForFilename = formatDateFns(today, 'yyyy-MM-dd');
      const pdfFileName = `${safeRestaurantName}_menu_${formattedDateForFilename}.pdf`;
      doc.save(pdfFileName);

      toast({
        title: t('common:pdf.successTitle'),
        description: t('common:pdf.success'),
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: t('common:pdf.errorTitle'),
        description: t('common:pdf.error'),
        variant: 'destructive',
      });
    } finally {
      if (generatingToastIdRef.current) {
        dismiss(generatingToastIdRef.current);
        generatingToastIdRef.current = null;
      }
      setIsGeneratingPdf(false);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow pt-24 sm:pt-32 pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={menuContentRef} className="mb-8 sm:mb-10">
            <div className="text-center pt-0 lg:pt-12">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-4" suppressHydrationWarning>
                {t('common:page.menu.title')}
              </h1>

              {priceSummary && (priceSummary.weekdayPrice || priceSummary.weekendPrice) && (
                <div className="mb-2 text-md text-foreground/80">
                  {priceSummary.weekdayPrice && priceSummary.weekdayLabelKey && (
                    <span className="mr-3" suppressHydrationWarning>
                      {t(priceSummary.weekdayLabelKey)}: <span className="font-semibold">{priceSummary.weekdayPrice}</span>
                    </span>
                  )}
                  {priceSummary.weekendPrice && priceSummary.weekendLabelKey && (
                    <span suppressHydrationWarning>
                      {t(priceSummary.weekendLabelKey)}: <span className="font-semibold">{priceSummary.weekendPrice}</span>
                    </span>
                  )}
                </div>
              )}

              {currentMenuPrice && (
                <div className="mb-2">
                  <p className="text-3xl sm:text-4xl font-bold text-primary">{currentMenuPrice}</p>
                  {menuDelDiaPriceDescription && (
                    <p className="text-sm text-muted-foreground mt-1" suppressHydrationWarning>
                      {menuDelDiaPriceDescription}
                    </p>
                  )}
                </div>
              )}
              {menuPageDescription && menuPageDescription.trim() !== '' && menuPageDescription !== t('common:page.menu.description', { restaurantName: 'PLACEHOLDER_RESTAURANT_NAME_FOR_COMPARISON' }) && (
                 <p className="text-lg text-muted-foreground max-w-3xl mx-auto" suppressHydrationWarning>
                    {menuPageDescription}
                 </p>
              )}
            </div>
            
            <div className="flex justify-center items-center space-x-2 my-6 sm:my-8">
              {languageButtons.map((langButton) => (
                <Button
                  key={langButton.code}
                  variant={language === langButton.code ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage(langButton.code as 'ca' | 'es' | 'en')}
                  className={cn(
                    language === langButton.code ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'border-primary text-primary hover:bg-primary/10'
                  )}
                  suppressHydrationWarning
                >
                  {langButton.name}
                </Button>
              ))}
            </div>
            
            <FullMenuDisplay menuItems={menuItems} />
          </div>

          <div className="text-center mb-6 sm:mb-8">
            <Button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              suppressHydrationWarning
            >
              {isGeneratingPdf ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Download className="mr-2 h-5 w-5" />
              )}
              {t('common:button.viewAsPdf')}
            </Button>
          </div>

          {(restaurantConfig.googleReviewUrl || restaurantConfig.tripAdvisorReviewUrl) && (
            <div className="mt-12 sm:mt-16 text-center flex flex-col items-center space-y-3 sm:flex-row sm:space-y-0 sm:justify-center sm:space-x-6">
              {restaurantConfig.googleReviewUrl && (
                <Link href={restaurantConfig.googleReviewUrl} target="_blank" rel="noopener noreferrer" passHref className="w-full sm:w-auto">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto" suppressHydrationWarning>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    {t('landing:testimonials.leaveGoogleReview')}
                  </Button>
                </Link>
              )}
              {restaurantConfig.tripAdvisorReviewUrl && (
                <Link href={restaurantConfig.tripAdvisorReviewUrl} target="_blank" rel="noopener noreferrer" passHref className="w-full sm:w-auto">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto" suppressHydrationWarning>
                    <TripAdvisorIcon />
                    {t('landing:testimonials.leaveTripAdvisorReview')}
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
