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
      title: "Discovery & Audit",
      desc: "We analyze your current local Google Maps visibility, website user experience, or manual workflow bottlenecks to identify the highest-impact opportunities."
    },
    {
      num: "02",
      title: "Custom Blueprint & Proposal",
      desc: "We present a structured architecture plan with exact deliverables, transparent pricing, and predictable delivery dates with zero hidden surprises."
    },
    {
      num: "03",
      title: "Focused Build & Preview",
      desc: "We engineer your custom system with dedicated founder focus. You review working prototypes and blueprints at every milestone before public launch."
    },
    {
      num: "04",
      title: "Launch & Direct Support",
      desc: "We deploy your system live, configure your team notifications, and provide ongoing direct WhatsApp and email assistance to ensure continuous results."
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
              <SplitText text="A Transparent 4-Step Journey." type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed max-w-sm">
              From our first audit call to final handover, you know exactly what is being built, when it will launch, and how it will drive results.
            </p>
          </div>

          <div className="hidden lg:block mt-8">
            <span className="text-7xl font-bold font-mono tracking-tighter text-foreground/10 leading-none block">
              {steps[activeStep].num}
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground font-mono mt-1">
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
