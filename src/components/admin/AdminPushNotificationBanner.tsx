"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellRing, Check, Loader2, X, Zap } from "lucide-react";
import {
  isPushNotificationSupported,
  getPushSubscriptionState,
  subscribeToPushNotifications
} from "@/lib/pushNotifications";
import { authFetch } from "@/lib/authFetch";
import { API_URL } from "@/lib/config";

export default function AdminPushNotificationBanner() {
  const [mounted, setMounted] = useState(false);
  const [supported, setSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<string>("default");
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isDismissed = localStorage.getItem("ti_admin_push_banner_dismissed");
      if (isDismissed === "true") {
        setDismissed(true);
      }
    }

    getPushSubscriptionState().then((state) => {
      setSupported(state.supported);
      setIsSubscribed(state.isSubscribed);
      setPermission(state.permission);
    });
  }, []);

  if (!mounted || !supported || isSubscribed || permission === "denied" || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const ok = await subscribeToPushNotifications();
      if (ok) {
        setIsSubscribed(true);
        setStatusMessage("✅ Background push alerts activated!");
        // Dispatch instant test push to confirm
        try {
          await authFetch(`${API_URL}/api/v1/push/test`, { method: "POST" });
        } catch {}
        setTimeout(() => setDismissed(true), 3500);
      } else {
        setStatusMessage("⚠️ Permission was not granted or was cancelled.");
      }
    } catch (e: any) {
      setStatusMessage("Failed to activate push. Please check browser settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("ti_admin_push_banner_dismissed", "true");
    } catch {}
  };

  return (
    <div className="mb-4 mx-3 sm:mx-0 p-3.5 sm:p-4 bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-purple-950/70 border border-indigo-500/30 rounded-2xl shadow-xl shadow-indigo-950/30 backdrop-blur-md relative overflow-hidden animate-fadeIn">
      {/* Background ambient glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-600/40 mt-0.5">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>

          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                Turn On Background Notifications
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full">
                PWA Alert
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed max-w-lg">
              Get instant sound and vibration popups on your phone whenever a new lead or inquiry is submitted — <span className="text-indigo-300 font-semibold">even when this app is closed</span>.
            </p>
            {statusMessage && (
              <p className="text-[11px] font-semibold text-emerald-400 mt-1 animate-fadeIn">
                {statusMessage}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800/50 transition cursor-pointer shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800/60 justify-end">
        <button
          type="button"
          onClick={handleDismiss}
          className="text-[11px] font-medium text-slate-400 hover:text-slate-200 px-3 py-1.5 transition cursor-pointer"
        >
          Later
        </button>
        <button
          type="button"
          onClick={handleEnable}
          disabled={loading}
          className="text-xs font-bold px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 active:scale-95 text-white rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Activating...</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Enable Background Alerts</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
