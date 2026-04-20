"use server";

import { createServerClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils/slugify";
import type { DonationRequest } from "@/lib/supabase/types";

export async function acceptDonation(id: string) {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("donation_requests")
    .select("*")
    .eq("id", id)
    .single();

  const donation = data as DonationRequest | null;
  if (!donation) {
    return { error: "Solicitação não encontrada." };
  }

  const slug = slugify(donation.animal_name, id);

  const { data: animal, error: animalError } = await supabase
    .from("animals")
    .insert({
      name: donation.animal_name,
      slug,
      species: donation.species,
      breed: donation.breed || null,
      age_months: donation.age_months ?? null,
      sex: donation.sex,
      neutered: donation.neutered,
      vaccinated: donation.vaccinated,
      description: donation.description,
      status: "disponivel",
      photo_urls: [],
      submission_status: "approved",
    })
    .select("id")
    .single();

  if (animalError) {
    return { error: "Erro ao criar animal. Tente novamente." };
  }

  const { error: updateError } = await supabase
    .from("donation_requests")
    .update({
      status: "aceito",
      converted_animal_id: animal.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return { error: "Animal criado mas erro ao atualizar solicitação." };
  }

  revalidatePath("/admin/doacoes");
  redirect(`/admin/animais/${animal.id}`);
}

export async function rejectDonation(id: string, adminNotes: string) {
  const supabase = await createServerClient();

  const { error } = await supabase
    .from("donation_requests")
    .update({
      status: "recusado",
      admin_notes: adminNotes,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Erro ao recusar solicitação. Tente novamente." };
  }

  revalidatePath("/admin/doacoes");
  revalidatePath(`/admin/doacoes/${id}`);
  return { success: true };
}
