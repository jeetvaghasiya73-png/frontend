"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  MapPin,
  FileText,
  Send,
  CheckCheck,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { formatISTDateTime } from "@/lib/formatters";

interface FormattedWhatsAppMessageProps {
  message: string;
  senderType?: "inbound" | "outbound";
  timestamp?: string | null;
  status?: string | null;
  phoneNumber?: string | null;
  leadTitle?: string | null;
  collapsible?: boolean;
}

/**
 * Parses raw WhatsApp text (with *bold*, _italics_, and raw URLs)
 * into structured, clickable, non-overflowing React nodes.
 */
export function renderFormattedWhatsAppText(rawText: string) {
  if (!rawText) return null;

  // Split into lines first to preserve message paragraphs
  const lines = rawText.split(/\r?\n/);

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-2" />;
    }

    // Tokenize line by URLs (http/https) and WhatsApp markdown (*bold*)
    // Regex matches URLs OR *bold text*
    const tokenRegex = /(https?:\/\/[^\s]+|\*[^*]+\*)/g;
    const parts = line.split(tokenRegex);

    return (
      <p
        key={lineIdx}
        className="leading-relaxed break-words [overflow-wrap:anywhere] [word-break:break-word] text-xs"
      >
        {parts.map((part, pIdx) => {
          if (!part) return null;

          // Check if part is a URL
          if (/^https?:\/\//i.test(part)) {
            const cleanUrl = part.replace(/[.,;!]+$/, ""); // strip trailing punctuation
            const isGoogleMaps = /maps\.google|goo\.gl\/maps/i.test(cleanUrl);
            const isGoogleDrive = /drive\.google/i.test(cleanUrl);

            return (
              <a
                key={pIdx}
                href={cleanUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded text-[11px] font-medium font-mono transition-colors break-all ${
                  isGoogleMaps
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                    : isGoogleDrive
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/25"
                    : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 hover:bg-blue-500/25"
                }`}
                title={cleanUrl}
              >
                {isGoogleMaps && <MapPin className="w-3 h-3 shrink-0" />}
                {isGoogleDrive && <FileText className="w-3 h-3 shrink-0" />}
                {!isGoogleMaps && !isGoogleDrive && <ExternalLink className="w-3 h-3 shrink-0" />}
                <span className="truncate max-w-[200px] sm:max-w-xs">{cleanUrl.replace(/^https?:\/\//i, "")}</span>
              </a>
            );
          }

          // Check if part is *bold*
          if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            const boldContent = part.slice(1, -1);
            return (
              <strong key={pIdx} className="font-bold text-[var(--dash-text-primary)]">
                {boldContent}
              </strong>
            );
          }

          return <span key={pIdx}>{part}</span>;
        })}
      </p>
    );
  });
}

export function FormattedWhatsAppMessage({
  message,
  senderType = "inbound",
  timestamp,
  status,
  phoneNumber,
  leadTitle,
  collapsible = true
}: FormattedWhatsAppMessageProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (!message || !message.trim()) return null;

  const isOutbound = senderType === "outbound";
  const cleanPhone = phoneNumber ? phoneNumber.replace(/\D/g, "") : "";
  const waChatUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`}` : null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(message.trim()).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const isLong = message.length > 320;
  const displayText = !expanded && isLong && collapsible ? `${message.slice(0, 300)}...` : message;

  return (
    <div
      className={`rounded-xl border transition-all shadow-sm max-w-full min-w-0 overflow-hidden ${
        isOutbound
          ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/25"
          : "bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/30"
      }`}
    >
      {/* Message Header Bar */}
      <div
        className={`px-3 py-2 flex items-center justify-between gap-2 border-b flex-wrap ${
          isOutbound
            ? "border-emerald-500/20 bg-emerald-500/10"
            : "border-amber-500/20 bg-amber-500/10"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
              isOutbound
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 text-white"
            }`}
          >
            {isOutbound ? <Send className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
          </div>
          <div className="min-w-0">
            <span
              className={`text-xs font-bold block truncate ${
                isOutbound ? "text-emerald-700 dark:text-emerald-300" : "text-amber-800 dark:text-amber-300"
              }`}
            >
              {isOutbound ? "WhatsApp Outreach Dispatched" : "Inbound Client WhatsApp Reply"}
            </span>
            {timestamp && (
              <span className="text-[10px] text-[var(--dash-text-muted)] block font-mono">
                {formatISTDateTime(timestamp)}
              </span>
            )}
          </div>
        </div>

        {/* Header Right Badges & Actions */}
        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
          {status && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                status.toLowerCase() === "read" || status.toLowerCase() === "seen"
                  ? "bg-blue-500/15 text-blue-500 border border-blue-500/30"
                  : status.toLowerCase() === "delivered"
                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
              }`}
            >
              <CheckCheck className="w-3 h-3" />
              <span>{status}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] transition cursor-pointer"
            title="Copy message text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {waChatUrl && !isOutbound && (
            <a
              href={waChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 cursor-pointer"
              title="Open chat on WhatsApp Web"
            >
              <span>Reply</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          )}
        </div>
      </div>

      {/* Message Body Content */}
      <div className="p-3 space-y-1.5 text-[var(--dash-text-secondary)] min-w-0 max-w-full overflow-hidden">
        {renderFormattedWhatsAppText(displayText)}

        {isLong && collapsible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 flex items-center gap-1 cursor-pointer"
          >
            <span>{expanded ? "Show less" : "Read full message"}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>
    </div>
  );
}
