"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Stack,
} from "@mui/material";

import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LoginIcon from "@mui/icons-material/Login";
import { resetPassword } from "./actions";

export default function ResetPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
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
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 400, width: "100%" }}>
        <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none", gap: 4 }}>
            <img src="/logo.svg" alt="Me Leva!" width={48} height={48} style={{ width: "auto", height: "auto", maxWidth: 48 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Me Leva!
            </Typography>
          </Link>

          {done ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 56, color: "success.main" }} />
              <Typography variant="h6" fontWeight={700} textAlign="center">
                Senha redefinida!
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Sua senha foi alterada com sucesso. Faça login com a nova senha.
              </Typography>
              <Link href="/login" style={{ textDecoration: "none", width: "100%" }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<LoginIcon />}
                  sx={{ minHeight: 44 }}
                >
                  Ir para o login
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Digite sua nova senha abaixo.
              </Typography>

              {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}

              <Box component="form" action={handleSubmit} sx={{ width: "100%" }}>
                <Stack spacing={2}>
                  <TextField
                    name="password"
                    label="Nova senha"
                    type="password"
                    required
                    fullWidth
                    autoComplete="new-password"
                    autoFocus
                    slotProps={{ htmlInput: { minLength: 6 } }}
                  />
                  <TextField
                    name="password_confirm"
                    label="Confirmar nova senha"
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
                    startIcon={<LockResetIcon />}
                    disabled={isPending}
                    sx={{ minHeight: 44 }}
                  >
                    {isPending ? "Salvando..." : "Redefinir senha"}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
