import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { requireAdmin } from "@/lib/api-auth";
import { serializeProfile } from "@/lib/profile-parser";

export async function GET() {
  try {
    await ensureBootstrapped();
    const profile = await prisma.siteProfile.findUnique({
      where: { id: "default" },
    });
    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }
    return NextResponse.json({ profile: serializeProfile(profile) });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ error: "Failed to load profile." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    await ensureBootstrapped();
    const body = (await request.json()) as Record<string, unknown>;

    const stringField = (key: string, fallback?: string): string | undefined => {
      const val = body[key];
      if (typeof val === "string") return val.trim();
      return fallback;
    };

    const updated = await prisma.siteProfile.update({
      where: { id: "default" },
      data: {
        fullName: stringField("fullName") || undefined,
        designation: stringField("designation") || undefined,
        headline: stringField("headline") || undefined,
        heroIntro: stringField("heroIntro") ?? undefined,
        biography: stringField("biography") ?? undefined,
        aboutHighlights: Array.isArray(body.aboutHighlights)
          ? JSON.stringify(body.aboutHighlights.map(String).filter((s) => s.trim()))
          : undefined,
        heroImageUrl: stringField("heroImageUrl") || undefined,
        aboutImageUrl: stringField("aboutImageUrl") || undefined,
        resumeUrl:
          body.resumeUrl === null
            ? null
            : typeof body.resumeUrl === "string"
              ? body.resumeUrl.trim() || null
              : undefined,
        location: stringField("location") ?? undefined,
        email: typeof body.email === "string" ? body.email.trim() : undefined,
        phone: typeof body.phone === "string" ? body.phone.trim() : undefined,
        instagramUrl:
          typeof body.instagramUrl === "string" ? body.instagramUrl.trim() : undefined,
        linkedinUrl:
          typeof body.linkedinUrl === "string" ? body.linkedinUrl.trim() : undefined,
        youtubeUrl:
          typeof body.youtubeUrl === "string" ? body.youtubeUrl.trim() : undefined,
        internshipChannel: stringField("internshipChannel") ?? undefined,
        internshipRole: stringField("internshipRole") ?? undefined,
        internshipDuration: stringField("internshipDuration") ?? undefined,
        internshipPoints: Array.isArray(body.internshipPoints)
          ? JSON.stringify(body.internshipPoints.map(String).filter((s) => s.trim()))
          : undefined,
        educationJson: Array.isArray(body.education)
          ? JSON.stringify(body.education)
          : undefined,
        skillsJson: Array.isArray(body.skills) ? JSON.stringify(body.skills) : undefined,
      },
    });

    revalidatePath("/");
    return NextResponse.json({ profile: serializeProfile(updated) });
  } catch (err) {
    console.error("PUT /api/profile error:", err);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
