"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play,
  Search,
  MapPin,
  Calendar,
  Film,
  Star,
  Share2,
  ArrowUpRight,
} from "lucide-react";
import type { VideoItem } from "@/types/portfolio";
import { VIDEO_CATEGORIES } from "@/lib/defaults";
import { formatEditorialDate } from "@/lib/video-utils";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";

interface VideosSectionProps {
  videos: VideoItem[];
}

export function VideosSection({ videos }: VideosSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const featuredVideo = useMemo(
    () => videos.find((v) => v.featured) || null,
    [videos]
  );

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return videos.filter((v) => {
      const catMatch = selectedCategory === "All" || v.category === selectedCategory;
      const queryMatch =
        !q ||
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        (v.location || "").toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [videos, selectedCategory, searchQuery]);

  return (
    <section
      id="videos"
      className="py-16 sm:py-24 bg-[var(--bg-primary)] border-b border-[var(--border-subtle)]"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent-crimson)]">
              02 / Video Portfolio & Reporting Reels
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
              On-Camera Reporting & Broadcast Reels
            </h2>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Explore news reports, studio anchoring clips, ground dispatches, and interviews.
            </p>
          </div>

          {/* Search Filter */}
          {videos.length > 0 && (
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reels, topics, locations..."
                aria-label="Search reporting reels"
                className="w-full pl-9 pr-3 py-2 text-sm border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] rounded-sm focus:outline-none focus:border-[var(--accent-crimson)]"
              />
            </div>
          )}
        </div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap gap-2">
          {["All", ...VIDEO_CATEGORIES].map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-sm border transition-colors ${
                  active
                    ? "bg-[#0D1B2A] text-white border-[#0D1B2A] dark:bg-[#F4F1EA] dark:text-[#0D1B2A] dark:border-[#F4F1EA]"
                    : "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--text-primary)]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Empty State (Zero fabricated videos) */}
        {videos.length === 0 ? (
          <div className="border border-dashed border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-10 sm:p-14 text-center rounded-sm space-y-4">
            <div className="mx-auto w-14 h-14 flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm text-[var(--accent-crimson)]">
              <Film className="w-7 h-7" />
            </div>
            <div className="max-w-lg mx-auto space-y-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                Reporting Reels Desk — Ready for Broadcast
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                No reporting reels have been published yet. MP4 uploads, YouTube bulletins,
                and Instagram reporting reels added from the Newsroom Admin Dashboard will
                appear here automatically.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--accent-crimson)] text-[var(--text-primary)] rounded-sm transition-colors"
              >
                <span>Manage Reels in Admin</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Reporting Reel Spotlight */}
            {featuredVideo && selectedCategory === "All" && !searchQuery.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 lg:grid-cols-12 border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm rounded-sm overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveVideo(featuredVideo)}
                  className="lg:col-span-7 relative aspect-video bg-[#09111E] group overflow-hidden text-left"
                >
                  {featuredVideo.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={featuredVideo.thumbnailUrl}
                        alt={featuredVideo.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0D1B2A] text-white/75 p-6">
                      <Film className="w-10 h-10 mb-2 text-[#DF3B42]" />
                      <span className="font-mono text-xs uppercase tracking-widest">
                        {featuredVideo.sourceType} Reporting Reel
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                    <span className="w-16 h-16 flex items-center justify-center rounded-full bg-[var(--accent-crimson)] text-white shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-[#0D1B2A]/90 text-white rounded-sm">
                    <Star className="w-3 h-3 text-[#DF3B42] fill-current" />
                    Featured Reel
                  </span>
                </button>

                <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--accent-crimson)]">
                      <span>{featuredVideo.category}</span>
                      <span className="text-[var(--text-muted)]">•</span>
                      <span className="text-[var(--text-muted)]">
                        {featuredVideo.sourceType}
                      </span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[var(--text-primary)] leading-snug">
                      {featuredVideo.title}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-4">
                      {featuredVideo.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                        {formatEditorialDate(featuredVideo.recordedDate)}
                      </span>
                      {featuredVideo.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                          {featuredVideo.location}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveVideo(featuredVideo)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Watch Reel</span>
                      </button>
                      <Link
                        href={`/videos/${featuredVideo.slug}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-[var(--border-subtle)] hover:border-[var(--text-primary)] text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] rounded-sm transition-colors"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Filtered Grid */}
            {filteredVideos.length === 0 ? (
              <div className="p-8 border border-[var(--border-subtle)] bg-[var(--bg-secondary)] text-center rounded-sm">
                <p className="text-sm text-[var(--text-secondary)]">
                  No reporting reels match the selected category or search query.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <article
                    key={video.id}
                    className="group border border-[var(--border-subtle)] bg-[var(--bg-card)] rounded-sm overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveVideo(video)}
                      className="relative aspect-video w-full bg-[#09111E] overflow-hidden text-left"
                    >
                      {video.thumbnailUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0D1B2A] text-white/75 p-4">
                          <Film className="w-8 h-8 mb-1.5 text-[#DF3B42]" />
                          <span className="font-mono text-[11px] uppercase tracking-widest">
                            {video.sourceType}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors flex items-center justify-center">
                        <span className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--accent-crimson)] text-white shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </span>
                      </div>
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#0D1B2A]/90 text-white rounded-sm">
                        {video.category}
                      </span>
                    </button>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[var(--text-muted)]">
                          <span>{formatEditorialDate(video.recordedDate)}</span>
                          {video.location && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[var(--accent-crimson)]" />
                              {video.location}
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif text-lg font-bold text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-crimson)] transition-colors">
                          <button
                            type="button"
                            onClick={() => setActiveVideo(video)}
                            className="text-left"
                          >
                            {video.title}
                          </button>
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                          {video.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                        <button
                          type="button"
                          onClick={() => setActiveVideo(video)}
                          className="font-semibold uppercase tracking-wider text-[var(--accent-crimson)] hover:underline"
                        >
                          Play Video
                        </button>
                        <Link
                          href={`/videos/${video.slug}`}
                          className="inline-flex items-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <VideoPlayerModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </section>
  );
}
