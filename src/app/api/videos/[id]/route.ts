import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminSession } from "@/lib/auth";
import { deleteLocalUploadedAsset } from "@/lib/storage";
import { getYouTubeThumbnailUrl, isValidExternalVideoUrl } from "@/lib/video-utils";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const video = await prisma.video.findFirst({
      where: { OR: [{ id }, { slug: id }] },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    if (!video.visible) {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: "Video not found." }, { status: 404 });
      }
    }

    return NextResponse.json({ video });
  } catch (error) {
    console.error("GET /api/videos/[id] error:", error);
    return NextResponse.json({ error: "Failed to load video." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await context.params;
    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const body = (await request.json()) as {
      title?: string;
      description?: string;
      category?: string;
      sourceType?: "MP4" | "YOUTUBE" | "INSTAGRAM";
      videoUrl?: string;
      thumbnailUrl?: string | null;
      location?: string | null;
      recordedDate?: string;
      featured?: boolean;
      visible?: boolean;
    };

    const nextSourceType = body.sourceType ?? (existing.sourceType as "MP4" | "YOUTUBE" | "INSTAGRAM");
    const nextVideoUrl = body.videoUrl !== undefined ? body.videoUrl.trim() : existing.videoUrl;

    if (
      (nextSourceType === "YOUTUBE" || nextSourceType === "INSTAGRAM") &&
      !isValidExternalVideoUrl(nextVideoUrl, nextSourceType)
    ) {
      return NextResponse.json(
        { error: `Invalid ${nextSourceType} URL.` },
        { status: 400 }
      );
    }

    let nextThumbnail =
      body.thumbnailUrl !== undefined
        ? body.thumbnailUrl?.trim() || null
        : existing.thumbnailUrl;

    if (!nextThumbnail && nextSourceType === "YOUTUBE") {
      nextThumbnail = getYouTubeThumbnailUrl(nextVideoUrl);
    }

    const updated = await prisma.video.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title.trim() : undefined,
        description: body.description !== undefined ? body.description.trim() : undefined,
        category: body.category !== undefined ? body.category.trim() : undefined,
        sourceType: body.sourceType,
        videoUrl: body.videoUrl !== undefined ? nextVideoUrl : undefined,
        thumbnailUrl: nextThumbnail,
        location:
          body.location !== undefined ? body.location?.trim() || null : undefined,
        recordedDate: body.recordedDate ? new Date(body.recordedDate) : undefined,
        featured: body.featured !== undefined ? Boolean(body.featured) : undefined,
        visible: body.visible !== undefined ? Boolean(body.visible) : undefined,
      },
    });

    revalidatePath("/");
    revalidatePath(`/videos/${updated.slug}`);
    return NextResponse.json({ video: updated });
  } catch (err) {
    console.error("PATCH /api/videos/[id] error:", err);
    return NextResponse.json({ error: "Failed to update video." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await context.params;
    const existing = await prisma.video.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    await prisma.video.delete({ where: { id } });

    if (existing.sourceType === "MP4") {
      await deleteLocalUploadedAsset(existing.videoUrl);
    }
    await deleteLocalUploadedAsset(existing.thumbnailUrl);

    revalidatePath("/");
    revalidatePath(`/videos/${existing.slug}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/videos/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete video." }, { status: 500 });
  }
}
