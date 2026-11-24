import React from "react";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { serializeProfile } from "@/lib/profile-parser";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { VideosSection } from "@/components/sections/VideosSection";
import { ExperienceSkillsSection } from "@/components/sections/ExperienceSkillsSection";
import { ArticlesSection } from "@/components/sections/ArticlesSection";
import { GalleryEducationSection } from "@/components/sections/GalleryEducationSection";
import { ContactSection } from "@/components/sections/ContactSection";
import type { ArticleItem, GalleryItem, VideoItem } from "@/types/portfolio";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureBootstrapped();

  const [rawProfile, rawVideos, rawArticles, rawGallery] = await Promise.all([
    prisma.siteProfile.findUnique({ where: { id: "default" } }),
    prisma.video.findMany({
      where: { visible: true },
      orderBy: [{ featured: "desc" }, { recordedDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.article.findMany({
      where: { published: true },
      include: {
        relatedVideo: {
          select: {
            id: true,
            slug: true,
            title: true,
            sourceType: true,
            videoUrl: true,
            thumbnailUrl: true,
          },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    }),
    prisma.galleryImage.findMany({
      where: { visible: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!rawProfile) {
    throw new Error("Site profile failed to initialize.");
  }

  const profile = serializeProfile(rawProfile);

  const videos: VideoItem[] = rawVideos.map((v) => ({
    ...v,
    recordedDate: v.recordedDate.toISOString(),
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  }));

  const articles: ArticleItem[] = rawArticles.map((a) => ({
    ...a,
    publishedAt: a.publishedAt ? a.publishedAt.toISOString() : null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }));

  const gallery: GalleryItem[] = rawGallery.map((g) => ({
    ...g,
    takenDate: g.takenDate ? g.takenDate.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  }));

  const featuredVideo = videos.find((v) => v.featured) || videos[0] || null;
  const latestArticle = articles[0] || null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        fullName={profile.fullName}
        designation={profile.designation}
        location={profile.location}
      />

      <main className="flex-1">
        <HeroSection
          profile={profile}
          featuredVideo={featuredVideo}
          latestArticle={latestArticle}
        />
        <AboutSection profile={profile} />
        <VideosSection videos={videos} />
        <ExperienceSkillsSection profile={profile} />
        <ArticlesSection articles={articles} />
        <GalleryEducationSection images={gallery} profile={profile} />
        <ContactSection profile={profile} />
      </main>

      <Footer profile={profile} />
    </div>
  );
}
