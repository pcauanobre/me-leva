import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
  Grid,
  Chip,
  Alert,
  Divider,
  Avatar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import PhoneIcon from "@mui/icons-material/Phone";
import PetsIcon from "@mui/icons-material/Pets";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InfoIcon from "@mui/icons-material/Info";
import MaleIcon from "@mui/icons-material/Male";
import FemaleIcon from "@mui/icons-material/Female";
import StarIcon from "@mui/icons-material/Star";
import type { Animal } from "@/lib/supabase/types";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";
import SubmissionReviewCard from "../SubmissionReviewCard";

export const metadata: Metadata = {
  title: "Revisar Solicitação",
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

export default async function ReviewSubmissionPage({
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

  if (!animal || !animal.submission_status) {
    notFound();
  }

  // Get submitter profile
  let submitter: { full_name: string; phone: string | null } | null = null;
  if (animal.submitted_by) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", animal.submitted_by)
      .single();
    submitter = profileData as { full_name: string; phone: string | null } | null;
  }

  const isPending = animal.submission_status === "pending";
  const isApproved = animal.submission_status === "approved";
  const isRejected = animal.submission_status === "rejected";
  const photos = animal.photo_urls ?? [];

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Link href="/admin/solicitacoes" style={{ textDecoration: "none" }}>
            <Button startIcon={<ArrowBackIcon />} color="inherit" size="small">
              Voltar
            </Button>
          </Link>
          <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", sm: "block" } }} />
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
              {animal.name}
            </Typography>
            <Chip
              label={isPending ? "Pendente" : isApproved ? "Aprovado" : "Rejeitado"}
              color={isPending ? "warning" : isApproved ? "success" : "error"}
              sx={{ fontWeight: 600 }}
            />
          </Stack>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Left column: Photos */}
        <Grid size={{ xs: 12, md: 7 }} className="animate-fade-in-up">
          <Paper sx={{ p: 0, overflow: "hidden" }}>
            {/* Cover photo large */}
            {photos.length > 0 ? (
              <Box sx={{ position: "relative", width: "100%", aspectRatio: { xs: "4/3", md: "16/10" } }}>
                <Image
                  src={photos[0]}
                  alt={animal.name}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 900px) 100vw, 60vw"
                />
                <Chip
                  icon={<StarIcon />}
                  label="Foto de capa"
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: "#FFD700" },
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  height: 300,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "grey.100",
                }}
              >
                <Stack alignItems="center" spacing={1}>
                  <PhotoCameraIcon sx={{ fontSize: 48, color: "grey.300" }} />
                  <Typography color="text.secondary">Nenhuma foto enviada</Typography>
                </Stack>
              </Box>
            )}

            {/* Thumbnail strip */}
            {photos.length > 1 && (
              <Stack direction="row" gap={1} sx={{ p: 1.5, overflowX: "auto" }}>
                {photos.slice(1).map((url, i) => (
                  <Box
                    key={url}
                    sx={{
                      position: "relative",
                      width: 100,
                      height: 100,
                      flexShrink: 0,
                      borderRadius: 1.5,
                      overflow: "hidden",
                      border: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Image
                      src={url}
                      alt={`Foto ${i + 2}`}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="100px"
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Description */}
          {animal.description && (
            <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <InfoIcon color="primary" fontSize="small" />
                <Typography variant="h6" fontWeight={700}>
                  Descrição
                </Typography>
              </Stack>
              <Typography whiteSpace="pre-line" color="text.secondary" lineHeight={1.7}>
                {animal.description}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Right column: Details + Actions */}
        <Grid size={{ xs: 12, md: 5 }} className="animate-fade-in-up delay-2">
          <Stack spacing={2.5}>
            {/* Submitter card */}
            {submitter && (
              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  background: "linear-gradient(135deg, #F0E6F6 0%, #F8F0FA 100%)",
                  border: "1px solid",
                  borderColor: "primary.light",
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <PersonIcon sx={{ color: "primary.main" }} />
                  <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                    Enviado por
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      bgcolor: "primary.main",
                      fontWeight: 700,
                    }}
                  >
                    {submitter.full_name[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700} fontSize="1.05rem">
                      {submitter.full_name}
                    </Typography>
                    {submitter.phone && (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatPhoneDisplay(submitter.phone)}
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </Paper>
            )}

            {/* Animal details card */}
            <Paper sx={{ p: { xs: 2, sm: 2.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <PetsIcon color="primary" fontSize="small" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Dados do Animal
                </Typography>
              </Stack>

              <Grid container spacing={1.5}>
                {[
                  {
                    label: "Espécie",
                    value: SPECIES_LABELS[animal.species] ?? animal.species,
                  },
                  { label: "Raça", value: animal.breed || "Não informada" },
                  {
                    label: "Idade",
                    value: animal.age_months
                      ? animal.age_months < 12
                        ? `${animal.age_months} ${animal.age_months === 1 ? "mês" : "meses"}`
                        : `${Math.floor(animal.age_months / 12)} ${Math.floor(animal.age_months / 12) === 1 ? "ano" : "anos"}`
                      : "Não informada",
                  },
                  {
                    label: "Porte",
                    value: SIZE_LABELS[animal.size] ?? animal.size ?? "Não informado",
                  },
                  {
                    label: "Sexo",
                    value: animal.sex === "macho" ? "Macho" : "Fêmea",
                    icon:
                      animal.sex === "macho" ? (
                        <MaleIcon sx={{ fontSize: 16, color: "#3B82F6" }} />
                      ) : (
                        <FemaleIcon sx={{ fontSize: 16, color: "#E8618C" }} />
                      ),
                  },
                ].map((item) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                    <Box
                      sx={{
                        p: { xs: 1, sm: 1.5 },
                        borderRadius: 1.5,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        {"icon" in item && item.icon}
                        <Typography variant="body2" fontWeight={600}>
                          {item.value}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Health badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  label={animal.neutered ? "Castrado" : "Não castrado"}
                  color={animal.neutered ? "success" : "default"}
                  variant={animal.neutered ? "filled" : "outlined"}
                  size="small"
                />
                <Chip
                  label={animal.vaccinated ? "Vacinado" : "Não vacinado"}
                  color={animal.vaccinated ? "success" : "default"}
                  variant={animal.vaccinated ? "filled" : "outlined"}
                  size="small"
                />
              </Stack>
            </Paper>

            {/* Admin feedback (if rejected) */}
            {animal.admin_feedback && (
              <Alert
                severity="error"
                variant="outlined"
                sx={{ borderRadius: 2 }}
              >
                <Typography fontWeight={700} gutterBottom fontSize="0.9rem">
                  Feedback enviado anteriormente:
                </Typography>
                <Typography variant="body2">{animal.admin_feedback}</Typography>
              </Alert>
            )}

            {/* Approve/Reject actions */}
            {isPending && (
              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  border: "2px solid",
                  borderColor: "warning.light",
                  bgcolor: "#FFFBEB",
                }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  color="warning.dark"
                  gutterBottom
                >
                  Aguardando sua decisão
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Revise os dados e fotos acima. Ao aprovar, o animal será publicado no
                  catálogo. Ao rejeitar, o usuário receberá seu feedback.
                </Typography>
                <SubmissionReviewCard animalId={animal.id} />
              </Paper>
            )}

            {isApproved && (
              <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                <Typography fontWeight={600}>
                  Este animal foi aprovado e está visível no catálogo público.
                </Typography>
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
