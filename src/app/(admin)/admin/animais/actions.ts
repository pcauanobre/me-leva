"use server";

import { createServerClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { animalSchema } from "@/lib/schemas";
import { slugify } from "@/lib/utils/slugify";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAnimal(formData: FormData) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const raw = Object.fromEntries(formData.entries());
  const parsed = animalSchema.safeParse(raw);

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
      status: data.status,
      photo_urls: [],
      cover_photo: null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: "Erro ao criar animal: " + error.message };
  }

  const finalSlug = slugify(data.name, animal.id);
  await supabase
    .from("animals")
    .update({ slug: finalSlug })
    .eq("id", animal.id);

  revalidatePath("/admin/animais");
  revalidatePath("/animais");
  redirect(`/admin/animais/${animal.id}`);
}

export async function updateAnimal(id: string, formData: FormData) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const raw = Object.fromEntries(formData.entries());
  const parsed = animalSchema.safeParse(raw);

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
      status: data.status,
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar animal: " + error.message };
  }

  revalidatePath("/admin/animais");
  revalidatePath(`/admin/animais/${id}`);
  revalidatePath("/animais");
  revalidatePath(`/animais/${slug}`);
  return { success: true };
}

export async function deleteAnimal(id: string) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const { data: animal } = await supabase
    .from("animals")
    .select("photo_urls")
    .eq("id", id)
    .single();

  if (animal?.photo_urls?.length) {
    const paths = animal.photo_urls
      .map((url: string) => {
        const parts = url.split("/storage/v1/object/public/pet-photos/");
        return parts[1] || "";
      })
      .filter(Boolean);

    if (paths.length > 0) {
      await supabase.storage.from("pet-photos").remove(paths);
    }
  }

  const { error } = await supabase.from("animals").delete().eq("id", id);

  if (error) {
    return { error: "Erro ao excluir animal: " + error.message };
  }

  revalidatePath("/admin/animais");
  revalidatePath("/animais");
  redirect("/admin/animais");
}

export async function updateAnimalStatus(id: string, status: string) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const updateData: Record<string, unknown> = { status };

  // Set adopted_at when marking as adopted, clear when unmarking
  if (status === "adotado") {
    updateData.adopted_at = new Date().toISOString();
  } else {
    updateData.adopted_at = null;
  }

  const { error } = await supabase
    .from("animals")
    .update(updateData)
    .eq("id", id);

  if (error) {
    return { error: "Erro ao atualizar status: " + error.message };
  }

  revalidatePath("/admin/animais");
  revalidatePath("/admin");
  revalidatePath("/animais");
  revalidatePath("/");
  return { success: true };
}

export async function uploadPhotos(animalId: string, formData: FormData) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const files = formData.getAll("photos") as File[];
  if (!files.length) return { error: "Nenhuma foto selecionada" };

  const { data: animal } = await supabase
    .from("animals")
    .select("photo_urls")
    .eq("id", animalId)
    .single();

  const currentPhotos = animal?.photo_urls ?? [];
  if (currentPhotos.length + files.length > 5) {
    return { error: "Maximo de 5 fotos por animal" };
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

  revalidatePath(`/admin/animais/${animalId}`);
  revalidatePath("/animais");
  return { success: true, urls: allPhotos };
}

export async function deletePhoto(animalId: string, photoUrl: string) {
  const supabase = await createServerClient();
  const auth = await requireAdmin(supabase);
  if (auth.error) return { error: auth.error };

  const parts = photoUrl.split("/storage/v1/object/public/pet-photos/");
  const path = parts[1];
  if (path) {
    await supabase.storage.from("pet-photos").remove([path]);
  }

  const { data: animal } = await supabase
    .from("animals")
    .select("photo_urls")
    .eq("id", animalId)
    .single();

  const updatedPhotos = (animal?.photo_urls ?? []).filter(
    (url: string) => url !== photoUrl
  );

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

  revalidatePath(`/admin/animais/${animalId}`);
  revalidatePath("/animais");
  return { success: true };
}
