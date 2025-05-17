
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

const COOKIE_CONSENT_STATUS_KEY = 'cookie_consent_status';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check localStorage only on the client side
    if (typeof window !== 'undefined') {
      const consentStatus = localStorage.getItem(COOKIE_CONSENT_STATUS_KEY);
      // Show banner only if no decision ('accepted' or 'rejected') has been made yet
      if (consentStatus !== 'accepted' && consentStatus !== 'rejected') {
        setShowBanner(true);
      }
    }
  }, []);

  const handleAccept = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_STATUS_KEY, 'accepted');
    }
    setShowBanner(false);
    // Here you would typically initialize any scripts that depend on cookie consent (e.g., analytics)
  };

  const handleReject = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(COOKIE_CONSENT_STATUS_KEY, 'rejected');
    }
    setShowBanner(false);
    // Here you would typically ensure any non-essential cookies/scripts are not loaded
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] bg-background/95 backdrop-blur-sm p-4 sm:p-5 border-t border-border shadow-lg",
        "transition-transform duration-500 ease-out",
        showBanner ? "translate-y-0" : "translate-y-full"
      )}
      role="dialog"
      aria-live="polite"
      aria-label={t('common:cookieConsent.ariaLabel')}
      suppressHydrationWarning
    >
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-foreground/90 text-center sm:text-left flex-grow" suppressHydrationWarning>
          {t('common:cookieConsent.text')}{' '}
          {/* You can add a link to your privacy policy here if you have one */}
          {/* <Link href="/privacy-policy" className="underline hover:text-primary">{t('common:cookieConsent.privacyPolicyLink')}</Link> */}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto flex-shrink-0">
          <Button 
            onClick={handleReject} 
            variant="outline"
            size="sm" 
            className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
            suppressHydrationWarning
          >
            {t('common:cookieConsent.rejectButton')}
          </Button>
          <Button 
            onClick={handleAccept} 
            size="sm" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            suppressHydrationWarning
          >
            {t('common:cookieConsent.acceptButton')}
          </Button>
        </div>
      </div>
    </div>
  );
}
