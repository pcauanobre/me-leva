"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PhoneInput from "@/components/PhoneInput";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Stack,
} from "@mui/material";

import { register } from "./actions";
import { trackSignup } from "@/lib/analytics/client";

export default function RegistroForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    trackSignup("start");
  }, []);

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        trackSignup("complete");
        router.push("/minha-conta");
      }
    });
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Paper className="animate-scale-in" sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 440, width: "100%" }}>
        <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none", gap: 4 }}>
            <img src="/logo.svg" alt="Me Leva!" width={48} height={48} style={{ width: "auto", height: "auto", maxWidth: 48 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Me Leva!
            </Typography>
          </Link>
          <Typography variant="body2" color="text.secondary">
            Criar Conta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cadastre-se para enviar animais para adoção
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%" }}>
              {error}
            </Alert>
          )}

          <Box component="form" action={handleSubmit} sx={{ width: "100%" }}>
            <Stack spacing={2}>
              <TextField
                name="full_name"
                label="Nome completo"
                required
                fullWidth
                autoComplete="name"
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                required
                fullWidth
                autoComplete="email"
              />
              <PhoneInput
                name="phone"
                label="Telefone (opcional)"
                fullWidth
              />
              <TextField
                name="password"
                label="Senha"
                type="password"
                required
                fullWidth
                autoComplete="new-password"
                slotProps={{ htmlInput: { minLength: 6 } }}
              />
              <TextField
                name="password_confirm"
                label="Confirmar senha"
                type="password"
                required
                fullWidth
                autoComplete="new-password"
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isPending}
              >
                {isPending ? "Criando conta..." : "Criar Conta"}
              </Button>
              <Typography variant="body2" textAlign="center">
                Já tem conta?{" "}
                <Link
                  href="/login"
                  style={{ color: "#8B3FA0", fontWeight: 600 }}
                >
                  Entrar
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
