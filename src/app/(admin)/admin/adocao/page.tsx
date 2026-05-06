import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import type { AdoptionFormRow } from "@/lib/supabase/types";
import AdocaoClient, { AdoptedAnimal, LinkedForm } from "./AdocaoClient";

export const metadata: Metadata = {
  title: "Adoções",
};

interface AdocaoPageProps {
  searchParams: Promise<{ tab?: string; status?: string }>;
}

export default async function AdocaoPage({ searchParams }: AdocaoPageProps) {
  const params = await searchParams;
  const tab: "candidatos" | "concluidas" =
    params.tab === "concluidas" ? "concluidas" : "candidatos";
  const statusFilter = params.status || "todos";
  const supabase = await createServerClient();

  let forms: AdoptionFormRow[] = [];
  let adoptedList: AdoptedAnimal[] = [];
  let linkedForms: LinkedForm[] = [];

  if (tab === "candidatos") {
    let query = supabase
      .from("adoption_forms")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter !== "todos") {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    forms = (data || []) as AdoptionFormRow[];
  } else {
    const { data: adopted } = await supabase
      .from("animals")
      .select(
        "id, name, slug, species, sex, age_months, cover_photo, photo_urls, adopted_at, created_at",
      )
      .eq("status", "adotado")
      .order("adopted_at", { ascending: false });

    adoptedList = (adopted || []) as AdoptedAnimal[];
    const animalIds = adoptedList.map((a) => a.id);

    if (animalIds.length > 0) {
      const { data: linked } = await supabase
        .from("adoption_forms")
        .select("id, full_name, email, whatsapp, animal_id")
        .in("animal_id", animalIds)
        .eq("status", "aprovado");

      linkedForms = (linked || []) as LinkedForm[];
    }
  }

  return (
    <AdocaoClient
      tab={tab}
      statusFilter={statusFilter}
      forms={forms}
      adoptedList={adoptedList}
      linkedForms={linkedForms}
    />
  );
}
