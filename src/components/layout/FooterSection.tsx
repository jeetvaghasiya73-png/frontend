"use client";

import React, { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FooterSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-surface/20 border-t border-border-custom relative overflow-hidden pt-24 pb-12">
      {/* Background Grid Pattern inside footer */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10">
        
        {/* Top: Branding + Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-border-custom/50">
          
          {/* Logo & Description */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            <a href="#" className="flex items-center gap-2 group mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-accent-custom to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-[0_0_15px_rgba(79,124,255,0.25)]">
                N
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-foreground group-hover:text-accent-custom transition-colors duration-300">
                Nexora AI
              </span>
            </a>
            <p className="text-secondary-custom text-xs md:text-sm leading-relaxed max-w-sm">
              We design and engineer premium enterprise AI systems, autonomous agents, and software architectures.
            </p>
          </div>

          {/* Newsletter Form */}
          <div className="lg:col-span-7 flex flex-col items-start md:items-end text-left md:text-right w-full">
            <h4 className="text-xs uppercase tracking-widest font-bold text-foreground mb-4">
              Subscribe to Intelligence Reports
            </h4>
            
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-500 text-xs font-semibold py-3">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Subscription successful. Welcome to the report loop.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex w-full max-w-md gap-2">
                <input
                  type="email"
                  placeholder="enter your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-surface/50 border border-border-custom rounded-md px-4 py-3 text-xs md:text-sm text-foreground focus:outline-none focus:border-accent-custom transition-all"
                />
                <button
                  type="submit"
                  className="bg-foreground text-background hover:bg-accent-custom hover:text-white px-5 rounded-md flex items-center justify-center cursor-pointer transition-all duration-300 group"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            )}
            <span className="text-[10px] text-secondary-custom mt-2">
              Monthly digests on agents, crawling bypasses, and SaaS scales. No spam.
            </span>
          </div>

        </div>

        {/* Middle: Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 text-left">
          
          <div>
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-foreground mb-4">
              Solutions
            </h5>
            <div className="flex flex-col gap-3 text-xs md:text-sm text-secondary-custom">
              <a href="#services" className="hover:text-foreground transition-colors">AI Automation</a>
              <a href="#services" className="hover:text-foreground transition-colors">Autonomous Agents</a>
              <a href="#services" className="hover:text-foreground transition-colors">SaaS Architectures</a>
              <a href="#services" className="hover:text-foreground transition-colors">Programmatic SEO</a>
            </div>
          </div>

          <div>
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-foreground mb-4">
              Capabilities
            </h5>
            <div className="flex flex-col gap-3 text-xs md:text-sm text-secondary-custom">
              <a href="#services" className="hover:text-foreground transition-colors">Web Crawling</a>
              <a href="#services" className="hover:text-foreground transition-colors">API Integrations</a>
              <a href="#services" className="hover:text-foreground transition-colors">CRM sync nodes</a>
              <a href="#services" className="hover:text-foreground transition-colors">Custom Dashboards</a>
            </div>
          </div>

          <div>
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-foreground mb-4">
              Agency
            </h5>
            <div className="flex flex-col gap-3 text-xs md:text-sm text-secondary-custom">
              <a href="/portfolio" className="hover:text-foreground transition-colors">Selected Work</a>
              <a href="/#process" className="hover:text-foreground transition-colors">Our Process</a>
              <a href="/pricing" className="hover:text-foreground transition-colors">Pricing tiers</a>
              <a href="/#faq" className="hover:text-foreground transition-colors">FAQ answers</a>
            </div>
          </div>

          <div>
            <h5 className="text-[10px] uppercase tracking-widest font-bold text-foreground mb-4">
              Connect
            </h5>
            <div className="flex flex-col gap-3 text-xs md:text-sm text-secondary-custom">
              <a href="mailto:hello@nexora.ai" className="hover:text-foreground transition-colors">hello@nexora.ai</a>
              <a href="/contact" className="hover:text-foreground transition-colors">Schedule Consult</a>
              <a href="/admin/login" className="hover:text-accent-custom transition-colors font-mono">Admin Portal</a>
            </div>
          </div>

        </div>

        {/* Bottom: Massive Title + Copyright + Socials */}
        <div className="border-t border-border-custom/50 pt-8 mt-4 flex flex-col-reverse md:flex-row items-center justify-between gap-6 relative">
          
          <div className="text-[10px] font-mono text-secondary-custom">
            &copy; {new Date().getFullYear()} Nexora AI. All rights reserved. Designed for scale.
          </div>

          {/* Socials */}
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface flex items-center justify-center text-secondary-custom hover:text-accent-custom transition-all"
              aria-label="Twitter"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface flex items-center justify-center text-secondary-custom hover:text-accent-custom transition-all"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="w-9 h-9 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface flex items-center justify-center text-secondary-custom hover:text-accent-custom transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
            </a>
          </div>

          {/* Massive Outline Text Span */}
          <div className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden h-[120px] z-0 opacity-5">
            <span className="text-[130px] font-black tracking-widest text-foreground font-sans uppercase block leading-none select-none">
              NEXORA
            </span>
          </div>

        </div>

      </div>
    </footer>
  );
}
