
import type { Metadata, Viewport } from 'next';
import { Geist_Sans as Geist, Anton } from 'next/font/google'; // Changed Cinzel to Anton
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json';
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Changed Cinzel to Anton
const antonFont = Anton({
  variable: '--font-anton',
  subsets: ['latin'],
  weight: ['400'], // Anton typically only has one weight
});

const restaurantName = caCommon.restaurantName; // Default to Catalan for metadata
const mainKeywords = caCommon.seo.mainKeywords;
const defaultDescription = caCommon.seo.defaultDescription;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

export const metadata: Metadata = {
  title: {
    default: `${restaurantName} | ${mainKeywords}`,
    template: `%s | ${restaurantName}`,
  },
  description: defaultDescription,
  authors: [{ name: restaurantName, url: appUrl }],
  keywords: (caCommon.seo.pageContext ? [caCommon.seo.pageContext] : []).concat(mainKeywords.split(',').map(k => k.trim())),
  openGraph: {
    title: `${restaurantName} | ${mainKeywords}`,
    description: defaultDescription,
    url: appUrl,
    siteName: restaurantName,
    images: [
      {
        url: `${appUrl}/og-image.png`, 
        width: 1200,
        height: 630,
        alt: `Logo de ${restaurantName}`,
      },
    ],
    locale: 'ca_ES', // Default locale
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${restaurantName} | ${mainKeywords}`,
    description: defaultDescription,
    images: [`${appUrl}/twitter-image.png`], 
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' }, 
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },  
  ],
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="ca"> 
      <head>
        {gaId && gaId === "G-ZEF2C45GJ7" && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}></script>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body
        className={`${geistSans.variable} ${antonFont.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <AppInitializer />
          {children}
          <Toaster />
          <CookieConsentBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
