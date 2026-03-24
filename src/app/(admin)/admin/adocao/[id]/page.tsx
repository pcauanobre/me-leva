import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import AdoptionFormDetail from "./AdoptionFormDetail";
import type { AdoptionFormRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Detalhe do Formulário de Adoção",
};

interface PageProps {
  params: Promise<{ id: string }>;
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

  return (
    <Box>
      <Link href="/admin/adocao">
        <Button startIcon={<ArrowBackIcon />} sx={{ mb: 2 }}>
          Voltar
        </Button>
      </Link>

      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Formulário de {form.full_name}
      </Typography>

      <AdoptionFormDetail form={form} />
    </Box>
  );
}
