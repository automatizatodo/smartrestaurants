
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Lora } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import restaurantConfig from '@/config/restaurant.config'; // Import config

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '700'],
});

// Dynamically generate metadata from config
export const metadata: Metadata = {
  title: restaurantConfig.restaurantName,
  description: restaurantConfig.tagline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark"> {/* Defaulting to dark theme */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${lora.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
