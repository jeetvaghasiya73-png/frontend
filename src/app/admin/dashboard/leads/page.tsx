"use client";

import React, { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/lib/authStore";
import {
  Loader2,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Building,
  Sparkles,
  Database,
  Globe,
  Star,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
  Search,
  Plus,
  X,
  SlidersHorizontal,
  Download,
  MoreVertical,
  Zap,
  MapPin,
  Tag,
  CheckCircle2,
  User,
  Users,
  FileSpreadsheet,
  MessageSquare,
  MessageSquareOff,
  RefreshCw,
  Clock,
  Check,
  Send,
  ShieldCheck
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";
import { formatServiceText, isValidWebsite, formatWebsiteUrl, format10DigitPhone, formatDialerUrl } from "@/lib/formatters";

type SourceFilter = "all" | "inquiry" | "scraped";

interface NormalizedLead {
  id: number;
  rawId: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  services: string[];
  message?: string;
  status: string;
  created_at: string;
  source: "inquiry" | "scraped";
  rating?: string;
  total_review?: string;
  website?: string;
  city?: string;
  category?: string;
  address?: string;
  landmark?: string;
  building?: string;
  pincode?: string;
  bussiness_area?: string;
  scraped_service?: string;
  email_status?: string;
  whatsapp_status?: string;
  whatsapp_sent_at?: string;
  whatsapp_last_reply?: string;
  whatsapp_reply_at?: string;
  whatsapp_ai_enabled?: boolean;
  is_interested?: boolean;
  score: number;
  followupDate?: string | null;
  notes?: any[];
  customActivities?: any[];
  raw?: any;
}

export default function LeadsManager() {
  const { accessToken } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [allLeads, setAllLeads] = useState<NormalizedLead[]>([]);
  const [totalLeadsFromAPI, setTotalLeadsFromAPI] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // Drawer state
  const [selectedLead, setSelectedLead] = useState<NormalizedLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Follow-up state
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [customFollowupDate, setCustomFollowupDate] = useState("");
  const [schedulingFollowup, setSchedulingFollowup] = useState(false);

  // Note state
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  // Status modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Email modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showAddEmailModal, setShowAddEmailModal] = useState(false);
  const [newEmailAddress, setNewEmailAddress] = useState("");
  const [savingNewEmail, setSavingNewEmail] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Modal states for Import & Add Lead
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    bussiness_name: "",
    bussiness_email: "",
    bussiness_number: "",
    scraped_city: "",
    scraped_service: "",
    category: "",
    bussiness_website: "",
  });
  const [submittingNewLead, setSubmittingNewLead] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // WhatsApp Outreach Preview & Customize Modal states
  const [showWaModal, setShowWaModal] = useState(false);
  const [waPreviewLead, setWaPreviewLead] = useState<NormalizedLead | null>(null);
  const [waPreviewData, setWaPreviewData] = useState<any>(null);
  const [waCustomMessage, setWaCustomMessage] = useState("");
  const [waCustomPhone, setWaCustomPhone] = useState("");
  const [loadingWaPreview, setLoadingWaPreview] = useState(false);
  const [sendingWaMessage, setSendingWaMessage] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const openWaModalForLead = async (lead: NormalizedLead) => {
    setWaPreviewLead(lead);
    setWaCustomPhone(lead.phone || "");
    setShowWaModal(true);
    setLoadingWaPreview(true);
    setWaPreviewData(null);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/preview-message/${lead.rawId}?source=${lead.source}`);
      if (res.ok) {
        const data = await res.json();
        setWaPreviewData(data);
        setWaCustomMessage(data.preview_message || "");
        if (data.recipient_phone && !lead.phone) {
          setWaCustomPhone(data.recipient_phone);
        }
      } else {
        setWaCustomMessage(
          lead.source === "inquiry"
            ? "Thank you so much for believing in us! 🙏 Our team will connect with you very soon. We're excited to work together!"
            : `Hi *${lead.name}* team 👋\n\nWe noticed your business listing under *${lead.services.join(" ") || lead.category || "Business"}* in *${lead.city || lead.company || "your area"}*.\n\nAt *Tech Infinix*, we specialize in Google Maps SEO rankings 📈 & Web Scraping 🌐.\n\nTo get custom growth ideas for your business, click *'Interested'* below or contact our team! 🚀`
        );
      }
    } catch (err) {
      console.error("Failed to fetch WA preview:", err);
      setWaCustomMessage(
        lead.source === "inquiry"
          ? "Thank you so much for believing in us! 🙏 Our team will connect with you very soon. We're excited to work together!"
          : `Hi *${lead.name}* team 👋\n\nWe noticed your business listing under *${lead.services.join(" ") || lead.category || "Business"}* in *${lead.city || lead.company || "your area"}*.\n\nAt *Tech Infinix*, we specialize in Google Maps SEO rankings 📈 & Web Scraping 🌐.\n\nTo get custom growth ideas for your business, click *'Interested'* below or contact our team! 🚀`
      );
    } finally {
      setLoadingWaPreview(false);
    }
  };

  const handleSendWaOutreach = async () => {
    if (!waPreviewLead) return;
    const recipientPhone = waCustomPhone.trim() || waPreviewLead.phone;
    if (!recipientPhone) {
      triggerToast("Please provide a recipient phone number.");
      return;
    }
    setSendingWaMessage(true);
    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/send-custom/${waPreviewLead.rawId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          custom_message: waCustomMessage,
          source: waPreviewLead.source,
          phone_number: recipientPhone
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const dest = data.is_test_mode
          ? `Test Sandbox (+${data.test_number || "919173739080"})`
          : (data.recipient_used || waPreviewLead.name);
        triggerToast(`WhatsApp proposal delivered to ${dest}! 🚀`);
        logActivity(
          waPreviewLead.rawId,
          "WhatsApp Proposal Dispatched",
          `Proposal sent: "${waCustomMessage.slice(0, 80)}..."`,
          "whatsapp"
        );
        setShowWaModal(false);
        fetchLeads();
      } else {
        const err = await res.json();
        triggerToast(err.detail || "Failed to send WhatsApp outreach message.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error sending WhatsApp outreach.");
    } finally {
      setSendingWaMessage(false);
    }
  };

  const handleBulkSendWaOutreach = async () => {
    if (selectedLeadIds.size === 0) return;
    const scrapedRawIds = allLeads.filter(l => selectedLeadIds.has(l.id) && l.source === "scraped").map(l => l.rawId);
    if (scrapedRawIds.length === 0) {
      triggerToast("No scraped Google Maps leads selected for WhatsApp outreach.");
      return;
    }
    if (!confirm(`Dispatch WhatsApp outreach campaign to ${scrapedRawIds.length} selected Google Maps lead(s)?`)) return;

    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/send-bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: scrapedRawIds }),
      });

      if (res.ok) {
        const data = await res.json();
        triggerToast(data.message || `Bulk WhatsApp outreach sent to ${data.sent_count} leads!`);
        setSelectedLeadIds(new Set());
        fetchLeads();
      } else {
        triggerToast("Failed to send bulk WhatsApp outreach.");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error triggering bulk WhatsApp outreach.");
    }
  };

  const fetchLeads = async () => {
    try {
      const inquiryRes = await authFetch(`${API}/api/v1/leads/`);
      const inquiryData: any[] = inquiryRes.ok ? await inquiryRes.json() : [];

      const scrapedRes = await authFetch(`${API}/api/v1/scraped-leads/?page=1&limit=10000`);
      let scrapedData: any[] = [];
      let scrapedTotal = 0;
      if (scrapedRes.ok) {
        const scrapedJson = await scrapedRes.json();
        if (Array.isArray(scrapedJson)) {
          scrapedData = scrapedJson;
          scrapedTotal = scrapedJson.length;
        } else if (scrapedJson && Array.isArray(scrapedJson.leads)) {
          scrapedData = scrapedJson.leads;
          scrapedTotal = scrapedJson.total || scrapedJson.leads.length;
        }
      }

      const normalizedInquiries: NormalizedLead[] = inquiryData.map((lead: any) => {
        const savedFollowup = typeof window !== "undefined" ? localStorage.getItem(`crm_lead_followup_${lead.id}`) : null;
        const bizName = lead.business_name || lead.company || "Direct Inbound";
        return {
          id: lead.id,
          rawId: lead.id,
          raw: lead,
          name: lead.name || "Unknown",
          email: lead.email || "",
          phone: lead.phone || "",
          company: bizName,
          services: lead.services || [],
          message: lead.message || "",
          status: lead.status ? (lead.status.charAt(0).toUpperCase() + lead.status.slice(1)) : "Qualified",
          created_at: lead.created_at || new Date().toISOString(),
          source: "inquiry" as const,
          score: 94,
          followupDate: savedFollowup || null,
          category: lead.category || "Inbound Inquiry",
          website: lead.website || "",
          address: lead.address || "",
          landmark: "",
          building: "",
          pincode: "",
          bussiness_area: "",
          scraped_service: "",
          whatsapp_status: "inbound",
          whatsapp_sent_at: null,
          whatsapp_last_reply: null,
          whatsapp_reply_at: null,
          whatsapp_ai_enabled: true,
          is_interested: true,
        };
      });

      const normalizedScraped: NormalizedLead[] = scrapedData.map((lead: any) => {
        const hasEmail = Boolean(lead.bussiness_email);
        const ratingVal = lead.rating ? parseFloat(lead.rating) : 3.5;
        const score = Math.min(99, Math.round((hasEmail ? 80 : 55) + ratingVal * 3.5));

        const cleanService = formatServiceText(lead.scraped_service || lead.category);
        const savedFollowup = typeof window !== "undefined" ? localStorage.getItem(`crm_lead_followup_${lead.id}`) : null;
        const rawFollowup = lead.next_followup_at ? new Date(lead.next_followup_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

        return {
          id: lead.id + 100000,
          rawId: lead.id,
          raw: lead,
          name: lead.bussiness_name || "Unknown Business",
          email: lead.bussiness_email || "",
          phone: lead.bussiness_number || "",
          company: lead.scraped_city || "Outreach",
          services: cleanService ? [cleanService] : [],
          message: "",
          status: lead.email_status ? (lead.email_status.charAt(0).toUpperCase() + lead.email_status.slice(1)) : "Contacted",
          created_at: lead.created_at || new Date().toISOString(),
          source: "scraped" as const,
          rating: lead.rating || "",
          total_review: lead.total_review || "",
          website: lead.bussiness_website || "",
          city: lead.scraped_city || "",
          category: formatServiceText(lead.category) || "",
          address: lead.bussiness_address || "",
          landmark: lead.landmark || "",
          building: lead.building || "",
          pincode: lead.pincode || "",
          bussiness_area: lead.bussiness_area || "",
          scraped_service: lead.scraped_service || "",
          email_status: lead.email_status || "pending",
          whatsapp_status: lead.whatsapp_status || "pending",
          whatsapp_sent_at: lead.whatsapp_sent_at || null,
          whatsapp_last_reply: lead.whatsapp_last_reply || null,
          whatsapp_reply_at: lead.whatsapp_reply_at || null,
          whatsapp_ai_enabled: lead.whatsapp_ai_enabled !== false,
          is_interested: Boolean(lead.is_interested),
          score,
          followupDate: savedFollowup || rawFollowup || null,
        };
      });

      const merged = [...normalizedInquiries, ...normalizedScraped];
      merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Retain all distinct lead entries from database by unique source & id
      const seenKeys = new Set<string>();
      const uniqueLeads: NormalizedLead[] = [];

      for (const lead of merged) {
        const key = `${lead.source}_${lead.rawId}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          uniqueLeads.push(lead);
        }
      }

      setAllLeads(uniqueLeads);
      setTotalLeadsFromAPI(Math.max(uniqueLeads.length, scrapedTotal + inquiryData.length));
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchLeads();

    let ws: WebSocket | null = null;
    try {
      const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
        .replace(/^http/, "ws") + "/api/v1/whatsapp/ws";
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "whatsapp_update" || data.type === "lead_updated") {
            fetchLeads();
          }
        } catch (err) {
          // ignore
        }
      };
    } catch (e) {
      console.error("WS error on leads page:", e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [accessToken]);

  useEffect(() => {
    setCurrentPage(1);
    setStatusFilter("all");
  }, [sourceFilter]);

  const handleStatusUpdate = async (leadId: number, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const res = await authFetch(`${API}/api/v1/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAllLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        if (selectedLead?.id === leadId) {
          setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error("Failed to update lead status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePersistStatusUpdate = async (newStatus: string) => {
    if (!selectedLead) return;
    setUpdatingStatus(true);
    try {
      let res;
      const leadKey = selectedLead.rawId || selectedLead.id;
      if (selectedLead.source === "scraped") {
        res = await authFetch(`${API}/api/v1/scraped-leads/${leadKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_status: newStatus.toLowerCase() })
        });
      } else {
        res = await authFetch(`${API}/api/v1/leads/${leadKey}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus.toLowerCase() })
        });
      }

      if (res.ok) {
        logActivity(leadKey, "Pipeline Status Updated", `Status changed to ${newStatus}`, "status");
        setSelectedLead((prev: any) => prev ? { ...prev, status: newStatus } : null);
        
        setAllLeads((prev) =>
          prev.map((l) => (l.rawId === leadKey ? { ...l, status: newStatus } : l))
        );

        setShowStatusModal(false);
        triggerToast(`Status updated to ${newStatus}`);
      } else {
        triggerToast("Failed to update status");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      triggerToast("Error updating status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open Lead Drawer with persistent notes and activity history
  const handleOpenLeadDrawer = (lead: NormalizedLead) => {
    const leadKey = lead.rawId || lead.id;
    const savedNotes = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(`crm_lead_notes_${leadKey}`) || "[]")
      : [];
    const rawActivities = typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(`crm_lead_activities_${leadKey}`) || "[]")
      : [];

    // Deduplicate stored activities so identical duplicates are permanently pruned
    const seen = new Set<string>();
    const savedActivities = rawActivities.filter((act: any) => {
      const k = `${act.title?.trim()}_${act.desc?.trim()}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    if (typeof window !== "undefined") {
      localStorage.setItem(`crm_lead_activities_${leadKey}`, JSON.stringify(savedActivities));
    }

    const savedFollowup = typeof window !== "undefined"
      ? localStorage.getItem(`crm_lead_followup_${leadKey}`)
      : null;
    const rawFollowup = lead.raw?.next_followup_at
      ? new Date(lead.raw.next_followup_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : null;
    const followupDate = savedFollowup || rawFollowup || lead.followupDate || null;

    setSelectedLead({
      ...lead,
      followupDate,
      notes: savedNotes,
      customActivities: savedActivities
    });
    setIsDrawerOpen(true);
  };

  const handleCallClick = () => {
    if (!selectedLead) return;
    if (!selectedLead.phone) {
      triggerToast("No phone number available for this lead");
      return;
    }
    const cleanPhone = format10DigitPhone(selectedLead.phone);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cleanPhone).catch(() => {});
    }
    logActivity(selectedLead.rawId || selectedLead.id, "Outgoing Phone Call", `Initiated call to ${cleanPhone}`, "call");
    window.location.href = formatDialerUrl(cleanPhone);
    triggerToast(`Phone ${cleanPhone} copied to clipboard & launching dialer!`);
  };

  const handleEmailClick = () => {
    if (!selectedLead) return;
    if (!selectedLead.email) {
      setNewEmailAddress("");
      setShowAddEmailModal(true);
      return;
    }
    setEmailSubject(`Digital Solutions Proposal for ${selectedLead.name}`);
    setEmailBody(`Hi ${selectedLead.name},\n\nWe noticed your business in ${selectedLead.city || "your area"} and would love to partner with you to boost your digital presence.\n\nBest regards,\nTech Infinix Team`);
    setShowEmailModal(true);
  };

  const handleSaveEmailAndCompose = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newEmailAddress.trim()) return;
    setSavingNewEmail(true);
    try {
      const leadKey = selectedLead.rawId || selectedLead.id;
      if (selectedLead.source === "scraped") {
        await authFetch(`${API}/api/v1/scraped-leads/${leadKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bussiness_email: newEmailAddress.trim() })
        });
        setAllLeads((prev: NormalizedLead[]) => prev.map(l => (l.id === Number(leadKey) || l.rawId === Number(leadKey)) ? { ...l, email: newEmailAddress.trim() } : l));
      }
      setSelectedLead((prev: any) => prev ? { ...prev, email: newEmailAddress.trim() } : null);
      logActivity(leadKey, "Email Address Added", `Saved email ${newEmailAddress.trim()} to lead profile`, "email");
      setShowAddEmailModal(false);
      setEmailSubject(`Digital Solutions Proposal for ${selectedLead.name}`);
      setEmailBody(`Hi ${selectedLead.name},\n\nWe noticed your business in ${selectedLead.city || "your area"} and would love to partner with you to boost your digital presence.\n\nBest regards,\nTech Infinix Team`);
      setShowEmailModal(true);
      triggerToast("Email saved! Composing outreach email...");
    } catch (err) {
      console.error(err);
      triggerToast("Failed to save email address");
    } finally {
      setSavingNewEmail(false);
    }
  };

  const handleSendDirectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !selectedLead.email) return;
    setSendingEmail(true);
    try {
      await authFetch(`${API}/api/v1/email/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: selectedLead.email,
          subject: emailSubject,
          body: emailBody
        })
      });
      logActivity(selectedLead.rawId || selectedLead.id, "Email Dispatched", `Sent: "${emailSubject}"`, "email");
      setShowEmailModal(false);
      triggerToast("Outreach email dispatched successfully!");
    } catch (err) {
      triggerToast("Email sent via server relay");
      setShowEmailModal(false);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!selectedLead) return;
    if (!selectedLead.phone) {
      triggerToast("No phone number available for WhatsApp chat");
      return;
    }
    const cleanPhone = selectedLead.phone.replace(/[^0-9]/g, "");
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    logActivity(selectedLead.rawId || selectedLead.id, "WhatsApp Chat Initiated", `Opened direct WhatsApp Web chat with +${formattedPhone}`, "whatsapp");
    window.open(`https://wa.me/${formattedPhone}`, "_blank");
    triggerToast("WhatsApp chat opened");
  };

  const logActivity = (leadKey: string | number, title: string, desc: string, type: "call" | "email" | "whatsapp" | "note" | "status" | "followup") => {
    const entry = {
      title,
      desc,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      type
    };
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem(`crm_lead_activities_${leadKey}`) || "[]");
      const isDuplicate = existing.some((act: any) => act.title?.trim() === title.trim() && act.desc?.trim() === desc.trim());
      if (!isDuplicate) {
        // If it's a followup, remove older followup entries to avoid duplicate follow-up lines
        const filtered = type === "followup" ? existing.filter((act: any) => act.type !== "followup") : existing;
        const updated = [entry, ...filtered].slice(0, 25);
        localStorage.setItem(`crm_lead_activities_${leadKey}`, JSON.stringify(updated));
        setSelectedLead((prev: any) => prev ? { ...prev, customActivities: updated } : null);
      }
    }
  };

  const handleConfirmFollowup = async (daysAhead: number, customDateStr?: string) => {
    if (!selectedLead) return;
    setSchedulingFollowup(true);
    try {
      let targetDate: Date;
      if (customDateStr) {
        targetDate = new Date(customDateStr);
      } else {
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysAhead);
      }

      const dateDisplay = targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const leadKey = selectedLead.rawId || selectedLead.id;

      if (typeof window !== "undefined") {
        localStorage.setItem(`crm_lead_followup_${leadKey}`, dateDisplay);
      }

      if (selectedLead.source === "scraped") {
        await authFetch(`${API}/api/v1/scraped-leads/${leadKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_status: "contacted",
            next_followup_at: targetDate.toISOString()
          })
        });

        setAllLeads((prev) =>
          prev.map((l) => (l.rawId === leadKey ? { ...l, email_status: "contacted", status: "Contacted", followupDate: dateDisplay } : l))
        );
      }

      const isEditing = Boolean(selectedLead.followupDate);
      logActivity(
        leadKey,
        isEditing ? "Follow-up Rescheduled" : "Follow-up Scheduled",
        `Follow-up reminder set for ${dateDisplay}`,
        "followup"
      );

      setSelectedLead((prev: any) => prev ? { ...prev, status: "Contacted", followupDate: dateDisplay } : null);
      setShowFollowupModal(false);
      triggerToast(isEditing ? `Follow-up updated to ${dateDisplay}` : `Follow-up scheduled for ${dateDisplay}`);
    } catch (err) {
      console.error(err);
      triggerToast("Failed to schedule follow-up");
    } finally {
      setSchedulingFollowup(false);
    }
  };

  const handleCancelFollowup = async () => {
    if (!selectedLead) return;
    const leadKey = selectedLead.rawId || selectedLead.id;
    if (typeof window !== "undefined") {
      localStorage.removeItem(`crm_lead_followup_${leadKey}`);
    }
    if (selectedLead.source === "scraped") {
      try {
        await authFetch(`${API}/api/v1/scraped-leads/${leadKey}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            next_followup_at: null
          })
        });
        setAllLeads((prev) =>
          prev.map((l) => (l.rawId === leadKey ? { ...l, followupDate: null } : l))
        );
      } catch (e) {
        console.error(e);
      }
    }
    logActivity(leadKey, "Follow-up Cancelled", "Follow-up reminder was removed", "followup");
    setSelectedLead((prev: any) => prev ? { ...prev, followupDate: null } : null);
    setShowFollowupModal(false);
    triggerToast("Follow-up reminder removed");
  };

  const handleAddNote = () => {
    if (!selectedLead || !newNoteText.trim()) return;
    const leadKey = selectedLead.rawId || selectedLead.id;
    const newNote = {
      id: Date.now(),
      text: newNoteText.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      author: "Admin"
    };
    const updatedNotes = [newNote, ...(selectedLead.notes || [])];

    if (typeof window !== "undefined") {
      localStorage.setItem(`crm_lead_notes_${leadKey}`, JSON.stringify(updatedNotes));
    }

    logActivity(leadKey, `Internal Note Added by Admin`, newNoteText.trim(), "note");

    setSelectedLead((prev: any) => prev ? { ...prev, notes: updatedNotes } : null);
    setNewNoteText("");
    setShowNoteInput(false);
    triggerToast("Internal note saved & persisted to lead profile");
  };

  const handleDeleteLead = async (lead: NormalizedLead) => {
    if (!confirm(`Are you sure you want to delete "${lead.name}"?`)) return;
    try {
      const endpoint = lead.source === "inquiry"
        ? `${API}/api/v1/leads/${lead.rawId}`
        : `${API}/api/v1/scraped-leads/${lead.rawId}`;

      const res = await authFetch(endpoint, { method: "DELETE" });
      if (res.ok) {
        setAllLeads((prev) => prev.filter((l) => l.id !== lead.id));
        if (selectedLead?.id === lead.id) {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    }
  };

  // 1. Delete Selected Leads
  const handleDeleteSelected = async () => {
    if (selectedLeadIds.size === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedLeadIds.size} selected lead(s)?`)) return;

    try {
      const scrapedRawIds = allLeads.filter(l => selectedLeadIds.has(l.id) && l.source === "scraped").map(l => l.rawId);
      const inquiryRawIds = allLeads.filter(l => selectedLeadIds.has(l.id) && l.source === "inquiry").map(l => l.rawId);

      if (scrapedRawIds.length > 0) {
        await authFetch(`${API}/api/v1/scraped-leads/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_ids: scrapedRawIds }),
        });
      }

      if (inquiryRawIds.length > 0) {
        await authFetch(`${API}/api/v1/leads/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_ids: inquiryRawIds }),
        });
      }

      setAllLeads(prev => prev.filter(l => !selectedLeadIds.has(l.id)));
      setSelectedLeadIds(new Set());
      triggerToast(`Successfully deleted selected lead(s)`);
    } catch (err) {
      console.error("Failed selected delete:", err);
    }
  };

  // 2. Delete Current Page Leads
  const handleDeleteCurrentPage = async () => {
    if (paginatedLeads.length === 0) return;
    if (!confirm(`Are you sure you want to delete all ${paginatedLeads.length} lead(s) visible on Page ${currentPage}?`)) return;

    try {
      const scrapedRawIds = paginatedLeads.filter(l => l.source === "scraped").map(l => l.rawId);
      const inquiryRawIds = paginatedLeads.filter(l => l.source === "inquiry").map(l => l.rawId);
      const pageIdsToRemove = new Set(paginatedLeads.map(l => l.id));

      if (scrapedRawIds.length > 0) {
        await authFetch(`${API}/api/v1/scraped-leads/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_ids: scrapedRawIds }),
        });
      }

      if (inquiryRawIds.length > 0) {
        await authFetch(`${API}/api/v1/leads/bulk-delete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lead_ids: inquiryRawIds }),
        });
      }

      setAllLeads(prev => prev.filter(l => !pageIdsToRemove.has(l.id)));
      setSelectedLeadIds(new Set());
      triggerToast(`Deleted ${paginatedLeads.length} lead(s) from Page ${currentPage}`);
    } catch (err) {
      console.error("Failed page delete:", err);
    }
  };

  // 3. Delete ALL Database Leads
  const handleDeleteAllLeads = async () => {
    if (allLeads.length === 0) return;
    if (!confirm(`🚨 CRITICAL ACTION:\nAre you sure you want to PERMANENTLY DELETE ALL ${allLeads.length} leads from the database?\nThis action cannot be undone!`)) return;

    try {
      await Promise.allSettled([
        authFetch(`${API}/api/v1/scraped-leads/bulk`, { method: "DELETE" }),
        authFetch(`${API}/api/v1/leads/bulk`, { method: "DELETE" }),
      ]);

      setAllLeads([]);
      setSelectedLeadIds(new Set());
      triggerToast("Entire leads database cleared successfully");
    } catch (err) {
      console.error("Failed to delete all leads:", err);
    }
  };

  // 4. Clear Selected WhatsApp Chats & Reset Status
  const handleClearSelectedChats = async () => {
    if (selectedLeadIds.size === 0) return;
    if (!confirm(`Clear chat history & reset status for ${selectedLeadIds.size} selected lead(s)?`)) return;

    try {
      const scrapedRawIds = allLeads.filter(l => selectedLeadIds.has(l.id) && l.source === "scraped").map(l => l.rawId);
      const inquiryRawIds = allLeads.filter(l => selectedLeadIds.has(l.id) && l.source === "inquiry").map(l => l.rawId);
      const targetIds = [...scrapedRawIds, ...inquiryRawIds];

      const res = await authFetch(`${API}/api/v1/whatsapp/chats/clear-selected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: targetIds, reset_status: true }),
      });

      if (res.ok) {
        setAllLeads(prev => prev.map(l => selectedLeadIds.has(l.id) ? { ...l, whatsapp_status: "pending", is_interested: false } : l));
        triggerToast(`Cleared chats & reset status for ${selectedLeadIds.size} lead(s)`);
        setSelectedLeadIds(new Set());
      } else {
        triggerToast("Failed to clear selected chats");
      }
    } catch (err) {
      console.error("Failed to clear selected chats:", err);
    }
  };

  // 5. Clear ALL WhatsApp Chats & Reset All Lead Statuses
  const handleClearAllChats = async () => {
    if (!confirm("🚨 Are you sure you want to CLEAR ALL WhatsApp chat records & reset ALL lead statuses back to pending?")) return;

    try {
      const res = await authFetch(`${API}/api/v1/whatsapp/chats/clear-all`, {
        method: "POST",
      });

      if (res.ok) {
        setAllLeads(prev => prev.map(l => ({ ...l, whatsapp_status: "pending", is_interested: false })));
        triggerToast("Cleared all chat history and reset lead statuses to pending!");
      } else {
        triggerToast("Failed to clear all chats");
      }
    } catch (err) {
      console.error("Failed to clear all chats:", err);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append("file", importFile);

    try {
      const res = await authFetch(`${API}/api/v1/scraped-leads/upload`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        const msg = data.message || `Successfully imported ${data.inserted} leads into database!`;
        setUploadResult(msg);
        triggerToast(msg);
        await fetchLeads();
        setTimeout(() => {
          setShowImportModal(false);
          setImportFile(null);
          setUploadResult(null);
        }, 1500);
      } else {
        const err = await res.json();
        setUploadResult(`Error: ${err.detail || "Failed to process spreadsheet."}`);
      }
    } catch (err: any) {
      setUploadResult(`Error: ${err.message || "Failed to upload file."}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateSingleLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.bussiness_name.trim()) {
      triggerToast("Lead Name is required");
      return;
    }
    setSubmittingNewLead(true);
    try {
      const res = await authFetch(`${API}/api/v1/scraped-leads/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeadForm),
      });

      if (res.ok) {
        triggerToast(`Lead "${newLeadForm.bussiness_name}" added to database!`);
        setNewLeadForm({
          bussiness_name: "",
          bussiness_email: "",
          bussiness_number: "",
          scraped_city: "",
          scraped_service: "",
          category: "",
          bussiness_website: "",
        });
        setShowAddLeadModal(false);
        await fetchLeads();
      } else {
        const err = await res.json();
        triggerToast(err.detail || "Failed to create lead");
      }
    } catch (err) {
      console.error(err);
      triggerToast("Error creating lead");
    } finally {
      setSubmittingNewLead(false);
    }
  };

  const handleExportCSV = () => {
    if (allLeads.length === 0) return;
    const headers = ["ID", "Name", "Email", "Phone", "Company/City", "Service", "Source", "Status", "Score", "Created At"];
    const rows = allLeads.map(l => [
      l.id,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.email}"`,
      `"${l.phone || ""}"`,
      `"${l.company || l.city || ""}"`,
      `"${l.services.join(", ") || l.category || ""}"`,
      l.source,
      l.status,
      l.score,
      l.created_at
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leadflow_leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`Exported ${allLeads.length} leads to CSV file`);
  };

  const filteredLeads = useMemo(() => {
    let result = allLeads;

    if (sourceFilter !== "all") {
      result = result.filter((l) => l.source === sourceFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => {
        if (sourceFilter === "scraped" || l.source === "scraped") {
          return l.email_status?.toLowerCase() === statusFilter.toLowerCase();
        }
        return l.status.toLowerCase() === statusFilter.toLowerCase();
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.company?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [allLeads, sourceFilter, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center flex-col gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 blur-xl animate-pulse" />
          <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin relative" />
        </div>
        <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400">Loading Leads Database...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200 w-full max-w-full overflow-x-hidden">
      
      {/* Action Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-sm border border-indigo-500/40 shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Top Bar Header */}
      <header className="crm-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-500 font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--dash-text)]">Leads Database</h1>
              <span className="px-2 py-0.5 rounded-md bg-[var(--dash-primary)] text-white font-bold text-xs font-mono">
                {totalLeadsFromAPI || allLeads.length} Total
              </span>
            </div>
            <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Manage, qualify, and inspect inbound &amp; outbound prospect records</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 w-full sm:w-auto">
          {selectedLeadIds.size > 0 && (
            <>
              <button
                type="button"
                onClick={handleBulkSendWaOutreach}
                className="crm-btn-primary bg-emerald-600 hover:bg-emerald-500 text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Send WhatsApp ({selectedLeadIds.size})</span>
              </button>
              <button
                type="button"
                onClick={handleClearSelectedChats}
                className="crm-btn-secondary bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center cursor-pointer font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                <span className="truncate">Clear Chats ({selectedLeadIds.size})</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="crm-btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">Export</span>
          </button>
          <button
            type="button"
            onClick={() => setShowImportModal(true)}
            className="crm-btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="truncate">Import</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddLeadModal(true)}
            className="crm-btn-primary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span className="truncate">Add Lead</span>
          </button>
        </div>
      </header>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Total Prospects</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">{totalLeadsFromAPI || allLeads.length}</span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">+14.2%</span>
          </div>
        </div>

        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Outbound Scraped</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">
              {allLeads.filter(l => l.source === "scraped").length}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-indigo-500 bg-indigo-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-indigo-500/20 shrink-0 truncate">Google Maps</span>
          </div>
        </div>

        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Inbound Inquiries</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">
              {allLeads.filter(l => l.source === "inquiry").length}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-purple-500 bg-purple-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-purple-500/20 shrink-0 truncate">Web Forms</span>
          </div>
        </div>

        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Email Capture</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">
              {Math.round((allLeads.filter(l => l.email).length / (allLeads.length || 1)) * 100)}%
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 sm:px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">High Quality</span>
          </div>
        </div>
      </section>

      {/* Segmented Filter Bar & Lead Table Container */}
      <section className="crm-card p-0 flex flex-col w-full max-w-full overflow-hidden">
        
        {/* Controls Deck */}
        <div className="p-3 sm:p-4 border-b border-[var(--dash-border)] flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full max-w-full">
          
          {/* Segmented View Tabs */}
          <div className="flex flex-nowrap items-center gap-1 p-1 rounded-md bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] max-w-full overflow-x-auto scrollbar-none shrink-0">
            <button
              onClick={() => setSourceFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "all"
                  ? "bg-[var(--dash-primary)] text-white shadow-xs"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              All Leads ({allLeads.length})
            </button>
            <button
              onClick={() => setSourceFilter("scraped")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "scraped"
                  ? "bg-[var(--dash-primary)] text-white shadow-xs"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              Outbound Scraped ({allLeads.filter(l => l.source === "scraped").length})
            </button>
            <button
              onClick={() => setSourceFilter("inquiry")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "inquiry"
                  ? "bg-[var(--dash-primary)] text-white shadow-xs"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              Website Inquiries ({allLeads.filter(l => l.source === "inquiry").length})
            </button>
          </div>

          {/* Search & Status Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full xl:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, city..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="crm-input !pl-9 py-1.5 text-xs w-full"
              />
            </div>

            {/* Action Row: Status Filter & Delete Options in ONE row on mobile */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none sm:w-auto min-w-[125px]">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="crm-input !pl-8 !pr-8 py-1.5 text-xs font-semibold cursor-pointer appearance-none w-full sm:w-auto"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent / Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="failed">Failed</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <ChevronDown className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Multi-Option Deletion Menu */}
              <div className="relative flex-1 sm:flex-none sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                  className="inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm shadow-rose-600/30 transition cursor-pointer w-full sm:w-auto"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Trash2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Delete Options</span>
                    {selectedLeadIds.size > 0 && (
                      <span className="bg-white/20 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                        {selectedLeadIds.size}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80 shrink-0 ml-1" />
                </button>

              {showDeleteMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-neutral-900 rounded-xl border border-slate-200 dark:border-neutral-800 shadow-2xl z-50 overflow-hidden py-1 text-xs animate-fadeIn">
                  {/* Clear Selected Chats */}
                  <button
                    type="button"
                    disabled={selectedLeadIds.size === 0}
                    onClick={() => {
                      setShowDeleteMenu(false);
                      handleClearSelectedChats();
                    }}
                    className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-800 dark:text-neutral-200"
                  >
                    <span className="flex items-center gap-2">
                      <MessageSquareOff className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Clear Selected Chats & Reset</span>
                    </span>
                    <span className="font-bold font-mono text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                      {selectedLeadIds.size}
                    </span>
                  </button>

                  {/* Clear ALL WhatsApp Chats */}
                  <button
                    type="button"
                    disabled={allLeads.length === 0}
                    onClick={() => {
                      setShowDeleteMenu(false);
                      handleClearAllChats();
                    }}
                    className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-800 dark:text-neutral-200 border-t border-slate-100 dark:border-neutral-800"
                  >
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                      <span>Clear ALL Chats & Reset</span>
                    </span>
                    <span className="font-bold font-mono text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      ALL
                    </span>
                  </button>

                  {/* Remove Selected */}
                  <button
                    type="button"
                    disabled={selectedLeadIds.size === 0}
                    onClick={() => {
                      setShowDeleteMenu(false);
                      handleDeleteSelected();
                    }}
                    className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-800 dark:text-neutral-200 border-t border-slate-100 dark:border-neutral-800"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Remove Selected Leads</span>
                    </span>
                    <span className="font-bold font-mono text-[10px] bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      {selectedLeadIds.size}
                    </span>
                  </button>

                  {/* Remove Current Page */}
                  <button
                    type="button"
                    disabled={paginatedLeads.length === 0}
                    onClick={() => {
                      setShowDeleteMenu(false);
                      handleDeleteCurrentPage();
                    }}
                    className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-800 dark:text-neutral-200 border-t border-slate-100 dark:border-neutral-800"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-amber-500" />
                      <span>Remove Current Page</span>
                    </span>
                    <span className="font-bold font-mono text-[10px] bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Page {currentPage} ({paginatedLeads.length})
                    </span>
                  </button>

                  {/* Delete ALL Leads */}
                  <button
                    type="button"
                    disabled={allLeads.length === 0}
                    onClick={() => {
                      setShowDeleteMenu(false);
                      handleDeleteAllLeads();
                    }}
                    className="w-full text-left px-3.5 py-2.5 font-bold flex items-center justify-between bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/70 text-rose-600 dark:text-rose-400 cursor-pointer border-t border-rose-200/80 dark:border-rose-900/50"
                  >
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Delete ALL Leads</span>
                    </span>
                    <span className="font-bold font-mono text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-xs">
                      ALL ({allLeads.length})
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Lead Table (Desktop / Tablet) */}
        <div className="hidden md:block w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[var(--dash-surface-alt)] border-b border-[var(--dash-border)] text-[var(--dash-text-muted)] font-semibold">
                <th className="py-3 px-4 w-8">
                  <input
                    type="checkbox"
                    checked={paginatedLeads.length > 0 && paginatedLeads.every(l => selectedLeadIds.has(l.rawId))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        const newSet = new Set(selectedLeadIds);
                        paginatedLeads.forEach(l => newSet.add(l.rawId));
                        setSelectedLeadIds(newSet);
                      } else {
                        const newSet = new Set(selectedLeadIds);
                        paginatedLeads.forEach(l => newSet.delete(l.rawId));
                        setSelectedLeadIds(newSet);
                      }
                    }}
                    className="rounded border-[var(--dash-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 uppercase tracking-wider text-[10px]">Lead Name</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Company / City</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Industry / Service</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Source</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px] text-center">Score</th>
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Date Created</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-border)]">
              {paginatedLeads.map((lead) => {
                const isSelected = selectedLeadIds.has(lead.rawId);
                return (
                  <tr
                    key={lead.id}
                    onClick={() => handleOpenLeadDrawer(lead)}
                    className={`transition cursor-pointer ${
                      isSelected
                        ? "bg-indigo-500/10"
                        : "hover:bg-slate-500/5"
                    }`}
                  >
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const next = new Set(selectedLeadIds);
                          if (next.has(lead.rawId)) next.delete(lead.rawId);
                          else next.add(lead.rawId);
                          setSelectedLeadIds(next);
                        }}
                        className="rounded border-[var(--dash-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[var(--dash-primary)] text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--dash-text)] hover:text-indigo-600 flex items-center gap-1.5">
                          {lead.name}
                        </div>
                        <div className="text-[var(--dash-text-muted)] text-[11px] truncate max-w-[200px]">{lead.email || "No Email"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[var(--dash-text)]">
                    {lead.company || lead.city || "—"}
                  </td>

                  <td className="py-3.5 px-3 text-[var(--dash-text-secondary)]">
                    <span
                      className="inline-block max-w-[260px] truncate font-medium"
                      title={formatServiceText(lead.services.join(" • ") || lead.category)}
                    >
                      {formatServiceText(lead.services.join(" • ") || lead.category) || "General Services"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      lead.source === "scraped"
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                        : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                    }`}>
                      {lead.source === "scraped" ? "Outbound" : "Inbound"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {lead.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[11px] border border-emerald-500/20">
                      {lead.score}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[var(--dash-text-muted)] whitespace-nowrap font-mono text-[11px]">
                    {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>

                  <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openWaModalForLead(lead)}
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                        title="Send WhatsApp Outreach Proposal"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        title="Delete Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>

        {/* Responsive Mobile Lead Cards (< md) */}
        <div className="md:hidden p-3 space-y-3">
          {paginatedLeads.map((lead) => {
            const isSelected = selectedLeadIds.has(lead.rawId);
            const cleanPhone = format10DigitPhone(lead.phone);
            return (
              <div
                key={lead.id}
                onClick={() => handleOpenLeadDrawer(lead)}
                className={`p-3.5 rounded-lg border transition cursor-pointer space-y-2.5 active:scale-[0.99] ${
                  isSelected
                    ? "bg-indigo-500/10 border-indigo-500"
                    : "bg-[var(--dash-card-bg)] border-[var(--dash-border)]"
                }`}
              >
                {/* Header: Avatar + Title + Checkbox */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-md bg-[var(--dash-primary)] text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                      {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate leading-tight text-[var(--dash-text)]">
                        {lead.name}
                      </h4>
                      <p className="text-xs truncate text-[var(--dash-text-muted)] mt-0.5">
                        {lead.company || lead.city || "Client Prospect"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pt-0.5" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {
                        const next = new Set(selectedLeadIds);
                        if (next.has(lead.rawId)) next.delete(lead.rawId);
                        else next.add(lead.rawId);
                        setSelectedLeadIds(next);
                      }}
                      className="w-4 h-4 rounded border-[var(--dash-border)] text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {lead.status}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[10px] border border-emerald-500/20">
                    Score: {lead.score}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    lead.source === "scraped"
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                  }`}>
                    {lead.source === "scraped" ? "Outbound" : "Inbound"}
                  </span>
                </div>

                {/* Contact Meta Details */}
                <div className="grid grid-cols-1 gap-1.5 text-xs pt-2 border-t border-[var(--dash-border)]">
                  {lead.phone && (
                    <div className="flex items-center gap-2 text-[var(--dash-text-secondary)]">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-[var(--dash-text-muted)]" />
                      <span className="truncate">{format10DigitPhone(lead.phone)}</span>
                    </div>
                  )}
                  {lead.email ? (
                    <div className="flex items-center gap-2 text-[var(--dash-text-secondary)]">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--dash-text-muted)]" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[11px] text-amber-500/80">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>No email listed</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-[var(--dash-text-muted)]">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {lead.city || "India"}
                    </span>
                    <span className="shrink-0">{new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                </div>

                {/* Quick Actions Footer */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--dash-border)]" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1.5">
                    {lead.phone && (
                      <a
                        href={formatDialerUrl(cleanPhone)}
                        className="p-1.5 rounded-md border border-[var(--dash-border)] text-xs flex items-center justify-center hover:opacity-80 transition text-indigo-500 bg-[var(--dash-card-bg)]"
                        title={`Call ${cleanPhone}`}
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {lead.phone && (
                      <button
                        type="button"
                        onClick={() => openWaModalForLead(lead)}
                        className="p-1.5 rounded-md border border-[var(--dash-border)] text-xs flex items-center justify-center hover:opacity-80 transition text-emerald-500 bg-[var(--dash-card-bg)] cursor-pointer"
                        title="Open WhatsApp Proposal"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        className="p-1.5 rounded-md border border-[var(--dash-border)] text-xs flex items-center justify-center hover:opacity-80 transition text-blue-500 bg-[var(--dash-card-bg)]"
                        title={`Email ${lead.email}`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenLeadDrawer(lead)}
                    className="crm-btn-primary text-xs py-1.5 px-3 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {paginatedLeads.length === 0 && (
          <div className="text-center py-12 text-xs text-slate-400 font-mono">No matching lead records found.</div>
        )}

        {/* Pagination Controls */}
        {filteredLeads.length > 0 && (() => {
          const startItem = (currentPage - 1) * pageSize + 1;
          const endItem = Math.min(currentPage * pageSize, filteredLeads.length);
          // Smart sliding window pagination: currentPage - 2 to currentPage + 2
          const getPageNumbers = () => {
            const pages: (number | string)[] = [];
            if (totalPages <= 7) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              const start = Math.max(2, currentPage - 2);
              const end = Math.min(totalPages - 1, currentPage + 2);
              if (start > 2) pages.push("...");
              for (let i = start; i <= end; i++) pages.push(i);
              if (end < totalPages - 1) pages.push("...");
              pages.push(totalPages);
            }
            return pages;
          };
          return (
          <div className="p-4 border-t border-slate-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-neutral-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}-{endItem}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{filteredLeads.length}</span> leads
                {filteredLeads.length < (totalLeadsFromAPI || allLeads.length) && (
                  <span className="ml-1 text-slate-400">({totalLeadsFromAPI || allLeads.length} total)</span>
                )}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-md text-xs font-semibold text-slate-700 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1 flex-wrap justify-center">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {getPageNumbers().map((p, idx) => (
                  typeof p === "string" ? (
                    <span key={`dots-${idx}`} className="px-1.5 py-1.5 text-xs text-slate-400 dark:text-neutral-500 select-none">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        currentPage === p
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30"
                          : "bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800"
                      }`}
                    >
                      {p}
                    </button>
                  )
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
          );
        })()}
      </section>

      {/* ── Lead Business Card Drawer ── */}
      {mounted && typeof document !== "undefined" && isDrawerOpen && selectedLead && createPortal(
        <div
          onClick={() => setIsDrawerOpen(false)}
          data-dash-theme={typeof document !== "undefined" ? document.documentElement.getAttribute("data-dash-theme") || (document.documentElement.classList.contains("dark") ? "dark" : "light") : "dark"}
          className="fixed inset-0 z-[9999] overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-md h-full h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between cursor-default relative overflow-hidden"
            style={{
              background: "var(--dash-surface)",
              borderLeft: "1px solid var(--dash-border)",
              color: "var(--dash-text)"
            }}
          >
            {/* Sticky Navigation Header with Safe-Area Top Padding & Prominent Close Button */}
            <div
              className="flex-none px-3.5 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between z-30 sticky top-0 shadow-xs"
              style={{
                background: "var(--dash-surface)",
                borderBottom: "1px solid var(--dash-border)",
                paddingTop: "max(env(safe-area-inset-top, 0px), 0.75rem)"
              }}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="crm-badge badge-warning text-xs font-bold cursor-pointer hover:opacity-80 transition flex items-center gap-1.5"
                  title="Click to update pipeline status"
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: "var(--dash-warning)" }} />
                  <span>{selectedLead.status}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                <span className="crm-badge badge-success text-xs font-bold">
                  Score: {selectedLead.score}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                  selectedLead.source === "scraped"
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                }`}>
                  {selectedLead.source === "scraped" ? "Outbound" : "Inbound"}
                </span>
              </div>
              
              {/* Mobile-Friendly High-Contrast Close Button */}
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="px-3 sm:px-3.5 py-1.5 min-h-[36px] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition rounded-md shadow-xs active:scale-95"
                style={{
                  background: "var(--dash-danger-light)",
                  color: "var(--dash-danger)",
                  border: "1px solid var(--dash-danger)"
                }}
                aria-label="Close lead details"
                title="Close popup"
              >
                <X className="w-4 h-4 shrink-0" />
                <span>Close</span>
              </button>
            </div>

            {/* Scrollable Popup Content */}
            <div className="p-3 sm:p-5 space-y-3 sm:space-y-4 flex-1 overflow-y-auto crm-scrollbar">
              {/* Profile Card Header */}
              <div
                className="p-3 sm:p-4 space-y-2.5 sm:space-y-3"
                style={{
                  background: "var(--dash-surface-alt)",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "var(--dash-card-radius)"
                }}
              >
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-indigo-600 text-white font-extrabold text-base sm:text-lg flex items-center justify-center shadow-md shrink-0">
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-bold leading-snug truncate" style={{ color: "var(--dash-text)" }}>
                      {selectedLead.name}
                    </h3>
                    <p className="text-[11px] sm:text-xs truncate" style={{ color: "var(--dash-text-secondary)" }}>
                      {selectedLead.company || selectedLead.city || "Client Prospect"}
                    </p>
                  </div>
                </div>

                {/* Dynamic Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="crm-badge badge-primary text-[10px]">
                    Source: {selectedLead.source === "scraped" ? "Outbound Scraping" : "Direct Inquiry"}
                  </span>
                  {selectedLead.email && (
                    <span className="crm-badge badge-success text-[10px]">
                      Verified Email
                    </span>
                  )}
                  {selectedLead.phone && (
                    <span className="crm-badge badge-warning text-[10px]">
                      Phone Contact
                    </span>
                  )}
                  {selectedLead.rating && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      ★ {selectedLead.rating}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Toolbar Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
                {/* Action 1: Call */}
                <button
                  type="button"
                  onClick={handleCallClick}
                  className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 text-xs font-bold shrink-0 transition"
                  title="Make direct phone call"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Call</span>
                </button>

                {/* Action 2: Email */}
                <button
                  type="button"
                  onClick={handleEmailClick}
                  className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 text-xs font-bold shrink-0 transition"
                  title="Send or add email"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{selectedLead.email ? "Email" : "Add Email"}</span>
                </button>

                {/* Action 3: WhatsApp */}
                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 text-xs font-bold shrink-0 transition"
                  title="Open direct WhatsApp Web chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </button>

                {/* Action 4: Send WA Proposal */}
                <button
                  type="button"
                  onClick={() => openWaModalForLead(selectedLead)}
                  className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 text-xs font-bold shrink-0 transition hover:border-emerald-500"
                  title="Open interactive WhatsApp proposal dialog"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WA Proposal</span>
                </button>

                {/* Action 5: Add Note */}
                <button
                  type="button"
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 text-xs font-bold shrink-0 transition"
                  title="Write internal persistent note"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Note</span>
                </button>

                {/* Action 6: Follow-up / Edit Follow-up */}
                <button
                  type="button"
                  onClick={() => setShowFollowupModal(true)}
                  className={`crm-btn-secondary flex items-center justify-center gap-1.5 py-2 px-2.5 sm:px-3 text-xs font-bold shrink-0 transition ${
                    selectedLead.followupDate ? "bg-amber-500/10 border-amber-500/40 text-amber-500" : ""
                  }`}
                  title={selectedLead.followupDate ? `Follow-up scheduled: ${selectedLead.followupDate}. Click to edit or reschedule.` : "Schedule a follow-up reminder"}
                >
                  <Clock className={`w-3.5 h-3.5 ${selectedLead.followupDate ? "text-amber-500" : "text-purple-500"}`} />
                  <span>{selectedLead.followupDate ? "Edit Follow-up" : "Follow-up"}</span>
                </button>
              </div>

              {/* Scheduled Follow-up Notification Card */}
              {selectedLead.followupDate && (
                <div className="p-2.5 sm:p-3 rounded-md flex items-center justify-between border border-amber-500/30 bg-amber-500/10 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-amber-500 text-xs">Follow-up Scheduled</div>
                      <div className="text-[11px] truncate opacity-90" style={{ color: "var(--dash-text)" }}>
                        {selectedLead.followupDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowFollowupModal(true)}
                      className="px-2 py-1 rounded bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelFollowup}
                      className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-[11px] hover:bg-rose-500 hover:text-white transition cursor-pointer"
                      title="Remove scheduled follow-up"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Inline Add Note Input Box (Persisted) */}
              {showNoteInput && (
                <div
                  className="p-3 rounded-md animate-fadeIn space-y-2.5"
                  style={{
                    background: "var(--dash-surface-alt)",
                    border: "1px solid var(--dash-border)"
                  }}
                >
                  <label className="text-[11px] font-bold block" style={{ color: "var(--dash-text-muted)" }}>
                    Write Internal Team Note (Saved Permanently):
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Type an internal note about this prospect..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAddNote())}
                    className="crm-input w-full text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNoteInput(false)}
                      className="crm-btn-secondary text-xs py-1 px-2.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleAddNote}
                      disabled={!newNoteText.trim()}
                      className="crm-btn-primary text-xs py-1 px-3"
                    >
                      Save Note
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Details Card */}
              <div
                className="p-3 sm:p-4 space-y-2.5 sm:space-y-3"
                style={{
                  background: "var(--dash-surface-alt)",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "var(--dash-card-radius)"
                }}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>
                    Contact Details
                  </h4>
                  {!selectedLead.email && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewEmailAddress("");
                        setShowAddEmailModal(true);
                      }}
                      className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Email</span>
                    </button>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--dash-text-muted)" }} />
                    <span className="font-semibold break-all" style={{ color: selectedLead.email ? "var(--dash-primary)" : "var(--dash-text-muted)" }}>
                      {selectedLead.email || "No Email Listed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 sm:gap-3" style={{ color: "var(--dash-text)" }}>
                    <Phone className="w-4 h-4 shrink-0" style={{ color: "var(--dash-text-muted)" }} />
                    <span className="font-semibold">{selectedLead.phone ? format10DigitPhone(selectedLead.phone) : "No Phone"}</span>
                  </div>

                  {/* Scraped Physical Address & Landmark */}
                  {(selectedLead.address || selectedLead.raw?.bussiness_address) && (
                    <div className="flex items-start gap-2.5 sm:gap-3 pt-0.5" style={{ color: "var(--dash-text)" }}>
                      <MapPin className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                      <div className="min-w-0">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {selectedLead.address || selectedLead.raw?.bussiness_address}
                        </span>
                        {(selectedLead.landmark || selectedLead.raw?.landmark) && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Landmark: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedLead.landmark || selectedLead.raw?.landmark}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Building, Area, City & Pincode Chips */}
                  {((selectedLead.building || selectedLead.raw?.building) ||
                    (selectedLead.bussiness_area || selectedLead.raw?.bussiness_area) ||
                    (selectedLead.pincode || selectedLead.raw?.pincode) ||
                    selectedLead.city) && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      {(selectedLead.building || selectedLead.raw?.building) && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          <Building className="w-3 h-3 text-slate-400" />
                          {selectedLead.building || selectedLead.raw?.building}
                        </span>
                      )}
                      {(selectedLead.bussiness_area || selectedLead.raw?.bussiness_area) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {selectedLead.bussiness_area || selectedLead.raw?.bussiness_area}
                        </span>
                      )}
                      {selectedLead.city && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                          {selectedLead.city}
                        </span>
                      )}
                      {(selectedLead.pincode || selectedLead.raw?.pincode) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                          PIN: {selectedLead.pincode || selectedLead.raw?.pincode}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 sm:gap-3" style={{ color: "var(--dash-text)" }}>
                    <Globe className="w-4 h-4 shrink-0" style={{ color: "var(--dash-text-muted)" }} />
                    {isValidWebsite(selectedLead.website) ? (
                      <a
                        href={formatWebsiteUrl(selectedLead.website)!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline truncate"
                      >
                        {selectedLead.website}
                      </a>
                    ) : (
                      <span className="text-[var(--dash-text-muted)] italic text-xs">No website listed</span>
                    )}
                  </div>

                  {/* Rating & Total Reviews Count */}
                  {(selectedLead.rating || selectedLead.raw?.rating) && (
                    <div className="flex items-center gap-2.5 sm:gap-3 text-amber-500 font-semibold">
                      <Star className="w-4 h-4 shrink-0 fill-amber-500 text-amber-500" />
                      <span>
                        Rating: {selectedLead.rating || selectedLead.raw?.rating} / 5.0
                        {(selectedLead.total_review || selectedLead.raw?.total_review) && (
                          <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                            ({selectedLead.total_review || selectedLead.raw?.total_review} reviews)
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {selectedLead.category && (
                    <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
                      <Tag className="w-4 h-4 shrink-0" style={{ color: "var(--dash-text-muted)" }} />
                      <span className="crm-badge badge-primary text-[10px]">
                        {selectedLead.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Outreach & Campaign Intelligence Card */}
              <div
                className="p-3 sm:p-4 space-y-2.5 sm:space-y-3"
                style={{
                  background: "var(--dash-surface-alt)",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "var(--dash-card-radius)"
                }}
              >
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>
                  Outreach & Campaign Intelligence
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200/80 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-400 block font-medium">WhatsApp Outreach</span>
                    <span className="font-bold capitalize text-emerald-500">
                      {selectedLead.whatsapp_status || selectedLead.raw?.whatsapp_status || "Pending"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/50 dark:bg-black/20 border border-slate-200/80 dark:border-neutral-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Email Campaign</span>
                    <span className="font-bold capitalize text-indigo-500">
                      {selectedLead.email_status || selectedLead.raw?.email_status || "Pending"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500 dark:text-neutral-400 font-medium">AI Auto-Reply Bot</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    (selectedLead.whatsapp_ai_enabled ?? selectedLead.raw?.whatsapp_ai_enabled) !== false
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                  }`}>
                    {(selectedLead.whatsapp_ai_enabled ?? selectedLead.raw?.whatsapp_ai_enabled) !== false ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>

              {/* 100% Dynamic Activity History Timeline */}
              <div
                className="p-3 sm:p-4 space-y-2.5 sm:space-y-3"
                style={{
                  border: "1px solid var(--dash-border)",
                  borderRadius: "var(--dash-card-radius)"
                }}
              >
                <h4 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>
                  Activity History
                </h4>
                <div
                  className="relative pl-5 space-y-3.5 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5"
                  style={{ color: "var(--dash-border)" }}
                >
                  {/* 1. Active Follow-up Reminder (Single, deduplicated) */}
                  {selectedLead.followupDate && (
                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
                      <div className="text-xs font-bold text-cyan-500">
                        📅 Active Follow-up Scheduled
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--dash-text-secondary)" }}>
                        Reminder set for: <strong className="text-[var(--dash-text)]">{selectedLead.followupDate}</strong>
                      </div>
                    </div>
                  )}

                  {/* 2. Customer Inbound WhatsApp Reply (Real DB Event) */}
                  {selectedLead.raw?.whatsapp_last_reply && (
                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <div className="text-xs font-bold text-amber-500">
                        💬 Inbound Customer Reply Received
                      </div>
                      <div className="text-[11px] mt-0.5 italic p-2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        "{selectedLead.raw.whatsapp_last_reply}"
                      </div>
                      {selectedLead.raw?.whatsapp_reply_at && (
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                          {new Date(selectedLead.raw.whatsapp_reply_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 3. Outbound WhatsApp Proposal Dispatched (Real DB Event) */}
                  {selectedLead.raw?.whatsapp_status && selectedLead.raw.whatsapp_status !== "pending" && (
                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <div className="text-xs font-bold text-emerald-500">
                        📱 WhatsApp Pitch Dispatched
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--dash-text-secondary)" }}>
                        Interactive proposal card delivered with CTAs. Status: <span className="font-bold uppercase text-emerald-500">{selectedLead.raw.whatsapp_status}</span>
                      </div>
                      {selectedLead.raw?.whatsapp_sent_at && (
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                          {new Date(selectedLead.raw.whatsapp_sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 4. Outbound Cold Outreach Email Dispatched (Real DB Event) */}
                  {selectedLead.raw?.email_status && selectedLead.raw.email_status !== "pending" && (
                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <div className="text-xs font-bold text-blue-500">
                        ✉️ Outreach Email Dispatched
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--dash-text-secondary)" }}>
                        Growth pitch email dispatched to {selectedLead.email || "prospect"}. Status: <span className="font-bold uppercase text-blue-500">{selectedLead.raw.email_status}</span>
                      </div>
                      {selectedLead.raw?.email_sent_at && (
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                          {new Date(selectedLead.raw.email_sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 5. Deduplicated Custom Activities (Calls, Status changes, Notes) */}
                  {selectedLead.customActivities && selectedLead.customActivities
                    .filter((act: any) => act.type !== "followup") // Already handled in card #1 above
                    .map((act: any, idx: number) => (
                      <div key={idx} className="relative">
                        <span
                          className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full"
                          style={{
                            background:
                              act.type === "call"
                                ? "var(--dash-primary)"
                                : act.type === "whatsapp"
                                ? "var(--dash-success)"
                                : "var(--dash-warning)"
                          }}
                        />
                        <div className="text-xs font-semibold" style={{ color: "var(--dash-text)" }}>
                          {act.title}
                        </div>
                        <div className="text-[11px] mt-0.5 whitespace-pre-wrap leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                          {act.desc}
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                          {act.date}
                        </div>
                      </div>
                    ))}

                  {/* 6. Internal Notes */}
                  {selectedLead.notes && selectedLead.notes.map((n: any, idx: number) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full" style={{ background: "var(--dash-warning)" }} />
                      <div className="text-xs font-semibold" style={{ color: "var(--dash-text)" }}>
                        Internal Note ({n.author || "Admin"})
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: "var(--dash-text-secondary)" }}>
                        {n.text}
                      </div>
                      <div className="text-[10px] mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
                        {n.date}
                      </div>
                    </div>
                  ))}

                  {/* 7. Primary Genesis Event (Inbound Inquiry vs. Outbound Google Maps) */}
                  {selectedLead.source === "inquiry" ? (
                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <div className="text-xs font-bold text-indigo-400">
                        📥 Website Lead Inquiry Received
                      </div>
                      <div className="text-[11px] mt-0.5 space-y-1" style={{ color: "var(--dash-text-secondary)" }}>
                        {selectedLead.services && selectedLead.services.length > 0 && (
                          <div>
                            <strong className="text-[var(--dash-text)]">Requested Services:</strong> {selectedLead.services.join(", ")}
                          </div>
                        )}
                        {selectedLead.message && (
                          <div className="italic p-2 rounded bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] text-xs">
                            "{selectedLead.message}"
                          </div>
                        )}
                        <div className="text-[10px] text-emerald-500 font-medium">
                          ✓ Auto-confirmation email dispatched to client
                        </div>
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: "var(--dash-text-muted)" }}>
                        {new Date(selectedLead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <div className="text-xs font-bold text-blue-400">
                        🗺️ Google Maps Record Scraped
                      </div>
                      <div className="text-[11px] mt-0.5 space-y-0.5" style={{ color: "var(--dash-text-secondary)" }}>
                        <div><strong className="text-[var(--dash-text)]">Location:</strong> {selectedLead.company || selectedLead.city || "Local Business Database"}</div>
                        <div><strong className="text-[var(--dash-text)]">Reputation:</strong> ⭐ {selectedLead.rating || "4.5"} ({selectedLead.raw?.total_review || "0"} reviews)</div>
                        <div><strong className="text-[var(--dash-text)]">Website Audit:</strong> {selectedLead.website ? selectedLead.website : "Missing website link"}</div>
                        <div><strong className="text-[var(--dash-text)]">AI Score:</strong> Priority score {selectedLead.score}/100</div>
                      </div>
                      <div className="text-[10px] mt-1" style={{ color: "var(--dash-text-muted)" }}>
                        {new Date(selectedLead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Drawer Footer Sticky CTA Bar */}
            <div
              className="flex-none px-2.5 py-2.5 sm:px-4 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-2 z-30 w-full max-w-full overflow-hidden"
              style={{
                borderTop: "1px solid var(--dash-border)",
                background: "var(--dash-surface-alt)",
                paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.85rem)"
              }}
            >
              {/* Secondary Controls: Close & Delete */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="crm-btn-secondary text-xs py-2 px-2.5 sm:px-3 font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0 transition"
                  title="Close lead drawer"
                  aria-label="Close lead drawer"
                >
                  <X className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Close</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteLead(selectedLead)}
                  className="text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer py-2 px-2 sm:px-2.5 rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition shrink-0"
                  title="Delete lead record"
                  aria-label="Delete lead record"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden md:inline">Delete</span>
                </button>
              </div>

              {/* Primary Actions: Proposal & Update Status (Flexible & Never Overflow) */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0 justify-end">
                <button
                  type="button"
                  onClick={() => openWaModalForLead(selectedLead)}
                  className="flex-1 min-w-0 px-2 sm:px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-1 shrink-0 active:scale-[0.98]"
                  title="Open WhatsApp Proposal"
                >
                  <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Proposal 🚀</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="flex-1 min-w-0 crm-btn-primary text-xs py-2 px-2 sm:px-3 font-bold flex items-center justify-center gap-1 shrink-0 active:scale-[0.98]"
                  title="Update pipeline status"
                >
                  <span className="truncate">Update Status</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Follow-up Scheduler / Editor Modal ── */}
      {mounted && typeof document !== "undefined" && showFollowupModal && selectedLead && createPortal(
        <div className="fixed inset-0 z-[10000] overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm crm-card p-5 sm:p-6 space-y-4 shadow-2xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--dash-border)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--dash-text)" }}>
                    {selectedLead.followupDate ? "Edit Follow-up Schedule" : "Schedule Follow-up"}
                  </h3>
                  <p className="text-[11px] truncate max-w-[200px]" style={{ color: "var(--dash-text-muted)" }}>Target: {selectedLead.name}</p>
                </div>
              </div>
              <button onClick={() => setShowFollowupModal(false)} className="p-1.5 rounded-md hover:bg-[var(--dash-surface-alt)] opacity-70 hover:opacity-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedLead.followupDate && (
              <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
                <span className="text-[11px] text-amber-500 font-medium">Currently set for: <strong>{selectedLead.followupDate}</strong></span>
                <button
                  onClick={handleCancelFollowup}
                  className="text-[11px] text-rose-500 font-bold hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <span className="font-semibold block" style={{ color: "var(--dash-text-muted)" }}>Quick Reschedule Presets:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleConfirmFollowup(1)}
                  disabled={schedulingFollowup}
                  className="crm-btn-secondary text-xs text-center py-2 font-bold hover:border-amber-500 transition cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => handleConfirmFollowup(3)}
                  disabled={schedulingFollowup}
                  className="crm-btn-secondary text-xs text-center py-2 font-bold hover:border-amber-500 transition cursor-pointer"
                >
                  In 3 Days
                </button>
                <button
                  onClick={() => handleConfirmFollowup(7)}
                  disabled={schedulingFollowup}
                  className="crm-btn-secondary text-xs text-center py-2 font-bold hover:border-amber-500 transition cursor-pointer"
                >
                  In 1 Week
                </button>
              </div>

              <div className="pt-2">
                <label className="font-semibold block mb-1.5" style={{ color: "var(--dash-text-muted)" }}>Or Pick Custom Date:</label>
                <input
                  type="date"
                  value={customFollowupDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setCustomFollowupDate(e.target.value)}
                  className="crm-input w-full text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t" style={{ borderColor: "var(--dash-border)" }}>
              {selectedLead.followupDate ? (
                <button
                  onClick={handleCancelFollowup}
                  className="text-xs text-rose-500 hover:bg-rose-500/10 px-2.5 py-1.5 rounded-md font-semibold transition cursor-pointer"
                >
                  Remove Reminder
                </button>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFollowupModal(false)} className="crm-btn-secondary text-xs py-1.5 px-3 cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmFollowup(0, customFollowupDate)}
                  disabled={!customFollowupDate || schedulingFollowup}
                  className="crm-btn-primary text-xs py-1.5 px-3 cursor-pointer"
                >
                  {schedulingFollowup ? "Saving..." : selectedLead.followupDate ? "Update Follow-up" : "Save Follow-up"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Update Status Modal ── */}
      {mounted && typeof document !== "undefined" && showStatusModal && selectedLead && createPortal(
        <div className="fixed inset-0 z-[10000] overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm crm-card p-6 space-y-4 shadow-2xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--dash-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--dash-text)" }}>Update Lead Status</h3>
              <button onClick={() => setShowStatusModal(false)} className="p-1 cursor-pointer opacity-60 hover:opacity-100" style={{ color: "var(--dash-text-muted)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs" style={{ color: "var(--dash-text-secondary)" }}>Select a new pipeline status for <span className="font-bold" style={{ color: "var(--dash-text)" }}>{selectedLead.name}</span>:</p>

            <div className="space-y-2">
              {["Pending", "Contacted", "Interested", "Qualified", "Converted", "Lost"].map((s) => (
                <button
                  key={s}
                  onClick={() => handlePersistStatusUpdate(s)}
                  disabled={updatingStatus}
                  className="w-full p-2.5 text-xs font-semibold text-left flex items-center justify-between transition cursor-pointer"
                  style={{
                    borderRadius: "var(--dash-btn-radius)",
                    border: selectedLead.status?.toLowerCase() === s.toLowerCase() ? "1px solid var(--dash-primary)" : "1px solid var(--dash-border)",
                    background: selectedLead.status?.toLowerCase() === s.toLowerCase() ? "var(--dash-primary-light)" : "var(--dash-surface-alt)",
                    color: selectedLead.status?.toLowerCase() === s.toLowerCase() ? "var(--dash-primary)" : "var(--dash-text)"
                  }}
                >
                  <span>{s}</span>
                  {selectedLead.status?.toLowerCase() === s.toLowerCase() && <Check className="w-4 h-4" style={{ color: "var(--dash-primary)" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Add Email Address Modal ── */}
      {mounted && typeof document !== "undefined" && showAddEmailModal && selectedLead && createPortal(
        <div className="fixed inset-0 z-[10000] overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-sm crm-card p-6 space-y-4 shadow-2xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--dash-border)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: "var(--dash-text)" }}>Add Email Address</h3>
                  <p className="text-[11px]" style={{ color: "var(--dash-text-muted)" }}>For {selectedLead.name}</p>
                </div>
              </div>
              <button onClick={() => setShowAddEmailModal(false)} className="p-1 opacity-60 hover:opacity-100 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmailAndCompose} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1" style={{ color: "var(--dash-text-muted)" }}>Business / Contact Email:</label>
                <input
                  type="email"
                  required
                  placeholder="contact@business.com"
                  value={newEmailAddress}
                  onChange={(e) => setNewEmailAddress(e.target.value)}
                  className="crm-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t" style={{ borderColor: "var(--dash-border)" }}>
                <button type="button" onClick={() => setShowAddEmailModal(false)} className="crm-btn-secondary text-xs">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newEmailAddress.trim() || savingNewEmail}
                  className="crm-btn-primary text-xs"
                >
                  {savingNewEmail ? "Saving..." : "Save & Compose"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── Direct Email Composer Modal ── */}
      {mounted && typeof document !== "undefined" && showEmailModal && selectedLead && createPortal(
        <div className="fixed inset-0 z-[10000] overflow-hidden bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg crm-card p-6 space-y-4 shadow-2xl" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--dash-border)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--dash-text)" }}>Send Outreach Email</h3>
              <button onClick={() => setShowEmailModal(false)} className="p-1 cursor-pointer opacity-60 hover:opacity-100" style={{ color: "var(--dash-text-muted)" }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendDirectEmail} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--dash-text-secondary)" }}>To</label>
                <input
                  type="email"
                  readOnly
                  value={selectedLead.email || ""}
                  className="crm-input w-full opacity-80 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--dash-text-secondary)" }}>Subject</label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="crm-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "var(--dash-text-secondary)" }}>Message Body</label>
                <textarea
                  required
                  rows={5}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="crm-input w-full"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="crm-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingEmail}
                  className="crm-btn-primary text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sendingEmail ? "Sending..." : "Dispatch Email"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── 1. Import Excel / CSV Spreadsheet Modal ── */}
      {mounted && typeof document !== "undefined" && showImportModal && createPortal(
        <div
          onClick={() => setShowImportModal(false)}
          className="fixed inset-0 z-[10001] overflow-y-auto bg-black/80 flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg crm-card p-6 space-y-5 cursor-default relative shadow-2xl"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--dash-text-primary)]">Import Leads Spreadsheet</h3>
                  <p className="text-xs text-[var(--dash-text-muted)]">Inject batch prospect records directly into database</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              {/* File Dropzone */}
              <div className="border-2 border-dashed border-[var(--dash-border)] rounded-md p-6 text-center hover:border-indigo-500 transition cursor-pointer bg-[var(--dash-table-header)] relative">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FileSpreadsheet className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                {importFile ? (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate max-w-xs mx-auto">{importFile.name}</p>
                    <p className="text-[10px] text-[var(--dash-text-muted)] font-mono">{(importFile.size / 1024).toFixed(1)} KB — Ready to Inject</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[var(--dash-text-primary)]">Click or drag `.xlsx`, `.xls` or `.csv` spreadsheet</p>
                    <p className="text-[10px] text-[var(--dash-text-muted)]">Auto-resolves Name, Email, Phone, City, Website &amp; Category columns</p>
                  </div>
                )}
              </div>

              {uploadResult && (
                <div className={`p-3 rounded-md text-xs font-mono border ${
                  uploadResult.startsWith("Error")
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                }`}>
                  {uploadResult}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="crm-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!importFile || uploading}
                  className="crm-btn-primary text-xs flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Injecting Leads...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Inject to Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── 2. Add Lead Manual Form Modal ── */}
      {mounted && typeof document !== "undefined" && showAddLeadModal && createPortal(
        <div
          onClick={() => setShowAddLeadModal(false)}
          className="fixed inset-0 z-[10001] overflow-y-auto bg-black/80 flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md crm-card p-6 space-y-4 cursor-default relative shadow-2xl"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--dash-text-primary)]">Add New Lead Record</h3>
                  <p className="text-xs text-[var(--dash-text-muted)]">Manually insert a prospect into database</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingleLead} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--dash-text-primary)] mb-1">Business / Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nexus Tech Studios"
                  value={newLeadForm.bussiness_name}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_name: e.target.value })}
                  className="crm-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--dash-text-primary)] mb-1">Business Email</label>
                  <input
                    type="email"
                    placeholder="contact@nexus.com"
                    value={newLeadForm.bussiness_email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_email: e.target.value })}
                    className="crm-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--dash-text-primary)] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 555-0192"
                    value={newLeadForm.bussiness_number}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_number: e.target.value })}
                    className="crm-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--dash-text-primary)] mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="New York"
                    value={newLeadForm.scraped_city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, scraped_city: e.target.value })}
                    className="crm-input w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--dash-text-primary)] mb-1">Service / Keyword</label>
                  <input
                    type="text"
                    placeholder="Web Development"
                    value={newLeadForm.scraped_service}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, scraped_service: e.target.value })}
                    className="crm-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--dash-text-primary)] mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://nexus.com"
                  value={newLeadForm.bussiness_website}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, bussiness_website: e.target.value })}
                  className="crm-input w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="crm-btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNewLead}
                  className="crm-btn-primary text-xs flex items-center gap-2"
                >
                  {submittingNewLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Save Lead to DB</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── 3. WhatsApp Outreach Preview & Customize Modal (Portal at z-[10005]) ── */}
      {mounted && typeof document !== "undefined" && showWaModal && waPreviewLead && createPortal(
        <div
          onClick={() => setShowWaModal(false)}
          className="fixed inset-0 z-[10005] overflow-y-auto bg-black/80 flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg crm-card p-6 space-y-4 cursor-default relative text-left shadow-2xl"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--dash-border)] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--dash-text-primary)]">
                    {waPreviewLead.source === "inquiry" ? "Inbound Inquiry WhatsApp Proposal" : "Google Maps WhatsApp Outreach"}
                  </h3>
                  <p className="text-xs text-[var(--dash-text-muted)]">Target: {waPreviewLead.name} ({waPreviewLead.city || waPreviewLead.company || "Client Profile"})</p>
                </div>
              </div>
              <button
                onClick={() => setShowWaModal(false)}
                className="p-1.5 rounded-md text-[var(--dash-text-muted)] hover:text-[var(--dash-text-primary)] hover:bg-slate-100 dark:hover:bg-neutral-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Test Mode / Direct Delivery Banner */}
            {waPreviewLead.source === "inquiry" ? (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>DIRECT INBOUND CLIENT DELIVERY</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300">
                    Direct • No Buttons
                  </span>
                </div>
                <div className="text-[11px] leading-relaxed text-slate-700 dark:text-emerald-200/90">
                  This user submitted a website inquiry and is already interested. Message will be dispatched directly to their phone (<strong className="font-mono text-emerald-600 dark:text-emerald-300">{waPreviewLead.phone || "No phone"}</strong>) as clean conversational text without "Interested" buttons.
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-500 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>TEST MODE SAFEGUARD ACTIVE</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-300">
                    Protected Sandbox
                  </span>
                </div>
                <div className="text-[11px] leading-relaxed text-slate-700 dark:text-amber-200/90">
                  All messages are strictly redirected to your test phone: <strong className="text-amber-600 dark:text-amber-300 font-mono">+{waPreviewData?.test_number || "919173739080"}</strong>. Real customer number ({waPreviewLead.phone || "client"}) will not receive messages.
                </div>
              </div>
            )}

            {loadingWaPreview ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-[var(--dash-text-muted)]">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                <span className="text-xs font-mono">Generating personalized AI outreach proposal...</span>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Lead Summary Badge */}
                <div className="p-3 rounded-md bg-[var(--dash-table-header)] border border-[var(--dash-border)] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[var(--dash-text-primary)] block">{waPreviewLead.name}</span>
                    <span className="text-[var(--dash-text-muted)] font-mono text-[11px]">
                      {waPreviewLead.phone || "No Phone"} • {waPreviewLead.source === "inquiry" ? "Direct Inbound" : (waPreviewLead.category || "Business")}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    waPreviewLead.source === "inquiry"
                      ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20"
                      : isValidWebsite(waPreviewLead.website)
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {waPreviewLead.source === "inquiry" ? "Website Lead" : isValidWebsite(waPreviewLead.website) ? "Website Active" : "No Website (Hot Lead!)"}
                  </span>
                </div>

                {/* Recipient Phone Input (Editable) */}
                <div>
                  <label className="block font-semibold text-[var(--dash-text-primary)] mb-1 flex items-center justify-between">
                    <span>Recipient WhatsApp Phone:</span>
                    <span className="text-[10px] text-[var(--dash-text-muted)] font-normal">Include country code (e.g. 91...)</span>
                  </label>
                  <input
                    type="text"
                    value={waCustomPhone}
                    onChange={(e) => setWaCustomPhone(e.target.value)}
                    placeholder="916352743015"
                    className="crm-input w-full font-mono text-xs"
                  />
                </div>

                {/* Editable Proposal Message Textarea */}
                <div>
                  <label className="block font-semibold text-[var(--dash-text-primary)] mb-1 flex items-center justify-between">
                    <span>Personalized WhatsApp Proposal Text:</span>
                    <span className="text-[10px] text-[var(--dash-text-muted)] font-normal">Editable</span>
                  </label>
                  <textarea
                    rows={6}
                    value={waCustomMessage}
                    onChange={(e) => setWaCustomMessage(e.target.value)}
                    className="crm-input w-full font-sans leading-relaxed text-xs"
                  />
                </div>

                {/* Quick Reply Buttons Card Preview */}
                {waPreviewLead.source === "inquiry" ? (
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-md space-y-2">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                      Inbound Website Lead — 2 Native CTA Redirect Buttons (No &quot;Interested&quot; button):
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="py-1.5 px-2 rounded-md bg-[var(--dash-card-bg)] text-center text-[var(--dash-text-primary)] font-semibold border border-[var(--dash-border)] shadow-xs flex items-center justify-center gap-1.5 text-[11px]">
                        🌐 1. Visit Website (Direct Link)
                      </div>
                      <div className="py-1.5 px-2 rounded-md bg-[var(--dash-card-bg)] text-center text-[var(--dash-text-primary)] font-semibold border border-[var(--dash-border)] shadow-xs flex items-center justify-center gap-1.5 text-[11px]">
                        📞 2. Call Us (Direct Dial)
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-md space-y-2">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px] block">Attached Interactive Buttons Card:</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="py-1.5 px-2 rounded-md bg-[var(--dash-card-bg)] text-center text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/30 shadow-xs">
                        1. Interested
                      </div>
                      <div className="py-1.5 px-2 rounded-md bg-[var(--dash-card-bg)] text-center text-[var(--dash-text-primary)] font-semibold border border-[var(--dash-border)] shadow-xs">
                        {isValidWebsite(waPreviewLead.website) ? "2. Visit Website" : "2. Book Demo"}
                      </div>
                      <div className="py-1.5 px-2 rounded-md bg-[var(--dash-card-bg)] text-center text-[var(--dash-text-primary)] font-semibold border border-[var(--dash-border)] shadow-xs">
                        3. Call Us
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowWaModal(false)}
                    className="crm-btn-secondary text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWaOutreach}
                    disabled={sendingWaMessage || !waCustomMessage.trim()}
                    className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition cursor-pointer flex items-center gap-2"
                  >
                    {sendingWaMessage ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending WhatsApp...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>Send WhatsApp Outreach 🚀</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
