
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import { Playfair_Display } from 'next/font/google'; // Changed from Lora
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import AppInitializer from '@/components/AppInitializer';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Changed Lora to Playfair_Display for headings
const playfairDisplay = Playfair_Display({
  variable: '--font-playfair-display', 
  subsets: ['latin'],
  weight: ['400', '700', '900'], // Added more weights for headings
});

export const metadata: Metadata = {
  // Title and description can be set dynamically if needed, or statically here.
  // Example:
  // title: "Restaurant Title",
  // description: "Restaurant Description"
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
    <html lang="en" className="dark">
      <body 
        className={`${geistSans.variable} ${playfairDisplay.variable} antialiased`} // Updated to include playfairDisplay
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <AppInitializer /> {/* Runs client-side effects like setting lang */}
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
