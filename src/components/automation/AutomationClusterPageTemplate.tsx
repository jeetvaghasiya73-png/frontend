"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import ContactSection from "@/components/sections/ContactSection";
import { AutomationPageData } from "@/app/services/automation/automation-cluster-data";
import "@/app/services/automation/automation-cluster.css";
import {
  ArrowRight, Plus, Activity, Search, Target, Database,
  ShieldCheck, BarChart3, Settings2, Code, Zap
} from "lucide-react";

interface AutomationClusterPageTemplateProps {
  pageData: AutomationPageData;
}

export default function AutomationClusterPageTemplate({ pageData }: AutomationClusterPageTemplateProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const currentUrl = `https://www.techinfinix.com/services/automation/${pageData.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": pageData.schemaType,
        "@id": `${currentUrl}#service`,
        name: pageData.h1,
        serviceType: pageData.primaryKeyword,
        description: pageData.metaDescription,
        provider: {
          "@type": "Organization",
          name: "Tech Infinix",
          url: "https://www.techinfinix.com",
        }
      }
    ]
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

        {/* ═══ HERO ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full pt-32 md:pt-40 pb-20 relative z-10">
          <div className="auto-hero">
            <div className="auto-tag">
              <Activity className="w-3.5 h-3.5" />
              <span>{pageData.heroBadge}</span>
            </div>

            <h1 className="auto-hero-title">
              {pageData.h1}
            </h1>

            <p className="auto-hero-subtitle">
              {pageData.heroSubtitle}
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <Link href={pageData.ctaLink} className="auto-btn-primary">
                {pageData.ctaText}
              </Link>
              <a href="#architecture" className="auto-btn-secondary">
                View Architecture
              </a>
            </div>
          </div>
        </section>

        {/* ═══ INTRODUCTION (Data Panel) ═══ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full mb-16 relative z-10">
          <div className="auto-panel text-center">
            <span className="auto-panel-label">System Overview</span>
            <h3 className="auto-panel-title text-xl md:text-2xl mb-6">{pageData.introduction.lead}</h3>
            <div className="space-y-4">
              {pageData.introduction.paragraphs.map((p, i) => (
                <p key={i} className="auto-panel-desc mx-auto text-lg">{p}</p>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ DYNAMIC ROI & BUSINESS IMPACT ═══ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full mb-32 relative z-10">
          <div className="bg-[var(--background)] border border-[var(--border-custom)] rounded-lg p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4 flex items-center gap-3">
                  <Target className="w-6 h-6" /> Business Impact & ROI
                </h3>
                <p className="text-[var(--secondary-custom)] leading-relaxed mb-6">
                  Implementing {pageData.primaryKeyword} isn't just about saving a few hours a week. It's about fundamentally changing how your business scales. By removing humans from mechanical data transfer, you unlock infinite scalability without linear payroll growth.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 mt-0.5 text-[var(--foreground)] shrink-0"/>
                    <div>
                      <strong className="text-[var(--foreground)] block">Cost Reduction</strong>
                      <span className="text-sm text-[var(--secondary-custom)]">Eliminate the need for excessive operational headcount just to manage data routing and repetitive follow-ups.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 mt-0.5 text-[var(--foreground)] shrink-0"/>
                    <div>
                      <strong className="text-[var(--foreground)] block">Zero Data Degradation</strong>
                      <span className="text-sm text-[var(--secondary-custom)]">Automated systems don't make typos or forget attachments. Ensure your CRM and ERP data is 100% accurate, 24/7.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 mt-0.5 text-[var(--foreground)] shrink-0"/>
                    <div>
                      <strong className="text-[var(--foreground)] block">Speed to Execution</strong>
                      <span className="text-sm text-[var(--secondary-custom)]">Respond to inquiries and process inputs in milliseconds rather than hours, dramatically increasing conversion and throughput.</span>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="w-full md:w-64 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-[var(--border-custom)] pt-6 md:pt-0 md:pl-8">
                <div>
                   <div className="font-mono text-3xl font-light text-[var(--foreground)]">99.9%</div>
                   <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">System Uptime</div>
                </div>
                <div>
                   <div className="font-mono text-3xl font-light text-[var(--foreground)]">10x</div>
                   <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">Processing Speed</div>
                </div>
                <div>
                   <div className="font-mono text-3xl font-light text-[var(--foreground)]">0%</div>
                   <div className="text-xs uppercase tracking-wider text-[var(--secondary-custom)] mt-1">Human Fatigue</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CAPABILITIES (Monochrome Charts) ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-32 relative z-10">
          <div className="mb-12">
            <h2 className="auto-section-title">Core Capabilities</h2>
            <p className="auto-section-desc">Key technical focuses for {pageData.primaryKeyword}.</p>
          </div>

          <div className="auto-data-grid">
            {pageData.coreFocusAreas.map((area, idx) => (
              <div key={idx} className="auto-data-box">
                <span className="auto-panel-label">Module 0{idx + 1}</span>
                <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">{area.title}</h3>
                <p className="text-sm text-[var(--secondary-custom)] mb-6 leading-relaxed flex-1">{area.description}</p>
                
                <div className="auto-bar-chart">
                  {area.points.map((pt, pIdx) => {
                    // Random width for visual structural representation
                    const width = Math.floor(Math.random() * (95 - 70 + 1) + 70);
                    return (
                      <div key={pIdx} className="auto-bar-row">
                        <div className="auto-bar-label truncate" title={pt}>{pt.split(' ')[0]}</div>
                        <div className="auto-bar-track">
                          <div className="auto-bar-fill" style={{ width: `${width}%`, animationDelay: `${pIdx * 0.15}s` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ ARCHITECTURE GRAPH (Nodes) ═══ */}
        <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-32 relative z-10">
          <div className="text-center mb-4">
            <h2 className="auto-section-title">{pageData.workflowDiagram.title}</h2>
            <p className="auto-section-desc mx-auto">{pageData.workflowDiagram.subtitle}</p>
          </div>

          <div className="auto-graph-container">
            <div className="auto-graph-line"></div>
            
            {pageData.workflowDiagram.nodes.map((node, idx) => {
              return (
                <div key={idx} className="auto-graph-node">
                  <div className="auto-graph-icon">
                    <Code className="w-5 h-5" />
                  </div>
                  <div className="auto-graph-content">
                    <h4>{node.label}</h4>
                    <p>{node.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══ DEEP DIVE (Split Comparison) ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-32 relative z-10">
          <div className="mb-12">
            <h2 className="auto-section-title">{pageData.deepDive.title}</h2>
            <p className="auto-section-desc">{pageData.deepDive.subtitle}</p>
          </div>

          {pageData.deepDive.type === "table" && pageData.deepDive.rows && (
            <div className="auto-matrix">
              {/* Manual/Before Side */}
              <div className="auto-matrix-panel">
                <div className="auto-matrix-header">
                  Legacy Execution
                </div>
                {pageData.deepDive.rows.map((row, idx) => (
                  <div key={idx} className="auto-matrix-row">
                    <span className="auto-matrix-label">{row.col1}</span>
                    <span className="auto-matrix-value opacity-60">{row.col2}</span>
                  </div>
                ))}
              </div>
              
              {/* Automated/After Side */}
              <div className="auto-matrix-panel" style={{ backgroundColor: 'var(--background)' }}>
                <div className="auto-matrix-header">
                  Automated Pipeline
                </div>
                {pageData.deepDive.rows.map((row, idx) => (
                  <div key={idx} className="auto-matrix-row">
                    <span className="auto-matrix-label">{row.col1}</span>
                    <span className="auto-matrix-value font-medium">{row.col3}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pageData.deepDive.type !== "table" && pageData.deepDive.cards && (
            <div className="auto-data-grid">
              {pageData.deepDive.cards.map((card, idx) => (
                <div key={idx} className="auto-data-box">
                  <span className="auto-panel-label">{card.tag || 'Metrics'}</span>
                  <div className="auto-data-number">{(idx + 1).toString().padStart(2, '0')}</div>
                  <h4 className="text-lg font-medium text-[var(--foreground)] mb-3">{card.title}</h4>
                  <p className="text-sm text-[var(--secondary-custom)] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ═══ METHODOLOGY ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full mb-32 relative z-10">
          <div className="mb-12">
            <h2 className="auto-section-title">Implementation Protocol</h2>
          </div>

          <div className="auto-data-grid">
            {pageData.methodology.map((step, idx) => (
              <div key={idx} className="auto-data-box" style={{ padding: '2rem' }}>
                <div className="text-[var(--foreground)] font-mono text-xl font-medium mb-4 pb-4 border-b border-[var(--border-custom)]">
                  {step.step}
                </div>
                <h4 className="text-[var(--foreground)] font-semibold mb-2">{step.title}</h4>
                <p className="text-sm text-[var(--secondary-custom)] mb-4">{step.description}</p>
                <div className="text-xs font-mono text-[var(--secondary-custom)] uppercase tracking-wider mt-auto pt-4">
                  Output: {step.deliverable}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ═══ RELATED SOLUTIONS (Directory) ═══ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full mb-32 relative z-10">
          <div className="mb-8">
            <h2 className="auto-section-title">Connected Systems</h2>
          </div>
          
          <div className="border-t border-[var(--border-custom)]">
            {pageData.relatedPages.map((rel, idx) => (
              <Link key={idx} href={`/services/automation/${rel.slug}`} className="auto-directory-link">
                <div>
                  <div className="auto-directory-title">{rel.title}</div>
                  <div className="auto-directory-desc">{rel.relationship}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--secondary-custom)]" />
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full mb-32 relative z-10">
          <div className="mb-10 text-center">
            <h2 className="auto-section-title">Common Queries</h2>
          </div>

          <div className="border-t border-[var(--border-custom)]">
            {pageData.faqs.map((faq, index) => (
              <div key={index}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="auto-faq-btn"
                  aria-expanded={openFaqIndex === index}
                >
                  <span className="pr-8">{faq.q}</span>
                  <Plus className="w-5 h-5 auto-faq-icon shrink-0" />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="auto-faq-content">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <ContactSection />
      </main>
      <FooterSection />
    </>
  );
}
