"use client";

import React, { useRef, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Cpu, Workflow, Layers, Database, BarChart, Route, ArrowUpRight, Globe, Zap, Code, Bot, Loader2 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const ICON_MAP: Record<string, any> = {
  Cpu, Workflow, Layers, Database, BarChart, Route, Globe, Zap, Code, Bot,
};

const SPAN_PATTERN = [
  "lg:col-span-8", "lg:col-span-4",
  "lg:col-span-4", "lg:col-span-8",
  "lg:col-span-6", "lg:col-span-6",
];

export default function WhatWeBuildSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [services, setServices] = useState<any[] | null>(null);

  const fallbackCapabilities = [
    {
      title: "AI Agents",
      icon: "Cpu",
      description: "Custom autonomous AI agents trained on corporate datasets to execute multi-step reasoning tasks, resolve tickets, and interact with external APIs.",
      features: ["Autonomous Reasoning", "Enterprise Data RAG", "Tool & API Execution", "Contextual Memory Pools"],
    },
    {
      title: "AI Automation",
      icon: "Workflow",
      description: "Injecting LLMs into legacy workflows to read invoices, draft contextual responses, and automate complex decision-making nodes.",
      features: ["Document Processing", "LLM Routing Logic", "Continuous Auditing", "Self-Correction"],
    },
    {
      title: "SaaS Development",
      icon: "Layers",
      description: "Production-ready web applications built with scalable App Router backends, multi-tenant databases, and seamless stripe billing models.",
      features: ["React 19 & Next.js 15", "FastAPI Core Services", "Multi-Tenant Architectures", "Secure Session Handlers"],
    },
    {
      title: "Lead Generation & SEO",
      icon: "BarChart",
      description: "Dynamic SEO systems that auto-generate landing pages and structure structured schema markup to capture high-intent searches.",
      features: ["Programmatic Landing Pages", "Speed Audited Pages", "Keyword Target Trees", "Search Console Pipelines"],
    },
    {
      title: "Web Scraping & APIs",
      icon: "Database",
      description: "High-volume data extraction pipelines bypassing firewalls, rate limits, and Cloudflare challenges, delivering structured payloads.",
      features: ["Playwright Cluster Farms", "Proxy Rotation Engines", "Captchas Bypass Filters", "Structured API Webhooks"],
    },
    {
      title: "CRM & ERP Workflows",
      icon: "Route",
      description: "Consolidating scattered CRM structures by building customized database bridges, custom middlewares, and real-time syncing pipelines.",
      features: ["HubSpot & Salesforce APIs", "Data Lake Consolidation", "Automatic Deduplication", "Real-Time Event Logs"],
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/public/services`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setServices(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch services, using fallback", err);
      }
      setServices(null);
    };
    fetchServices();
  }, []);

  const capabilities = (services || fallbackCapabilities).map((item: any, idx: number) => ({
    num: String(idx + 1).padStart(2, "0"),
    title: item.title,
    icon: ICON_MAP[item.icon] || Cpu,
    desc: item.description || item.desc,
    features: item.features || [],
    span: SPAN_PATTERN[idx % SPAN_PATTERN.length],
  }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".build-card",
        { opacity: 0, y: 80, rotationX: 8, skewY: 1.5, willChange: "transform, opacity" },
        {
          opacity: 1,
          y: 0,
          rotationX: 0,
          skewY: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".build-grid",
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [capabilities]);

  return (
    <section
      id="services"
      ref={containerRef}
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        {/* Section Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
                Capabilities
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
              <SplitText text="What We Build for High-Scale Enterprise Networks." type="words" />
            </h2>
            <p className="text-lg text-secondary-custom leading-relaxed max-w-xl">
              We engineer premium, tailored software and intelligence integrations that completely eliminate operational bottlenecks.
            </p>
          </div>

          {/* Premium Abstract Graphic (Right Side) */}
          <div className="hidden lg:flex items-center justify-center relative w-full h-[300px]">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Outer rings */}
              <div className="absolute w-[280px] h-[280px] rounded-full border border-accent-custom/20 animate-[spin-slow_20s_linear_infinite]" />
              <div className="absolute w-[280px] h-[280px] rounded-full border border-accent-custom/10 animate-[spin-slow_15s_linear_infinite_reverse] rotate-45" />
              <div className="absolute w-[200px] h-[200px] rounded-full border border-purple-500/20 animate-[spin-slow_12s_linear_infinite] border-dashed" />
              
              {/* Center Core */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-accent-custom to-purple-500 flex items-center justify-center shadow-[0_0_40px_rgba(41,98,255,0.4)] animate-float-smooth z-10">
                <div className="absolute inset-0 rounded-full bg-black/40 m-1 border border-white/20" />
                <Workflow className="w-8 h-8 text-white relative z-10" />
              </div>

              {/* Orbiting nodes */}
              <div className="absolute w-[280px] h-[280px] animate-[spin-slow_20s_linear_infinite]">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent-custom border-[3px] border-background" />
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-500 border-[2px] border-background" />
              </div>
            </div>
          </div>
        </div>

        {/* Capabilities Grid */}
        <div className="build-grid grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
          {capabilities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`build-card ${item.span} border border-border-custom bg-surface/30 backdrop-blur-md rounded-xl p-8 md:p-10 flex flex-col justify-between hover:border-accent-custom/50 hover:bg-surface/50 transition-all duration-500 group relative overflow-hidden`}
              >
                {/* Crisp geometric background on hover instead of blurry blob */}
                <div className="absolute -right-12 -top-12 w-40 h-40 border border-accent-custom/10 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-0 group-hover:opacity-100 pointer-events-none" />
                <div className="absolute -right-4 -top-4 w-24 h-24 border border-purple-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 delay-75 opacity-0 group-hover:opacity-100 pointer-events-none" />

                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-12 h-12 rounded-lg bg-surface border border-border-custom flex items-center justify-center text-accent-custom group-hover:bg-accent-custom group-hover:text-white transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-bold text-secondary-custom font-mono">
                      {item.num}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-bold tracking-tight mb-4 group-hover:text-accent-custom transition-colors duration-300 flex items-center gap-2">
                    {item.title}
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 text-accent-custom" />
                  </h3>
                  <p className="text-secondary-custom text-sm md:text-base leading-relaxed mb-8 max-w-lg">
                    {item.desc}
                  </p>
                </div>

                {/* Features Checklists */}
                <div className="border-t border-border-custom/50 pt-8 mt-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs md:text-sm text-foreground/80">
                    {item.features.map((feat: string, fIdx: number) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-custom" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
