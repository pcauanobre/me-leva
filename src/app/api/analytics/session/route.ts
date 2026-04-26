import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import {
  getAnalyticsAdminClient,
  parseRequest,
  upsertSession,
} from "@/lib/analytics/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: true });
    }

    // Read auth from the cookie-based client (only to know who the visitor is)
    const cookieClient = await createServerClient();
    const {
      data: { user },
    } = await cookieClient.auth.getUser();

    // Write with the service-role client to bypass RLS — necessary because
    // anon UPSERT trips Postgres' RLS check on ON CONFLICT.
    const writer = getAnalyticsAdminClient();
    if (!writer) return NextResponse.json({ ok: true });

    const parsed = parseRequest(req);
    await upsertSession(
      writer,
      {
        ...body,
        user_id: user?.id ?? body.user_id ?? null,
        is_authenticated: !!user || !!body.is_authenticated,
      },
      parsed
    );
  } catch {
    // never block UX on analytics
  }
  return NextResponse.json({ ok: true });
}
