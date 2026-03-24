"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function resetPassword(formData: FormData) {
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("password_confirm") as string;

  if (!password || password.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres" };
  }

  if (password !== passwordConfirm) {
    return { error: "As senhas não conferem" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "Erro ao redefinir senha: " + error.message };
  }

  return { success: true };
}
