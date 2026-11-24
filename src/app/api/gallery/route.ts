import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const includeAll = searchParams.get("all") === "1";
    const category = searchParams.get("category")?.trim();

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

    const images = await prisma.galleryImage.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("GET /api/gallery error:", error);
    return NextResponse.json({ error: "Failed to load gallery." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = (await request.json()) as {
      items?: Array<{
        title?: string;
        caption?: string;
        category?: string;
        imageUrl?: string;
        takenDate?: string;
        visible?: boolean;
      }>;
      title?: string;
      caption?: string;
      category?: string;
      imageUrl?: string;
      takenDate?: string;
      visible?: boolean;
    };

    const rawItems = Array.isArray(body.items) ? body.items : [body];
    if (rawItems.length === 0) {
      return NextResponse.json({ error: "No gallery items provided." }, { status: 400 });
    }

    const created = [];
    for (const item of rawItems) {
      const imageUrl = (item.imageUrl || "").trim();
      const category = (item.category || "").trim();
      const caption = (item.caption || "").trim();
      if (!imageUrl || !category || !caption) {
        return NextResponse.json(
          { error: "Image URL, caption, and category are required for each photo." },
          { status: 400 }
        );
      }

      const record = await prisma.galleryImage.create({
        data: {
          title: item.title?.trim() || null,
          caption,
          category,
          imageUrl,
          takenDate: item.takenDate ? new Date(item.takenDate) : null,
          visible: item.visible !== false,
        },
      });
      created.push(record);
    }

    revalidatePath("/");
    return NextResponse.json({ images: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/gallery error:", err);
    return NextResponse.json({ error: "Failed to save gallery image(s)." }, { status: 500 });
  }
}
