"use client";

import React from "react";
import {
  MessageSquareX,
  ClockAlert,
  Shuffle,
  Repeat,
  PhoneOff,
  SearchX,
  AlertTriangle,
} from "lucide-react";

const problems = [
  {
    icon: SearchX,
    title: "Sifting Through Endless Chats",
    desc: "Opening dozens of individual WhatsApp conversations just to find the two prospects who responded with buying interest.",
  },
  {
    icon: ClockAlert,
    title: "Delayed Speed-to-Lead",
    desc: "When hot prospects reply, manual delays in spotting the message allow potential clients to lose interest or choose a competitor.",
  },
  {
    icon: Shuffle,
    title: "Three-Screen Chaos",
    desc: "Constantly toggling between spreadsheet lists, WhatsApp Web windows, and telephone dialers to make follow-up calls.",
  },
  {
    icon: Repeat,
    title: "Repetitive Initial Responses",
    desc: "Spending hours typing the exact same welcome notes and qualification questions instead of talking to ready buyers.",
  },
  {
    icon: PhoneOff,
    title: "Telecallers Flying Blind",
    desc: "Sales callers dialing leads with zero immediate visibility into what was already discussed over WhatsApp messages.",
  },
  {
    icon: MessageSquareX,
    title: "Account Safety Risks",
    desc: "Blasting bulk messages without pacing controls or spam monitoring, leading to banned accounts and lost numbers.",
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 border-t border-border-custom bg-surface/30 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>The Manual WhatsApp Bottleneck</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
            WhatsApp Converts Leads Fast.{" "}
            <span className="text-secondary-custom font-normal">
              Managing Them Manually Doesn't.
            </span>
          </h2>
          <p className="text-secondary-custom text-base sm:text-lg leading-relaxed">
            Businesses spend excessive time manually checking conversations, hunting for interested replies, and coordinating phone follow-ups across disconnected tools.
          </p>
        </div>

        {/* Problem Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-border-custom bg-surface p-6 sm:p-7 transition-all duration-300 hover:border-border-custom hover:shadow-lg group"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-200">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-secondary-custom text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
