'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-16">
        <ContactSection />
      </div>
      <Footer />
    </div>
  );
}
