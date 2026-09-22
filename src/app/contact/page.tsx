import React from "react";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";

export const metadata = {
  title: "Contact Us | Tech Infinix — Get Your Custom Quote",
  description:
    "Start your project with Tech Infinix. Request a custom quote for Local SEO, web development, data scraping, or WhatsApp automation services. We respond within 24 hours.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
