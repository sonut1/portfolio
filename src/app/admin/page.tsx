import React from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { getAdminSession } from "@/lib/auth";
import { serializeProfile } from "@/lib/profile-parser";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import type {
  ArticleItem,
  ContactMessageItem,
  GalleryItem,
  VideoItem,
} from "@/types/portfolio";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  await ensureBootstrapped();

  const [rawProfile, rawVideos, rawArticles, rawGallery, rawMessages] =
    await Promise.all([
      prisma.siteProfile.findUnique({ where: { id: "default" } }),
      prisma.video.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.article.findMany({
        include: {
          relatedVideo: { select: { id: true, slug: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } }),
    ]);

  if (!rawProfile) {
    throw new Error("Profile initialization failed.");
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
  const messages: ContactMessageItem[] = rawMessages.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <AdminDashboardClient
      adminName={session.name}
      adminEmail={session.email}
      initialProfile={profile}
      initialVideos={videos}
      initialArticles={articles}
      initialGallery={gallery}
      initialMessages={messages}
    />
  );
}
