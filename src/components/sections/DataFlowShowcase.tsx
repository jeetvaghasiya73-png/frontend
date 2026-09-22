"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  TrendingUp,
  Globe,
  Database,
  Bot,
  CheckCircle2,
  ArrowUpRight,
  Star,
  MapPin,
  Gauge,
  Check,
  Activity,
  RefreshCw,
  Download,
  Radio
} from "lucide-react";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const blueprints = [
  {
    id: "seo",
    stepNum: "01",
    tabLabel: "Local SEO & Maps",
    badge: "Search Dominance",
    title: "Google Maps Top 3 Pack Ranking",
    subtitle: "Capture daily high-intent local customers actively searching in your city.",
    icon: TrendingUp,
    timeline: "2–3 weeks launch",
    accentColor: "emerald",
    deliverables: [
      "Google Business Profile Comprehensive Audit & Keyword Overhaul",
      "Local Citation Sync & Geo-Grid Coverage Optimization",
      "Automated 5-Star Customer Review Collection Funnel",
      "Monthly Local Search Visibility & Competitor Tracking"
    ],
    clientBenefit: "Consistently rank in top 3 map positions for high-intent searches."
  },
  {
    id: "web",
    stepNum: "02",
    tabLabel: "Modern Web Dev",
    badge: "Conversion Platform",
    title: "High-Performance Business Websites",
    subtitle: "Ultra-fast, mobile-first websites engineered to turn visitors into booked clients.",
    icon: Globe,
    timeline: "3–4 weeks delivery",
    accentColor: "sky",
    deliverables: [
      "Mobile-First Responsive Wireframing & Clean Modern Layout",
      "Sub-Second Page Load Speeds (98+ Google Performance)",
      "High-Converting Inbound Consultation & Booking Forms",
      "Full Search Engine Indexing & On-Page SEO Structure"
    ],
    clientBenefit: "An authoritative storefront that builds credibility and converts."
  },
  {
    id: "scraping",
    stepNum: "03",
    tabLabel: "Web & Lead Scraping",
    badge: "Data Extraction",
    title: "Targeted Public Directory Scraping",
    subtitle: "Automated business lead lists gathered from public directories without manual effort.",
    icon: Database,
    timeline: "1–2 weeks setup",
    accentColor: "amber",
    deliverables: [
      "Automated Directory, Maps & Industry Listing Extraction",
      "Phone Number, Email & Business Address Verification",
      "Data Cleaning, Formatting & Duplicate Elimination",
      "Direct Export to Clean Spreadsheets or Your CRM"
    ],
    clientBenefit: "Eliminate hundreds of prospecting hours with verified lead records."
  },
  {
    id: "automation",
    stepNum: "04",
    tabLabel: "WhatsApp & Workflows",
    badge: "24/7 Operations",
    title: "24/7 WhatsApp & Lead Automations",
    subtitle: "Never let an inbound prospect wait or slip through the cracks.",
    icon: Bot,
    timeline: "1–2 weeks setup",
    accentColor: "purple",
    deliverables: [
      "Instant WhatsApp Reply to Inbound Customer Inquiries",
      "Automated Lead Qualification Questions & Flow",
      "Instant SMS & Email Alerts Directly to Your Team",
      "Centralized Lead Activity Tracking & Follow-Up Sync"
    ],
    clientBenefit: "Immediate 24/7 response time that turns cold inquiries into meetings."
  }
];

const accentMap: Record<string, string> = {
  emerald: "border-t-emerald-500",
  sky: "border-t-sky-500",
  amber: "border-t-amber-500",
  purple: "border-t-purple-500"
};
const iconColorMap: Record<string, string> = {
  emerald: "text-emerald-500",
  sky: "text-sky-500",
  amber: "text-amber-500",
  purple: "text-purple-500"
};
const checkColorMap: Record<string, string> = {
  emerald: "text-emerald-500",
  sky: "text-sky-500",
  amber: "text-amber-500",
  purple: "text-purple-500"
};
const dotColorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  sky: "bg-sky-500",
  amber: "bg-amber-500",
  purple: "bg-emerald-500"
};

