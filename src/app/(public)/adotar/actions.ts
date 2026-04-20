"use server";

import { createServerClient } from "@/lib/supabase/server";
import { adoptionFormSchema } from "@/lib/schemas";
import { ALL_QUESTION_KEYS } from "@/lib/adoptionQuestions";

export async function submitAdoptionForm(formData: FormData) {
  // Honeypot check
  const website = formData.get("website") as string;
  if (website && website !== "") {
    return { success: true };
  }

  const interviewRaw = formData.get("interview_answers") as string;
  let interviewAnswers: Record<string, string> = {};
  try {
    interviewAnswers = JSON.parse(interviewRaw || "{}");
  } catch {
    return { error: "Dados do formulário inválidos." };
  }

  const raw = {
    email: formData.get("email") as string,
    whatsapp: formData.get("whatsapp") as string,
    full_name: formData.get("full_name") as string,
    social_media: formData.get("social_media") as string,
    address: formData.get("address") as string,
    age: formData.get("age") as string,
    marital_status: formData.get("marital_status") as string,
    education_level: formData.get("education_level") as string,
    profession: formData.get("profession") as string,
    animal_species: formData.get("animal_species") as string,
    animal_sex: formData.get("animal_sex") as string,
    animal_age: formData.get("animal_age") as string,
    animal_coat: formData.get("animal_coat") as string,
    interview_answers: interviewAnswers,
    animal_id: (formData.get("animal_id") as string) || null,
    terms_accepted: formData.get("terms_accepted") === "true",
    website: "",
  };

  const parsed = adoptionFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Validate all required interview questions are answered
  for (const key of ALL_QUESTION_KEYS) {
    if (!interviewAnswers[key]?.trim()) {
      return { error: "Todas as perguntas da entrevista são obrigatórias." };
    }
  }

  const supabase = await createServerClient();

  const { error } = await supabase.from("adoption_forms").insert({
    email: parsed.data.email,
    whatsapp: parsed.data.whatsapp,
    full_name: parsed.data.full_name,
    social_media: parsed.data.social_media,
    address: parsed.data.address,
    age: parsed.data.age,
    marital_status: parsed.data.marital_status,
    education_level: parsed.data.education_level,
    profession: parsed.data.profession,
    animal_species: parsed.data.animal_species,
    animal_sex: parsed.data.animal_sex,
    animal_age: parsed.data.animal_age,
    animal_coat: parsed.data.animal_coat,
    interview_answers: parsed.data.interview_answers,
    animal_id: parsed.data.animal_id || null,
    terms_accepted: parsed.data.terms_accepted,
  });

  if (error) {
    return { error: "Erro ao enviar formulário. Tente novamente." };
  }

  return { success: true };
}
