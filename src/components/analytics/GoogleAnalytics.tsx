
'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Define window.gtag for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetIdOrEventName: string | Date,
      options?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Function to send page views
export const pageview = (url: string) => {
  if (typeof window.gtag !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "YOUR_GA_MEASUREMENT_ID_HERE") {
      return;
    }
    // Combine pathname and searchParams to get the full URL
    // Ensure searchParams.toString() doesn't return empty if no params
    const queryString = searchParams.toString();
    const url = pathname + (queryString ? `?${queryString}` : '');
    
    pageview(url);

  }, [pathname, searchParams]);

  // Do not load GA scripts if the ID is not configured or is the placeholder
  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === "YOUR_GA_MEASUREMENT_ID_HERE") {
    // console.warn("Google Analytics: NEXT_PUBLIC_GA_MEASUREMENT_ID is not configured or is a placeholder. GA script not loaded.");
    return null;
  }
  
  // For full GDPR compliance, you might want to conditionally load these scripts
  // based on the user's cookie consent status.
  // The current CookieConsentBanner component saves status to localStorage,
  // but this GA component doesn't yet read from it to conditionally load.

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics-init" // Changed ID to be more specific
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
