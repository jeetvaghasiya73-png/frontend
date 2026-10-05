"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import "./automation-cluster.css";
import {
  Activity, ArrowRight, Database, MessageCircle, BarChart3, Search, Settings2, Target, ShieldCheck, Code, ArrowUpRight
} from "lucide-react";

// ── Interactive Graph Animation Component ──
function AnimatedHeroGraph() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px]">
        {/* SVG Connections with animated dash arrays */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 400">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--border-custom)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--foreground)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--border-custom)" stopOpacity="0.1" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Central Hub to Nodes */}
          <path d="M400,200 L200,100" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="auto-path-anim" />
          <path d="M400,200 L600,100" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="auto-path-anim" style={{ animationDelay: '0.5s' }} />
          <path d="M400,200 L200,300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="auto-path-anim" style={{ animationDelay: '1s' }} />
          <path d="M400,200 L600,300" stroke="url(#lineGrad)" strokeWidth="1" fill="none" className="auto-path-anim" style={{ animationDelay: '1.5s' }} />
          
          {/* Node to Node */}
          <path d="M200,100 L600,100" stroke="var(--border-custom)" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
          <path d="M200,300 L600,300" stroke="var(--border-custom)" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
          <path d="M200,100 L200,300" stroke="var(--border-custom)" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />
          <path d="M600,100 L600,300" stroke="var(--border-custom)" strokeWidth="0.5" fill="none" strokeDasharray="4 4" />

          {/* Data Packets (Moving Circles) */}
          <circle r="3" fill="var(--foreground)" filter="url(#glow)">
            <animateMotion dur="4s" repeatCount="indefinite" path="M400,200 L200,100" />
          </circle>
          <circle r="3" fill="var(--foreground)" filter="url(#glow)">
            <animateMotion dur="3s" repeatCount="indefinite" path="M400,200 L600,100" begin="1s" />
          </circle>
          <circle r="3" fill="var(--foreground)" filter="url(#glow)">
            <animateMotion dur="3.5s" repeatCount="indefinite" path="M400,200 L200,300" begin="2s" />
          </circle>
          <circle r="3" fill="var(--foreground)" filter="url(#glow)">
            <animateMotion dur="4.5s" repeatCount="indefinite" path="M400,200 L600,300" begin="0.5s" />
          </circle>
        </svg>

        {/* Nodes (HTML overlays for better styling) */}
        <div className="absolute top-[100px] left-[200px] w-12 h-12 -ml-6 -mt-6 bg-[var(--surface)] border border-[var(--border-custom)] rounded-full flex items-center justify-center auto-node-pulse">
          <Database className="w-4 h-4 text-[var(--secondary-custom)]" />
        </div>
        <div className="absolute top-[100px] left-[600px] w-12 h-12 -ml-6 -mt-6 bg-[var(--surface)] border border-[var(--border-custom)] rounded-full flex items-center justify-center auto-node-pulse" style={{ animationDelay: '0.5s' }}>
          <MessageCircle className="w-4 h-4 text-[var(--secondary-custom)]" />
        </div>
        <div className="absolute top-[300px] left-[200px] w-12 h-12 -ml-6 -mt-6 bg-[var(--surface)] border border-[var(--border-custom)] rounded-full flex items-center justify-center auto-node-pulse" style={{ animationDelay: '1s' }}>
          <ShieldCheck className="w-4 h-4 text-[var(--secondary-custom)]" />
        </div>
        <div className="absolute top-[300px] left-[600px] w-12 h-12 -ml-6 -mt-6 bg-[var(--surface)] border border-[var(--border-custom)] rounded-full flex items-center justify-center auto-node-pulse" style={{ animationDelay: '1.5s' }}>
          <BarChart3 className="w-4 h-4 text-[var(--secondary-custom)]" />
        </div>
        
        {/* Central Hub */}
        <div className="absolute top-[200px] left-[400px] w-16 h-16 -ml-8 -mt-8 bg-[var(--foreground)] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] auto-hub-pulse">
          <Activity className="w-6 h-6 text-[var(--background)]" />
        </div>
      </div>
    </div>
  );
}

