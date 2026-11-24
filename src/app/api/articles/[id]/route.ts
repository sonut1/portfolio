import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminSession } from "@/lib/auth";
import { deleteLocalUploadedAsset } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const article = await prisma.article.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      include: {
        relatedVideo: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    if (!article.published) {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: "Article not found." }, { status: 404 });
      }
    }

    return NextResponse.json({ article });
  } catch (error) {
    console.error("GET /api/articles/[id] error:", error);
    return NextResponse.json({ error: "Failed to load article." }, { status: 500 });
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
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

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

    let tagsString: string | undefined;
    if (body.tags !== undefined) {
      const tagsArray = Array.isArray(body.tags)
        ? body.tags.map((t) => t.trim()).filter(Boolean)
        : body.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
      tagsString = JSON.stringify(tagsArray);
    }

    let nextPublishedAt: Date | null | undefined = undefined;
    if (body.published !== undefined) {
      if (body.published) {
        nextPublishedAt = body.publishedAt
          ? new Date(body.publishedAt)
          : existing.publishedAt ?? new Date();
      } else {
        nextPublishedAt = null;
      }
    } else if (body.publishedAt) {
      nextPublishedAt = new Date(body.publishedAt);
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        headline: body.headline !== undefined ? body.headline.trim() : undefined,
        excerpt: body.excerpt !== undefined ? body.excerpt.trim() : undefined,
        content: body.content !== undefined ? body.content.trim() : undefined,
        coverImageUrl:
          body.coverImageUrl !== undefined
            ? body.coverImageUrl?.trim() || null
            : undefined,
        category: body.category !== undefined ? body.category.trim() : undefined,
        tags: tagsString,
        location:
          body.location !== undefined ? body.location?.trim() || null : undefined,
        relatedVideoId:
          body.relatedVideoId !== undefined
            ? body.relatedVideoId?.trim() || null
            : undefined,
        published: body.published !== undefined ? Boolean(body.published) : undefined,
        publishedAt: nextPublishedAt,
      },
      include: {
        relatedVideo: { select: { id: true, slug: true, title: true } },
      },
    });

    revalidatePath("/");
    revalidatePath(`/articles/${updated.slug}`);
    return NextResponse.json({ article: updated });
  } catch (err) {
    console.error("PATCH /api/articles/[id] error:", err);
    return NextResponse.json({ error: "Failed to update article." }, { status: 500 });
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
    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }

    await prisma.article.delete({ where: { id } });
    await deleteLocalUploadedAsset(existing.coverImageUrl);

    revalidatePath("/");
    revalidatePath(`/articles/${existing.slug}`);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/articles/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete article." }, { status: 500 });
  }
}
