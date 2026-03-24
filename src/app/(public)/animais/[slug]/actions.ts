"use server";

import { createServerClient } from "@/lib/supabase/server";
import { interestFormSchema } from "@/lib/schemas";

export async function submitInterestForm(formData: FormData) {
  const raw = {
    animal_id: formData.get("animal_id"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    message: formData.get("message") ?? "",
    consent: formData.get("consent") === "true",
    website: formData.get("website") ?? "",
  };

  // Honeypot check — bots fill hidden fields, humans don't
  if (raw.website !== "") {
    // Silently reject — no error shown
    return { success: true };
  }

  const parsed = interestFormSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createServerClient();

  const { error } = await supabase.from("interest_forms").insert({
    animal_id: parsed.data.animal_id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    message: parsed.data.message || null,
  });

  if (error) {
    return { error: "Erro ao enviar formulário. Tente novamente." };
  }

  return { success: true };
}
