
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { Playfair_Display, Cinzel } from 'next/font/google'; // Import Cinzel
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';
import caCommon from '@/locales/ca/common.json'; // For default metadata

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display',
  subsets: ['latin'],
  weight: ['400', '700', '900'],
});

const cinzel = Cinzel({ // Define Cinzel
  variable: '--font-cinzel',
  subsets: ['latin'],
  weight: ['400', '700'], // Choose appropriate weights
});

// Default metadata, primarily in Catalan as it's the default language
export const metadata: Metadata = {
  title: {
    default: `${caCommon.restaurantName} | ${caCommon.seo.defaultTitleSuffix}`,
    template: `%s | ${caCommon.restaurantName}`,
  },
  description: caCommon.seo.defaultDescription,
  keywords: ['restaurant a Sabadell', 'cuina catalana', 'brasa', 'sense gluten', 'Can Fanals Sabadell', 'menjar a Sabadell'],
  authors: [{ name: 'Can Fanals', url: process.env.NEXT_PUBLIC_APP_URL }],
  openGraph: {
    title: `${caCommon.restaurantName} | ${caCommon.seo.defaultTitleSuffix}`,
    description: caCommon.seo.defaultDescription,
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: caCommon.restaurantName,
    // images: [ // Add a good default OG image later
    //   {
    //     url: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`, // Example
    //     width: 1200,
    //     height: 630,
    //   },
    // ],
    locale: 'ca_ES', // Default locale
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${caCommon.restaurantName} | ${caCommon.seo.defaultTitleSuffix}`,
    description: caCommon.seo.defaultDescription,
    // images: [`${process.env.NEXT_PUBLIC_APP_URL}/twitter-image.png`], // Example
    // site: '@yourTwitterHandle', // Add if you have one
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
    icon: '/favicon.ico', // Standard path for favicon in public folder
    // You can also add other icons here, e.g., apple-touch-icon
    // apple: '/apple-touch-icon.png',
  },
  // Verification (add your IDs if you use these services)
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION_ID',
  //   yandex: 'YOUR_YANDEX_VERIFICATION_ID',
  // },
  // alternates: { // If you have different language versions fully set up for SEO
  //   canonical: process.env.NEXT_PUBLIC_APP_URL,
  //   languages: {
  //     'ca-ES': `${process.env.NEXT_PUBLIC_APP_URL}/ca`,
  //     'es-ES': `${process.env.NEXT_PUBLIC_APP_URL}/es`,
  //     'en-US': `${process.env.NEXT_PUBLIC_APP_URL}/en`,
  //   },
  // },
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
  return (
    <html lang="ca" className="dark">
      <body
        className={`${geistSans.variable} ${playfairDisplay.variable} ${cinzel.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <AppInitializer />
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
