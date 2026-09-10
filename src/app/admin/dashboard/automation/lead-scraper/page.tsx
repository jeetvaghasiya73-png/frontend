"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Database,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Sparkles,
  X,
  HelpCircle,
  ShieldAlert
} from "lucide-react";
import { authFetch, API } from "@/lib/authFetch";

// Helper to format any error object into a safe human-readable string
const formatErrorDetail = (detail: any): string => {
  if (!detail) return "Failed to process lead upload.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((err: any) => err.msg || err.detail || JSON.stringify(err)).join("; ");
  }
  if (typeof detail === "object") {
    return detail.message || detail.msg || JSON.stringify(detail);
  }
  return String(detail);
};

// React Error Boundary to catch any unhandled client runtime exceptions
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("LeadScraper ErrorBoundary caught an exception:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto my-12 bg-white dark:bg-[#111111] border border-red-500/20 rounded-2xl text-left space-y-4 shadow-xl">
          <div className="flex items-center gap-3 text-red-500">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <h2 className="text-lg font-bold">Admin Console Recovery Mode</h2>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-mono leading-relaxed">
            {this.state.error?.message || "An error occurred while rendering the page component."}
          </p>
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-accent-custom hover:bg-blue-600 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase font-mono cursor-pointer transition-all"
            >
              Reset Component
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function LeadScraperUploadContent() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Preparing workbook...");
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resultData, setResultData] = useState<{
    inserted: number;
    skipped: number;
    total_rows: number;
    cities_count: number;
    message: string;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.name.endsWith(".xlsx")) {
        setFile(selected);
        setErrorMsg(null);
        setResultData(null);
      } else {
        setErrorMsg("Invalid file extension. Please select an Excel (.xlsx) file.");
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith(".xlsx")) {
        setFile(droppedFile);
        setErrorMsg(null);
        setResultData(null);
      } else {
        setErrorMsg("Only .xlsx Excel files are supported.");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Please select a valid Excel (.xlsx) file first.");
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setProgress(15);
    setStatusText("Reading Excel file payload...");
    
    const formData = new FormData();
    formData.append("file", file);

    let progressTimer: NodeJS.Timeout | null = null;

    try {
      progressTimer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            if (progressTimer) clearInterval(progressTimer);
            return 85;
          }
          return prev + 15;
        });
      }, 300);

      setStatusText("Ingesting rows & matching city metrics...");

      const response = await authFetch(`${API}/api/v1/scraped-leads/upload`, {
        method: "POST",
        body: formData,
      });

      if (progressTimer) clearInterval(progressTimer);
      setProgress(100);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setResultData({
          inserted: Number(data.inserted || 0),
          skipped: Number(data.skipped || 0),
          total_rows: Number(data.total_rows || 0),
          cities_count: Number(data.cities_count || 0),
          message: String(data.message || "Leads successfully imported into database!"),
        });
        setFile(null);
      } else {
        const data = await response.json().catch(() => ({}));
        const parsedDetail = formatErrorDetail(data.detail);

        if (response.status === 401) {
          setErrorMsg("Session expired or unauthorized access. Redirecting to login...");
          setTimeout(() => router.push("/admin/login"), 1500);
        } else if (response.status === 413) {
          setErrorMsg("File size is too large for server processing limit.");
        } else if (response.status === 422) {
          setErrorMsg(`Excel format issue: ${parsedDetail}`);
        } else {
          setErrorMsg(parsedDetail || `Server error (${response.status}). Please try again.`);
        }
      }
    } catch (err: any) {
      if (progressTimer) clearInterval(progressTimer);
      console.error("Upload network error:", err);
      setErrorMsg("Network connection error. Check backend status or API endpoint CORS settings.");
    } finally {
      if (progressTimer) clearInterval(progressTimer);
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-fadeIn text-left">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-custom/10 border border-accent-custom/20 flex items-center justify-center text-accent-custom">
              <Database className="w-5 h-5" />
            </div>
            Import Scraped Justdial Leads
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
            Upload your local Justdial scraper Excel (.xlsx) files to seed outbound campaigns.
          </p>
        </div>

        <button
          onClick={() => router.push("/admin/dashboard")}
          className="self-start md:self-auto text-xs font-mono font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          View Dashboard
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Upload Area Container */}
      <div className="bg-white dark:bg-[#0c0c0c] p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-white/10 flex flex-col items-center justify-center relative overflow-hidden transition-all">
        
        {/* Glow Element */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-accent-custom/5 blur-[80px] pointer-events-none" />

        {/* Drag & Drop Box */}
        <div className="w-full max-w-xl">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 relative ${
              isDragOver
                ? "border-accent-custom bg-accent-custom/10 scale-[1.01]"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5 dark:bg-emerald-500/10"
                : "border-gray-300 dark:border-white/15 bg-gray-50/50 dark:bg-white/[0.02] hover:border-accent-custom/50 hover:bg-gray-100/50 dark:hover:bg-white/[0.04]"
            }`}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              {file ? (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mb-4 shadow-sm animate-bounce-short">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Excel File Ready
                  </p>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-accent-custom/10 border border-accent-custom/20 text-accent-custom flex items-center justify-center mb-4">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <p className="mb-1 text-sm font-bold text-gray-900 dark:text-white">
                    Click to select Excel file <span className="text-gray-400 font-normal">or drag & drop</span>
                  </p>
                  <p className="text-[11px] font-mono text-gray-400 dark:text-gray-500">
                    Supports Justdial .xlsx data tables (with Business Email &amp; City)
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xlsx"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>

        {/* Uploading Progress State */}
        {uploading && (
          <div className="w-full max-w-xl mt-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-accent-custom animate-spin" />
                {statusText}
              </span>
              <span className="font-bold text-accent-custom">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-custom rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Alert Banner with Custom Admin Diagnostics */}
        {errorMsg && (
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-start justify-between gap-3 w-full max-w-xl animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Upload Exception:</span>
                <span className="font-mono text-[11px] leading-relaxed block mt-0.5">{errorMsg}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-red-400 hover:text-red-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Submit Button */}
        {!uploading && !resultData && (
          <button
            onClick={handleUpload}
            disabled={!file}
            className="mt-6 w-full max-w-xl bg-accent-custom hover:bg-blue-600 text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 text-xs uppercase tracking-wider cursor-pointer transition-all duration-300 shadow-md shadow-blue-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <UploadCloud className="w-4 h-4" />
            Upload &amp; Import Scraped Leads
          </button>
        )}
      </div>

      {/* ── Success Modal Popup Overlay ── */}
      {resultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl relative space-y-6 text-left">
            
            <button
              onClick={() => setResultData(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Icon Header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Import Successful!
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                  Excel records synced with database
                </p>
              </div>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Leads Inserted</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {resultData.inserted}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Skipped / Duplicates</span>
                <span className="text-2xl font-bold font-mono text-gray-700 dark:text-gray-300 mt-1 block">
                  {resultData.skipped}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Total Excel Rows</span>
                <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white mt-1 block">
                  {resultData.total_rows}
                </span>
              </div>
              <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 p-3.5 rounded-xl">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Unique Cities</span>
                <span className="text-2xl font-bold font-mono text-accent-custom mt-1 block">
                  {resultData.cities_count}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="w-full bg-accent-custom hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setResultData(null)}
                className="w-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-900 dark:text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border border-gray-200 dark:border-white/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Upload Another
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default function LeadScraperUploadPage() {
  return (
    <ErrorBoundary>
      <LeadScraperUploadContent />
    </ErrorBoundary>
  );
}
