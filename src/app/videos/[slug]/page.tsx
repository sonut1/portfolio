import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { serializeProfile } from "@/lib/profile-parser";
import { formatEditorialDate } from "@/lib/video-utils";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ShareButtons } from "@/components/ShareButtons";
import { VideoEmbedFrame } from "@/components/VideoPlayerModal";
import type { VideoItem } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const video = await prisma.video.findFirst({
    where: { slug, visible: true },
  });

  if (!video) {
    return { title: "Reporting Reel Not Found" };
  }

  return {
    title: video.title,
    description: video.description,
    openGraph: {
      title: video.title,
      description: video.description,
      type: "video.other",
      images: video.thumbnailUrl ? [{ url: video.thumbnailUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: video.title,
      description: video.description,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : undefined,
    },
  };
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureBootstrapped();
  const { slug } = await params;

  const [rawProfile, video] = await Promise.all([
    prisma.siteProfile.findUnique({ where: { id: "default" } }),
    prisma.video.findFirst({ where: { slug, visible: true } }),
  ]);

  if (!video || !rawProfile) {
    notFound();
  }

  const profile = serializeProfile(rawProfile);
  const videoItem: VideoItem = {
    ...video,
    recordedDate: video.recordedDate.toISOString(),
    createdAt: video.createdAt.toISOString(),
    updatedAt: video.updatedAt.toISOString(),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        fullName={profile.fullName}
        designation={profile.designation}
        location={profile.location}
      />

      <main className="flex-1 py-10 sm:py-16 bg-[var(--bg-primary)]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/#videos"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-crimson)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Reporting Reels</span>
          </Link>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-wider">
              <span className="px-2.5 py-1 bg-[var(--accent-crimson)] text-white rounded-sm">
                {videoItem.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                <Calendar className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                {formatEditorialDate(videoItem.recordedDate)}
              </span>
              {videoItem.location && (
                <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                  {videoItem.location}
                </span>
              )}
              <span className="text-[var(--text-muted)]">{videoItem.sourceType}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.14]">
              {videoItem.title}
            </h1>
          </div>

          <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2.5 sm:p-4 rounded-sm shadow-sm">
            <VideoEmbedFrame video={videoItem} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
            <div className="md:col-span-8 space-y-4">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Report Summary
              </h2>
              <p className="text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {videoItem.description}
              </p>
            </div>

            <aside className="md:col-span-4 border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 rounded-sm space-y-4 self-start">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
                  Presented By
                </p>
                <p className="font-serif text-lg font-bold text-[var(--text-primary)] mt-0.5">
                  {profile.fullName}
                </p>
                <p className="text-xs text-[var(--text-muted)]">{profile.designation}</p>
              </div>
              <div className="pt-3 border-t border-[var(--border-subtle)]">
                <ShareButtons title={videoItem.title} path={`/videos/${videoItem.slug}`} />
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
