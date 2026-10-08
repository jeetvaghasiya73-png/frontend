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
import { formatISTDateTime } from "@/lib/formatters";

const API = API_URL;

const AVAILABLE_PERMISSIONS = [
  { id: "sales_calling", label: "Sales Calling (Call leads & log dispositions)" },
  { id: "manage_leads", label: "Leads Database (View & edit prospect records)" },
  { id: "delete_lead", label: "Delete Leads (Remove leads & bulk delete)" },
  { id: "send_whatsapp", label: "Send WhatsApp (Direct pitch, test messages & campaigns)" },
  { id: "manage_faqs", label: "Manage FAQs (Create, update & delete FAQs)" },
  { id: "manage_portfolio", label: "Manage Portfolio (Create, update & delete works)" },
  { id: "manage_blogs", label: "Manage Blogs (Publish, update & delete articles)" },
  { id: "manage_testimonials", label: "Manage Testimonials (Add & edit client reviews)" },
  { id: "manage_services", label: "Manage Services (Update agency offerings)" },
  { id: "manage_settings", label: "System Settings (Configure agency & API keys)" },
];

/* ─────────────────────────── Types ─────────────────────────── */
interface AdminUser {
  id: number;
  username: string;
  is_active: boolean;
  is_admin: boolean;
  is_superadmin: boolean;
  is_main_admin?: boolean;
  job_title?: string;
  permissions?: string[];
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
  return formatISTDateTime(dt);
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
  const { user: currentUser } = useAuthStore();
  const isSuperAdmin = Boolean(
    currentUser?.is_superadmin ||
    currentUser?.is_main_admin ||
    currentUser?.role === "superadmin" ||
    currentUser?.permissions?.includes("all")
  );
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [newIsSuperadmin, setNewIsSuperadmin] = useState(false);
  const [creating, setCreating] = useState(false);

  const [deleteModalUser, setDeleteModalUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Edit User Modal State
  const [editModalUser, setEditModalUser] = useState<AdminUser | null>(null);
  const [editUsername, setEditUsername] = useState("");
  const [editJobTitle, setEditJobTitle] = useState("");
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editIsSuperadmin, setEditIsSuperadmin] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const openEditModal = (u: AdminUser) => {
    setEditModalUser(u);
    setEditUsername(u.username);
    setEditJobTitle(u.job_title || "");
    setEditPermissions(u.permissions || []);
    setEditIsSuperadmin(u.is_superadmin);
    setEditPassword("");
    setEditError("");
    setEditSuccess("");
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser) return;

    const isEditingSelf = editModalUser.id === currentUser?.id;
    if (!isSuperAdmin && !isEditingSelf) {
      setEditError("Access denied: Only Super Admin can change another user or admin's password or details.");
      return;
    }

