"use client";

import React, { useState } from "react";
import { Upload, Save, Loader2, Plus, Trash2, FileText } from "lucide-react";
import type { ParsedProfile, SkillItem } from "@/types/portfolio";

interface AdminProfileTabProps {
  profile: ParsedProfile;
  onRefresh: () => Promise<void>;
  notify: (type: "success" | "error", text: string) => void;
}

export function AdminProfileTab({
  profile,
  onRefresh,
  notify,
}: AdminProfileTabProps) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [designation, setDesignation] = useState(profile.designation);
  const [headline, setHeadline] = useState(profile.headline);
  const [heroIntro, setHeroIntro] = useState(profile.heroIntro);
  const [biography, setBiography] = useState(profile.biography);
  const [highlightsText, setHighlightsText] = useState(
    profile.aboutHighlights.join("\n")
  );

  const [heroImageUrl, setHeroImageUrl] = useState(profile.heroImageUrl);
  const [aboutImageUrl, setAboutImageUrl] = useState(profile.aboutImageUrl);
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl || "");

  const [location, setLocation] = useState(profile.location);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [instagramUrl, setInstagramUrl] = useState(profile.instagramUrl);
  const [linkedinUrl, setLinkedinUrl] = useState(profile.linkedinUrl);
  const [youtubeUrl, setYoutubeUrl] = useState(profile.youtubeUrl);

  const [internshipChannel, setInternshipChannel] = useState(profile.internshipChannel);
  const [internshipRole, setInternshipRole] = useState(profile.internshipRole);
  const [internshipDuration, setInternshipDuration] = useState(profile.internshipDuration);
  const [internshipPointsText, setInternshipPointsText] = useState(
    profile.internshipPoints.join("\n")
  );

  const [skills, setSkills] = useState<SkillItem[]>(profile.skills);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillDomain, setNewSkillDomain] =
    useState<SkillItem["domain"]>("Broadcast & Anchoring");
  const [newSkillFocus, setNewSkillFocus] = useState("");

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAssetUpload = async (
    file: File,
    kind: "image" | "document",
    target: "hero" | "about" | "resume"
  ) => {
    setUploadingField(target);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");

      if (target === "hero") setHeroImageUrl(data.url);
      if (target === "about") setAboutImageUrl(data.url);
      if (target === "resume") setResumeUrl(data.url);
      notify("success", "File uploaded. Click Save Profile Changes to publish.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingField(null);
    }
  };

  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        domain: newSkillDomain,
        focus: newSkillFocus.trim() || "Editorial & broadcast capability",
      },
    ]);
    setNewSkillName("");
    setNewSkillFocus("");
  };

  const removeSkill = (name: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName,
        designation,
        headline,
        heroIntro,
        biography,
        aboutHighlights: highlightsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        heroImageUrl,
        aboutImageUrl,
        resumeUrl: resumeUrl.trim() || null,
        location,
        email,
        phone,
        instagramUrl,
        linkedinUrl,
        youtubeUrl,
        internshipChannel,
        internshipRole,
        internshipDuration,
        internshipPoints: internshipPointsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        skills,
      };

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        notify("error", data.error || "Failed to update profile.");
      } else {
        notify("success", "Portfolio profile updated live.");
        await onRefresh();
      }
    } catch {
      notify("error", "Network error updating profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            Profile, Contact & Resume Management
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Update biography, portraits, contact info, social links, skills, and resume PDF.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving || Boolean(uploadingField)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-60 self-start"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Changes</span>
        </button>
      </div>

      {/* Portraits & Resume PDF */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 rounded-sm space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Hero Portrait
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt="Hero portrait"
            loading="lazy"
            decoding="async"
            className="w-full h-44 object-cover object-top rounded-sm bg-[#0D1B2A]"
          />
          <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] text-xs font-semibold rounded-sm cursor-pointer">
            {uploadingField === "hero" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Change Hero Photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAssetUpload(f, "image", "hero");
              }}
            />
          </label>
        </div>

        <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 rounded-sm space-y-3">
          <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
            Biography Portrait
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={aboutImageUrl}
            alt="About portrait"
            loading="lazy"
            decoding="async"
            className="w-full h-44 object-cover object-top rounded-sm bg-[#0D1B2A]"
          />
          <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] text-xs font-semibold rounded-sm cursor-pointer">
            {uploadingField === "about" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Change About Photo</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAssetUpload(f, "image", "about");
              }}
            />
          </label>
        </div>

        <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 rounded-sm flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Resume PDF
            </p>
            <div className="p-4 border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm text-center space-y-1">
              <FileText className="w-7 h-7 mx-auto text-[var(--accent-crimson)]" />
              <p className="text-xs font-medium text-[var(--text-primary)]">
                {resumeUrl ? "Custom Resume PDF Uploaded" : "Auto-Generated PDF Active"}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                {resumeUrl
                  ? "Visitors download your uploaded PDF."
                  : "Upload your custom PDF anytime."}
              </p>
            </div>
          </div>
          <label className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] text-xs font-semibold rounded-sm cursor-pointer">
            {uploadingField === "resume" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span>Upload Resume PDF</span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAssetUpload(f, "document", "resume");
              }}
            />
          </label>
        </div>
      </div>

      {/* Editorial Identity & Bio */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)]">
          Identity & Biography
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Designation
            </label>
            <input
              type="text"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Hero Headline
          </label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Hero Introduction
          </label>
          <textarea
            rows={3}
            value={heroIntro}
            onChange={(e) => setHeroIntro(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Full Biography
          </label>
          <textarea
            rows={5}
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Biography Focus Highlights (one per line)
          </label>
          <textarea
            rows={4}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
        </div>
      </div>

      {/* Contact & Social Media */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)]">
          Contact & Social Media Links
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Email Address
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Contact Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Instagram URL
            </label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              YouTube URL
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/@..."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* Internship Responsibilities */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)]">
          Reporting Internship Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={internshipChannel}
            onChange={(e) => setInternshipChannel(e.target.value)}
            placeholder="Channel Name"
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
          <input
            type="text"
            value={internshipRole}
            onChange={(e) => setInternshipRole(e.target.value)}
            placeholder="Position"
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
          <input
            type="text"
            value={internshipDuration}
            onChange={(e) => setInternshipDuration(e.target.value)}
            placeholder="Duration"
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
            Confirmed Responsibilities (one per line)
          </label>
          <textarea
            rows={4}
            value={internshipPointsText}
            onChange={(e) => setInternshipPointsText(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
        </div>
      </div>

      {/* Skills Manager */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm space-y-4">
        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] pb-2 border-b border-[var(--border-subtle)]">
          Skills & Expertise
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between gap-2 p-2.5 border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                  {skill.name}
                </p>
                <p className="text-[11px] text-[var(--text-muted)] truncate">
                  {skill.domain}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeSkill(skill.name)}
                className="p-1 text-[var(--text-muted)] hover:text-red-600"
                title="Remove skill"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
          <input
            type="text"
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Skill name"
            className="px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
          <select
            value={newSkillDomain}
            onChange={(e) => setNewSkillDomain(e.target.value as SkillItem["domain"])}
            className="px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          >
            <option value="Broadcast & Anchoring">Broadcast & Anchoring</option>
            <option value="Field & Editorial">Field & Editorial</option>
            <option value="Research & Communication">Research & Communication</option>
          </select>
          <input
            type="text"
            value={newSkillFocus}
            onChange={(e) => setNewSkillFocus(e.target.value)}
            placeholder="Brief editorial focus"
            className="px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
          />
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent-crimson)] text-xs font-semibold uppercase tracking-wider rounded-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || Boolean(uploadingField)}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save All Changes</span>
        </button>
      </div>
    </form>
  );
}
