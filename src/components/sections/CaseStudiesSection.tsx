"use client";

import React, { useRef, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GRADIENT_COLORS = [
  "from-blue-600/30 to-purple-800/30",
  "from-cyan-600/30 to-emerald-800/30",
  "from-pink-600/30 to-purple-900/30",
  "from-indigo-600/30 to-blue-900/30",
  "from-violet-600/30 to-fuchsia-800/30",
  "from-teal-600/30 to-cyan-900/30",
];

const SPAN_PATTERN = [
  "lg:col-span-8", "lg:col-span-4",
  "lg:col-span-4", "lg:col-span-8",
];

export default function CaseStudiesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [projects, setProjects] = useState<any[]>([]);

  const fallbackProjects = [
    {
      title: "Intellect CRM System",
      client: "Vortex Analytics",
      year: "2026",
      services_used: ["AI Agents", "CRM Sync"],
      slug: "vortex-agent-support-node"
    },
    {
      title: "Aether Data Farms",
      client: "Aether Holdings",
      year: "2025",
      services_used: ["Scraping", "Lead Gen"],
      slug: "apex-lead-automator"
    },
    {
      title: "Helios SaaS Platform",
      client: "Helios Energy",
      year: "2025",
      services_used: ["Next.js Web Application"],
      slug: "vortex-agent-support-node"
    },
    {
      title: "Apex Outbound Automator",
      client: "Apex Growth",
      year: "2026",
      services_used: ["Email Automation", "SEO"],
      slug: "apex-lead-automator"
    }
  ];

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/public/portfolio`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setProjects(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch portfolio, using fallback", err);
      }
      setProjects(fallbackProjects);
    };
    fetchPortfolio();
  }, []);

  const mappedProjects = projects.map((p: any, idx: number) => ({
    title: p.title,
    client: p.client || "Client",
    year: p.year ? String(p.year) : "2025",
    services: (p.services_used || []).join(" & ") || "Software Development",
    gradient: GRADIENT_COLORS[idx % GRADIENT_COLORS.length],
    span: SPAN_PATTERN[idx % SPAN_PATTERN.length],
    slug: p.slug || "project",
  }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray(".parallax-bg");
      images.forEach((img: any) => {
        gsap.fromTo(
          img,
          { yPercent: -15 },
          {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: img.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true
            }
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, [mappedProjects]);

  return (
    <section
      id="work"
      ref={containerRef}
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        
        {/* Header */}
        <div className="max-w-3xl mb-24 text-left">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
              Case Studies
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <SplitText text="Selected Case Studies & Projects." type="words" />
          </h2>
          <p className="text-lg text-secondary-custom leading-relaxed max-w-xl">
            A hand-picked selection of high-performance products built to scale operations and maximize revenue loops.
          </p>
        </div>

        {/* Case Studies Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          {mappedProjects.map((project, idx) => (
            <a
              href={`/portfolio/${project.slug}`}
              key={idx}
              className={`${project.span} group border border-border-custom bg-surface/30 backdrop-blur-md rounded-2xl aspect-[4/3] lg:aspect-auto lg:h-[480px] overflow-hidden flex flex-col justify-between p-8 md:p-10 relative cursor-pointer hover:border-accent-custom/40 transition-all duration-500`}
            >
              {/* Parallax Background Gradient Grid */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl bg-surface/50">
                <div
                  className={`parallax-bg absolute -inset-[20%] bg-gradient-to-tr ${project.gradient} transition-transform duration-700 group-hover:scale-105 will-change-transform`}
                />
                {/* Dimming overlay placed under the grid */}
                <div className="absolute inset-0 bg-background/70" />
                {/* Visual grid overlay placed on top for texture */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />
              </div>

              {/* Card Header (Year & Services) */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-secondary-custom uppercase tracking-wider bg-background/50 backdrop-blur-md px-3 py-1 rounded border border-border-custom/50">
                  {project.services}
                </span>
                <span className="text-xs font-bold font-mono text-secondary-custom bg-background/50 backdrop-blur-md px-3 py-1 rounded border border-border-custom/50">
                  {project.year}
                </span>
              </div>

              {/* Card Footer (Title & Client) */}
              <div className="relative z-10 flex items-end justify-between border-t border-border-custom/50 pt-8 mt-12 bg-gradient-to-t from-background/30 to-transparent">
                <div>
                  <span className="text-xs font-medium uppercase tracking-wider text-secondary-custom mb-1 block">
                    {project.client}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground transition-all group-hover:text-accent-custom group-hover:translate-x-1 duration-300">
                    {project.title}
                  </h3>
                </div>
                
                {/* Arrow Icon */}
                <div className="w-12 h-12 rounded-full border border-border-custom bg-background/50 flex items-center justify-center text-foreground group-hover:bg-accent-custom group-hover:text-white group-hover:border-accent-custom transition-all duration-300 shadow-md">
                  <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
