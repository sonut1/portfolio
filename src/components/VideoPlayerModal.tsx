"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, MapPin, Calendar, ExternalLink } from "lucide-react";
import type { VideoItem } from "@/types/portfolio";
import {
  formatEditorialDate,
  getInstagramEmbedUrl,
  getYouTubeEmbedUrl,
} from "@/lib/video-utils";
import { ShareButtons } from "./ShareButtons";

interface VideoPlayerModalProps {
  video: VideoItem | null;
  onClose: () => void;
}

export function VideoEmbedFrame({ video }: { video: VideoItem }) {
  if (video.sourceType === "MP4") {
    return (
      <div className="relative w-full aspect-video bg-black overflow-hidden rounded-sm">
        <video
          src={video.videoUrl}
          poster={video.thumbnailUrl || undefined}
          controls
          autoPlay
          playsInline
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (video.sourceType === "YOUTUBE") {
    const embedUrl = getYouTubeEmbedUrl(video.videoUrl);
    if (embedUrl) {
      return (
        <div className="relative w-full aspect-video bg-black overflow-hidden rounded-sm">
          <iframe
            src={embedUrl}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      );
    }
  }

  if (video.sourceType === "INSTAGRAM") {
    const igEmbed = getInstagramEmbedUrl(video.videoUrl);
    if (igEmbed) {
      return (
        <div className="flex flex-col items-center gap-3 bg-[#09111E] p-3 rounded-sm">
          <div className="w-full max-w-[400px] aspect-[9/14] max-h-[65vh] bg-black overflow-hidden rounded-sm">
            <iframe
              src={igEmbed}
              title={video.title}
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
          <a
            href={video.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white underline"
          >
            <span>Open on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      );
    }
  }

  return (
    <div className="p-8 text-center bg-[#09111E] text-white rounded-sm space-y-3">
      <p className="text-sm text-white/75">External broadcast link</p>
      <a
        href={video.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-crimson)] text-white text-sm font-medium rounded-sm"
      >
        <span>Open Video</span>
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

export function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  useEffect(() => {
    if (!video) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [video, onClose]);

  if (!video) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={video.title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-sm shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider bg-[var(--accent-crimson)] text-white rounded-sm shrink-0">
              {video.category}
            </span>
            <h3 className="font-serif text-base sm:text-lg font-bold text-[var(--text-primary)] truncate">
              {video.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <VideoEmbedFrame video={video} />

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                {formatEditorialDate(video.recordedDate)}
              </span>
              {video.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                  {video.location}
                </span>
              )}
              <span className="uppercase">{video.sourceType}</span>
            </div>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {video.description}
            </p>

            <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
              <ShareButtons title={video.title} path={`/videos/${video.slug}`} />
              <Link
                href={`/videos/${video.slug}`}
                className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-crimson)] hover:underline"
              >
                Open Dedicated Page →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