export default function DataFlowShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState(0);
  const prevTabRef = useRef(0);

  // Interactive states
  const [speedScore, setSpeedScore] = useState(99);
  const [auditRunning, setAuditRunning] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">("desktop");
  const [scrapeRows, setScrapeRows] = useState([
    { name: "Apex Dental Group", city: "Austin, TX", phone: "+1 (512) 839-XXXX", status: "Verified" },
    { name: "Lone Star Roofing", city: "Dallas, TX", phone: "+1 (214) 771-XXXX", status: "Verified" },
    { name: "Vanguard HVAC & Air", city: "Houston, TX", phone: "+1 (713) 492-XXXX", status: "Verified" }
  ]);
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: "user", text: "Hi, I need an automated quote for my business services.", time: "10:42 AM" },
    { sender: "bot", text: "Hello! To prepare your custom quote, what city are you based in and which service do you need?", time: "10:42 AM" }
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);

  // Simple pinned scroll that just updates activeTab — no heavy timeline
  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    if (!section || !pinContainer) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        "(min-width: 1024px)": () => {
          const st = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "+=2400",
            pin: pinContainer,
            pinSpacing: true,
            scrub: false,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              const newIdx = Math.min(3, Math.floor(p * 4));
              setActiveTab((prev) => (prev !== newIdx ? newIdx : prev));
            }
          });
          return () => st.kill();
        }
      });
    }, section);

    return () => ctx.revert();
  }, []);

  // Click handler for tab navigation
  const handleTabClick = useCallback((idx: number) => {
    setActiveTab(idx);
    const section = sectionRef.current;
    if (!section || window.innerWidth < 1024) return;

    const st = ScrollTrigger.getAll().find((s) => s.trigger === section);
    if (st) {
      const target = st.start + ((idx + 0.5) / 4) * (st.end - st.start);
      window.scrollTo({ top: target, behavior: "smooth" });
    }
  }, []);

  const handleNavigateToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.href = "/contact";
  };

  // Interactive triggers
  const triggerSeoScan = () => {
    gsap.fromTo(".anim-radar-wave", { scale: 0.8, opacity: 1 }, { scale: 2.5, opacity: 0, duration: 0.9, ease: "power2.out" });
  };

  const triggerSpeedAudit = () => {
    if (auditRunning) return;
    setAuditRunning(true);
    setSpeedScore(65);
    gsap.to({}, {
      duration: 1,
      onUpdate: function () { setSpeedScore(Math.round(65 + this.progress() * 34)); },
      onComplete: () => { setAuditRunning(false); setSpeedScore(99); }
    });
  };

  const triggerScrapeExtraction = () => {
    if (isScrapingActive) return;
    setIsScrapingActive(true);
    setTimeout(() => {
      setScrapeRows((prev) => [
        { name: "Pinnacle Orthodontics", city: "Houston, TX", phone: "+1 (713) 552-XXXX", status: "Verified" },
        { name: "ClearSky Solar Inc.", city: "Austin, TX", phone: "+1 (512) 341-XXXX", status: "Verified" },
        ...prev
      ].slice(0, 4));
      setIsScrapingActive(false);
    }, 700);
  };

  const handleSendVisitorQuery = (queryText: string) => {
    if (isBotTyping) return;
    setChatMessages((prev) => [...prev, { sender: "user", text: queryText, time: "Just now" }]);
    setIsBotTyping(true);
    setTimeout(() => {
      let r = "We structure all deliverables with clear milestones and direct founder reviews.";
      if (queryText.includes("Quote")) r = "Direct quotes are customized to your project scope. Fill in the form below!";
      else if (queryText.includes("Consultation")) r = "We offer direct founder discovery sessions. Let's discuss your project!";
      else if (queryText.includes("Timeline")) r = "Most architectures launch within 14–28 days with full testing!";
      setChatMessages((prev) => [...prev, { sender: "bot", text: r, time: "Just now" }]);
      setIsBotTyping(false);
    }, 600);
  };

  const bp = blueprints[activeTab];
  const Icon = bp.icon;

  // Render the right-side widget based on active tab
  const renderWidget = () => {
    if (activeTab === 0) return (
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-border-custom pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Google Maps 3-Pack & Geo-Grid</span>
          </div>
          <button onClick={triggerSeoScan} className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-foreground bg-surface hover:bg-border-custom border border-border-custom px-2.5 py-1 rounded-xs cursor-pointer transition-colors">
            <Radio className="w-3.5 h-3.5 text-emerald-500" /><span>Ping Radar</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500 fill-emerald-500/20" /><div><div className="text-xs font-bold text-foreground">Your Local Business Profile</div><div className="text-[10px] text-secondary-custom">Verified Google Listing</div></div></div>
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-xs text-amber-500 font-bold text-[10px]"><Star className="w-3 h-3 fill-current" /><span>5.0 (140+)</span></div>
        </div>
        <div className="p-3 border border-border-custom rounded-xs bg-surface/60 space-y-2 relative">
          <div className="flex items-center justify-between text-[10px] text-secondary-custom"><span>5-Mile Radius Search Grid:</span><span className="text-emerald-500 font-bold">ALL #1 POSITIONS</span></div>
          <div className="grid grid-cols-3 gap-2 py-1 relative">
            <div className="anim-radar-wave absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full border border-emerald-500/40 pointer-events-none opacity-0" />
            {[{ pos: "#1", label: "Downtown" },{ pos: "#1", label: "West End" },{ pos: "#2", label: "Tech Hub" },{ pos: "#1", label: "Northside" },{ pos: "CTR", label: "HQ (You)", isCenter: true },{ pos: "#1", label: "East End" },{ pos: "#2", label: "Metro" },{ pos: "#1", label: "Airport" },{ pos: "#1", label: "Southside" }].map((n, i) => (
              <div key={i} className={`p-2 rounded-xs border text-center ${n.isCenter ? "border-emerald-500 bg-emerald-500/15 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)]" : "border-border-custom bg-background"}`}>
                <div className={`text-xs font-bold ${n.isCenter ? "text-emerald-500" : "text-foreground"}`}>{n.pos}</div>
                <div className="text-[8px] text-secondary-custom uppercase tracking-wider truncate">{n.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          {[["Inbound Calls", "+184%"],["Map Views", "14,200/mo"],["Review Funnel", "Automated"]].map(([l, v], i) => (
            <div key={i} className="p-2 border border-border-custom rounded-xs bg-surface"><div className="text-secondary-custom">{l}</div><div className="text-xs font-bold text-foreground mt-0.5">{v}</div></div>
          ))}
        </div>
      </div>
    );

    if (activeTab === 1) return (
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-border-custom pb-3">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" /><span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Lighthouse Performance Audit</span></div>
          <button onClick={triggerSpeedAudit} disabled={auditRunning} className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-foreground bg-surface hover:bg-border-custom border border-border-custom px-2.5 py-1 rounded-xs cursor-pointer transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 text-sky-500 ${auditRunning ? "animate-spin" : ""}`} /><span>{auditRunning ? "Testing..." : "Run Audit"}</span>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-sky-500" /><span className="font-bold text-foreground text-xs">Google Lighthouse Benchmark</span></div>
          <div className="flex gap-1">
            {(["desktop", "mobile"] as const).map((m) => (
              <button key={m} onClick={() => setDeviceMode(m)} className={`px-2 py-0.5 rounded-xs text-[10px] border cursor-pointer ${deviceMode === m ? "border-sky-500 bg-sky-500/10 text-sky-500 font-bold" : "border-border-custom text-secondary-custom"}`}>{m === "desktop" ? "Desktop" : "Mobile"}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center py-2">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="6" fill="none" className="text-border-custom" />
              <circle cx="50" cy="50" r="42" stroke="#0ea5e9" strokeWidth="6" fill="none" strokeDasharray="264" strokeDashoffset={264 - (speedScore / 100) * 252} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease-out" }} />
            </svg>
            <div className="absolute flex flex-col items-center"><span className="text-2xl font-bold text-foreground">{speedScore}</span><span className="text-[9px] text-secondary-custom uppercase">Score</span></div>
          </div>
        </div>
        <div className="space-y-1.5">
          {[["First Contentful Paint (FCP):", "0.38s (Top 1%)", "emerald", "98%"],["Largest Contentful Paint (LCP):", "0.62s", "sky", "95%"]].map(([l, v, c, w], i) => (
            <div key={i}>
              <div className="flex items-center justify-between text-[10px]"><span className="text-secondary-custom">{l}</span><span className={`text-${c}-500 font-bold`}>{v}</span></div>
              <div className="w-full bg-border-custom h-1 rounded-full overflow-hidden"><div className={`h-full bg-${c}-500 rounded-full`} style={{ width: w as string, transition: "width 0.6s ease-out" }} /></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
          {[["SEO Score", "100/100"],["Accessibility", "100/100"],["Best Practices", "100/100"]].map(([l, v], i) => (
            <div key={i} className="p-2 border border-border-custom rounded-xs bg-surface"><div className="text-secondary-custom">{l}</div><div className="text-xs font-bold text-foreground mt-0.5">{v}</div></div>
          ))}
        </div>
      </div>
    );

    if (activeTab === 2) return (
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-border-custom pb-3">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /><span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">Lead Extraction Stream</span></div>
          <button onClick={triggerScrapeExtraction} disabled={isScrapingActive} className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-foreground bg-surface hover:bg-border-custom border border-border-custom px-2.5 py-1 rounded-xs cursor-pointer transition-colors">
            <Download className={`w-3.5 h-3.5 text-amber-500 ${isScrapingActive ? "animate-bounce" : ""}`} /><span>{isScrapingActive ? "Extracting..." : "Extract Next"}</span>
          </button>
        </div>
        <div className="text-[10px] text-secondary-custom uppercase tracking-wider border-b border-border-custom pb-1 flex justify-between"><span>Company / Verified Contact</span><span>Status</span></div>
        <div className="space-y-2 text-[11px]">
          {scrapeRows.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center justify-between py-2 px-2.5 rounded-xs border border-border-custom/50 bg-surface/50">
              <div><div className="font-bold text-foreground">{row.name} <span className="text-[9px] text-secondary-custom">&bull; {row.city}</span></div><div className="text-[10px] text-secondary-custom">{row.phone}</div></div>
              <span className="text-emerald-500 font-bold text-[10px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-xs">{row.status}</span>
            </div>
          ))}
        </div>
        <div className="p-2.5 border border-border-custom rounded-xs bg-surface flex items-center justify-between text-[10px] text-secondary-custom"><span>Export: CSV / Excel / CRM</span><span className="text-foreground font-bold">2,480 Records</span></div>
      </div>
    );

    return (
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-border-custom pb-3">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">WhatsApp Auto-Responder</span></div>
          <span className="text-[10px] font-mono font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-xs">INSTANT 2s</span>
        </div>
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {chatMessages.map((msg, mIdx) => (
            <div key={mIdx} className={`p-2.5 rounded-md text-foreground max-w-[85%] space-y-0.5 ${msg.sender === "user" ? "bg-surface border border-border-custom mr-auto" : "bg-emerald-500/15 border border-emerald-500/30 ml-auto"}`}>
              <div className="text-[9px] text-secondary-custom flex items-center justify-between gap-2">
                <span className={msg.sender === "bot" ? "text-emerald-500 font-bold" : ""}>{msg.sender === "user" ? "Prospect" : "Bot (Instant)"}</span><span>{msg.time}</span>
              </div>
              <div className="text-[11px] leading-snug">{msg.text}</div>
            </div>
          ))}
          {isBotTyping && <div className="text-secondary-custom text-[10px] italic flex items-center gap-1.5 pl-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" /><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" /><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" /><span>Typing...</span></div>}
        </div>
        <div className="border-t border-border-custom pt-2.5 space-y-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-secondary-custom block">Test Bot Response:</span>
          <div className="flex flex-wrap gap-1.5">
            {["⚡ Request Fast Quote", "📅 Book Consultation", "⏱️ Delivery Timelines"].map((t, i) => (
              <button key={i} onClick={() => handleSendVisitorQuery(t)} disabled={isBotTyping} className="text-[10px] font-mono px-2.5 py-1.5 rounded-xs border border-border-custom bg-surface hover:border-foreground/30 text-foreground cursor-pointer transition-colors">{t}</button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section ref={sectionRef} id="execution" className="relative bg-background border-t border-border-custom text-left">
      <div ref={pinContainerRef} className="w-full min-h-screen py-14 sm:py-18 px-4 sm:px-6 md:px-12 flex flex-col justify-between max-w-7xl mx-auto relative">

        {/* Top Header */}
        <div className="w-full border-b border-border-custom pb-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1 rounded-full mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">[02] &bull; Service Execution Architecture</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
                <SplitText text="How We Deliver Tangible Value." type="words" />
              </h2>
            </div>
            <div className="flex items-center gap-1.5 bg-surface border border-border-custom px-2.5 py-1 rounded-xs text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
              <span className="text-foreground font-bold">STAGE 0{activeTab + 1} / 04</span>
            </div>
          </div>

          {/* Progress Bar — simple CSS transition, no GSAP needed */}
          <div className="w-full bg-border-custom h-[3px] mt-4 relative overflow-hidden rounded-full">
            <div className="absolute top-0 left-0 h-full bg-foreground rounded-full" style={{ width: `${((activeTab + 1) / 4) * 100}%`, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>

          {/* 4-Tab Navigation */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-3">
            {blueprints.map((item, idx) => {
              const isActive = idx === activeTab;
              return (
                <button key={item.id} onClick={() => handleTabClick(idx)} className={`p-2.5 rounded-md border text-left cursor-pointer flex items-center justify-between relative overflow-hidden group ${isActive ? "border-foreground bg-surface shadow-xs ring-1 ring-foreground/20" : "border-border-custom bg-background text-secondary-custom hover:text-foreground hover:border-foreground/30"}`} style={{ transition: "all 0.2s ease" }}>
                  <div>
                    <span className="text-[9px] font-mono uppercase tracking-widest block font-bold text-secondary-custom">STAGE [{item.stepNum}]</span>
                    <span className={`text-xs font-mono font-bold mt-0.5 block ${isActive ? "text-foreground" : "text-secondary-custom"}`}>{item.tabLabel}</span>
                  </div>
                  {isActive ? (
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[9px] font-mono font-bold text-emerald-500 hidden sm:inline">ACTIVE</span></div>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-border-custom group-hover:bg-secondary-custom" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Stage Grid — Single Compact Viewport with CSS Transitions */}
        <div className={`w-full my-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1 border border-border-custom border-t-2 ${accentMap[bp.accentColor]} bg-surface p-6 sm:p-8 rounded-lg shadow-lg`} style={{ transition: "border-color 0.4s ease" }}>

          {/* Left Column: Deliverables (Content swaps via React key for CSS animation) */}
          <div key={`left-${activeTab}`} className="lg:col-span-6 flex flex-col justify-between space-y-4 animate-[fadeSlideIn_0.4s_ease-out_both]">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border-custom pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-sm bg-background border border-border-custom flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className={`w-4 h-4 ${iconColorMap[bp.accentColor]}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-secondary-custom block">STAGE {bp.stepNum} &bull; {bp.badge}</span>
                    <h3 className="text-base sm:text-lg font-bold text-foreground">{bp.title}</h3>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-secondary-custom bg-background px-2.5 py-1 rounded-xs border border-border-custom font-medium shrink-0">{bp.timeline}</span>
              </div>

              <p className="text-xs sm:text-sm text-secondary-custom leading-relaxed">{bp.subtitle}</p>

              <div className="space-y-2 border-t border-border-custom pt-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground block">Concrete Architecture Deliverables:</span>
                <div className="space-y-2">
                  {bp.deliverables.map((item, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 text-xs text-foreground font-medium p-2 rounded-xs bg-background/50 border border-border-custom/50">
                      <CheckCircle2 className={`w-3.5 h-3.5 ${checkColorMap[bp.accentColor]} shrink-0 mt-0.5`} />
                      <span className="leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-border-custom bg-background p-3.5 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-secondary-custom block">Primary Client Outcome:</span>
                <span className="text-xs font-mono font-bold text-foreground">{bp.clientBenefit}</span>
              </div>
              <a href="/contact" onClick={handleNavigateToContact} className="inline-flex items-center gap-1 text-xs font-mono font-bold text-foreground hover:underline shrink-0 bg-surface px-2.5 py-1.5 rounded-xs border border-border-custom">
                <span>Deploy This</span><ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Right Column: Live Interactive Widget */}
          <div key={`right-${activeTab}`} className="lg:col-span-6 border border-border-custom bg-background p-5 rounded-md flex flex-col justify-between font-mono text-xs shadow-inner relative overflow-hidden animate-[fadeSlideIn_0.4s_ease-out_0.05s_both]">
            {renderWidget()}
          </div>

        </div>

        {/* Bottom Controls */}
        <div className="w-full border-t border-border-custom pt-3 flex items-center justify-between text-xs font-mono">
          <span className="text-secondary-custom text-[11px]">Scroll or click stage to advance &bull; 0{activeTab + 1} / 04</span>
          <div className="flex gap-1.5">
            {blueprints.map((_, dotIdx) => (
              <button key={dotIdx} onClick={() => handleTabClick(dotIdx)} className={`w-2.5 h-2.5 rounded-full cursor-pointer ${dotIdx === activeTab ? "bg-foreground scale-125" : "bg-border-custom hover:bg-secondary-custom"}`} style={{ transition: "all 0.3s ease" }} aria-label={`Stage ${dotIdx + 1}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
