'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { Footer } from '@/components/landing/Footer';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-16">
        <HowItWorksSection />
      </div>
      <Footer />
    </div>
  );
}
