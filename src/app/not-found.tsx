import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import FooterSection from "@/components/layout/FooterSection";
import { ArrowLeft, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 py-24 bg-background">
        <div className="max-w-md w-full flex flex-col items-center gap-5">
          <div className="w-14 h-14 rounded-2xl border border-border-custom bg-surface flex items-center justify-center text-secondary-custom shadow-sm">
            <AlertCircle className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono font-bold tracking-widest text-secondary-custom uppercase">
              404 &bull; Error
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Page Not Found
            </h1>
            <p className="text-xs sm:text-sm text-secondary-custom max-w-sm leading-relaxed">
              The requested resource does not exist, has been relocated, or is restricted.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-foreground text-background text-xs font-mono font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity mt-2 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Home</span>
          </Link>
        </div>
      </main>
      <FooterSection />
    </>
  );
}
