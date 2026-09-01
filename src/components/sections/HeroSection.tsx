"use client";

import React, { useRef, useEffect } from "react";
import { ArrowRight, Play, Cpu, Layers, ShieldCheck, Zap } from "lucide-react";
import { gsap } from "gsap";
import SplitText from "@/components/animations/SplitText";
import dynamic from "next/dynamic";

const ThreeHeroObject = dynamic(() => import("@/components/ui/ThreeHeroObject"), { ssr: false });

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const stats = [
    {
      num: "500+",
      label: "Projects Delivered",
      // Custom SVG path representing the mockup's line chart wave
      sparkline: "M0,25 Q15,5 30,22 T60,8 T90,28 T120,5 T150,15 T180,5 T210,25",
      color: "stroke-blue-500 shadow-blue-500/20"
    },
    {
      num: "1000+",
      label: "Automations Built",
      sparkline: "M0,15 Q20,30 40,10 T80,25 T120,5 T160,20 T200,10 T240,18",
      color: "stroke-purple-500 shadow-purple-500/20"
    },
    {
      num: "10M+",
      label: "Records Processed",
      sparkline: "M0,28 Q15,8 30,20 T60,28 T90,8 T120,22 T150,5 T180,28 T210,12",
      color: "stroke-cyan-500 shadow-cyan-500/20"
    },
    {
      num: "98%",
      label: "Success Rate",
      sparkline: "M0,10 Q25,5 50,22 T100,8 T150,28 T200,10 T250,5",
      color: "stroke-emerald-500 shadow-emerald-500/20"
    }
  ];

  const valueProps = [
    {
      title: "Custom AI Solutions",
      desc: "Tailored AI systems built for your unique business needs.",
      icon: Cpu,
      color: "from-purple-500/20 to-indigo-500/5 border-purple-500/30 text-purple-400"
    },
    {
      title: "Scalable Architecture",
      desc: "Future-proof solutions designed to grow with your business.",
      icon: Layers,
      color: "from-blue-500/20 to-cyan-500/5 border-blue-500/30 text-blue-400"
    },
    {
      title: "Secure & Reliable",
      desc: "Enterprise-grade security with 99.9% uptime guarantee.",
      icon: ShieldCheck,
      color: "from-indigo-500/20 to-blue-500/5 border-indigo-500/30 text-indigo-400"
    },
    {
      title: "Fast & Efficient",
      desc: "Automate workflows and save hundreds of hours every month.",
      icon: Zap,
      color: "from-cyan-500/20 to-teal-500/5 border-cyan-500/30 text-cyan-400"
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-element-fade",
        { opacity: 0, y: 15, willChange: "transform, opacity" },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.1 }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center overflow-hidden grid-bg pt-20"
    >
      {/* Top Announcement Bar */}
      <div className="w-full border-b border-border-custom bg-surface/30 backdrop-blur-md py-2.5 px-4 text-center z-20 overflow-hidden">
        <p className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-widest font-mono font-bold text-secondary-custom flex items-center justify-center gap-1.5 whitespace-nowrap">
          <span className="truncate">We build AI systems that automate, scale, and grow your business.</span>
          <a href="/contact" className="text-accent-custom hover:underline inline-flex items-center gap-1 shrink-0">
            Work with us <ArrowRight className="w-3 h-3" />
          </a>
        </p>
      </div>

      {/* Main Viewport Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[85vh] py-12 z-10">
        
        {/* Left Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          {/* Badge */}
          <div className="hero-element-fade inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-custom animate-ping" />
            <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-secondary-custom">
              Enterprise AI Automation
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-6xl xl:text-7xl font-bold tracking-tight mb-8">
            <SplitText text="Build Intelligent AI Systems That" type="words" />
            <span className="block mt-2 bg-gradient-to-r from-accent-custom via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              <SplitText text="Scale Your Business." type="words" />
            </span>
          </h1>

          {/* Description */}
          <p className="hero-element-fade text-base md:text-lg text-secondary-custom max-w-xl mb-10 leading-relaxed">
            We design enterprise AI automation, websites, custom software,
            intelligent agents, APIs, SEO systems, and advanced data scraping solutions that drive real results.
          </p>

          {/* CTA Buttons */}
          <div className="hero-element-fade flex flex-row flex-nowrap gap-2 sm:gap-4 w-full mb-16">
            <a
              href="/contact"
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs uppercase tracking-wider font-bold bg-accent-custom text-white hover:bg-blue-600 px-2 sm:px-7 py-3.5 sm:py-4 rounded-md shadow-lg shadow-blue-500/20 transition-all duration-300 group text-center whitespace-nowrap"
            >
              Book Strategy Call
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>
            <a
              href="/services"
              className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold border border-border-custom bg-surface/50 hover:bg-surface text-foreground px-2 sm:px-7 py-3.5 sm:py-4 rounded-md transition-all duration-300 group text-center whitespace-nowrap"
            >
              <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current text-secondary-custom group-hover:text-accent-custom transition-colors shrink-0" />
              Explore Services
            </a>
          </div>
        </div>

        {/* Right 3D Visual Mesh Canvas */}
        <div className="lg:col-span-5 w-full flex justify-center items-center relative min-h-[420px] lg:min-h-[580px]">
          <ThreeHeroObject />
        </div>

      </div>

      {/* Asymmetric Statistics Cards with wave line graphs */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12 z-10">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="hero-element-fade border border-border-custom bg-surface/30 backdrop-blur-md p-6 rounded-xl flex flex-col justify-between relative overflow-hidden h-[130px] hover:border-accent-custom/50 hover:shadow-[0_0_15px_var(--accent-glow)] transition-all duration-500 group"
          >
            <div>
              <span className="text-[10px] uppercase font-bold font-mono tracking-wider text-secondary-custom block">
                {stat.label}
              </span>
              <span className="text-3xl md:text-4xl font-bold font-mono mt-3 block text-foreground">
                {stat.num}
              </span>
            </div>

            {/* Glowing SVG Wave Sparkline Graph */}
            <div className="absolute bottom-0 left-0 w-full h-[35px] pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300">
              <svg className="w-full h-full" viewBox="0 0 240 35" fill="none" preserveAspectRatio="none">
                <path
                  d={stat.sparkline}
                  className={`fill-none stroke-2 ${stat.color} transition-all duration-500`}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll to Explore Mouse Icon */}
      <div className="hero-element-fade py-8 flex flex-col items-center gap-2 select-none pointer-events-none z-10">
        <div className="w-6 h-10 rounded-full border-2 border-border-custom flex justify-center p-1.5">
          <div className="w-1 h-2 rounded-full bg-accent-custom animate-[bounce_2s_infinite]" />
        </div>
        <span className="text-[8px] font-mono uppercase tracking-widest text-secondary-custom mt-1">
          Scroll to explore
        </span>
      </div>

      {/* Core Value Propositions Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-16 z-10 border-t border-border-custom">
        {valueProps.map((prop, idx) => {
          const Icon = prop.icon;
          return (
            <div
              key={idx}
              className="hero-element-fade border border-border-custom bg-surface/20 backdrop-blur-md p-6 rounded-xl text-left flex flex-col justify-between h-[180px] hover:border-accent-custom/30 hover:bg-surface/30 transition-all duration-300 group"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-tr ${prop.color} border flex items-center justify-center`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-accent-custom transition-colors duration-300">
                  {prop.title}
                </h3>
                <p className="text-secondary-custom text-xs mt-1.5 leading-relaxed font-medium">
                  {prop.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
}
