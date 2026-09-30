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
      category: "IT Solutions & Outsourcing",
      q: "What IT services does Tech Infinix provide?",
      a: "Tech Infinix is a full-service IT solutions provider based in Ahmedabad. We offer web application development, SEO and digital marketing, web scraping and data extraction, and WhatsApp automation software. Whether you need to outsource IT services for a one-time project or want a long-term IT consultancy partner, we handle the full scope from planning to delivery and support."
    },
    {
      category: "Web Application Development",
      q: "What does your web application development process look like?",
      a: "We build custom web applications and business websites from scratch — no templates. Our web design and development process starts with understanding your goals, then we plan, build, and review with you at every milestone. We work with PHP, React, Next.js, and Python backends depending on what your project needs. Most projects launch within 3 to 4 weeks."
    },
    {
      category: "SEO & Digital Marketing",
      q: "How do your local SEO services help businesses rank on Google?",
      a: "Our SEO and digital marketing approach combines technical site fixes, local SEO optimization, Google Business Profile setup, targeted keyword strategy, and backlink building. As a local SEO company, we focus on what actually drives rankings and traffic — not vanity metrics. Most clients start seeing meaningful ranking improvements within 30 to 60 days of campaign launch."
    },
    {
      category: "Web Scraping & Data Extraction",
      q: "Do you provide web scraping services in India for business data?",
      a: "Yes. Our web scraping service is built for businesses that need verified contact data at scale. We scrape public websites, business directories, and listing platforms to extract names, phone numbers, emails, and addresses. Our website scraping service handles everything from data collection and verification to deduplication and clean CSV or CRM-ready export. We serve clients across India and globally."
    },
    {
      category: "WhatsApp & Workflow Automation",
      q: "How does your WhatsApp automation software work for businesses?",
      a: "Our WhatsApp automation software connects to your WhatsApp Business number and handles inbound inquiries automatically — 24/7. When a customer messages you, they receive an instant reply, get asked qualification questions, and your team gets alerted in real time. We also build full workflow automation services and custom automation consulting to connect your existing tools, CRMs, and pipelines."
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
            <SplitText text="Common Questions About Our IT Services." type="words" />
          </h2>
          <p className="text-sm md:text-base text-secondary-custom leading-relaxed">
            Everything you need to know about outsourcing IT services, web application development, local SEO, web scraping in India, and WhatsApp automation — answered honestly.
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
                  <h3 className="text-sm sm:text-base font-bold text-foreground flex-1">
                    {faq.q}
                  </h3>

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
