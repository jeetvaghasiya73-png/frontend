"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { Plus, Minus } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

interface FAQItem {
  q: string;
  a: string;
  category?: string;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);

  const fallbackFaqs: FAQItem[] = [
    {
      category: "Local SEO & Google Maps",
      q: "How does your Google Maps Top 3 ranking & Local SEO system work?",
      a: "We audit and optimize your Google Business Profile, geo-target high-intent local search queries, build local citations, and deploy an automated review engine. This diverts searchers away from competitors directly to your phone number and official website within 30 to 60 days."
    },
    {
      category: "Web Development",
      q: "What technologies do you use for full-stack web development?",
      a: "We develop ultra-fast, mobile-first web applications using Next.js 15, React 19, TypeScript, Tailwind CSS, and Python FastAPI backends. Our sites achieve 98+ Google Lighthouse performance scores and feature conversion-engineered layouts."
    },
    {
      category: "Web Scraping & APIs",
      q: "Can your web scrapers bypass Cloudflare, rate limits, and captchas?",
      a: "Yes. We build distributed Playwright clusters with automated residential proxy rotation, fingerprint masking, and captcha handling. We can extract thousands of structured business records (names, phones, reviews, websites) from Google Maps, directories, and commerce platforms daily."
    },
    {
      category: "Workflow & WhatsApp Automations",
      q: "How does the 24/7 WhatsApp AI Bot and CRM automation work?",
      a: "Our WhatsApp bot connects via Evolution API (Baileys) and deep reasoning AI models. When a prospect messages or clicks a proposal button, the bot responds in seconds, answers questions, qualifies business requirements, updates your CRM, and alerts you via instant email/SMS."
    },
    {
      category: "Delivery & Engagement",
      q: "What is your standard delivery timeline for custom systems?",
      a: "Local SEO pipelines and automated WhatsApp bots are launched in 1 to 2 weeks. Custom Next.js web applications, scraping engines, and full CRM integrations typically deploy in 3 to 5 weeks with complete staging, documentation, and continuous support."
    }
  ];

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        let res = await fetch(`${API_URL}/api/v1/public/faqs`);
        if (!res.ok) {
          res = await fetch(`${API_URL}/api/v1/faqs/`);
        }
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFaqs(data.map((f: any) => ({
              q: f.question,
              a: f.answer,
              category: f.category || "General"
            })));
            return;
          }
        }
      } catch {
        // API offline or unreachable; smoothly fallback to default showcase FAQs
      }
      setFaqs(fallbackFaqs);
    };
    fetchFaqs();
  }, []);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  const getCategoryClass = (cat?: string) => {
    if (!cat) return "border-border-custom text-secondary-custom bg-background";
    const c = cat.toLowerCase();
    if (c.includes("seo") || c.includes("google") || c.includes("rank")) {
      return "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5";
    }
    if (c.includes("web") || c.includes("next") || c.includes("dev")) {
      return "border-sky-500/30 text-sky-600 dark:text-sky-400 bg-sky-500/5";
    }
    if (c.includes("scrap") || c.includes("data") || c.includes("api")) {
      return "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5";
    }
    if (c.includes("auto") || c.includes("bot") || c.includes("whatsapp")) {
      return "border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/5";
    }
    return "border-border-custom text-secondary-custom bg-background";
  };

  return (
    <section
      id="faq"
      className="py-24 bg-background relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto px-6 md:px-12 w-full">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-sm mb-4">
            <span className="w-1.5 h-1.5 rounded-xs bg-indigo-500" />
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
              Technical Documentation & FAQs
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3 text-foreground">
            <SplitText text="Clear Answers to Technical Questions." type="words" />
          </h2>
          <p className="text-sm md:text-base text-secondary-custom leading-relaxed">
            Everything you need to know about our Local SEO, modern web development, high-volume scrapers, and WhatsApp automations.
          </p>
        </div>

        {/* FAQ Accordion List - Strict Clean Rectangular Accordion */}
        <div className="space-y-2.5 text-left">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border rounded-md transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "border-foreground/30 bg-surface"
                    : "border-border-custom bg-surface hover:border-border-custom/90"
                }`}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1.5 flex-1">
                    {faq.category && (
                      <span className={`inline-block text-[10px] font-mono font-medium px-2 py-0.5 rounded-xs border ${getCategoryClass(faq.category)}`}>
                        {faq.category}
                      </span>
                    )}
                    <h3 className="text-sm sm:text-base font-bold text-foreground">
                      {faq.q}
                    </h3>
                  </div>

                  <div className="w-7 h-7 rounded-sm border border-border-custom bg-background flex items-center justify-center text-foreground shrink-0">
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 border-t border-border-custom text-xs sm:text-sm text-secondary-custom leading-relaxed animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
