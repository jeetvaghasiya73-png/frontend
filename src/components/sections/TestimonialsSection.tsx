"use client";

import React, { useRef } from "react";
import { ShieldCheck, UserCheck, Clock, MessageSquare, ArrowUpRight } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

export default function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const guarantees = [
    {
      num: "01",
      title: "100% Direct Founder Focus",
      icon: UserCheck,
      desc: "As a dedicated new agency, you work directly with the lead engineer on every detail. Your project gets our undivided personal attention—never handed off to junior account managers.",
      badge: "Personal Execution"
    },
    {
      num: "02",
      title: "Milestone-Based Approvals",
      icon: ShieldCheck,
      desc: "We build transparently. You review and approve interactive previews and working blueprints at every milestone before anything is deployed live to the public.",
      badge: "Zero Surprises"
    },
    {
      num: "03",
      title: "Fast 14-Day Delivery Sprints",
      icon: Clock,
      desc: "Local SEO setups, lead scraping pipelines, and WhatsApp bots launch within 7 to 14 days. Custom web platforms deploy in 3 to 4 weeks with full documentation.",
      badge: "Rapid Turnaround"
    },
    {
      num: "04",
      title: "Direct Post-Launch Support",
      icon: MessageSquare,
      desc: "We stand behind everything we build. You have direct WhatsApp and email access for ongoing questions, tweaks, and continuous guidance as your business grows.",
      badge: "Dedicated Access"
    }
  ];

  const handleNavigateToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/contact";
  };

  return (
    <section
      id="commitment"
      ref={containerRef}
      className="py-24 bg-background relative overflow-hidden text-left border-t border-border-custom"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-8 border-b border-border-custom pb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                [04] &bull; Our Founding Client Commitment
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3 text-foreground">
              <SplitText text="Why Partner With Us As Your Founding Agency?" type="words" />
            </h2>
            <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">
              We are actively building our founding client portfolio. You receive elite, focused execution, transparent pricing, and direct communication every step of the way.
            </p>
          </div>

          <a
            href="/contact"
            onClick={handleNavigateToContact}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono font-bold text-foreground hover:underline self-start md:self-end shrink-0"
          >
            <span>Become a Founding Client</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* 4 Guarantees Grid - Strict Geometric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="border border-border-custom bg-surface p-6 rounded-md flex flex-col justify-between hover:border-foreground/40 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-sm bg-background border border-border-custom flex items-center justify-center text-foreground">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-secondary-custom px-2 py-0.5 rounded-xs border border-border-custom bg-background">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs text-secondary-custom leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="border-t border-border-custom pt-4 mt-6 text-[10px] font-mono text-secondary-custom">
                  Principle {item.num} / 04
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
