"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Cpu, 
  Database, 
  Mail, 
  TrendingUp,
  Loader2,
  MessageSquare
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";
import { useAuthStore } from "@/lib/authStore";
import { ADMIN_PATH } from "@/lib/config";

export default function AutomationPage() {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  
  const [scraperStatus, setScraperStatus] = useState<any>({ is_running: false });
  const [leadsCount, setLeadsCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch status and leads count to display details in the card
  const fetchStats = async () => {
    try {
      const responseStatus = await authFetch(`${API}/api/v1/scraper/status`);
      if (responseStatus.ok) {
        const data = await responseStatus.json();
        setScraperStatus(data);
      }
      
      const responseLeads = await authFetch(`${API}/api/v1/scraped-leads/?page=1&limit=1`);
      if (responseLeads.ok) {
        const data = await responseLeads.json();
        setLeadsCount(data.total);
      }

      const responseEmails = await authFetch(`${API}/api/v1/email/analytics`);
      if (responseEmails.ok) {
        const data = await responseEmails.json();
        setSentCount(data.total_sent || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center flex-col gap-3">
        <Loader2 className="w-8 h-8 text-accent-custom animate-spin" />
        <span className="font-mono text-xs text-gray-500 dark:text-[#B0B0B0]">Loading Automation Deck...</span>
      </div>
    );
  }

  return (
    <div className="space-y-10 text-left pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
          <Cpu className="w-8 h-8 text-accent-custom" />
          Workflow Automation
        </h1>
        <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
          Orchestrate outbound lead generation and local scraping bots.
        </p>
      </div>

      {/* Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Lead Scraper Automation */}
        <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-accent-custom/50 hover:shadow-[0_0_20px_rgba(79,124,255,0.08)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-md bg-accent-custom/10 flex items-center justify-center text-accent-custom">
                <Database className="w-5 h-5" />
              </div>
              <span className={`px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider border ${
                scraperStatus.is_running 
                  ? "bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse font-mono" 
                  : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono"
              }`}>
                {scraperStatus.is_running ? "Running" : "Active"}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Lead Scraper Automation</h3>
              <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-sans leading-relaxed">
                Targeted Google Maps scraper export importer that extracts business listings, phone numbers, and categories for outreach.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="font-mono text-[10px] text-gray-400">
              Synced Leads: <span className="font-bold text-gray-700 dark:text-white">{leadsCount}</span>
            </div>
            <button
              onClick={() => router.push(`${ADMIN_PATH}/dashboard/automation/lead-scraper`)}
              className="px-3.5 py-2 bg-accent-custom hover:bg-accent-custom/90 text-white rounded-lg text-xs font-mono font-bold transition-all hover:scale-102 cursor-pointer shadow-sm"
            >
              Open Automation
            </button>
          </div>
        </div>

        {/* Card 2: Outbound Email Outreach */}
        <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-accent-custom/50 hover:shadow-[0_0_20px_rgba(79,124,255,0.08)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-md bg-accent-custom/10 flex items-center justify-center text-accent-custom">
                <Mail className="w-5 h-5" />
              </div>
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider font-mono">
                Active
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Outbound Email Outreach</h3>
              <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-sans leading-relaxed">
                Automate personalized cold sequences targeting extracted email leads. Automatically handles unsubscribes and responses.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="font-mono text-[10px] text-gray-400">
              Emails Sent: <span className="font-bold text-gray-700 dark:text-white">{sentCount}</span>
            </div>
            <button
              onClick={() => router.push(`${ADMIN_PATH}/dashboard/automation/outreach`)}
              className="px-3.5 py-2 bg-accent-custom hover:bg-accent-custom/90 text-white rounded-lg text-xs font-mono font-bold transition-all hover:scale-102 cursor-pointer shadow-sm"
            >
              Open Outreach
            </button>
          </div>
        </div>

        {/* Card 3: WhatsApp Outreach & Evolution API */}
        <div className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] rounded-md p-6 shadow-sm flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)] transition-all duration-300 transform hover:-translate-y-1">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <MessageSquare className="w-5 h-5" />
              </div>
              <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase text-[8px] tracking-wider font-mono">
                LIVE
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                WhatsApp Automation
              </h3>
              <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-sans leading-relaxed">
                Evolution API powered WhatsApp outreach with interactive buttons, test mode redirection, interested customer tracking &amp; instant email alerts.
              </p>
            </div>
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
            <div className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
              Sender: 7990738939
            </div>
            <button
              onClick={() => router.push(`${ADMIN_PATH}/dashboard/automation/whatsapp`)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-bold transition-all hover:scale-102 cursor-pointer shadow-sm"
            >
              Launch WhatsApp &rarr;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
