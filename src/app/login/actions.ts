"use server";

import { createServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createServerClient();

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return {
        error:
          "Seu email ainda não foi confirmado. Verifique sua caixa de entrada.",
      };
    }
    return { error: "Email ou senha inválidos." };
  }

  // Safety net: ensure profile exists (handles users registered before trigger)
  if (data.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: data.user.id,
        full_name: data.user.user_metadata?.full_name || "Usuário",
        phone: data.user.user_metadata?.phone || null,
        role: "user",
      });
    }
  }

  // Check role using security definer function
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (isAdmin) {
    redirect("/admin");
  }

  redirect("/minha-conta");
}

export async function logout() {
  const supabase = await createServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
