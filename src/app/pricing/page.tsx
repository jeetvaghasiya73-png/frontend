import React from "react";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import PricingSection from "@/components/sections/PricingSection";

export const metadata = {
  title: "Pricing | Nexora AI",
  description: "Transparent pricing for enterprise AI solutions.",
};

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20">
        <PricingSection />
      </main>
      <FooterSection />
    </>
  );
}
