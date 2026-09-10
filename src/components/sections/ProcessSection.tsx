"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function ProcessSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { num: "01", title: "Discovery", desc: "We host alignment calls to analyze your current operational bottlenecks, manual processes, and technical layout." },
    { num: "02", title: "Research", desc: "Our engineers audit database formats, scraping targets, security requirements, and third-party API configurations." },
    { num: "03", title: "Planning", desc: "We design a comprehensive roadmap, system architecture charts, data schemas, and key milestone schedules." },
    { num: "04", title: "Design", desc: "We craft custom visual boards, high-end typography, Figma designs, and motion mockups prioritizing aesthetics." },
    { num: "05", title: "Development", desc: "We construct the FastAPI backend repositories and write type-safe React/Next.js 15 components with premium animations." },
    { num: "06", title: "Testing", desc: "We execute end-to-end load tests, captcha bypass checks, and rigorous security evaluations across all databases." },
    { num: "07", title: "Deployment", desc: "We build Docker images, configure Cloudflare routing, secure database clusters, and launch client products." },
    { num: "08", title: "Optimization", desc: "We continuously fine-tune page speed, audit API latency, adjust LLM prompt tokens, and audit database scaling." }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll(".process-step-card");
    const progressLine = containerRef.current.querySelector(".process-progress-line");
    
    // Animate connecting timeline line based on scroll progress
    const lineTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 60%",
      end: "bottom 40%",
      scrub: true,
      onUpdate: (self) => {
        if (progressLine) {
          // Sync height of progress indicator SVG/Div to scroll progress
          (progressLine as HTMLElement).style.height = `${self.progress * 100}%`;
        }
      }
    });

    // Detect active step cards
    const triggers = Array.from(cards).map((card: any, idx) => {
      return ScrollTrigger.create({
        trigger: card,
        start: "top 50%",
        end: "bottom 50%",
        onToggle: (self) => {
          if (self.isActive) {
            setActiveStep(idx);
          }
        }
      });
    });

    return () => {
      lineTrigger.kill();
      triggers.forEach(t => t.kill());
    };
  }, []);

  return (
    <section
      id="process"
      ref={containerRef}
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
        
        {/* Left Side: Sticky Title and Active Index Indicator */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:h-[70vh] flex flex-col justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
                Methodology
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              <SplitText text="Our Handcrafted Process." type="words" />
            </h2>
            <p className="text-sm md:text-base text-secondary-custom leading-relaxed max-w-sm">
              We guide each project through a rigorous, transparent deployment funnel designed to guarantee success.
            </p>
          </div>

          {/* Large active step indicator */}
          <div className="hidden lg:block mt-12">
            <span className="text-[100px] font-bold font-mono tracking-tighter text-accent-custom/10 leading-none">
              {steps[activeStep].num}
            </span>
            <h3 className="text-xl font-bold uppercase tracking-widest text-foreground mt-2">
              {steps[activeStep].title}
            </h3>
          </div>
        </div>

        {/* Right Side: Scrollable Timeline Steps */}
        <div className="lg:col-span-8 relative pl-8 md:pl-16">
          
          {/* Vertical progress line background */}
          <div className="absolute left-[3px] md:left-[7px] top-4 bottom-4 w-[2px] bg-border-custom z-0" />
          
          {/* Active progress indicator line */}
          <div
            className="process-progress-line absolute left-[3px] md:left-[7px] top-4 w-[2px] bg-accent-custom z-10 transition-all duration-100 origin-top"
            style={{ height: "0%" }}
          />

          {/* Steps List */}
          <div className="flex flex-col gap-16">
            {steps.map((step, idx) => {
              const isActive = idx === activeStep;
              return (
                <div
                  key={idx}
                  className="process-step-card flex flex-col items-start relative z-20 group"
                >
                  {/* Bullet Node */}
                  <div
                    className={`absolute -left-[37px] md:-left-[61px] top-1.5 w-[10px] h-[10px] md:w-[14px] md:h-[14px] rounded-full border bg-background transition-all duration-500 z-30 ${
                      isActive
                        ? "border-accent-custom scale-125 shadow-[0_0_10px_var(--accent-glow)] bg-accent-custom"
                        : "border-border-custom bg-surface"
                    }`}
                  />

                  {/* Step Card Content */}
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`text-sm font-bold font-mono transition-colors duration-300 ${
                      isActive ? "text-accent-custom" : "text-secondary-custom"
                    }`}>
                      {step.num}
                    </span>
                    <h3 className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300 ${
                      isActive ? "text-foreground" : "text-secondary-custom"
                    }`}>
                      {step.title}
                    </h3>
                  </div>

                  <p className={`text-sm md:text-base leading-relaxed max-w-xl transition-opacity duration-300 ${
                    isActive ? "text-secondary-custom" : "text-secondary-custom/60"
                  }`}>
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
}
