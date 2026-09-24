"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  ArrowUpRight,
  Menu,
  X,
  Bot,
  Cpu,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  Send,
  MessageCircle,
  Mail,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 25);
    };

    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          const yOffset = -80;
          const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 400);
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHashLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (typeof window !== "undefined" && href.includes("#")) {
      const hash = href.split("#")[1];
      if (window.location.pathname === "/" || window.location.pathname === "") {
        e.preventDefault();
        const element = document.getElementById(hash);
        if (element) {
          const yOffset = -80;
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
          window.history.pushState(null, "", `/#${hash}`);
        } else {
          window.location.hash = hash;
        }
      }
    }
  };

  // Lock body scroll when mobile menu is open & listen for Escape key
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    {
      id: "01",
      name: "Services",
      href: "/#services",
      desc: "Autonomous AI Agents & Pipelines",
      icon: Bot,
      badge: "Core AI",
    },
    {
      id: "02",
      name: "Process",
      href: "/#process",
      desc: "4-Phase Engineering Framework",
      icon: Cpu,
      badge: "Execution",
    },
    {
      id: "03",
      name: "Case Studies",
      href: "/#work",
      desc: "Enterprise Client ROI & Deployments",
      icon: TrendingUp,
      badge: "Results",
    },
    {
      id: "04",
      name: "Contact",
      href: "/contact",
      desc: "Direct Technical Consultation",
      icon: Send,
      badge: "Direct Line",
    },
    {
      id: "05",
      name: "FAQ",
      href: "/#faq",
      desc: "Security, Tech Stack & Timelines",
      icon: HelpCircle,
      badge: "Knowledge",
    },
  ];

  return (
    <>
      {/* Desktop & Collapsed Mobile Header */}
      <header className="fixed top-0 left-0 w-full z-50 py-3.5 px-4 sm:px-6 md:px-12 flex justify-center pointer-events-none transition-all duration-300">
        <div
          className={`w-full max-w-5xl flex items-center justify-between px-4 sm:px-6 py-2.5 rounded-full border pointer-events-auto transition-all duration-500 ${
            scrolled
              ? "border-border-custom bg-background/85 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/40"
              : "border-border-custom/70 bg-surface/60 backdrop-blur-md"
          }`}
        >
          {/* Left: Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center text-background font-mono font-bold text-xs shadow-2xs group-hover:scale-105 transition-transform">
              TI
            </div>
            <span className="font-sans text-sm font-bold tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
              Tech Infinix
            </span>
          </Link>

          {/* Center: Desktop Nav Links (MadeWithGSAP Style) */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-mono tracking-wider uppercase">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleHashLink(e, link.href)}
                className="text-secondary-custom hover:text-foreground relative py-1 transition-colors duration-200 group"
              >
                <span>{link.name}</span>
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* Right: Theme Toggle & Get Quote CTA Button */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="w-7 h-7 rounded-full border border-border-custom bg-surface hover:bg-surface/80 flex items-center justify-center transition cursor-pointer text-foreground shadow-2xs"
            >
              {!mounted ? (
                <div className="w-3.5 h-3.5 rounded-full skeleton-pulse" />
              ) : theme === "dark" ? (
                <Sun className="w-3.5 h-3.5 text-yellow-400 transition-transform duration-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-300" />
              )}
            </button>

            {/* Primary Action Button */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 text-[11px] font-mono uppercase tracking-wider font-bold transition duration-200 shadow-2xs group cursor-pointer"
            >
              <span>Get Quote</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-8 h-8 rounded-full border border-border-custom bg-surface/80 hover:bg-surface flex items-center justify-center text-foreground transition-all duration-200 active:scale-95 cursor-pointer shadow-2xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Premium Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden flex flex-col bg-background/98 dark:bg-[#070709]/98 backdrop-blur-3xl transition-all duration-300 animate-in fade-in zoom-in-95">
          {/* Subtle Cyber Glow Accents */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

          {/* Drawer Top Bar */}
          <div className="relative z-10 px-5 sm:px-6 py-4 border-b border-border-custom/50 flex items-center justify-between bg-surface/30 backdrop-blur-md">
            {/* Logo & Online Status */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5"
            >
              <div className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center font-mono font-bold text-xs shadow-sm">
                TI
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-xs font-bold tracking-tight text-foreground">
                  Tech Infinix
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-500 font-semibold tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Online • Accepting Q1
                </span>
              </div>
            </Link>

            {/* Quick Header Actions: Theme Switcher & Close Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className="w-8 h-8 rounded-full border border-border-custom bg-surface/60 hover:bg-surface flex items-center justify-center text-foreground transition cursor-pointer"
              >
                {!mounted ? (
                  <div className="w-3.5 h-3.5 rounded-full skeleton-pulse" />
                ) : theme === "dark" ? (
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full border border-border-custom bg-surface/60 hover:bg-surface flex items-center justify-center text-foreground transition-all duration-200 active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Navigation Body */}
          <div className="relative z-10 flex-1 overflow-y-auto px-5 sm:px-6 pt-4 pb-8 flex flex-col justify-between gap-6">
            <div>
              {/* Directory Tag */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-custom/30">
                <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-custom font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-accent-custom" />
                  Navigation Directory
                </span>
                <span className="text-[10px] font-mono text-secondary-custom/70">
                  5 SECTIONS
                </span>
              </div>

              {/* Navigation Links Cards */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => {
                        setMobileMenuOpen(false);
                        handleHashLink(e, link.href);
                      }}
                      className="group flex items-center justify-between p-3 rounded-xl border border-border-custom/40 bg-surface/40 hover:bg-surface/90 hover:border-accent-custom/40 transition-all duration-200 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg border border-border-custom/60 bg-surface/80 flex items-center justify-center text-foreground group-hover:border-accent-custom/50 group-hover:text-accent-custom transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-secondary-custom font-semibold">
                              {link.id}
                            </span>
                            <span className="text-sm font-semibold text-foreground tracking-tight group-hover:text-accent-custom transition-colors">
                              {link.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-secondary-custom line-clamp-1 font-sans">
                            {link.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-custom text-secondary-custom">
                          {link.badge}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-secondary-custom group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </div>
                    </a>
                  );
                })}
              </nav>
            </div>

            {/* Action Hub & Quick Contacts */}
            <div className="space-y-3 pt-2">
              {/* Primary CTA */}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-foreground text-background text-xs font-mono font-bold uppercase tracking-wider shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Get Custom Quote</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              {/* Quick Connect Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href="https://wa.me/7990738939?text=Hi%20Tech%20Infinix%20team,%20I'd%20like%20to%20discuss%20a%20project."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="mailto:contact@techinfinix.com"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface text-foreground text-[11px] font-mono font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-secondary-custom" />
                  <span>Email Team</span>
                </a>
              </div>

              {/* Footer Trust Tagline */}
              <div className="pt-2 border-t border-border-custom/30 flex items-center justify-between text-[10px] font-mono text-secondary-custom/70">
                <span>SOC2 COMPLIANT • END-TO-END ENCRYPTED</span>
                <span>v2.4</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
