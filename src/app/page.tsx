import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";

// Dynamically import below-the-fold sections for better SEO and faster initial load
const WhatWeBuildSection = dynamic(() => import("@/components/sections/WhatWeBuildSection"));
const DataFlowShowcase = dynamic(() => import("@/components/sections/DataFlowShowcase"));
const CaseStudiesSection = dynamic(() => import("@/components/sections/CaseStudiesSection"));
const ProcessSection = dynamic(() => import("@/components/sections/ProcessSection"));
const LatestResourcesSection = dynamic(() => import("@/components/sections/LatestResourcesSection"));
const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection"));
const FaqSection = dynamic(() => import("@/components/sections/FaqSection"));
const FooterSection = dynamic(() => import("@/components/layout/FooterSection"));

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <WhatWeBuildSection />
        <DataFlowShowcase />
        <div className="cv-auto">
          <CaseStudiesSection />
        </div>
        <ProcessSection />
        <div className="cv-auto">
          <LatestResourcesSection />
        </div>
        <div className="cv-auto">
          <TestimonialsSection />
        </div>
        <div className="cv-auto">
          <FaqSection />
        </div>
      </main>
      <FooterSection />
    </>
  );
}

