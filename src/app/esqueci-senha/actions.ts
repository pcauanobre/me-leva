"use server";

import { createServerClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function sendResetEmail(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Informe seu email" };
  }

  const supabase = await createServerClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || headersList.get("x-forwarded-host") || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/redefinir-senha`,
  });

  if (error) {
    return { error: "Erro ao enviar email. Verifique se o email está correto." };
  }

  return { success: true };
}
