"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/lib/authStore";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  Briefcase,
  HelpCircle,
  LogOut,
  Menu,
  X,
  UserCheck,
  Star,
  Search,
  Bell,
  Sun,
  Moon,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  CheckCheck,
  Trash2,
  Mail,
  CheckCircle2,
  ExternalLink,
  PhoneCall,
  Loader2,
  Phone,
  ArrowRight,
  Sparkles,
  BarChart3,
  Download,
  Smartphone,
} from "lucide-react";

import { authFetch } from "@/lib/authFetch";
import { API_URL, ADMIN_PATH } from "@/lib/config";
import { matchesSimilaritySearch, format10DigitPhone } from "@/lib/formatters";
import AdminPwaManager from "@/components/admin/AdminPwaManager";
import AdminPwaDownloadPopup from "@/components/admin/AdminPwaDownloadPopup";
import AdminMobileAppBottomBar from "@/components/admin/AdminMobileAppBottomBar";
import AdminPushNotificationBanner from "@/components/admin/AdminPushNotificationBanner";
import AdminMobileStarterScreen from "@/components/admin/AdminMobileStarterScreen";

interface CrmPageNav {
  name: string;
  href: string;
  icon: React.ElementType;
  category: string;
  description: string;
  keywords: string[];
}

interface GlobalSearchLead {
  id: number | string;
  name: string;
  phone: string;
  email: string;
  city: string;
  category: string;
  status: string;
  source: "scraped" | "inquiry";
}

const CRM_PAGES: CrmPageNav[] = [
  { name: "Dashboard Overview", href: `${ADMIN_PATH}/dashboard`, icon: LayoutDashboard, category: "Core", description: "KPI metrics, stats & pipeline summary", keywords: ["home", "stats", "metrics", "overview", "analytics"] },
  { name: "My Call Desk", href: `${ADMIN_PATH}/dashboard/sales-calls/queue`, icon: PhoneCall, category: "Sales", description: "Telecaller dialer desk & dynamic batch queue", keywords: ["call", "desk", "queue", "sales", "dialer", "calling", "agent"] },
  { name: "Calling Reports", href: `${ADMIN_PATH}/dashboard/sales-calls/reports`, icon: BarChart3, category: "Sales", description: "Team calling analytics & agent performance leaderboard", keywords: ["reports", "calling", "analytics", "leaderboard", "stats", "telecalling"] },
  { name: "Sales Leads Pool", href: `${ADMIN_PATH}/dashboard/sales-calls`, icon: Phone, category: "Sales", description: "General pool of leads for telecalling", keywords: ["sales", "calls", "calling", "phone", "telecalling", "pool", "outreach"] },
  { name: "Leads Database", href: `${ADMIN_PATH}/dashboard/leads`, icon: Users, category: "Pipeline", description: "Unified database of scraped & inbound leads", keywords: ["leads", "database", "clients", "customers", "prospects", "google maps", "scraper"] },
  { name: "Interested Hot Leads", href: `${ADMIN_PATH}/dashboard/sales-calls/interested`, icon: Star, category: "Sales", description: "Prioritized hot prospect list ready to convert", keywords: ["interested", "hot", "stars", "priority", "conversion", "ready", "deals"] },
  { name: "Messages & Inquiries", href: `${ADMIN_PATH}/dashboard/contacts`, icon: MessageSquare, category: "Communication", description: "Website contact inquiries & lead messages", keywords: ["messages", "inbox", "contacts", "inquiries", "chat", "email"] },
  { name: "WhatsApp Outreach", href: `${ADMIN_PATH}/dashboard/automation/whatsapp`, icon: MessageSquare, category: "Automation", description: "Automated bulk WhatsApp campaigns & replies", keywords: ["whatsapp", "automation", "campaigns", "bulk", "templates"] },
  { name: "Portfolio Works", href: `${ADMIN_PATH}/dashboard/portfolio`, icon: Briefcase, category: "Content", description: "Showcase case studies and projects", keywords: ["portfolio", "projects", "works", "case studies"] },
  { name: "Blog Articles", href: `${ADMIN_PATH}/dashboard/blogs`, icon: FileText, category: "Content", description: "Publish marketing & SEO articles", keywords: ["blogs", "articles", "news", "posts"] },
  { name: "Testimonials", href: `${ADMIN_PATH}/dashboard/testimonials`, icon: Star, category: "Content", description: "Client reviews and ratings manager", keywords: ["testimonials", "reviews", "feedback"] },
  { name: "FAQ Management", href: `${ADMIN_PATH}/dashboard/faqs`, icon: HelpCircle, category: "System", description: "Frequently asked questions & help center", keywords: ["faq", "questions", "answers", "help"] },
  { name: "System Settings", href: `${ADMIN_PATH}/dashboard/settings`, icon: Settings, category: "System", description: "CRM branding, integrations & configuration", keywords: ["settings", "config", "preferences", "system"] },
  { name: "Security & Roles", href: `${ADMIN_PATH}/dashboard/security`, icon: Shield, category: "Security", description: "User permissions, admin accounts & logs", keywords: ["security", "roles", "permissions", "admins", "users"] },
];

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: "inquiry" | "lead" | "system" | "email";
  read: boolean;
  link: string;
}

function formatRelativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Web Audio API Sound Chime Synthesizer with Persistent User Unlock Engine
let globalAudioCtx: AudioContext | null = null;

const getUnlockedAudioContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!globalAudioCtx || globalAudioCtx.state === "closed") {
      globalAudioCtx = new AudioCtx();
    }
    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume().catch(() => {});
    }
    return globalAudioCtx;
  } catch (e) {
    return null;
  }
};

const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const ctx = getUnlockedAudioContext();
    if (!ctx) return;

    const doPlay = (c: AudioContext) => {
      try {
        // Dual-tone high clarity bell chime (E5 659.25Hz -> A5 880Hz)
        const osc1 = c.createOscillator();
        const gain1 = c.createGain();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(659.25, c.currentTime);
        gain1.gain.setValueAtTime(0.3, c.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.28);
        osc1.connect(gain1);
        gain1.connect(c.destination);
        osc1.start();
        osc1.stop(c.currentTime + 0.28);

        const osc2 = c.createOscillator();
        const gain2 = c.createGain();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(880, c.currentTime + 0.12);
        gain2.gain.setValueAtTime(0.35, c.currentTime + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.65);
        osc2.connect(gain2);
        gain2.connect(c.destination);
        osc2.start(c.currentTime + 0.12);
        osc2.stop(c.currentTime + 0.65);
      } catch (err) {
        console.warn("Chime synth error:", err);
      }
    };

    if (ctx.state === "suspended") {
      ctx.resume().then(() => doPlay(ctx)).catch(() => {});
    } else {
      doPlay(ctx);
    }
  } catch (e) {
    console.warn("Notification sound playback error:", e);
  }
};

// LocalStorage Persistence Helpers for Read Status
const getReadIds = (): Set<string> => {
  if (typeof window === "undefined") return new Set();
  try {
    const saved = localStorage.getItem("crm_read_notification_ids");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  } catch (e) {
    return new Set();
  }
};

