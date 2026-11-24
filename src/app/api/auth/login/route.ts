import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { setSessionCookie, signSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await ensureBootstrapped();
    const body = (await request.json()) as { email?: string; password?: string };
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    if (!admin || !verifyPassword(password, admin.passwordHash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await signSessionToken({
      userId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      user: { id: admin.id, email: admin.email, name: admin.name },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}
