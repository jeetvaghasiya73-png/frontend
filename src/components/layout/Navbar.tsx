"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, ArrowRight, Menu, X } from "lucide-react";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Services", href: "/services" },
    { name: "Work", href: "/portfolio" },
    { name: "Process", href: "/#process" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-border-custom bg-background/60 backdrop-blur-md py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group relative z-50">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-accent-custom to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_20px_rgba(79,124,255,0.3)]">
            N
          </div>
          <span className="font-sans text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-secondary-custom bg-clip-text text-transparent group-hover:from-accent-custom group-hover:to-purple-500 transition-colors duration-300">
            Nexora AI
          </span>
        </a>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-secondary-custom hover:text-foreground relative py-1 transition-colors duration-200 group"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent-custom group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Actions (CTA, Theme, Mobile Toggle) */}
        <div className="flex items-center gap-4 relative z-50">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-10 h-10 rounded-lg border border-border-custom bg-surface/50 hover:bg-surface flex items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden group"
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              {!mounted ? (
                <div className="w-5 h-5 rounded-full skeleton-pulse" />
              ) : theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400 transform group-hover:rotate-45 transition-transform duration-500" />
              ) : (
                <Moon className="w-5 h-5 text-accent-custom transform group-hover:-rotate-12 transition-transform duration-500" />
              )}
            </div>
          </button>

          {/* strategy CTA Button */}
          <a
            href="/contact"
            className="hidden sm:inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold bg-foreground text-background hover:bg-accent-custom hover:text-white px-5 py-2.5 rounded-md transition-all duration-300 hover:shadow-[0_0_25px_var(--accent-glow)] group"
          >
            Book Strategy Call
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg border border-border-custom bg-surface/50 flex items-center justify-center hover:bg-surface text-foreground transition-all"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-lg z-40 flex flex-col justify-center px-8 md:px-16 lg:hidden">
          <nav className="flex flex-col gap-6 text-2xl font-semibold">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-secondary-custom hover:text-foreground transition-colors py-2 border-b border-border-custom"
              >
                {link.name}
              </a>
            ))}
            <a
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-3 text-lg font-medium text-accent-custom mt-4"
            >
              Book Strategy Call
              <ArrowRight className="w-5 h-5" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
