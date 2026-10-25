"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";

import WhatsAppHero from "@/components/whatsapp-automation/WhatsAppHero";
import ProblemSection from "@/components/whatsapp-automation/ProblemSection";
import ProductOverviewSection from "@/components/whatsapp-automation/ProductOverviewSection";
import HowItWorksSection from "@/components/whatsapp-automation/HowItWorksSection";
import FeaturesGridSection from "@/components/whatsapp-automation/FeaturesGridSection";
import WorkflowComparisonSection from "@/components/whatsapp-automation/WorkflowComparisonSection";
import AudienceSection from "@/components/whatsapp-automation/AudienceSection";
import ScreenshotGallery from "@/components/whatsapp-automation/ScreenshotGallery";
import EarlyAccessForm from "@/components/whatsapp-automation/EarlyAccessForm";
import FaqAccordion from "@/components/whatsapp-automation/FaqAccordion";
import FinalCtaSection from "@/components/whatsapp-automation/FinalCtaSection";

export default function WhatsAppAutomationPage() {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  const handleOpenLightbox = (index: number) => {
    setActiveLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground selection:bg-emerald-500 selection:text-white">
        {/* Section 1: Hero */}
        <WhatsAppHero onOpenLightbox={handleOpenLightbox} />

        {/* Section 2: The Problem */}
        <ProblemSection />

        {/* Section 3: Product Overview */}
        <ProductOverviewSection onOpenLightbox={handleOpenLightbox} />

        {/* Section 4: How It Works */}
        <HowItWorksSection onOpenLightbox={handleOpenLightbox} />

        {/* Section 5: Feature Highlights */}
        <FeaturesGridSection />

        {/* Section 6: Before & After */}
        <WorkflowComparisonSection />

        {/* Section 7: Who Is It For */}
        <AudienceSection />

        {/* Section 8: Product Screenshots Gallery */}
        <ScreenshotGallery
          activeLightboxIndex={activeLightboxIndex}
          onOpenLightbox={handleOpenLightbox}
          onCloseLightbox={handleCloseLightbox}
        />

        {/* Section 9: Early Access Conversion Form */}
        <EarlyAccessForm />

        {/* Section 10: Frequently Asked Questions */}
        <FaqAccordion />

        {/* Section 11: Final Call to Action */}
        <FinalCtaSection />
      </main>

      <FooterSection />
    </>
  );
}
