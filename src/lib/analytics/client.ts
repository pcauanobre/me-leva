"use client";

import type { AnalyticsEventType } from "@/lib/supabase/types";

const SESSION_KEY = "me-leva-session";
const SESSION_TS_KEY = "me-leva-session-ts";
const FORM_OPEN_KEY = "me-leva-form-open";
const FORM_OPEN_TS_KEY = "me-leva-form-open-ts";
const FORM_STEP_KEY = "me-leva-form-step";
const FORM_NAME_KEY = "me-leva-form-name";
const SESSION_TTL_MS = 30 * 60 * 1000;

export interface TrackPayload {
  path?: string;
  animalId?: string;
  formStep?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function getOrCreateSessionId(): string {
  if (!isBrowser()) return "";
  try {
    const now = Date.now();
    const existing = localStorage.getItem(SESSION_KEY);
    const tsRaw = localStorage.getItem(SESSION_TS_KEY);
    const ts = tsRaw ? Number(tsRaw) : 0;
    if (existing && ts && now - ts < SESSION_TTL_MS) {
      localStorage.setItem(SESSION_TS_KEY, String(now));
      return existing;
    }
    const fresh =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${now}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(SESSION_KEY, fresh);
    localStorage.setItem(SESSION_TS_KEY, String(now));
    return fresh;
  } catch {
    return "";
  }
}

function send(url: string, body: unknown): void {
  if (!isBrowser()) return;
  try {
    const payload = JSON.stringify(body);
    if ("sendBeacon" in navigator) {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon(url, blob);
      if (ok) return;
    }
    void fetch(url, {
      method: "POST",
      body: payload,
      headers: { "content-type": "application/json" },
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics never breaks UX
  }
}

export function bumpSession(extras: {
  userId?: string | null;
  isAuthenticated?: boolean;
} = {}): void {
  if (!isBrowser()) return;
  const id = getOrCreateSessionId();
  if (!id) return;
  const url = new URL(window.location.href);
  const utm_source = url.searchParams.get("utm_source");
  const utm_medium = url.searchParams.get("utm_medium");
  const utm_campaign = url.searchParams.get("utm_campaign");
  send("/api/analytics/session", {
    id,
    referrer: document.referrer || null,
    utm_source,
    utm_medium,
    utm_campaign,
    user_id: extras.userId ?? null,
    is_authenticated: !!extras.isAuthenticated,
  });
}

export function track(eventType: AnalyticsEventType, payload: TrackPayload = {}): void {
  if (!isBrowser()) return;
  const id = getOrCreateSessionId();
  if (!id) return;
  send("/api/analytics/event", {
    session_id: id,
    event_type: eventType,
    path: payload.path ?? window.location.pathname,
    animal_id: payload.animalId ?? null,
    form_step: payload.formStep ?? null,
    duration_ms: payload.durationMs ?? null,
    metadata: payload.metadata ?? {},
  });
}

export function trackPageView(path?: string): void {
  track("page_view", { path });
}

export function trackPetClick(animalId: string): void {
  track("pet_click", { animalId });
}

export function trackFormOpen(formName: string): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(FORM_NAME_KEY, formName);
    sessionStorage.setItem(FORM_OPEN_KEY, "1");
    sessionStorage.setItem(FORM_OPEN_TS_KEY, String(Date.now()));
    sessionStorage.setItem(FORM_STEP_KEY, "1");
  } catch {
    // ignore
  }
  track("adoption_form_open", { metadata: { form: formName } });
}

export function trackFormStep(formName: string, step: number): void {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(FORM_STEP_KEY, String(step));
  } catch {
    // ignore
  }
  track("adoption_form_step", { formStep: step, metadata: { form: formName } });
}

export function trackFormSubmit(formName: string, durationMs?: number): void {
  if (!isBrowser()) return;
  let dur = durationMs;
  try {
    if (dur === undefined) {
      const ts = Number(sessionStorage.getItem(FORM_OPEN_TS_KEY) ?? 0);
      if (ts) dur = Date.now() - ts;
    }
    sessionStorage.removeItem(FORM_OPEN_KEY);
    sessionStorage.removeItem(FORM_OPEN_TS_KEY);
    sessionStorage.removeItem(FORM_STEP_KEY);
    sessionStorage.removeItem(FORM_NAME_KEY);
  } catch {
    // ignore
  }
  track("adoption_form_submit", { durationMs: dur, metadata: { form: formName } });
}

export function trackFormAbandonIfOpen(): void {
  if (!isBrowser()) return;
  try {
    if (sessionStorage.getItem(FORM_OPEN_KEY) !== "1") return;
    const ts = Number(sessionStorage.getItem(FORM_OPEN_TS_KEY) ?? 0);
    const step = Number(sessionStorage.getItem(FORM_STEP_KEY) ?? 0);
    const formName = sessionStorage.getItem(FORM_NAME_KEY) ?? "adoption";
    const dur = ts ? Date.now() - ts : null;
    track("adoption_form_abandon", {
      formStep: step || undefined,
      durationMs: dur ?? undefined,
      metadata: { form: formName },
    });
  } catch {
    // ignore
  }
}

export function trackSignup(stage: "start" | "complete"): void {
  track(stage === "start" ? "account_signup_start" : "account_signup_complete");
}

export function trackLogin(): void {
  track("login");
}

export function trackLogout(): void {
  track("logout");
}
