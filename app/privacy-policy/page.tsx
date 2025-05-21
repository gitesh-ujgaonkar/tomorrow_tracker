import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Policy',
  description: 'Learn how we handle your data and use cookies on our platform.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Button variant="ghost" asChild className="pl-0 hover:bg-transparent">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
      
      <div className="prose dark:prose-invert max-w-none">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy & Cookie Policy</h1>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
          <p className="mb-4">
            Welcome to Tomorrow Tracker. We respect your privacy and are committed to protecting your personal data. 
            This privacy policy will inform you about how we look after your personal data when you visit our website 
            and tell you about your privacy rights and how the law protects you.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
          <p className="mb-4">
            We may collect, use, store and transfer different kinds of personal data about you, which we have grouped together as follows:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
            <li><strong>Contact Data</strong> includes email address.</li>
            <li><strong>Profile Data</strong> includes your username and password, your preferences, and feedback.</li>
            <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
            <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, and other technology on the devices you use to access this website.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. How We Use Cookies</h2>
          <p className="mb-4">
            Cookies are small text files that are placed on your computer by websites that you visit. They are widely used in order to make websites work, 
            or work more efficiently, as well as to provide information to the owners of the site.
          </p>
          <h3 className="text-xl font-semibold mt-6 mb-2">We use the following types of cookies:</h3>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li><strong>Strictly necessary cookies:</strong> These are cookies that are required for the operation of our website.</li>
            <li><strong>Analytical/performance cookies:</strong> They allow us to recognize and count the number of visitors and to see how visitors move around our website.</li>
            <li><strong>Functionality cookies:</strong> These are used to recognize you when you return to our website.</li>
            <li><strong>Targeting cookies:</strong> These cookies record your visit to our website, the pages you have visited, and the links you have followed.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Your Rights</h2>
          <p className="mb-4">
            Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2">
            <li>Request access to your personal data</li>
            <li>Request correction of your personal data</li>
            <li>Request erasure of your personal data</li>
            <li>Object to processing of your personal data</li>
            <li>Request restriction of processing your personal data</li>
            <li>Request transfer of your personal data</li>
            <li>Right to withdraw consent</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this privacy policy or our privacy practices, please contact us at:
          </p>
          <p>
            Email: <a href="mailto:privacy@tomorrowtracker.com" className="text-primary hover:underline">privacy@tomorrowtracker.com</a>
          </p>
        </section>

        <div className="text-sm text-muted-foreground mt-12 pt-6 border-t">
          <p>Last updated: May 21, 2025</p>
        </div>
      </div>
    </div>
  );
}
