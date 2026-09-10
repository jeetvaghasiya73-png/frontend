"use client";

import React, { useRef, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { Star, ArrowLeft, ArrowRight, Quote } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

export default function TestimonialsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  const fallbackTestimonials = [
    {
      name: "Sarah Jenkins",
      role: "VP of Operations",
      company: "Vortex Analytics",
      content: "Nexora AI completely transformed our customer lifecycle. Their autonomous agents now handle 80% of incoming requests with zero human intervention. Absolutely stellar engineering.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "CTO",
      company: "CloudForge",
      content: "Building our custom AI scheduling pipeline with Nexora AI saved us hundreds of engineering hours. The code is exceptionally clean, type-safe, and scalable.",
      rating: 5
    },
    {
      name: "Helena Ross",
      role: "Director of Marketing",
      company: "Apex Group",
      content: "The programmatic SEO platform Nexora AI developed for us drove an increase of 250% in organic traffic within just three months. They are true frontend and backend masters.",
      rating: 5
    }
  ];

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch(`${API_URL}/api/v1/public/testimonials`);
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setTestimonials(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch testimonials, using fallback", err);
      }
      setTestimonials(fallbackTestimonials);
    };
    fetchTestimonials();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 400;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth"
    });
  };

  return (
    <section
      id="testimonials"
      className="py-32 bg-background relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
                Endorsements
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              <SplitText text="Trusted by Leading Innovators." type="words" />
            </h2>
            <p className="text-sm md:text-base text-secondary-custom leading-relaxed">
              Read how scaling tech departments and startups leverage our software architectures to drive business results.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="w-12 h-12 rounded-lg border border-border-custom bg-surface hover:bg-accent-custom hover:text-white hover:border-accent-custom flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm"
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-12 h-12 rounded-lg border border-border-custom bg-surface hover:bg-accent-custom hover:text-white hover:border-accent-custom flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal scroll cards */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 scrollbar-none snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          {testimonials.map((test, idx) => (
            <div
              key={idx}
              className="min-w-full md:min-w-[480px] snap-start border border-border-custom bg-surface/30 backdrop-blur-md rounded-2xl p-8 md:p-10 flex flex-col justify-between hover:border-accent-custom/50 transition-all duration-500 relative overflow-hidden group"
            >
              {/* Quote icon watermark */}
              <Quote className="absolute -top-6 -right-6 w-32 h-32 text-border-custom opacity-15 transform rotate-12" />

              <div>
                {/* Rating stars */}
                <div className="flex gap-1.5 mb-6 text-yellow-400">
                  {Array.from({ length: test.rating || 5 }).map((_, rIdx) => (
                    <Star key={rIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Content */}
                <p className="text-foreground/90 text-base md:text-lg italic leading-relaxed mb-8 relative z-10">
                  "{test.content}"
                </p>
              </div>

              {/* Author Info */}
              <div className="border-t border-border-custom/50 pt-6 flex items-center gap-4 relative z-10 bg-gradient-to-t from-background/10 to-transparent">
                <div className="w-10 h-10 rounded-full bg-accent-custom/10 text-accent-custom flex items-center justify-center font-bold text-sm border border-accent-custom/20">
                  {test.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold tracking-tight text-foreground">
                    {test.name}
                  </h4>
                  <span className="text-[10px] uppercase tracking-wider text-secondary-custom font-medium mt-0.5 block">
                    {test.role} at <span className="text-accent-custom">{test.company}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
