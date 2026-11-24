import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { deleteLocalUploadedAsset } from "@/lib/storage";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as {
      title?: string | null;
      caption?: string;
      category?: string;
      visible?: boolean;
    };

    const updated = await prisma.galleryImage.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title?.trim() || null : undefined,
        caption: body.caption !== undefined ? body.caption.trim() : undefined,
        category: body.category !== undefined ? body.category.trim() : undefined,
        visible: body.visible !== undefined ? Boolean(body.visible) : undefined,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ image: updated });
  } catch (err) {
    console.error("PATCH /api/gallery/[id] error:", err);
    return NextResponse.json({ error: "Failed to update gallery image." }, { status: 500 });
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
    const existing = await prisma.galleryImage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Image not found." }, { status: 404 });
    }

    await prisma.galleryImage.delete({ where: { id } });
    await deleteLocalUploadedAsset(existing.imageUrl);

    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/gallery/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete gallery image." }, { status: 500 });
  }
}
