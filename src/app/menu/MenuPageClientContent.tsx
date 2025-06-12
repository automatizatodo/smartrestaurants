
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
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      let yPosition = margin + 5; // Initial top margin

      // Font sizes
      const mainTitleFontSize = 24;
      const dateFontSize = 10;
      const priceTitleFontSize = 12;
      const priceTextFontSize = 10;
      const descriptionFontSize = 10;
      const categoryTitleFontSize = 16;
      const dishNameFontSize = 11;
      const dishDescriptionFontSize = 9;
      const dishPriceFontSize = 10;
      const subCategoryTitleFontSize = 13;
      const subDishNameFontSize = 10;
      const subDishDescriptionFontSize = 8;


      // Line heights (approximate, adjust as needed)
      const mainTitleLineHeight = 10;
      const regularLineHeight = 7;
      const smallLineHeight = 5;
      const itemSpacing = 3; // Space between menu items
      const sectionSpacing = 8; // Space before a new category title


      const checkAndAddPage = (currentY: number, neededHeight: number = regularLineHeight * 1.5): number => {
        if (currentY + neededHeight > pageHeight - margin) {
          doc.addPage();
          return margin + 5; // Reset yPosition for new page with top margin
        }
        return currentY;
      };
      
      const addTextWithWrap = (text: string, x: number, y: number, options: any, maxWidth: number, fontType?: 'bold' | 'normal' | 'italic', fontSize?: number) => {
        if (fontSize) doc.setFontSize(fontSize);
        if (fontType) doc.setFont(undefined, fontType); else doc.setFont(undefined, 'normal');

        const lines = doc.splitTextToSize(text, maxWidth);
        let currentY = y;
        let textBlockHeight = 0;
        for (const line of lines) {
          if (currentY > pageHeight - margin - (fontSize && fontSize < 10 ? smallLineHeight * 0.9 : smallLineHeight)) { // Check if line fits
             doc.addPage();
             currentY = margin + 5;
          }
          doc.text(line, x, currentY, options);
          const singleLineHeight = (fontSize && fontSize < 10 ? smallLineHeight * 0.9 : smallLineHeight);
          currentY += singleLineHeight;
          textBlockHeight += singleLineHeight;
        }
        return textBlockHeight; 
      };

      // TÍTOL DEL RESTAURANT
      yPosition = checkAndAddPage(yPosition, mainTitleLineHeight * 1.5);
      addTextWithWrap(restaurantName, pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'bold', mainTitleFontSize);
      yPosition += mainTitleLineHeight * 1.5;


      // DATA
      yPosition = checkAndAddPage(yPosition, regularLineHeight);
      const today = new Date();
      const formattedDate = formatDateFns(today, 'dd/MM/yyyy');
      addTextWithWrap(`${t('menu:generatedOn')} ${formattedDate}`, pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'normal', dateFontSize);
      yPosition += regularLineHeight * 1.5;


      // PREUS GENERALS
      if (priceSummary && (priceSummary.weekdayPrice || priceSummary.weekendPrice)) {
        yPosition = checkAndAddPage(yPosition, regularLineHeight);
        addTextWithWrap(t('menu:dailyMenuPrices'), pageWidth / 2, yPosition, { align: 'center'}, contentWidth, 'normal', priceTitleFontSize);
        yPosition += regularLineHeight;
        
        if (priceSummary.weekdayPrice && priceSummary.weekdayLabelKey) {
          yPosition = checkAndAddPage(yPosition, smallLineHeight);
          addTextWithWrap(`${t(priceSummary.weekdayLabelKey)}: ${priceSummary.weekdayPrice}`, pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'normal', priceTextFontSize);
          yPosition += smallLineHeight * 1.2;
        }
        if (priceSummary.weekendPrice && priceSummary.weekendLabelKey) {
          yPosition = checkAndAddPage(yPosition);
          addTextWithWrap(`${t(priceSummary.weekendLabelKey)}: ${priceSummary.weekendPrice}`, pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'normal', priceTextFontSize);
          yPosition += smallLineHeight * 1.2;
        }
        yPosition += regularLineHeight; 
      }

      if (currentMenuPrice) {
        yPosition = checkAndAddPage(yPosition, regularLineHeight);
        addTextWithWrap(`${t('menu:currentMenuPrice')}: ${currentMenuPrice}`, pageWidth / 2, yPosition, { align: 'center' }, contentWidth, 'normal', priceTitleFontSize);
        yPosition += regularLineHeight;
        if (menuDelDiaPriceDescription) {
           yPosition = checkAndAddPage(yPosition, regularLineHeight);
           const descHeight = addTextWithWrap(menuDelDiaPriceDescription, margin, yPosition, {align: 'center'}, contentWidth, 'italic', descriptionFontSize);
           yPosition += descHeight;
        }
        yPosition += regularLineHeight;
      }
      
       if (menuPageDescription && menuPageDescription.trim() !== '' && menuPageDescription !== t('common:page.menu.description', { restaurantName: 'PLACEHOLDER_RESTAURANT_NAME_FOR_COMPARISON' })) {
            yPosition = checkAndAddPage(yPosition, regularLineHeight);
            doc.setTextColor(100); 
            const generalDescHeight = addTextWithWrap(menuPageDescription, margin, yPosition, {align: 'center'}, contentWidth, 'italic', descriptionFontSize);
            yPosition += generalDescHeight;
            yPosition += regularLineHeight * 1.5; 
            doc.setTextColor(0); 
        }


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
        yPosition += regularLineHeight * 1.5;

        const itemsToDisplay = groupedMenu[category.key] || [];
        for (const item of itemsToDisplay) {
          yPosition = checkAndAddPage(yPosition, regularLineHeight * 1.5); 
          const itemName = item.name[language] || item.name.en || "";
          const itemPrice = item.price || "";
          const itemDescription = item.description[language] || item.description.en || "";

          let nameYPos = yPosition;
          
          const itemNameMaxWidth = itemPrice ? contentWidth - doc.getTextWidth(itemPrice) - 10 : contentWidth; // Increased gap for price
          const nameHeight = addTextWithWrap(itemName, margin, nameYPos, {}, itemNameMaxWidth, 'normal', dishNameFontSize);
          
          if (itemPrice) {
            addTextWithWrap(itemPrice, pageWidth - margin, yPosition, { align: 'right' }, doc.getTextWidth(itemPrice) + 2, 'normal', dishPriceFontSize);
          }
          yPosition += nameHeight;


          if (itemDescription) {
            yPosition = checkAndAddPage(yPosition, smallLineHeight * 0.8);
            doc.setTextColor(100);
            const descHeight = addTextWithWrap(itemDescription, margin + 5, yPosition, {}, contentWidth - 5, 'italic', dishDescriptionFontSize);
            yPosition += descHeight;
            doc.setTextColor(0);
          }
          yPosition += itemSpacing * 1.5; // Increased space between items
        }
        yPosition += sectionSpacing / 2; // Extra space after items in a category before next category or subcategory

        if (category.key === SECOND_COURSES_KEY) {
          const subCategories = [
            { key: GRILLED_GARNISH_KEY, items: groupedMenu[GRILLED_GARNISH_KEY] },
            { key: SAUCES_KEY, items: groupedMenu[SAUCES_KEY] },
          ];

          for (const subCat of subCategories) {
            if (subCat.items && subCat.items.length > 0) {
              yPosition = checkAndAddPage(yPosition, regularLineHeight * 1.5 + sectionSpacing / 2);
              addTextWithWrap(t(`menu:${subCat.key}`), margin, yPosition, {}, contentWidth, 'bold', subCategoryTitleFontSize);
              yPosition += regularLineHeight * 1.2;
              doc.setTextColor(0);

              for (const subItem of subCat.items) {
                yPosition = checkAndAddPage(yPosition, regularLineHeight);
                const subItemName = subItem.name[language] || subItem.name.en || "";
                const subItemPrice = subItem.price || "";
                const subItemDescription = subItem.description[language] || subItem.description.en || "";
                
                let subNameYPos = yPosition;
                const subItemNameMaxWidth = subItemPrice ? contentWidth - 10 - doc.getTextWidth(subItemPrice) - 8 : contentWidth -10;
                const subNameHeight = addTextWithWrap(subItemName, margin + 5, subNameYPos, {}, subItemNameMaxWidth, 'normal', subDishNameFontSize);

                if (subItemPrice) {
                    addTextWithWrap(subItemPrice, pageWidth - margin, yPosition, { align: 'right' }, doc.getTextWidth(subItemPrice) + 2, 'normal', dishPriceFontSize);
                }
                yPosition += subNameHeight;

                if (subItemDescription) {
                    yPosition = checkAndAddPage(yPosition, smallLineHeight * 0.8);
                    doc.setTextColor(120);
                    const subDescHeight = addTextWithWrap(subItemDescription, margin + 10, yPosition, {}, contentWidth - 10, 'italic', subDishDescriptionFontSize);
                    yPosition += subDescHeight;
                    doc.setTextColor(0);
                }
                 yPosition += itemSpacing; 
              }
              yPosition += sectionSpacing / 2;
            }
          }
        }
      }

      const safeRestaurantName = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const pdfFileName = `${safeRestaurantName}_menu_${formattedDate.replace(/\//g, '-')}.pdf`;
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
          <div className="mb-8 sm:mb-10">
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

