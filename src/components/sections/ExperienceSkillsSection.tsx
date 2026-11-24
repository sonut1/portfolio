"use client";

import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Tv, Calendar, Mic, FileText, SearchCheck } from "lucide-react";
import type { ParsedProfile, SkillItem } from "@/types/portfolio";

const DOMAIN_META: Record<
  SkillItem["domain"],
  { icon: React.ComponentType<{ className?: string }>; subtitle: string }
> = {
  "Broadcast & Anchoring": {
    icon: Mic,
    subtitle: "Studio presentation, vocal delivery, and live lens presence",
  },
  "Field & Editorial": {
    icon: FileText,
    subtitle: "Structured reporting, interviewing, and clear news writing",
  },
  "Research & Communication": {
    icon: SearchCheck,
    subtitle: "Verification discipline, background research, and public affairs",
  },
};

export function ExperienceSkillsSection({ profile }: { profile: ParsedProfile }) {
  const domains: SkillItem["domain"][] = [
    "Broadcast & Anchoring",
    "Field & Editorial",
    "Research & Communication",
  ];

  return (
    <>
      {/* D. Reporting Experience */}
      <section
        id="experience"
        className="py-16 sm:py-24 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
              03 / Reporting Experience
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Newsroom & Field Experience
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Practical broadcast exposure developing journalistic discipline, research habits,
              and on-camera fluency.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5 }}
            className="relative pl-6 sm:pl-10 border-l-2 border-[var(--accent-crimson)]"
          >
            <span className="absolute -left-[9px] top-6 h-4 w-4 rounded-full bg-[var(--accent-crimson)] border-4 border-[var(--bg-secondary)]" />

            <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 rounded-sm shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-crimson)]">
                    <Tv className="w-4 h-4" />
                    <span>Television & Digital Newsroom</span>
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                    {profile.internshipChannel}
                  </h3>
                  <p className="inline-flex items-center gap-2 text-sm sm:text-base font-semibold text-[var(--text-secondary)]">
                    <Briefcase className="w-4 h-4 text-[var(--text-muted)]" />
                    <span>{profile.internshipRole}</span>
                  </p>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-xs font-mono uppercase tracking-wider text-[var(--text-primary)] rounded-sm self-start">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                  <span>{profile.internshipDuration}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
                  Key Responsibilities & Learning Scope
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {profile.internshipPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 p-3.5 border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
                    >
                      <span className="font-mono text-xs font-bold text-[var(--accent-crimson)] mt-0.5">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* E. Skills & Expertise (No fake percentage ratings) */}
      <section
        id="skills"
        className="py-16 sm:py-24 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
              04 / Skills & Expertise
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              Editorial & Broadcast Capabilities
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Core competencies across field reporting, studio anchoring, interviewing, and
              fact-checked news writing.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {domains.map((domain, domainIdx) => {
              const meta = DOMAIN_META[domain];
              const Icon = meta.icon;
              const items = profile.skills.filter((s) => s.domain === domain);
              if (items.length === 0) return null;

              return (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: domainIdx * 0.08 }}
                  className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm shadow-xs flex flex-col space-y-5"
                >
                  <div className="pb-4 border-b border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex items-center gap-2.5 text-[var(--accent-crimson)]">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                        {domain}
                      </h3>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{meta.subtitle}</p>
                  </div>

                  <div className="space-y-3">
                    {items.map((skill) => (
                      <div
                        key={skill.name}
                        className="group p-3 border border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 hover:border-[var(--accent-crimson)] rounded-sm transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)]">
                            {skill.name}
                          </span>
                          <span className="flex items-center gap-1" aria-hidden="true">
                            <span className="h-1.5 w-3 bg-[var(--accent-crimson)] rounded-xs" />
                            <span className="h-1.5 w-1.5 bg-[var(--text-primary)]/40 rounded-xs" />
                          </span>
                        </div>
                        {skill.focus && (
                          <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                            {skill.focus}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
