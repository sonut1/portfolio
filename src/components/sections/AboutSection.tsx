"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Quote } from "lucide-react";
import type { ParsedProfile } from "@/types/portfolio";

export function AboutSection({ profile }: { profile: ParsedProfile }) {
  const paragraphs = profile.biography
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section
      id="about"
      className="py-16 sm:py-24 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Portrait Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-5"
          >
            <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 sm:p-3 shadow-sm rounded-sm">
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#0D1B2A] rounded-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={profile.aboutImageUrl || "/images/sanjana-about.jpg"}
                    alt={`${profile.fullName} editorial portrait`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="pt-3 px-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                <span>Editorial Desk</span>
                <span>{profile.location}</span>
              </div>
            </div>
          </motion.div>

          {/* Biography Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
                01 / Biography
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Grounded in Research. Driven by Responsible Journalism.
              </h2>
            </div>

            <div className="space-y-4 text-base text-[var(--text-secondary)] leading-relaxed">
              {paragraphs.map((para, index) => (
                <p key={index}>{para}</p>
              ))}
            </div>

            {/* Editorial Pull-Quote */}
            <div className="border-l-2 border-[var(--accent-crimson)] bg-[var(--bg-card)] px-5 py-4 rounded-r-sm">
              <div className="flex items-start gap-3">
                <Quote className="w-5 h-5 text-[var(--accent-crimson)] shrink-0 mt-0.5" />
                <p className="font-serif italic text-base sm:text-lg text-[var(--text-primary)]">
                  &ldquo;{profile.headline}&rdquo;
                </p>
              </div>
            </div>

            {/* Key Journalism Focus Areas */}
            <div className="pt-2 space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
                Core Editorial Focus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profile.aboutHighlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-2.5 p-3 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[var(--accent-crimson)] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-[var(--text-primary)]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
