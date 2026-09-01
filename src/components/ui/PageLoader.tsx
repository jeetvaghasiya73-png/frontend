"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    // Start fade-out after a short delay to allow content to render
    const fadeTimer = setTimeout(() => setFadeOut(true), 300);
    // Remove from DOM after fade animation completes
    const removeTimer = setTimeout(() => setVisible(false), 700);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible || pathname.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-background flex flex-col transition-opacity duration-400 ${
        fadeOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Skeleton Navbar */}
      <div className="w-full px-6 md:px-12 py-5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg skeleton-pulse" />
          <div className="w-24 h-5 skeleton-pulse" />
        </div>
        <div className="hidden lg:flex items-center gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-14 h-4 skeleton-pulse" />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg skeleton-pulse" />
          <div className="hidden sm:block w-40 h-10 rounded-md skeleton-pulse" />
        </div>
      </div>

      {/* Skeleton Announcement Bar */}
      <div className="w-full border-b border-border-custom py-3 px-4 flex justify-center">
        <div className="w-[450px] max-w-full h-3 skeleton-pulse" />
      </div>

      {/* Skeleton Hero Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1 py-12">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Badge */}
          <div className="w-52 h-7 rounded-full skeleton-pulse" />

          {/* Heading lines */}
          <div className="flex flex-col gap-3">
            <div className="w-full max-w-lg h-12 md:h-16 skeleton-pulse" />
            <div className="w-4/5 max-w-md h-12 md:h-16 skeleton-pulse" />
            <div className="w-3/5 max-w-sm h-10 md:h-14 skeleton-pulse" />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="w-full max-w-xl h-4 skeleton-pulse" />
            <div className="w-4/5 max-w-lg h-4 skeleton-pulse" />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 h-14 rounded-md skeleton-pulse" />
            <div className="flex-1 h-14 rounded-md skeleton-pulse" />
          </div>

          {/* Trusted companies */}
          <div className="flex flex-col gap-3 mt-6">
            <div className="w-48 h-3 skeleton-pulse" />
            <div className="flex gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-16 h-3 skeleton-pulse" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column — 3D placeholder */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div className="w-full aspect-square max-w-[400px] rounded-2xl skeleton-pulse opacity-40" />
        </div>
      </div>
    </div>
  );
}
