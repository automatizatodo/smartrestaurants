
import type { Metadata, Viewport } from 'next';
import { Geist, Anton } from 'next/font/google'; // Changed from Geist_Sans as Geist
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json';
import CookieConsentBanner from '@/components/common/CookieConsentBanner';

const geist = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const antonFont = Anton({
  variable: '--font-anton',
  subsets: ['latin'],
  weight: ['400'], // Anton typically only has one weight
});

const restaurantName = caCommon.restaurantName;
const mainKeywords = caCommon.seo.mainKeywords;
const defaultDescription = caCommon.seo.defaultDescription;
const defaultTitleSuffix = caCommon.seo.defaultTitleSuffix;
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9003';


export const metadata: Metadata = {
  title: {
    default: `${restaurantName} | ${defaultTitleSuffix}`,
    template: `%s | ${restaurantName}`,
  },
  description: defaultDescription,
  authors: [{ name: restaurantName, url: appUrl }],
  keywords: (caCommon.seo.pageContext ? [caCommon.seo.pageContext] : []).concat(mainKeywords.split(',').map(k => k.trim())),
  openGraph: {
    title: `${restaurantName} | ${defaultTitleSuffix}`,
    description: defaultDescription,
    url: appUrl,
    siteName: restaurantName,
    images: [
      {
        url: `${appUrl}/og-image.png`, // Replace with your actual OG image URL
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
    title: `${restaurantName} | ${defaultTitleSuffix}`,
    description: defaultDescription,
    images: [`${appUrl}/twitter-image.png`], // Replace with your actual Twitter image URL
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
    // apple: '/apple-touch-icon.png', // Add if you have an apple touch icon
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(var(--background))' }, // For light theme (which is now .dark)
    { media: '(prefers-color-scheme: dark)', color: 'hsl(var(--background))' },  // For dark theme (which is now :root)
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
        className={`${geist.variable} ${antonFont.variable} antialiased`}
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
