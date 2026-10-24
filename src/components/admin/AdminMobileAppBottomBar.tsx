"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  MessageSquare,
  Menu,
  Star
} from "lucide-react";
import { ADMIN_PATH } from "@/lib/config";

interface AdminMobileAppBottomBarProps {
  onOpenMenu: () => void;
  leadsBadge?: string;
  contactsBadge?: string;
}

export default function AdminMobileAppBottomBar({
  onOpenMenu,
  leadsBadge,
  contactsBadge
}: AdminMobileAppBottomBarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Overview",
      href: `${ADMIN_PATH}/dashboard`,
      icon: LayoutDashboard,
      active: pathname === `${ADMIN_PATH}/dashboard`,
    },
    {
      label: "Call Desk",
      href: `${ADMIN_PATH}/dashboard/sales-calls/queue`,
      icon: PhoneCall,
      badge: "CALL",
      active: pathname.startsWith(`${ADMIN_PATH}/dashboard/sales-calls/queue`),
    },
    {
      label: "Leads",
      href: `${ADMIN_PATH}/dashboard/leads`,
      icon: Users,
      badgeCount: leadsBadge && leadsBadge !== "0" ? leadsBadge : undefined,
      active: pathname.startsWith(`${ADMIN_PATH}/dashboard/leads`),
    },
    {
      label: "WhatsApp",
      href: `${ADMIN_PATH}/dashboard/automation/whatsapp`,
      icon: MessageSquare,
      badgeCount: contactsBadge && contactsBadge !== "0" ? contactsBadge : undefined,
      active: pathname.startsWith(`${ADMIN_PATH}/dashboard/automation/whatsapp`),
    },
    {
      label: "Hot Deals",
      href: `${ADMIN_PATH}/dashboard/sales-calls/interested`,
      icon: Star,
      active: pathname.startsWith(`${ADMIN_PATH}/dashboard/sales-calls/interested`),
    },
  ];

  return (
    <nav
      aria-label="Mobile app navigation bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090d16]/95 backdrop-blur-2xl border-t border-slate-800/80 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] transition-all"
      style={{
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
        paddingTop: "6px"
      }}
    >
      <div className="flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer select-none ${
                isActive
                  ? "text-indigo-400 font-bold scale-105"
                  : "text-slate-400 hover:text-slate-200 active:scale-95"
              }`}
            >
              {/* Active glow pill */}
              {isActive && (
                <div className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />

                {/* Badge Dot or Text */}
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[8px] font-black tracking-tight px-1 py-0.2 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 rounded-full shadow-sm animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.badgeCount && (
                  <span className="absolute -top-1.5 -right-2 text-[8px] font-extrabold px-1 bg-indigo-600 text-white rounded-full min-w-[14px] text-center leading-3">
                    {item.badgeCount}
                  </span>
                )}
              </div>

              <span className={`text-[10px] mt-1 tracking-tight ${isActive ? "text-indigo-300 font-semibold" : "text-slate-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* More Menu Trigger */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 active:scale-95 transition-all cursor-pointer select-none"
        >
          <div className="relative">
            <Menu className="w-5 h-5 stroke-[1.8]" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight text-slate-400">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
