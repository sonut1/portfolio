import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = await context.params;
    const body = (await request.json()) as { read?: boolean };

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { read: Boolean(body.read) },
    });

    return NextResponse.json({ message: updated });
  } catch (err) {
    console.error("PATCH /api/contact/[id] error:", err);
    return NextResponse.json({ error: "Failed to update message." }, { status: 500 });
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
    await prisma.contactMessage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/contact/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete message." }, { status: 500 });
  }
}
