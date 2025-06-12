
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
import { format as formatDateFns } from 'date-fns'; // Per formatar la data

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
      let yPosition = 20; // Marge superior inicial
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - 2 * margin;
      const titleLineHeight = 10;
      const regularLineHeight = 7;
      const smallLineHeight = 5;

      const addTextWithWrap = (text: string, x: number, y: number, options: any, maxWidth: number, fontType?: 'bold' | 'normal' | 'italic', fontSize?: number) => {
        if (fontSize) doc.setFontSize(fontSize);
        if (fontType) doc.setFont(undefined, fontType);

        const lines = doc.splitTextToSize(text, maxWidth);
        let currentY = y;
        for (const line of lines) {
          if (currentY > pageHeight - margin - smallLineHeight) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(line, x, currentY, options);
          currentY += (fontSize && fontSize < 10 ? smallLineHeight * 0.8 : smallLineHeight);
        }
        return currentY - y; // Return height taken by text block
      };
      
      const checkAndAddPage = (currentY: number, neededHeight: number = regularLineHeight): number => {
        if (currentY + neededHeight > pageHeight - margin) {
          doc.addPage();
          return margin;
        }
        return currentY;
      };


      // TÍTOL DEL RESTAURANT
      yPosition = checkAndAddPage(yPosition, titleLineHeight);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text(restaurantName, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += titleLineHeight * 1.5;

      // DATA
      yPosition = checkAndAddPage(yPosition);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const today = new Date();
      const formattedDate = formatDateFns(today, 'dd/MM/yyyy');
      doc.text(`${t('menu:generatedOn')} ${formattedDate}`, margin, yPosition);
      yPosition += regularLineHeight;

      // PREUS GENERALS
      if (priceSummary && (priceSummary.weekdayPrice || priceSummary.weekendPrice)) {
        yPosition = checkAndAddPage(yPosition);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(t('menu:dailyMenuPrices'), margin, yPosition);
        yPosition += regularLineHeight * 0.8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        if (priceSummary.weekdayPrice && priceSummary.weekdayLabelKey) {
          yPosition = checkAndAddPage(yPosition);
          doc.text(`${t(priceSummary.weekdayLabelKey)}: ${priceSummary.weekdayPrice}`, margin, yPosition);
          yPosition += smallLineHeight;
        }
        if (priceSummary.weekendPrice && priceSummary.weekendLabelKey) {
          yPosition = checkAndAddPage(yPosition);
          doc.text(`${t(priceSummary.weekendLabelKey)}: ${priceSummary.weekendPrice}`, margin, yPosition);
          yPosition += smallLineHeight;
        }
        yPosition += regularLineHeight * 0.5;
      }

      if (currentMenuPrice) {
        yPosition = checkAndAddPage(yPosition);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(`${t('menu:currentMenuPrice')}: ${currentMenuPrice}`, margin, yPosition);
        yPosition += regularLineHeight * 0.8;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        if (menuDelDiaPriceDescription) {
           yPosition = checkAndAddPage(yPosition);
           yPosition += addTextWithWrap(menuDelDiaPriceDescription, margin, yPosition, {}, contentWidth, 'normal', 10);
        }
        yPosition += regularLineHeight * 0.5;
      }
      
      // DESCRIPCIÓ GENERAL DEL MENÚ (SI EXISTEIX)
       if (menuPageDescription && menuPageDescription.trim() !== '' && menuPageDescription !== t('common:page.menu.description', { restaurantName: 'PLACEHOLDER_RESTAURANT_NAME_FOR_COMPARISON' })) {
            yPosition = checkAndAddPage(yPosition);
            doc.setFontSize(10);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100); // Muted color
            yPosition += addTextWithWrap(menuPageDescription, margin, yPosition, {}, contentWidth, 'italic', 10);
            yPosition += regularLineHeight;
            doc.setTextColor(0); // Reset color
        }


      // AGRUPAR PLATS PER CATEGORIA
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
        yPosition = checkAndAddPage(yPosition, titleLineHeight * 1.5); // Espai abans de la categoria
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text(t(`menu:${category.key}`), margin, yPosition);
        yPosition += regularLineHeight * 0.8;
        doc.setDrawColor(200); // Color de línia
        doc.line(margin, yPosition, pageWidth - margin, yPosition); // Línia separadora
        yPosition += regularLineHeight * 0.8;

        const itemsToDisplay = groupedMenu[category.key] || [];
        for (const item of itemsToDisplay) {
          yPosition = checkAndAddPage(yPosition, regularLineHeight * 2); // Estimar espai per plat
          const itemName = item.name[language] || item.name.en || "";
          const itemPrice = item.price || "";
          const itemDescription = item.description[language] || item.description.en || "";

          doc.setFontSize(12);
          doc.setFont(undefined, 'bold');
          let nameYPos = yPosition;
          
          const itemNameMaxWidth = itemPrice ? contentWidth - doc.getTextWidth(itemPrice) - 5 : contentWidth;
          const itemNameLines = doc.splitTextToSize(itemName, itemNameMaxWidth);
          
          for (let i = 0; i < itemNameLines.length; i++) {
            nameYPos = checkAndAddPage(nameYPos);
            doc.text(itemNameLines[i], margin, nameYPos);
            if (i < itemNameLines.length -1) nameYPos += smallLineHeight; // Si hi ha més línies de nom
          }

          if (itemPrice) {
            doc.setFontSize(11); // Preu una mica més petit
            doc.setFont(undefined, 'normal');
            doc.text(itemPrice, pageWidth - margin, yPosition, { align: 'right' });
          }
          yPosition = nameYPos + smallLineHeight;


          if (itemDescription) {
            yPosition = checkAndAddPage(yPosition, smallLineHeight);
            doc.setFontSize(9);
            doc.setFont(undefined, 'italic');
            doc.setTextColor(100);
            yPosition += addTextWithWrap(itemDescription, margin + 5, yPosition, {}, contentWidth - 5, 'italic', 9);
            doc.setTextColor(0);
          }
          yPosition += regularLineHeight * 0.7; // Espai entre plats
        }

        // Subcategories per a "Segon Plat"
        if (category.key === SECOND_COURSES_KEY) {
          const subCategories = [
            { key: GRILLED_GARNISH_KEY, items: groupedMenu[GRILLED_GARNISH_KEY] },
            { key: SAUCES_KEY, items: groupedMenu[SAUCES_KEY] },
          ];

          for (const subCat of subCategories) {
            if (subCat.items && subCat.items.length > 0) {
              yPosition = checkAndAddPage(yPosition, regularLineHeight * 1.5);
              doc.setFontSize(13);
              doc.setFont(undefined, 'bold');
              doc.setTextColor(50);
              doc.text(t(`menu:${subCat.key}`), margin + 5, yPosition);
              yPosition += regularLineHeight * 0.8;
              doc.setTextColor(0);

              for (const subItem of subCat.items) {
                yPosition = checkAndAddPage(yPosition, regularLineHeight);
                const subItemName = subItem.name[language] || subItem.name.en || "";
                const subItemPrice = subItem.price || "";
                const subItemDescription = subItem.description[language] || subItem.description.en || "";
                
                doc.setFontSize(11);
                doc.setFont(undefined, 'bold');
                let subNameYPos = yPosition;
                const subItemNameMaxWidth = subItemPrice ? contentWidth - 10 - doc.getTextWidth(subItemPrice) -5 : contentWidth -10;
                const subItemNameLines = doc.splitTextToSize(subItemName, subItemNameMaxWidth);

                for (let i=0; i<subItemNameLines.length; i++){
                    subNameYPos = checkAndAddPage(subNameYPos);
                    doc.text(subItemNameLines[i], margin + 10, subNameYPos);
                    if (i < subItemNameLines.length -1) subNameYPos += smallLineHeight * 0.9;
                }

                if (subItemPrice) {
                    doc.setFontSize(10);
                    doc.setFont(undefined, 'normal');
                    doc.text(subItemPrice, pageWidth - margin, yPosition, { align: 'right' });
                }
                yPosition = subNameYPos + smallLineHeight;

                if (subItemDescription) {
                    yPosition = checkAndAddPage(yPosition, smallLineHeight);
                    doc.setFontSize(8);
                    doc.setFont(undefined, 'italic');
                    doc.setTextColor(120);
                    yPosition += addTextWithWrap(subItemDescription, margin + 15, yPosition, {}, contentWidth - 15, 'italic', 8);
                    doc.setTextColor(0);
                }
                 yPosition += regularLineHeight * 0.5; 
              }
            }
          }
        }
      }

      // Descarregar PDF
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
          <div className="mb-8 sm:mb-10"> {/* Contenidor principal per al PDF */}
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
              {menuPageDescription && menuPageDescription.trim() !== '' && (
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
