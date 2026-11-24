"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, MapPin, Tv, Sparkles } from "lucide-react";
import type { ArticleItem, ParsedProfile, VideoItem } from "@/types/portfolio";
import { formatEditorialDate } from "@/lib/video-utils";

interface HeroSectionProps {
  profile: ParsedProfile;
  featuredVideo: VideoItem | null;
  latestArticle: ArticleItem | null;
}

const EDITORIAL_BEATS = [
  "Broadcast Journalism & Anchoring",
  "Ground Reporting & Field Dispatches",
  "Research-Driven Storytelling",
  "Responsible Public-Interest Media",
];

export function HeroSection({
  profile,
  featuredVideo,
  latestArticle,
}: HeroSectionProps) {
  const [beatIndex, setBeatIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBeatIndex((prev) => (prev + 1) % EDITORIAL_BEATS.length);
    }, 3400);
    return () => clearInterval(timer);
  }, []);

  const headlineSegments = profile.headline
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="relative border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] overflow-hidden">
      {/* Subtle architectural editorial grid lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Editorial Copy Column */}
          <div className="lg:col-span-7 space-y-7">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex flex-wrap items-center gap-2.5 border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-1.5 rounded-sm"
            >
              <span className="h-2 w-2 rounded-full bg-[var(--accent-crimson)]" />
              <span className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                {profile.designation}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="space-y-4"
            >
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.26em] text-[var(--accent-crimson)] font-medium">
                {profile.fullName.toUpperCase()}
              </p>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight leading-[1.08] text-[var(--text-primary)]">
                {headlineSegments.length > 1 ? (
                  headlineSegments.map((seg, idx) => (
                    <span key={seg} className="block">
                      {idx === 1 ? (
                        <span className="text-[var(--accent-crimson)]">{seg}</span>
                      ) : (
                        seg
                      )}
                    </span>
                  ))
                ) : (
                  profile.headline
                )}
              </h1>

              {/* Animated editorial sub-beat */}
              <div className="h-7 flex items-center gap-2.5 overflow-hidden pt-1">
                <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)]">
                  Focus:
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={beatIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="text-sm font-semibold text-[var(--text-primary)]"
                  >
                    {EDITORIAL_BEATS[beatIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16 }}
              className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl"
            >
              {profile.heroIntro}
            </motion.p>

            {/* Primary CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.24 }}
              className="flex flex-wrap items-center gap-4 pt-1"
            >
              <a
                href="#videos"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-[#0D1B2A] text-white dark:bg-[#F4F1EA] dark:text-[#0D1B2A] hover:bg-[var(--accent-crimson)] dark:hover:bg-[var(--accent-crimson)] dark:hover:text-white text-sm font-semibold tracking-wide rounded-sm transition-colors shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Watch My Reporting</span>
              </a>

              <a
                href="#contact"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 border border-[var(--text-primary)] bg-transparent text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] text-sm font-semibold tracking-wide rounded-sm transition-colors"
              >
                <span>Get In Touch</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Factual Credential Strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              className="pt-5 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="flex items-start gap-3">
                <Tv className="w-4 h-4 text-[var(--accent-crimson)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Newsroom Internship
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {profile.internshipChannel}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {profile.internshipDuration}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--accent-crimson)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Base & Academic Desk
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {profile.location}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    B.A. Mass Communication, Ranchi University
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Cinematic Portrait Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="lg:col-span-5"
          >
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 sm:p-3 shadow-lg rounded-sm">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0D1B2A] rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={profile.heroImageUrl || "/images/sanjana-hero.jpg"}
                        alt={`${profile.fullName} — ${profile.designation}`}
                        loading="eager"
                        decoding="async"
                        className="h-full w-full object-cover object-top"
                    />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#08101C]/90 via-[#08101C]/45 to-transparent p-4 sm:p-5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#DF3B42]">
                      Broadcast & Editorial Profile
                    </p>
                    <p className="font-serif text-lg sm:text-xl font-bold text-white mt-0.5">
                      {profile.fullName}
                    </p>
                    <p className="text-xs text-white/80">{profile.location}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Latest From Sanjana Strip — shown seamlessly when real uploads exist */}
        {(featuredVideo || latestArticle) && (
          <div className="mt-12 pt-6 border-t border-[var(--border-subtle)]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-[var(--accent-crimson)]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Latest From Sanjana</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 md:max-w-4xl">
                {featuredVideo && (
                  <Link
                    href={`/videos/${featuredVideo.slug}`}
                    className="group flex items-center justify-between gap-3 p-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] rounded-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-crimson)]">
                        {featuredVideo.featured ? "Featured Reel" : "Latest Reel"} ·{" "}
                        {featuredVideo.category}
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-crimson)] transition-colors">
                        {featuredVideo.title}
                      </p>
                    </div>
                    <Play className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent-crimson)]" />
                  </Link>
                )}
                {latestArticle && (
                  <Link
                    href={`/articles/${latestArticle.slug}`}
                    className="group flex items-center justify-between gap-3 p-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] rounded-sm transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                        {latestArticle.category} ·{" "}
                        {formatEditorialDate(latestArticle.publishedAt)}
                      </span>
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent-crimson)] transition-colors">
                        {latestArticle.headline}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 shrink-0 text-[var(--text-muted)] group-hover:text-[var(--accent-crimson)]" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
