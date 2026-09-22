import React from "react";

export default function Loading() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9998] bg-background flex flex-col justify-start overflow-hidden select-none pointer-events-none"
    >
      {/* Skeleton Header Navbar (matching capsule pill layout) */}
      <div className="w-full pt-3.5 px-4 sm:px-6 md:px-12 flex justify-center">
        <div className="w-full max-w-5xl h-12 rounded-full border border-border-custom/80 bg-surface/80 px-4 sm:px-6 flex items-center justify-between shadow-2xs">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full skeleton-pulse shrink-0" />
            <div className="w-20 h-4 rounded-md skeleton-pulse" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="w-14 h-3.5 rounded-sm skeleton-pulse" />
            <div className="w-14 h-3.5 rounded-sm skeleton-pulse" />
            <div className="w-20 h-3.5 rounded-sm skeleton-pulse" />
            <div className="w-14 h-3.5 rounded-sm skeleton-pulse" />
            <div className="w-12 h-3.5 rounded-sm skeleton-pulse" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full skeleton-pulse" />
            <div className="hidden sm:block w-24 h-7 rounded-full skeleton-pulse" />
            <div className="md:hidden w-8 h-8 rounded-full skeleton-pulse" />
          </div>
        </div>
      </div>

      {/* Diode Bar Placeholder */}
      <div className="w-full border-b border-border-custom bg-surface/30 py-2 px-4 mt-3 hidden sm:flex justify-center">
        <div className="w-[480px] max-w-full h-3 rounded-full skeleton-pulse" />
      </div>

      {/* Hero Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center pt-6 pb-6 flex-1">
        {/* Left Column */}
        <div className="lg:col-span-7 flex flex-col items-start gap-4">
          <div className="w-48 h-6 rounded-full skeleton-pulse mb-1" />

          <div className="w-full flex flex-col gap-2.5 max-w-2xl">
            <div className="w-11/12 h-10 sm:h-12 md:h-14 rounded-lg skeleton-pulse" />
            <div className="w-4/5 h-10 sm:h-12 md:h-14 rounded-lg skeleton-pulse" />
            <div className="w-2/3 h-7 sm:h-9 rounded-md skeleton-pulse opacity-75 mt-1" />
          </div>

          <div className="w-full max-w-lg flex flex-col gap-2 mt-2">
            <div className="w-full h-4 rounded-sm skeleton-pulse opacity-80" />
            <div className="w-4/5 h-4 rounded-sm skeleton-pulse opacity-80" />
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <div className="w-24 h-6 rounded-sm skeleton-pulse" />
            <div className="w-28 h-6 rounded-sm skeleton-pulse" />
            <div className="w-24 h-6 rounded-sm skeleton-pulse" />
            <div className="w-32 h-6 rounded-sm skeleton-pulse" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-3">
            <div className="w-full sm:w-44 h-11 rounded-full skeleton-pulse" />
            <div className="w-full sm:w-36 h-11 rounded-full skeleton-pulse" />
          </div>
        </div>

        {/* Right Column: 3D Orb Placeholder */}
        <div className="lg:col-span-5 w-full flex justify-center items-center">
          <div className="w-full max-w-[380px] aspect-square rounded-3xl border border-border-custom/60 bg-surface/20 skeleton-pulse flex items-center justify-center relative p-8">
            <div className="w-36 h-36 rounded-2xl border border-border-custom/40 bg-surface/30 skeleton-pulse" />
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 w-full grid grid-cols-2 lg:grid-cols-4 gap-3 pb-8 hidden sm:grid">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-[105px] border border-border-custom/70 bg-surface/60 rounded-md p-4 flex flex-col justify-between"
          >
            <div className="w-20 h-3 rounded-xs skeleton-pulse" />
            <div className="w-28 h-7 rounded-sm skeleton-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
