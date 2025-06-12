
"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import FullMenuDisplay from '@/components/menu/FullMenuDisplay';
import { useLanguage } from '@/context/LanguageContext';
import type { MenuItemData } from '@/data/menu';
import { Button } from '@/components/ui/button';
import restaurantConfig from '@/config/restaurant.config';
import { Star as GoogleIcon, Download, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PriceSummary } from '@/app/api/menu/route';
import html2canvas from 'html2canvas';
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
  const { toast } = useToast();
  const menuContentRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

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
    if (!menuContentRef.current) {
      toast({
        title: t('common:pdf.errorTitle'),
        description: t('common:pdf.errorNoContent'),
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingPdf(true);
    const generatingToast = toast({
      title: t('common:pdf.generatingTitle'),
      description: t('common:pdf.generating'),
    });

    try {
      const canvas = await html2canvas(menuContentRef.current, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // If you have external images
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgWidth / imgHeight;

      let newImgWidth = pdfWidth;
      let newImgHeight = newImgWidth / ratio;

      let position = 0;
      let remainingHeight = imgHeight * (pdfWidth / imgWidth); // total height of the image scaled to pdf width

      if (remainingHeight <= pdfHeight) { // Fits on one page
        pdf.addImage(imgData, 'PNG', 0, 0, newImgWidth, newImgHeight);
      } else { // Needs pagination
        let pageCanvasHeight = pdfHeight * (imgWidth / pdfWidth); // height of canvas section to fit one PDF page
        let yOffset = 0;

        while (remainingHeight > 0) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = imgWidth;
          tempCanvas.height = Math.min(pageCanvasHeight, imgHeight - yOffset);
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
            tempCtx.drawImage(canvas, 0, yOffset, imgWidth, tempCanvas.height, 0, 0, imgWidth, tempCanvas.height);
            const pageImgData = tempCanvas.toDataURL('image/png');
            pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, tempCanvas.height * (pdfWidth / imgWidth));
            remainingHeight -= tempCanvas.height * (pdfWidth / imgWidth);
            yOffset += pageCanvasHeight;
            if (remainingHeight > 0.1) { // 0.1 to handle floating point inaccuracies
              pdf.addPage();
            }
          } else {
            break; 
          }
        }
      }
      
      const today = new Date();
      const formattedDate = formatDateFns(today, 'yyyy-MM-dd');
      const safeRestaurantName = restaurantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      pdf.save(`${safeRestaurantName}_menu_${formattedDate}.pdf`);

      generatingToast.dismiss();
      toast({
        title: t('common:pdf.successTitle'),
        description: t('common:pdf.success'),
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      generatingToast.dismiss();
      toast({
        title: t('common:pdf.errorTitle'),
        description: t('common:pdf.error'),
        variant: 'destructive',
      });
    } finally {
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
