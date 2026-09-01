"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Shield,
  Users,
  Key,
  Activity,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { authFetch } from "@/lib/authFetch";
import { API_URL } from "@/lib/config";

const API = API_URL;

/* ─────────────────────────── Types ─────────────────────────── */
interface AdminUser {
  id: number;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  is_superadmin: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiToken {
  id: number;
  token: string;
  user_id: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string | null;
}

interface TokenUsage {
  id: number;
  endpoint: string;
  ip_address: string | null;
  duration_ms: number | null;
  used_at: string;
}

/* ─────────────────────────── Helpers ─────────────────────────── */
function fmt(dt: string) {
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Badge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        active
          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
          : "bg-red-500/10 text-red-400 border border-red-500/20"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-400" : "bg-red-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RoleBadge({ isSuperadmin }: { isSuperadmin: boolean }) {
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isSuperadmin
          ? "bg-accent-custom/15 text-accent-custom border border-accent-custom/20"
          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"
      }`}
    >
      {isSuperadmin ? "Super Admin" : "Admin"}
    </span>
  );
}

/* ─────────────────────────── Modal ─────────────────────────── */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Portal to document.body so the overlay covers everything (including sidebar)
  if (typeof document === "undefined") return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 space-y-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
        {children}
      </div>
    </div>,
    document.body
  );
}

/* ─────────────────────────── Tab 1: Admin Users ─────────────────────────── */
function AdminUsersTab() {
  const { user: me } = useAuthStore();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    is_superadmin: false,
  });
  const [createError, setCreateError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/api/v1/users/`);
      if (!res.ok) throw new Error("Failed to fetch users");
      setUsers(await res.json());
    } catch {
      setError("Could not load admin users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const res = await authFetch(`${API}/api/v1/users/`, {
        method: "POST",
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create user");
      setShowCreate(false);
      setCreateForm({ username: "", password: "", is_superadmin: false });
      fetchUsers();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Error creating user");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (u: AdminUser) => {
    setActionLoading(u.id);
    try {
      await authFetch(`${API}/api/v1/users/${u.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(`Delete user "${u.username}"? This cannot be undone.`)) return;
    setActionLoading(u.id);
    try {
      await authFetch(`${API}/api/v1/users/${u.id}`, { method: "DELETE" });
      fetchUsers();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-[#B0B0B0] font-mono">
          {users.length} admin account{users.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {me?.is_superadmin && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 py-2 bg-accent-custom text-white rounded-lg text-xs font-bold hover:bg-accent-custom/90 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Create Admin
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm font-mono">Loading users…</span>
        </div>
      ) : error ? (
        <div className="text-sm text-red-400 text-center py-10 font-mono">{error}</div>
      ) : (
        <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                <th className="text-left px-5 py-3">Username</th>
                <th className="text-left px-5 py-3">Role</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Created</th>
                {me?.is_superadmin && <th className="text-right px-5 py-3">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <span className="font-mono text-sm text-gray-900 dark:text-white">
                      {u.username}
                    </span>
                    {u.id === me?.id && (
                      <span className="ml-2 text-[9px] bg-accent-custom/10 text-accent-custom px-1.5 py-0.5 rounded font-bold">
                        YOU
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge isSuperadmin={u.is_superadmin} />
                  </td>
                  <td className="px-5 py-4">
                    <Badge active={u.is_active} />
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400 font-mono">{fmt(u.created_at)}</td>
                  {me?.is_superadmin && (
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {actionLoading === u.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        ) : u.id !== me.id ? (
                          <>
                            <button
                              onClick={() => toggleActive(u)}
                              title={u.is_active ? "Deactivate" : "Activate"}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                              {u.is_active ? (
                                <ToggleRight className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <ToggleLeft className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => deleteUser(u)}
                              title="Delete user"
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[10px] text-gray-400 font-mono">—</span>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreate && (
        <Modal title="Create Admin User" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {createError}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                value={createForm.username}
                onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="e.g. john_admin"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 characters"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setCreateForm((f) => ({ ...f, is_superadmin: !f.is_superadmin }))}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
                  createForm.is_superadmin ? "bg-accent-custom" : "bg-gray-300 dark:bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    createForm.is_superadmin ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
              <span className="text-sm text-gray-700 dark:text-[#B0B0B0]">
                Grant Super Admin privileges
              </span>
            </label>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2.5 bg-accent-custom text-white rounded-lg text-sm font-bold hover:bg-accent-custom/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────── Tab 2: API Tokens ─────────────────────────── */
function ApiTokensTab() {
  const { user: me } = useAuthStore();
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ description: "", expires_at: "", user_id: "" });
  const [createError, setCreateError] = useState("");
  const [revealedTokens, setRevealedTokens] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await authFetch(`${API}/api/v1/users/`);
      if (res.ok) setUsers(await res.json());
    } catch {}
  }, []);

  const fetchTokens = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/api/v1/api-tokens/`);
      if (!res.ok) throw new Error("Failed to fetch tokens");
      setTokens(await res.json());
    } catch {
      setError("Could not load API tokens");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchTokens(); 
    fetchUsers();
  }, [fetchTokens, fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const body: Record<string, unknown> = {
        description: createForm.description || null,
        is_active: true,
      };
      if (createForm.user_id) body.user_id = parseInt(createForm.user_id);
      if (createForm.expires_at) body.expires_at = new Date(createForm.expires_at).toISOString();
      const res = await authFetch(`${API}/api/v1/api-tokens/`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create token");
      setShowCreate(false);
      setCreateForm({ description: "", expires_at: "", user_id: "" });
      fetchTokens();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Error creating token");
    } finally {
      setCreating(false);
    }
  };

  const toggleToken = async (t: ApiToken) => {
    setActionLoading(t.id);
    try {
      await authFetch(`${API}/api/v1/api-tokens/${t.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !t.is_active }),
      });
      fetchTokens();
    } finally {
      setActionLoading(null);
    }
  };

  const revokeToken = async (t: ApiToken) => {
    if (!confirm(`Revoke token "${t.description || t.id}"? It will stop working immediately.`)) return;
    setActionLoading(t.id);
    try {
      await authFetch(`${API}/api/v1/api-tokens/${t.id}`, { method: "DELETE" });
      fetchTokens();
    } finally {
      setActionLoading(null);
    }
  };

  const copyToken = async (t: ApiToken) => {
    await navigator.clipboard.writeText(t.token);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const maskToken = (token: string) =>
    token.slice(0, 8) + "••••••••••••••••••••" + token.slice(-4);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-[#B0B0B0] font-mono">
          {tokens.length} token{tokens.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchTokens}
            className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 bg-accent-custom text-white rounded-lg text-xs font-bold hover:bg-accent-custom/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Token
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm font-mono">Loading tokens…</span>
        </div>
      ) : error ? (
        <div className="text-sm text-red-400 text-center py-10 font-mono">{error}</div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Key className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-mono">No API tokens yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((t) => (
            <div
              key={t.id}
              className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {t.description || <span className="italic text-gray-400">No description</span>}
                    </span>
                    <Badge active={t.is_active} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    Assigned to: {users.find(u => u.id === t.user_id)?.username || `User #${t.user_id}`} • Created {fmt(t.created_at)}
                    {t.expires_at && ` • Expires ${fmt(t.expires_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {actionLoading === t.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  ) : (
                    <>
                      <button
                        onClick={() => toggleToken(t)}
                        title={t.is_active ? "Disable" : "Enable"}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        {t.is_active ? (
                          <ToggleRight className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => revokeToken(t)}
                        title="Revoke token"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Token display */}
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-black/30 rounded-lg px-3 py-2 border border-gray-100 dark:border-white/5">
                <code className="flex-1 text-[11px] font-mono text-gray-600 dark:text-gray-300 truncate">
                  {revealedTokens.has(t.id) ? t.token : maskToken(t.token)}
                </code>
                <button
                  onClick={() =>
                    setRevealedTokens((s) => {
                      const n = new Set(s);
                      n.has(t.id) ? n.delete(t.id) : n.add(t.id);
                      return n;
                    })
                  }
                  className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {revealedTokens.has(t.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => copyToken(t)}
                  className="text-gray-400 hover:text-accent-custom transition-colors"
                >
                  {copiedId === t.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Token Modal */}
      {showCreate && (
        <Modal title="Create API Token" onClose={() => setShowCreate(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            {createError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {createError}
              </div>
            )}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                Description (optional)
              </label>
              <input
                type="text"
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="e.g. Production webhook token"
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                User
              </label>
              <select
                value={createForm.user_id}
                onChange={(e) => setCreateForm((f) => ({ ...f, user_id: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
              >
                <option value="">Select a user (optional)</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-500 dark:text-[#B0B0B0] mb-1.5">
                Expiry Date (optional)
              </label>
              <input
                type="datetime-local"
                value={createForm.expires_at}
                onChange={(e) => setCreateForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-accent-custom transition-all"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2.5 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex-1 py-2.5 bg-accent-custom text-white rounded-lg text-sm font-bold hover:bg-accent-custom/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Generate Token
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ─────────────────────────── Tab 3: Usage Logs ─────────────────────────── */
function UsageLogsTab() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [usages, setUsages] = useState<TokenUsage[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    (async () => {
      setLoadingTokens(true);
      try {
        const [tRes, uRes] = await Promise.all([
          authFetch(`${API}/api/v1/api-tokens/`),
          authFetch(`${API}/api/v1/users/`)
        ]);
        if (tRes.ok) {
          const data: ApiToken[] = await tRes.json();
          setTokens(data);
          if (data.length > 0) setSelectedTokenId(data[0].id);
        }
        if (uRes.ok) setUsers(await uRes.json());
      } finally {
        setLoadingTokens(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedTokenId) return;
    (async () => {
      setLoadingUsage(true);
      try {
        const res = await authFetch(`${API}/api/v1/api-tokens/${selectedTokenId}/usage?limit=50`);
        if (res.ok) setUsages(await res.json());
      } finally {
        setLoadingUsage(false);
      }
    })();
  }, [selectedTokenId]);

  const selectedToken = tokens.find((t) => t.id === selectedTokenId);

  return (
    <div className="space-y-5">
      {/* Token Selector */}
      <div className="relative w-full max-w-xs">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1.5">
          Select Token
        </label>
        {loadingTokens ? (
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading…
          </div>
        ) : tokens.length === 0 ? (
          <p className="text-sm text-gray-400 font-mono">No tokens available</p>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-sm text-gray-900 dark:text-white hover:border-accent-custom transition-colors"
            >
              <span className="truncate font-mono text-xs">
                {selectedToken ? `${selectedToken.description || `Token #${selectedToken.id}`} (${users.find(u => u.id === selectedToken.user_id)?.username})` : "Select a token"}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {dropdownOpen && (
              <div className="absolute z-20 top-full mt-1 w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
                {tokens.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTokenId(t.id); setDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-mono hover:bg-gray-50 dark:hover:bg-white/5 transition-colors ${
                      t.id === selectedTokenId ? "bg-gray-50 dark:bg-white/5 text-accent-custom" : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {t.description || `Token #${t.id}`} ({users.find(u => u.id === t.user_id)?.username})
                    <span className="ml-2 text-[9px] text-gray-400">
                      {t.is_active ? "• Active" : "• Inactive"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Usage Table */}
      {selectedTokenId && (
        loadingUsage ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-sm font-mono">Loading usage logs…</span>
          </div>
        ) : usages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-mono">No usage logs for this token</p>
          </div>
        ) : (
          <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden overflow-x-auto">
            <div className="px-5 py-3 bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10 flex items-center justify-between min-w-[600px]">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                {usages.length} recent request{usages.length !== 1 ? "s" : ""}
              </span>
              <span className="text-[10px] font-mono text-gray-400">Last 50</span>
            </div>
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="text-left px-5 py-2.5">Endpoint</th>
                  <th className="text-left px-5 py-2.5">IP Address</th>
                  <th className="text-left px-5 py-2.5">Duration</th>
                  <th className="text-left px-5 py-2.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {usages.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3">
                      <code className="text-xs font-mono text-gray-700 dark:text-gray-300">
                        {u.endpoint}
                      </code>
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">
                      {u.ip_address || "—"}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-500">
                      {u.duration_ms != null ? `${u.duration_ms.toFixed(0)}ms` : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">
                      {fmt(u.used_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

/* ─────────────────────────── Tab 4: JWT Logs ─────────────────────────── */
interface JwtUsageLog {
  id: number;
  user_id: number | null;
  username: string | null;
  token_hash: string | null;
  endpoint: string;
  ip_address: string | null;
  user_agent: string | null;
  status_code: number | null;
  duration_ms: number | null;
  used_at: string;
}

function JwtLogsTab() {
  const [logs, setLogs] = useState<JwtUsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/api/v1/users/jwt-usage?page=${currentPage}&limit=${itemsPerPage}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      const data = await res.json();
      setLogs(data.items);
      setTotalPages(data.pages);
      setTotalItems(data.total);
    } catch {
      setError("Could not load JWT access logs");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const startIdx = (currentPage - 1) * itemsPerPage + 1;
  const endIdx = Math.min(totalItems, currentPage * itemsPerPage);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-[#B0B0B0] font-mono">
          {totalItems > 0 ? (
            <>
              Showing logs <span className="font-bold text-gray-900 dark:text-white">{startIdx}-{endIdx}</span> of <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> total
            </>
          ) : (
            "No access logs available"
          )}
        </p>
        <button
          onClick={fetchLogs}
          className="p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm font-mono">Loading access logs…</span>
        </div>
      ) : error ? (
        <div className="text-sm text-red-400 text-center py-10 font-mono">{error}</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-mono">No admin access logs yet</p>
        </div>
      ) : (
        <>
          <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 dark:bg-white/[0.03] border-b border-gray-200 dark:border-white/10 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  <th className="text-left px-5 py-3">User</th>
                  <th className="text-left px-5 py-3">Endpoint</th>
                  <th className="text-left px-5 py-3">IP Address</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Duration</th>
                  <th className="text-left px-5 py-3">Browser / Device</th>
                  <th className="text-left px-5 py-3">Token Hash (SHA-256)</th>
                  <th className="text-left px-5 py-3">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-gray-900 dark:text-white">
                      {log.username || "Anonymous"}
                    </td>
                    <td className="px-5 py-4">
                      <code className="text-xs font-mono text-accent-custom px-1.5 py-0.5 bg-accent-custom/5 rounded border border-accent-custom/10">
                        {log.endpoint}
                      </code>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {log.ip_address || "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.status_code && log.status_code < 400
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {log.status_code || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">
                      {log.duration_ms != null ? `${log.duration_ms.toFixed(0)}ms` : "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 max-w-[200px] truncate" title={log.user_agent || ""}>
                      {log.user_agent || "—"}
                    </td>
                    <td className="px-5 py-4 font-mono text-[10px] text-gray-400 max-w-[120px] truncate" title={log.token_hash || ""}>
                      {log.token_hash || "—"}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400 font-mono">
                      {fmt(log.used_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-accent-custom hover:text-accent-custom disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | "dots")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push("dots");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "dots" ? (
                    <span key={`dots-${idx}`} className="text-xs text-gray-400 px-1">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        currentPage === item
                          ? "bg-accent-custom text-white shadow-sm"
                          : "border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400 hover:border-accent-custom/50"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] flex items-center justify-center text-gray-500 dark:text-gray-400 hover:border-accent-custom hover:text-accent-custom disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────── Main Page ─────────────────────────── */
type TabId = "users" | "tokens" | "usage" | "jwt_logs";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "users", label: "Admin Users", icon: Users },
  { id: "tokens", label: "API Tokens", icon: Key },
  { id: "usage", label: "Token Usage", icon: Activity },
  { id: "jwt_logs", label: "Access Logs", icon: Shield },
];

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const { user } = useAuthStore();

  if (!user?.is_superadmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Shield className="w-12 h-12 text-red-500 opacity-50" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-sm text-gray-500 max-w-md">
          You do not have the required permissions to view the Security & Access Control center. Only Super Admins can access this area.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-accent-custom" />
          Security &amp; Access Control
        </h1>
        <p className="text-xs text-gray-500 dark:text-[#B0B0B0] mt-1.5 font-mono">
          Manage admin users, API tokens, and monitor token usage across all endpoints.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-white/10">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === id
                ? "border-accent-custom text-accent-custom"
                : "border-transparent text-gray-500 dark:text-[#B0B0B0] hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "users" && <AdminUsersTab />}
        {activeTab === "tokens" && <ApiTokensTab />}
        {activeTab === "usage" && <UsageLogsTab />}
        {activeTab === "jwt_logs" && <JwtLogsTab />}
      </div>
    </div>
  );
}
