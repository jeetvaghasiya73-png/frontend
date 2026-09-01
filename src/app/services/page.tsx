"use client";

import React, { useState, useEffect } from "react";
import { API_URL } from "@/lib/config";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import SplitText from "@/components/animations/SplitText";
import { Cpu, Workflow, Globe, Layers, Database, BarChart, Route, Zap, Code, Bot, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  Cpu, Workflow, Globe, Layers, Database, BarChart, Route, Zap, Code, Bot,
};

const COLOR_CYCLE = [
  "text-blue-400 border-blue-500/20 bg-blue-500/5",
  "text-purple-400 border-purple-500/20 bg-purple-500/5",
  "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
  "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  "text-pink-400 border-pink-500/20 bg-pink-500/5",
  "text-amber-400 border-amber-500/20 bg-amber-500/5",
];

export default function ServicesPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fallbackServices = [
    {
      id: "automation",
      title: "AI Automation Pipelines",
      description: "Integrate autonomous workflows using n8n, Make, and custom Python servers to connect your CRMs, Slack channels, and databases.",
      icon: "Workflow",
      features: [
        "End-to-end CRM synchronization",
        "Automated report generation",
        "Multi-platform webhook loops",
        "Dynamic content generation engines"
      ],
      baseCost: 2500,
      baseTime: "2-3 weeks"
    },
    {
      id: "agents",
      title: "Autonomous AI Agents",
      description: "Architect agentic setups that handle client support, retrieve information from internal knowledge vectors, and take actions autonomously.",
      icon: "Cpu",
      features: [
        "RAG (Retrieval Augmented Generation)",
        "LangChain & LangGraph structures",
        "Voice & chat customer service agents",
        "Automated calendar booking loops"
      ],
      baseCost: 4000,
      baseTime: "3-5 weeks"
    },
    {
      id: "web",
      title: "Enterprise Web Dev & SaaS",
      description: "Engineer lightning-fast SaaS interfaces and agency showcases utilizing Next.js 15, Framer Motion, and secure backend servers.",
      icon: "Globe",
      features: [
        "Next.js App Router architectures",
        "Awwwards-level interactive graphics",
        "Secure admin management consoles",
        "Complete Stripe billing systems"
      ],
      baseCost: 3500,
      baseTime: "3-4 weeks"
    }
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/public/services`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setServices(data.map((s: any, idx: number) => ({
              id: s.slug || `service-${s.id}`,
              title: s.title,
              description: s.description,
              icon: s.icon,
              features: s.features || [],
              baseCost: 2500 + (idx * 500),
              baseTime: `${2 + idx}-${4 + idx} weeks`
            })));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch services, using fallback", err);
      }
      setServices(fallbackServices);
      setLoading(false);
    };
    fetchServices();
  }, []);

  const handleToggleService = (id: string) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(s => s !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const calculateEstimate = () => {
    if (selectedServices.length === 0) return { cost: 0, time: "0 days" };
    let cost = 0;
    let maxTimeWeeks = 0;
    
    selectedServices.forEach(id => {
      const srv = services.find(s => s.id === id);
      if (srv) {
        cost += srv.baseCost;
        const weeks = parseInt(srv.baseTime.split("-")[1] || "3");
        maxTimeWeeks = Math.max(maxTimeWeeks, weeks);
      }
    });

    // Multi-service discount
    if (selectedServices.length > 1) {
      cost = Math.round(cost * 0.9); // 10% discount
    }

    return {
      cost,
      time: `${maxTimeWeeks} - ${maxTimeWeeks + 2} weeks`
    };
  };

  const estimate = calculateEstimate();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 bg-background pt-32 pb-24 text-left">
          <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
            <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
            <span className="font-mono text-xs text-[#B0B0B0]">Loading services...</span>
          </div>
        </main>
        <FooterSection />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-background pt-32 pb-24 text-left">
        {/* Intro */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full relative mb-20">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent-glow blur-[100px] pointer-events-none opacity-30 mix-blend-screen scale-75" />
          
          <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-4">
            Our Offerings
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
            <SplitText text="Enterprise AI Services" type="words" />
          </h1>
          <p className="text-sm md:text-base text-secondary-custom max-w-2xl leading-relaxed">
            We build secure, custom pipelines and software solutions engineered to scale operations,
            reduce human error, and automate manual business administration.
          </p>
        </section>

        {/* Detailed Grid */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 mb-28">
          {services.map((srv, idx) => {
            const Icon = ICON_MAP[srv.icon] || Cpu;
            const color = COLOR_CYCLE[idx % COLOR_CYCLE.length];
            return (
              <div
                key={srv.id}
                className="border border-border-custom bg-surface/20 p-8 rounded-2xl flex flex-col justify-between hover:border-accent-custom/50 hover:bg-surface/30 transition-all duration-300 group"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${color} mb-6`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-accent-custom transition-colors duration-300">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#B0B0B0] mt-3 leading-relaxed font-medium">
                    {srv.description}
                  </p>

                  <div className="border-t border-border-custom/50 pt-6 mt-6">
                    <h4 className="text-[10px] font-mono font-bold tracking-wider text-secondary-custom uppercase mb-3">
                      Key Deliverables
                    </h4>
                    <ul className="space-y-2">
                      {srv.features.map((feat: string, fIdx: number) => (
                        <li key={fIdx} className="flex items-center gap-2.5 text-xs text-[#E0E0E0]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-custom shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="border-t border-border-custom/50 pt-6 mt-8">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#666666]">Starting at:</span>
                    <span className="font-bold text-white">${srv.baseCost}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Interactive Scope Estimator */}
        <section className="max-w-5xl mx-auto px-6 md:px-12 w-full mb-16">
          <div className="border border-border-custom bg-surface/30 backdrop-blur-md rounded-3xl p-8 md:p-12 text-left relative overflow-hidden">
            <div className="absolute top-[-50%] right-[-20%] w-[350px] h-[350px] rounded-full bg-accent-glow blur-[100px] pointer-events-none opacity-20" />
            
            <div className="max-w-2xl">
              <span className="text-[10px] font-mono font-bold tracking-widest text-accent-custom uppercase block mb-3">
                Project Architect
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Estimate Your System Scale
              </h2>
              <p className="text-xs text-secondary-custom leading-relaxed mb-8">
                Toggle your required service integrations to generate an immediate cost and timeline estimate. Custom integration discounts apply.
              </p>
            </div>

            {/* Select Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
              {services.map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => handleToggleService(srv.id)}
                  className={`border p-5 rounded-xl text-left cursor-pointer transition-all duration-300 ${
                    selectedServices.includes(srv.id)
                      ? "border-accent-custom bg-accent-custom/5 text-white"
                      : "border-border-custom bg-surface/50 hover:bg-surface text-[#B0B0B0]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                      {srv.title.split(" ")[0]}
                    </span>
                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      selectedServices.includes(srv.id) ? "border-accent-custom bg-accent-custom" : "border-border-custom"
                    }`}>
                      {selectedServices.includes(srv.id) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{srv.title}</h4>
                  <span className="text-[10px] text-secondary-custom font-mono">From ${srv.baseCost}</span>
                </button>
              ))}
            </div>

            {/* Display Estimates */}
            {selectedServices.length > 0 ? (
              <div className="border-t border-border-custom/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-10">
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#666666] uppercase block">
                      Estimated Cost (10% bundle discount applied)
                    </span>
                    <span className="text-3xl font-bold font-mono text-white mt-1.5 block">
                      ${estimate.cost}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#666666] uppercase block">
                      Estimated Delivery Timeline
                    </span>
                    <span className="text-3xl font-bold font-mono text-accent-custom mt-1.5 block">
                      {estimate.time}
                    </span>
                  </div>
                </div>

                <a
                  href="/contact"
                  className="bg-white text-black hover:bg-accent-custom hover:text-white px-6 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
                >
                  Book Proposal
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ) : (
              <div className="border-t border-border-custom/50 pt-8 text-center text-xs font-mono text-[#666666]">
                Select one or more scope options above to generate a projection.
              </div>
            )}

          </div>
        </section>
      </main>
      <FooterSection />
    </>
  );
}
