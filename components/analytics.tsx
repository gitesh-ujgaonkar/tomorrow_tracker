'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { hasCookieConsent } from '@/lib/utils/cookies';

/**
 * Analytics component that handles page views and events
 * Only tracks if the user has given cookie consent
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only run on client side and if user has given consent
    if (typeof window === 'undefined' || !hasCookieConsent()) return;

    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    
    // Here you would typically send the pageview to your analytics service
    // For example, with Google Analytics:
    // window.gtag('config', 'YOUR_GA_MEASUREMENT_ID', { page_path: url });
    
    console.log('Page view:', url);
    
  }, [pathname, searchParams]);

  return null; // This component doesn't render anything
}

/**
 * Track a custom event
 * @param action - The action name (e.g., 'sign_up', 'login')
 * @param category - The category of the event (e.g., 'User', 'Engagement')
 * @param label - Additional label for the event
 * @param value - Optional numeric value
 */
export function trackEvent(
  action: string, 
  category: string, 
  label?: string, 
  value?: number
) {
  // Only track if user has given consent
  if (typeof window === 'undefined' || !hasCookieConsent()) return;
  
  // Here you would typically send the event to your analytics service
  // For example, with Google Analytics:
  // window.gtag('event', action, {
  //   event_category: category,
  //   event_label: label,
  //   value: value
  // });
  
  console.log('Event tracked:', { action, category, label, value });
}
