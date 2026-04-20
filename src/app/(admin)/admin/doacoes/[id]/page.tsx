import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Button,
  Grid,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import type { DonationRequest } from "@/lib/supabase/types";
import DonationReviewPanel from "./DonationReviewPanel";

export const metadata: Metadata = { title: "Solicitação de Doação" };

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SPECIES_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

const SEX_LABELS: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
};

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "warning" as const },
  aceito: { label: "Aceito", color: "success" as const },
  recusado: { label: "Recusado", color: "error" as const },
};

export default async function DonationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("donation_requests")
    .select("*")
    .eq("id", id)
    .single();

  const donation = data as DonationRequest | null;
  if (!donation) notFound();

  const statusCfg = STATUS_CONFIG[donation.status] ?? STATUS_CONFIG.pendente;

  return (
    <Box>
      <Link href="/admin/doacoes" style={{ textDecoration: "none" }}>
        <Button startIcon={<ArrowBackIcon />} color="inherit" sx={{ mb: 2 }}>
          Voltar às solicitações
        </Button>
      </Link>

      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Solicitação de Doação — {donation.animal_name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={statusCfg.label} color={statusCfg.color} />
          {donation.urgency === "urgente" && (
            <Chip label="Urgente" color="error" variant="outlined" />
          )}
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Dados do Tutor
            </Typography>
            <Stack spacing={1.5}>
              <DetailRow label="Nome" value={donation.name} />
              <DetailRow label="Email" value={donation.email} />
              <DetailRow label="WhatsApp" value={donation.whatsapp} />
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Dados do Animal
            </Typography>
            <Stack spacing={1.5}>
              <DetailRow label="Nome" value={donation.animal_name} />
              <DetailRow label="Espécie" value={SPECIES_LABELS[donation.species] ?? donation.species} />
              {donation.breed && <DetailRow label="Raça" value={donation.breed} />}
              {donation.age_months != null && (
                <DetailRow label="Idade" value={`${donation.age_months} meses`} />
              )}
              <DetailRow label="Sexo" value={SEX_LABELS[donation.sex] ?? donation.sex} />
              <Stack direction="row" spacing={2}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {donation.neutered ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="disabled" fontSize="small" />
                  )}
                  <Typography variant="body2">Castrado</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {donation.vaccinated ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <CancelIcon color="disabled" fontSize="small" />
                  )}
                  <Typography variant="body2">Vacinado</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Descrição do Animal
            </Typography>
            <Typography color="text.secondary" whiteSpace="pre-line">
              {donation.description}
            </Typography>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Motivo da Doação
            </Typography>
            <Typography color="text.secondary" whiteSpace="pre-line">
              {donation.donation_reason}
            </Typography>
          </Paper>
        </Grid>

        {donation.status !== "pendente" && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Revisão
              </Typography>
              <Stack spacing={1}>
                {donation.reviewed_at && (
                  <DetailRow label="Revisado em" value={formatDate(donation.reviewed_at)} />
                )}
                {donation.admin_notes && (
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Observações:
                    </Typography>
                    <Typography variant="body2" whiteSpace="pre-line">
                      {donation.admin_notes}
                    </Typography>
                  </Box>
                )}
                {donation.converted_animal_id && (
                  <Box>
                    <Link href={`/admin/animais/${donation.converted_animal_id}`} style={{ textDecoration: "none" }}>
                      <Button variant="outlined" size="small">
                        Ver animal criado
                      </Button>
                    </Link>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="caption" color="text.secondary">
        Solicitação recebida em {formatDate(donation.created_at)}
      </Typography>

      {donation.status === "pendente" && (
        <DonationReviewPanel donationId={donation.id} />
      )}
    </Box>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}
