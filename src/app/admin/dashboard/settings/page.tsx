"use client";

import React from "react";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-10 text-left">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-8 h-8 text-accent-custom" />
          Settings
        </h1>
        <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
          Global application settings and configurations.
        </p>
      </div>

      <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] p-12 rounded-xl text-center shadow-sm">
        <p className="text-sm text-gray-500 dark:text-[#B0B0B0] font-mono">Settings configuration coming soon.</p>
      </div>
    </div>
  );
}
