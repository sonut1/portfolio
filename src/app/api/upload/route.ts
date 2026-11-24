import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { MediaKind, storeMediaFile } from "@/lib/storage";

export async function POST(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const rawKind = (formData.get("kind") as string | null) || "image";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    if (rawKind !== "image" && rawKind !== "video" && rawKind !== "document") {
      return NextResponse.json({ error: "Invalid media kind." }, { status: 400 });
    }

    const result = await storeMediaFile(file, rawKind as MediaKind);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
