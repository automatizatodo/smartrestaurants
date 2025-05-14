
"use client";

import { useLanguage } from '@/context/LanguageContext';
import { useEffect } from 'react';

export default function AppInitializer() {
  const { language } = useLanguage();

  useEffect(() => {
    // Ensure this runs only on the client side
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // This component primarily handles side effects and does not need to render UI.
  return null;
}
