"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Upload,
  Star,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Loader2,
  Film,
  X,
} from "lucide-react";
import type { VideoItem } from "@/types/portfolio";
import { VIDEO_CATEGORIES } from "@/lib/defaults";
import { formatEditorialDate } from "@/lib/video-utils";
import { ConfirmModal } from "./ConfirmModal";

interface AdminVideosTabProps {
  videos: VideoItem[];
  onRefresh: () => Promise<void>;
  notify: (type: "success" | "error", text: string) => void;
}

export function AdminVideosTab({ videos, onRefresh, notify }: AdminVideosTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(VIDEO_CATEGORIES[0]);
  const [sourceType, setSourceType] = useState<"MP4" | "YOUTUBE" | "INSTAGRAM">("YOUTUBE");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [location, setLocation] = useState("");
  const [recordedDate, setRecordedDate] = useState(new Date().toISOString().slice(0, 10));
  const [featured, setFeatured] = useState(false);
  const [visible, setVisible] = useState(true);

  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return videos.filter((v) => {
      const catOk = categoryFilter === "All" || v.category === categoryFilter;
      const qOk =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        (v.location || "").toLowerCase().includes(q);
      return catOk && qOk;
    });
  }, [videos, search, categoryFilter]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setCategory(VIDEO_CATEGORIES[0]);
    setSourceType("YOUTUBE");
    setVideoUrl("");
    setThumbnailUrl("");
    setLocation("");
    setRecordedDate(new Date().toISOString().slice(0, 10));
    setFeatured(false);
    setVisible(true);
    setShowForm(false);
  };

  const openEdit = (v: VideoItem) => {
    setEditingId(v.id);
    setTitle(v.title);
    setDescription(v.description);
    setCategory(v.category);
    setSourceType(v.sourceType as "MP4" | "YOUTUBE" | "INSTAGRAM");
    setVideoUrl(v.videoUrl);
    setThumbnailUrl(v.thumbnailUrl || "");
    setLocation(v.location || "");
    setRecordedDate(v.recordedDate.slice(0, 10));
    setFeatured(v.featured);
    setVisible(v.visible);
    setShowForm(true);
  };

  const uploadFile = async (file: File, kind: "video" | "image") => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = (await res.json()) as { url?: string; error?: string };
    if (!res.ok || !data.url) {
      throw new Error(data.error || "Upload failed");
    }
    return data.url;
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadFile(file, "video");
      setSourceType("MP4");
      setVideoUrl(url);
      notify("success", "MP4 video uploaded cleanly.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleThumbFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingThumb(true);
    try {
      const url = await uploadFile(file, "image");
      setThumbnailUrl(url);
      notify("success", "Custom thumbnail uploaded.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Thumbnail upload failed.");
    } finally {
      setUploadingThumb(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title,
        description,
        category,
        sourceType,
        videoUrl,
        thumbnailUrl: thumbnailUrl || null,
        location: location || null,
        recordedDate,
        featured,
        visible,
      };
      const res = await fetch(editingId ? `/api/videos/${editingId}` : "/api/videos", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        notify("error", data.error || "Could not save video.");
      } else {
        notify("success", editingId ? "Video updated." : "Video added to portfolio.");
        resetForm();
        await onRefresh();
      }
    } catch {
      notify("error", "Network error saving video.");
    } finally {
      setSaving(false);
    }
  };

  const quickToggle = async (v: VideoItem, patch: Partial<VideoItem>) => {
    try {
      const res = await fetch(`/api/videos/${v.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      notify("success", "Video status updated.");
      await onRefresh();
    } catch {
      notify("error", "Failed to update video status.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify("success", "Video deleted.");
      setDeleteTarget(null);
      await onRefresh();
    } catch {
      notify("error", "Failed to delete video.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            Video Portfolio Management
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Upload MP4 reels or link YouTube and Instagram reports.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reporting Reel</span>
        </button>
      </div>

      {/* Create / Edit Modal Form */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
              {editingId ? "Edit Video Reel" : "Add New Video Reel"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Video Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Evening Bulletin Studio Anchor"
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              >
                {VIDEO_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Video Source *
            </label>
            <div className="flex flex-wrap gap-2">
              {(["YOUTUBE", "INSTAGRAM", "MP4"] as const).map((src) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setSourceType(src)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm border ${
                    sourceType === src
                      ? "bg-[#0D1B2A] text-white border-[#0D1B2A] dark:bg-[#F4F1EA] dark:text-[#0D1B2A]"
                      : "bg-[var(--bg-primary)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
                  }`}
                >
                  {src === "MP4" ? "Upload MP4 File" : `${src} Link`}
                </button>
              ))}
            </div>

            {sourceType === "MP4" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-crimson)] rounded-sm cursor-pointer text-xs font-medium">
                  {uploadingVideo ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-[var(--accent-crimson)]" />
                  )}
                  <span>{uploadingVideo ? "Uploading MP4..." : "Choose MP4/WebM Video"}</span>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    className="hidden"
                    onChange={handleVideoFileChange}
                  />
                </label>
                <input
                  type="text"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Uploaded MP4 URL will appear here"
                  className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
                />
              </div>
            ) : (
              <input
                type="url"
                required
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder={
                  sourceType === "YOUTUBE"
                    ? "https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    : "https://www.instagram.com/reel/..."
                }
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ranchi, Jharkhand"
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Date
              </label>
              <input
                type="date"
                value={recordedDate}
                onChange={(e) => setRecordedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Custom Thumbnail
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-crimson)] rounded-sm cursor-pointer text-xs shrink-0">
                  {uploadingThumb ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleThumbFileChange}
                  />
                </label>
                <input
                  type="text"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="Optional thumbnail URL"
                  className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the story, reporting angle, or anchoring context..."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <span>Feature on Homepage Spotlight</span>
            </label>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={visible}
                onChange={(e) => setVisible(e.target.checked)}
              />
              <span>Visible to Public</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--border-subtle)] rounded-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingVideo || uploadingThumb}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0D1B2A] text-white dark:bg-[#F4F1EA] dark:text-[#0D1B2A] hover:bg-[var(--accent-crimson)] dark:hover:bg-[var(--accent-crimson)] dark:hover:text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{editingId ? "Update Reel" : "Publish Reel"}</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm"
        >
          <option value="All">All Categories</option>
          {VIDEO_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Video List */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 text-center rounded-sm space-y-2">
          <Film className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No reporting reels found. Click &ldquo;Add Reporting Reel&rdquo; to upload an MP4 or
            add a YouTube/Instagram link.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((video) => (
            <div
              key={video.id}
              className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4 min-w-0">
                <div className="w-28 aspect-video bg-[#0D1B2A] rounded-sm overflow-hidden shrink-0 flex items-center justify-center">
                  {video.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                    />
                  ) : (
                    <Film className="w-5 h-5 text-white/60" />
                  )}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                    <span className="text-[var(--accent-crimson)] font-semibold">
                      {video.category}
                    </span>
                    <span className="text-[var(--text-muted)]">• {video.sourceType}</span>
                    <span className="text-[var(--text-muted)]">
                      • {formatEditorialDate(video.recordedDate)}
                    </span>
                    {!video.visible && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-xs">
                        Hidden
                      </span>
                    )}
                    {video.featured && (
                      <span className="px-1.5 py-0.5 bg-[var(--accent-crimson)]/15 text-[var(--accent-crimson)] rounded-xs">
                        Featured
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif text-base font-bold text-[var(--text-primary)] truncate">
                    {video.title}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                    {video.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  title={video.featured ? "Unfeature" : "Feature"}
                  onClick={() => quickToggle(video, { featured: !video.featured })}
                  className={`p-2 border rounded-sm transition-colors ${
                    video.featured
                      ? "border-[var(--accent-crimson)] text-[var(--accent-crimson)] bg-[var(--accent-crimson)]/10"
                      : "border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title={video.visible ? "Hide from public" : "Show to public"}
                  onClick={() => quickToggle(video, { visible: !video.visible })}
                  className="p-2 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  {video.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  title="Edit video"
                  onClick={() => openEdit(video)}
                  className="p-2 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Delete video"
                  onClick={() => setDeleteTarget(video)}
                  className="p-2 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-600 rounded-sm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Reporting Reel"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title}"?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
