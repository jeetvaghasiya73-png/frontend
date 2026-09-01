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
}

export default function SplitText({
  text,
  type,
  className = "",
  delay = 0,
  triggerOnce = true,
}: SplitTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Check for reduced motion settings
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const elements = containerRef.current.querySelectorAll(".split-item");

    gsap.fromTo(
      elements,
      {
        y: "110%",
        opacity: 0,
        rotateX: 15,
      },
      {
        y: "0%",
        opacity: 1,
        rotateX: 0,
        duration: 0.8,
        stagger: type === "chars" ? 0.015 : 0.04,
        ease: "power3.out",
        delay,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 90%",
          toggleActions: triggerOnce
            ? "play none none none"
            : "play reverse play reverse",
        },
      }
    );
  }, [type, delay, triggerOnce]);

  if (type === "chars") {
    return (
      <span ref={containerRef} className={`inline-flex flex-wrap leading-tight ${className}`}>
        {text.split("").map((char, index) => (
          <span
            key={index}
            className="inline-block overflow-hidden char-reveal-parent"
            style={{ perspective: "1000px" }}
          >
            <span className="inline-block split-item transform-gpu origin-top-left">
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
          style={{ perspective: "1000px" }}
        >
          <span className="inline-block split-item transform-gpu origin-top-left">
            {word}
          </span>
        </span>
      ))}
    </span>
  );
}
