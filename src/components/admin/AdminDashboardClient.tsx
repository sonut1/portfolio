"use client";

import React, { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Film,
  Newspaper,
  Camera,
  UserCog,
  Inbox,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MailOpen,
  Mail,
} from "lucide-react";
import type {
  ArticleItem,
  ContactMessageItem,
  GalleryItem,
  ParsedProfile,
  VideoItem,
} from "@/types/portfolio";
import { formatEditorialDate } from "@/lib/video-utils";
import { AdminVideosTab } from "./AdminVideosTab";
import { AdminArticlesTab } from "./AdminArticlesTab";
import { AdminGalleryTab } from "./AdminGalleryTab";
import { AdminProfileTab } from "./AdminProfileTab";
import { ConfirmModal } from "./ConfirmModal";

type TabId = "overview" | "videos" | "articles" | "gallery" | "profile" | "inquiries";

interface AdminDashboardClientProps {
  adminName: string;
  adminEmail: string;
  initialProfile: ParsedProfile;
  initialVideos: VideoItem[];
  initialArticles: ArticleItem[];
  initialGallery: GalleryItem[];
  initialMessages: ContactMessageItem[];
}

export function AdminDashboardClient({
  adminName,
  adminEmail,
  initialProfile,
  initialVideos,
  initialArticles,
  initialGallery,
  initialMessages,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [profile, setProfile] = useState<ParsedProfile>(initialProfile);
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [messages, setMessages] = useState<ContactMessageItem[]>(initialMessages);

  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [deleteMsgTarget, setDeleteMsgTarget] = useState<ContactMessageItem | null>(null);
  const [deletingMsg, setDeletingMsg] = useState(false);

  const notify = useCallback((type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 4000);
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      const [profRes, vidRes, artRes, galRes, msgRes] = await Promise.all([
        fetch("/api/profile"),
        fetch("/api/videos?all=1"),
        fetch("/api/articles?all=1"),
        fetch("/api/gallery?all=1"),
        fetch("/api/contact"),
      ]);
      if (profRes.ok) {
        const d = (await profRes.json()) as { profile: ParsedProfile };
        setProfile(d.profile);
      }
      if (vidRes.ok) {
        const d = (await vidRes.json()) as { videos: VideoItem[] };
        setVideos(d.videos);
      }
      if (artRes.ok) {
        const d = (await artRes.json()) as { articles: ArticleItem[] };
        setArticles(d.articles);
      }
      if (galRes.ok) {
        const d = (await galRes.json()) as { images: GalleryItem[] };
        setGallery(d.images);
      }
      if (msgRes.ok) {
        const d = (await msgRes.json()) as { messages: ContactMessageItem[] };
        setMessages(d.messages);
      }
    } catch {
      notify("error", "Could not refresh dashboard data.");
    }
  }, [notify]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const toggleMessageRead = async (msg: ContactMessageItem) => {
    try {
      const res = await fetch(`/api/contact/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !msg.read }),
      });
      if (!res.ok) throw new Error();
      await refreshAll();
    } catch {
      notify("error", "Failed to update message status.");
    }
  };

  const confirmDeleteMessage = async () => {
    if (!deleteMsgTarget) return;
    setDeletingMsg(true);
    try {
      const res = await fetch(`/api/contact/${deleteMsgTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setDeleteMsgTarget(null);
      notify("success", "Inquiry deleted.");
      await refreshAll();
    } catch {
      notify("error", "Failed to delete inquiry.");
    } finally {
      setDeletingMsg(false);
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const publishedArticlesCount = articles.filter((a) => a.published).length;

  const recentUploads = [
    ...videos.map((v) => ({
      id: `v-${v.id}`,
      kind: "Video",
      title: v.title,
      meta: `${v.category} · ${v.sourceType}`,
      date: v.createdAt,
      tab: "videos" as TabId,
    })),
    ...articles.map((a) => ({
      id: `a-${a.id}`,
      kind: a.published ? "Article" : "Draft",
      title: a.headline,
      meta: a.category,
      date: a.createdAt,
      tab: "articles" as TabId,
    })),
    ...gallery.map((g) => ({
      id: `g-${g.id}`,
      kind: "Photo",
      title: g.caption,
      meta: g.category,
      date: g.createdAt,
      tab: "gallery" as TabId,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  const navItems: Array<{
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "videos", label: "Videos & Reels", icon: Film, badge: videos.length },
    { id: "articles", label: "Articles", icon: Newspaper, badge: articles.length },
    { id: "gallery", label: "Photo Gallery", icon: Camera, badge: gallery.length },
    { id: "profile", label: "Profile & Resume", icon: UserCog },
    { id: "inquiries", label: "Inquiries", icon: Inbox, badge: unreadCount || undefined },
  ];

  const selectTab = (id: TabId) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-secondary)]">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-[var(--border-subtle)] bg-[#0D1B2A] text-white">
        <span className="font-serif text-lg font-bold">Newsroom Admin</span>
        <button
          type="button"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label="Toggle admin sidebar"
          className="p-2"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? "block" : "hidden"
        } lg:flex lg:flex-col lg:w-68 shrink-0 bg-[#0D1B2A] text-[#F4F1EA] border-r border-[#1D2F47] justify-between`}
      >
        <div>
          <div className="hidden lg:block p-6 border-b border-white/10 space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#DF3B42]">
              Newsroom CMS
            </p>
            <h1 className="font-serif text-xl font-bold text-white">
              {profile.fullName}
            </h1>
            <p className="text-xs text-white/60 truncate">{adminEmail}</p>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                    active
                      ? "bg-[#DF3B42] text-white"
                      : "text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-mono px-1.5 py-0.5 rounded-xs ${
                        active ? "bg-black/20 text-white" : "bg-white/10 text-white/80"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider border border-white/20 hover:bg-white/10 text-white rounded-sm transition-colors"
          >
            <span>View Live Portfolio</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-white/75 hover:text-white hover:bg-white/10 rounded-sm transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto">
        {toast && (
          <div
            role="status"
            className={`mb-6 flex items-center gap-2.5 p-3.5 text-sm rounded-sm border shadow-sm ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-200"
                : "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/60 dark:border-red-800 dark:text-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        )}

        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="space-y-1">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent-crimson)]">
                Welcome back, {adminName}
              </p>
              <h2 className="font-serif text-3xl font-bold text-[var(--text-primary)]">
                Portfolio Overview
              </h2>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[var(--text-muted)]">
                  <span>Total Videos</span>
                  <Film className="w-4 h-4 text-[var(--accent-crimson)]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[var(--text-primary)]">
                  {videos.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {videos.filter((v) => v.featured).length} featured on homepage
                </p>
              </div>

              <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[var(--text-muted)]">
                  <span>Total Articles</span>
                  <Newspaper className="w-4 h-4 text-[var(--accent-crimson)]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[var(--text-primary)]">
                  {articles.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {publishedArticlesCount} published ·{" "}
                  {articles.length - publishedArticlesCount} drafts
                </p>
              </div>

              <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[var(--text-muted)]">
                  <span>Gallery Images</span>
                  <Camera className="w-4 h-4 text-[var(--accent-crimson)]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[var(--text-primary)]">
                  {gallery.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {gallery.filter((g) => g.visible).length} visible in archive
                </p>
              </div>

              <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-sm space-y-2">
                <div className="flex items-center justify-between text-xs font-mono uppercase text-[var(--text-muted)]">
                  <span>Inquiries</span>
                  <Inbox className="w-4 h-4 text-[var(--accent-crimson)]" />
                </div>
                <p className="font-serif text-3xl font-bold text-[var(--text-primary)]">
                  {messages.length}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {unreadCount} unread messages
                </p>
              </div>
            </div>

            {/* Quick Actions & Recent Uploads */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm space-y-4">
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Quick Actions
                </h3>
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={() => selectTab("videos")}
                    className="w-full text-left px-4 py-3 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] bg-[var(--bg-primary)] rounded-sm text-sm font-medium flex items-center justify-between"
                  >
                    <span>Upload MP4 / Add Reporting Video</span>
                    <Film className="w-4 h-4 text-[var(--accent-crimson)]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab("articles")}
                    className="w-full text-left px-4 py-3 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] bg-[var(--bg-primary)] rounded-sm text-sm font-medium flex items-center justify-between"
                  >
                    <span>Write or Publish an Article</span>
                    <Newspaper className="w-4 h-4 text-[var(--accent-crimson)]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab("gallery")}
                    className="w-full text-left px-4 py-3 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] bg-[var(--bg-primary)] rounded-sm text-sm font-medium flex items-center justify-between"
                  >
                    <span>Upload Photo Gallery Images</span>
                    <Camera className="w-4 h-4 text-[var(--accent-crimson)]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => selectTab("profile")}
                    className="w-full text-left px-4 py-3 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] bg-[var(--bg-primary)] rounded-sm text-sm font-medium flex items-center justify-between"
                  >
                    <span>Update Bio, Contact & Resume PDF</span>
                    <UserCog className="w-4 h-4 text-[var(--accent-crimson)]" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7 border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 rounded-sm space-y-4">
                <h3 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                  Recent Uploads
                </h3>
                {recentUploads.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] py-6 text-center border border-dashed border-[var(--border-subtle)] rounded-sm">
                    No media or stories uploaded yet. Use Quick Actions to publish your first
                    item.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {recentUploads.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => selectTab(item.tab)}
                        className="w-full text-left p-3 border border-[var(--border-subtle)] hover:border-[var(--accent-crimson)] bg-[var(--bg-primary)] rounded-sm flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--accent-crimson)]">
                            {item.kind} · {item.meta}
                          </span>
                          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                            {item.title}
                          </p>
                        </div>
                        <span className="text-xs font-mono text-[var(--text-muted)] shrink-0">
                          {formatEditorialDate(item.date)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "videos" && (
          <AdminVideosTab videos={videos} onRefresh={refreshAll} notify={notify} />
        )}

        {activeTab === "articles" && (
          <AdminArticlesTab
            articles={articles}
            videos={videos}
            onRefresh={refreshAll}
            notify={notify}
          />
        )}

        {activeTab === "gallery" && (
          <AdminGalleryTab images={gallery} onRefresh={refreshAll} notify={notify} />
        )}

        {activeTab === "profile" && (
          <AdminProfileTab profile={profile} onRefresh={refreshAll} notify={notify} />
        )}

        {activeTab === "inquiries" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[var(--text-primary)]">
                Contact & Media Inquiries
              </h2>
              <p className="text-sm text-[var(--text-muted)]">
                Messages submitted by news channels, recruiters, and media contacts.
              </p>
            </div>

            {messages.length === 0 ? (
              <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-card)] p-10 text-center rounded-sm space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-[var(--text-muted)]" />
                <p className="text-sm text-[var(--text-secondary)]">
                  No contact inquiries received yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`border p-5 rounded-sm space-y-3 ${
                      msg.read
                        ? "border-[var(--border-subtle)] bg-[var(--bg-card)]"
                        : "border-[var(--accent-crimson)] bg-[var(--bg-card)]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          {!msg.read && (
                            <span className="px-2 py-0.5 text-[10px] font-mono uppercase bg-[var(--accent-crimson)] text-white rounded-xs">
                              Unread
                            </span>
                          )}
                          <h4 className="font-serif text-lg font-bold text-[var(--text-primary)]">
                            {msg.subject}
                          </h4>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          From <strong className="text-[var(--text-primary)]">{msg.name}</strong>{" "}
                          ({msg.email})
                          {msg.organization ? ` · ${msg.organization}` : ""} ·{" "}
                          {formatEditorialDate(msg.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleMessageRead(msg)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[var(--border-subtle)] hover:border-[var(--text-primary)] rounded-sm"
                        >
                          {msg.read ? (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              <span>Mark Unread</span>
                            </>
                          ) : (
                            <>
                              <MailOpen className="w-3.5 h-3.5" />
                              <span>Mark Read</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteMsgTarget(msg)}
                          className="p-2 border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-red-600 rounded-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--text-secondary)] whitespace-pre-line leading-relaxed pt-2 border-t border-[var(--border-subtle)]">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <ConfirmModal
              open={Boolean(deleteMsgTarget)}
              title="Delete Inquiry"
              description={`Remove the inquiry from ${deleteMsgTarget?.name}?`}
              loading={deletingMsg}
              onConfirm={confirmDeleteMessage}
              onCancel={() => setDeleteMsgTarget(null)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
