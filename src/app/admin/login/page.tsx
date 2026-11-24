"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "Sign in failed.");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[var(--bg-secondary)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-crimson)] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Portfolio</span>
        </Link>

        <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-7 sm:p-9 rounded-sm shadow-md space-y-6">
          <div className="space-y-2 pb-4 border-b border-[var(--border-subtle)]">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent-crimson)]">
              <ShieldCheck className="w-4 h-4" />
              <span>Newsroom CMS</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Admin Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              Authenticate to manage reporting reels, articles, gallery photos, and profile
              details.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 text-sm bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200 rounded-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sanjanapandey.in"
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0D1B2A] text-white dark:bg-[#F4F1EA] dark:text-[#0D1B2A] hover:bg-[var(--accent-crimson)] dark:hover:bg-[var(--accent-crimson)] dark:hover:text-white disabled:opacity-60 text-sm font-semibold tracking-wide rounded-sm transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
