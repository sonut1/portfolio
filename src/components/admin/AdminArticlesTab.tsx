"use client";

import React, { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Upload,
  Pencil,
  Trash2,
  Loader2,
  Newspaper,
  CheckCircle2,
  FileEdit,
  X,
} from "lucide-react";
import type { ArticleItem, VideoItem } from "@/types/portfolio";
import { ARTICLE_CATEGORIES } from "@/lib/defaults";
import { formatEditorialDate } from "@/lib/video-utils";
import { safeJsonParse } from "@/lib/profile-parser";
import { ConfirmModal } from "./ConfirmModal";

interface AdminArticlesTabProps {
  articles: ArticleItem[];
  videos: VideoItem[];
  onRefresh: () => Promise<void>;
  notify: (type: "success" | "error", text: string) => void;
}

export function AdminArticlesTab({
  articles,
  videos,
  onRefresh,
  notify,
}: AdminArticlesTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [headline, setHeadline] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState<string>(ARTICLE_CATEGORIES[0]);
  const [tagsText, setTagsText] = useState("");
  const [location, setLocation] = useState("");
  const [relatedVideoId, setRelatedVideoId] = useState("");

  const [uploadingCover, setUploadingCover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ArticleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return articles.filter((a) => {
      const statusOk =
        statusFilter === "all" ||
        (statusFilter === "published" && a.published) ||
        (statusFilter === "draft" && !a.published);
      const qOk =
        !q ||
        a.headline.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return statusOk && qOk;
    });
  }, [articles, search, statusFilter]);

  const resetForm = () => {
    setEditingId(null);
    setHeadline("");
    setExcerpt("");
    setContent("");
    setCoverImageUrl("");
    setCategory(ARTICLE_CATEGORIES[0]);
    setTagsText("");
    setLocation("");
    setRelatedVideoId("");
    setShowForm(false);
  };

  const openEdit = (a: ArticleItem) => {
    setEditingId(a.id);
    setHeadline(a.headline);
    setExcerpt(a.excerpt);
    setContent(a.content);
    setCoverImageUrl(a.coverImageUrl || "");
    setCategory(a.category);
    const parsedTags = safeJsonParse<string[]>(a.tags, []);
    setTagsText(parsedTags.join(", "));
    setLocation(a.location || "");
    setRelatedVideoId(a.relatedVideoId || "");
    setShowForm(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed");
      setCoverImageUrl(data.url);
      notify("success", "Cover image uploaded.");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Cover upload failed.");
    } finally {
      setUploadingCover(false);
    }
  };

  const saveArticle = async (publishNow: boolean) => {
    setSaving(true);
    try {
      const payload = {
        headline,
        excerpt,
        content,
        coverImageUrl: coverImageUrl || null,
        category,
        tags: tagsText,
        location: location || null,
        relatedVideoId: relatedVideoId || null,
        published: publishNow,
      };
      const res = await fetch(editingId ? `/api/articles/${editingId}` : "/api/articles", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        notify("error", data.error || "Failed to save article.");
      } else {
        notify(
          "success",
          publishNow ? "Article published live." : "Draft saved to newsroom desk."
        );
        resetForm();
        await onRefresh();
      }
    } catch {
      notify("error", "Network error saving article.");
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (a: ArticleItem) => {
    try {
      const res = await fetch(`/api/articles/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !a.published }),
      });
      if (!res.ok) throw new Error();
      notify("success", a.published ? "Article unpublished to drafts." : "Article published.");
      await onRefresh();
    } catch {
      notify("error", "Failed to update article status.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/articles/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify("success", "Article deleted.");
      setDeleteTarget(null);
      await onRefresh();
    } catch {
      notify("error", "Failed to delete article.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
            Articles & Stories Management
          </h2>
          <p className="text-sm text-[var(--text-muted)]">
            Draft, edit, attach broadcast clips, and publish stories.
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
          <span>Write New Story</span>
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void saveArticle(true);
          }}
          className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
              {editingId ? "Edit Story" : "Compose Editorial Story"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Headline *
            </label>
            <input
              type="text"
              required
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Compelling journalistic headline..."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              >
                {ARTICLE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
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
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                placeholder="Civic, Education, Ranchi"
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Cover Image
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 px-3 py-2 border border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-crimson)] rounded-sm cursor-pointer text-xs shrink-0">
                  {uploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                </label>
                <input
                  type="text"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="Cover image URL"
                  className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                Related Reporting Video (optional)
              </label>
              <select
                value={relatedVideoId}
                onChange={(e) => setRelatedVideoId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
              >
                <option value="">None</option>
                {videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Short Introduction (Standfirst) *
            </label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Concise 1–2 sentence summary of the story..."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Full Article Body *
            </label>
            <textarea
              rows={8}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the complete story here. Separate paragraphs with blank lines."
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--border-subtle)] rounded-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving || uploadingCover}
              onClick={() => void saveArticle(false)}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--text-primary)] rounded-sm"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={saving || uploadingCover}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-60"
            >
              {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>Publish Story</span>
            </button>
          </div>
        </form>
      )}

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "published" | "draft")}
          className="px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm"
        >
          <option value="all">All Statuses</option>
          <option value="published">Published Only</option>
          <option value="draft">Drafts Only</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 text-center rounded-sm space-y-2">
          <Newspaper className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No stories found. Click &ldquo;Write New Story&rdquo; to draft or publish an
            article.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider">
                  <span className="text-[var(--accent-crimson)] font-semibold">
                    {article.category}
                  </span>
                  {article.published ? (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 rounded-xs">
                      <FileEdit className="w-3 h-3" />
                      Draft
                    </span>
                  )}
                  <span className="text-[var(--text-muted)]">
                    • {formatEditorialDate(article.publishedAt || article.updatedAt)}
                  </span>
                </div>
                <h4 className="font-serif text-base font-bold text-[var(--text-primary)] truncate">
                  {article.headline}
                </h4>
                <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                  {article.excerpt}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => togglePublish(article)}
                  className="px-3 py-1.5 text-xs font-semibold border border-[var(--border-subtle)] hover:border-[var(--text-primary)] rounded-sm"
                >
                  {article.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  type="button"
                  title="Edit article"
                  onClick={() => openEdit(article)}
                  className="p-2 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Delete article"
                  onClick={() => setDeleteTarget(article)}
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
        title="Delete Article"
        description={`Are you sure you want to permanently delete "${deleteTarget?.headline}"?`}
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
