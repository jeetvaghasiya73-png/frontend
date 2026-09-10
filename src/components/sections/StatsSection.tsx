"use client";

import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function Counter({ end, duration = 1.5 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const scrollTriggerInstance = ScrollTrigger.create({
      trigger: elementRef.current,
      start: "top 85%",
      onEnter: () => {
        let obj = { val: 0 };
        gsap.to(obj, {
          val: end,
          duration: duration,
          ease: "power2.out",
          onUpdate: () => {
            setCount(Math.floor(obj.val));
          }
        });
      }
    });

    return () => {
      scrollTriggerInstance.kill();
    };
  }, [end, duration]);

  return <span ref={elementRef}>{count}</span>;
}

export default function StatsSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={containerRef}
      className="py-32 bg-surface/10 border-y border-border-custom relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Editorial Typography */}
        <div className="text-left">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
              Performance Metrics
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <SplitText text="Empirical Scale. Measured in Real-Time." type="words" />
          </h2>
          <p className="text-lg text-secondary-custom leading-relaxed max-w-xl">
            We don't build standard software, we engineer measurable leverage. Our clients scale operations, reduce server costs, and unlock growth loops.
          </p>
        </div>

        {/* Right Side: Animated Counters */}
        <div className="grid grid-cols-2 gap-8 md:gap-12">
          
          <div className="p-6 md:p-8 rounded-xl border border-border-custom bg-surface/30 backdrop-blur-md">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono">
              <Counter end={500} />+
            </div>
            <div className="text-xs uppercase tracking-wider text-secondary-custom font-semibold mt-4">
              Enterprise Projects
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-xl border border-border-custom bg-surface/30 backdrop-blur-md">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono">
              <Counter end={1000} />+
            </div>
            <div className="text-xs uppercase tracking-wider text-secondary-custom font-semibold mt-4">
              Active Automations
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-xl border border-border-custom bg-surface/30 backdrop-blur-md">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono">
              <Counter end={10} />M+
            </div>
            <div className="text-xs uppercase tracking-wider text-secondary-custom font-semibold mt-4">
              Database Records
            </div>
          </div>

          <div className="p-6 md:p-8 rounded-xl border border-border-custom bg-surface/30 backdrop-blur-md">
            <div className="text-4xl md:text-5xl font-bold tracking-tight text-foreground font-mono">
              <Counter end={98} />%
            </div>
            <div className="text-xs uppercase tracking-wider text-secondary-custom font-semibold mt-4">
              Success Audit
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
