import { UAParser } from "ua-parser-js";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { AnalyticsEventType } from "@/lib/supabase/types";

let cachedAdmin: SupabaseClient | null = null;
export function getAnalyticsAdminClient(): SupabaseClient | null {
  if (cachedAdmin) return cachedAdmin;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  cachedAdmin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAdmin;
}

const VALID_EVENT_TYPES: ReadonlySet<AnalyticsEventType> = new Set([
  "page_view",
  "pet_click",
  "pet_view_detail",
  "adoption_form_open",
  "adoption_form_step",
  "adoption_form_submit",
  "adoption_form_abandon",
  "donation_form_open",
  "donation_form_step",
  "donation_form_submit",
  "donation_form_abandon",
  "account_signup_start",
  "account_signup_complete",
  "account_signup_abandon",
  "login",
  "logout",
  "outbound_click",
  "error",
]);

export interface ParsedRequest {
  ip: string | null;
  userAgent: string | null;
  deviceType: string | null;
  browser: string | null;
  os: string | null;
}

export function parseRequest(req: Request): ParsedRequest {
  const headers = req.headers;
  const fwd = headers.get("x-forwarded-for");
  const ip =
    (fwd ? fwd.split(",")[0]?.trim() : null) ||
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    null;
  const ua = headers.get("user-agent");

  let deviceType: string | null = null;
  let browser: string | null = null;
  let os: string | null = null;

  if (ua) {
    try {
      const parser = new UAParser(ua);
      const result = parser.getResult();
      const device = result.device.type;
      if (device) {
        deviceType = device;
      } else {
        deviceType = "desktop";
      }
      const looksLikeBot = /bot|crawler|spider|crawling|preview/i.test(ua);
      if (looksLikeBot) deviceType = "bot";
      browser = result.browser.name ?? null;
      os = result.os.name ?? null;
    } catch {
      // ignore parse errors
    }
  }

  return { ip, userAgent: ua, deviceType, browser, os };
}

export interface SessionUpsertBody {
  id: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  user_id?: string | null;
  is_authenticated?: boolean;
}

export async function upsertSession(
  supabase: SupabaseClient,
  body: SessionUpsertBody,
  parsed: ParsedRequest
): Promise<void> {
  const id = typeof body.id === "string" && body.id.length > 0 ? body.id : null;
  if (!id) return;

  const now = new Date().toISOString();
  const row = {
    id,
    user_id: body.user_id ?? null,
    ip_address: parsed.ip,
    user_agent: parsed.userAgent,
    device_type: parsed.deviceType,
    browser: parsed.browser,
    os: parsed.os,
    referrer: body.referrer ?? null,
    utm_source: body.utm_source ?? null,
    utm_medium: body.utm_medium ?? null,
    utm_campaign: body.utm_campaign ?? null,
    is_authenticated: !!body.is_authenticated,
    last_seen_at: now,
  };

  await supabase
    .from("analytics_sessions")
    .upsert(row, { onConflict: "id" });
}

export interface EventBody {
  session_id: string;
  event_type: string;
  path?: string | null;
  animal_id?: string | null;
  form_step?: number | null;
  duration_ms?: number | null;
  metadata?: Record<string, unknown>;
}

export async function insertEvent(
  supabase: SupabaseClient,
  body: EventBody,
  authedUserId: string | null
): Promise<void> {
  const sessionId =
    typeof body.session_id === "string" && body.session_id.length > 0
      ? body.session_id
      : null;
  if (!sessionId) return;

  const eventType = body.event_type as AnalyticsEventType;
  if (!VALID_EVENT_TYPES.has(eventType)) return;

  const formStep =
    typeof body.form_step === "number" && Number.isFinite(body.form_step)
      ? body.form_step
      : null;
  const durationMs =
    typeof body.duration_ms === "number" && Number.isFinite(body.duration_ms)
      ? Math.max(0, Math.floor(body.duration_ms))
      : null;

  await supabase.from("analytics_events").insert({
    session_id: sessionId,
    user_id: authedUserId,
    event_type: eventType,
    path: typeof body.path === "string" ? body.path.slice(0, 500) : null,
    animal_id: typeof body.animal_id === "string" ? body.animal_id : null,
    form_step: formStep,
    duration_ms: durationMs,
    metadata:
      body.metadata && typeof body.metadata === "object" ? body.metadata : {},
  });

  // Keep the session "alive" for the live-count widget on every event.
  await supabase
    .from("analytics_sessions")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", sessionId);
}
