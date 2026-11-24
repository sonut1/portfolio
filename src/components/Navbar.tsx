"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sun, Moon, ShieldCheck } from "lucide-react";
import { useTheme } from "./ThemeProvider";

interface NavbarProps {
  fullName: string;
  designation: string;
  location: string;
}

const NAV_LINKS = [
  { label: "About", href: "/#about" },
  { label: "Reels", href: "/#videos" },
  { label: "Experience", href: "/#experience" },
  { label: "Stories", href: "/#articles" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Education", href: "/#education" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar({ fullName, designation, location }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-colors duration-200 ${
        scrolled
          ? "bg-[var(--bg-primary)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)] shadow-xs"
          : "bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]"
      }`}
    >
      {/* Top Dateline Bar */}
      <div className="hidden md:block border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-[11px] font-mono tracking-widest uppercase text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent-crimson)]" />
            <span>{location}</span>
            <span className="opacity-40">|</span>
            <span>{designation}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Newsroom Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2.5 group shrink-0">
          <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {fullName.toUpperCase()}
          </span>
          <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-[var(--accent-crimson)] group-hover:scale-125 transition-transform" />
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-crimson)] transition-colors relative py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors rounded-sm"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <Link
            href="/#contact"
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#0D1B2A] text-white dark:bg-[#F4F1EA] dark:text-[#0D1B2A] hover:bg-[var(--accent-crimson)] dark:hover:bg-[var(--accent-crimson)] dark:hover:text-white transition-colors rounded-sm"
          >
            Get In Touch
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="lg:hidden p-2 border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-sm"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-4 space-y-1">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block py-2.5 px-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-crimson)] border-b border-[var(--border-subtle)]/60"
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-3 flex items-center justify-between gap-3">
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </Link>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[var(--accent-crimson)] text-white rounded-sm"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
