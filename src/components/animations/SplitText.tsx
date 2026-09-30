"use client";

import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Ensure ScrollTrigger is registered
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SplitTextProps {
  text: string;
  type: "chars" | "words";
  className?: string;
  delay?: number;
  triggerOnce?: boolean;
  useScrollTrigger?: boolean;
}

export default function SplitText({
  text,
  type,
  className = "",
  delay = 0,
  triggerOnce = true,
  useScrollTrigger = true,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion settings
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const elements = containerRef.current?.querySelectorAll(".split-item");
      if (!elements || elements.length === 0) return;

      const tweenVars: gsap.TweenVars = {
        y: "0%",
        opacity: 1,
        duration: 0.55,
        stagger: type === "chars" ? 0.01 : 0.02,
        ease: "power2.out",
        delay,
      };

      if (useScrollTrigger) {
        tweenVars.scrollTrigger = {
          trigger: containerRef.current,
          start: "top 92%",
          toggleActions: triggerOnce
            ? "play none none none"
            : "play reverse play reverse",
        };
      }

      gsap.fromTo(
        elements,
        {
          y: "100%",
          opacity: 0,
        },
        tweenVars
      );
    }, containerRef);

    return () => ctx.revert();
  }, [type, delay, triggerOnce, useScrollTrigger]);

  if (type === "chars") {
    return (
      <span ref={containerRef} className={`inline-flex flex-wrap leading-tight ${className}`}>
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="inline-block overflow-hidden char-reveal-parent"
          >
            <span className="inline-block split-item">
              {char === " " ? "\u00A0" : char}
            </span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <span ref={containerRef} className={`inline-flex flex-wrap leading-tight ${className}`}>
      {text.split(" ").map((word, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden char-reveal-parent mr-[0.25em]"
        >
          <span className="inline-block split-item">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
