import React from "react";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";

export const metadata = {
  title: "Contact | Nexora AI",
  description: "Get in touch with us to book a strategy call or inquire about our enterprise AI automation services.",
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20">
        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