    setEditing(true);
    setEditError("");
    setEditSuccess("");
    try {
      const body: any = {
        username: editUsername.trim(),
        job_title: editJobTitle.trim(),
      };
      if (isSuperAdmin) {
        body.permissions = editPermissions;
        if (!editModalUser.is_main_admin) {
          body.is_superadmin = editIsSuperadmin;
        }
      }
      if (editPassword.trim().length > 0) {
        if (!isSuperAdmin && !isEditingSelf) {
          throw new Error("Access denied: Only Super Admin can change other user passwords.");
        }
        body.password = editPassword.trim();
      }
      const res = await authFetch(`${API}/api/v1/users/admin-users/${editModalUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to update user");
      }
      setEditSuccess("User updated successfully!");
      fetchUsers();
      setTimeout(() => {
        setEditModalUser(null);
        setEditSuccess("");
      }, 1000);
    } catch (err: any) {
      setEditError(err.message || "Failed to update user");
    } finally {
      setEditing(false);
    }
  };

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
          job_title: newJobTitle,
          permissions: newPermissions
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to create user");
      }
      setShowCreate(false);
      setNewUsername("");
      setNewPassword("");
      setNewJobTitle("");
      setNewPermissions([]);
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
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-xs flex items-center gap-2 transition shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admin User</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-md text-xs text-rose-600 dark:text-rose-400 font-mono">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-xs font-mono">Loading users list…</span>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden shadow-sm w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[650px]">
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
                    {u.job_title && <span className="block mt-1 text-[10px] text-slate-500">{u.job_title}</span>}
                  </td>
                  <td className="py-3.5 px-5">
                    <Badge active={u.is_active} />
                  </td>
                  <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400">{fmt(u.created_at)}</td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(u)}
                        disabled={!isSuperAdmin || u.is_main_admin || (!currentUser?.is_main_admin && u.is_superadmin) || u.id === currentUser?.id}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          !isSuperAdmin || u.is_main_admin || (!currentUser?.is_main_admin && u.is_superadmin) || u.id === currentUser?.id
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                        }`}
                        title={
                          !isSuperAdmin
                            ? "Only Super Admin can change account status"
                            : u.is_main_admin
                            ? "Main Admin cannot be disabled"
                            : u.id === currentUser?.id
                            ? "You cannot disable your own account"
                            : u.is_active
                            ? "Deactivate User"
                            : "Activate User"
                        }
                      >
                        {u.is_active ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                      </button>
                      <button
                        onClick={() => openEditModal(u)}
                        disabled={(!isSuperAdmin && u.id !== currentUser?.id) || (u.is_main_admin && !currentUser?.is_main_admin && u.id !== currentUser?.id)}
                        className={`p-1.5 rounded-lg transition cursor-pointer ${
                          (!isSuperAdmin && u.id !== currentUser?.id) || (u.is_main_admin && !currentUser?.is_main_admin && u.id !== currentUser?.id)
                            ? "opacity-30 cursor-not-allowed"
                            : "hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500"
                        }`}
                        title={
                          !isSuperAdmin && u.id !== currentUser?.id
                            ? "Only Super Admin can edit other users or change their passwords"
                            : (u.is_main_admin && !currentUser?.is_main_admin && u.id !== currentUser?.id)
                            ? "Only Main Admin can edit this account"
                            : "Edit User"
                        }
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      {currentUser?.is_main_admin && (
                        <button
                          onClick={() => setDeleteModalUser(u)}
                          disabled={u.is_main_admin || u.id === currentUser?.id}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            u.is_main_admin || u.id === currentUser?.id
                              ? "opacity-30 cursor-not-allowed"
                              : "hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500"
                          }`}
                          title={
                            u.is_main_admin
                              ? "Main Admin cannot be deleted"
                              : u.id === currentUser?.id
                              ? "You cannot delete your own account"
                              : "Delete User"
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. SEO Manager"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              {!newIsSuperadmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Assigned Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {AVAILABLE_PERMISSIONS.map(perm => (
                      <div key={perm.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`perm-${perm.id}`}
                          checked={newPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) setNewPermissions(prev => [...prev, perm.id]);
                            else setNewPermissions(prev => prev.filter(p => p !== perm.id));
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`perm-${perm.id}`} className="text-xs text-slate-600 dark:text-slate-400">
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm User Deletion</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently delete admin account <span className="font-bold text-slate-900 dark:text-white">"{deleteModalUser.username}"</span>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/30"
              >
                {deleting ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Edit User Modal ─── */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editModalUser.id === currentUser?.id ? "Edit Your Profile & Password" : `Edit User: ${editModalUser.username}`}
              </h3>
              <button onClick={() => setEditModalUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-md text-xs text-rose-600 dark:text-rose-400 font-mono">
                {editError}
              </div>
            )}
            {editSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-md text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {editSuccess}
              </div>
            )}

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Username / Email</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. SEO Manager"
                  value={editJobTitle}
                  onChange={(e) => setEditJobTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {editModalUser.id === currentUser?.id ? "Change Your Password (leave blank to keep current)" : "New Password (leave blank to keep current)"}
                </label>
                {!isSuperAdmin && editModalUser.id !== currentUser?.id ? (
                  <div className="p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Only Super Admin can change passwords for other users.</span>
                  </div>
                ) : (
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                )}
              </div>

              {!isSuperAdmin ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assigned Permissions</label>
                  <p className="text-[10px] text-slate-500 mb-2">Only Super Admin can assign or change permissions.</p>
                  <div className="flex flex-wrap gap-1.5">
                    {editPermissions.length > 0 ? (
                      editPermissions.map(p => {
                        const found = AVAILABLE_PERMISSIONS.find(ap => ap.id === p);
                        return (
                          <span key={p} className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {found ? found.label.split("(")[0].trim() : p}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-slate-400 italic">No custom permissions</span>
                    )}
                  </div>
                </div>
              ) : !editIsSuperadmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Assigned Permissions</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {AVAILABLE_PERMISSIONS.map(perm => (
                      <div key={perm.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`edit-perm-${perm.id}`}
                          checked={editPermissions.includes(perm.id)}
                          onChange={(e) => {
                            if (e.target.checked) setEditPermissions(prev => [...prev, perm.id]);
                            else setEditPermissions(prev => prev.filter(p => p !== perm.id));
                          }}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor={`edit-perm-${perm.id}`} className="text-xs text-slate-600 dark:text-slate-400">
                          {perm.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {currentUser?.is_main_admin && !editModalUser.is_main_admin && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-superadmin"
                    checked={editIsSuperadmin}
                    onChange={(e) => setEditIsSuperadmin(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="edit-superadmin" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Grant Super Admin Rights
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editing}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {editing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Main Security Page Layout ─────────────────────────── */
export default function SecurityPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = Boolean(
    user?.is_superadmin ||
    user?.is_main_admin ||
    user?.role === "superadmin" ||
    user?.permissions?.includes("all")
  );

  return (
    <div className="space-y-6 text-left pb-20 relative animate-fadeIn font-sans antialiased text-slate-800 dark:text-slate-200">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Security &amp; Access Control</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage console admin accounts, security permissions, and role immunity</p>
          </div>
        </div>
      </header>

      {!isSuperAdmin && (
        <div className="flex items-center gap-3 p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 rounded-md text-xs text-indigo-800 dark:text-indigo-300">
          <Shield className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          <span>
            <strong>Admin Console Access:</strong> You can edit your profile and change your own password. Only Super Admin can add new admin accounts or change passwords for other users.
          </span>
        </div>
      )}

      <AdminUsersTab />

      {/* Google OAuth Token Refresh Section - Super Admin Only */}
      {isSuperAdmin && (
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 rounded-md overflow-hidden shadow-sm w-full p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Third-Party Integrations &amp; API Security</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Manage OAuth tokens for email and other services</p>
            </div>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Gmail API OAuth Token
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
                  LeadFlow CRM uses the Gmail API to send outreach emails on behalf of the admin. When the token expires, you must re-authenticate with Google.
                </p>
              </div>
              <GoogleOAuthRefreshButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleOAuthRefreshButton() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API}/api/v1/auth/google/secure-refresh-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_password: password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate Google auth link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white rounded-md font-semibold text-xs flex items-center gap-2 transition cursor-pointer shrink-0"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Refresh Gmail Token</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0f172a] rounded-md border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" /> Confirm Admin Password
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              For security reasons, please enter your admin password to generate a new Google OAuth refresh link.
            </p>

            {error && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-md text-xs text-rose-600 dark:text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Password</label>
                <input
                  type="password"
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !password}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {loading ? "Verifying..." : "Generate Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
