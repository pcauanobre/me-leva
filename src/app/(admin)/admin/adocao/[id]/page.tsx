import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import AdoptionFormDetail from "./AdoptionFormDetail";
import type { AdoptionFormRow, AnimalSpecies } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Detalhe do Candidato",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export interface AvailableAnimal {
  id: string;
  name: string;
  species: AnimalSpecies;
  cover_photo: string | null;
  status: "disponivel" | "adotado";
}

export default async function AdocaoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("adoption_forms")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const form = data as AdoptionFormRow;

  const { data: availableData } = await supabase
    .from("animals")
    .select("id, name, species, cover_photo, status")
    .eq("status", "disponivel")
    .order("name");

  let availableAnimals = (availableData || []) as AvailableAnimal[];

  let linkedAnimal: AvailableAnimal | null = null;
  if (form.animal_id) {
    const exists = availableAnimals.find((a) => a.id === form.animal_id);
    if (!exists) {
      const { data: linkedData } = await supabase
        .from("animals")
        .select("id, name, species, cover_photo, status")
        .eq("id", form.animal_id)
        .single();
      if (linkedData) {
        linkedAnimal = linkedData as AvailableAnimal;
      }
    } else {
      linkedAnimal = exists;
    }
  }

  return (
    <Box>
      <Link href="/admin/adocao">
        <Button startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Voltar
        </Button>
      </Link>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Candidato — {form.full_name}
      </Typography>

      <AdoptionFormDetail
        form={form}
        availableAnimals={availableAnimals}
        linkedAnimal={linkedAnimal}
      />
    </Box>
  );
}
