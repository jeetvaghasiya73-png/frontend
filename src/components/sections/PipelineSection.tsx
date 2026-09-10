"use client";

import React, { useRef, useEffect } from "react";
import { Building2, Cpu, Zap, Database, BarChart3, TrendingUp, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function PipelineSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const nodes = [
    { name: "Business", desc: "Operational data, pipelines & bottlenecks", icon: Building2, color: "#2563EB" },
    { name: "AI Core", desc: "Semantic parsing, vectors & LLM reasoning", icon: Cpu, color: "#9333EA" },
    { name: "Automation", desc: "n8n systems, event triggers & scripts", icon: Zap, color: "#EAB308" },
    { name: "Database", desc: "Postgres warehousing & vector indexing", icon: Database, color: "#06B6D4" },
    { name: "Dashboard", desc: "Recharts reports & real-time controls", icon: BarChart3, color: "#EC4899" },
    { name: "Growth", desc: "Cost savings, scale & revenue loops", icon: TrendingUp, color: "#10B981" }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in nodes one by one
      gsap.fromTo(
        ".pipeline-node",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-24 text-left">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
              Data Flow
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <SplitText text="The Autonomous Intelligence Pipeline." type="words" />
          </h2>
          <p className="text-lg text-secondary-custom leading-relaxed max-w-xl">
            See how raw business inputs are seamlessly converted into autonomous operations, structured data lakes, and scaled revenue systems.
          </p>
        </div>

        {/* Pipeline Layout */}
        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 w-full py-10">
          
          {/* Background Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[68px] left-[5%] right-[5%] h-[2px] bg-border-custom z-0 overflow-hidden">
            {/* Animated Laser Pulse traveling left to right */}
            <div className="h-full w-40 bg-gradient-to-r from-transparent via-accent-custom to-transparent absolute top-0 left-0 animate-[marquee_4s_linear_infinite]" />
          </div>

          {nodes.map((node, idx) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={idx}>
                {/* Node */}
                <div className="pipeline-node flex-1 w-full max-w-[280px] lg:max-w-none flex flex-col items-center text-center z-10">
                  <div
                    className="w-16 h-16 rounded-2xl bg-surface border border-border-custom flex items-center justify-center relative shadow-lg group hover:border-accent-custom hover:shadow-[0_0_20px_var(--accent-glow)] transition-all duration-300 cursor-pointer"
                    style={{ borderColor: `${node.color}30` }}
                  >
                    {/* Glowing point on hover */}
                    <div
                      className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[8px]"
                      style={{ background: `radial-gradient(circle, ${node.color}40 0%, transparent 70%)` }}
                    />
                    
                    <Icon className="w-6 h-6 relative z-10 transition-transform group-hover:scale-110 duration-300" style={{ color: node.color }} />

                    {/* Badge Number */}
                    <span className="absolute -top-2 -right-2 text-[9px] font-bold font-mono bg-border-custom text-secondary-custom w-5 h-5 rounded-full flex items-center justify-center border border-background">
                      {idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight mt-6 text-foreground">
                    {node.name}
                  </h3>
                  <p className="text-secondary-custom text-xs leading-relaxed mt-2 max-w-[180px] lg:px-2">
                    {node.desc}
                  </p>
                </div>

                {/* Connecting Arrow (Mobile Only / Stacks) */}
                {idx < nodes.length - 1 && (
                  <div className="lg:hidden flex items-center justify-center py-2">
                    <ChevronRight className="w-5 h-5 text-secondary-custom rotate-90 transform" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

        </div>
      </div>
    </section>
  );
}
