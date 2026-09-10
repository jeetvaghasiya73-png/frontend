"use client";

import React from "react";
import { Cpu, Cloud, Layers, Database, Shield, Zap } from "lucide-react";

export default function MarqueeSection() {
  const logos = [
    { name: "OpenAI", type: "AI" },
    { name: "Anthropic", type: "AI" },
    { name: "Google", type: "Cloud" },
    { name: "Python", type: "Lang" },
    { name: "FastAPI", type: "API" },
    { name: "Docker", type: "DevOps" },
    { name: "AWS", type: "Cloud" },
    { name: "Cloudflare", type: "Network" },
    { name: "React", type: "Web" },
    { name: "Next.js", type: "Web" },
    { name: "GSAP", type: "Motion" },
    { name: "Three.js", type: "3D" }
  ];

  // Repeat logos array to create seamless loop
  const doubleLogos = [...logos, ...logos, ...logos];

  return (
    <section className="py-16 border-y border-border-custom bg-surface/20 overflow-hidden relative select-none">
      <div className="max-w-7xl mx-auto px-6 md:px-12 mb-6">
        <h2 className="text-[10px] uppercase tracking-wider font-semibold text-secondary-custom text-center md:text-left">
          Trusted Technology Stack & Ecosystem Partnerships
        </h2>
      </div>

      {/* Marquee Wrapper */}
      <div className="flex relative items-center overflow-hidden w-full before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:after:from-background after:to-transparent">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12 py-4">
          {doubleLogos.map((logo, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg border border-border-custom bg-surface/50 text-foreground font-semibold text-sm tracking-wide shadow-sm hover:border-accent-custom hover:bg-surface transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span className="w-2 h-2 rounded-full bg-accent-custom" />
              <span>{logo.name}</span>
              <span className="text-[9px] uppercase tracking-wider text-secondary-custom font-normal">
                {logo.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
