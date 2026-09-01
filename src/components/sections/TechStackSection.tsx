"use client";

import React from "react";
import { Cpu, Terminal, Layers, Database, Workflow, ShieldCheck } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

export default function TechStackSection() {
  const techs = [
    { name: "Python", category: "Backend", icon: Terminal },
    { name: "FastAPI", category: "API", icon: Cpu },
    { name: "Next.js", category: "Web", icon: Layers },
    { name: "PostgreSQL", category: "Database", icon: Database },
    { name: "Docker", category: "DevOps", icon: ShieldCheck },
    { name: "OpenAI", category: "Intelligence", icon: Cpu },
    { name: "Anthropic", category: "Intelligence", icon: Cpu },
    { name: "Gemini", category: "Intelligence", icon: Cpu },
    { name: "n8n", category: "Workflow", icon: Workflow },
    { name: "Playwright", category: "Scraping", icon: Database },
    { name: "Redis", category: "Cache", icon: Database },
    { name: "Supabase", category: "Backend", icon: Layers }
  ];

  // Split into two rows
  const row1 = techs.slice(0, 6);
  const row2 = techs.slice(6, 12);

  // Duplicate for seamless infinite scroll
  const marquee1 = [...row1, ...row1, ...row1];
  const marquee2 = [...row2, ...row2, ...row2];

  const TechCard = ({ tech }: { tech: any }) => {
    const Icon = tech.icon;
    return (
      <div className="px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border border-border-custom bg-surface/40 backdrop-blur-md flex items-center gap-3 sm:gap-3.5 shadow-sm hover:border-accent-custom hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 group min-w-[180px] sm:min-w-[200px] cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-accent-custom group-hover:scale-110 transition-transform shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div className="text-left overflow-hidden">
          <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-accent-custom transition-colors truncate">
            {tech.name}
          </h3>
          <span className="text-[9px] uppercase tracking-wider text-secondary-custom font-mono truncate block mt-0.5">
            {tech.category}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Background glow radial */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] mesh-gradient-1 opacity-20 pointer-events-none" />

      <div className="w-full text-center relative z-10">
        
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-16 sm:mb-20 px-6 md:px-12 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2.5 border border-border-custom bg-surface/40 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 shadow-[0_0_15px_rgba(41,98,255,0.15)] hover:bg-surface/60 transition-colors duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-custom animate-pulse shadow-[0_0_8px_var(--accent-glow)]" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-accent-custom drop-shadow-sm">
              Our Tech Stack
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <SplitText text="Our Technology" type="words" />
            <span className="block mt-2 bg-gradient-to-r from-accent-custom via-purple-500 to-indigo-500 bg-clip-text text-transparent drop-shadow-sm">
              <SplitText text="Ecosystem." type="words" />
            </span>
          </h2>
          <p className="text-base md:text-lg text-secondary-custom leading-relaxed max-w-lg mt-4 font-medium">
            We leverage a hand-picked suite of modern frameworks and AI endpoints to construct secure, high-speed architectures.
          </p>
        </div>

        {/* Marquee Animations embedded */}
        <style>{`
          @keyframes marquee-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-33.3333%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-33.3333%); }
            100% { transform: translateX(0%); }
          }
          .animate-marquee-left {
            animation: marquee-left 25s linear infinite;
          }
          .animate-marquee-right {
            animation: marquee-right 25s linear infinite;
          }
          .marquee-container:hover .animate-marquee-left,
          .marquee-container:hover .animate-marquee-right {
            animation-play-state: paused;
          }
          .mask-edges {
            mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
            -webkit-mask-image: linear-gradient(to right, transparent, black 15%, black 85%, transparent);
          }
        `}</style>

        {/* Double Marquee Container */}
        <div className="flex flex-col gap-4 sm:gap-6 w-full overflow-hidden marquee-container py-4 mask-edges">
          
          {/* Row 1 (Left to Right) */}
          <div className="flex w-max gap-4 sm:gap-6 animate-marquee-left pl-4 sm:pl-6">
            {marquee1.map((tech, idx) => (
              <TechCard tech={tech} key={`row1-${idx}`} />
            ))}
          </div>

          {/* Row 2 (Right to Left) */}
          <div className="flex w-max gap-4 sm:gap-6 animate-marquee-right pl-4 sm:pl-6">
            {marquee2.map((tech, idx) => (
              <TechCard tech={tech} key={`row2-${idx}`} />
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
