import React from "react";
import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <div className="max-w-lg w-full border border-[var(--border-subtle)] bg-[var(--bg-card)] p-8 sm:p-10 text-center rounded-sm shadow-sm space-y-5">
        <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-[var(--accent-crimson)] rounded-sm">
          <Newspaper className="w-7 h-7" />
        </div>
        <div className="space-y-2">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--accent-crimson)]">
            Error 404 — Edition Missing
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            This Page Could Not Be Found
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            The report, reel, or portfolio section you requested may have been moved,
            unpublished, or does not exist.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D1B2A] text-white dark:bg-[#F4F1EA] dark:text-[#0D1B2A] hover:bg-[var(--accent-crimson)] dark:hover:bg-[var(--accent-crimson)] dark:hover:text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Portfolio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
