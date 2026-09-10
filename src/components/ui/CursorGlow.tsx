"use client";

import React, { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const target = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (glowRef.current && glowRef.current.style.opacity === "0") {
        glowRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    // Smooth animation using requestAnimationFrame interpolation (lerp)
    let animationFrameId: number;
    const updateGlowPosition = () => {
      const lerpFactor = 0.08; // smooth delay
      current.current.x += (target.current.x - current.current.x) * lerpFactor;
      current.current.y += (target.current.y - current.current.y) * lerpFactor;
      
      if (glowRef.current) {
        // Use translate3d for hardware acceleration instead of top/left
        glowRef.current.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
      }
      animationFrameId = requestAnimationFrame(updateGlowPosition);
    };

    // Set initial state
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
      glowRef.current.style.transition = "opacity 0.3s ease";
    }

    animationFrameId = requestAnimationFrame(updateGlowPosition);

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
