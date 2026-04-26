import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Animal } from "@/lib/supabase/types";
import {
  Box,
  Container,
  Typography,
  Grid,
  Stack,
  Paper,
  Divider,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Link from "next/link";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AnimalGallery from "@/components/public/AnimalGallery";
import { computeCurrentAge } from "@/lib/utils/computeAge";

const SPECIES_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

const SIZE_LABELS: Record<string, string> = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

const SEX_LABELS: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
};


export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data: animal } = (await supabase
    .from("animals")
    .select("name, species, description, cover_photo")
    .eq("slug", slug)
    .single()) as { data: Pick<Animal, "name" | "species" | "description" | "cover_photo"> | null };

  if (!animal) return { title: "Animal não encontrado" };

  return {
    title: `${animal.name} - ${SPECIES_LABELS[animal.species] ?? animal.species}`,
    description:
      animal.description?.slice(0, 160) ??
      `Conheça ${animal.name}, disponível para adoção em Fortaleza.`,
    openGraph: {
      images: animal.cover_photo ? [animal.cover_photo] : [],
    },
  };
}

export default async function AnimalProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("animals")
    .select("*")
    .eq("slug", slug)
    .single();

  const animal = data as Animal | null;

  if (!animal) {
    notFound();
  }

  const details = [
    { label: "Espécie", value: SPECIES_LABELS[animal.species] ?? animal.species },
    { label: "Raça", value: animal.breed || "Não informada" },
    { label: "Idade", value: computeCurrentAge(animal.age_months, animal.created_at) },
    { label: "Porte", value: animal.size ? SIZE_LABELS[animal.size] : "Não informado" },
    { label: "Sexo", value: SEX_LABELS[animal.sex] ?? animal.sex },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Link href="/animais" style={{ textDecoration: "none" }}>
        <Button
          startIcon={<ArrowBackIcon />}
          color="inherit"
          sx={{ mb: { xs: 1.5, sm: 3 }, minHeight: 44 }}
        >
          Voltar aos animais
        </Button>
      </Link>

      {animal.status === "adotado" && (
        <Paper
          className="animate-slide-in-left"
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            mb: { xs: 2, sm: 3 },
            bgcolor: "#FFF0F5",
            border: "2px solid #E8618C",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <FavoriteIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: "#E8618C" }} />
          <Box>
            <Typography fontWeight={800} color="#C93D6A" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
              {animal.name} foi adotado(a)!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
              Este animal encontrou um lar. Que tal conhecer outros animais disponíveis?
            </Typography>
          </Box>
        </Paper>
      )}

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Gallery */}
        <Grid size={{ xs: 12, md: 7 }} className="animate-fade-in-up">
          <AnimalGallery photos={animal.photo_urls ?? []} name={animal.name} />
        </Grid>

        {/* Info */}
        <Grid size={{ xs: 12, md: 5 }} className="animate-fade-in-up delay-2">
          <Stack spacing={{ xs: 2, sm: 3 }}>
            <Box>
              <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={{ xs: 1, sm: 2 }}>
                <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: "1.75rem", sm: "3rem" } }}>
                  {animal.name}
                </Typography>
              </Stack>
            </Box>

            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <Stack spacing={{ xs: 1, sm: 1.5 }}>
                {details.map((d) => (
                  <Stack
                    key={d.label}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                      {d.label}
                    </Typography>
                    <Typography fontWeight={600} sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                      {d.value}
                    </Typography>
                  </Stack>
                ))}
                <Divider />
                <Stack direction="row" spacing={{ xs: 2, sm: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {animal.neutered ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <CancelIcon color="disabled" fontSize="small" />
                    )}
                    <Typography variant="body2">Castrado</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    {animal.vaccinated ? (
                      <CheckCircleIcon color="success" fontSize="small" />
                    ) : (
                      <CancelIcon color="disabled" fontSize="small" />
                    )}
                    <Typography variant="body2">Vacinado</Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

            {animal.description && (
              <Box>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                  Sobre {animal.name}
                </Typography>
                <Typography color="text.secondary" whiteSpace="pre-line" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                  {animal.description}
                </Typography>
              </Box>
            )}

            {/* Adoption CTA - only show for non-adopted */}
            {animal.status !== "adotado" && (
              <Box id="interesse" sx={{ mt: { xs: 2, sm: 3 }, textAlign: "center" }}>
                <Link
                  href={`/adotar?animal=${animal.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<FavoriteIcon />}
                    sx={{
                      minHeight: 56,
                      fontWeight: 700,
                      fontSize: { xs: "0.95rem", sm: "1.05rem" },
                      borderRadius: 3,
                      py: 1.5,
                    }}
                  >
                    Quero adotar {animal.name}
                  </Button>
                </Link>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 1 }}
                >
                  Preencha o formulário completo para iniciar o processo de adoção.
                </Typography>
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}
