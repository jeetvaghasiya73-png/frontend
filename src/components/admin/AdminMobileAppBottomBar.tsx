"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PhoneCall,
  Users,
  MessageSquare,
  Star
} from "lucide-react";
import { ADMIN_PATH } from "@/lib/config";

interface AdminMobileAppBottomBarProps {
  onOpenMenu?: () => void;
  leadsBadge?: string;
  contactsBadge?: string;
}

export default function AdminMobileAppBottomBar({
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
      active: pathname.startsWith(`${ADMIN_PATH}/dashboard/sales-calls/queue`),
    },
    {
      label: "Leads",
      href: `${ADMIN_PATH}/dashboard/leads`,
      icon: Users,
      badgeCount: leadsBadge && leadsBadge !== "0" && leadsBadge !== "..." ? leadsBadge : undefined,
      active: pathname.startsWith(`${ADMIN_PATH}/dashboard/leads`),
    },
    {
      label: "WhatsApp",
      href: `${ADMIN_PATH}/dashboard/automation/whatsapp`,
      icon: MessageSquare,
      badgeCount: contactsBadge && contactsBadge !== "0" && contactsBadge !== "..." ? contactsBadge : undefined,
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
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 transition-colors"
      style={{
        background: "var(--dash-surface)",
        borderTop: "1px solid var(--dash-border)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
        paddingTop: "4px",
      }}
    >
      <div className="grid grid-cols-5 w-full items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] select-none group transition-colors"
              style={{
                color: isActive ? "var(--dash-primary)" : "var(--dash-text-muted)",
              }}
            >
              {/* Active top line indicator */}
              {isActive && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px]"
                  style={{ background: "var(--dash-primary)", borderRadius: "1px" }}
                />
              )}

              {/* Icon Container with strictly bounded badge */}
              <div className="relative flex items-center justify-center w-6 h-6">
                <Icon
                  className="w-5 h-5 shrink-0 transition-transform"
                  strokeWidth={isActive ? 2.2 : 1.7}
                />

                {item.badgeCount && (
                  <span
                    className="absolute -top-1 -right-2 text-[9px] font-bold px-1 rounded-full leading-tight min-w-[14px] text-center"
                    style={{
                      background: "var(--dash-primary)",
                      color: "#FFFFFF",
                      fontSize: "9px",
                      lineHeight: "12px",
                      padding: "1px 3px",
                    }}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </div>

              {/* Navigation Label: Strictly bounded, centered, no overlap */}
              <span
                className={`text-[10px] mt-1 tracking-tight truncate max-w-full text-center leading-none ${
                  isActive ? "font-bold" : "font-medium"
                }`}
                style={{
                  color: isActive ? "var(--dash-primary)" : "var(--dash-text-muted)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
