"use client";

import React, { useMemo, useState } from "react";
import { Upload, Trash2, Loader2, Camera, Eye, EyeOff, Pencil, Check, X } from "lucide-react";
import type { GalleryItem } from "@/types/portfolio";
import { GALLERY_CATEGORIES } from "@/lib/defaults";
import { ConfirmModal } from "./ConfirmModal";

interface AdminGalleryTabProps {
  images: GalleryItem[];
  onRefresh: () => Promise<void>;
  notify: (type: "success" | "error", text: string) => void;
}

export function AdminGalleryTab({ images, onRefresh, notify }: AdminGalleryTabProps) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [uploadCategory, setUploadCategory] = useState<string>(GALLERY_CATEGORIES[0]);
  const [defaultCaption, setDefaultCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [editCategory, setEditCategory] = useState<string>(GALLERY_CATEGORIES[0]);

  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    if (categoryFilter === "All") return images;
    return images.filter((i) => i.category === categoryFilter);
  }, [images, categoryFilter]);

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const itemsToSave: Array<{
        imageUrl: string;
        caption: string;
        category: string;
      }> = [];

      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("kind", "image");
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = (await upRes.json()) as { url?: string; error?: string };
        if (!upRes.ok || !upData.url) {
          throw new Error(upData.error || `Upload failed for ${file.name}`);
        }
        const fallbackName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ");
        itemsToSave.push({
          imageUrl: upData.url,
          caption: defaultCaption.trim() || fallbackName,
          category: uploadCategory,
        });
      }

      const saveRes = await fetch("/api/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsToSave }),
      });
      if (!saveRes.ok) {
        const errData = (await saveRes.json()) as { error?: string };
        throw new Error(errData.error || "Failed to save gallery images");
      }

      notify("success", `${itemsToSave.length} photo(s) uploaded to gallery.`);
      setDefaultCaption("");
      e.target.value = "";
      await onRefresh();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Batch upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: editCaption, category: editCategory }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      notify("success", "Photo updated.");
      await onRefresh();
    } catch {
      notify("error", "Failed to update photo.");
    }
  };

  const toggleVisibility = async (item: GalleryItem) => {
    try {
      const res = await fetch(`/api/gallery/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !item.visible }),
      });
      if (!res.ok) throw new Error();
      notify("success", "Photo visibility updated.");
      await onRefresh();
    } catch {
      notify("error", "Failed to update visibility.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gallery/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify("success", "Photo deleted.");
      setDeleteTarget(null);
      await onRefresh();
    } catch {
      notify("error", "Failed to delete photo.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
          Photo Gallery Management
        </h2>
        <p className="text-sm text-[var(--text-muted)]">
          Upload multiple reporting, newsroom, or portrait photographs and organize them by
          category.
        </p>
      </div>

      {/* Multi-upload card */}
      <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Target Category
            </label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            >
              {GALLERY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--text-secondary)]">
              Default Caption (optional — uses filename if blank)
            </label>
            <input
              type="text"
              value={defaultCaption}
              onChange={(e) => setDefaultCaption(e.target.value)}
              placeholder="e.g., Newsroom briefing at Global Awaaz News Channel"
              className="w-full px-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
            />
          </div>
        </div>

        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-crimson)] rounded-sm cursor-pointer transition-colors">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-crimson)]" />
          ) : (
            <Upload className="w-6 h-6 text-[var(--accent-crimson)]" />
          )}
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {uploading ? "Uploading selected photos..." : "Select One or Multiple Photos"}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            JPEG, PNG, or WebP up to 10 MB each
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={handleBatchUpload}
          />
        </label>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {["All", ...GALLERY_CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-sm border ${
              categoryFilter === cat
                ? "bg-[#0D1B2A] text-white border-[#0D1B2A] dark:bg-[#F4F1EA] dark:text-[#0D1B2A]"
                : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 text-center rounded-sm space-y-2">
          <Camera className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
          <p className="text-sm text-[var(--text-secondary)]">
            No gallery photographs uploaded in this category yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-[#0D1B2A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={item.imageUrl}
                    alt={item.caption}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                />
                {!item.visible && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-mono uppercase bg-amber-500 text-black rounded-xs">
                    Hidden
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
                    >
                      {GALLERY_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs border border-[var(--border-subtle)] bg-[var(--bg-primary)] rounded-sm"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1.5 border border-[var(--border-subtle)] rounded-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void saveEdit(item.id)}
                        className="p-1.5 bg-[var(--accent-crimson)] text-white rounded-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--accent-crimson)]">
                        {item.category}
                      </span>
                      <p className="text-sm text-[var(--text-primary)] mt-1">
                        {item.caption}
                      </p>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
                      <button
                        type="button"
                        title={item.visible ? "Hide" : "Show"}
                        onClick={() => void toggleVisibility(item)}
                        className="p-1.5 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                      >
                        {item.visible ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        title="Edit caption"
                        onClick={() => {
                          setEditingId(item.id);
                          setEditCaption(item.caption);
                          setEditCategory(item.category);
                        }}
                        className="p-1.5 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete photo"
                        onClick={() => setDeleteTarget(item)}
                        className="p-1.5 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-600 rounded-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Gallery Photo"
        description="Are you sure you want to permanently remove this photograph from the gallery?"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
