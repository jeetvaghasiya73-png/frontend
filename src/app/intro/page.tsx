import React from "react";
import type { Metadata } from "next";
import BrandFilmPlayer from "@/components/sections/BrandFilmPlayer";

export const metadata: Metadata = {
  title: "Brand Film & Intro | Tech Infinix — 3D Interactive Experience",
  description:
    "Experience the 44-second interactive 3D brand film of Tech Infinix. Explore how our IT solutions, web development, data scraping, and WhatsApp automation power modern enterprises.",
  openGraph: {
    title: "Tech Infinix — 3D Brand Film & Introduction",
    description:
      "A 44-second interactive 3D brand film showcasing the technology behind your business.",
    url: "https://techinfinix.com/intro",
    type: "video.other",
  },
};

export default function IntroPage() {
  return (
    <main className="relative w-full h-screen bg-[#0b0c0e] overflow-hidden">
      {/* Semantic Accessible SEO Hierarchy */}
      <div className="sr-only">
        <h1>Tech Infinix: The Technology Behind Your Business — 3D Brand Film</h1>
        <p>
          Every business has a vision. Technology should move it forward. Tech
          Infinix provides full-spectrum IT solutions, custom web application
          development, digital marketing and local SEO dominance, scalable web
          scraping, and 24/7 WhatsApp workflow automation.
        </p>
        <h2>Core Technology Capabilities</h2>
        <ul>
          <li>IT Solutions: Server setup, cloud architecture, and secure enterprise networks.</li>
          <li>Digital Marketing: High-converting local SEO and targeted lead generation campaigns.</li>
          <li>Business Automation: Repetitive tasks like order management, follow-ups, and customer inquiries automated on autopilot.</li>
          <li>Web Scraping &amp; Data: Verified business data extracted at scale with anti-bot bypass.</li>
        </ul>
      </div>

      {/* Interactive 3D Cinema Player */}
      <BrandFilmPlayer />
    </main>
  );
}
