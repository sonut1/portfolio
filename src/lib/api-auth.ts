import { NextResponse } from "next/server";
import { getAdminSession, AdminSessionPayload } from "./auth";

export async function requireAdmin(): Promise<
  { session: AdminSessionPayload; error: null } | { session: null; error: NextResponse }
> {
  const session = await getAdminSession();
  if (!session) {
    return {
      session: null,
      error: NextResponse.json(
        { error: "Unauthorized. Please sign in as administrator." },
        { status: 401 }
      ),
    };
  }
  return { session, error: null };
}
