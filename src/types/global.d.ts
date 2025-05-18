
// This file can be used to declare global types, for example, for window properties
export {}; // Ensures this file is treated as a module.

declare global {
  interface Window {
    // Google Analytics gtag function
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetIdOrEventName: string | Date, // For 'js' command, it's a Date object
      options?: Record<string, any>      // For 'config' or 'event'
    ) => void;
    // Google Analytics dataLayer
    dataLayer?: any[];
  }
}
