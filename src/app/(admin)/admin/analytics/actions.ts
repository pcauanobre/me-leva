"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";

export async function deleteAnalyticsSession(sessionId: string) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const { error } = await supabase
    .from("analytics_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) return { error: error.message };

  revalidatePath("/admin/analytics");
  return { success: true };
}

export async function purgeAnalyticsOlderThan(days: number) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { error: eventsError } = await supabase
    .from("analytics_events")
    .delete()
    .lt("created_at", cutoff);
  if (eventsError) return { error: eventsError.message };

  const { error: sessionsError } = await supabase
    .from("analytics_sessions")
    .delete()
    .lt("last_seen_at", cutoff);
  if (sessionsError) return { error: sessionsError.message };

  revalidatePath("/admin/analytics");
  return { success: true };
}
