"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
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
  Zap,
  CheckCheck,
  Trash2,
  Mail,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

import { authFetch } from "@/lib/authFetch";
import { API_URL, ADMIN_PATH } from "@/lib/config";

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

// Web Audio API Sound Chime Synthesizer
const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.1);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (e) {
    // Autoplay restrictions may require initial user click
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

  const notifRef = useRef<HTMLDivElement>(null);
  const mobileNotifRef = useRef<HTMLDivElement>(null);

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
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      try {
        const meRes = await authFetch(`${API_URL}/api/v1/auth/me`);
        if (meRes.ok) {
          const userData = await meRes.json();
          useAuthStore.setState({
            user: { id: userData.id, username: userData.username, is_superadmin: Boolean(userData.is_superadmin) }
          });
        }
      } catch (meErr) { console.error("Failed to load user profile:", meErr); }
    } catch (e) { console.error("Failed to load badge counts & notifications:", e); }
  }, [isAuthenticated]);

  useEffect(() => {
    loadCountsAndNotifications(false);
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectDelay = 1000;
    let unmounted = false;

    const connect = () => {
      if (unmounted) return;
      try {
        const wsUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
          .replace(/^http/, "ws") + "/api/v1/whatsapp/ws";
        ws = new WebSocket(wsUrl);
        ws.onopen = () => { reconnectDelay = 1000; };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if ((data.type === "whatsapp_update" && data.event === "inbound_message") || data.type === "notification_added") {
              loadCountsAndNotifications(true);
            }
          } catch (err) {}
        };
        ws.onclose = () => {
          if (unmounted) return;
          reconnectTimer = setTimeout(() => { reconnectDelay = Math.min(reconnectDelay * 2, 30000); connect(); }, reconnectDelay);
        };
        ws.onerror = () => { ws?.close(); };
      } catch (e) { console.error("WS connection error:", e); }
    };
    connect();
    return () => { unmounted = true; if (reconnectTimer) clearTimeout(reconnectTimer); if (ws) ws.close(); };
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

  const isSuperAdmin = mounted ? Boolean(user?.is_superadmin) : false;

  const navGroups = [
    { title: "CORE CRM", links: [
      { name: "Dashboard", href: `${ADMIN_PATH}/dashboard`, icon: LayoutDashboard },
      { name: "Leads Database", href: `${ADMIN_PATH}/dashboard/leads`, icon: Users, badge: leadsBadge },
      { name: "Messages Inbox", href: `${ADMIN_PATH}/dashboard/contacts`, icon: MessageSquare, badge: contactsBadge },
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
      ...(isSuperAdmin ? [{ name: "Security & Roles", href: `${ADMIN_PATH}/dashboard/security`, icon: Shield }] : []),
    ]}
  ];

  const effectiveCollapsed = mounted ? isCollapsed : false;

  const getPageTitle = () => {
    const seg = pathname.split("/").filter(Boolean);
    const last = seg[seg.length - 1];
    if (last === "dashboard") return "Overview";
    return last ? last.charAt(0).toUpperCase() + last.slice(1).replace(/-/g, " ") : "Dashboard";
  };

  return (
    <div
      data-dash-theme={dashTheme}
      className={`h-screen flex flex-col lg:flex-row overflow-hidden relative font-sans antialiased select-none ${dashTheme === 'dark' ? 'dark' : ''}`}
      style={{ background: "var(--dash-bg)", color: "var(--dash-text)" }}
    >
      
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
          <div className="w-8 h-8 flex items-center justify-center text-white font-bold" style={{ background: "var(--dash-primary)", borderRadius: "var(--dash-btn-radius)" }}><Zap className="w-4 h-4" /></div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none" style={{ color: "var(--dash-text)" }}>LeadFlow</span>
            <span className="text-[9px] uppercase font-semibold tracking-wider" style={{ color: "var(--dash-primary)" }}>Enterprise CRM</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDashTheme} className="p-1 transition cursor-pointer opacity-70 hover:opacity-100" style={{ color: "var(--dash-sidebar-text)" }} title="Toggle Dashboard Dark/Light Theme">
            {mounted && dashTheme === 'dark' ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
          <div className="relative" ref={mobileNotifRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-1 transition relative cursor-pointer opacity-70 hover:opacity-100" style={{ color: "var(--dash-sidebar-text)" }} title="Notifications">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "var(--dash-danger)" }} />}
            </button>
          </div>
          <div className="relative">
            <span className="w-8 h-8 flex items-center justify-center font-bold text-xs text-white" style={{ background: "var(--dash-primary)", borderRadius: "var(--dash-btn-radius)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin").slice(0, 2).toUpperCase() : "AD"}</span>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full" style={{ background: "var(--dash-success)", border: "2px solid var(--dash-sidebar-bg)" }} />
          </div>
        </div>
      </div>

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
                      <Link key={link.name} href={link.href} onClick={() => setMobileOpen(false)} suppressHydrationWarning
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

          {/* User Profile & Sign Out */}
          <div className="p-3 space-y-2" style={{ borderTop: "1px solid var(--dash-sidebar-border)" }}>
            <div className="flex items-center justify-between p-2.5 transition cursor-pointer" style={{ borderRadius: "var(--dash-btn-radius)", background: "var(--dash-sidebar-hover)", border: "1px solid var(--dash-sidebar-border)" }}>
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
            </div>
            <button onClick={handleLogout} className="w-full text-xs font-semibold py-2 flex items-center justify-center gap-2 transition cursor-pointer" style={{ borderRadius: "var(--dash-btn-radius)", background: "transparent", border: "1px solid var(--dash-sidebar-border)", color: "var(--dash-sidebar-text)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-danger-light)"; e.currentTarget.style.color = "var(--dash-danger)"; e.currentTarget.style.borderColor = "var(--dash-danger)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dash-sidebar-text)"; e.currentTarget.style.borderColor = "var(--dash-sidebar-border)"; }}
            ><LogOut className="w-3.5 h-3.5" />{!effectiveCollapsed && <span className="animate-fadeIn">Sign Out</span>}</button>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <main className="flex-1 flex flex-col overflow-hidden relative z-10" style={{ background: "var(--dash-bg)" }}>
        
        {/* Top Nav Bar */}
        <header className="hidden lg:flex h-14 px-6 items-center justify-between shrink-0 z-20" style={{ background: "var(--dash-header-bg)", borderBottom: "1px solid var(--dash-header-border)" }}>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--dash-text-muted)" }}>
            <span>CRM</span><ChevronRight className="w-3 h-3" /><span className="font-semibold" style={{ color: "var(--dash-text)" }}>{getPageTitle()}</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--dash-text-muted)" }} />
              <input type="text" placeholder="Search leads, conversations..." className="crm-input w-full !pl-9 pr-12 py-1.5 text-xs" />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono px-1.5 py-0.5" style={{ color: "var(--dash-text-muted)", border: "1px solid var(--dash-border)", borderRadius: "var(--dash-badge-radius)" }}>⌘K</span>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleDashTheme} className="p-2 transition cursor-pointer" style={{ borderRadius: "var(--dash-btn-radius)", color: "var(--dash-text-muted)" }} onMouseEnter={(e) => { e.currentTarget.style.background = "var(--dash-surface-alt)"; e.currentTarget.style.color = "var(--dash-text)"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--dash-text-muted)"; }} title={`Switch to ${dashTheme === 'dark' ? 'Light' : 'Dark'} Mode`}>
              {mounted && dashTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => setNotificationsOpen(!notificationsOpen)} className="p-2 transition relative cursor-pointer" style={{ borderRadius: "var(--dash-btn-radius)", background: notificationsOpen ? "var(--dash-primary-light)" : "transparent", color: notificationsOpen ? "var(--dash-primary)" : "var(--dash-text-muted)" }} title="Notifications">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && <><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping" style={{ background: "var(--dash-danger)" }} /><span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--dash-danger)" }} /></>}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 overflow-hidden animate-scaleIn z-50" style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)", borderRadius: "var(--dash-card-radius)", boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
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
                            <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--dash-text-muted)" }}>{n.time}</span>
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
              )}
            </div>

            <div className="h-5 w-[1px]" style={{ background: "var(--dash-border)" }} />

            <div className="flex items-center gap-2.5">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold" style={{ color: "var(--dash-text)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin User") : "Admin User"}</span>
                <span className="text-[10px] font-semibold" style={{ color: "var(--dash-primary)" }} suppressHydrationWarning>{mounted ? (user?.is_superadmin ? "Super Admin" : "System Admin") : "System Admin"}</span>
              </div>
              <div className="w-8 h-8 text-white font-bold flex items-center justify-center text-xs" style={{ background: "linear-gradient(135deg, var(--dash-primary), #818CF8)", borderRadius: "var(--dash-btn-radius)" }} suppressHydrationWarning>{mounted ? (user?.username || "Admin").slice(0, 2).toUpperCase() : "AD"}</div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 md:p-6 relative max-w-full crm-scrollbar">
          <div className="relative z-10 w-full max-w-[1400px] mx-auto min-h-full">{children}</div>
        </div>
      </main>
    </div>
  );
}
