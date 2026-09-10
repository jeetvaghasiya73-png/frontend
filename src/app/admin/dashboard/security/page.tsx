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
  Lock,
  Zap,
  CheckCircle2,
  X
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
  is_main_admin?: boolean;
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        active
          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
          : "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-rose-500"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function RoleBadge({ isSuperadmin, isMainAdmin }: { isSuperadmin: boolean; isMainAdmin?: boolean }) {
  if (isMainAdmin) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
        ★ Main Admin
      </span>
    );
  }
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        isSuperadmin
          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800"
          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      }`}
    >
      {isSuperadmin ? "Super Admin" : "Admin"}
    </span>
  );
}

/* ─────────────────────────── Tab 1: Admin Users ─────────────────────────── */
function AdminUsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newIsSuperadmin, setNewIsSuperadmin] = useState(false);
  const [creating, setCreating] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/api/v1/users/admin-users`);
      if (!res.ok) throw new Error("Failed to fetch admin users");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("Could not load admin users list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await authFetch(`${API}/api/v1/users/admin-users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
          is_superadmin: newIsSuperadmin,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create user");
      }
      setShowCreate(false);
      setNewUsername("");
      setNewPassword("");
      setNewIsSuperadmin(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      const res = await authFetch(`${API}/api/v1/users/admin-users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      if (res.ok) fetchUsers();
    } catch {
      setError("Failed to update user status");
    }
  };

  const handleDelete = async () => {
    if (!deleteModalUser) return;
    setDeleting(true);
    try {
      const res = await authFetch(`${API}/api/v1/users/admin-users/${deleteModalUser.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteModalUser(null);
        fetchUsers();
      } else {
        const err = await res.json();
        setError(err.detail || "Failed to delete user");
      }
    } catch {
      setError("Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registered accounts with console access to LeadFlow CRM
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>New Admin User</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400 font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs font-mono">Loading users list…</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-3.5 px-5 uppercase tracking-wider text-[10px]">User</th>
                <th className="py-3.5 px-5 uppercase tracking-wider text-[10px]">Role</th>
                <th className="py-3.5 px-5 uppercase tracking-wider text-[10px]">Status</th>
                <th className="py-3.5 px-5 uppercase tracking-wider text-[10px]">Created</th>
                <th className="py-3.5 px-5 text-right uppercase tracking-wider text-[10px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 dark:text-white">{u.username}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <RoleBadge isSuperadmin={u.is_superadmin} isMainAdmin={u.is_main_admin} />
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge active={u.is_active} />
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">{fmt(u.created_at)}</td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={u.is_main_admin}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          u.is_main_admin
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        }`}
                        title={u.is_main_admin ? "Main Admin cannot be disabled" : u.is_active ? "Deactivate User" : "Activate User"}
                      >
                        {u.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      </button>
                      <button
                        onClick={() => setDeleteModalUser(u)}
                        disabled={u.is_main_admin}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          u.is_main_admin
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                        }`}
                        title={u.is_main_admin ? "Main Admin cannot be deleted" : "Delete User"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Admin User</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="superadmin"
                  checked={newIsSuperadmin}
                  onChange={(e) => setNewIsSuperadmin(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="superadmin" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Grant Super Admin Rights
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
                >
                  {creating ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm User Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete admin account <span className="font-bold text-slate-900 dark:text-white">"{deleteModalUser.username}"</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/30"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Main Security Page Layout ─────────────────────────── */
export default function SecurityPage() {
  const { user } = useAuthStore();

  if (!user?.is_superadmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-500 opacity-60 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Access Denied</h2>
        <p className="text-xs text-slate-500 max-w-md">
          You do not have the required permissions to view the Security & Access Control center. Only Super Admins can access this area.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Security &amp; Access Control</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage console admin accounts, security permissions, and role immunity</p>
          </div>
        </div>
      </header>

      <AdminUsersTab />
    </div>
  );
}
