"use client";

import React, { useState } from "react";
import { API_URL } from "@/lib/config";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import confetti from "canvas-confetti";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import SplitText from "@/components/animations/SplitText";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  message: z.string().min(10, "Message must be at least 10 characters")
});

type LeadFormValues = z.infer<typeof leadSchema>;

export default function ContactSection() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const availableServices = [
    "AI Agents",
    "AI Automation",
    "SaaS Development",
    "Web Scraping",
    "API Development",
    "CRM Automation",
    "SEO Systems"
  ];

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      services: [],
      message: ""
    }
  });

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/v1/leads/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to submit inquiry. Please try again.");
      }

      // Success
      setSuccess(true);
      setLoading(false);
      
      // Blast Confetti
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#4f7cff", "#a855f7", "#06b6d4"]
      });

      reset();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Something went wrong. Please connect with us at hello@nexora.ai");
    }
  };

  return (
    <section
      id="contact"
      className="py-32 bg-background relative overflow-hidden"
    >
      {/* Glow elements */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[50vw] h-[50vw] mesh-gradient-2 opacity-30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
        
        {/* Left column: Typography */}
        <div className="lg:col-span-5 flex flex-col justify-center items-start text-left">
          <div className="inline-flex items-center gap-2 border border-border-custom bg-surface/50 px-3 py-1 rounded-full mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-accent-custom">
              Initiate Project
            </span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
            <SplitText text="Ready To Build Something Intelligent?" type="words" />
          </h2>
          
          <p className="text-lg text-secondary-custom leading-relaxed mb-8 max-w-md">
            Fill out our brief details form. Our lead systems architect will evaluate your requirements and schedule an in-depth audit call.
          </p>

          <div className="flex flex-col gap-3 text-sm text-secondary-custom">
            <div>
              <span>Email: </span>
              <a href="mailto:hello@nexora.ai" className="text-foreground hover:text-accent-custom font-semibold">
                hello@nexora.ai
              </a>
            </div>
            <div>
              <span>Location: </span>
              <span className="text-foreground font-semibold">San Francisco, CA / Remote</span>
            </div>
          </div>
        </div>

        {/* Right column: Glass Contact Form */}
        <div className="lg:col-span-7 flex items-center justify-center">
          <div className="w-full border border-border-custom bg-surface/30 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl relative">
            
            {success ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground mb-4">
                  Inquiry Received!
                </h3>
                <p className="text-secondary-custom text-sm leading-relaxed max-w-sm mx-auto mb-8">
                  Your lead profile has been compiled and saved. Our lead systems engineer will review it and reply within 24 hours.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-bold bg-accent-custom text-white hover:bg-blue-600 px-6 py-3 rounded transition-all"
                >
                  Submit another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Error message */}
                {error && (
                  <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                    {error}
                  </div>
                )}

                {/* Grid Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="flex flex-col items-start">
                    <label className="text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      {...register("name")}
                      className="w-full bg-surface/50 border border-border-custom rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-custom transition-all"
                    />
                    {errors.name && (
                      <span className="text-[10px] text-red-500 mt-1">{errors.name.message}</span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col items-start">
                    <label className="text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="jane@company.com"
                      {...register("email")}
                      className="w-full bg-surface/50 border border-border-custom rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-custom transition-all"
                    />
                    {errors.email && (
                      <span className="text-[10px] text-red-500 mt-1">{errors.email.message}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="flex flex-col items-start">
                    <label className="text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      {...register("phone")}
                      className="w-full bg-surface/50 border border-border-custom rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-custom transition-all"
                    />
                  </div>

                  {/* Company */}
                  <div className="flex flex-col items-start">
                    <label className="text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      placeholder="Acme Inc."
                      {...register("company")}
                      className="w-full bg-surface/50 border border-border-custom rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-custom transition-all"
                    />
                  </div>
                </div>

                {/* Services multi-select */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-3">
                    Select Services Required *
                  </label>
                  
                  <Controller
                    name="services"
                    control={control}
                    render={({ field }) => (
                      <div className="flex flex-wrap gap-2.5">
                        {availableServices.map((service) => {
                          const isSelected = field.value?.includes(service);
                          return (
                            <button
                              type="button"
                              key={service}
                              onClick={() => {
                                const newValue = isSelected
                                  ? field.value.filter((v: string) => v !== service)
                                  : [...(field.value || []), service];
                                field.onChange(newValue);
                              }}
                              className={`px-4 py-2 rounded-lg border text-xs font-bold font-mono transition-all duration-300 cursor-pointer ${
                                isSelected
                                  ? "border-accent-custom bg-accent-custom text-white shadow-md shadow-blue-500/20"
                                  : "border-border-custom bg-surface/50 hover:border-accent-custom/50 hover:bg-surface text-secondary-custom hover:text-foreground"
                              }`}
                            >
                              {service}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />
                  {errors.services && (
                    <span className="text-[10px] text-red-500 mt-2">{errors.services.message}</span>
                  )}
                </div>

                {/* Message */}
                <div className="flex flex-col items-start">
                  <label className="text-xs font-semibold uppercase tracking-wider text-secondary-custom mb-2">
                    Describe Your Project Requirements *
                  </label>
                  <textarea
                    rows={4}
                    placeholder="We want to automate outbound follow-ups and build a Next.js client dashboard..."
                    {...register("message")}
                    className="w-full bg-surface/50 border border-border-custom rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent-custom transition-all resize-none"
                  />
                  {errors.message && (
                    <span className="text-[10px] text-red-500 mt-1">{errors.message.message}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-foreground text-background hover:bg-accent-custom hover:text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Ingesting Profile...
                    </>
                  ) : (
                    <>
                      Submit Project Details
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
