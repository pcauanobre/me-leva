import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "./supabase/types";

interface AuthResult {
  error: string | null;
  user: { id: string; email?: string } | null;
  role: UserRole | null;
}

export async function getAuthWithRole(
  supabase: SupabaseClient
): Promise<AuthResult> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado", user: null, role: null };
  }

  // Use is_admin() which is security definer (bypasses RLS)
  const { data: isAdmin } = await supabase.rpc("is_admin");

  return {
    error: null,
    user,
    role: isAdmin ? "admin" : "user",
  };
}

export async function requireAdmin(supabase: SupabaseClient) {
  const auth = await getAuthWithRole(supabase);
  if (auth.error) return { ...auth, isAdmin: false };
  if (auth.role !== "admin") {
    return { error: "Acesso negado", user: auth.user, role: auth.role, isAdmin: false };
  }
  return { ...auth, isAdmin: true };
}

export async function requireUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autorizado" as string | null, user: null };
  }
  return { error: null, user };
}
