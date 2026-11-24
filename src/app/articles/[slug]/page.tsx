import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, Calendar, MapPin, Tag, Film } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { safeJsonParse, serializeProfile } from "@/lib/profile-parser";
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
  const article = await prisma.article.findFirst({
    where: { slug, published: true },
  });

  if (!article) {
    return { title: "Story Not Found" };
  }

  return {
    title: article.headline,
    description: article.excerpt,
    openGraph: {
      title: article.headline,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      images: article.coverImageUrl ? [{ url: article.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.headline,
      description: article.excerpt,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureBootstrapped();
  const { slug } = await params;

  const [rawProfile, article] = await Promise.all([
    prisma.siteProfile.findUnique({ where: { id: "default" } }),
    prisma.article.findFirst({
      where: { slug, published: true },
      include: { relatedVideo: true },
    }),
  ]);

  if (!article || !rawProfile) {
    notFound();
  }

  const profile = serializeProfile(rawProfile);
  const tags = safeJsonParse<string[]>(article.tags, []);
  const paragraphs = article.content
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const relatedVideoItem: VideoItem | null = article.relatedVideo
    ? {
        ...article.relatedVideo,
        recordedDate: article.relatedVideo.recordedDate.toISOString(),
        createdAt: article.relatedVideo.createdAt.toISOString(),
        updatedAt: article.relatedVideo.updatedAt.toISOString(),
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        fullName={profile.fullName}
        designation={profile.designation}
        location={profile.location}
      />

      <main className="flex-1 py-10 sm:py-16 bg-[var(--bg-primary)]">
        <article className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--accent-crimson)] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Stories</span>
          </Link>

          <header className="space-y-5 pb-6 border-b border-[var(--border-subtle)]">
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono uppercase tracking-wider">
              <span className="px-2.5 py-1 bg-[var(--accent-crimson)] text-white rounded-sm">
                {article.category}
              </span>
              {article.publishedAt && (
                <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Calendar className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                  {formatEditorialDate(article.publishedAt)}
                </span>
              )}
              {article.location && (
                <span className="inline-flex items-center gap-1.5 text-[var(--text-muted)]">
                  <MapPin className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
                  {article.location}
                </span>
              )}
            </div>

            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.12]">
              {article.headline}
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed font-medium">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={profile.heroImageUrl}
                    alt={profile.fullName}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 rounded-full object-cover object-top border border-[var(--border-subtle)]"
                />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    By {profile.fullName}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {profile.designation}
                  </p>
                </div>
              </div>
              <ShareButtons title={article.headline} path={`/articles/${article.slug}`} />
            </div>
          </header>

          {article.coverImageUrl && (
            <figure className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-2 rounded-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImageUrl}
                alt={article.headline}
                loading="lazy"
                decoding="async"
                className="w-full max-h-[520px] object-cover rounded-sm"
              />
            </figure>
          )}

          <div className="space-y-5 text-base sm:text-lg text-[var(--text-secondary)] leading-[1.8]">
            {paragraphs.map((para, idx) => (
              <p key={idx} className="whitespace-pre-line">
                {para}
              </p>
            ))}
          </div>

          {relatedVideoItem && (
            <section className="pt-8 border-t border-[var(--border-subtle)] space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent-crimson)]">
                <Film className="w-4 h-4" />
                <span>Related Broadcast Reel</span>
              </div>
              <div className="border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 sm:p-5 rounded-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-serif text-xl font-bold text-[var(--text-primary)]">
                    {relatedVideoItem.title}
                  </h2>
                  <Link
                    href={`/videos/${relatedVideoItem.slug}`}
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-crimson)] hover:underline"
                  >
                    Open Video Page →
                  </Link>
                </div>
                <VideoEmbedFrame video={relatedVideoItem} />
              </div>
            </section>
          )}

          {tags.length > 0 && (
            <div className="pt-6 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-[var(--text-muted)] mr-1" />
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-xs font-mono bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] rounded-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
