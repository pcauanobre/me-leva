"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Grid,
  Alert,
  Stack,
  Paper,
  Typography,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import PetsIcon from "@mui/icons-material/Pets";
import InfoIcon from "@mui/icons-material/Info";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import type { Animal } from "@/lib/supabase/types";
import { createSubmission, updateSubmission } from "./actions";

interface Props {
  animal?: Animal;
  isResubmit?: boolean;
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Box
        sx={{
          width: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 },
          borderRadius: 2,
          bgcolor: "primary.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "primary.main",
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function SubmissionForm({ animal, isResubmit }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!animal && isResubmit;

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateSubmission(animal.id, formData)
        : await createSubmission(formData);

      if (result && "error" in result && result.error) {
        setError(result.error);
      } else if (isEditing) {
        router.refresh();
      }
    });
  }

  return (
    <Box component="form" action={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Section 1: Basic info */}
        <Paper className="animate-fade-in-up" sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeader
            icon={<PetsIcon />}
            title="Informações Básicas"
            subtitle="Nome, espécie e características do animal"
          />
          <Grid container spacing={{ xs: 1.5, sm: 2.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="name"
                label="Nome do animal"
                defaultValue={animal?.name ?? ""}
                required
                fullWidth
                placeholder="Ex: Rex, Luna, Mia..."
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Espécie</InputLabel>
                <Select
                  name="species"
                  label="Espécie"
                  defaultValue={animal?.species ?? ""}
                >
                  <MenuItem value="cachorro">Cachorro</MenuItem>
                  <MenuItem value="gato">Gato</MenuItem>
                  <MenuItem value="outro">Outro</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                name="breed"
                label="Raça"
                defaultValue={animal?.breed ?? ""}
                fullWidth
                placeholder="Ex: Vira-lata, Siames..."
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                name="age_months"
                label="Idade (meses)"
                type="number"
                defaultValue={animal?.age_months ?? ""}
                fullWidth
                slotProps={{ htmlInput: { min: 0 } }}
                placeholder="Ex: 12"
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Sexo</InputLabel>
                <Select
                  name="sex"
                  label="Sexo"
                  defaultValue={animal?.sex ?? ""}
                >
                  <MenuItem value="macho">Macho</MenuItem>
                  <MenuItem value="femea">Fêmea</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Porte</InputLabel>
                <Select
                  name="size"
                  label="Porte"
                  defaultValue={animal?.size ?? ""}
                >
                  <MenuItem value="">Não sei</MenuItem>
                  <MenuItem value="pequeno">Pequeno (até 10kg)</MenuItem>
                  <MenuItem value="medio">Médio (10-25kg)</MenuItem>
                  <MenuItem value="grande">Grande (25kg+)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Section 2: Health */}
        <Paper className="animate-fade-in-up delay-2" sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeader
            icon={<MedicalServicesIcon />}
            title="Saúde"
            subtitle="Informações sobre castração e vacinação"
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 1, sm: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  name="neutered"
                  value="true"
                  defaultChecked={animal?.neutered ?? false}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Castrado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    O animal já foi castrado?
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", m: 0 }}
            />
            <FormControlLabel
              control={
                <Switch
                  name="vaccinated"
                  value="true"
                  defaultChecked={animal?.vaccinated ?? false}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    Vacinado
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Esta com vacinas em dia?
                  </Typography>
                </Box>
              }
              sx={{ alignItems: "flex-start", m: 0 }}
            />
          </Stack>
        </Paper>

        {/* Section 3: Description */}
        <Paper className="animate-fade-in-up delay-3" sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeader
            icon={<InfoIcon />}
            title="Descrição"
            subtitle="Conte a história deste animal para atrair adotantes"
          />
          <TextField
            name="description"
            defaultValue={animal?.description ?? ""}
            fullWidth
            multiline
            rows={5}
            placeholder="Descreva a personalidade, comportamento, se convive bem com outros animais ou crianças, como foi resgatado, e qualquer informação que ajude a encontrar um lar ideal..."
            sx={{
              "& .MuiInputBase-root": {
                bgcolor: "grey.50",
              },
            }}
          />
        </Paper>

        {/* Submit */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            disabled={isPending}
            sx={{ px: 4, py: 1.5 }}
          >
            {isPending
              ? "Enviando..."
              : isEditing
                ? "Reenviar Solicitação"
                : "Enviar para Análise"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
