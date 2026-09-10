"use client";

import React, { useRef } from "react";
import { Check, ArrowRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

export default function PricingSection() {
  const plans = [
    {
      name: "Essential",
      price: "$2,500",
      period: "/ month",
      desc: "Perfect for lightweight AI automation projects and programmatic data extraction scripts.",
      features: [
        "1 Custom AI Automation workflow",
        "Data extraction & scraping (up to 10k pages)",
        "Slack/Email webhook notifications",
        "FastAPI REST endpoints creation",
        "Business Hours slack support",
        "Weekly status calls"
      ],
      featured: false,
      cta: "Start Automation"
    },
    {
      name: "Growth",
      price: "$6,000",
      period: "/ month",
      desc: "Best for growing businesses wanting complete custom SaaS, multi-agent AI logic, and databases.",
      features: [
        "Up to 3 Custom AI Agent networks",
        "Full-stack Next.js + FastAPI web app",
        "PostgreSQL + Vector Database setup",
        "Programmatic SEO programmatic content",
        "Continuous performance audits",
        "Dedicated engineer contact",
        "24/7 Priority Emergency support"
      ],
      featured: true,
      cta: "Scale Operations"
    },
    {
      name: "Dedicated AI Team",
      price: "$12,500",
      period: "/ month",
      desc: "Bespoke dedicated AI engineering team to operate, scale, and manage custom infrastructure.",
      features: [
        "Unlimited custom agent pipelines",
        "Dedicated Senior Developer & Designer",
        "Local model deployment (Ollama/vLLM)",
        "Custom CRM integrations & bridges",
        "SOC2 security audit compliance",
        "Direct Shared Slack Connect room",
        "Daily standup syncs"
      ],
      featured: false,
      cta: "Deploy AI Team"
    }
  ];

  return (
    <section
      id="pricing"
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-24 text-left">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
              Investment
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <SplitText text="Transparent Pricing. Scaled Value." type="words" />
          </h2>
          <p className="text-lg text-secondary-custom leading-relaxed max-w-xl">
            Pick a tier that aligns with your operational ambitions. No hidden fees, clear deliverables, enterprise-grade engineering.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`border rounded-2xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden transition-all duration-500 group cursor-pointer ${
                plan.featured
                  ? "border-accent-custom bg-surface/50 shadow-[0_0_40px_var(--accent-glow)] scale-102 lg:-translate-y-2"
                  : "border-border-custom bg-surface/20 hover:border-accent-custom/50 hover:bg-surface/30"
              }`}
            >
              {/* Highlight badge for popular */}
              {plan.featured && (
                <div className="absolute top-5 right-5 bg-accent-custom text-white font-mono text-[9px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              {/* Glowing gradient background on hover */}
              <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-accent-custom/5 blur-[90px] group-hover:bg-accent-custom/10 transition-all pointer-events-none" />

              <div>
                {/* Plan Title & Price */}
                <span className="text-xs font-bold font-mono text-accent-custom uppercase tracking-widest block mb-4">
                  {plan.name}
                </span>
                
                <div className="flex items-baseline gap-1 text-foreground mb-4">
                  <span className="text-4xl md:text-5xl font-bold font-mono tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-xs text-secondary-custom font-mono">
                    {plan.period}
                  </span>
                </div>

                <p className="text-secondary-custom text-xs md:text-sm leading-relaxed mb-8">
                  {plan.desc}
                </p>

                {/* Features list */}
                <div className="border-t border-border-custom/50 pt-8 mt-4 flex flex-col gap-4">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-accent-custom/10 flex items-center justify-center text-accent-custom shrink-0 mt-0.5">
                        <Check className="w-3 h-3" />
                      </div>
                      <span className="text-xs md:text-sm text-foreground/80 leading-tight">
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Button */}
              <a
                href="/contact"
                className={`w-full mt-10 inline-flex items-center justify-center gap-2 text-xs uppercase tracking-wider font-bold py-4 rounded-md transition-all duration-300 group ${
                  plan.featured
                    ? "bg-accent-custom text-white hover:bg-blue-600 shadow-md shadow-blue-500/25"
                    : "border border-border-custom bg-surface hover:bg-foreground hover:text-background text-foreground"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
