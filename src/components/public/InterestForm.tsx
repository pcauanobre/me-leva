"use client";

import { useState, useTransition } from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  FormControlLabel,
  Checkbox,
  Typography,
  Stack,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Link from "next/link";
import { submitInterestForm } from "@/app/(public)/animais/[slug]/actions";
import PhoneInput from "@/components/PhoneInput";

interface Props {
  animalId: string;
  animalName: string;
}

export default function InterestForm({ animalId, animalName }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitInterestForm(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    });
  }

  if (success) {
    return (
      <Paper className="animate-scale-in" sx={{ p: { xs: 2, sm: 4 }, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: "success.main", mb: { xs: 1.5, sm: 2 } }} />
        <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}>
          Formulário enviado!
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
          Obrigado pelo seu interesse em {animalName}! Entraremos em contato em breve.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
        Tenho interesse em adotar {animalName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" action={handleSubmit}>
        <input type="hidden" name="animal_id" value={animalId} />

        {/* Honeypot — invisible to humans */}
        <input
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            height: 0,
            width: 0,
          }}
        />

        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          <TextField
            name="name"
            label="Seu nome"
            required
            fullWidth
            size="small"
            slotProps={{ input: { sx: { fontSize: { xs: "0.875rem", sm: "1rem" } } } }}
          />
          <PhoneInput
            name="phone"
            label="Telefone (com DDD)"
            required
            fullWidth
            size="small"
          />
          <TextField
            name="message"
            label="Mensagem (opcional)"
            fullWidth
            multiline
            rows={3}
            size="small"
            placeholder="Conte um pouco sobre você e por que deseja adotar..."
            slotProps={{ input: { sx: { fontSize: { xs: "0.875rem", sm: "1rem" } } } }}
          />

          <FormControlLabel
            control={<Checkbox name="consent" value="true" required />}
            label={
              <Typography variant="body2" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Li e concordo com a{" "}
                <Link
                  href="/privacidade"
                  target="_blank"
                  style={{ color: "#8B3FA0" }}
                >
                  Política de Privacidade
                </Link>
              </Typography>
            }
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            disabled={isPending}
            sx={{ minHeight: 44, fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            {isPending ? "Enviando..." : "Enviar Interesse"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
