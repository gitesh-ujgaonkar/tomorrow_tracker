'use client';

import { useState, useEffect } from 'react';

/**
 * Check if the user has given cookie consent
 * This function is safe to use in both client and server components
 */
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') {
    // Server-side rendering - default to false
    return false;
  }
  
  const consent = localStorage.getItem('cookieConsent');
  return consent === 'accepted';
}

/**
 * Set cookie consent
 * @param consent - Whether the user has given consent
 */
export function setCookieConsent(consent: boolean): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookieConsent', consent ? 'accepted' : 'declined');
  
  // If analytics is enabled, you can initialize it here
  if (consent) {
    // Initialize analytics or other tracking scripts
    console.log('Analytics initialized with user consent');
  }
}

/**
 * Hook to get and set cookie consent
 * @returns [hasConsent, setConsent]
 */
export function useCookieConsent(): [boolean, (consent: boolean) => void] {
  const [consent, setConsent] = useState<boolean>(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const savedConsent = localStorage.getItem('cookieConsent');
      setConsent(savedConsent === 'accepted');
    }
  }, []);

  const updateConsent = (newConsent: boolean) => {
    setConsent(newConsent);
    setCookieConsent(newConsent);
  };

  return [consent, updateConsent];
}
