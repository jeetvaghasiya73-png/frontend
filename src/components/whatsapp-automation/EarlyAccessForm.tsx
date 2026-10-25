"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import {
  User,
  Mail,
  Phone,
  Building2,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { API_URL } from "@/lib/config";

// Validation schema matching the exact 5 requested fields from the existing form
const earlyAccessSchema = z.object({
  name: z.string().min(2, "Full name is required (min 2 characters)"),
  email: z.string().email("Valid work email address is required"),
  phone: z.string().min(7, "Valid phone or WhatsApp number is required"),
  business_name: z.string().min(2, "Company or business name is required"),
  message: z.string().min(10, "Please describe why your team needs LeadFlow (min 10 characters)"),
});

type EarlyAccessFormValues = z.infer<typeof earlyAccessSchema>;

export default function EarlyAccessForm() {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submittedLead, setSubmittedLead] = useState<(EarlyAccessFormValues & { submittedAt: string }) | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EarlyAccessFormValues>({
    resolver: zodResolver(earlyAccessSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      business_name: "",
      message: "",
    },
  });

  // Check if previously submitted in this browser session
  useEffect(() => {
    try {
      const saved = localStorage.getItem("leadflow_early_access_lead");
      if (saved) {
        setSubmittedLead(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const onSubmit = async (data: EarlyAccessFormValues) => {
    if (loading) return;
    setLoading(true);
    setServerError(null);

    const payload = {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      business_name: data.business_name.trim(),
      company: data.business_name.trim(),
      category: "WhatsApp Automation Early Access",
      services: ["WhatsApp & CRM Automations", "LeadFlow Early Access"],
      message: data.message.trim(),
    };

    try {
      // Primary: Post to local Next.js route handler which synchronizes with backend
      let res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // If Next.js internal route is offline, attempt direct fallback to API backend
      if (!res.ok) {
        try {
          res = await fetch(`${API_URL}/api/v1/leads`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch {
          // Handled below
        }
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || "Failed to submit. Please try again.");
      }

      const record = {
        ...data,
        submittedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem("leadflow_early_access_lead", JSON.stringify(record));
        localStorage.setItem("techinfinix_submitted_lead", JSON.stringify(record));
      } catch {
        // Ignore localStorage quota warnings
      }

      setSubmittedLead(record);
      setLoading(false);

      // Trigger celebration confetti
      if (typeof window !== "undefined") {
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 },
          colors: ["#10B981", "#059669", "#34D399", "#2962FF", "#6366F1"],
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please check your connection.";
      setServerError(msg);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmittedLead(null);
    reset();
    try {
      localStorage.removeItem("leadflow_early_access_lead");
    } catch {
      // Ignore
    }
  };

  return (
    <section id="early-access" className="py-20 md:py-28 border-t border-border-custom bg-background relative overflow-hidden">
      {/* Background glow accents */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[420px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border-custom bg-surface p-6 sm:p-10 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Top Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Priority Access Program</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">
              Be Among the First to Experience{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
                LeadFlow CRM
              </span>
            </h2>

            <p className="text-secondary-custom text-sm sm:text-base leading-relaxed">
              We are currently in active private preview. Subscribe to receive launch notifications, private beta invitations, and early adopter onboarding access.
            </p>
          </div>

          {/* Form or Confirmation State */}
          {submittedLead ? (
            /* ═══════ CONFIRMATION CARD (AFTER SUBMISSION) ═══════ */
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-500/10 p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-border-custom">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Early Access Priority Confirmed</span>
                </div>
                <span className="text-xs font-mono text-secondary-custom">
                  LeadFlow Launch Waitlist
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Thank You, {submittedLead.name}!
                  </h3>
                  <p className="text-xs sm:text-sm text-secondary-custom mt-0.5">
                    We have reserved priority onboarding for <span className="font-semibold text-foreground">{submittedLead.business_name}</span>.
                  </p>
                </div>
              </div>

              {/* Inquiry Summary */}
              <div className="bg-background/80 border border-border-custom rounded-xl p-4 sm:p-5 space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary-custom block border-b border-border-custom pb-2">
                  Submitted Profile Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-secondary-custom block">Contact Person</span>
                    <span className="font-semibold text-foreground">{submittedLead.name}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-secondary-custom block">Work Email</span>
                    <span className="font-semibold text-foreground">{submittedLead.email}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-secondary-custom block">Phone / WhatsApp</span>
                    <span className="font-semibold text-foreground">{submittedLead.phone}</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-secondary-custom block">Business / Company</span>
                    <span className="font-semibold text-foreground">{submittedLead.business_name}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-border-custom text-xs">
                  <span className="text-[11px] text-secondary-custom block mb-1">Why your team needs LeadFlow:</span>
                  <p className="text-foreground italic bg-surface/50 p-2.5 rounded-lg border border-border-custom/50">
                    &ldquo;{submittedLead.message}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-border-custom">
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-secondary-custom hover:text-foreground flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Register another team or update submission</span>
                </button>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  Verified Lead Record
                </span>
              </div>
            </div>
          ) : (
            /* ═══════ THE 5 REQUESTED FIELDS FORM ═══════ */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Field 1: Name */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-name" className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Your Name</span>
                    <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="lead-name"
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      {...register("name")}
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/50 focus:outline-none focus:ring-2 transition ${
                        errors.name
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-border-custom focus:ring-emerald-500/30 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <span className="text-[11px] text-red-500 block">{errors.name.message}</span>
                  )}
                </div>

                {/* Field 2: Work Email */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-email" className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Work Email</span>
                    <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="lead-email"
                      type="email"
                      placeholder="name@company.com"
                      {...register("email")}
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/50 focus:outline-none focus:ring-2 transition ${
                        errors.email
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-border-custom focus:ring-emerald-500/30 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <span className="text-[11px] text-red-500 block">{errors.email.message}</span>
                  )}
                </div>

                {/* Field 3: Phone Number */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-phone" className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Phone / WhatsApp Number</span>
                    <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="lead-phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      {...register("phone")}
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/50 focus:outline-none focus:ring-2 transition ${
                        errors.phone
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-border-custom focus:ring-emerald-500/30 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <span className="text-[11px] text-red-500 block">{errors.phone.message}</span>
                  )}
                </div>

                {/* Field 4: Business Name */}
                <div className="space-y-1.5">
                  <label htmlFor="lead-business" className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <span>Company / Business Name</span>
                    <span className="text-emerald-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-secondary-custom/60 absolute left-3.5 top-3.5 pointer-events-none" />
                    <input
                      id="lead-business"
                      type="text"
                      placeholder="e.g. Apex Digital Solutions"
                      {...register("business_name")}
                      className={`w-full bg-background border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/50 focus:outline-none focus:ring-2 transition ${
                        errors.business_name
                          ? "border-red-500 focus:ring-red-500/20"
                          : "border-border-custom focus:ring-emerald-500/30 focus:border-emerald-500"
                      }`}
                    />
                  </div>
                  {errors.business_name && (
                    <span className="text-[11px] text-red-500 block">{errors.business_name.message}</span>
                  )}
                </div>
              </div>

              {/* Field 5: Message (Why they need it) */}
              <div className="space-y-1.5">
                <label htmlFor="lead-message" className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-secondary-custom" />
                    <span>Why do you need LeadFlow? (Current Workflow &amp; Goals)</span>
                    <span className="text-emerald-500">*</span>
                  </span>
                  <span className="text-[11px] text-secondary-custom font-normal">Min 10 characters</span>
                </label>
                <textarea
                  id="lead-message"
                  rows={3}
                  placeholder="Tell us about your team's WhatsApp outreach volume, how you currently handle follow-ups, and what problems you want LeadFlow to solve..."
                  {...register("message")}
                  className={`w-full bg-background border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-secondary-custom/50 focus:outline-none focus:ring-2 transition resize-none ${
                    errors.message
                      ? "border-red-500 focus:ring-red-500/20"
                      : "border-border-custom focus:ring-emerald-500/30 focus:border-emerald-500"
                  }`}
                />
                {errors.message && (
                  <span className="text-[11px] text-red-500 block">{errors.message.message}</span>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reserving Your Priority Spot...</span>
                  </>
                ) : (
                  <>
                    <span>Get Early Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Privacy Reassurance */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs text-secondary-custom text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Zero spam guarantee. Your details will strictly be used for launch notifications.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
