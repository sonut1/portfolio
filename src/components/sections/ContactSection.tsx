"use client";

import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Download,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { InstagramIcon, LinkedinIcon } from "@/components/BrandIcons";
import type { ParsedProfile } from "@/types/portfolio";
import { isEditablePlaceholder } from "@/lib/profile-parser";

export function ContactSection({ profile }: { profile: ParsedProfile }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const hasEmail = !isEditablePlaceholder(profile.email);
  const hasPhone = !isEditablePlaceholder(profile.phone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (name.trim().length < 2) {
      setStatus({ type: "error", text: "Please enter your full name." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    if (subject.trim().length < 3) {
      setStatus({ type: "error", text: "Please include a clear subject." });
      return;
    }
    if (message.trim().length < 10) {
      setStatus({
        type: "error",
        text: "Please enter a message of at least 10 characters.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, organization, subject, message }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setStatus({
          type: "error",
          text: data.error || "Unable to send your message.",
        });
      } else {
        setStatus({
          type: "success",
          text:
            data.message ||
            "Thank you! Your inquiry has been received and logged in the newsroom desk.",
        });
        setName("");
        setEmail("");
        setOrganization("");
        setSubject("");
        setMessage("");
      }
    } catch {
      setStatus({
        type: "error",
        text: "Network error while sending message. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-[var(--bg-primary)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Direct Channels Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
                08 / Contact & Hire Me
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
                Connect With Sanjana
              </h2>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                Open to opportunities with news channels, media houses, digital journalism
                platforms, and editorial production teams.
              </p>
            </div>

            <div className="space-y-3">
              {/* Email */}
              {hasEmail ? (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center justify-between p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] rounded-sm transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Mail className="w-5 h-5 text-[var(--accent-crimson)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                        Email Contact
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {profile.email}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-crimson)]" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm">
                  <Mail className="w-5 h-5 text-[var(--accent-crimson)] shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Email Contact
                    </p>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      {profile.email || "[Editable: Email Address]"}
                    </p>
                  </div>
                </div>
              )}

              {/* Phone */}
              {hasPhone ? (
                <a
                  href={`tel:${profile.phone}`}
                  className="flex items-center justify-between p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] rounded-sm transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Phone className="w-5 h-5 text-[var(--accent-crimson)] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                        Phone Contact
                      </p>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">
                        {profile.phone}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--accent-crimson)]" />
                </a>
              ) : (
                <div className="flex items-center gap-3 p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm">
                  <Phone className="w-5 h-5 text-[var(--accent-crimson)] shrink-0" />
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                      Phone Contact
                    </p>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">
                      {profile.phone || "[Editable: Contact Number]"}
                      
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              <div className="flex items-center gap-3 p-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm">
                <MapPin className="w-5 h-5 text-[var(--accent-crimson)] shrink-0" />
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
                    Location
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {profile.location}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2.5">
              {profile.linkedinUrl ? (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] text-xs font-semibold text-[var(--text-primary)] rounded-sm transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4 text-[var(--accent-crimson)]" />
                  <span>LinkedIn</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)] rounded-sm">
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn [Editable]</span>
                </span>
              )}

              {profile.instagramUrl ? (
                <a
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] text-xs font-semibold text-[var(--text-primary)] rounded-sm transition-colors"
                >
                  <InstagramIcon className="w-4 h-4 text-[var(--accent-crimson)]" />
                  <span>Instagram</span>
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-3.5 py-2 border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)] rounded-sm">
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram [Editable]</span>
                </span>
              )}


            </div>

            {/* Download Resume Button */}
            <div className="pt-2">
              <a
                href="/api/resume"
                download="Sanjana_Pandey_Resume.pdf"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 bg-[#0D1B2A] text-white dark:bg-[#F4F1EA] dark:text-[#0D1B2A] hover:bg-[var(--accent-crimson)] dark:hover:bg-[var(--accent-crimson)] dark:hover:text-white text-sm font-semibold tracking-wide rounded-sm transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                <span>Download Resume (PDF)</span>
              </a>
            </div>
          </div>

          {/* Contact Inquiry Form Column */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 sm:p-8 rounded-sm shadow-sm space-y-5"
            >
              <div className="pb-4 border-b border-[var(--border-subtle)]">
                <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                  Send a Media or Recruitment Inquiry
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
                  For reporting roles, anchoring auditions, interviews, or editorial
                  collaborations.
                </p>
              </div>

              {status && (
                <div
                  role="alert"
                  className={`flex items-start gap-2.5 p-3.5 text-sm rounded-sm border ${
                    status.type === "success"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-200"
                      : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200"
                  }`}
                >
                  {status.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{status.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="editor@newsroom.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-org"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Organization / News Channel
                  </label>
                  <input
                    id="contact-org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Media house or agency"
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
                  >
                    Subject *
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Reporter opportunity / Audition"
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share role details, interview schedule, or collaboration inquiry..."
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)] resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] disabled:opacity-60 text-white text-sm font-semibold tracking-wide rounded-sm transition-colors"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
