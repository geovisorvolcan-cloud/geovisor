"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export default function ProfilePage() {
  const router = useRouter();
  const { ready, isAuthenticated, user, token, logout, updateUser } = useAuth();

  // ── Name ─────────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savingName, setSavingName] = useState(false);

  // ── Password ─────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);

  // ── Delete account ────────────────────────────────────────────────────────
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteStatus, setDeleteStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (ready && !isAuthenticated) router.replace("/");
  }, [ready, isAuthenticated, router]);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSavingName(true);
    setNameStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/user/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNameStatus({ ok: false, msg: data.error ?? "Failed to update name." });
      } else {
        updateUser({ name: data.name });
        setNameStatus({ ok: true, msg: "Name updated successfully." });
      }
    } catch {
      setNameStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwStatus({ ok: false, msg: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPwStatus({ ok: false, msg: "New password must be at least 6 characters." });
      return;
    }
    setSavingPw(true);
    setPwStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/user/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwStatus({ ok: false, msg: data.error ?? "Failed to change password." });
      } else {
        setPwStatus({ ok: true, msg: "Password changed successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPwStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async (e: FormEvent) => {
    e.preventDefault();
    setDeleting(true);
    setDeleteStatus(null);
    try {
      const res = await fetch(`${API_URL}/api/user/account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDeleteStatus({ ok: false, msg: data.error ?? "Failed to delete account." });
      } else {
        logout();
        router.replace("/");
      }
    } catch {
      setDeleteStatus({ ok: false, msg: "Network error. Please try again." });
    } finally {
      setDeleting(false);
    }
  };

  if (!ready || !user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Profile</h1>
          <span className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded-full">
            {user.role}
          </span>
        </div>

        {/* User info */}
        <div className="bg-white rounded-xl shadow p-4 text-sm text-gray-600">
          <p><span className="font-medium text-gray-800">Email:</span> {user.email}</p>
        </div>

        {/* Change name */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Change Name</h2>
          <form onSubmit={handleSaveName} className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Display name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {nameStatus && (
              <p className={`text-xs ${nameStatus.ok ? "text-green-600" : "text-red-500"}`}>
                {nameStatus.msg}
              </p>
            )}
            <button
              type="submit"
              disabled={savingName || !name.trim() || name.trim() === user.name}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {savingName ? "Saving…" : "Save Name"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password (min 6 characters)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            {pwStatus && (
              <p className={`text-xs ${pwStatus.ok ? "text-green-600" : "text-red-500"}`}>
                {pwStatus.msg}
              </p>
            )}
            <button
              type="submit"
              disabled={savingPw || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {savingPw ? "Updating…" : "Change Password"}
            </button>
          </form>
        </div>

        {/* Delete account */}
        <div className="bg-white rounded-xl shadow p-5 border border-red-100">
          <h2 className="text-sm font-bold text-red-700 mb-1">Delete Account</h2>
          <p className="text-xs text-gray-500 mb-4">
            This action is permanent and cannot be undone. All your data will be removed.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-50 text-red-600 border border-red-200 py-2 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              Delete My Account
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <p className="text-xs text-red-600 font-medium">
                Enter your password to confirm deletion:
              </p>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
              {deleteStatus && (
                <p className="text-xs text-red-500">{deleteStatus.msg}</p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setDeleteStatus(null); }}
                  className="flex-1 py-2 rounded-lg text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting || !deletePassword}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? "Deleting…" : "Confirm Delete"}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
