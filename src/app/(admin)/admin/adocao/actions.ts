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
  } else {
    updateData.reviewed_at = null;
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
  revalidatePath(`/admin/adocao/${id}`);
  revalidatePath("/admin/animais");
  revalidatePath("/admin");
  return { success: true };
}

export async function approveAdoptionForm(
  formId: string,
  animalId: string,
  adminNotes?: string
) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const { data: animal, error: animalFetchErr } = await supabase
    .from("animals")
    .select("id, status")
    .eq("id", animalId)
    .single();

  if (animalFetchErr || !animal) {
    return { error: "Animal não encontrado." };
  }
  if (animal.status === "adotado") {
    return { error: "Este animal já está marcado como adotado." };
  }

  const now = new Date().toISOString();

  const formUpdate: Record<string, unknown> = {
    status: "aprovado",
    reviewed_at: now,
    updated_at: now,
    animal_id: animalId,
  };
  if (adminNotes !== undefined) {
    formUpdate.admin_notes = adminNotes;
  }

  const { error: formErr } = await supabase
    .from("adoption_forms")
    .update(formUpdate)
    .eq("id", formId);

  if (formErr) {
    return { error: "Erro ao aprovar formulário: " + formErr.message };
  }

  const { error: animalErr } = await supabase
    .from("animals")
    .update({
      status: "adotado",
      adopted_at: now,
      updated_at: now,
    })
    .eq("id", animalId);

  if (animalErr) {
    await supabase
      .from("adoption_forms")
      .update({ status: "pendente", reviewed_at: null, updated_at: now })
      .eq("id", formId);
    return {
      error: "Erro ao marcar animal como adotado: " + animalErr.message,
    };
  }

  revalidatePath("/admin/adocao");
  revalidatePath(`/admin/adocao/${formId}`);
  revalidatePath("/admin/animais");
  revalidatePath(`/admin/animais/${animalId}`);
  revalidatePath("/admin");
  revalidatePath("/animais");
  revalidatePath("/");
  return { success: true };
}

export async function revertAdoption(
  animalId: string,
  alsoReopenForm: boolean
) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const now = new Date().toISOString();

  const { error: animalErr } = await supabase
    .from("animals")
    .update({
      status: "disponivel",
      adopted_at: null,
      updated_at: now,
    })
    .eq("id", animalId);

  if (animalErr) {
    return { error: "Erro ao reverter adoção: " + animalErr.message };
  }

  if (alsoReopenForm) {
    await supabase
      .from("adoption_forms")
      .update({ status: "pendente", reviewed_at: null, updated_at: now })
      .eq("animal_id", animalId)
      .eq("status", "aprovado");
  }

  revalidatePath("/admin/adocao");
  revalidatePath("/admin/animais");
  revalidatePath(`/admin/animais/${animalId}`);
  revalidatePath("/admin");
  revalidatePath("/animais");
  revalidatePath("/");
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
