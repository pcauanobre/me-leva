"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function register(formData: FormData) {
  const fullName = formData.get("full_name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const passwordConfirm = formData.get("password_confirm") as string;
  const phone = (formData.get("phone") as string) || null;

  if (!fullName || fullName.length < 2) {
    return { error: "Nome deve ter pelo menos 2 caracteres" };
  }
  if (!email) {
    return { error: "Email é obrigatório" };
  }
  if (!password || password.length < 6) {
    return { error: "Senha deve ter pelo menos 6 caracteres" };
  }
  if (password !== passwordConfirm) {
    return { error: "Senhas não conferem" };
  }

  const supabase = await createServerClient();

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone,
      },
    },
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Este email já está cadastrado." };
    }
    return { error: "Erro ao criar conta: " + error.message };
  }

  // If email confirmation is enabled, session will be null
  if (!data.session) {
    return {
      error:
        "Conta criada! Verifique seu email para confirmar o cadastro antes de fazer login.",
    };
  }

  // Profile is created automatically via database trigger (handle_new_user).
  // As a safety net, ensure profile exists before redirecting.
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: fullName,
        phone,
        role: "user",
      });
    }
  }

  return { success: true };
}
