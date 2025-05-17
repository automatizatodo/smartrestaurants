
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Import locale data
import enCommon from '@/locales/en/common.json';
import enLanding from '@/locales/en/landing.json';
import enMenu from '@/locales/en/menu.json';
import enTestimonials from '@/locales/en/testimonials.json';
import enMenuPage from '@/locales/en/page-specific/menu.json';


import esCommon from '@/locales/es/common.json';
import esLanding from '@/locales/es/landing.json';
import esMenu from '@/locales/es/menu.json';
import esTestimonials from '@/locales/es/testimonials.json';
import esMenuPage from '@/locales/es/page-specific/menu.json';

import caCommon from '@/locales/ca/common.json';
import caLanding from '@/locales/ca/landing.json';
import caMenu from '@/locales/ca/menu.json';
import caTestimonials from '@/locales/ca/testimonials.json';
import caMenuPage from '@/locales/ca/page-specific/menu.json';


type Locale = 'en' | 'es' | 'ca';

interface PageSpecificTranslations {
  menu: Record<string, string>;
  // Add other page-specific translation types here if needed
}

interface Translations {
  common: Record<string, string>;
  landing: Record<string, string>;
  menu: Record<string, string>;
  testimonials: Record<string, string>;
  'page-specific': PageSpecificTranslations;
  [key: string]: Record<string, string> | PageSpecificTranslations; // For dynamic namespace access
}

const translationsData: Record<Locale, Translations> = {
  en: {
    common: enCommon,
    landing: enLanding,
    menu: enMenu,
    testimonials: enTestimonials,
    'page-specific': {
      menu: enMenuPage,
    },
  },
  es: {
    common: esCommon,
    landing: esLanding,
    menu: esMenu,
    testimonials: esTestimonials,
    'page-specific': {
      menu: esMenuPage,
    },
  },
  ca: {
    common: caCommon,
    landing: caLanding,
    menu: caMenu,
    testimonials: caTestimonials,
    'page-specific': {
      menu: caMenuPage,
    },
  },
};

interface LanguageContextType {
  language: Locale;
  setLanguage: Dispatch<SetStateAction<Locale>>;
  t: (keyWithNamespace: string, params?: Record<string, string | number>) => string;
  translations: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Set Catalan as the initial default language
  const [language, setLanguage] = useState<Locale>('ca');
  const [currentTranslations, setCurrentTranslations] = useState<Translations>(translationsData.ca);

  // Removed useEffect for browser language detection to enforce Catalan as default
  // useEffect(() => {
  //   if (typeof navigator !== 'undefined') {
  //     const browserLang = navigator.language.split('-')[0] as Locale;
  //     if (browserLang === 'es' && translationsData.es) {
  //       setLanguage('es');
  //     } else if (browserLang === 'en' && translationsData.en) {
  //       setLanguage('en');
  //     }
  //   }
  // }, []);

  useEffect(() => {
    // This effect updates translations whenever the language state changes
    setCurrentTranslations(translationsData[language] || translationsData.ca); // Fallback to Catalan translations
  }, [language]);

  const t = useCallback(
    (keyWithNamespace: string, params?: Record<string, string | number>) => {
      const parts = keyWithNamespace.split(':');
      let namespace: string;
      let key: string;
      let subKey: string | undefined;

      if (parts.length === 3 && parts[0] === 'page-specific') {
        // Handles keys like "page-specific:menu:title"
        namespace = parts[0];
        subKey = parts[1]; // e.g., "menu"
        key = parts[2];     // e.g., "title"
      } else if (parts.length === 2) {
        [namespace, key] = parts;
      } else {
        namespace = 'common';
        key = keyWithNamespace;
      }
      
      let translation = keyWithNamespace; 

      if (namespace === 'page-specific' && subKey) {
        const pageSpecificNamespace = currentTranslations[namespace] as PageSpecificTranslations | undefined;
        if (pageSpecificNamespace && pageSpecificNamespace[subKey as keyof PageSpecificTranslations] && typeof pageSpecificNamespace[subKey as keyof PageSpecificTranslations][key] === 'string') {
          translation = pageSpecificNamespace[subKey as keyof PageSpecificTranslations][key];
        }
      } else if (currentTranslations[namespace] && typeof (currentTranslations[namespace] as Record<string,string>)[key] === 'string') {
        translation = (currentTranslations[namespace] as Record<string,string>)[key];
      } else if (currentTranslations.common && typeof currentTranslations.common[keyWithNamespace] === 'string') {
         translation = currentTranslations.common[keyWithNamespace];
      }


      if (params) {
        Object.keys(params).forEach(paramKey => {
          const regex = new RegExp(`{${paramKey}}`, 'g');
          translation = translation.replace(regex, String(params[paramKey]));
        });
      }
      return translation;
    },
    [currentTranslations]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
