"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { submissionSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils/slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSubmission(formData: FormData) {
  const supabase = await createServerClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  const raw = Object.fromEntries(formData.entries());
  const parsed = submissionSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const tempSlug = slugify(data.name, crypto.randomUUID().slice(0, 8));

  const { data: animal, error } = await supabase
    .from("animals")
    .insert({
      name: data.name,
      slug: tempSlug,
      species: data.species,
      breed: data.breed || null,
      age_months: data.age_months ?? null,
      size: data.size || null,
      sex: data.sex,
      neutered: data.neutered,
      vaccinated: data.vaccinated,
      description: data.description || null,
      status: "disponivel",
      photo_urls: [],
      cover_photo: null,
      submitted_by: auth.user!.id,
      submission_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Erro ao enviar solicitação: " + error.message };
  }

  const finalSlug = slugify(data.name, animal.id);
  await supabase
    .from("animals")
    .update({ slug: finalSlug })
    .eq("id", animal.id);

  revalidatePath("/minha-conta");
  redirect(`/minha-conta/${animal.id}`);
}

export async function updateSubmission(id: string, formData: FormData) {
  const supabase = await createServerClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  // Verify ownership and rejected status
  const { data: existing } = await supabase
    .from("animals")
    .select("submitted_by, submission_status")
    .eq("id", id)
    .single();

  if (!existing || existing.submitted_by !== auth.user!.id) {
    return { error: "Solicitação não encontrada" };
  }
  if (existing.submission_status !== "rejected") {
    return { error: "Apenas solicitações rejeitadas podem ser editadas" };
  }

  const raw = Object.fromEntries(formData.entries());
  const parsed = submissionSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const data = parsed.data;
  const slug = slugify(data.name, id);

  const { error } = await supabase
    .from("animals")
    .update({
      name: data.name,
      slug,
      species: data.species,
      breed: data.breed || null,
      age_months: data.age_months ?? null,
      size: data.size || null,
      sex: data.sex,
      neutered: data.neutered,
      vaccinated: data.vaccinated,
      description: data.description || null,
      submission_status: "pending",
      admin_feedback: null,
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar: " + error.message };
  }

  revalidatePath("/minha-conta");
  revalidatePath(`/minha-conta/${id}`);
  return { success: true };
}

export async function uploadSubmissionPhotos(
  animalId: string,
  formData: FormData
) {
  const supabase = await createServerClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  // Verify ownership
  const { data: existing } = await supabase
    .from("animals")
    .select("submitted_by, photo_urls")
    .eq("id", animalId)
    .single();

  const row = existing as { submitted_by: string | null; photo_urls: string[] | null } | null;

  if (!row || row.submitted_by !== auth.user!.id) {
    return { error: "Solicitação não encontrada" };
  }

  const files = formData.getAll("photos") as File[];
  if (!files.length) return { error: "Nenhuma foto selecionada" };

  const currentPhotos: string[] = Array.isArray(row.photo_urls) ? row.photo_urls : [];
  if (currentPhotos.length + files.length > 5) {
    return { error: "Máximo de 5 fotos por animal" };
  }

  const newUrls: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `animals/${animalId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("pet-photos")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: "Erro no upload: " + uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("pet-photos")
      .getPublicUrl(path);

    newUrls.push(urlData.publicUrl);
  }

  const allPhotos = [...currentPhotos, ...newUrls];
  const { error } = await supabase
    .from("animals")
    .update({
      photo_urls: allPhotos,
      cover_photo: allPhotos[0],
    })
    .eq("id", animalId);

  if (error) {
    return { error: "Erro ao salvar fotos: " + error.message };
  }

  revalidatePath(`/minha-conta/${animalId}`);
  return { success: true, urls: allPhotos };
}

export async function deleteSubmissionPhoto(
  animalId: string,
  photoUrl: string
) {
  const supabase = await createServerClient();
  const auth = await requireUser(supabase);
  if (auth.error) return { error: auth.error };

  const { data: existingRaw } = await supabase
    .from("animals")
    .select("submitted_by, photo_urls, submission_status")
    .eq("id", animalId)
    .single();

  const existing = existingRaw as {
    submitted_by: string | null;
    photo_urls: string[] | null;
    submission_status: string | null;
  } | null;

  if (!existing || existing.submitted_by !== auth.user!.id) {
    return { error: "Solicitação não encontrada" };
  }

  if (existing.submission_status === "approved") {
    return { error: "Não é possível alterar fotos de solicitações aprovadas" };
  }

  const parts = photoUrl.split("/storage/v1/object/public/pet-photos/");
  const path = parts[1];
  if (path) {
    await supabase.storage.from("pet-photos").remove([path]);
  }

  const currentPhotos: string[] = Array.isArray(existing.photo_urls) ? existing.photo_urls : [];
  const updatedPhotos = currentPhotos.filter((url) => url !== photoUrl);

  const { error } = await supabase
    .from("animals")
    .update({
      photo_urls: updatedPhotos,
      cover_photo: updatedPhotos[0] || null,
    })
    .eq("id", animalId);

  if (error) {
    return { error: "Erro ao remover foto: " + error.message };
  }

  revalidatePath(`/minha-conta/${animalId}`);
  return { success: true };
}
