'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Cookie } from 'lucide-react';
import Link from 'next/link';
import { useCookieConsent } from '@/lib/utils/cookies';

export function CookieConsentBanner() {
  const [hasConsent, setConsent] = useCookieConsent();
  
  // If consent is already given or we're on the server, don't show the banner
  if (hasConsent || typeof window === 'undefined') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-full bg-primary/10">
              <Cookie className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium">We value your privacy</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <Link 
                  href="/privacy-policy" 
                  className="text-primary underline underline-offset-4 hover:text-primary/80"
                >
                  Cookie Policy
                </Link>
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setConsent(false)}
              className="w-full md:w-auto"
            >
              Reject
            </Button>
            <Button 
              size="sm" 
              onClick={() => setConsent(true)}
              className="w-full md:w-auto"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Accept All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
