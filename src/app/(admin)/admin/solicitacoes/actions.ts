"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function approveSubmission(id: string) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const { error } = await supabase
    .from("animals")
    .update({
      submission_status: "approved",
      status: "disponivel",
      admin_feedback: null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao aprovar: " + error.message };
  }

  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin");
  revalidatePath("/animais");
  return { success: true };
}

export async function rejectSubmission(id: string, formData: FormData) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const feedback = formData.get("feedback") as string;
  if (!feedback?.trim()) {
    return { error: "Informe o motivo da rejeição" };
  }

  const { error } = await supabase
    .from("animals")
    .update({
      submission_status: "rejected",
      admin_feedback: feedback.trim(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao rejeitar: " + error.message };
  }

  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin");
  return { success: true };
}
