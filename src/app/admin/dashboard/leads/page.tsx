"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  ExternalLink,
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
import { formatServiceText, isValidWebsite, formatWebsiteUrl, format10DigitPhone, formatDialerUrl, formatISTDate, formatISTDateTime, matchesSimilaritySearch } from "@/lib/formatters";

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
  whatsapp_sent_at?: string | null;
  whatsapp_last_reply?: string | null;
  whatsapp_reply_at?: string | null;
  whatsapp_ai_enabled?: boolean;
  is_interested?: boolean;
  score: number;
  followupDate?: string | null;
  notes?: any[];
  customActivities?: any[];
  raw?: any;
  reviews?: any;
  description?: string;
  opening_hours?: string;
  popular_topics?: string;
  maps_url?: string;
  cover_photo?: string;
  photos_count?: string;
  place_id?: string;
  state?: string;
  latitude?: string;
  longitude?: string;
  neighborhood?: string;
  street_address?: string;
}

export default function LeadsManager() {
  const { accessToken, user } = useAuthStore();
  const canDeleteLeads = Boolean(
    user?.is_superadmin ||
    user?.is_main_admin ||
    user?.permissions?.includes("delete_lead")
  );
  const canSendWhatsapp = Boolean(
    user?.is_superadmin ||
    user?.is_main_admin ||
    user?.permissions?.includes("send_whatsapp")
  );
  const canManageLeads = Boolean(
    user?.is_superadmin ||
    user?.is_main_admin ||
    user?.permissions?.includes("manage_leads")
  );
  const isFetchingRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inquiriesCacheRef = useRef<any[] | null>(null);
  const [mounted, setMounted] = useState(false);
  const [allLeads, setAllLeads] = useState<NormalizedLead[]>([]);
  const [totalLeadsFromAPI, setTotalLeadsFromAPI] = useState<number>(0);
  const [totalScrapedCount, setTotalScrapedCount] = useState<number>(0);
  const [totalInquiriesCount, setTotalInquiriesCount] = useState<number>(0);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const sourceFilterRef = useRef<SourceFilter>(sourceFilter);
  sourceFilterRef.current = sourceFilter;
  const isMountedRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [statusFilter, setStatusFilter] = useState("all");
  const statusFilterRef = useRef(statusFilter);
  statusFilterRef.current = statusFilter;
  const [messageSentFilter, setMessageSentFilter] = useState<"all" | "sent">("all");
  const messageSentFilterRef = useRef<"all" | "sent">(messageSentFilter);
  messageSentFilterRef.current = messageSentFilter;
  const [searchQuery, setSearchQuery] = useState("");
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  // Helper to accurately classify organic WhatsApp inbound leads vs cold outreach scraped leads
  const isOrganicInbound = (l: { source?: string; scraped_service?: string; scraped_city?: string; name?: string; bussiness_name?: string } | null) => {
    if (!l) return false;
    if (l.source === "inquiry") return true;
    const service = String(l.scraped_service || "").toLowerCase();
    const city = String(l.scraped_city || "").toLowerCase();
    const name = String(l.name || l.bussiness_name || "").toLowerCase();
    return service.includes("whatsapp inbound") || city.includes("inbound whatsapp") || name.includes("inbound client") || name.includes("inbound lead");
  };

  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<number>>(new Set());
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);

  // Drawer state & modern segmented tabs
  const [selectedLead, setSelectedLead] = useState<NormalizedLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [leadDrawerTab, setLeadDrawerTab] = useState<"overview" | "timeline" | "notes" | "reviews">("overview");

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
    if (!canSendWhatsapp) {
      triggerToast("Access Denied: You do not have permission to send WhatsApp outreach.");
      return;
    }
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
    if (!canSendWhatsapp) {
      triggerToast("Access Denied: You do not have permission to send WhatsApp outreach.");
      return;
    }
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
    if (!canSendWhatsapp) {
      triggerToast("Access Denied: You do not have permission to send WhatsApp outreach.");
      return;
    }
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

  const fetchLeads = useCallback(async (pageToFetch?: number, limitToFetch?: number, statusToFetch?: string, searchToFetch?: string, messageSentToFetch?: string) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    const pageNum = pageToFetch ?? currentPage;
    const limitNum = limitToFetch ?? pageSize;
    const curStatus = statusToFetch !== undefined ? statusToFetch : statusFilterRef.current;
    const statusParam = curStatus && curStatus !== "all" && curStatus !== "message_sent" ? `&status=${encodeURIComponent(curStatus)}` : "";
    const effectiveSearch = (searchToFetch !== undefined ? searchToFetch : searchQueryRef.current).trim();
    const searchParam = effectiveSearch ? `&search=${encodeURIComponent(effectiveSearch)}` : "";
    const curMsgSent = messageSentToFetch !== undefined ? messageSentToFetch : messageSentFilterRef.current;
    const msgSentParam = curMsgSent === "sent" || curStatus === "message_sent" ? `&message_sent=true` : "";
    try {
      setLoading(true);
      const shouldFetchInquiries = !inquiriesCacheRef.current || pageNum === 1 || sourceFilterRef.current === "inquiry";
      const [inquiryRes, scrapedRes] = await Promise.allSettled([
        shouldFetchInquiries ? authFetch(`${API}/api/v1/leads/`) : Promise.resolve(null as any),
        authFetch(`${API}/api/v1/scraped-leads/?page=${pageNum}&limit=${limitNum}${statusParam}${msgSentParam}${searchParam}`)
      ]);

      let inquiryData: any[] = inquiriesCacheRef.current || [];
      if (shouldFetchInquiries && inquiryRes.status === "fulfilled" && inquiryRes.value && inquiryRes.value.ok) {
        try {
          inquiryData = await inquiryRes.value.json();
          inquiriesCacheRef.current = inquiryData;
        } catch (e) {
          console.error("Error parsing inquiry data:", e);
        }
      }

      let scrapedData: any[] = [];
      let scrapedTotal = 0;
      let scrapedOk = false;
      if (scrapedRes.status === "fulfilled" && scrapedRes.value.ok) {
        try {
          const scrapedJson = await scrapedRes.value.json();
          if (Array.isArray(scrapedJson)) {
            scrapedData = scrapedJson;
            scrapedTotal = scrapedJson.length;
            scrapedOk = true;
          } else if (scrapedJson && (Array.isArray(scrapedJson.leads) || Array.isArray(scrapedJson.items))) {
            scrapedData = scrapedJson.leads || scrapedJson.items;
            scrapedTotal = Number(scrapedJson.total ?? scrapedData.length);
            scrapedOk = true;
          }
        } catch (e) {
          console.error("Error parsing scraped data:", e);
        }
      }

      // Resilient fallback in case a server validator enforces smaller limit
      if (!scrapedOk) {
        for (const fallbackLimit of [50, 20]) {
          try {
            const fallbackRes = await authFetch(`${API}/api/v1/scraped-leads/?page=${pageNum}&limit=${fallbackLimit}${statusParam}${msgSentParam}${searchParam}`);
            if (fallbackRes.ok) {
              const fbJson = await fallbackRes.json();
              if (Array.isArray(fbJson)) {
                scrapedData = fbJson;
                scrapedTotal = fbJson.length;
                break;
              } else if (fbJson && (Array.isArray(fbJson.leads) || Array.isArray(fbJson.items))) {
                scrapedData = fbJson.leads || fbJson.items;
                scrapedTotal = Number(fbJson.total ?? scrapedData.length);
                break;
              }
            }
          } catch (fbErr) {
            // continue fallback attempts
          }
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
          status: (() => {
            const s = (lead.status || "pending").toLowerCase();
            if (s === "outreach_sent") return "Outreach Sent";
            if (s === "interested") return "Interested";
            if (s === "reply") return "Reply";
            if (s === "qualified") return "Qualified";
            if (s === "closed") return "Closed";
            if (s === "new") return "Pending";
            return s.charAt(0).toUpperCase() + s.slice(1);
          })(),
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

      // Include all valid scraped leads that have at least a business name, email, or phone number
      const validScrapedData = scrapedData.filter((lead: any) => {
        if (!lead) return false;
        const name = String(lead.bussiness_name || "").trim();
        const email = String(lead.bussiness_email || "").trim();
        const p = String(lead.bussiness_number || "").trim();
        return Boolean(name || email || p);
      });

      const normalizedScraped: NormalizedLead[] = validScrapedData.map((lead: any) => {
        const hasEmail = Boolean(lead.bussiness_email);
        const ratingVal = lead.rating ? parseFloat(lead.rating) : 3.5;
        const score = Math.min(99, Math.round((hasEmail ? 80 : 55) + ratingVal * 3.5));

        const cleanService = formatServiceText(lead.scraped_service || lead.category);
        const savedFollowup = typeof window !== "undefined" ? localStorage.getItem(`crm_lead_followup_${lead.id}`) : null;
        const rawFollowup = lead.next_followup_at ? formatISTDate(lead.next_followup_at) : null;

        const waStatus = String(lead.whatsapp_status || "").toLowerCase();
        const emStatus = String(lead.email_status || "").toLowerCase();
        
        let displayStatus = "Pending";
        const primaryStatus = waStatus || emStatus;
        if (primaryStatus) {
          if (primaryStatus === "outreach_sent") displayStatus = "Outreach Sent";
          else if (primaryStatus === "interested") displayStatus = "Interested";
          else if (primaryStatus === "reply") displayStatus = "Reply";
          else if (primaryStatus === "qualified") displayStatus = "Qualified";
          else if (primaryStatus === "closed") displayStatus = "Closed";
          else if (primaryStatus === "sent") displayStatus = "Outreach Sent";
          else displayStatus = primaryStatus.charAt(0).toUpperCase() + primaryStatus.slice(1);
        }

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
          status: displayStatus,
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
          is_interested: lead.is_interested || false,
          score,
          followupDate: savedFollowup || rawFollowup || null,
          reviews: lead.reviews,
          description: lead.description,
          opening_hours: lead.opening_hours,
          popular_topics: lead.popular_topics,
          maps_url: lead.maps_url,
          cover_photo: lead.cover_photo,
          photos_count: lead.photos_count,
          place_id: lead.place_id,
          state: lead.state,
          latitude: lead.latitude,
          longitude: lead.longitude,
          neighborhood: lead.neighborhood,
          street_address: lead.street_address,
        };
      });

      const currentFilter = sourceFilterRef.current;
      let pageLeads: NormalizedLead[] = [];
      if (currentFilter === "inquiry") {
        pageLeads = normalizedInquiries;
      } else if (currentFilter === "scraped") {
        pageLeads = normalizedScraped;
      } else if (pageNum === 1 && currentFilter === "all") {
        pageLeads = [...normalizedInquiries, ...normalizedScraped];
      } else {
        pageLeads = normalizedScraped;
      }

      pageLeads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      // Preserve all distinct lead records by their unique source and raw ID
      const seenKeys = new Set<string>();
      const uniqueLeads: NormalizedLead[] = [];

      for (const lead of pageLeads) {
        if (lead.name) {
          const match = lead.name.match(/\(\+?(\d+)\)/);
          if (match && match[1]) {
            lead.phone = match[1];
          }
        }

        const key = `${lead.source}_${lead.rawId}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        uniqueLeads.push(lead);
      }

      setAllLeads(uniqueLeads);
      const accurateScraped = Number(scrapedTotal || validScrapedData.length || 0);
      const accurateInquiries = Number(inquiryData.length || 0);
      setTotalScrapedCount(accurateScraped);
      setTotalInquiriesCount(accurateInquiries);
      setTotalLeadsFromAPI(currentFilter === "inquiry" ? accurateInquiries : (currentFilter === "scraped" ? accurateScraped : uniqueLeads.length));
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  const debouncedFetchLeads = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchLeads();
    }, 350);
  }, [fetchLeads]);

  useEffect(() => {
    setMounted(true);
    let initialSearch = "";
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get("search") || params.get("q");
      if (urlQ) {
        initialSearch = urlQ;
        setSearchQuery(urlQ);
        searchQueryRef.current = urlQ;
      }
    }
    fetchLeads(1, pageSize, undefined, initialSearch);

    const handleSyncUrl = () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const urlQ = params.get("search") || params.get("q");
        if (urlQ !== null && urlQ !== undefined) {
          setSearchQuery(urlQ);
          searchQueryRef.current = urlQ;
          fetchLeads(1, pageSize, undefined, urlQ);
        }
      }
    };
    window.addEventListener("popstate", handleSyncUrl);

    let ws: WebSocket | null = null;
    try {
      const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
        .replace(/^http/, "ws") + "/api/v1/whatsapp/ws";
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "whatsapp_update" || data.type === "lead_updated") {
            debouncedFetchLeads();
          }
        } catch (err) {
          // ignore
        }
      };
    } catch (e) {
      console.error("WS error on leads page:", e);
    }

    return () => {
      window.removeEventListener("popstate", handleSyncUrl);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (ws) ws.close();
    };
  }, [fetchLeads, debouncedFetchLeads]);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    setCurrentPage(1);
    fetchLeads(1, pageSize, statusFilterRef.current);
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
      ? formatISTDate(lead.raw.next_followup_at)
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
      date: formatISTDateTime(new Date()),
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

      const dateDisplay = formatISTDate(targetDate);
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
      date: formatISTDate(new Date()),
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
    if (!canDeleteLeads) {
      triggerToast("Access Denied: Only authorized administrators can delete leads.");
      return;
    }
    if (!confirm(`Are you sure you want to delete "${lead.name}"?`)) return;
    try {
      const phoneParam = lead.phone ? `?phone=${encodeURIComponent(lead.phone)}` : "";
      const endpoint = lead.source === "inquiry"
        ? `${API}/api/v1/leads/${lead.rawId}${phoneParam}`
        : `${API}/api/v1/scraped-leads/${lead.rawId}${phoneParam}`;

      let res = await authFetch(endpoint, { method: "DELETE" });

      // Fallback: If 404 or failed on primary endpoint, try the alternate endpoint
      if (!res.ok && res.status === 404) {
        const altEndpoint = lead.source === "inquiry"
          ? `${API}/api/v1/scraped-leads/${lead.rawId}${phoneParam}`
          : `${API}/api/v1/leads/${lead.rawId}${phoneParam}`;
        res = await authFetch(altEndpoint, { method: "DELETE" });
      }

      if (res.ok) {
        inquiriesCacheRef.current = null;
        setAllLeads((prev) => prev.filter((l) => l.id !== lead.id && l.rawId !== lead.rawId));
        if (selectedLead?.id === lead.id || selectedLead?.rawId === lead.rawId) {
          setIsDrawerOpen(false);
          setSelectedLead(null);
        }
        triggerToast(`Lead "${lead.name}" deleted successfully`);
        await fetchLeads();
      } else {
        triggerToast("Failed to delete lead from server.");
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
      triggerToast("Error deleting lead.");
    }
  };

  // 1. Delete Selected Leads
  const handleDeleteSelected = async () => {
    if (!canDeleteLeads) {
      triggerToast("Access Denied: Only authorized administrators can delete leads.");
      return;
    }
    if (selectedLeadIds.size === 0) return;
    if (!confirm(`Are you sure you want to permanently delete ${selectedLeadIds.size} selected lead(s)?`)) return;

    try {
      const isLeadSelected = (l: NormalizedLead) => selectedLeadIds.has(l.id) || selectedLeadIds.has(l.rawId);
      const scrapedRawIds = allLeads.filter(l => isLeadSelected(l) && l.source === "scraped").map(l => l.rawId);
      const inquiryRawIds = allLeads.filter(l => isLeadSelected(l) && l.source === "inquiry").map(l => l.rawId);

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

      inquiriesCacheRef.current = null;
      setAllLeads(prev => prev.filter(l => !isLeadSelected(l)));
      setSelectedLeadIds(new Set());
      triggerToast(`Successfully deleted selected lead(s)`);
      await fetchLeads();
    } catch (err) {
      console.error("Failed selected delete:", err);
    }
  };

  // 2. Delete Current Page Leads
  const handleDeleteCurrentPage = async () => {
    if (!canDeleteLeads) {
      triggerToast("Access Denied: Only authorized administrators can delete leads.");
      return;
    }
    if (paginatedLeads.length === 0) return;
    if (!confirm(`Are you sure you want to delete all ${paginatedLeads.length} lead(s) visible on Page ${currentPage}?`)) return;

    try {
      const scrapedRawIds = paginatedLeads.filter(l => l.source === "scraped").map(l => l.rawId);
      const inquiryRawIds = paginatedLeads.filter(l => l.source === "inquiry").map(l => l.rawId);
      const pageIdsToRemove = new Set(paginatedLeads.map(l => l.id));
      const pageRawIdsToRemove = new Set(paginatedLeads.map(l => l.rawId));

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

      inquiriesCacheRef.current = null;
      setAllLeads(prev => prev.filter(l => !pageIdsToRemove.has(l.id) && !pageRawIdsToRemove.has(l.rawId)));
      setSelectedLeadIds(new Set());
      triggerToast(`Deleted ${paginatedLeads.length} lead(s) from Page ${currentPage}`);
      await fetchLeads();
    } catch (err) {
      console.error("Failed page delete:", err);
    }
  };

  // 2b. Delete Filtered Leads Only (e.g. only "pending", only "messages sent", or matching search/source)
  const handleDeleteFiltered = async () => {
    if (!canDeleteLeads) {
      triggerToast("Access Denied: Only authorized administrators can delete leads.");
      return;
    }
    const filterDesc = [
      statusFilter !== "all" ? `Status: ${statusFilter}` : null,
      messageSentFilter === "sent" ? "Messages Sent" : null,
      searchQuery.trim() ? `Search: "${searchQuery.trim()}"` : null,
      sourceFilter !== "all" ? `Source: ${sourceFilter}` : null,
    ].filter(Boolean).join(", ") || "Filtered view";

    const filteredCount = filteredLeads.length;
    if (filteredCount === 0) {
      triggerToast("No leads match the current filter to delete.");
      return;
    }

    if (!confirm(`⚠️ DELETE FILTERED LEADS ONLY?\n\nAre you sure you want to delete ONLY the ${filteredCount} lead(s) matching [${filterDesc}]?\n\nOther leads in your database will remain safe and untouched.`)) return;

    try {
      setLoading(true);
      const isScrapedTarget = sourceFilter === "all" || sourceFilter === "scraped";
      const isInquiryTarget = sourceFilter === "all" || sourceFilter === "inquiry";

      const promises: Promise<any>[] = [];

      if (isScrapedTarget) {
        promises.push(
          authFetch(`${API}/api/v1/scraped-leads/delete-by-filter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: statusFilter !== "all" ? statusFilter : null,
              search: searchQuery.trim() || null,
              message_sent: messageSentFilter === "sent" ? true : null,
            }),
          })
        );
      }

      if (isInquiryTarget) {
        promises.push(
          authFetch(`${API}/api/v1/leads/delete-by-filter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: statusFilter !== "all" ? statusFilter : null,
              search: searchQuery.trim() || null,
              message_sent: messageSentFilter === "sent" ? true : null,
            }),
          })
        );
      }

      const results = await Promise.allSettled(promises);
      let totalDeleted = 0;
      for (const res of results) {
        if (res.status === "fulfilled" && res.value && res.value.ok) {
          try {
            const data = await res.value.json();
            totalDeleted += Number(data.deleted_count || 0);
          } catch (e) {}
        }
      }

      inquiriesCacheRef.current = null;
      setSelectedLeadIds(new Set());
      triggerToast(`Successfully deleted ${totalDeleted || filteredCount} filtered lead(s)!`);
      await fetchLeads(1, pageSize);
    } catch (err) {
      console.error("Failed filtered delete:", err);
      triggerToast("Error deleting filtered leads");
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete ALL Database Leads
  const handleDeleteAllLeads = async () => {
    if (!canDeleteLeads) {
      triggerToast("Access Denied: Only authorized administrators can delete leads.");
      return;
    }
    const totalCount = (totalScrapedCount || totalLeadsFromAPI) + totalInquiriesCount;
    if (totalCount === 0 && allLeads.length === 0) return;
    if (!confirm(`🚨 CRITICAL ACTION:\nAre you sure you want to PERMANENTLY DELETE ALL ${totalCount || allLeads.length} leads from the database?\nThis will clear both the database and cache. This action cannot be undone!`)) return;

    try {
      setLoading(true);
      await Promise.allSettled([
        authFetch(`${API}/api/v1/scraped-leads/bulk`, { method: "DELETE" }),
        authFetch(`${API}/api/v1/leads/bulk`, { method: "DELETE" }),
      ]);

      inquiriesCacheRef.current = null;
      setAllLeads([]);
      setTotalScrapedCount(0);
      setTotalInquiriesCount(0);
      setTotalLeadsFromAPI(0);
      setSelectedLeadIds(new Set());
      triggerToast("Entire leads database & cache cleared successfully");
      await fetchLeads(1, pageSize);
    } catch (err) {
      console.error("Failed to delete all leads:", err);
      triggerToast("Error deleting all leads");
    } finally {
      setLoading(false);
    }
  };

  // 4. Clear Selected WhatsApp Chats & Reset Status
  const handleClearSelectedChats = async () => {
    if (selectedLeadIds.size === 0) return;
    if (!confirm(`Clear chat history & reset status for ${selectedLeadIds.size} selected lead(s)?`)) return;

    try {
      const isLeadSelected = (l: NormalizedLead) => selectedLeadIds.has(l.id) || selectedLeadIds.has(l.rawId);
      const scrapedRawIds = allLeads.filter(l => isLeadSelected(l) && l.source === "scraped").map(l => l.rawId);
      const inquiryRawIds = allLeads.filter(l => isLeadSelected(l) && l.source === "inquiry").map(l => l.rawId);
      const targetIds = [...scrapedRawIds, ...inquiryRawIds];

      const res = await authFetch(`${API}/api/v1/whatsapp/chats/clear-selected`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_ids: targetIds, reset_status: true }),
      });

      if (res.ok) {
        setAllLeads(prev => prev.map(l => isLeadSelected(l) ? { ...l, whatsapp_status: "pending", is_interested: false } : l));
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
        let errorDetail = "Failed to process spreadsheet.";
        if (res.status === 413) {
          errorDetail = "File size exceeds server upload limit (413 Request Entity Too Large). Nginx client_max_body_size needs to be 100M.";
        } else {
          try {
            const err = await res.json();
            errorDetail = err.detail || errorDetail;
          } catch {
            try {
              const text = await res.text();
              if (text.includes("413") || text.includes("Too Large")) {
                errorDetail = "File size exceeds server upload limit (413 Request Entity Too Large). Nginx client_max_body_size needs to be 100M.";
              } else {
                errorDetail = text.slice(0, 120) || errorDetail;
              }
            } catch {
              // fallback
            }
          }
        }
        setUploadResult(`Error: ${errorDetail}`);
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

  const isMessageSent = (l: NormalizedLead) => {
    const waStatus = String(l.whatsapp_status || "").toLowerCase();
    const emailStatus = String(l.email_status || "").toLowerCase();
    const mainStatus = String(l.status || "").toLowerCase();
    const hasWaSent = Boolean(l.whatsapp_sent_at || l.raw?.whatsapp_sent_at) ||
      ["outreach_sent", "sent", "delivered", "read", "replied", "interested", "contacted"].includes(waStatus);
    const hasEmailSent = Boolean(l.raw?.email_sent_at) ||
      ["outreach_sent", "sent", "contacted"].includes(emailStatus);
    const hasStatusContacted = ["outreach_sent", "contacted", "sent", "interested", "reply", "qualified", "closed"].includes(mainStatus);
    return hasWaSent || hasEmailSent || hasStatusContacted;
  };

  const filteredLeads = useMemo(() => {
    let result = allLeads;

    if (sourceFilter !== "all") {
      result = result.filter((l) => {
        if (sourceFilter === "inquiry") return l.source === "inquiry" || isOrganicInbound(l);
        return l.source === "scraped";
      });
    }

    if (statusFilter !== "all") {
      const sf = statusFilter.toLowerCase();
      result = result.filter((l) => {
        const leadStatus = (l.status || "").toLowerCase();
        const emailStatus = (l.email_status || "").toLowerCase();
        const waStatus = (l.whatsapp_status || "").toLowerCase();

        if (sf === "message_sent" || sf === "messages_sent" || sf === "sent_all") {
          return isMessageSent(l);
        }
        if (sf === "whatsapp_sent") {
          return Boolean(l.whatsapp_sent_at || l.raw?.whatsapp_sent_at) ||
            ["outreach_sent", "sent", "delivered", "read", "reply", "replied", "interested", "contacted"].includes(waStatus);
        }
        if (sf === "email_sent") {
          return Boolean(l.raw?.email_sent_at) ||
            ["outreach_sent", "sent", "contacted"].includes(emailStatus);
        }
        if (sf === "pending") {
          return leadStatus === "pending";
        }
        return leadStatus.replace(" ", "_") === sf || emailStatus.replace(" ", "_") === sf || waStatus.replace(" ", "_") === sf;
      });
    }

    // Independent Messages Sent filter (can be combined with ANY status filter!)
    if (messageSentFilter === "sent") {
      result = result.filter((l) => isMessageSent(l));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      result = result.filter(l =>
        matchesSimilaritySearch(q, [
          l.name,
          l.phone,
          l.email,
          l.company,
          l.city,
          l.category,
          l.scraped_service,
          l.services,
          l.address,
          l.website,
          l.message
        ])
      );
    }

    return result;
  }, [allLeads, sourceFilter, statusFilter, messageSentFilter, searchQuery]);

  const currentTotal = useMemo(() => {
    if (searchQuery.trim()) {
      return filteredLeads.length;
    }
    if (sourceFilter === "inquiry") {
      return totalInquiriesCount;
    }
    if (sourceFilter === "scraped") {
      return totalScrapedCount || totalLeadsFromAPI;
    }
    return (totalScrapedCount || totalLeadsFromAPI) + totalInquiriesCount;
  }, [searchQuery, filteredLeads.length, sourceFilter, totalScrapedCount, totalInquiriesCount, totalLeadsFromAPI]);

  const totalPages = Math.max(1, Math.ceil(currentTotal / pageSize));

  const paginatedLeads = useMemo(() => {
    if (sourceFilter === "inquiry") {
      const start = (currentPage - 1) * pageSize;
      return filteredLeads.slice(start, start + pageSize);
    }
    // For "all" and "scraped", data is ALREADY server-paginated for currentPage!
    // If page 1 has inquiries merged in, slice to pageSize to maintain 20 items per page
    if (currentPage === 1 && filteredLeads.length > pageSize) {
      return filteredLeads.slice(0, pageSize);
    }
    return filteredLeads;
  }, [filteredLeads, sourceFilter, currentPage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    fetchLeads(newPage, pageSize, statusFilter);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
          <div className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-white shrink-0" style={{ background: "var(--dash-primary)" }}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[var(--dash-text)]">Leads Database</h1>
              <span className="px-2 py-0.5 rounded-md bg-[var(--dash-primary)] text-white font-bold text-xs font-mono">
                {(totalScrapedCount || totalLeadsFromAPI) + totalInquiriesCount} Total
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
                className="crm-btn-primary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Send WhatsApp ({selectedLeadIds.size})</span>
              </button>
              <button
                type="button"
                onClick={handleClearSelectedChats}
                className="crm-btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center cursor-pointer font-bold"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--dash-primary)" }} />
                <span className="truncate">Clear Chats ({selectedLeadIds.size})</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleExportCSV}
            className="crm-btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--dash-text-muted)" }} />
            <span className="truncate">Export</span>
          </button>
          {canManageLeads && (
            <>
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="crm-btn-secondary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--dash-primary)" }} />
                <span className="truncate">Import</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddLeadModal(true)}
                className="crm-btn-primary text-xs flex items-center justify-center gap-1.5 py-2 sm:py-1.5 px-2 sm:px-3 text-center shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Add Lead</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* KPI Overview Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Total Prospects</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">{(totalScrapedCount || totalLeadsFromAPI) + totalInquiriesCount}</span>
            <span className="crm-badge badge-success text-[10px] sm:text-xs font-bold shrink-0">+14.2%</span>
          </div>
        </div>

        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Outbound Scraped</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">
              {totalScrapedCount || totalLeadsFromAPI}
            </span>
            <span className="crm-badge badge-warning text-[10px] sm:text-xs font-bold shrink-0 truncate">Google Maps</span>
          </div>
        </div>

        <div className="crm-card p-3 sm:p-4 flex flex-col justify-between">
          <span className="text-[11px] sm:text-xs font-semibold text-[var(--dash-text-muted)] uppercase tracking-wider truncate">Inbound Inquiries</span>
          <div className="mt-1 sm:mt-2 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--dash-text)]">
              {totalInquiriesCount}
            </span>
            <span className="crm-badge badge-violet text-[10px] sm:text-xs font-bold shrink-0 truncate">Web Forms</span>
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
      <section className="crm-card p-0 flex flex-col w-full max-w-full overflow-visible relative">
        
        {/* Tier 1: Segmented View Tabs */}
        <div className="px-3 sm:px-4 py-2.5 border-b border-[var(--dash-border)] flex items-center justify-between gap-3 w-full max-w-full overflow-x-auto scrollbar-none bg-[var(--dash-surface-alt)]/30">
          <div className="flex items-center gap-1.5 p-1 rounded-md bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] shrink-0">
            <button
              onClick={() => setSourceFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "all"
                  ? "bg-[var(--dash-primary)] text-white shadow-xs"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              All Leads ({(totalScrapedCount || totalLeadsFromAPI) + totalInquiriesCount})
            </button>
            <button
              onClick={() => setSourceFilter("scraped")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "scraped"
                  ? "bg-[var(--dash-primary)] text-white shadow-xs"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              Outbound Scraped ({totalScrapedCount || totalLeadsFromAPI})
            </button>
            <button
              onClick={() => setSourceFilter("inquiry")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 ${
                sourceFilter === "inquiry"
                  ? "bg-[var(--dash-primary)] text-white shadow-xs"
                  : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
              }`}
            >
              Inbound Inquiries ({totalInquiriesCount})
            </button>

            {/* Quick Filter: Messages Sent (Independent Toggle) */}
            <button
              type="button"
              onClick={() => {
                const nextMsg = messageSentFilter === "sent" ? "all" : "sent";
                setMessageSentFilter(nextMsg);
                setCurrentPage(1);
                fetchLeads(1, pageSize, undefined, undefined, nextMsg);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border ${
                messageSentFilter === "sent"
                  ? "bg-emerald-600 border-emerald-500 text-white shadow-xs font-bold"
                  : "bg-white/60 dark:bg-neutral-900/60 border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-emerald-500 hover:border-emerald-500/40"
              }`}
              title="Filter leads who were sent a WhatsApp or email message (can be combined with other filters)"
            >
              <MessageSquare className="w-3.5 h-3.5 shrink-0" />
              <span>Messages Sent</span>
              {messageSentFilter === "sent" && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Tier 2: Search, Filter, and Action Controls */}
        <div className="p-3 sm:p-4 border-b border-[var(--dash-border)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full max-w-full relative z-20">
          {/* Search Box - Flexibly fills space with a comfortable max width */}
          <div className="relative flex-1 min-w-[200px] max-w-md w-full">
            <Search className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, email, city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="crm-input !pl-9 py-2 text-xs w-full"
            />
          </div>

          {/* Action Row: Status Filter & Delete Options with plenty of breathing room */}
          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-between md:justify-end">
            <div className="relative flex-1 md:flex-none min-w-[150px] sm:min-w-[170px]">
              <select
                value={statusFilter}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setStatusFilter(newStatus);
                  setCurrentPage(1);
                  fetchLeads(1, pageSize, newStatus);
                }}
                className="crm-input !pl-8 !pr-8 py-2 text-xs font-semibold cursor-pointer appearance-none w-full"
              >
                <option value="all">All Status</option>
                <option value="pending">⏳ Pending (Not Contacted)</option>
                <option value="whatsapp_sent">📱 WhatsApp Sent</option>
                <option value="email_sent">✉️ Email Sent</option>
                <option value="interested">⭐ Interested</option>
                <option value="qualified">Qualified</option>
                <option value="failed">Failed</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-[var(--dash-text-muted)] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Multi-Option Deletion Menu */}
            {canDeleteLeads && (
            <div className="relative flex-1 md:flex-none shrink-0 z-30">
              <button
                type="button"
                onClick={() => setShowDeleteMenu(!showDeleteMenu)}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-xs font-semibold text-white shadow-sm shadow-rose-600/30 transition cursor-pointer w-full md:w-auto shrink-0 whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap font-semibold">Delete Options</span>
                {selectedLeadIds.size > 0 && (
                  <span className="bg-white/25 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-full shrink-0">
                    {selectedLeadIds.size}
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 opacity-80 shrink-0 ml-0.5" />
              </button>

              {showDeleteMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDeleteMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 w-72 sm:w-80 max-w-[90vw] bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-xl shadow-2xl z-50 overflow-y-auto max-h-[85vh] py-1 text-xs animate-fadeIn">
                      {/* Clear Selected Chats */}
                      <button
                        type="button"
                        disabled={selectedLeadIds.size === 0}
                        onClick={() => {
                          setShowDeleteMenu(false);
                          handleClearSelectedChats();
                        }}
                        className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-[var(--dash-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[var(--dash-text)] transition"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <MessageSquareOff className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="truncate">Clear Selected Chats & Reset</span>
                        </span>
                        <span className="font-bold font-mono text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20 shrink-0 ml-2">
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
                        className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-[var(--dash-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[var(--dash-text)] border-t border-[var(--dash-border)] transition"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <RefreshCw className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Clear ALL Chats & Reset</span>
                        </span>
                        <span className="font-bold font-mono text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0 ml-2">
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
                        className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-[var(--dash-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[var(--dash-text)] border-t border-[var(--dash-border)] transition"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="truncate">Remove Selected Leads</span>
                        </span>
                        <span className="font-bold font-mono text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20 shrink-0 ml-2">
                          {selectedLeadIds.size}
                        </span>
                      </button>

                      {/* Remove Filtered Leads Only (e.g. only "pending", only "messages sent") */}
                      {(statusFilter !== "all" || messageSentFilter !== "all" || searchQuery.trim() || sourceFilter !== "all") && (
                        <button
                          type="button"
                          disabled={filteredLeads.length === 0}
                          onClick={() => {
                            setShowDeleteMenu(false);
                            handleDeleteFiltered();
                          }}
                          className="w-full text-left px-3.5 py-2.5 font-semibold flex items-center justify-between bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 cursor-pointer border-t border-amber-500/20 transition"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <Filter className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span className="truncate">Delete Filtered Leads Only</span>
                          </span>
                          <span className="font-bold font-mono text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded shadow-xs shrink-0 ml-2">
                            {filteredLeads.length}
                          </span>
                        </button>
                      )}

                      {/* Remove Current Page */}
                      <button
                        type="button"
                        disabled={paginatedLeads.length === 0}
                        onClick={() => {
                          setShowDeleteMenu(false);
                          handleDeleteCurrentPage();
                        }}
                        className="w-full text-left px-3.5 py-2.5 font-medium flex items-center justify-between hover:bg-[var(--dash-surface-alt)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-[var(--dash-text)] border-t border-[var(--dash-border)] transition"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Trash2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate">Remove Current Page</span>
                        </span>
                        <span className="font-bold font-mono text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 shrink-0 ml-2">
                          Pg {currentPage} ({paginatedLeads.length})
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
                        className="w-full text-left px-3.5 py-2.5 font-bold flex items-center justify-between bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 cursor-pointer border-t border-rose-500/20 transition"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span className="truncate">Delete ALL Leads (Entire DB)</span>
                        </span>
                        <span className="font-bold font-mono text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded shadow-xs shrink-0 ml-2">
                          ALL ({(totalScrapedCount || totalLeadsFromAPI) + totalInquiriesCount})
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
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
                <th className="py-3 px-3 uppercase tracking-wider text-[10px]">Rating &amp; Reviews</th>
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
                        {lead.email ? (
                          <div className="text-[var(--dash-text-muted)] text-[11px] truncate max-w-[200px]" title={lead.email}>
                            {lead.email}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="text-[var(--dash-text-muted)] italic">Not provided</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenLeadDrawer(lead);
                              }}
                              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 cursor-pointer"
                            >
                              + Add Email
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-[var(--dash-text)]">
                    <div className="truncate max-w-[180px]" title={lead.company || lead.city || "—"}>
                      {lead.company || lead.city || "—"}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-[var(--dash-text-secondary)]">
                    <span
                      className="inline-block max-w-[260px] truncate font-medium"
                      title={formatServiceText(lead.services.join(" • ") || lead.category)}
                    >
                      {formatServiceText(lead.services.join(" • ") || lead.category) || "General Services"}
                    </span>
                  </td>

                  {/* Rating & Google Reviews */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {lead.rating || lead.raw?.rating || "4.5"}
                      </span>
                      {(lead.total_review || lead.raw?.total_review) && (
                        <span className="text-[10px] text-[var(--dash-text-muted)]">
                          ({lead.total_review || lead.raw?.total_review})
                        </span>
                      )}
                      {(lead.reviews || lead.raw?.reviews) && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20" title="Verified Customer Reviews Available">
                          {(() => {
                            try {
                              const rawRev = lead.reviews || lead.raw?.reviews;
                              const rList = typeof rawRev === "string" ? JSON.parse(rawRev) : rawRev;
                              return `${Array.isArray(rList) ? rList.length : 1} reviews`;
                            } catch {
                              return "reviews";
                            }
                          })()}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      isOrganicInbound(lead)
                        ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    }`}>
                      {isOrganicInbound(lead) ? "Inbound" : "Outbound"}
                    </span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                        lead.status.toLowerCase() === "interested"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : lead.status.toLowerCase() === "outreach sent" || lead.status.toLowerCase() === "outreach_sent"
                          ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                          : lead.status.toLowerCase() === "reply"
                          ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          : lead.status.toLowerCase() === "qualified"
                          ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          : lead.status.toLowerCase() === "closed"
                          ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                          : lead.status.toLowerCase() === "pending"
                          ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          lead.status.toLowerCase() === "interested"
                            ? "bg-emerald-500"
                            : lead.status.toLowerCase() === "outreach sent" || lead.status.toLowerCase() === "outreach_sent"
                            ? "bg-blue-500"
                            : lead.status.toLowerCase() === "reply"
                            ? "bg-amber-500"
                            : lead.status.toLowerCase() === "qualified"
                            ? "bg-purple-500"
                            : lead.status.toLowerCase() === "closed"
                            ? "bg-indigo-500"
                            : lead.status.toLowerCase() === "pending"
                            ? "bg-slate-500"
                            : "bg-rose-500"
                        }`} />
                        {lead.status}
                      </span>
                      {lead.status.toLowerCase() === "interested" && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${
                          lead.source === "inquiry"
                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        }`}>
                          {lead.source === "inquiry" ? "✓ Details: Done" : "⏳ Details: Pending"}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[11px] border border-emerald-500/20">
                      {lead.score}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-[var(--dash-text-muted)] whitespace-nowrap font-mono text-[11px]">
                    {formatISTDate(lead.created_at)}
                  </td>

                  <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {(lead.maps_url || lead.raw?.maps_url) && (
                        <a
                          href={lead.maps_url || lead.raw?.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-blue-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                          title="Open on Google Maps"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      )}
                      {canSendWhatsapp && (
                        <button
                          onClick={() => openWaModalForLead(lead)}
                          className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                          title="Send WhatsApp Outreach Proposal"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteLeads && (
                        <button
                          onClick={() => handleDeleteLead(lead)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-semibold border ${
                    lead.status.toLowerCase() === "interested"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : lead.status.toLowerCase() === "outreach sent" || lead.status.toLowerCase() === "outreach_sent"
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                      : lead.status.toLowerCase() === "reply"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      : lead.status.toLowerCase() === "qualified"
                      ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                      : lead.status.toLowerCase() === "closed"
                      ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
                      : lead.status.toLowerCase() === "pending"
                      ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                      : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      lead.status.toLowerCase() === "interested"
                        ? "bg-emerald-500"
                        : lead.status.toLowerCase() === "outreach sent" || lead.status.toLowerCase() === "outreach_sent"
                        ? "bg-blue-500"
                        : lead.status.toLowerCase() === "reply"
                        ? "bg-amber-500"
                        : lead.status.toLowerCase() === "qualified"
                        ? "bg-purple-500"
                        : lead.status.toLowerCase() === "closed"
                        ? "bg-indigo-500"
                        : lead.status.toLowerCase() === "pending"
                        ? "bg-slate-500"
                        : "bg-rose-500"
                    }`} />
                    {lead.status}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[10px] border border-emerald-500/20">
                    Score: {lead.score}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    isOrganicInbound(lead)
                      ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                      : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  }`}>
                    {isOrganicInbound(lead) ? "Inbound" : "Outbound"}
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
                    <div className="flex items-center gap-2 text-[11px]">
                      <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--dash-text-muted)]" />
                      <span className="text-[var(--dash-text-muted)] italic">Not provided</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLeadDrawer(lead);
                        }}
                        className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/40 cursor-pointer"
                      >
                        + Add Email
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[11px] text-[var(--dash-text-muted)]">
                    <span className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {lead.city || "India"}
                    </span>
                    <span className="shrink-0">{formatISTDate(lead.created_at, { month: "short", day: "numeric" })}</span>
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
                    {lead.phone && canSendWhatsapp && (
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
        {(currentTotal > 0 || filteredLeads.length > 0) && (() => {
          const startItem = currentTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
          const endItem = Math.min(currentPage * pageSize, currentTotal);
          // Smart sliding window pagination: direct pages when <= 10, otherwise windowed with ellipsis
          const getPageNumbers = () => {
            const pages: (number | string)[] = [];
            if (totalPages <= 10) {
              for (let i = 1; i <= totalPages; i++) pages.push(i);
            } else if (currentPage <= 4) {
              for (let i = 1; i <= Math.min(6, totalPages); i++) pages.push(i);
              if (totalPages > 6) {
                pages.push("...");
                pages.push(totalPages);
              }
            } else if (currentPage >= totalPages - 3) {
              pages.push(1);
              pages.push("...");
              for (let i = totalPages - 5; i <= totalPages; i++) pages.push(i);
            } else {
              pages.push(1);
              pages.push("...");
              for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
              pages.push("...");
              pages.push(totalPages);
            }
            return pages;
          };
          const getMobilePageNumbers = () => {
            if (totalPages <= 3) {
              return Array.from({ length: totalPages }, (_, i) => i + 1);
            }
            if (currentPage <= 1) {
              return [1, 2, 3];
            }
            if (currentPage >= totalPages) {
              return [totalPages - 2, totalPages - 1, totalPages];
            }
            return [currentPage - 1, currentPage, currentPage + 1];
          };

          return (
          <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-neutral-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full">
            {/* Desktop / Tablet Info & Controls */}
            <div className="hidden sm:flex items-center gap-3 flex-wrap">
              <span className="text-xs text-slate-500 dark:text-neutral-400">
                Showing <span className="font-semibold text-slate-900 dark:text-white">{startItem}-{endItem}</span> of{" "}
                <span className="font-semibold text-slate-900 dark:text-white">{currentTotal}</span> leads
              </span>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-neutral-400">
                <span>Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPageSize(newSize);
                    setCurrentPage(1);
                    fetchLeads(1, newSize, statusFilter);
                  }}
                  className="px-2 py-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-md text-xs font-semibold text-slate-700 dark:text-neutral-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Desktop / Tablet Sliding Window Pagination (>= sm) */}
            {totalPages > 1 && (
              <div className="hidden sm:flex items-center gap-1 flex-wrap justify-end">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
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
                      disabled={currentPage === p}
                      onClick={() => handlePageChange(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        currentPage === p
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30 cursor-default pointer-events-none"
                          : "bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer"
                      }`}
                    >
                      {p}
                    </button>
                  )
                ))}
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="px-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-40 cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Mobile Responsive Pagination Bar (< sm) - NEVER WRAPS */}
            <div className="flex sm:hidden flex-col gap-2.5 w-full">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
                <span>
                  Showing <strong className="font-semibold text-slate-900 dark:text-white">{startItem}-{endItem}</strong> of <strong className="font-semibold text-slate-900 dark:text-white">{currentTotal}</strong>
                </span>
                <div className="flex items-center gap-1 text-[11px]">
                  <span>Limit:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                      setCurrentPage(1);
                      fetchLeads(1, newSize, statusFilter);
                    }}
                    className="px-1.5 py-0.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded text-xs font-semibold text-slate-700 dark:text-neutral-200 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-1 w-full pt-0.5">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className="px-2.5 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Prev</span>
                  </button>

                  <div className="flex items-center gap-1 justify-center flex-1 min-w-0">
                    {getMobilePageNumbers().map((p) => (
                      <button
                        key={p}
                        disabled={currentPage === p}
                        onClick={() => handlePageChange(p)}
                        className={`text-xs min-w-[32px] h-8 px-1.5 rounded-md font-bold flex items-center justify-center transition ${
                          currentPage === p
                            ? "bg-indigo-600 text-white shadow-xs cursor-default pointer-events-none"
                            : "bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-300 cursor-pointer"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <span className="text-[11px] font-mono shrink-0 ml-0.5 text-slate-400 dark:text-neutral-500">
                      /{totalPages}
                    </span>
                  </div>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="px-2.5 py-2 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-neutral-200 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-1 shrink-0"
                    title="Next page"
                  >
                    <span className="text-[11px]">Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
          );
        })()}
      </section>

      {/* ── Ultra-Modern App-Like Lead Business Card & Intelligence Drawer ── */}
      {mounted && typeof document !== "undefined" && isDrawerOpen && selectedLead && createPortal(
        <div
          onClick={() => setIsDrawerOpen(false)}
          data-dash-theme={typeof document !== "undefined" ? document.documentElement.getAttribute("data-dash-theme") || (document.documentElement.classList.contains("dark") ? "dark" : "light") : "dark"}
          className="fixed inset-0 z-[9999] overflow-hidden bg-black/70 backdrop-blur-sm flex justify-end animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-xl md:max-w-2xl h-full h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between cursor-default relative overflow-hidden bg-[var(--dash-surface)] border-l border-[var(--dash-border)]"
          >
            {/* Top Bar: Brand, Badges, Quick Pipeline Chip, Close */}
            <div
              className="flex-none px-4 sm:px-6 py-3.5 flex items-center justify-between z-30 sticky top-0 border-b border-[var(--dash-border)] bg-[var(--dash-surface)]/95 backdrop-blur-md"
              style={{ paddingTop: "max(env(safe-area-inset-top, 0px), 0.85rem)" }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-500/30 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition cursor-pointer shadow-xs"
                  title="Click to update pipeline status"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>{selectedLead.status}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  AI Fit: {selectedLead.score}/100
                </span>

                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  isOrganicInbound(selectedLead)
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                }`}>
                  {isOrganicInbound(selectedLead) ? "Inbound" : "Outbound"}
                </span>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] transition active:scale-95 cursor-pointer"
                aria-label="Close drawer"
                title="Close drawer (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Hero Header */}
            <div className="flex-none px-4 sm:px-6 pt-4 pb-3 bg-gradient-to-b from-[var(--dash-surface-alt)]/60 to-transparent border-b border-[var(--dash-border)]/60">
              <div className="flex items-start gap-3.5">
                {/* Brand Logo / Favicon */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border border-[var(--dash-border)] bg-white shadow-sm shrink-0 flex items-center justify-center">
                  {(() => {
                    const domain = selectedLead.website
                      ? selectedLead.website.replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./i, "")
                      : selectedLead.email && !selectedLead.email.includes("gmail") && !selectedLead.email.includes("yahoo") && !selectedLead.email.includes("outlook")
                      ? selectedLead.email.split("@")[1]
                      : null;

                    if (domain) {
                      return (
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
                          alt={selectedLead.name}
                          className="w-full h-full object-contain p-1.5"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                            const fallback = e.currentTarget.parentElement?.querySelector(".lead-avatar-fallback");
                            if (fallback) (fallback as HTMLElement).style.display = "flex";
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                  <div
                    className="lead-avatar-fallback w-full h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white font-black text-lg flex items-center justify-center"
                    style={{
                      display: selectedLead.website || (selectedLead.email && !selectedLead.email.includes("gmail") && !selectedLead.email.includes("yahoo")) ? "none" : "flex"
                    }}
                  >
                    {selectedLead.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-bold leading-tight truncate text-[var(--dash-text)]">
                      {selectedLead.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--dash-text-muted)] truncate font-medium mt-0.5">
                    {selectedLead.company || selectedLead.category || selectedLead.city || "Commercial Prospect"}
                  </p>

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs">
                    {selectedLead.phone && (
                      <span className="font-mono text-[var(--dash-text)] font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-500" />
                        {format10DigitPhone(selectedLead.phone)}
                      </span>
                    )}
                    {selectedLead.email && (
                      <span className="text-indigo-400 font-medium truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 text-indigo-400" />
                        {selectedLead.email}
                      </span>
                    )}
                    {isValidWebsite(selectedLead.website) && (
                      <a
                        href={formatWebsiteUrl(selectedLead.website)!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="truncate">{selectedLead.website.replace(/^https?:\/\//i, "")}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Tactile Action Pill Toolbar */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 mt-3.5">
                <button
                  type="button"
                  onClick={handleCallClick}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[var(--dash-surface-alt)] hover:bg-[var(--dash-surface-alt)]/80 border border-[var(--dash-border)] text-[var(--dash-text)] transition cursor-pointer"
                  title="Make direct phone call"
                >
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Call</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppClick}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[var(--dash-surface-alt)] hover:bg-[var(--dash-surface-alt)]/80 border border-[var(--dash-border)] text-[var(--dash-text)] transition cursor-pointer"
                  title="Open direct WhatsApp chat"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleEmailClick}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[var(--dash-surface-alt)] hover:bg-[var(--dash-surface-alt)]/80 border border-[var(--dash-border)] text-[var(--dash-text)] transition cursor-pointer"
                  title="Compose outreach email"
                >
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Email</span>
                </button>

                <button
                  type="button"
                  onClick={() => openWaModalForLead(selectedLead)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                  title="Send interactive WhatsApp proposal"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Pitch</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowFollowupModal(true)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border transition cursor-pointer ${
                    selectedLead.followupDate
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                      : "bg-[var(--dash-surface-alt)] hover:bg-[var(--dash-surface-alt)]/80 border-[var(--dash-border)] text-[var(--dash-text)]"
                  }`}
                  title="Schedule or reschedule follow-up reminder"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{selectedLead.followupDate ? "Edit Task" : "Follow-up"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLeadDrawerTab("notes");
                    setShowNoteInput(true);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[var(--dash-surface-alt)] hover:bg-[var(--dash-surface-alt)]/80 border border-[var(--dash-border)] text-[var(--dash-text)] transition cursor-pointer"
                  title="Add internal note"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-500" />
                  <span>Note</span>
                </button>
              </div>

              {/* Segmented App Tabs Navigation */}
              <div className="flex items-center gap-1 mt-3.5 p-1 rounded-lg bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                <button
                  type="button"
                  onClick={() => setLeadDrawerTab("overview")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    leadDrawerTab === "overview"
                      ? "bg-[var(--dash-primary)] text-white shadow-xs font-bold"
                      : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Overview &amp; Intel</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadDrawerTab("timeline")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    leadDrawerTab === "timeline"
                      ? "bg-[var(--dash-primary)] text-white shadow-xs font-bold"
                      : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Activity Timeline</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadDrawerTab("notes")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    leadDrawerTab === "notes"
                      ? "bg-[var(--dash-primary)] text-white shadow-xs font-bold"
                      : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Notes ({selectedLead.notes?.length || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLeadDrawerTab("reviews")}
                  className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    leadDrawerTab === "reviews"
                      ? "bg-[var(--dash-primary)] text-white shadow-xs font-bold"
                      : "text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Reviews {(() => {
                    try {
                      const rawRev = selectedLead.reviews || selectedLead.raw?.reviews;
                      const rList = typeof rawRev === "string" ? JSON.parse(rawRev) : rawRev;
                      return Array.isArray(rList) && rList.length > 0 ? `(${rList.length})` : "";
                    } catch {
                      return "";
                    }
                  })()}</span>
                </button>
              </div>
            </div>

            {/* Scrollable Main Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 crm-scrollbar">
              {/* Follow-up Reminder Banner */}
              {selectedLead.followupDate && (
                <div className="p-3 rounded-xl flex items-center justify-between border border-amber-500/30 bg-amber-500/10 text-xs shadow-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-amber-500 text-xs">Scheduled Follow-up</div>
                      <div className="text-[11px] font-medium text-[var(--dash-text)] opacity-90 truncate">
                        {selectedLead.followupDate}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowFollowupModal(true)}
                      className="px-2.5 py-1 rounded-md bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelFollowup}
                      className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 font-bold text-xs hover:bg-rose-500 hover:text-white transition cursor-pointer"
                      title="Clear follow-up"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 1: OVERVIEW & INTEL */}
              {leadDrawerTab === "overview" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Campaign Status Card */}
                  <div className="crm-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                        Outreach Status &amp; Bot AI
                      </h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        (selectedLead.whatsapp_ai_enabled ?? selectedLead.raw?.whatsapp_ai_enabled) !== false
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                      }`}>
                        AI Bot: {(selectedLead.whatsapp_ai_enabled ?? selectedLead.raw?.whatsapp_ai_enabled) !== false ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div className="p-3 rounded-lg bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                        <span className="text-[10px] text-[var(--dash-text-muted)] block font-medium uppercase">WhatsApp Outreach</span>
                        <span className="font-bold capitalize text-emerald-500 text-sm">
                          {selectedLead.whatsapp_status || selectedLead.raw?.whatsapp_status || "Pending"}
                        </span>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--dash-surface-alt)] border border-[var(--dash-border)]">
                        <span className="text-[10px] text-[var(--dash-text-muted)] block font-medium uppercase">Email Outreach</span>
                        <span className="font-bold capitalize text-indigo-400 text-sm">
                          {selectedLead.email_status || selectedLead.raw?.email_status || "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Location & Geocoding Details */}
                  <div className="crm-card p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                      Physical Location &amp; Contact Info
                    </h4>

                    <div className="space-y-2.5 text-xs">
                      {/* Physical Address */}
                      {(selectedLead.address || selectedLead.raw?.bussiness_address) && (
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <span className="font-medium text-[var(--dash-text)]">
                              {selectedLead.address || selectedLead.raw?.bussiness_address}
                            </span>
                            {(selectedLead.landmark || selectedLead.raw?.landmark) && (
                              <div className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">
                                Landmark: <span className="font-semibold text-[var(--dash-text)]">{selectedLead.landmark || selectedLead.raw?.landmark}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Chips: Building, Area, City, Pin */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {(selectedLead.building || selectedLead.raw?.building) && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--dash-surface-alt)] text-[var(--dash-text)] border border-[var(--dash-border)]">
                            <Building className="w-3 h-3 text-slate-400" />
                            {selectedLead.building || selectedLead.raw?.building}
                          </span>
                        )}
                        {(selectedLead.bussiness_area || selectedLead.raw?.bussiness_area) && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--dash-surface-alt)] text-[var(--dash-text)] border border-[var(--dash-border)]">
                            {selectedLead.bussiness_area || selectedLead.raw?.bussiness_area}
                          </span>
                        )}
                        {selectedLead.city && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {selectedLead.city}
                          </span>
                        )}
                        {(selectedLead.pincode || selectedLead.raw?.pincode) && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[var(--dash-surface-alt)] text-[var(--dash-text-muted)] border border-[var(--dash-border)] font-mono">
                            PIN: {selectedLead.pincode || selectedLead.raw?.pincode}
                          </span>
                        )}
                      </div>

                      {/* Chips: Street, Neighborhood, State, Photos */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                        {(selectedLead.street_address || selectedLead.raw?.street_address) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--dash-surface-alt)] text-[var(--dash-text-secondary)] border border-[var(--dash-border)]">
                            {selectedLead.street_address || selectedLead.raw?.street_address}
                          </span>
                        )}
                        {(selectedLead.neighborhood || selectedLead.raw?.neighborhood) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--dash-surface-alt)] text-[var(--dash-text-secondary)] border border-[var(--dash-border)]">
                            {selectedLead.neighborhood || selectedLead.raw?.neighborhood}
                          </span>
                        )}
                        {(selectedLead.state || selectedLead.raw?.state) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            {selectedLead.state || selectedLead.raw?.state}
                          </span>
                        )}
                        {(selectedLead.photos_count || selectedLead.raw?.photos_count) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--dash-surface-alt)] text-[var(--dash-text-muted)] border border-[var(--dash-border)]">
                            📷 {selectedLead.photos_count || selectedLead.raw?.photos_count} Photos
                          </span>
                        )}
                      </div>

                      {/* Google Rating */}
                      {(selectedLead.rating || selectedLead.raw?.rating) && (
                        <div className="flex items-center justify-between pt-1 text-amber-500 font-semibold">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 fill-amber-500" />
                            <span>
                              {selectedLead.rating || selectedLead.raw?.rating} / 5.0
                              {(selectedLead.total_review || selectedLead.raw?.total_review) && (
                                <span className="text-[var(--dash-text-muted)] font-normal ml-1">
                                  ({selectedLead.total_review || selectedLead.raw?.total_review} reviews)
                                </span>
                              )}
                            </span>
                          </div>
                          {(selectedLead.reviews || selectedLead.raw?.reviews) && (
                            <button
                              type="button"
                              onClick={() => setLeadDrawerTab("reviews")}
                              className="text-[11px] font-bold text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                            >
                              <span>Read Reviews</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}

                      {/* Industry Category */}
                      {selectedLead.category && (
                        <div className="flex items-center gap-2 pt-1">
                          <Tag className="w-4 h-4 text-[var(--dash-text-muted)]" />
                          <span className="crm-badge badge-primary text-xs">
                            {selectedLead.category}
                          </span>
                        </div>
                      )}

                      {/* Description / About Business */}
                      {(selectedLead.description || selectedLead.raw?.description) && (
                        <div className="p-2.5 rounded-lg bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] text-xs mt-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1">
                            About Business
                          </div>
                          <p className="text-[var(--dash-text-secondary)] leading-relaxed text-xs">
                            {selectedLead.description || selectedLead.raw?.description}
                          </p>
                        </div>
                      )}

                      {/* Opening Hours */}
                      {(selectedLead.opening_hours || selectedLead.raw?.opening_hours) && (
                        <div className="p-2.5 rounded-lg bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] text-xs mt-1.5">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            <span>Opening Hours</span>
                          </div>
                          <p className="text-[var(--dash-text)] font-mono text-[11px] leading-relaxed">
                            {selectedLead.opening_hours || selectedLead.raw?.opening_hours}
                          </p>
                        </div>
                      )}

                      {/* Popular Topics */}
                      {(selectedLead.popular_topics || selectedLead.raw?.popular_topics) && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
                          <span className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase">Popular Topics:</span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {selectedLead.popular_topics || selectedLead.raw?.popular_topics}
                          </span>
                        </div>
                      )}

                      {/* Google Maps Direct CTA Button */}
                      {(selectedLead.maps_url || selectedLead.raw?.maps_url) && (
                        <a
                          href={selectedLead.maps_url || selectedLead.raw?.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm transition active:scale-[0.99] mt-2"
                        >
                          <MapPin className="w-4 h-4 text-white shrink-0" />
                          <span>View Official Google Maps Profile</span>
                          <ExternalLink className="w-3.5 h-3.5 text-white/80 shrink-0 ml-1" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Inbound Customer Requirements (If Any) */}
                  {selectedLead.source === "inquiry" && selectedLead.message && (
                    <div className="crm-card p-4 space-y-2 border-indigo-500/30 bg-indigo-500/5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Client Inquiry Message
                      </h4>
                      <p className="text-xs leading-relaxed text-[var(--dash-text)] italic">
                        "{selectedLead.message}"
                      </p>
                      {selectedLead.services && selectedLead.services.length > 0 && (
                        <div className="text-xs text-[var(--dash-text-muted)] pt-1">
                          Requested Services: <strong className="text-[var(--dash-text)]">{selectedLead.services.join(", ")}</strong>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ACTIVITY TIMELINE */}
              {leadDrawerTab === "timeline" && (
                <div className="crm-card p-4 space-y-3.5 animate-fadeIn">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                    Audit Trail &amp; Prospect Activity
                  </h4>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--dash-border)]">
                    {/* Follow-up reminder */}
                    {selectedLead.followupDate && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 ring-4 ring-cyan-500/20 animate-pulse" />
                        <div className="text-xs font-bold text-cyan-500">
                          📅 Scheduled Follow-up
                        </div>
                        <div className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">
                          Reminder set for: <strong className="text-[var(--dash-text)]">{selectedLead.followupDate}</strong>
                        </div>
                      </div>
                    )}

                    {/* Customer Reply Event */}
                    {selectedLead.raw?.whatsapp_last_reply && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                        <div className="text-xs font-bold text-amber-500">
                          💬 Inbound WhatsApp Reply Received
                        </div>
                        <div className="text-xs mt-1 italic p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                          "{selectedLead.raw.whatsapp_last_reply}"
                        </div>
                        {selectedLead.raw?.whatsapp_reply_at && (
                          <div className="text-[10px] text-[var(--dash-text-muted)] mt-1">
                            {formatISTDateTime(selectedLead.raw.whatsapp_reply_at)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* WhatsApp Proposal Dispatched */}
                    {selectedLead.raw?.whatsapp_status && selectedLead.raw.whatsapp_status !== "pending" && (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                        <div className="text-xs font-bold text-emerald-500">
                          📱 WhatsApp Outreach Dispatched
                        </div>
                        <div className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                          Interactive proposal sent. Status: <span className="font-bold uppercase text-emerald-500">{selectedLead.raw.whatsapp_status}</span>
                        </div>
                        {selectedLead.raw?.whatsapp_sent_at && (
                          <div className="text-[10px] text-[var(--dash-text-muted)] mt-1">
                            {formatISTDateTime(selectedLead.raw.whatsapp_sent_at)}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom activities */}
                    {selectedLead.customActivities && selectedLead.customActivities
                      .filter((act: any) => act.type !== "followup")
                      .map((act: any, idx: number) => (
                        <div key={idx} className="relative">
                          <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                          <div className="text-xs font-semibold text-[var(--dash-text)]">
                            {act.title}
                          </div>
                          <div className="text-xs text-[var(--dash-text-muted)] mt-0.5 whitespace-pre-wrap leading-relaxed">
                            {act.desc}
                          </div>
                          <div className="text-[10px] text-[var(--dash-text-muted)] mt-1">
                            {act.date}
                          </div>
                        </div>
                      ))}

                    {/* Genesis Event */}
                    {selectedLead.source === "inquiry" ? (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-indigo-500" />
                        <div className="text-xs font-bold text-indigo-400">
                          📥 Website Lead Inquiry Created
                        </div>
                        <div className="text-[11px] text-[var(--dash-text-muted)] mt-1">
                          {formatISTDateTime(selectedLead.created_at)}
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <div className="text-xs font-bold text-blue-400">
                          🗺️ Scraped from Google Maps
                        </div>
                        <div className="text-[11px] text-[var(--dash-text-muted)] mt-0.5">
                          {selectedLead.company || selectedLead.city || "Local Business Listing"}
                        </div>
                        <div className="text-[10px] text-[var(--dash-text-muted)] mt-1">
                          {formatISTDate(selectedLead.created_at)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: INTERNAL NOTES */}
              {leadDrawerTab === "notes" && (
                <div className="space-y-3.5 animate-fadeIn">
                  {/* Add Note Trigger */}
                  <div className="crm-card p-4 space-y-2.5">
                    <label className="text-xs font-bold block text-[var(--dash-text-muted)] uppercase tracking-wider">
                      Add Internal Team Note
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Type details about your calls, pricing discussions, or client objections..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleAddNote())}
                      className="crm-input w-full text-xs"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="crm-btn-primary text-xs py-1.5 px-3 font-semibold disabled:opacity-40 cursor-pointer"
                      >
                        Save Note Permanently
                      </button>
                    </div>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-2">
                    {selectedLead.notes && selectedLead.notes.length > 0 ? (
                      selectedLead.notes.map((n: any, idx: number) => (
                        <div key={idx} className="crm-card p-3 space-y-1 bg-[var(--dash-surface-alt)]">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-500">Note by {n.author || "Admin"}</span>
                            <span className="text-[var(--dash-text-muted)] font-mono">{n.date}</span>
                          </div>
                          <p className="text-xs text-[var(--dash-text)] whitespace-pre-wrap leading-relaxed">
                            {n.text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-[var(--dash-text-muted)] border border-dashed border-[var(--dash-border)] rounded-xl">
                        No team notes yet. Write a note above to record insights on this lead!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: GOOGLE REVIEWS & REPUTATION */}
              {leadDrawerTab === "reviews" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="crm-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                          Customer Reviews ({(() => {
                            try {
                              const rawRev = selectedLead.reviews || selectedLead.raw?.reviews;
                              const rList = typeof rawRev === "string" ? JSON.parse(rawRev) : rawRev;
                              return Array.isArray(rList) ? rList.length : 0;
                            } catch {
                              return 0;
                            }
                          })()})
                        </h4>
                      </div>
                      {(selectedLead.rating || selectedLead.raw?.rating) && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          ★ {selectedLead.rating || selectedLead.raw?.rating} / 5.0
                        </span>
                      )}
                    </div>

                    {(() => {
                      let revList: any[] = [];
                      try {
                        const rawRev = selectedLead.reviews || selectedLead.raw?.reviews;
                        if (rawRev) {
                          revList = typeof rawRev === "string" ? JSON.parse(rawRev) : rawRev;
                          if (!Array.isArray(revList)) revList = [];
                        }
                      } catch {
                        revList = [];
                      }

                      if (revList.length === 0) {
                        return (
                          <div className="text-center py-10 px-4 space-y-3 text-xs text-[var(--dash-text-muted)] border border-dashed border-[var(--dash-border)] rounded-xl">
                            <Star className="w-8 h-8 mx-auto text-amber-400/40" />
                            <div>
                              <p className="font-semibold text-[var(--dash-text)]">No Customer Reviews Recorded</p>
                              <p className="text-[11px] mt-0.5">This business listing does not currently have Google customer review quotes in the database.</p>
                            </div>
                            {(selectedLead.maps_url || selectedLead.raw?.maps_url) && (
                              <a
                                href={selectedLead.maps_url || selectedLead.raw?.maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold hover:bg-indigo-500/20 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>Check Live Reviews on Google Maps</span>
                              </a>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-3 pt-1">
                          {revList.map((rev: any, idx: number) => {
                            const ratingNum = parseInt(String(rev.rating || "5"), 10) || 5;
                            return (
                              <div
                                key={idx}
                                className="p-3.5 rounded-xl bg-[var(--dash-surface-alt)] border border-[var(--dash-border)] space-y-2.5 hover:border-amber-500/30 transition shadow-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                                      {(rev.author || "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-[var(--dash-text)] truncate">
                                        {rev.author || "Google Reviewer"}
                                      </div>
                                      {rev.date && (
                                        <div className="text-[10px] text-[var(--dash-text-muted)]">
                                          {rev.date}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-0.5 shrink-0 text-amber-400">
                                    {Array.from({ length: 5 }).map((_, sIdx) => (
                                      <Star
                                        key={sIdx}
                                        className={`w-3.5 h-3.5 ${
                                          sIdx < ratingNum
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-slate-300 dark:text-neutral-700"
                                        }`}
                                      />
                                    ))}
                                    <span className="text-[11px] font-bold text-amber-500 ml-1 font-mono">
                                      {rev.rating || "5.0"}
                                    </span>
                                  </div>
                                </div>
                                {rev.text && (
                                  <div className="relative pl-3 border-l-2 border-amber-500/40 text-xs text-[var(--dash-text-secondary)] italic leading-relaxed pt-0.5">
                                    "{rev.text}"
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer CTA Bar */}
            <div
              className="flex-none px-4 sm:px-6 py-3 flex items-center justify-between gap-2 z-30 border-t border-[var(--dash-border)] bg-[var(--dash-surface)]"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px), 0.85rem)" }}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-3 py-2 rounded-lg text-xs font-semibold bg-[var(--dash-surface-alt)] hover:bg-[var(--dash-surface-alt)]/80 border border-[var(--dash-border)] text-[var(--dash-text)] transition cursor-pointer"
                >
                  Close
                </button>

                {canDeleteLeads && (
                  <button
                    type="button"
                    onClick={() => handleDeleteLead(selectedLead)}
                    className="px-2.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-500 transition cursor-pointer flex items-center gap-1"
                    title="Delete lead from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {canSendWhatsapp && (
                  <button
                    type="button"
                    onClick={() => openWaModalForLead(selectedLead)}
                    className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>WhatsApp Proposal</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowStatusModal(true)}
                  className="crm-btn-primary px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 active:scale-95"
                >
                  <span>Update Status</span>
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
          className="fixed inset-0 z-[10001] overflow-y-auto bg-black/80 backdrop-blur-xs flex min-h-full items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg crm-card p-6 space-y-5 cursor-default relative my-auto shadow-2xl"
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
          className="fixed inset-0 z-[10001] overflow-y-auto bg-black/80 backdrop-blur-xs flex min-h-full items-center justify-center p-4 animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md crm-card p-6 space-y-4 cursor-default relative my-auto shadow-2xl"
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