const saveReadIds = (readIds: Set<string>) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("crm_read_notification_ids", JSON.stringify(Array.from(readIds)));
  } catch (e) {}
};

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [leadsBadge, setLeadsBadge] = useState<string>("...");
  const [contactsBadge, setContactsBadge] = useState<string>("...");
  const [dashTheme, setDashTheme] = useState<"dark" | "light">("dark");

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeNotifFilter, setActiveNotifFilter] = useState<"all" | "unread" | "inquiry" | "system">("all");
  const [activeToastNotif, setActiveToastNotif] = useState<AppNotification | null>(null);

  // Global Search Omnibar State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [matchedLeads, setMatchedLeads] = useState<GlobalSearchLead[]>([]);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeHighlightIdx, setActiveHighlightIdx] = useState(-1);

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileUserMenuRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
      const savedDashTheme = localStorage.getItem("crm_dash_theme") as "dark" | "light" | null;
      const initialTheme = (savedDashTheme === "light" || savedDashTheme === "dark") ? savedDashTheme : "dark";
      setDashTheme(initialTheme);
      document.documentElement.classList.toggle("dark", initialTheme === "dark");
      document.documentElement.setAttribute("data-dash-theme", initialTheme);
      document.body.setAttribute("data-dash-theme", initialTheme);
    }
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push(`${ADMIN_PATH}/login`);
    }
  }, [isAuthenticated, router]);

  const toggleDashTheme = () => {
    const nextTheme = dashTheme === "dark" ? "light" : "dark";
    setDashTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("crm_dash_theme", nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
      document.documentElement.setAttribute("data-dash-theme", nextTheme);
      document.body.setAttribute("data-dash-theme", nextTheme);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifRef.current && !notifRef.current.contains(event.target as Node) &&
        mobileNotifRef.current && !mobileNotifRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
      if (
        searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(event.target as Node))
      ) {
        setIsSearchOpen(false);
      }
      if (
        userMenuRef.current && !userMenuRef.current.contains(event.target as Node) &&
        (!mobileUserMenuRef.current || !mobileUserMenuRef.current.contains(event.target as Node))
      ) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [pathname]);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K & Escape)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 1024) {
          setMobileSearchOpen(true);
          setTimeout(() => mobileSearchInputRef.current?.focus(), 80);
        } else {
          setIsSearchOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 80);
        }
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setMobileSearchOpen(false);
        searchInputRef.current?.blur();
        mobileSearchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Debounced API Similarity Search for Omnibar
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setMatchedLeads([]);
      setIsSearching(false);
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const [scrapedRes, inqRes] = await Promise.allSettled([
          authFetch(`${API_URL}/api/v1/scraped-leads/?search=${encodeURIComponent(q)}&limit=12`),
          authFetch(`${API_URL}/api/v1/leads/?limit=50`)
        ]);

        const results: GlobalSearchLead[] = [];

        if (scrapedRes.status === "fulfilled" && scrapedRes.value.ok) {
          const sJson = await scrapedRes.value.json();
          const items: any[] = Array.isArray(sJson) ? sJson : (sJson.leads || sJson.items || []);
          items.forEach((item) => {
            const phone = item.bussiness_number || item.phone || "";
            const name = item.bussiness_name || item.name || "Business Lead";
            const email = item.bussiness_email || item.email || "";
            const city = item.scraped_city || item.city || "";
            const category = item.scraped_service || item.category || "";
            
            if (matchesSimilaritySearch(q, [name, phone, email, city, category, item.bussiness_address])) {
              results.push({
                id: item.id,
                name,
                phone,
                email,
                city,
                category,
                status: item.is_interested ? "Interested" : (item.whatsapp_status || item.email_status || "Scraped"),
                source: "scraped"
              });
            }
          });
        }

        if (inqRes.status === "fulfilled" && inqRes.value.ok) {
          const inqJson = await inqRes.value.json();
          if (Array.isArray(inqJson)) {
            inqJson.forEach((inq) => {
              const phone = inq.phone || "";
              const name = inq.name || inq.business_name || inq.company || "Direct Inquiry";
              const email = inq.email || "";
              const city = inq.city || "";
              const category = (inq.services && inq.services[0]) || inq.category || "Inbound";
              
              if (matchesSimilaritySearch(q, [name, phone, email, city, category, inq.message])) {
                results.push({
                  id: inq.id,
                  name,
                  phone,
                  email,
                  city,
                  category,
                  status: inq.status || "Inbound",
                  source: "inquiry"
                });
              }
            });
          }
        }

        const uniqueMap = new Map<string, GlobalSearchLead>();
        results.forEach(r => {
          const key = r.phone ? r.phone.replace(/\D/g, "").slice(-10) : `${r.source}_${r.id}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, r);
          }
        });

        setMatchedLeads(Array.from(uniqueMap.values()).slice(0, 8));
      } catch (err) {
        console.error("Global omnibar search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 260);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const navigateToLead = (lead: GlobalSearchLead) => {
    setIsSearchOpen(false);
    setMobileSearchOpen(false);
    const cleanPhone = lead.phone ? format10DigitPhone(lead.phone) : "";
    const term = cleanPhone || lead.name;
    router.push(`${ADMIN_PATH}/dashboard/leads?search=${encodeURIComponent(term)}`);
  };

  const navigateToLeadsSearch = (term: string) => {
    setIsSearchOpen(false);
    setMobileSearchOpen(false);
    if (!term.trim()) {
      router.push(`${ADMIN_PATH}/dashboard/leads`);
    } else {
      router.push(`${ADMIN_PATH}/dashboard/leads?search=${encodeURIComponent(term.trim())}`);
    }
  };

  const navigateToPage = (href: string) => {
    setIsSearchOpen(false);
    setMobileSearchOpen(false);
    router.push(href);
  };

  const isSuperAdmin = mounted ? Boolean(user?.is_superadmin) : false;
  const isMainAdmin = mounted ? Boolean(user?.is_main_admin) : false;
  const userPermissions = useMemo(() => Array.isArray(user?.permissions) ? (user.permissions as string[]) : [], [user]);
  const hasFullAccess = isSuperAdmin || isMainAdmin || userPermissions.includes("all");

  const isLinkAllowed = useCallback((linkHref: string): boolean => {
    if (hasFullAccess) return true;
    
    // Reports is strictly Super Admin & Main Admin only
    if (linkHref.includes("/sales-calls/reports")) return false;
    
    // Security is strictly Super Admin & Main Admin only
    if (linkHref.includes("/security")) return false;

    // Caller queue & sales calling
    if (linkHref.includes("/sales-calls/queue") || linkHref.includes("/sales-calls/interested") || linkHref.endsWith("/sales-calls")) {
      return userPermissions.includes("sales_calling") || userPermissions.includes("manage_leads");
    }

    if (linkHref.includes("/leads")) return userPermissions.includes("manage_leads");
    if (linkHref.includes("/contacts")) return userPermissions.includes("manage_contacts") || userPermissions.includes("manage_leads");
    if (linkHref.includes("/automation/whatsapp")) return userPermissions.includes("send_whatsapp");
    if (linkHref.includes("/portfolio")) return userPermissions.includes("manage_portfolio");
    if (linkHref.includes("/blogs")) return userPermissions.includes("manage_blogs");
    if (linkHref.includes("/testimonials")) return userPermissions.includes("manage_testimonials");
    if (linkHref.includes("/faqs")) return userPermissions.includes("manage_faqs");
    if (linkHref.includes("/settings")) return userPermissions.includes("manage_settings");
    
    // Overview Dashboard: if user has ONLY sales_calling, hide overview (their desk is /sales-calls/queue)
    if (linkHref.endsWith("/dashboard")) {
      const isSalesCallerOnly = userPermissions.length === 1 && userPermissions.includes("sales_calling");
      return !isSalesCallerOnly;
    }

    return false;
  }, [hasFullAccess, userPermissions]);

  // RBAC Route Guarding: Protect unauthorized routes from direct URL access
  useEffect(() => {
    if (!mounted || !user) return;
    const currentPath = pathname.replace(ADMIN_PATH, "/admin");
    const isSalesCallerOnly = !hasFullAccess && userPermissions.length === 1 && userPermissions.includes("sales_calling");

    // If caller lands on default /dashboard, redirect to their Call Desk
    if (isSalesCallerOnly && (currentPath === "/admin/dashboard" || currentPath === "/admin")) {
      router.replace(`${ADMIN_PATH}/dashboard/sales-calls/queue`);
      return;
    }

    if (!hasFullAccess) {
      if (currentPath.includes("/sales-calls/reports") || currentPath.includes("/security")) {
        router.replace(`${ADMIN_PATH}/dashboard/sales-calls/queue`);
        return;
      }
      if (currentPath.includes("/settings") && !userPermissions.includes("manage_settings")) {
        router.replace(`${ADMIN_PATH}/dashboard/sales-calls/queue`);
        return;
      }
      if (currentPath.includes("/leads") && !userPermissions.includes("manage_leads")) {
        router.replace(`${ADMIN_PATH}/dashboard/sales-calls/queue`);
        return;
      }
      if (currentPath.includes("/automation") && !userPermissions.includes("send_whatsapp")) {
        router.replace(`${ADMIN_PATH}/dashboard/sales-calls/queue`);
        return;
      }
      if (currentPath.includes("/contacts") && !userPermissions.includes("manage_contacts") && !userPermissions.includes("manage_leads")) {
        router.replace(`${ADMIN_PATH}/dashboard/sales-calls/queue`);
        return;
      }
    }
  }, [mounted, user, pathname, router, hasFullAccess, userPermissions]);

  const matchedPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return CRM_PAGES.filter(p =>
      isLinkAllowed(p.href) && (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.keywords.some(k => k.includes(q))
      )
    ).slice(0, 4);
  }, [searchQuery, isLinkAllowed]);

  const totalSelectableItems = matchedPages.length + matchedLeads.length;

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveHighlightIdx(prev => (prev < totalSelectableItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveHighlightIdx(prev => (prev > 0 ? prev - 1 : totalSelectableItems - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeHighlightIdx >= 0 && activeHighlightIdx < matchedPages.length) {
        navigateToPage(matchedPages[activeHighlightIdx].href);
      } else if (activeHighlightIdx >= matchedPages.length && activeHighlightIdx < totalSelectableItems) {
        const leadIdx = activeHighlightIdx - matchedPages.length;
        navigateToLead(matchedLeads[leadIdx]);
      } else {
        navigateToLeadsSearch(searchQuery);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setMobileSearchOpen(false);
      searchInputRef.current?.blur();
      mobileSearchInputRef.current?.blur();
    }
  };

  const notificationsRef = useRef<AppNotification[]>([]);
  useEffect(() => { notificationsRef.current = notifications; }, [notifications]);

  const loadCountsAndNotifications = useCallback(async (isBackgroundPoll = false) => {
    if (!isAuthenticated) return;
    try {
      const [scrapedRes, leadsRes, contactsRes, notifRes, waRes] = await Promise.allSettled([
        authFetch(`${API_URL}/api/v1/scraped-leads/stats`),
        authFetch(`${API_URL}/api/v1/leads/`),
        authFetch(`${API_URL}/api/v1/contacts/`),
        authFetch(`${API_URL}/api/v1/notifications/`),
        authFetch(`${API_URL}/api/v1/whatsapp/conversations?limit=1`)
      ]);

      let totalLeadsCount = 0;
      if (scrapedRes.status === "fulfilled" && scrapedRes.value.ok) {
        const stats = await scrapedRes.value.json();
        totalLeadsCount += stats.total || 0;
      }
      if (leadsRes.status === "fulfilled" && leadsRes.value.ok) {
        const inq = await leadsRes.value.json();
        if (Array.isArray(inq)) totalLeadsCount += inq.length;
      }
      setLeadsBadge(String(totalLeadsCount));

      let totalMessagesCount = 0;
      if (contactsRes.status === "fulfilled" && contactsRes.value.ok) {
        const msgs = await contactsRes.value.json();
        if (Array.isArray(msgs)) totalMessagesCount += msgs.length;
      }
      if (waRes.status === "fulfilled" && waRes.value.ok) {
        const waData = await waRes.value.json();
        if (waData?.total) totalMessagesCount += waData.total;
      }
      setContactsBadge(String(totalMessagesCount));

      if (notifRes.status === "fulfilled" && notifRes.value.ok) {
        const notifData: any[] = await notifRes.value.json();
        const mappedList: AppNotification[] = notifData.map(n => ({
          id: String(n.id),
          title: n.title,
          message: n.message,
          time: n.created_at ? formatRelativeTime(n.created_at) : "Recently",
          timestamp: n.created_at ? new Date(n.created_at).getTime() : Date.now(),
          type: (n.type as any) || "system",
          read: Boolean(n.read),
          link: n.link ? n.link.replace(/^\/admin/, ADMIN_PATH) : `${ADMIN_PATH}/dashboard`
        }));

        if (isBackgroundPoll) {
          const prev = notificationsRef.current;
          const hasNewUnread = mappedList.some(n => !n.read && !prev.some(existing => existing.id === n.id));
          if (hasNewUnread) playNotificationSound();
        }
        setNotifications(mappedList);
      }

      // Always refresh user profile and permissions from DB
      try {
        const meRes = await authFetch(`${API_URL}/api/v1/auth/me`);
        if (meRes.ok) {
          const userData = await meRes.json();
          useAuthStore.setState({
            user: {
              id: userData.id,
              username: userData.username,
              is_superadmin: Boolean(userData.is_superadmin),
              is_main_admin: Boolean(userData.is_main_admin),
              role: (userData.role as string) || (userData.is_superadmin ? "superadmin" : "admin"),
              permissions: Array.isArray(userData.permissions) ? userData.permissions : []
            }
          });
        }
      } catch (meErr) { console.error("Failed to load user profile:", meErr); }
    } catch (e) { console.error("Failed to load badge counts & notifications:", e); }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleUserInteraction = () => {
      getUnlockedAudioContext();
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission().catch(() => {});
        }
      }
    };
    window.addEventListener("click", handleUserInteraction, { once: true });
    window.addEventListener("touchstart", handleUserInteraction, { once: true });
    window.addEventListener("keydown", handleUserInteraction, { once: true });
    return () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  useEffect(() => {
    // Initial fetch once on dashboard mount
    loadCountsAndNotifications(false);

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectDelay = 1000;
    let unmounted = false;

    const getWsUrl = () => {
      if (typeof window === "undefined") return "";
      if (process.env.NEXT_PUBLIC_API_URL) {
        return process.env.NEXT_PUBLIC_API_URL.replace(/^http/, "ws") + "/api/v1/ws";
      }
      const host = window.location.hostname;
      if (host === "techinfinix.com" || host.endsWith("techinfinix.com")) {
        return "wss://api.techinfinix.com/api/v1/ws";
      }
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      return `${protocol}//${window.location.host}/api/v1/ws`;
    };

    const connect = () => {
      if (unmounted) return;
      try {
        const wsUrl = getWsUrl();
        if (!wsUrl) return;
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          reconnectDelay = 1000;
          // Zero-overhead WebSocket ping heartbeat every 25 seconds to keep connection alive
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          heartbeatTimer = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              try { ws.send("ping"); } catch {}
            }
          }, 25000);
        };
        
        let wsDebounceTimer: ReturnType<typeof setTimeout> | null = null;
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "pong") return; // Heartbeat response

            // Broadcast real-time event across current window for sub-components
            if (typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent("crm_ws_event", { detail: data }));
            }

            // Real-time Concurrent Session Termination (Single-device login enforcement)
            if (data.type === "concurrent_session_logout") {
              const currentUserId = useAuthStore.getState().user?.id;
              const currentToken = useAuthStore.getState().accessToken;
              if (currentUserId && Number(data.user_id) === Number(currentUserId)) {
                let ourSessionId: string | null = null;
                if (currentToken) {
                  try {
                    const payload = JSON.parse(atob(currentToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
                    ourSessionId = payload.session_id || null;
                  } catch {}
                }
                // If our token doesn't match the new session issued on the other device, kick out immediately
                if (!ourSessionId || ourSessionId !== data.active_session_id) {
                  unmounted = true;
                  if (ws) {
                    try { ws.close(); } catch {}
                  }
                  useAuthStore.getState().logout();
                  if (typeof window !== "undefined") {
                    window.location.href = `${ADMIN_PATH}/login?reason=concurrent_session`;
                  }
                  return;
                }
              }
              return;
            }

            if (data.type === "notification_added") {
              playNotificationSound();
              const newNotif: AppNotification = {
                id: String(data.id || Date.now()),
                title: data.title || "New Alert 🔔",
                message: data.message || "",
                time: "Just now",
                timestamp: Date.now(),
                type: (data.notif_type as any) || "system",
                read: false,
                link: data.link ? data.link.replace(/^\/admin/, ADMIN_PATH) : `${ADMIN_PATH}/dashboard`
              };
              setActiveToastNotif(newNotif);
              setNotifications(prev => [newNotif, ...prev]);
              setTimeout(() => { setActiveToastNotif(null); }, 5000);

              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                try {
                  new Notification(data.title || "Tech Infinix Alert 🔔", {
                    body: data.message || "New notification received",
                    icon: "/notification-icon.png",
                    badge: "/notification-badge.png"
                  });
                } catch (e) {}
              }
              return;
            }

            const isImportantEvent = (
              (data.type === "whatsapp_update" && (data.event === "intake_completed" || data.event === "interested_lead")) ||
              (data.type === "lead_updated" && (data.event === "intake_completed" || data.is_interested === true)) ||
              data.type === "new_lead" ||
              data.type === "new_contact_message" ||
              data.type === "new_chat_message"
            );

            const isAnyUpdate = (
              isImportantEvent ||
              data.type === "lead_updated" ||
              data.type === "lead_deleted" ||
              data.type === "user_updated" ||
              data.type === "user_deleted" ||
              (data.type === "whatsapp_update" && (data.event === "inbound_message" || data.event === "chat_message_received"))
            );

            if (isImportantEvent) {
              playNotificationSound();
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                try {
                  new Notification(data.title || "Tech Infinix Alert 🔔", {
                    body: data.message || data.bussiness_name || "You received a new hot lead inquiry!",
                    icon: "/notification-icon.png",
                    badge: "/notification-badge.png"
                  });
                } catch (e) {}
              }
            }

            if (isAnyUpdate) {
              if (wsDebounceTimer) clearTimeout(wsDebounceTimer);
              wsDebounceTimer = setTimeout(() => {
                loadCountsAndNotifications(false);
              }, 500);
            }
          } catch (err) {}
        };

        ws.onclose = () => {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          if (unmounted) return;
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            connect();
          }, reconnectDelay);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch (e) {
        console.error("WS connection error:", e);
      }
    };

    connect();

    // Periodic background polling fallback (every 15s) so bell and counts update 100% reliably
    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadCountsAndNotifications(true);
      }
    }, 15000);

    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        loadCountsAndNotifications(true);
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }

    return () => {
      unmounted = true;
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pollInterval) clearInterval(pollInterval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
      if (ws) ws.close();
    };
  }, [loadCountsAndNotifications]);

  if (typeof window !== "undefined" && !isAuthenticated) return null;

  const handleLogout = async () => {
    try { await fetch(`${API_URL}/api/v1/auth/logout`, { method: "POST", credentials: "include" }); } catch (e) { console.error("Failed to call logout endpoint:", e); }
    logout();
    router.push(`${ADMIN_PATH}/login`);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await authFetch(`${API_URL}/api/v1/notifications/read-all`, { method: "PUT" }); } catch (e) { console.error("Failed to mark all as read in DB:", e); }
  };

  const handleNotificationClick = async (item: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setNotificationsOpen(false);
    try { await authFetch(`${API_URL}/api/v1/notifications/${item.id}/read`, { method: "PUT" }); } catch (e) { console.error("Failed to mark notification read in DB:", e); }
    if (item.link) router.push(item.link);
  };

  const handleClearNotifications = async () => {
    setNotifications([]);
    try { await authFetch(`${API_URL}/api/v1/notifications/clear`, { method: "DELETE" }); } catch (e) { console.error("Failed to clear notifications in DB:", e); }
  };

  const handleDeleteNotification = async (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    try { await authFetch(`${API_URL}/api/v1/notifications/${notifId}`, { method: "DELETE" }); } catch (e) { console.error("Failed to delete notification in DB:", e); }
  };

  const triggerTestNotification = async () => {
    playNotificationSound();
    try {
      const res = await authFetch(`${API_URL}/api/v1/notifications/test`, { method: "POST" });
      if (res.ok) {
        const notifData = await res.json();
        const newNotif: AppNotification = { id: String(notifData.id), title: notifData.title, message: notifData.message, time: "Just now", timestamp: Date.now(), type: notifData.type || "inquiry", read: false, link: notifData.link ? notifData.link.replace(/^\/admin/, ADMIN_PATH) : `${ADMIN_PATH}/dashboard/leads` };
        setActiveToastNotif(newNotif);
        setNotifications(prev => [newNotif, ...prev]);
        setTimeout(() => { setActiveToastNotif(null); }, 5000);
      }
    } catch (e) { console.error("Failed to trigger backend test notification:", e); }
  };

  const filteredNotifications = notifications.filter(n => {
    if (activeNotifFilter === "unread") return !n.read;
    if (activeNotifFilter === "inquiry") return n.type === "inquiry" || n.type === "lead";
    if (activeNotifFilter === "system") return n.type === "system" || n.type === "email";
    return true;
  });

  const rawNavGroups = [
    { title: "CORE CRM", links: [
      { name: "Dashboard", href: `${ADMIN_PATH}/dashboard`, icon: LayoutDashboard },
      { name: "My Call Desk", href: `${ADMIN_PATH}/dashboard/sales-calls/queue`, icon: PhoneCall, badge: "QUEUE" },
      { name: "Leads Database", href: `${ADMIN_PATH}/dashboard/leads`, icon: Users },
      { name: "Interested Leads", href: `${ADMIN_PATH}/dashboard/sales-calls/interested`, icon: Star },
      { name: "Messages Inbox", href: `${ADMIN_PATH}/dashboard/contacts`, icon: MessageSquare },
    ]},
    { title: "TELECALLING & SALES", links: [
      { name: "Calling Reports", href: `${ADMIN_PATH}/dashboard/sales-calls/reports`, icon: BarChart3, badge: "ADMIN" },
      { name: "Sales Leads Pool", href: `${ADMIN_PATH}/dashboard/sales-calls`, icon: Phone },
    ]},
    { title: "AUTOMATION & TOOLS", links: [
      { name: "WhatsApp Outreach", href: `${ADMIN_PATH}/dashboard/automation/whatsapp`, icon: MessageSquare, badge: "ACTIVE" },
      { name: "Portfolio Works", href: `${ADMIN_PATH}/dashboard/portfolio`, icon: Briefcase },
      { name: "Blog Articles", href: `${ADMIN_PATH}/dashboard/blogs`, icon: FileText },
      { name: "Testimonials", href: `${ADMIN_PATH}/dashboard/testimonials`, icon: Star },
    ]},
    { title: "ADMINISTRATION", links: [
      { name: "FAQ Management", href: `${ADMIN_PATH}/dashboard/faqs`, icon: HelpCircle },
      { name: "System Settings", href: `${ADMIN_PATH}/dashboard/settings`, icon: Settings },
      { name: "Security & Roles", href: `${ADMIN_PATH}/dashboard/security`, icon: Shield },
    ]}
  ];

  const navGroups = useMemo(() => {
    if (!mounted) return rawNavGroups;
    return rawNavGroups
      .map(group => ({
        ...group,
        links: group.links.filter(link => isLinkAllowed(link.href))
      }))
      .filter(group => group.links.length > 0);
  }, [mounted, isLinkAllowed]);

  const effectiveCollapsed = mounted ? isCollapsed : false;

  const getPageTitle = () => {
    const seg = pathname.split("/").filter(Boolean);
    const last = seg[seg.length - 1];
    if (last === "dashboard") return "Overview";
    return last ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ") : "Dashboard";
  };

  const renderUserDropdown = (isMobile = false) => {
    if (!userMenuOpen) return null;
    return (
      <div
        className={`${
          isMobile
            ? "fixed right-3 top-14 w-[calc(100vw-1.5rem)] sm:w-72 max-w-xs"
            : "absolute right-0 top-full mt-2 w-72"
        } overflow-hidden animate-scaleIn z-50 select-text`}
        style={{
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: "var(--dash-card-radius)",
          boxShadow: "0 12px 40px -10px rgba(0, 0, 0, 0.45)"
        }}
      >
        {/* User Identity Header */}
        <div className="p-3.5 flex items-center gap-3 border-b" style={{ borderColor: "var(--dash-border)", background: "var(--dash-surface-alt)" }}>
          <div className="relative shrink-0">
            <span className="w-10 h-10 flex items-center justify-center font-bold text-sm text-white shadow-sm" style={{ background: "var(--dash-primary)", borderRadius: "var(--dash-btn-radius)" }} suppressHydrationWarning>
              {mounted ? (user?.username || "Admin").slice(0, 2).toUpperCase() : "AD"}
            </span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: "var(--dash-success)", border: "2px solid var(--dash-surface-alt)" }} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold truncate" style={{ color: "var(--dash-text)" }} suppressHydrationWarning>
              {mounted ? (user?.username || "admin@techinfinix.com") : "Admin User"}
            </span>
            <span className="text-[10px] font-mono mt-0.5" style={{ color: "var(--dash-text-muted)" }}>
              {mounted && user?.is_superadmin ? "Super Admin" : "System Admin"}
            </span>
            <span className="inline-flex items-center gap-1.5 mt-1 text-[9px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Session
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="p-1.5 flex flex-col gap-0.5">
          <Link
            href={`${ADMIN_PATH}/dashboard/settings`}
            onClick={() => setUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[var(--dash-text-muted)]" />
            <span>System Settings</span>
          </Link>
          <Link
            href={`${ADMIN_PATH}/dashboard/security`}
            onClick={() => setUserMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-semibold text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition cursor-pointer"
          >
            <Shield className="w-4 h-4 text-[var(--dash-text-muted)]" />
            <span>Security & Roles</span>
          </Link>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={toggleDashTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-[var(--dash-text-secondary)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition cursor-pointer text-left"
            title={`Switch to ${dashTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <div className="flex items-center gap-2.5">
              {mounted && dashTheme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-400" />
              )}
              <span>Theme</span>
            </div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
              style={{
                background: "var(--dash-surface-alt)",
                color: "var(--dash-text)",
                border: "1px solid var(--dash-border)"
              }}
            >
              {mounted ? (dashTheme === "dark" ? "Dark Mode" : "Light Mode") : "Dark Mode"}
            </span>
          </button>

          {/* Download App CTA */}
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(false);
              window.dispatchEvent(new CustomEvent("open-pwa-install"));
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5">
              <Download className="w-4 h-4 text-indigo-400" />
              <span>Download App</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">Install</span>
          </button>
        </div>

        {/* Sign Out Action */}
        <div className="p-1.5 border-t" style={{ borderColor: "var(--dash-border)" }}>
          <button
            onClick={() => {
              setUserMenuOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  };

  const renderNotificationDropdown = (isMobile = false) => {
    if (!notificationsOpen) return null;
    return (
      <div
        className={`${
          isMobile
            ? "fixed right-3 top-14 w-[calc(100vw-1.5rem)] sm:w-96 max-w-sm"
            : "absolute right-0 mt-2 w-80 sm:w-96"
        } overflow-hidden animate-scaleIn z-50`}
        style={{
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: "var(--dash-card-radius)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.22)"
        }}
      >
        <div className="p-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--dash-border)", background: "var(--dash-surface-alt)" }}>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs" style={{ color: "var(--dash-text)" }}>Notifications</span>
            {unreadCount > 0 && <span className="crm-badge badge-danger text-[9px]">{unreadCount} new</span>}
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <button onClick={triggerTestNotification} className="crm-badge badge-primary cursor-pointer flex items-center gap-1" title="Test notification"><Zap className="w-3 h-3" /><span>Test</span></button>
            {unreadCount > 0 && <button onClick={markAllAsRead} className="font-semibold cursor-pointer flex items-center gap-1" style={{ color: "var(--dash-primary)" }}><CheckCheck className="w-3.5 h-3.5" /><span>Read all</span></button>}
            <button onClick={handleClearNotifications} className="cursor-pointer p-1 opacity-40 hover:opacity-100" style={{ color: "var(--dash-text-secondary)" }} title="Clear all"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex items-center gap-1 px-3 py-1.5 text-[11px]" style={{ borderBottom: "1px solid var(--dash-border)", background: "var(--dash-surface-alt)" }}>
          {(["all", "unread", "inquiry", "system"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveNotifFilter(tab)} className="px-2.5 py-0.5 capitalize font-medium transition cursor-pointer" style={{ borderRadius: "var(--dash-badge-radius)", background: activeNotifFilter === tab ? "var(--dash-primary)" : "transparent", color: activeNotifFilter === tab ? "#FFFFFF" : "var(--dash-text-muted)" }}>{tab}</button>
          ))}
        </div>

        <div className="max-h-80 overflow-y-auto crm-scrollbar">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-xs space-y-1" style={{ color: "var(--dash-text-muted)" }}>
              <CheckCircle2 className="w-8 h-8 mx-auto opacity-30" /><p className="font-semibold" style={{ color: "var(--dash-text-secondary)" }}>All caught up!</p><p className="text-[11px]">No notifications found.</p>
            </div>
          ) : filteredNotifications.map(n => (
            <div key={n.id} onClick={() => handleNotificationClick(n)} className="p-3 transition flex items-start gap-3 cursor-pointer" style={{ background: !n.read ? "var(--dash-primary-light)" : "transparent", borderBottom: "1px solid var(--dash-border-subtle)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-surface-alt)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = !n.read ? "var(--dash-primary-light)" : "transparent"; }}
            >
              <div className="p-2 shrink-0 mt-0.5" style={{ borderRadius: "var(--dash-btn-radius)", background: n.type === "inquiry" ? "var(--dash-primary-light)" : n.type === "lead" ? "var(--dash-success-light)" : n.type === "email" ? "var(--dash-warning-light)" : "var(--dash-surface-alt)", color: n.type === "inquiry" ? "var(--dash-primary)" : n.type === "lead" ? "var(--dash-success)" : n.type === "email" ? "var(--dash-warning)" : "var(--dash-text-secondary)" }}>
                {n.type === "inquiry" && <Mail className="w-3.5 h-3.5" />}{n.type === "lead" && <UserCheck className="w-3.5 h-3.5" />}{n.type === "email" && <MessageSquare className="w-3.5 h-3.5" />}{n.type === "system" && <Zap className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold truncate" style={{ color: !n.read ? "var(--dash-primary)" : "var(--dash-text)" }}>{n.title}</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] font-mono" style={{ color: "var(--dash-text-muted)" }}>{n.time}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteNotification(n.id);
                      }}
                      className="p-0.5 opacity-40 hover:opacity-100 hover:text-red-500 transition cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <p className="text-xs mt-0.5 line-clamp-2 leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>{n.message}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background: "var(--dash-danger)" }} />}
            </div>
          ))}
        </div>

        <div className="p-2.5 text-center" style={{ borderTop: "1px solid var(--dash-border)", background: "var(--dash-surface-alt)" }}>
          <button onClick={() => { setNotificationsOpen(false); router.push(`${ADMIN_PATH}/dashboard/leads`); }} className="text-xs font-semibold hover:underline cursor-pointer inline-flex items-center gap-1" style={{ color: "var(--dash-primary)" }}><span>View All Pipeline Leads</span><ExternalLink className="w-3 h-3" /></button>
        </div>
      </div>
    );
  };

  const renderSearchResultsDropdown = (isMobile = false) => {
    if (!isSearchOpen && !isMobile) return null;

    const hasQuery = searchQuery.trim().length > 0;

    return (
      <div
        className={`${
          isMobile
            ? "w-full mt-2"
            : "absolute left-0 right-0 top-full mt-1.5 z-50 w-full"
        } rounded-xl shadow-2xl overflow-hidden transition-all duration-200 border animate-fadeIn`}
        style={{
          background: "var(--dash-surface)",
          borderColor: "var(--dash-border)",
          boxShadow: "0 14px 40px -10px rgba(0, 0, 0, 0.35)",
          maxHeight: isMobile ? "calc(80vh - 120px)" : "480px",
        }}
      >
        <div className="overflow-y-auto crm-scrollbar max-h-[420px] p-2 space-y-3">
          {/* If empty query, show quick navigation shortcuts and similarity search tips */}
          {!hasQuery && (
            <div className="p-2 space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-muted)" }}>
                  ⚡ Quick CRM Navigation
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: "var(--dash-surface-alt)", color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)" }}>
                  ⌘K
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {CRM_PAGES.slice(0, 6).map((item) => {
                  const PageIcon = item.icon;
                  return (
                    <button
                      key={item.href}
                      onClick={() => navigateToPage(item.href)}
                      className="flex items-center gap-2 p-2 rounded-lg text-left transition cursor-pointer group"
                      style={{ background: "var(--dash-surface-alt)", border: "1px solid var(--dash-border-subtle)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--dash-primary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--dash-border-subtle)"; }}
                    >
                      <div className="p-1.5 rounded-md shrink-0 transition" style={{ background: "var(--dash-primary-light)", color: "var(--dash-primary)" }}>
                        <PageIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold truncate" style={{ color: "var(--dash-text)" }}>
                          {item.name}
                        </div>
                        <div className="text-[10px] truncate" style={{ color: "var(--dash-text-muted)" }}>
                          {item.category}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-2.5 rounded-lg flex items-start gap-2 text-[11px] leading-relaxed" style={{ background: "var(--dash-surface-alt)", border: "1px solid var(--dash-border-subtle)", color: "var(--dash-text-secondary)" }}>
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <span className="font-semibold" style={{ color: "var(--dash-text)" }}>Similarity Search:</span> Search any 10-digit phone (e.g. <span className="font-mono text-indigo-400 font-semibold">91737 39080</span>), client name, or city. Spacing differences and formats match automatically.
                </div>
              </div>
            </div>
          )}

          {/* If user typed a query */}
          {hasQuery && (
            <>
              {/* Matched Pages */}
              {matchedPages.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1" style={{ color: "var(--dash-text-muted)" }}>
                    Pages & Views ({matchedPages.length})
                  </div>
                  {matchedPages.map((page, idx) => {
                    const PageIcon = page.icon;
                    const isSelected = activeHighlightIdx === idx;
                    return (
                      <div
                        key={page.href}
                        onClick={() => navigateToPage(page.href)}
                        className="flex items-center justify-between p-2 rounded-lg transition cursor-pointer"
                        style={{
                          background: isSelected ? "var(--dash-primary-light)" : "transparent",
                          border: isSelected ? "1px solid var(--dash-primary)" : "1px solid transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--dash-surface-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isSelected ? "var(--dash-primary-light)" : "transparent";
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-1.5 rounded-md shrink-0" style={{ background: "var(--dash-primary-light)", color: "var(--dash-primary)" }}>
                            <PageIcon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate" style={{ color: "var(--dash-text)" }}>
                              {page.name}
                            </span>
                            <span className="text-[10px] block truncate" style={{ color: "var(--dash-text-muted)" }}>
                              {page.description}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: "var(--dash-surface-alt)", color: "var(--dash-text-muted)" }}>
                            {page.category}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-60" style={{ color: "var(--dash-text-muted)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Matched Leads */}
              {matchedLeads.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 flex items-center justify-between" style={{ color: "var(--dash-text-muted)" }}>
                    <span>Matched Leads & Contacts ({matchedLeads.length})</span>
                    {isSearching && <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />}
                  </div>
                  {matchedLeads.map((lead, idx) => {
                    const isSelected = activeHighlightIdx === (matchedPages.length + idx);
                    const formattedPhone = format10DigitPhone(lead.phone);
                    const isHot = lead.status.toLowerCase().includes("interested");
                    return (
                      <div
                        key={`${lead.source}-${lead.id}`}
                        onClick={() => navigateToLead(lead)}
                        className="flex items-center justify-between p-2.5 rounded-lg transition cursor-pointer"
                        style={{
                          background: isSelected ? "var(--dash-primary-light)" : "transparent",
                          border: isSelected ? "1px solid var(--dash-primary)" : "1px solid var(--dash-border-subtle)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--dash-surface-alt)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isSelected ? "var(--dash-primary-light)" : "transparent";
                        }}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{
                              background: isHot ? "var(--dash-success-light)" : "var(--dash-primary-light)",
                              color: isHot ? "var(--dash-success)" : "var(--dash-primary)",
                            }}
                          >
                            {lead.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold truncate" style={{ color: "var(--dash-text)" }}>
                                {lead.name}
                              </span>
                              {lead.city && (
                                <span className="text-[9px] px-1 py-0.2 rounded truncate" style={{ background: "var(--dash-surface-alt)", color: "var(--dash-text-muted)" }}>
                                  {lead.city}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono truncate" style={{ color: "var(--dash-text-secondary)" }}>
                              {lead.phone ? (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-2.5 h-2.5 text-emerald-500" />
                                  {formattedPhone}
                                </span>
                              ) : lead.email ? (
                                <span className="truncate">{lead.email}</span>
                              ) : (
                                <span className="text-[10px] text-gray-400">Direct Inbound</span>
                              )}
                              {lead.category && (
                                <span className="text-[10px] opacity-70 truncate font-sans">
                                  • {lead.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                            style={{
                              background: isHot
                                ? "var(--dash-success-light)"
                                : lead.source === "inquiry"
                                ? "var(--dash-primary-light)"
                                : "var(--dash-surface-alt)",
                              color: isHot
                                ? "var(--dash-success)"
                                : lead.source === "inquiry"
                                ? "var(--dash-primary)"
                                : "var(--dash-text-secondary)",
                            }}
                          >
                            {lead.status}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-40 hover:opacity-100" style={{ color: "var(--dash-text-muted)" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading indicator when search is fetching */}
              {isSearching && matchedLeads.length === 0 && (
                <div className="py-6 text-center text-xs flex items-center justify-center gap-2" style={{ color: "var(--dash-text-muted)" }}>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                  <span>Searching CRM database with similarity matching...</span>
                </div>
              )}

              {/* No matches state */}
              {!isSearching && matchedPages.length === 0 && matchedLeads.length === 0 && (
                <div className="p-6 text-center space-y-2" style={{ color: "var(--dash-text-muted)" }}>
                  <Search className="w-7 h-7 mx-auto opacity-30" />
                  <p className="text-xs font-semibold" style={{ color: "var(--dash-text)" }}>
                    No quick preview matches for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className="text-[11px] max-w-xs mx-auto leading-relaxed">
                    The entire database contains thousands of leads. Click below to run a deep scan in the Leads Manager.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Omnibar Footer Actions */}
        <div
          className="p-2.5 px-3 flex items-center justify-between text-xs font-semibold"
          style={{
            background: "var(--dash-surface-alt)",
            borderTop: "1px solid var(--dash-border)",
          }}
        >
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--dash-text-muted)" }}>
            <span className="font-mono px-1 py-0.5 rounded text-[10px]" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}>↵ Enter</span>
            <span>View all matching records</span>
          </div>
          <button
            onClick={() => navigateToLeadsSearch(searchQuery)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer hover:underline"
            style={{
              background: "var(--dash-primary)",
              color: "#FFFFFF",
            }}
          >
            <span>Open in Leads Database</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      data-dash-theme={dashTheme}
      className={`h-screen h-[100dvh] max-h-screen min-h-0 min-w-0 flex flex-col lg:flex-row overflow-hidden relative font-sans antialiased ${dashTheme === 'dark' ? 'dark' : ''}`}
      style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}
    >
      {/* ── Isolated PWA Manager & Mobile Download Popup ── */}
      <AdminPwaManager />
      <AdminPwaDownloadPopup />

      {/* ── Floating Live Notification Toast ── */}
      {activeToastNotif && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full p-4 flex items-start gap-3 animate-slideInRight" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-primary)", borderRadius: "var(--dash-card-radius)", boxShadow: "0 8px 32px rgba(99,102,241,0.18)" }}>
          <div className="p-2 shrink-0" style={{ background: "var(--dash-primary-light)", borderRadius: "var(--dash-btn-radius)", color: "var(--dash-primary)" }}>
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold truncate" style={{ color: "var(--dash-text)" }}>{activeToastNotif.title}</h4>
              <span className="crm-badge badge-primary text-[9px]">NEW</span>
            </div>
            <p className="text-[11px] mt-1 line-clamp-2 leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>{activeToastNotif.message}</p>
            <button onClick={() => { handleNotificationClick(activeToastNotif); setActiveToastNotif(null); }} className="mt-2 text-[11px] font-bold underline cursor-pointer" style={{ color: "var(--dash-primary)" }}>View Record &rarr;</button>
          </div>
          <button onClick={() => setActiveToastNotif(null)} className="p-1 cursor-pointer opacity-50 hover:opacity-100 transition" style={{ color: "var(--dash-text-secondary)" }}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Mobile Top Bar */}
      <div className="lg:hidden w-full px-5 py-3.5 flex items-center justify-between z-30 shrink-0" style={{ background: "var(--dash-sidebar-bg)", borderBottom: "1px solid var(--dash-sidebar-border)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-1 cursor-pointer transition opacity-70 hover:opacity-100" style={{ color: "var(--dash-sidebar-text)" }} aria-label="Toggle Navigation">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-black flex items-center justify-center border border-white/10 p-0.5 shadow-sm">
            <Image src="/favicon.png" alt="Tech Infinix" width={28} height={28} className="w-7 h-7 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none" style={{ color: "var(--dash-text)" }}>Tech Infinix</span>
            <span className="text-[9px] uppercase font-semibold tracking-wider text-emerald-400">Enterprise Console</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Omnibar Search Button */}
          <button
            onClick={() => {
              setMobileSearchOpen(true);
              setIsSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
            className="p-1 transition cursor-pointer opacity-70 hover:opacity-100"
            style={{ color: "var(--dash-sidebar-text)" }}
            title="Search Leads & CRM (⌘K)"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          <div className="relative" ref={mobileNotifRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-1.5 transition relative cursor-pointer opacity-80 hover:opacity-100 rounded-lg active:scale-95" style={{ color: "var(--dash-sidebar-text)" }} title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none shadow-md animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            {renderNotificationDropdown(true)}
          </div>
          <div className="relative" ref={mobileUserMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="relative p-0.5 rounded-lg active:scale-95 transition cursor-pointer"
              title="Account Menu"
            >
              <span className="w-8 h-8 flex items-center justify-center font-bold text-xs text-white shadow-sm" style={{ background: "var(--dash-primary)", borderRadius: "var(--dash-btn-radius)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin").slice(0, 2).toUpperCase() : "AD"}</span>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: "var(--dash-success)", border: "2px solid var(--dash-sidebar-bg)" }} />
            </button>
            {renderUserDropdown(true)}
          </div>
        </div>
      </div>

      {/* Mobile Omnibar Search Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}>
          <div className="p-3 w-full shrink-0 flex flex-col gap-2" style={{ background: "var(--dash-surface)", borderBottom: "1px solid var(--dash-border)" }} ref={mobileSearchRef}>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                {isSearching ? (
                  <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" />
                ) : (
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--dash-text-muted)" }} />
                )}
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                    setActiveHighlightIdx(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search leads, phone (91737 39080), pages..."
                  className="crm-input w-full !pl-9 pr-8 py-2 text-xs"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      mobileSearchInputRef.current?.focus();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-200 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setIsSearchOpen(false);
                }}
                className="px-3 py-2 text-xs font-bold rounded-lg cursor-pointer"
                style={{ background: "var(--dash-surface-alt)", color: "var(--dash-text)", border: "1px solid var(--dash-border)" }}
              >
                Close
              </button>
            </div>
            {renderSearchResultsDropdown(true)}
          </div>
          <div className="flex-1" onClick={() => { setMobileSearchOpen(false); setIsSearchOpen(false); }} />
        </div>
      )}

      {/* Mobile Backdrop */}
      {mobileOpen && <div className="fixed inset-0 z-30 lg:hidden animate-fadeIn" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={() => setMobileOpen(false)} />}

      {/* ── Left Sidebar ── */}
      <aside suppressHydrationWarning className={`fixed inset-y-0 left-0 flex flex-col justify-between z-40 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full select-none ${effectiveCollapsed ? "w-[72px]" : "w-[250px]"} ${mobileOpen ? "translate-x-0 w-[250px]" : "-translate-x-full"}`} style={{ background: "var(--dash-sidebar-bg)", borderRight: "1px solid var(--dash-sidebar-border)", color: "var(--dash-sidebar-text)" }}>
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Brand */}
          <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ borderBottom: "1px solid var(--dash-sidebar-border)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg, var(--dash-primary), #818CF8)", borderRadius: "var(--dash-btn-radius)", boxShadow: "0 2px 8px var(--dash-primary-glow)" }}>
                <Zap className="w-4 h-4" />
              </div>
              {!effectiveCollapsed && (
                <div className="flex flex-col animate-fadeIn">
                  <span className="text-sm font-bold tracking-tight leading-tight" style={{ color: "var(--dash-text)" }}>
                    LeadFlow
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider" style={{ color: "var(--dash-primary)" }}>
                    Enterprise CRM
                  </span>
                </div>
              )}
            </div>
            {!mobileOpen && <button onClick={() => { const v = !isCollapsed; setIsCollapsed(v); localStorage.setItem("sidebar-collapsed", String(v)); }} className="hidden lg:flex p-1 transition-colors cursor-pointer opacity-50 hover:opacity-100" style={{ color: "var(--dash-sidebar-text)" }} title={effectiveCollapsed ? "Expand" : "Collapse"}>{effectiveCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}</button>}
          </div>

          {/* Nav Links */}
          <nav suppressHydrationWarning className="flex-1 p-3 space-y-4 text-sm font-medium">
            {navGroups.map((group, gi) => (
              <div key={gi} className="space-y-1">
                {!effectiveCollapsed && <span className="text-[10px] font-bold uppercase tracking-wider px-3 block animate-fadeIn" style={{ color: "var(--dash-text-muted)" }}>{group.title}</span>}
                <div className="space-y-0.5">
                  {group.links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.replace("/admin", ADMIN_PATH) === link.href || pathname.replace(ADMIN_PATH, "/admin") === link.href;
                    return (
                      <Link key={link.name} href={link.href} prefetch={false} onClick={() => setMobileOpen(false)} suppressHydrationWarning
                        className={`flex items-center justify-between px-3 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${effectiveCollapsed ? "justify-center" : ""}`}
                        style={{ borderRadius: "var(--dash-btn-radius)", background: isActive ? "var(--dash-sidebar-active)" : "transparent", color: isActive ? "var(--dash-primary)" : "var(--dash-sidebar-text)", borderLeft: isActive ? "2px solid var(--dash-primary)" : "2px solid transparent" }}
                        title={effectiveCollapsed ? link.name : undefined}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--dash-sidebar-hover)"; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                      >
                        <div className="flex items-center gap-2.5"><Icon className="w-4 h-4 shrink-0" />{!effectiveCollapsed && <span className="animate-fadeIn">{link.name}</span>}</div>
                        {!effectiveCollapsed && link.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5" style={{ borderRadius: "var(--dash-badge-radius)", background: link.badge === "ACTIVE" ? "var(--dash-success-light)" : "var(--dash-primary-light)", color: link.badge === "ACTIVE" ? "var(--dash-success)" : "var(--dash-primary)" }}>{link.badge}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Download / Install App CTA in Sidebar */}
          <div className="p-3 pt-0">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("open-pwa-install"))}
              className={`w-full flex items-center gap-2 p-2 rounded-xl transition cursor-pointer border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 ${effectiveCollapsed ? "justify-center" : "justify-between"}`}
              title="Download & Install App"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Download className="w-4 h-4 shrink-0 text-indigo-400" />
                {!effectiveCollapsed && (
                  <span className="text-xs font-bold text-white truncate">Download App</span>
                )}
              </div>
              {!effectiveCollapsed && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider">PWA</span>
              )}
            </button>
          </div>

          {/* User Profile Footer */}
          <div className="p-3" style={{ borderTop: "1px solid var(--dash-sidebar-border)" }}>
            <Link
              href={`${ADMIN_PATH}/dashboard/settings`}
              className="flex items-center justify-between p-2.5 transition cursor-pointer hover:bg-[var(--dash-sidebar-hover)]"
              style={{ borderRadius: "var(--dash-btn-radius)", background: "var(--dash-sidebar-hover)", border: "1px solid var(--dash-sidebar-border)" }}
              title="Account Settings"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <span className="w-8 h-8 flex items-center justify-center font-bold text-xs text-white" style={{ background: "var(--dash-primary)", borderRadius: "var(--dash-btn-radius)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin").slice(0, 2).toUpperCase() : "AD"}</span>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full" style={{ background: "var(--dash-success)", border: "2px solid var(--dash-sidebar-bg)" }} />
                </div>
                {!effectiveCollapsed && (
                  <div className="flex flex-col text-left min-w-0 animate-fadeIn" suppressHydrationWarning>
                    <span className="text-xs font-semibold truncate" style={{ color: "var(--dash-text)" }}>
                      {mounted ? (user?.username || "Admin User") : "Admin User"}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--dash-text-muted)" }}>
                      {mounted && user?.is_superadmin ? "Super Admin" : "System Admin"}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col h-full overflow-hidden relative z-10" style={{ background: "var(--dash-bg)" }}>
        
        {/* Top Nav Bar */}
        <header className="hidden lg:flex h-14 px-6 items-center justify-between shrink-0 z-20" style={{ background: "var(--dash-header-bg)", borderBottom: "1px solid var(--dash-header-border)" }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--dash-text-muted)" }}>
            <span>CRM</span><ChevronRight className="w-3 h-3" /><span className="font-semibold" style={{ color: "var(--dash-text)" }}>{getPageTitle()}</span>
          </div>

          {/* Global Search Omnibar */}
          <div className="flex-1 max-w-md mx-6 relative" ref={searchContainerRef}>
            <div className="relative w-full">
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" />
              ) : (
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--dash-text-muted)" }} />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                  setActiveHighlightIdx(-1);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search leads, phone (91737 39080), pages..."
                className="crm-input w-full !pl-9 pr-16 py-1.5 text-xs transition-all duration-150 focus:ring-1 focus:ring-indigo-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      searchInputRef.current?.focus();
                    }}
                    className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
                    style={{ color: "var(--dash-text-muted)" }}
                    title="Clear search"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <span
                  className="text-[10px] font-mono px-1.5 py-0.5 cursor-pointer select-none transition hover:border-indigo-400"
                  style={{
                    color: "var(--dash-text-muted)",
                    border: "1px solid var(--dash-border)",
                    borderRadius: "var(--dash-badge-radius)"
                  }}
                  onClick={() => {
                    setIsSearchOpen(true);
                    searchInputRef.current?.focus();
                  }}
                  title="Press ⌘K or Ctrl+K to search"
                >
                  ⌘K
                </span>
              </div>
            </div>

            {/* Desktop Results Dropdown */}
            {renderSearchResultsDropdown(false)}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 transition relative cursor-pointer" style={{ borderRadius: "var(--dash-btn-radius)", background: notificationsOpen ? "var(--dash-primary-light)" : "transparent", color: notificationsOpen ? "var(--dash-primary)" : "var(--dash-text-muted)" }} title="Notifications">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping" style={{ background: "var(--dash-danger)" }} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--dash-danger)" }} /></>}
              </button>

              {renderNotificationDropdown(false)}
            </div>

            <div className="h-5 w-[1px]" style={{ background: "var(--dash-border)" }} />

            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[var(--dash-surface-alt)] transition cursor-pointer"
                title="Account Menu"
              >
                <div className="flex flex-col text-right hidden sm:flex">
                  <span className="text-xs font-bold leading-tight" style={{ color: "var(--dash-text)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin User") : "Admin User"}</span>
                  <span className="text-[10px] font-semibold" style={{ color: "var(--dash-primary)" }} suppressHydrationWarning>{mounted ? (user?.is_superadmin ? "Super Admin" : "System Admin") : "System Admin"}</span>
                </div>
                <div className="relative">
                  <div className="w-8 h-8 text-white font-bold flex items-center justify-center text-xs shadow-sm" style={{ background: "var(--dash-primary)", borderRadius: "var(--dash-btn-radius)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin").slice(0, 2).toUpperCase() : "AD"}</div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: "var(--dash-success)", border: "2px solid var(--dash-header-bg)" }} />
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--dash-text-muted)] transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {renderUserDropdown(false)}
            </div>
          </div>
        </header>

        {/* Content Area with Mobile Safe Bottom Padding & Fluid Direct Scrolling */}
        <div
          id="admin-dashboard-main-scroll"
          data-lenis-prevent="true"
          className="flex-1 min-h-0 h-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 relative max-w-full crm-scrollbar pb-28 md:pb-6 scroll-smooth select-text"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="relative z-10 w-full max-w-[1400px] mx-auto min-h-full">
            <AdminPushNotificationBanner />
            {children}
          </div>
        </div>
      </main>

      {/* Native Mobile App Fixed Bottom Tab Bar */}
      <AdminMobileAppBottomBar
        onOpenMenu={() => setMobileOpen(true)}
        leadsBadge={leadsBadge}
        contactsBadge={contactsBadge}
      />

      {/* Modern Mobile Starter Screen (Fluid First Launch Experience) */}
      <AdminMobileStarterScreen />
    </div>
  );
}
