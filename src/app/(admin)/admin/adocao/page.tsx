import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import type { AdoptionFormRow } from "@/lib/supabase/types";
import AdocaoClient from "./AdocaoClient";
import type { AdoptedAnimal, LinkedForm } from "./types";

export const metadata: Metadata = {
  title: "Adoções",
};

export const dynamic = "force-dynamic";

interface AdocaoPageProps {
  searchParams: Promise<{ tab?: string; status?: string }>;
}

export default async function AdocaoPage({ searchParams }: AdocaoPageProps) {
  const params = await searchParams;
  const tab: "candidatos" | "concluidas" =
    params.tab === "concluidas" ? "concluidas" : "candidatos";
  const statusFilter = params.status || "todos";

  let forms: AdoptionFormRow[] = [];
  let adoptedList: AdoptedAnimal[] = [];
  let linkedForms: LinkedForm[] = [];

  try {
    const supabase = await createServerClient();

    if (tab === "candidatos") {
      let query = supabase
        .from("adoption_forms")
        .select("*")
        .order("created_at", { ascending: false });

      if (statusFilter !== "todos") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) {
        console.error("[adocao] adoption_forms query error:", error);
      }
      forms = (data || []) as AdoptionFormRow[];
    } else {
      const { data: adopted, error: adoptedErr } = await supabase
        .from("animals")
        .select(
          "id, name, slug, species, sex, age_months, cover_photo, photo_urls, adopted_at, created_at",
        )
        .eq("status", "adotado")
        .order("adopted_at", { ascending: false });

      if (adoptedErr) {
        console.error("[adocao] animals query error:", adoptedErr);
      }

      adoptedList = (adopted || []) as AdoptedAnimal[];
      const animalIds = adoptedList.map((a) => a.id);

      if (animalIds.length > 0) {
        const { data: linked, error: linkedErr } = await supabase
          .from("adoption_forms")
          .select("id, full_name, email, whatsapp, animal_id")
          .in("animal_id", animalIds)
          .eq("status", "aprovado");

        if (linkedErr) {
          console.error("[adocao] linked forms query error:", linkedErr);
        }
        linkedForms = (linked || []) as LinkedForm[];
      }
    }
  } catch (err) {
    console.error("[adocao] fatal error in page:", err);
    if (err instanceof Error) {
      console.error("[adocao] stack:", err.stack);
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
