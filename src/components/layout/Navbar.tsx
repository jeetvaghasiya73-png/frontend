"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
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
  ChevronDown,
  ChevronRight,
  Search,
  Target,
  Zap,
  Layers,
  MapPin,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [mobileServicesExpanded, setMobileServicesExpanded] = useState(false);
  const [mobileCompanyExpanded, setMobileCompanyExpanded] = useState(false);
  const dropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const companyDropdownTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnterCompany = () => {
    if (companyDropdownTimeoutRef.current) {
      clearTimeout(companyDropdownTimeoutRef.current);
      companyDropdownTimeoutRef.current = null;
    }
    setCompanyDropdownOpen(true);
  };

  const handleMouseLeaveCompany = () => {
    companyDropdownTimeoutRef.current = setTimeout(() => {
      setCompanyDropdownOpen(false);
    }, 150);
  };

  const handleMouseEnterServices = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setServicesDropdownOpen(true);
  };

  const handleMouseLeaveServices = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setServicesDropdownOpen(false);
    }, 150);
  };

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
      name: "Intro",
      href: "/intro",
      desc: "44-Second Interactive 3D Brand Film",
      icon: Sparkles,
      badge: "3D Film",
    },
    {
      id: "02",
      name: "Services",
      href: "/services/seo",
      desc: "SEO Topical Authority & AI Automation",
      icon: Bot,
      badge: "SEO Hub",
    },
    {
      id: "03",
      name: "Process",
      href: "/#process",
      desc: "4-Phase Engineering Framework",
      icon: Cpu,
      badge: "Execution",
    },
    {
      id: "04",
      name: "Company",
      href: "/about",
      desc: "About Us, Privacy Policy & more",
      icon: ShieldCheck,
      badge: "Company",
      hasDropdown: true,
    },
    {
      id: "05",
      name: "Contact",
      href: "/contact",
      desc: "Direct Technical Consultation",
      icon: Send,
      badge: "Direct Line",
    },
    {
      id: "06",
      name: "FAQ",
      href: "/#faq",
      desc: "Security, Tech Stack & Timelines",
      icon: HelpCircle,
      badge: "Knowledge",
    },
  ];

  // Services dropdown — SEO main page + Automation main page only
  const mainSeoDropdownLinks = [
    {
      name: "SEO & Digital Marketing",
      href: "/services/seo",
      desc: "Full service directory & topical authority cluster",
      badge: "SEO",
      icon: Search,
    },
    {
      name: "WhatsApp & Workflow Automation",
      href: "/services/automation",
      desc: "WhatsApp bots, n8n workflows & AI automation",
      badge: "Automation",
      icon: Bot,
    },
  ];

  // Company dropdown links
  const companyDropdownLinks = [
    {
      name: "About Us",
      href: "/about",
      desc: "Our team, founders & mission",
      badge: "Team",
      icon: ShieldCheck,
    },
    {
      name: "Privacy Policy",
      href: "/privacy-policy",
      desc: "How we handle your data",
      badge: "Legal",
      icon: ShieldCheck,
    },
  ];

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-9B67ZQFXL2"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-9B67ZQFXL2');
          `,
        }}
      />

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
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-border-custom dark:border-white/35 dark:ring-1 dark:ring-white/20 bg-black flex items-center justify-center shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.12)] group-hover:scale-105 transition-all shrink-0">
              <Image
                src="/favicon.png"
                alt="Tech Infinix Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover scale-110"
                priority
              />
            </div>
            <span className="text-[15px] sm:text-base font-medium tracking-tight text-foreground group-hover:opacity-80 transition-opacity">
              Tech Infinix
            </span>
          </Link>

          {/* Center: Desktop Nav Links (MadeWithGSAP Style) */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-medium tracking-wider uppercase">
            {navLinks.map((link) => {
              if (link.name === "Services") {
                return (
                  <div
                    key={link.name}
                    className="relative py-1"
                    onMouseEnter={handleMouseEnterServices}
                    onMouseLeave={handleMouseLeaveServices}
                  >
                    <Link
                      href="/services/seo"
                      className={`text-secondary-custom hover:text-foreground relative transition-colors duration-200 group flex items-center gap-1 cursor-pointer ${
                        servicesDropdownOpen ? "text-foreground" : ""
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-secondary-custom transition-transform duration-200 ${
                          servicesDropdownOpen ? "rotate-180 text-foreground" : "group-hover:text-foreground"
                        }`}
                      />
                      <span
                        className={`absolute bottom-0 left-0 h-[1px] bg-foreground transition-all duration-300 ${
                          servicesDropdownOpen ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </Link>

                    {/* Desktop Services Dropdown */}
                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[340px] pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                        <div className="rounded-2xl border border-border-custom bg-background/95 dark:bg-[#0c0d12]/95 backdrop-blur-2xl shadow-2xl p-4 text-left normal-case tracking-normal">
                          {/* Header */}
                          <div className="flex items-center justify-between px-2.5 pb-2.5 mb-2 border-b border-border-custom/50">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-foreground">
                                Our Services
                              </span>
                            </div>
                            <Link
                              href="/contact"
                              onClick={() => setServicesDropdownOpen(false)}
                              className="text-[11px] font-mono font-semibold text-foreground hover:underline flex items-center gap-1"
                            >
                              <span>Get a Quote</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Service Links */}
                          <div className="flex flex-col gap-1.5">
                            {mainSeoDropdownLinks.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={() => setServicesDropdownOpen(false)}
                                  className="group flex items-start gap-2.5 p-2 rounded-xl border border-transparent hover:border-border-custom hover:bg-surface/50 transition-all duration-150"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-surface border border-border-custom/60 flex items-center justify-center text-secondary-custom group-hover:text-foreground group-hover:border-foreground/40 transition-colors shrink-0 mt-0.5">
                                    <ItemIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-foreground transition-colors truncate">
                                        {item.name}
                                      </span>
                                      {item.badge && (
                                        <span className="text-[9px] font-mono px-1 rounded bg-surface border border-border-custom/60 text-secondary-custom shrink-0">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-secondary-custom leading-tight line-clamp-1">
                                      {item.desc}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>

                          {/* Bottom Quick Row */}
                          <div className="mt-2.5 pt-2.5 border-t border-border-custom/50 px-2 flex items-center justify-end text-xs">
                            <Link
                              href="/services"
                              onClick={() => setServicesDropdownOpen(false)}
                              className="text-foreground font-semibold text-[11px] hover:underline flex items-center gap-1"
                            >
                              <span>More</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (link.name === "Company") {
                return (
                  <div
                    key={link.name}
                    className="relative py-1"
                    onMouseEnter={handleMouseEnterCompany}
                    onMouseLeave={handleMouseLeaveCompany}
                  >
                    <button
                      type="button"
                      className={`text-secondary-custom hover:text-foreground relative transition-colors duration-200 group flex items-center gap-1 cursor-pointer ${
                        companyDropdownOpen ? "text-foreground" : ""
                      }`}
                    >
                      <span>{link.name}</span>
                      <ChevronDown
                        className={`w-3 h-3 text-secondary-custom transition-transform duration-200 ${
                          companyDropdownOpen ? "rotate-180 text-foreground" : "group-hover:text-foreground"
                        }`}
                      />
                      <span
                        className={`absolute bottom-0 left-0 h-[1px] bg-foreground transition-all duration-300 ${
                          companyDropdownOpen ? "w-full" : "w-0 group-hover:w-full"
                        }`}
                      />
                    </button>

                    {/* Desktop Company Dropdown */}
                    {companyDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 w-[280px] pointer-events-auto animate-in fade-in-0 zoom-in-95 duration-150 z-50">
                        <div className="rounded-2xl border border-border-custom bg-background/95 dark:bg-[#0c0d12]/95 backdrop-blur-2xl shadow-2xl p-4 text-left normal-case tracking-normal">
                          <div className="flex items-center gap-2 px-2.5 pb-2.5 mb-2 border-b border-border-custom/50">
                            <span className="w-2 h-2 rounded-full bg-foreground" />
                            <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-foreground">
                              Company
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {companyDropdownLinks.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <Link
                                  key={item.name}
                                  href={item.href}
                                  onClick={() => setCompanyDropdownOpen(false)}
                                  className="group flex items-start gap-2.5 p-2 rounded-xl border border-transparent hover:border-border-custom hover:bg-surface/50 transition-all duration-150"
                                >
                                  <div className="w-7 h-7 rounded-lg bg-surface border border-border-custom/60 flex items-center justify-center text-secondary-custom group-hover:text-foreground group-hover:border-foreground/40 transition-colors shrink-0 mt-0.5">
                                    <ItemIcon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs font-semibold text-foreground transition-colors truncate">
                                        {item.name}
                                      </span>
                                      <span className="text-[9px] font-mono px-1 rounded bg-surface border border-border-custom/60 text-secondary-custom shrink-0">
                                        {item.badge}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-secondary-custom leading-tight">
                                      {item.desc}
                                    </span>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleHashLink(e, link.href)}
                  className="text-secondary-custom hover:text-foreground relative py-1 transition-colors duration-200 group flex items-center gap-1.5"
                >
                  {link.badge === "3D Film" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse inline-block shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
                  )}
                  <span>{link.name}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-foreground group-hover:w-full transition-all duration-300" />
                </Link>
              );
            })}
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
                <Sun className="w-3.5 h-3.5 text-foreground transition-transform duration-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-foreground transition-transform duration-300" />
              )}
            </button>

            {/* Primary Action Button */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-foreground text-background hover:opacity-90 text-[11px] uppercase tracking-wider font-semibold transition duration-200 shadow-2xs group cursor-pointer"
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
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-foreground/5 rounded-full blur-[90px] pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-80 h-80 bg-foreground/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />

          {/* Drawer Top Bar */}
          <div className="relative z-10 px-5 sm:px-6 py-4 border-b border-border-custom/50 flex items-center justify-between bg-surface/30 backdrop-blur-md">
            {/* Logo & Online Status */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-border-custom dark:border-white/35 dark:ring-1 dark:ring-white/20 bg-black flex items-center justify-center shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.12)] shrink-0">
                <Image
                  src="/favicon.png"
                  alt="Tech Infinix Logo"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover scale-110"
                />
              </div>
              <span className="font-sans text-sm font-medium tracking-tight text-foreground">
                Tech Infinix
              </span>
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
                  <Sun className="w-3.5 h-3.5 text-foreground" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-foreground" />
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
                  {navLinks.length} SECTIONS
                </span>
              </div>

              {/* Navigation Links Cards */}
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  const Icon = link.icon;

                  if (link.name === "Services") {
                    return (
                      <div
                        key={link.name}
                        className="flex flex-col rounded-xl border border-border-custom/40 bg-surface/40 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setMobileServicesExpanded(!mobileServicesExpanded)}
                          className="w-full group flex items-center justify-between p-3 text-left transition-all duration-200"
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
                                SEO Services &amp; AI Automation
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-custom text-foreground font-semibold">
                              SEO Hub
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-secondary-custom transition-transform duration-200 ${
                                mobileServicesExpanded ? "rotate-180 text-foreground" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {/* Collapsible Mobile Sub-Menu */}
                        {mobileServicesExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-border-custom/30 space-y-1.5 animate-in fade-in-0 duration-200">
                            {mainSeoDropdownLinks.map((subItem) => {
                              const SubIcon = subItem.icon;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-lg bg-surface/60 border border-border-custom/30 hover:border-foreground/40 text-xs font-medium text-foreground transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <SubIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
                                    <span className="truncate">{subItem.name}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-secondary-custom uppercase shrink-0">
                                    {subItem.badge}
                                  </span>
                                </Link>
                              );
                            })}
                            <Link
                              href="/services"
                              onClick={(e) => {
                                setMobileMenuOpen(false);
                                handleHashLink(e, "/services");
                              }}
                              className="flex items-center justify-between p-2 rounded-lg bg-surface/30 border border-border-custom/20 text-xs font-medium text-secondary-custom hover:text-foreground transition-colors mt-1"
                            >
                              <div className="flex items-center gap-2">
                                <span>More</span>
                              </div>
                              <ArrowRight className="w-3 h-3 text-secondary-custom" />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  }

                  if (link.name === "Company") {
                    return (
                      <div
                        key={link.name}
                        className="flex flex-col rounded-xl border border-border-custom/40 bg-surface/40 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => setMobileCompanyExpanded(!mobileCompanyExpanded)}
                          className="w-full group flex items-center justify-between p-3 text-left transition-all duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg border border-border-custom/60 bg-surface/80 flex items-center justify-center text-foreground group-hover:border-accent-custom/50 group-hover:text-accent-custom transition-colors">
                              <ShieldCheck className="w-4 h-4" />
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
                                About Us &amp; Legal
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface border border-border-custom text-foreground font-semibold">
                              Company
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-secondary-custom transition-transform duration-200 ${
                                mobileCompanyExpanded ? "rotate-180 text-foreground" : ""
                              }`}
                            />
                          </div>
                        </button>

                        {mobileCompanyExpanded && (
                          <div className="px-3 pb-3 pt-1 border-t border-border-custom/30 space-y-1.5 animate-in fade-in-0 duration-200">
                            {companyDropdownLinks.map((subItem) => {
                              const SubIcon = subItem.icon;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="flex items-center justify-between p-2 rounded-lg bg-surface/60 border border-border-custom/30 hover:border-foreground/40 text-xs font-medium text-foreground transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <SubIcon className="w-3.5 h-3.5 text-foreground shrink-0" />
                                    <span className="truncate">{subItem.name}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-secondary-custom uppercase shrink-0">
                                    {subItem.badge}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
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
                    </Link>
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
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-foreground text-background text-xs font-semibold uppercase tracking-wider shadow-md hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
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
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface text-foreground text-xs font-medium transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>

                <a
                  href="mailto:contact@techinfinix.com"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface text-foreground text-xs font-medium transition-colors"
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
