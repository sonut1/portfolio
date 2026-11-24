import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/video-utils";

async function uniqueArticleSlug(headline: string): Promise<string> {
  const base = slugify(headline);
  let candidate = base;
  let counter = 1;
  while (await prisma.article.findUnique({ where: { slug: candidate } })) {
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
      where.published = true;
    }
    if (category && category !== "All") {
      where.category = category;
    }
    if (q) {
      where.OR = [
        { headline: { contains: q } },
        { excerpt: { contains: q } },
        { location: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        relatedVideo: {
          select: { id: true, slug: true, title: true, sourceType: true, videoUrl: true, thumbnailUrl: true },
        },
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("GET /api/articles error:", error);
    return NextResponse.json({ error: "Failed to load articles." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      headline?: string;
      excerpt?: string;
      content?: string;
      coverImageUrl?: string | null;
      category?: string;
      tags?: string[] | string;
      location?: string | null;
      relatedVideoId?: string | null;
      published?: boolean;
      publishedAt?: string | null;
    };

    const headline = (body.headline || "").trim();
    const excerpt = (body.excerpt || "").trim();
    const content = (body.content || "").trim();
    const category = (body.category || "").trim();

    if (!headline || !excerpt || !content || !category) {
      return NextResponse.json(
        { error: "Headline, short introduction, full article content, and category are required." },
        { status: 400 }
      );
    }

    const tagsArray = Array.isArray(body.tags)
      ? body.tags.map((t) => t.trim()).filter(Boolean)
      : typeof body.tags === "string"
        ? body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    const published = Boolean(body.published);
    const publishedAt = published
      ? body.publishedAt
        ? new Date(body.publishedAt)
        : new Date()
      : null;

    const slug = await uniqueArticleSlug(headline);

    const article = await prisma.article.create({
      data: {
        slug,
        headline,
        excerpt,
        content,
        coverImageUrl: body.coverImageUrl?.trim() || null,
        category,
        tags: JSON.stringify(tagsArray),
        location: body.location?.trim() || null,
        relatedVideoId: body.relatedVideoId?.trim() || null,
        published,
        publishedAt,
      },
      include: {
        relatedVideo: {
          select: { id: true, slug: true, title: true },
        },
      },
    });

    revalidatePath("/");
    revalidatePath(`/articles/${article.slug}`);
    return NextResponse.json({ article }, { status: 201 });
  } catch (err) {
    console.error("POST /api/articles error:", err);
    return NextResponse.json({ error: "Failed to create article." }, { status: 500 });
  }
}
