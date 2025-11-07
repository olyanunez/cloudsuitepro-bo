'use client';

import { LandingNavbar } from '@/components/layout/LandingNavbar';
import { AboutSection } from '@/components/landing/AboutSection';
import { Footer } from '@/components/landing/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <div className="pt-16">
        <AboutSection />
      </div>
      <Footer />
    </div>
  );
}
