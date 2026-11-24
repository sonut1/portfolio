"use client";

import React, { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  path: string;
}

export function ShareButtons({ title, path }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const getUrl = () => {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  };

  const shareTo = (platform: "whatsapp" | "linkedin" | "x") => {
    const url = encodeURIComponent(getUrl());
    const text = encodeURIComponent(`${title} — Sanjana Pandey`);
    const target =
      platform === "whatsapp"
        ? `https://wa.me/?text=${text}%20${url}`
        : platform === "linkedin"
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
          : `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mr-1">
        <Share2 className="w-3.5 h-3.5" />
        Share
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] rounded-sm transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => shareTo("whatsapp")}
        className="px-2.5 py-1 text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] rounded-sm transition-colors"
      >
        WhatsApp
      </button>
      <button
        type="button"
        onClick={() => shareTo("linkedin")}
        className="px-2.5 py-1 text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] rounded-sm transition-colors"
      >
        LinkedIn
      </button>
      <button
        type="button"
        onClick={() => shareTo("x")}
        className="px-2.5 py-1 text-xs font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--text-primary)] text-[var(--text-secondary)] rounded-sm transition-colors"
      >
        X
      </button>
    </div>
  );
}
