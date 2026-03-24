import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Box, Typography, Stack, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import AnimalForm from "../AnimalForm";
import PhotoUploader from "../PhotoUploader";
import type { Animal } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Editar Animal",
};

export default async function EditAnimalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("animals")
    .select("*")
    .eq("id", id)
    .single();

  const animal = data as Animal | null;

  if (!animal) {
    notFound();
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Link href="/admin/animais" style={{ textDecoration: "none" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            color="inherit"
          >
            Voltar
          </Button>
        </Link>
        <Typography variant="h4" fontWeight={700}>
          Editar: {animal.name}
        </Typography>
      </Stack>

      <Stack spacing={3}>
        <PhotoUploader animalId={animal.id} photos={animal.photo_urls ?? []} />
        <AnimalForm animal={animal} />
      </Stack>
    </Box>
  );
}
