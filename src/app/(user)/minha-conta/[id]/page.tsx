import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Stack,
  Button,
  Alert,
  Paper,
  Chip,
  Grid,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PetsIcon from "@mui/icons-material/Pets";
import type { Animal } from "@/lib/supabase/types";
import SubmissionForm from "../SubmissionForm";
import SubmissionPhotoUploader from "../SubmissionPhotoUploader";

export const metadata: Metadata = {
  title: "Solicitação",
};

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

function formatAge(months: number | null): string {
  if (!months) return "Não informada";
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
  return `${years}a ${rem}m`;
}

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("animals")
    .select("*")
    .eq("id", id)
    .eq("submitted_by", user!.id)
    .single();

  const animal = data as Animal | null;

  if (!animal) {
    notFound();
  }

  const isRejected = animal.submission_status === "rejected";
  const isPending = animal.submission_status === "pending";
  const isApproved = animal.submission_status === "approved";

  return (
    <Box className="animate-fade-in-up">
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Link href="/minha-conta" style={{ textDecoration: "none" }}>
          <Button
            startIcon={<ArrowBackIcon />}
            color="inherit"
            size="small"
          >
            Voltar
          </Button>
        </Link>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            bgcolor: isPending
              ? "warning.light"
              : isApproved
                ? "success.light"
                : "error.light",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PetsIcon
            sx={{
              fontSize: 28,
              color: isPending
                ? "warning.dark"
                : isApproved
                  ? "success.dark"
                  : "error.dark",
            }}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
              {animal.name}
            </Typography>
            <Chip
              label={
                isPending
                  ? "Em Análise"
                  : isApproved
                    ? "Aprovado"
                    : "Ajustes Necessários"
              }
              color={isPending ? "warning" : isApproved ? "success" : "error"}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {SPECIES_LABELS[animal.species] ?? animal.species}
            {animal.breed ? ` - ${animal.breed}` : ""}
          </Typography>
        </Box>
      </Stack>

      {/* Status banners */}
      {isPending && (
        <Card
          sx={{
            mb: 3,
            bgcolor: "warning.50",
            border: "1px solid",
            borderColor: "warning.200",
            boxShadow: "none",
          }}
        >
          <CardContent
            sx={{ display: "flex", alignItems: "center", gap: 2, py: { xs: 1.5, sm: 2 } }}
          >
            <HourglassTopIcon color="warning" sx={{ fontSize: { xs: 24, sm: 32 } }} />
            <Box>
              <Typography fontWeight={700} color="warning.dark">
                Solicitação em análise
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A administradora está revisando os dados e fotos. Você pode
                adicionar ou remover fotos enquanto aguarda.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {isApproved && (
        <Card
          sx={{
            mb: 3,
            bgcolor: "success.50",
            border: "1px solid",
            borderColor: "success.200",
            boxShadow: "none",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              py: { xs: 1.5, sm: 2 },
            }}
          >
            <CheckCircleIcon color="success" sx={{ fontSize: { xs: 24, sm: 32 } }} />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700} color="success.dark">
                Aprovado! Animal visível no catálogo.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Adotantes já podem ver o perfil e enviar interesse.
              </Typography>
            </Box>
            <Link
              href={`/animais/${animal.slug}`}
              style={{ textDecoration: "none" }}
            >
              <Button
                variant="contained"
                color="success"
                endIcon={<OpenInNewIcon />}
                size="small"
              >
                Ver no site
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {isRejected && (
        <Card
          sx={{
            mb: 3,
            bgcolor: "error.50",
            border: "1px solid",
            borderColor: "error.200",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <ErrorOutlineIcon color="error" sx={{ fontSize: { xs: 24, sm: 32 }, mt: 0.5 }} />
              <Box>
                <Typography fontWeight={700} color="error.dark" gutterBottom>
                  Ajustes necessários
                </Typography>
                {animal.admin_feedback && (
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: "white",
                      border: "1px solid",
                      borderColor: "error.200",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Feedback da administradora:
                    </Typography>
                    <Typography variant="body2" whiteSpace="pre-line">
                      {animal.admin_feedback}
                    </Typography>
                  </Paper>
                )}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Corrija as informações abaixo e reenvie a solicitação.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Content */}
      <Stack spacing={3}>
        {/* Photos — always editable if pending, always shown */}
        <SubmissionPhotoUploader
          animalId={animal.id}
          photos={animal.photo_urls ?? []}
          readOnly={isApproved}
        />

        {/* Form (editable) or read-only details */}
        {isRejected ? (
          <SubmissionForm animal={animal} isResubmit />
        ) : (
          <Paper sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <PetsIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Dados do Animal
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {[
                { label: "Nome", value: animal.name },
                {
                  label: "Espécie",
                  value: SPECIES_LABELS[animal.species] ?? animal.species,
                },
                { label: "Raça", value: animal.breed || "Não informada" },
                { label: "Idade", value: formatAge(animal.age_months) },
                {
                  label: "Porte",
                  value: animal.size
                    ? SIZE_LABELS[animal.size]
                    : "Não informado",
                },
                { label: "Sexo", value: animal.sex === "macho" ? "Macho" : "Fêmea" },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography fontWeight={600}>{item.value}</Typography>
                </Grid>
              ))}
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Castrado
                </Typography>
                <Typography fontWeight={600}>
                  {animal.neutered ? "Sim" : "Não"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <Typography variant="caption" color="text.secondary">
                  Vacinado
                </Typography>
                <Typography fontWeight={600}>
                  {animal.vaccinated ? "Sim" : "Não"}
                </Typography>
              </Grid>
            </Grid>

            {animal.description && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Descrição
                </Typography>
                <Typography whiteSpace="pre-line" sx={{ mt: 0.5 }}>
                  {animal.description}
                </Typography>
              </>
            )}
          </Paper>
        )}
      </Stack>
    </Box>
  );
}
