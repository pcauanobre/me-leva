"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateAdoptionFormStatus(
  id: string,
  status: "pendente" | "aprovado" | "rejeitado",
  adminNotes?: string
) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status !== "pendente") {
    updateData.reviewed_at = new Date().toISOString();
  }

  if (adminNotes !== undefined) {
    updateData.admin_notes = adminNotes;
  }

  const { error } = await supabase
    .from("adoption_forms")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar status: " + error.message };
  }

  revalidatePath("/admin/adocao");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateAdoptionFormData(
  id: string,
  updates: Record<string, unknown>
) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const { error } = await supabase
    .from("adoption_forms")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar formulário: " + error.message };
  }

  revalidatePath("/admin/adocao");
  revalidatePath(`/admin/adocao/${id}`);
  return { success: true };
}

export async function deleteAdoptionForm(id: string) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const { error } = await supabase
    .from("adoption_forms")
    .delete()
    .eq("id", id);

  if (error) {
    return { error: "Erro ao excluir formulário: " + error.message };
  }

  revalidatePath("/admin/adocao");
  revalidatePath("/admin");
  return { success: true };
}
