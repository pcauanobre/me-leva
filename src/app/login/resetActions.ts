"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function sendResetEmail(email: string) {
  if (!email?.trim()) {
    return { error: "Informe seu email" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    console.error("Reset email error:", error);
    return { error: `Erro: ${error.message}` };
  }

  return { success: true };
}

export async function verifyResetCode(email: string, code: string) {
  if (!code || code.length < 6) {
    return { error: "Código inválido" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "recovery",
  });

  if (error) {
    return { error: "Código inválido ou expirado. Tente novamente." };
  }

  return { success: true };
}

export async function updatePassword(newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: "A senha deve ter pelo menos 6 caracteres" };
  }

  const supabase = await createServerClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { error: "Erro ao redefinir senha: " + error.message };
  }

  await supabase.auth.signOut();
  return { success: true };
}
