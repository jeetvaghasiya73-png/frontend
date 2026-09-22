import React from "react";

export default function DashboardLoading() {
  return (
    <div
      aria-hidden="true"
      className="space-y-6 text-left pb-20 font-sans antialiased w-full max-w-full overflow-hidden select-none pointer-events-none"
    >
      {/* Header bar skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom/50 pb-5">
        <div className="space-y-2">
          <div className="w-56 h-7 rounded-md skeleton-pulse" />
          <div className="w-72 h-4 rounded-sm skeleton-pulse opacity-70" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-28 h-9 rounded-md skeleton-pulse" />
          <div className="w-24 h-9 rounded-md skeleton-pulse" />
        </div>
      </div>

      {/* KPI 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="border border-border-custom/80 bg-surface/60 rounded-xl p-5 space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="w-24 h-3.5 rounded-xs skeleton-pulse" />
              <div className="w-7 h-7 rounded-lg skeleton-pulse" />
            </div>
            <div className="w-32 h-8 rounded-md skeleton-pulse" />
            <div className="w-40 h-3 rounded-xs skeleton-pulse opacity-60" />
          </div>
        ))}
      </div>

      {/* Analytics Chart Strip Skeleton */}
      <div className="border border-border-custom/80 bg-surface/60 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-44 h-4 rounded-sm skeleton-pulse" />
          <div className="w-32 h-4 rounded-sm skeleton-pulse" />
        </div>
        <div className="w-full h-44 rounded-lg skeleton-pulse opacity-50" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="w-full md:w-80 h-10 rounded-lg skeleton-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-28 h-10 rounded-lg skeleton-pulse" />
          <div className="w-28 h-10 rounded-lg skeleton-pulse" />
          <div className="w-24 h-10 rounded-lg skeleton-pulse" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="border border-border-custom/80 bg-surface/60 rounded-xl overflow-hidden shadow-xs">
        {/* Table Head */}
        <div className="h-11 border-b border-border-custom/60 bg-surface-alt/40 px-4 flex items-center gap-6">
          <div className="w-4 h-4 rounded-xs skeleton-pulse" />
          <div className="w-32 h-3.5 rounded-xs skeleton-pulse" />
          <div className="w-28 h-3.5 rounded-xs skeleton-pulse hidden sm:block" />
          <div className="w-24 h-3.5 rounded-xs skeleton-pulse hidden md:block" />
          <div className="w-20 h-3.5 rounded-xs skeleton-pulse hidden lg:block" />
          <div className="w-16 h-3.5 rounded-xs skeleton-pulse ml-auto" />
        </div>

        {/* 6 Table Rows */}
        <div className="divide-y divide-border-custom/40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 px-4 flex items-center gap-6">
              <div className="w-4 h-4 rounded-xs skeleton-pulse" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full skeleton-pulse shrink-0" />
                <div className="space-y-1">
                  <div className="w-32 h-3.5 rounded-xs skeleton-pulse" />
                  <div className="w-20 h-2.5 rounded-xs skeleton-pulse opacity-60" />
                </div>
              </div>
              <div className="w-28 h-3.5 rounded-xs skeleton-pulse hidden sm:block" />
              <div className="w-20 h-5 rounded-full skeleton-pulse hidden md:block" />
              <div className="w-24 h-3.5 rounded-xs skeleton-pulse hidden lg:block" />
              <div className="w-8 h-8 rounded-md skeleton-pulse ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
