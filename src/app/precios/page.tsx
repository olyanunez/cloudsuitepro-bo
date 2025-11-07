'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-16">
        <PricingSection />
        {/* Include FAQ here since pricing questions are common */}
        <FAQSection />
      </div>
      <Footer />
    </div>
  );
}
