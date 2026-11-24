import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminSession } from "@/lib/auth";
import {
  getYouTubeThumbnailUrl,
  isValidExternalVideoUrl,
  slugify,
} from "@/lib/video-utils";

async function uniqueVideoSlug(title: string): Promise<string> {
  const base = slugify(title);
  let candidate = base;
  let counter = 1;
  while (await prisma.video.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${counter++}`;
  }
  return candidate;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const includeAll = searchParams.get("all") === "1";
    const category = searchParams.get("category")?.trim();
    const q = searchParams.get("q")?.trim();

    if (includeAll) {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const where: Record<string, unknown> = {};
    if (!includeAll) {
      where.visible = true;
    }
    if (category && category !== "All") {
      where.category = category;
    }
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      orderBy: [{ featured: "desc" }, { recordedDate: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("GET /api/videos error:", error);
    return NextResponse.json({ error: "Failed to load videos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
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

    const title = (body.title || "").trim();
    const description = (body.description || "").trim();
    const category = (body.category || "").trim();
    const sourceType = body.sourceType;
    const videoUrl = (body.videoUrl || "").trim();

    if (!title || !description || !category || !sourceType || !videoUrl) {
      return NextResponse.json(
        { error: "Title, description, category, source type, and video URL are required." },
        { status: 400 }
      );
    }

    if (sourceType !== "MP4" && sourceType !== "YOUTUBE" && sourceType !== "INSTAGRAM") {
      return NextResponse.json({ error: "Invalid video source type." }, { status: 400 });
    }

    if (
      (sourceType === "YOUTUBE" || sourceType === "INSTAGRAM") &&
      !isValidExternalVideoUrl(videoUrl, sourceType)
    ) {
      return NextResponse.json(
        { error: `Please enter a valid ${sourceType} video/reel URL.` },
        { status: 400 }
      );
    }

    let thumbnailUrl = body.thumbnailUrl?.trim() || null;
    if (!thumbnailUrl && sourceType === "YOUTUBE") {
      thumbnailUrl = getYouTubeThumbnailUrl(videoUrl);
    }

    const recordedDate = body.recordedDate ? new Date(body.recordedDate) : new Date();
    if (Number.isNaN(recordedDate.getTime())) {
      return NextResponse.json({ error: "Invalid recorded date." }, { status: 400 });
    }

    const slug = await uniqueVideoSlug(title);

    const video = await prisma.video.create({
      data: {
        slug,
        title,
        description,
        category,
        sourceType,
        videoUrl,
        thumbnailUrl,
        location: body.location?.trim() || null,
        recordedDate,
        featured: Boolean(body.featured),
        visible: body.visible !== false,
      },
    });

    revalidatePath("/");
    revalidatePath(`/videos/${video.slug}`);
    return NextResponse.json({ video }, { status: 201 });
  } catch (err) {
    console.error("POST /api/videos error:", err);
    return NextResponse.json({ error: "Failed to create video." }, { status: 500 });
  }
}
