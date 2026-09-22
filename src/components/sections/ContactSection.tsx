"use client";

import React, { useState, useRef, useEffect } from "react";
import { API_URL } from "@/lib/config";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  Send,
  Sparkles,
  MessageCircle,
  Building2,
  Globe,
  User,
  Briefcase,
  Layers,
  RotateCcw,
  Check,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "@/components/animations/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const quoteSchema = z.object({
  // Step 1: Personal
  name: z.string().min(2, "Full name of contact person is required"),
  email: z.string().email("Valid work or personal email required"),
  phone: z.string().min(7, "Phone or WhatsApp number required"),

  // Step 2: Business
  business_name: z.string().min(2, "Business / Company name is required"),
  category: z.string().min(2, "Please select or enter your business category"),
  website: z.string().optional(),

  // Step 3: Requirements
  services: z.array(z.string()).min(1, "Select at least one service"),
  budget: z.string().optional(),
  message: z.string().min(10, "Please provide brief details on your goals (min 10 characters)"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

const availableServices = [
  { label: "Local SEO & Google Maps", icon: "📍", desc: "Rank #1 on Google 3-Pack & Maps" },
  { label: "High-Performance Web Development", icon: "🌐", desc: "Fast, converting modern website" },
  { label: "Web & Lead Scraping", icon: "📊", desc: "Verified business contact pipelines" },
  { label: "WhatsApp & CRM Automations", icon: "🤖", desc: "Automated instant customer replies" },
];

const categoryOptions = [
  { label: "E-Commerce & Retail", icon: "🛍️" },
  { label: "Healthcare & Clinic", icon: "🩺" },
  { label: "Real Estate & Construction", icon: "🏢" },
  { label: "Restaurants & Hospitality", icon: "🍽️" },
  { label: "Education & Coaching", icon: "🎓" },
  { label: "IT, SaaS & Software", icon: "💻" },
  { label: "Professional & Legal", icon: "⚖️" },
  { label: "Manufacturing & B2B", icon: "🏭" },
  { label: "Other / Startup", icon: "🚀" },
];

const budgetOptions = [
  "Under ₹25,000",
  "₹25,000 – ₹50,000",
  "₹50,000 – ₹1,00,000",
  "₹1,00,000+",
];

export default function ContactSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const formCardRef = useRef<HTMLDivElement>(null);
  const infoCardRef = useRef<HTMLDivElement>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customCategory, setCustomCategory] = useState(false);
  const [submittedLead, setSubmittedLead] = useState<(QuoteFormValues & { submittedAt: string }) | null>(null);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      business_name: "",
      category: "",
      website: "",
      services: [],
      budget: "₹25,000 – ₹50,000",
      message: "",
    },
  });

  const selectedCategory = watch("category");
  const selectedServices = watch("services");

  // Load existing persistent submission on mount (prevents seeing form again)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("techinfinix_submitted_lead") || localStorage.getItem("nexora_submitted_lead");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.business_name) {
          setSubmittedLead(parsed);
        }
      }
    } catch (e) {
      console.warn("Could not read local submission:", e);
    }
  }, []);

  // GSAP entrance animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-hero-anim",
        { opacity: 0, y: 30, willChange: "transform, opacity" },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.15,
        }
      );

      gsap.fromTo(
        ".contact-info-anim",
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: infoCardRef.current,
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".contact-form-anim",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formCardRef.current,
            start: "top 80%",
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [submittedLead]);

  // Step 1 Validation -> Next
  const handleNextFromStep1 = async () => {
    const valid = await trigger(["name", "email", "phone"]);
    if (valid) {
      setCurrentStep(2);
      setError("");
    }
  };

  // Step 2 Validation -> Next
  const handleNextFromStep2 = async () => {
    const valid = await trigger(["business_name", "category"]);
    if (valid) {
      setCurrentStep(3);
      setError("");
    }
  };

  // Handle enter key in inputs: navigate to next step instead of submitting prematurely
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      if (currentStep === 1) {
        handleNextFromStep1();
      } else if (currentStep === 2) {
        handleNextFromStep2();
      }
    }
  };

  const onSubmit = async (data: QuoteFormValues) => {
    if (loading) return;
    setLoading(true);
    setError("");

    const payload = {
      name: data.name.trim(),
      business_name: data.business_name.trim(),
      company: data.business_name.trim(),
      category: data.category.trim(),
      website: data.website?.trim() || "",
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      services: data.services,
      message: `[BUDGET: ${data.budget || "Unspecified"}] [INDUSTRY: ${data.category}] ${data.message.trim()}`,
    };

    try {
      const response = await fetch(`${API_URL}/api/v1/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to submit. Please try again.");
      }

      const record = {
        ...data,
        submittedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem("techinfinix_submitted_lead", JSON.stringify(record));
      } catch (e) {
        console.warn("Storage notice:", e);
      }

      setSubmittedLead(record);
      setLoading(false);

      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"],
      });
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Submission failed. Reach us directly at contact@techinfinix.com");
    }
  };

  const handleResetSubmission = () => {
    try {
      localStorage.removeItem("techinfinix_submitted_lead");
      localStorage.removeItem("nexora_submitted_lead");
    } catch (e) {}
    setSubmittedLead(null);
    setCurrentStep(1);
    reset();
  };

  return (
    <div ref={containerRef} className="bg-background text-left">
      {/* ═══════ HERO HEADER ═══════ */}
      <section className="relative overflow-hidden border-b border-border-custom">
        <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 pt-28 sm:pt-32 pb-14 sm:pb-18 relative z-10">
          <div className="max-w-3xl">
            <div className="contact-hero-anim inline-flex items-center gap-2 border border-border-custom bg-surface px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-foreground">
                Start a Project &bull; Custom Business Proposal
              </span>
            </div>

            <h1 className="contact-hero-anim text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-4">
              <SplitText text="Let's Scale Your Business" type="words" />
              <br />
              <span className="text-secondary-custom">
                <SplitText text="In 3 Simple Steps." type="words" />
              </span>
            </h1>

            <p className="contact-hero-anim text-sm sm:text-base text-secondary-custom max-w-xl leading-relaxed mb-6">
              Take 60 seconds to share your business goals. We&apos;ll craft a tailored proposal and growth strategy delivered within 24 hours.
            </p>

            <div className="contact-hero-anim flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-mono text-secondary-custom">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-foreground" />
                <span>&lt; 24h Turnaround</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Direct Founder Review</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>No Obligation Audit</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ MAIN CONTENT: INFO + STEP-BY-STEP FORM ═══════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ─── LEFT: Info Column ─── */}
          <div ref={infoCardRef} className="lg:col-span-4 space-y-5 order-2 lg:order-1">

            {/* Quick 3-Step Overview */}
            <div className="contact-info-anim border border-border-custom bg-surface p-6 sm:p-7 rounded-lg space-y-5">
              <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                How It Works
              </h3>

              <div className="space-y-4">
                {[
                  {
                    step: "1",
                    title: "Quick 3-Step Inquiry",
                    desc: "Share your contact, business category, and the services you need.",
                  },
                  {
                    step: "2",
                    title: "Market & SEO Audit",
                    desc: "Our team analyzes your competitors, local rankings, and growth opportunities.",
                  },
                  {
                    step: "3",
                    title: "Custom Proposal",
                    desc: "Receive clear milestones, transparent pricing, and deployment timelines.",
                  },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-md bg-background border border-border-custom flex items-center justify-center text-[11px] font-bold text-foreground font-mono shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-foreground block">{item.title}</span>
                      <p className="text-[11px] text-secondary-custom leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct Contact Info */}
            <div className="contact-info-anim border border-border-custom bg-surface p-6 sm:p-7 rounded-lg space-y-4">
              <h3 className="text-sm font-bold text-foreground font-mono uppercase tracking-wider">
                Direct Contact
              </h3>

              <div className="space-y-3">
                <a
                  href="mailto:contact@techinfinix.com"
                  className="flex items-center gap-3 text-xs text-secondary-custom hover:text-foreground transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-background border border-border-custom flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-custom font-mono uppercase tracking-wider block">Email</span>
                    <span className="text-foreground font-semibold">contact@techinfinix.com</span>
                  </div>
                </a>

                <a
                  href="tel:+917990738939"
                  className="flex items-center gap-3 text-xs text-secondary-custom hover:text-foreground transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-background border border-border-custom flex items-center justify-center group-hover:border-foreground/40 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-custom font-mono uppercase tracking-wider block">Direct Call</span>
                    <span className="text-foreground font-semibold">+91 79907 38939</span>
                  </div>
                </a>

                <a
                  href="https://wa.me/917990738939"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-xs text-secondary-custom hover:text-foreground transition-colors group"
                >
                  <div className="w-8 h-8 rounded-md bg-background border border-border-custom flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-custom font-mono uppercase tracking-wider block">WhatsApp</span>
                    <span className="text-foreground font-semibold">+91 79907 38939</span>
                  </div>
                </a>

                <div className="flex items-center gap-3 text-xs text-secondary-custom">
                  <div className="w-8 h-8 rounded-md bg-background border border-border-custom flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5 text-foreground" />
                  </div>
                  <div>
                    <span className="text-[10px] text-secondary-custom font-mono uppercase tracking-wider block">Location</span>
                    <span className="text-foreground font-semibold">India &bull; Serving Globally</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Badge */}
            <div className="contact-info-anim border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-lg flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-foreground block">100% Confidential</span>
                <p className="text-[11px] text-secondary-custom leading-relaxed mt-0.5">
                  Your business metrics and contact information remain strictly confidential.
                </p>
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Step-by-Step Form / Persistent Confirmation ─── */}
          <div ref={formCardRef} className="lg:col-span-8 order-1 lg:order-2">
            <div className="contact-form-anim border border-border-custom bg-surface p-6 sm:p-8 md:p-10 rounded-lg shadow-sm">

              {submittedLead ? (
                /* ═══════ PERSISTENT CONFIRMATION STATE (AFTER SUBMISSION) ═══════ */
                <div className="py-6 space-y-6 animate-fadeIn">
                  {/* Status header banner */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pb-5 border-b border-border-custom">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Inquiry Under Active Review &bull; SLA &lt; 24h</span>
                    </div>

                    <span className="text-xs font-mono text-secondary-custom">
                      Submitted: {new Date(submittedLead.submittedAt || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div className="text-center sm:text-left space-y-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                          Thank You, {submittedLead.name}!
                        </h2>
                        <p className="text-xs sm:text-sm text-secondary-custom mt-0.5">
                          We have recorded your inquiry for <span className="font-semibold text-foreground">{submittedLead.business_name}</span>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Profile Card */}
                  <div className="bg-background border border-border-custom rounded-lg p-4 sm:p-5 space-y-4">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary-custom block border-b border-border-custom pb-2">
                      Inquiry Summary
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[11px] text-secondary-custom block">Business / Company</span>
                        <span className="text-sm font-semibold text-foreground">{submittedLead.business_name}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-secondary-custom block">Category / Industry</span>
                        <span className="text-sm font-semibold text-foreground">{submittedLead.category}</span>
                      </div>

                      {submittedLead.website && (
                        <div>
                          <span className="text-[11px] text-secondary-custom block">Website / Profile</span>
                          <a
                            href={submittedLead.website.startsWith("http") ? submittedLead.website : `https://${submittedLead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>{submittedLead.website}</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <div>
                        <span className="text-[11px] text-secondary-custom block">Contact Person</span>
                        <span className="font-medium text-foreground">{submittedLead.name}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-secondary-custom block">Email</span>
                        <span className="font-medium text-foreground">{submittedLead.email}</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-secondary-custom block">Phone / WhatsApp</span>
                        <span className="font-medium text-foreground">{submittedLead.phone}</span>
                      </div>
                    </div>

                    {submittedLead.services && submittedLead.services.length > 0 && (
                      <div className="pt-2 border-t border-border-custom">
                        <span className="text-[11px] text-secondary-custom block mb-1.5">Selected Services</span>
                        <div className="flex flex-wrap gap-1.5">
                          {submittedLead.services.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md bg-surface border border-border-custom text-[11px] font-medium text-foreground"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Instant Connect CTAs */}
                  <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-bold text-foreground">Want an Instant Response?</span>
                    </div>
                    <p className="text-xs text-secondary-custom leading-relaxed">
                      Our founder reviews project briefs daily. Chat with us on WhatsApp right now:
                    </p>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                      <a
                        href={`https://wa.me/917990738939?text=${encodeURIComponent(
                          `Hi Tech Infinix team! I just submitted an inquiry for ${submittedLead.business_name} (${submittedLead.category}). Let's discuss!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat With Us on WhatsApp</span>
                      </a>

                      <a
                        href="tel:+917990738939"
                        className="px-4 py-3 rounded-md bg-background border border-border-custom text-foreground hover:bg-surface font-semibold text-xs flex items-center justify-center gap-2 transition"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call +91 79907 38939</span>
                      </a>
                    </div>
                  </div>

                  {/* Option to start a new inquiry */}
                  <div className="pt-2 flex items-center justify-between border-t border-border-custom">
                    <button
                      type="button"
                      onClick={handleResetSubmission}
                      className="text-xs text-secondary-custom hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Submit inquiry for a different business</span>
                    </button>
                    <span className="text-[10px] font-mono text-secondary-custom">Tech Infinix Portal</span>
                  </div>
                </div>
              ) : (
                /* ═══════ STEP-WISE INTUITIVE FORM ═══════ */
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  onKeyDown={handleKeyDown}
                  className="space-y-6"
                >
                  {/* ── Top Step Progress Bar ── */}
                  <div className="pb-4 border-b border-border-custom space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-secondary-custom font-bold">
                          Step {currentStep} of 3
                        </span>
                        <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                          {currentStep === 1 && "Personal Contact Details"}
                          {currentStep === 2 && "Business & Industry Profile"}
                          {currentStep === 3 && "Project Requirements & Scope"}
                        </h2>
                      </div>

                      <span className="text-xs font-mono font-bold text-indigo-500">
                        {currentStep === 1 && "33% Completed"}
                        {currentStep === 2 && "66% Completed"}
                        {currentStep === 3 && "Almost Done!"}
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-background border border-border-custom rounded-full h-2 overflow-hidden flex">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-300 ease-out"
                        style={{
                          width: currentStep === 1 ? "33%" : currentStep === 2 ? "66%" : "100%",
                        }}
                      />
                    </div>

                    {/* Step Tabs Pill Bar */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStep === 1
                            ? "bg-foreground text-background font-bold shadow-xs"
                            : "bg-background border border-border-custom text-secondary-custom hover:text-foreground"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-secondary-custom/20 text-[10px] flex items-center justify-center font-bold">
                          1
                        </span>
                        <span className="truncate">Contact</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const valid1 = await trigger(["name", "email", "phone"]);
                          if (valid1) setCurrentStep(2);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStep === 2
                            ? "bg-foreground text-background font-bold shadow-xs"
                            : "bg-background border border-border-custom text-secondary-custom hover:text-foreground"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-secondary-custom/20 text-[10px] flex items-center justify-center font-bold">
                          2
                        </span>
                        <span className="truncate">Business</span>
                      </button>

                      <button
                        type="button"
                        onClick={async () => {
                          const valid1 = await trigger(["name", "email", "phone"]);
                          const valid2 = await trigger(["business_name", "category"]);
                          if (valid1 && valid2) setCurrentStep(3);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          currentStep === 3
                            ? "bg-foreground text-background font-bold shadow-xs"
                            : "bg-background border border-border-custom text-secondary-custom hover:text-foreground"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-secondary-custom/20 text-[10px] flex items-center justify-center font-bold">
                          3
                        </span>
                        <span className="truncate">Scope</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  {/* ────────────────── STEP 1: PERSONAL DETAILS ────────────────── */}
                  {currentStep === 1 && (
                    <div className="space-y-4 animate-fadeIn">
                      <p className="text-xs text-secondary-custom">
                        Who should we send the proposal and reach out to?
                      </p>

                      {/* Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Your Full Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="e.g. Rahul Sharma"
                            {...register("name")}
                            className="w-full bg-background border border-border-custom rounded-md pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition"
                          />
                        </div>
                        {errors.name && (
                          <span className="text-[11px] text-red-500">{errors.name.message}</span>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="email"
                            placeholder="e.g. rahul@example.com"
                            {...register("email")}
                            className="w-full bg-background border border-border-custom rounded-md pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition"
                          />
                        </div>
                        {errors.email && (
                          <span className="text-[11px] text-red-500">{errors.email.message}</span>
                        )}
                      </div>

                      {/* Phone / WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Phone / WhatsApp Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 98765 43210"
                            {...register("phone")}
                            className="w-full bg-background border border-border-custom rounded-md pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition"
                          />
                        </div>
                        <p className="text-[10px] text-secondary-custom font-mono">
                          Used exclusively to share proposal updates. No spam ever.
                        </p>
                        {errors.phone && (
                          <span className="text-[11px] text-red-500">{errors.phone.message}</span>
                        )}
                      </div>

                      {/* Step 1 CTA */}
                      <div className="pt-3">
                        <button
                          type="button"
                          onClick={handleNextFromStep1}
                          className="w-full bg-foreground text-background hover:opacity-90 font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer transition shadow-sm active:scale-[0.98]"
                        >
                          <span>Next: Business Profile</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ────────────────── STEP 2: BUSINESS DETAILS ────────────────── */}
                  {currentStep === 2 && (
                    <div className="space-y-4 animate-fadeIn">
                      <p className="text-xs text-secondary-custom">
                        Tell us about the company or brand you want to grow.
                      </p>

                      {/* Business Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                          Business / Brand Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="e.g. Apex Dental Care or Royal Jewelers"
                            {...register("business_name")}
                            className="w-full bg-background border border-border-custom rounded-md pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition"
                          />
                        </div>
                        {errors.business_name && (
                          <span className="text-[11px] text-red-500">{errors.business_name.message}</span>
                        )}
                      </div>

                      {/* Business Category (Easy Quick-Select Chips) */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                            Business Category / Industry <span className="text-red-500">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setCustomCategory(!customCategory);
                              setValue("category", "");
                            }}
                            className="text-[11px] text-indigo-500 hover:underline font-mono cursor-pointer"
                          >
                            {customCategory ? "Select from list" : "Type custom category"}
                          </button>
                        </div>

                        {customCategory ? (
                          <div className="relative">
                            <Briefcase className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="e.g. Luxury Interior Architecture"
                              {...register("category")}
                              className="w-full bg-background border border-border-custom rounded-md pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition"
                            />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {categoryOptions.map((cat) => {
                              const isSelected = selectedCategory === cat.label;
                              return (
                                <button
                                  type="button"
                                  key={cat.label}
                                  onClick={() => setValue("category", cat.label, { shouldValidate: true })}
                                  className={`p-2.5 rounded-md border text-left transition text-xs flex items-center gap-2 cursor-pointer ${
                                    isSelected
                                      ? "border-foreground bg-foreground text-background font-bold shadow-xs"
                                      : "border-border-custom bg-background text-foreground hover:border-foreground/40"
                                  }`}
                                >
                                  <span className="text-sm">{cat.icon}</span>
                                  <span className="truncate">{cat.label}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {errors.category && (
                          <span className="text-[11px] text-red-500">{errors.category.message}</span>
                        )}
                      </div>

                      {/* Business Website or Social Profile */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                          <span>Website or Social Profile</span>
                          <span className="text-secondary-custom text-[10px] font-normal font-mono">(Optional)</span>
                        </label>
                        <div className="relative">
                          <Globe className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                          <input
                            type="text"
                            placeholder="e.g. apexdental.in or instagram.com/apexdental"
                            {...register("website")}
                            className="w-full bg-background border border-border-custom rounded-md pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition"
                          />
                        </div>
                      </div>

                      {/* Step 2 CTA: Back & Next */}
                      <div className="pt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="px-5 py-3.5 rounded-full border border-border-custom bg-background hover:bg-surface font-semibold text-xs text-foreground flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleNextFromStep2}
                          className="flex-1 bg-foreground text-background hover:opacity-90 font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer transition shadow-sm active:scale-[0.98]"
                        >
                          <span>Next: Project Scope</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ────────────────── STEP 3: PROJECT REQUIREMENTS ────────────────── */}
                  {currentStep === 3 && (
                    <div className="space-y-5 animate-fadeIn">
                      <p className="text-xs text-secondary-custom">
                        Select what services you need and tell us your targets.
                      </p>

                      {/* Services Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground block">
                          Which services are you interested in? <span className="text-red-500">*</span>
                        </label>
                        <Controller
                          name="services"
                          control={control}
                          render={({ field }) => (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {availableServices.map((service) => {
                                const isSelected = field.value?.includes(service.label);
                                return (
                                  <button
                                    type="button"
                                    key={service.label}
                                    onClick={() => {
                                      const newValue = isSelected
                                        ? field.value.filter((v: string) => v !== service.label)
                                        : [...(field.value || []), service.label];
                                      field.onChange(newValue);
                                    }}
                                    className={`p-3 rounded-md border text-left transition cursor-pointer flex items-start gap-3 ${
                                      isSelected
                                        ? "border-foreground bg-foreground text-background font-bold shadow-xs"
                                        : "border-border-custom bg-background text-foreground hover:border-foreground/40"
                                    }`}
                                  >
                                    <span className="text-base mt-0.5">{service.icon}</span>
                                    <div className="min-w-0">
                                      <span className="text-xs font-medium block">{service.label}</span>
                                      <span className={`text-[10px] block mt-0.5 ${isSelected ? "text-background/80" : "text-secondary-custom"}`}>
                                        {service.desc}
                                      </span>
                                    </div>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 mt-0.5" />}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        />
                        {errors.services && (
                          <span className="text-[11px] text-red-500">{errors.services.message}</span>
                        )}
                      </div>

                      {/* Budget Selection */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-foreground block">
                          Estimated Budget
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {budgetOptions.map((b) => (
                            <label
                              key={b}
                              className="flex items-center gap-2 border border-border-custom bg-background px-3 py-2 rounded-md cursor-pointer hover:border-foreground/40 transition text-xs has-[:checked]:border-foreground has-[:checked]:bg-surface has-[:checked]:font-semibold"
                            >
                              <input
                                type="radio"
                                value={b}
                                {...register("budget")}
                                className="accent-foreground w-3.5 h-3.5"
                              />
                              <span className="text-xs text-foreground truncate">{b}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Project Details */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-foreground">
                          Project Goals &amp; Specific Details <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Briefly describe what you want to achieve (e.g. rank #1 on Google in our city, automate customer appointments on WhatsApp, etc.)..."
                          {...register("message")}
                          className="w-full bg-background border border-border-custom rounded-md px-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/60 focus:outline-none focus:ring-2 focus:ring-foreground/20 focus:border-foreground/50 transition resize-none leading-relaxed"
                        />
                        {errors.message && (
                          <span className="text-[11px] text-red-500">{errors.message.message}</span>
                        )}
                      </div>

                      {/* Step 3 CTA: Back & Submit */}
                      <div className="pt-2 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="px-5 py-4 rounded-full border border-border-custom bg-background hover:bg-surface font-semibold text-xs text-foreground flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Back</span>
                        </button>

                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-foreground text-background hover:opacity-90 font-bold py-4 rounded-full flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer transition disabled:opacity-50 shadow-sm active:scale-[0.98]"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Submitting Inquiry...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Submit Project Inquiry</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-secondary-custom text-center font-mono">
                        Direct response within 24 hours. Your details remain confidential.
                      </p>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
