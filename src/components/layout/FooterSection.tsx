"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Phone, MessageCircle, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { API_V1_URL } from "@/lib/config";

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(`${API_V1_URL}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          source: "footer_changelog"
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubscribed(true);
        setFeedbackMessage(data.message || "Subscription recorded! You are in the loop.");
        setEmail("");
      } else {
        setErrorMessage(data.detail || data.message || "Subscription could not be processed. Please try again.");
      }
    } catch (err: any) {
      setErrorMessage("Network error connecting to subscription server. Please reach out to contact@techinfinix.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-surface/30 border-t border-border-custom relative overflow-hidden pt-16 sm:pt-20 pb-12 text-left font-sans">
      {/* Subtle Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full relative z-10">
        
        {/* Top: Branding + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-12 border-b border-border-custom">
          
          {/* Logo & Description */}
          <div className="lg:col-span-6 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-background font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
                TI
              </div>
              <span className="text-base font-bold tracking-tight text-foreground group-hover:opacity-85 transition-opacity">
                Tech Infinix
              </span>
            </Link>
            <p className="text-secondary-custom text-sm leading-relaxed max-w-sm">
              We engineer enterprise-grade Local SEO dominance, full-stack Next.js web applications, automated web scrapers, and 24/7 WhatsApp workflow pipelines.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-foreground font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Direct Support: <a href="tel:+917990738939" className="font-semibold hover:text-emerald-500 transition-colors">+91 79907 38939</a></span>
            </div>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-6 flex flex-col items-start lg:items-end text-left lg:text-right w-full">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3">
              Engineering Reports & Changelog
            </h4>
            
            {subscribed ? (
              <div className="flex flex-col items-start lg:items-end gap-1.5 py-1">
                <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feedbackMessage || "Subscription recorded. You are in the loop."}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSubscribed(false)}
                  className="text-xs text-secondary-custom hover:text-foreground underline transition-colors cursor-pointer"
                >
                  Subscribe another email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col w-full max-w-md gap-2">
                <div className="flex w-full gap-2">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    disabled={loading}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    className="flex-1 bg-surface border border-border-custom rounded-md px-3.5 py-2 text-sm text-foreground focus:outline-none focus:border-indigo-500 transition disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-foreground text-background hover:opacity-90 px-4 rounded-md flex items-center justify-center cursor-pointer transition group text-sm font-semibold disabled:opacity-50"
                    aria-label="Subscribe"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </button>
                </div>
                {errorMessage && (
                  <div className="flex items-center gap-1.5 text-xs text-rose-500 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </form>
            )}
            <span className="text-xs text-secondary-custom mt-2">
              Monthly digests on Google Maps algorithms, crawling bypasses, and workflow bots.
            </span>
          </div>

        </div>

        {/* Middle: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12">
          
          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3.5">
              Core Pillars
            </h5>
            <div className="flex flex-col gap-2.5 text-sm text-secondary-custom">
              <Link href="/#services" className="hover:text-foreground transition-colors">Local SEO 3-Pack</Link>
              <Link href="/#services" className="hover:text-foreground transition-colors">Next.js Web Dev</Link>
              <Link href="/#services" className="hover:text-foreground transition-colors">Data Lead Scraping</Link>
              <Link href="/#services" className="hover:text-foreground transition-colors">WhatsApp AI Agents</Link>
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3.5">
              Capabilities
            </h5>
            <div className="flex flex-col gap-2.5 text-sm text-secondary-custom">
              <Link href="/#services" className="hover:text-foreground transition-colors">Geo-Grid Rank Trackers</Link>
              <Link href="/#services" className="hover:text-foreground transition-colors">Playwright Crawlers</Link>
              <Link href="/#services" className="hover:text-foreground transition-colors">n8n Automation Nodes</Link>
              <Link href="/#services" className="hover:text-foreground transition-colors">Evolution API Baileys</Link>
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3.5">
              Agency
            </h5>
            <div className="flex flex-col gap-2.5 text-sm text-secondary-custom">
              <Link href="/#work" className="hover:text-foreground transition-colors">Case Studies</Link>
              <Link href="/#process" className="hover:text-foreground transition-colors">Our Process</Link>
              <Link href="/#faq" className="hover:text-foreground transition-colors">FAQ Knowledge</Link>
              <Link href="/contact" className="hover:text-indigo-400 font-semibold transition-colors">
                Request a Quote &rarr;
              </Link>
            </div>
          </div>

          <div>
            <h5 className="text-xs uppercase tracking-wider font-semibold text-foreground mb-3.5">
              Connect
            </h5>
            <div className="flex flex-col gap-2.5 text-sm text-secondary-custom">
              <a
                href="tel:+917990738939"
                className="hover:text-foreground transition-colors flex items-center gap-2 text-foreground font-medium"
              >
                <Phone className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>+91 79907 38939</span>
              </a>
              <a
                href="https://wa.me/917990738939"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 text-emerald-500 font-medium transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>WhatsApp: +91 79907 38939</span>
              </a>
              <a
                href="mailto:contact@techinfinix.com"
                className="hover:text-foreground transition-colors flex items-center gap-2 font-medium"
              >
                <Mail className="w-3.5 h-3.5 text-secondary-custom shrink-0" />
                <span>contact@techinfinix.com</span>
              </a>
              <Link
                href="/contact"
                className="hover:text-indigo-400 font-semibold transition-colors pt-1 text-foreground"
              >
                Get Architecture Audit &rarr;
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border-custom pt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-secondary-custom">
          <div>
            &copy; {new Date().getFullYear()} Tech Infinix. Engineered for performance and scale.
          </div>

          <div className="flex items-center gap-4">
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Request Quote
            </Link>
            <span>&bull;</span>
            <Link href="/#faq" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
