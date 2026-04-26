import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAnalyticsAdminClient, insertEvent } from "@/lib/analytics/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: true });
    }

    const cookieClient = await createServerClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    const writer = getAnalyticsAdminClient();
    if (!writer) return NextResponse.json({ ok: true });

    await insertEvent(writer, body, user?.id ?? null);
  } catch {
    // never block UX on analytics
  }
  return NextResponse.json({ ok: true });
}
