"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { API_URL } from "@/lib/config";
import { ArrowRight, Loader2, ShieldAlert, Timer } from "lucide-react";

const MAX_CLIENT_ATTEMPTS = 5;
const LOCKOUT_DURATION_S = 60;

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isAuthenticated, router]);

  // Countdown timer for client-side lockout
  useEffect(() => {
    if (!lockedUntil) return;

    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedUntil(null);
        setCountdown(0);
        setAttempts(0);
        setError("");
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        setCountdown(remaining);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [lockedUntil]);

  const isLocked = lockedUntil !== null && Date.now() < lockedUntil;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/v1/auth/login/json`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        const data = await response.json();

        // Server returned 429 — backend lockout
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
          setLockedUntil(Date.now() + retryAfter * 1000);
          throw new Error(`Too many attempts. Locked for ${retryAfter}s.`);
        }

        // Client-side attempt tracking
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= MAX_CLIENT_ATTEMPTS) {
          setLockedUntil(Date.now() + LOCKOUT_DURATION_S * 1000);
          throw new Error(`Too many failed attempts. Locked for ${LOCKOUT_DURATION_S}s.`);
        }

        const remaining = MAX_CLIENT_ATTEMPTS - newAttempts;
        throw new Error(
          data.detail ||
            `Invalid credentials. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`
        );
      }

      const data = await response.json();
      login(data.access_token, data.refresh_token);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to establish connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] grid-bg p-6 relative">
      {/* Background glow beams */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-accent-custom/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-[420px] border border-white/10 bg-white/[0.03] backdrop-blur-lg rounded-2xl p-8 shadow-2xl relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-accent-custom to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(79,124,255,0.25)] mx-auto mb-4">
            N
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Nexora AI Console
          </h1>
          <p className="text-xs text-[#B0B0B0] mt-2">
            Secure administrative control portal access
          </p>
        </div>

        {/* Lockout Banner */}
        {isLocked && (
          <div className="mb-6 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold flex items-center gap-3">
            <Timer className="w-5 h-5 shrink-0 animate-pulse" />
            <div>
              <p className="font-bold">Access temporarily locked</p>
              <p className="font-mono mt-0.5 text-orange-300">
                Retry in {countdown}s
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !isLocked && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col items-start">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0B0] mb-2">
              Admin Username
            </label>
            <input
              type="text"
              id="admin-username"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLocked || loading}
              placeholder="Enter username"
              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-custom transition-all disabled:opacity-40"
            />
          </div>

          <div className="flex flex-col items-start">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-[#B0B0B0] mb-2">
              Password
            </label>
            <input
              type="password"
              id="admin-password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLocked || loading}
              placeholder="••••••••••••"
              className="w-full bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent-custom transition-all disabled:opacity-40"
            />
          </div>

          {/* Attempt indicator dots */}
          {attempts > 0 && !isLocked && (
            <div className="flex items-center gap-1.5">
              {Array.from({ length: MAX_CLIENT_ATTEMPTS }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < attempts ? "bg-red-500" : "bg-white/10"
                  }`}
                />
              ))}
              <span className="text-[10px] text-gray-500 ml-1 font-mono">
                {attempts}/{MAX_CLIENT_ATTEMPTS} attempts
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full bg-white text-black hover:bg-accent-custom hover:text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying Credentials...
              </>
            ) : isLocked ? (
              <>
                <Timer className="w-4 h-4" />
                Locked — Wait {countdown}s
              </>
            ) : (
              <>
                Authenticate Access
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 pt-6 border-t border-white/5 text-[9px] font-mono text-[#666666]">
          Authorized Personnel Only. All actions logged.
        </div>
      </div>
    </div>
  );
}
