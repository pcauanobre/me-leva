"use server";

import { createServerClient } from "@/lib/supabase/server";
import { donationRequestSchema } from "@/lib/schemas";

export async function submitDonationRequest(formData: FormData) {
  const website = formData.get("website") as string;
  if (website && website !== "") {
    return { success: true };
  }

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    whatsapp: formData.get("whatsapp") as string,
    animal_name: formData.get("animal_name") as string,
    species: formData.get("species") as string,
    breed: formData.get("breed") as string,
    age_months: formData.get("age_months") as string,
    sex: formData.get("sex") as string,
    neutered: formData.get("neutered") === "true",
    vaccinated: formData.get("vaccinated") === "true",
    description: formData.get("description") as string,
    donation_reason: formData.get("donation_reason") as string,
    urgency: formData.get("urgency") as string,
    terms_accepted: formData.get("terms_accepted") === "true",
    website: "",
  };

  const parsed = donationRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createServerClient();

  const { error } = await supabase.from("donation_requests").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp,
    animal_name: parsed.data.animal_name,
    species: parsed.data.species,
    breed: parsed.data.breed || null,
    age_months: parsed.data.age_months ?? null,
    sex: parsed.data.sex,
    neutered: parsed.data.neutered,
    vaccinated: parsed.data.vaccinated,
    description: parsed.data.description,
    donation_reason: parsed.data.donation_reason,
    urgency: parsed.data.urgency,
    terms_accepted: parsed.data.terms_accepted,
  });

  if (error) {
    return { error: "Erro ao enviar solicitação. Tente novamente." };
  }

  return { success: true };
}
