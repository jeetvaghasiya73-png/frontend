"use client";

import React, { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });

  useEffect(() => {
    let isRunning = false;
    let animationFrameId: number;

    const updateGlowPosition = () => {
      const dx = target.current.x - current.current.x;
      const dy = target.current.y - current.current.y;
      
      current.current.x += dx * 0.12;
      current.current.y += dy * 0.12;
      
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${current.current.x - 150}px, ${current.current.y - 150}px, 0)`;
      }

      // Continue animating while moving; sleep when settled to save CPU cycles
      if (Math.abs(dx) > 0.15 || Math.abs(dy) > 0.15) {
        animationFrameId = requestAnimationFrame(updateGlowPosition);
      } else {
        isRunning = false;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current && glowRef.current.style.opacity === "0") {
        glowRef.current.style.opacity = "1";
      }
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(updateGlowPosition);
      }
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave);

    // Set initial state
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
      glowRef.current.style.transition = "opacity 0.3s ease";
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="cursor-glow hidden md:block"
      style={{
        top: 0,
        left: 0,
        pointerEvents: "none",
        position: "fixed",
        zIndex: 9999,
        willChange: "transform"
      }}
    />
  );
}
