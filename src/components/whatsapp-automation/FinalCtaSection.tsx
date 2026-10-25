"use client";

import React from "react";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, PhoneCall } from "lucide-react";

export default function FinalCtaSection() {
  const scrollToEarlyAccess = () => {
    const el = document.getElementById("early-access");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-24 border-t border-border-custom bg-background relative overflow-hidden">
      {/* Background radial glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch Priority</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Ready to Centralize Your WhatsApp Outreach and Sales Calling?
        </h2>

        <p className="text-secondary-custom text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          Be among the first teams to deploy LeadFlow. Stop scrolling through unorganized chats and start having high-intent sales conversations.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={scrollToEarlyAccess}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 cursor-pointer"
          >
            <span>Get Early Access Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-secondary-custom">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Priority Onboarding</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Account Safety First</span>
          </div>
          <div className="flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-500" />
            <span>Direct Call Desk Integration</span>
          </div>
        </div>
      </div>
    </section>
  );
}
