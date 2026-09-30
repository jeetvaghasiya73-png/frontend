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
    {
      num: "01",
      title: "Discovery & Requirement Audit",
      desc: "We start by understanding your business, your goals, and where the gaps are — whether that's SEO visibility, a weak web presence, missing data, or manual processes that should be automated."
    },
    {
      num: "02",
      title: "Custom Proposal & Clear Scope",
      desc: "You'll receive a detailed proposal with exact deliverables, a realistic timeline, and transparent pricing. No vague promises, no hidden costs — just a clear plan you can actually hold us to."
    },
    {
      num: "03",
      title: "Build, Review & Refine",
      desc: "We build your solution — whether it's a web application, SEO campaign, scraping pipeline, or automation workflow — and walk you through working previews at every major milestone before anything goes live."
    },
    {
      num: "04",
      title: "Launch & Ongoing Support",
      desc: "Once live, we don't disappear. You have direct access to our team for questions, updates, and continuous improvements as your business grows — via WhatsApp, email, or a call."
    }
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.querySelectorAll(".process-step-card");
    const progressLine = containerRef.current.querySelector(".process-progress-line");
    
    const lineTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top 60%",
      end: "bottom 40%",
      scrub: true,
      onUpdate: (self) => {
        if (progressLine) {
          (progressLine as HTMLElement).style.height = `${self.progress * 100}%`;
        }
      }
    });

    const triggers = Array.from(cards).map((card: any, idx) => {
      return ScrollTrigger.create({
        trigger: card,
        start: "top 55%",
        end: "bottom 55%",
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
      className="py-24 bg-background relative overflow-hidden text-left border-t border-border-custom"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative">
        
        {/* Left: Sticky Section Info */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 lg:h-[55vh] flex flex-col justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Client Delivery Methodology
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-3 text-foreground">
              <SplitText text="How We Work: A Simple 4-Step Process." type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed max-w-sm">
              From your first call to launch day, we keep things simple, transparent, and focused on results — so you always know what's happening and why.
            </p>
          </div>

          <div className="hidden lg:block mt-8">
            <span className="text-7xl font-bold font-mono tracking-tighter text-foreground/10 leading-none block">
              {steps[activeStep].num}
            </span>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mt-1">
              {steps[activeStep].title}
            </h3>
          </div>
        </div>

        {/* Right: Step Cards with Connecting Timeline */}
        <div className="lg:col-span-8 relative pl-6 sm:pl-8">
          
          {/* Vertical Track Line */}
          <div className="absolute top-4 bottom-4 left-0 w-[1px] bg-border-custom">
            <div className="process-progress-line absolute top-0 left-0 w-full bg-foreground h-0 transition-all" />
          </div>

          <div className="space-y-6 sm:space-y-8">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  className={`process-step-card border p-6 sm:p-8 rounded-md transition-all duration-300 relative ${
                    isActive
                      ? "border-foreground bg-surface shadow-xs"
                      : "border-border-custom bg-surface/50 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <span className="text-xs font-mono font-bold text-secondary-custom uppercase">
                      Step {step.num}
                    </span>
                    <span className="w-2 h-2 rounded-full border border-border-custom bg-background" />
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
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
