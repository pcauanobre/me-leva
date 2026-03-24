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
  Checkbox,
  Grid,
  Alert,
  Stack,
  Paper,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import type { Animal } from "@/lib/supabase/types";
import { createAnimal, updateAnimal } from "./actions";

interface Props {
  animal?: Animal;
}

export default function AnimalForm({ animal }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const isEditing = !!animal;

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = isEditing
        ? await updateAnimal(animal.id, formData)
        : await createAnimal(formData);

      if (result && "error" in result && result.error) {
        setError(result.error);
      } else if (isEditing) {
        router.refresh();
      }
    });
  }

  return (
    <Paper sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" action={handleSubmit}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="name"
              label="Nome"
              defaultValue={animal?.name ?? ""}
              required
              fullWidth
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
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="breed"
              label="Raça"
              defaultValue={animal?.breed ?? ""}
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="age_months"
              label="Idade (meses)"
              type="number"
              defaultValue={animal?.age_months ?? ""}
              fullWidth
              slotProps={{ htmlInput: { min: 0 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Porte</InputLabel>
              <Select
                name="size"
                label="Porte"
                defaultValue={animal?.size ?? ""}
              >
                <MenuItem value="">-</MenuItem>
                <MenuItem value="pequeno">Pequeno</MenuItem>
                <MenuItem value="medio">Médio</MenuItem>
                <MenuItem value="grande">Grande</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
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
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                label="Status"
                defaultValue={animal?.status ?? "disponivel"}
              >
                <MenuItem value="disponivel">Disponível</MenuItem>
                <MenuItem value="adotado">Adotado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Stack direction="row" spacing={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="neutered"
                    value="true"
                    defaultChecked={animal?.neutered ?? false}
                  />
                }
                label="Castrado"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="vaccinated"
                    value="true"
                    defaultChecked={animal?.vaccinated ?? false}
                  />
                }
                label="Vacinado"
              />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              name="description"
              label="Descrição"
              defaultValue={animal?.description ?? ""}
              fullWidth
              multiline
              rows={4}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={isPending}
            >
              {isPending
                ? "Salvando..."
                : isEditing
                  ? "Salvar Alterações"
                  : "Criar Animal"}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
