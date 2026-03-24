import type { Metadata } from "next";
import { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { Box, Container, Typography, Grid } from "@mui/material";
import AnimalCard from "@/components/public/AnimalCard";
import AnimalFilters from "@/components/public/AnimalFilters";

export const metadata: Metadata = {
  title: "Animais para Adoção",
  description:
    "Veja todos os animais resgatados disponíveis para adoção em Fortaleza.",
};

// Age range mapping in months
const AGE_RANGES: Record<string, [number, number]> = {
  filhote: [0, 12],
  jovem: [13, 36],
  adulto: [37, 96],
  idoso: [97, 9999],
};

export default async function AnimaisPage({
  searchParams,
}: {
  searchParams: Promise<{
    especie?: string;
    porte?: string;
    idade?: string;
  }>;
}) {
  const params = await searchParams;
  const supabase = await createServerClient();

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("animals")
    .select("id, name, slug, species, size, status, cover_photo, age_months, created_at, adopted_at")
    .or("submission_status.is.null,submission_status.eq.approved")
    .or(`status.neq.adotado,and(status.eq.adotado,adopted_at.gt.${threeDaysAgo})`);

  if (params.especie) {
    query = query.eq("species", params.especie);
  }
  if (params.porte) {
    query = query.eq("size", params.porte);
  }
  if (params.idade && AGE_RANGES[params.idade]) {
    const [min, max] = AGE_RANGES[params.idade];
    query = query.gte("age_months", min).lte("age_months", max);
  }

  const { data: animals } = await query.order("created_at", {
    ascending: false,
  });

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
      >
        Animais para Adoção
      </Typography>

      <Suspense fallback={null}>
        <AnimalFilters />
      </Suspense>

      {!animals?.length ? (
        <Box sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum animal encontrado com esses filtros.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
          {animals.map((animal) => (
            <Grid key={animal.id} size={{ xs: 6, sm: 6, md: 4 }}>
              <AnimalCard animal={animal} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
