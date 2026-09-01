import React from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";

// Dynamically import below-the-fold sections for better SEO and faster initial load
const WhatWeBuildSection = dynamic(() => import("@/components/sections/WhatWeBuildSection"));
const DataFlowShowcase = dynamic(() => import("@/components/sections/DataFlowShowcase"));

const PipelineSection = dynamic(() => import("@/components/sections/PipelineSection"));
const CaseStudiesSection = dynamic(() => import("@/components/sections/CaseStudiesSection"));
const ProcessSection = dynamic(() => import("@/components/sections/ProcessSection"));
const TechStackSection = dynamic(() => import("@/components/sections/TechStackSection"));
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
        <PipelineSection />
        <CaseStudiesSection />
        <ProcessSection />
        <TechStackSection />
        <TestimonialsSection />
        <FaqSection />
      </main>
      <FooterSection />
    </>
  );
}