export default function AutomationMasterPage() {
  const currentUrl = "https://www.techinfinix.com/services/automation";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${currentUrl}#service`,
    name: "Automation Services That Eliminate Manual Work",
    serviceType: "Business Automation Services",
    description: "Custom automation services for business workflows, WhatsApp, CRM, lead handling, and process optimization. Get a tailored automation strategy.",
    provider: {
      "@type": "Organization",
      name: "Tech Infinix",
      url: "https://www.techinfinix.com",
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main className="auto-cluster-page flex-1 overflow-hidden">
        
        {/* Abstract Data Grid Background */}
        <div className="auto-grid-bg"></div>

        {/* ═══ HERO WITH ANIMATED GRAPH ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-32 md:pt-48 pb-24 relative z-10 min-h-[80vh] flex items-center justify-center">
          <AnimatedHeroGraph />
          
          <div className="auto-hero relative z-20 w-full backdrop-blur-[2px]">
            <div className="auto-tag mb-8 shadow-sm">
              <Activity className="w-3.5 h-3.5" />
              <span>Scale Your Operations Automatically</span>
            </div>

            <h1 className="auto-hero-title max-w-5xl mx-auto">
              Automation Services That Eliminate Manual Bottlenecks
            </h1>

            <p className="auto-hero-subtitle mx-auto text-lg md:text-xl">
              Growth breaks manual processes. We design, build, and deploy custom business automation systems that connect your tools, handle repetitive tasks instantly, and let your team focus on high-value cognitive work that requires human judgment. Eliminate errors, reduce operational costs, and scale infinitely.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mt-12">
              <Link href="/contact?service=automation" className="auto-btn-primary shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                Discuss Your Automation Strategy
              </Link>
              <a href="#directory" className="auto-btn-secondary hover:bg-[var(--surface)] transition-all">
                Explore Modules
              </a>
            </div>
            
            {/* Added valuable stats for immediate engagement */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 pt-8 border-t border-[var(--border-custom)] w-full max-w-4xl mx-auto opacity-80">
               <div className="text-center">
                 <div className="font-mono text-2xl font-bold text-[var(--foreground)]">99.9%</div>
                 <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">Uptime Reliability</div>
               </div>
               <div className="text-center">
                 <div className="font-mono text-2xl font-bold text-[var(--foreground)]">10x</div>
                 <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">Faster Execution</div>
               </div>
               <div className="text-center">
                 <div className="font-mono text-2xl font-bold text-[var(--foreground)]">0%</div>
                 <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">Human Data Errors</div>
               </div>
               <div className="text-center">
                 <div className="font-mono text-2xl font-bold text-[var(--foreground)]">24/7</div>
                 <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">Continuous Operation</div>
               </div>
            </div>
          </div>
        </section>

        {/* ═══ VALUABLE OVERVIEW (Expanded Content) ═══ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full mb-32 relative z-10">
          <div className="auto-panel text-center bg-gradient-to-b from-[var(--surface)] to-transparent">
            <span className="auto-panel-label">The Automation Advantage & ROI</span>
            <h3 className="auto-panel-title text-2xl md:text-3xl mb-8">Why Manual Operations Are Costing You Revenue</h3>
            <div className="space-y-6 text-left max-w-3xl mx-auto">
              <p className="auto-panel-desc text-lg">
                Most businesses reach a ceiling not because they lack market demand, but because their internal operations simply cannot handle the volume. Every time a human has to touch data, move information between systems, or manually trigger a communication, you introduce a bottleneck that limits your scalability.
              </p>
              <p className="auto-panel-desc text-lg">
                When your team spends hours copying data from a lead form to a CRM, sending routine follow-up emails, compiling weekly reports, or manually assigning tasks—they are acting as <strong>human middleware</strong>. This is expensive, highly error-prone, and impossible to scale without linearly increasing your payroll costs. Human capital should be spent on strategy, relationships, and problem-solving, not data transfer.
              </p>
              <p className="auto-panel-desc text-lg">
                Our enterprise-grade automation services bridge the gap between the fragmented tools you use and the seamless outcomes you want. We connect applications via secure APIs, design intelligent fault-tolerant workflows, and automate the mechanical parts of your business. The result? A unified, high-speed operational engine that runs 24/7 without fatigue.
              </p>
              <div className="bg-[var(--background)] border border-[var(--border-custom)] p-6 rounded-lg mt-8">
                <h4 className="font-bold text-[var(--foreground)] mb-2 flex items-center gap-2"><Target className="w-5 h-5"/> Measurable Business Impact</h4>
                <ul className="space-y-3 mt-4 text-sm text-[var(--secondary-custom)]">
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 shrink-0"/> <strong>Cost Reduction:</strong> Eliminate the need for excessive operational headcount just to manage data.</li>
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 shrink-0"/> <strong>Speed to Lead:</strong> Respond to inquiries in seconds rather than hours, dramatically increasing conversion rates.</li>
                  <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 shrink-0"/> <strong>Data Integrity:</strong> Automated systems don't make typos. Ensure your CRM and ERP data is always 100% accurate.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ DIRECTORY (Clean Data Grid) ═══ */}
        <section id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-32 relative z-10">
          <div className="text-center mb-16">
            <h2 className="auto-section-title">System Directory & Solutions</h2>
            <p className="auto-section-desc mx-auto">Explore our comprehensive automation capabilities designed for modern, data-driven enterprises.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Core Automation */}
            <div className="auto-data-box p-8 hover:border-[var(--foreground)] transition-colors">
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3 border-b border-[var(--border-custom)] pb-4">
                <Database className="w-6 h-6" /> Core Operations
              </h3>
              <div className="flex flex-col">
                <Link href="/services/automation/business-automation" className="auto-directory-link py-4">
                  <div>
                    <div className="auto-directory-title text-lg">Business Automation</div>
                    <div className="auto-directory-desc">Streamline internal operations, data movement, and repetitive tasks.</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                </Link>
                <Link href="/services/automation/business-automation-services" className="auto-directory-link py-4">
                  <div>
                    <div className="auto-directory-title text-lg">Business Automation Services</div>
                    <div className="auto-directory-desc">End-to-end implementation covering workflow design and CRM logic.</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                </Link>
                <Link href="/services/automation/workflow-automation" className="auto-directory-link py-4 border-b-0">
                  <div>
                    <div className="auto-directory-title text-lg">Workflow Automation Services</div>
                    <div className="auto-directory-desc">Design trigger-action sequences that connect forms, tools, and CRMs.</div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              {/* WhatsApp */}
              <div className="auto-data-box p-8 hover:border-[var(--foreground)] transition-colors">
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3 border-b border-[var(--border-custom)] pb-4">
                  <MessageCircle className="w-6 h-6" /> WhatsApp Automation
                </h3>
                <div className="flex flex-col">
                  <Link href="/services/automation/whatsapp-automation-software" className="auto-directory-link py-4">
                    <div>
                      <div className="auto-directory-title text-lg">WhatsApp Automation Software</div>
                      <div className="auto-directory-desc">Connect the WhatsApp Business API directly to your infrastructure.</div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                  </Link>
                  <Link href="/services/automation/whatsapp-business-automation" className="auto-directory-link py-4 border-b-0">
                    <div>
                      <div className="auto-directory-title text-lg">WhatsApp Business Automation</div>
                      <div className="auto-directory-desc">Automate lead qualification, CRM sync, and team routing for messaging.</div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                  </Link>
                </div>
              </div>

              {/* Strategy & Data */}
              <div className="auto-data-box p-8 hover:border-[var(--foreground)] transition-colors">
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-3 border-b border-[var(--border-custom)] pb-4">
                  <Settings2 className="w-6 h-6" /> Data & Strategy
                </h3>
                <div className="flex flex-col">
                  <Link href="/services/automation/processing-automation" className="auto-directory-link py-4">
                    <div>
                      <div className="auto-directory-title text-lg">Processing Automation</div>
                      <div className="auto-directory-desc">Accelerate data formatting, parsing, ETL pipelines, and batch operations.</div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                  </Link>
                  <Link href="/services/automation/integration-automation" className="auto-directory-link py-4 border-b-0">
                    <div>
                      <div className="auto-directory-title text-lg">Integration Automation</div>
                      <div className="auto-directory-desc">Connect disparate APIs and databases to eliminate manual data transfers.</div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-[var(--foreground)]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ IMPLEMENTATION ARC (Graph Node) ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-32 relative z-10">
          <div className="text-center mb-16">
            <h2 className="auto-section-title">Implementation Protocol</h2>
            <p className="auto-section-desc mx-auto">We don't just connect tools blindly. We follow a rigorous, enterprise-grade engineering methodology to ensure your automations are resilient, scalable, and secure.</p>
          </div>

          <div className="auto-graph-container border-y border-[var(--border-custom)] py-12 bg-[var(--surface)]">
            <div className="auto-graph-line h-full"></div>
            
            <div className="auto-graph-node hover:border-[var(--foreground)] transition-colors">
              <div className="auto-graph-icon"><Search className="w-6 h-6" /></div>
              <div className="auto-graph-content">
                <h4 className="text-xl">1. Process Audit & Discovery</h4>
                <p>We deeply analyze and map your current manual tasks, data flows, and team bottlenecks to identify the highest ROI opportunities.</p>
              </div>
            </div>
            
            <div className="auto-graph-node hover:border-[var(--foreground)] transition-colors">
              <div className="auto-graph-icon"><Target className="w-6 h-6" /></div>
              <div className="auto-graph-content">
                <h4 className="text-xl">2. Strategic Prioritization</h4>
                <p>We rank processes based on impact vs effort, ensuring we automate the tasks that will save the most time and money first.</p>
              </div>
            </div>

            <div className="auto-graph-node hover:border-[var(--foreground)] transition-colors">
              <div className="auto-graph-icon"><Code className="w-6 h-6" /></div>
              <div className="auto-graph-content">
                <h4 className="text-xl">3. Technical Architecture</h4>
                <p>We design robust technical blueprints, selecting the right APIs, webhooks, and data models to ensure long-term scalability without vendor lock-in.</p>
              </div>
            </div>

            <div className="auto-graph-node hover:border-[var(--foreground)] transition-colors">
              <div className="auto-graph-icon"><Database className="w-6 h-6" /></div>
              <div className="auto-graph-content">
                <h4 className="text-xl">4. Build & System Integration</h4>
                <p>Our engineers build the pipelines, securely connecting your CRM, ERP, and communication tools to allow seamless data flow.</p>
              </div>
            </div>

            <div className="auto-graph-node hover:border-[var(--foreground)] transition-colors">
              <div className="auto-graph-icon"><ShieldCheck className="w-6 h-6" /></div>
              <div className="auto-graph-content">
                <h4 className="text-xl">5. Edge-Case Testing & QA</h4>
                <p>We rigorously test the automation against edge cases, API rate limits, and network failures to ensure 99.9% uptime and zero data loss.</p>
              </div>
            </div>

            <div className="auto-graph-node hover:border-[var(--foreground)] transition-colors">
              <div className="auto-graph-icon"><BarChart3 className="w-6 h-6" /></div>
              <div className="auto-graph-content">
                <h4 className="text-xl">6. Deployment & Monitoring</h4>
                <p>We deploy the automation into production with continuous monitoring dashboards, refining the loops as your business scales.</p>
              </div>
            </div>
          </div>
        </section>

        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
