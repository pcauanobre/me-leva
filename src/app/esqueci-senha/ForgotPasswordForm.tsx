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

import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { sendResetEmail } from "./actions";

export default function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await sendResetEmail(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSent(true);
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
      <Paper className="animate-scale-in" sx={{ p: { xs: 2.5, sm: 4 }, maxWidth: 400, width: "100%" }}>
        <Stack spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Link href="/" style={{ display: "flex", flexDirection: "column", alignItems: "center", textDecoration: "none", gap: 4 }}>
            <img src="/logo.svg" alt="Me Leva!" width={48} height={48} style={{ width: "auto", height: "auto", maxWidth: 48 }} />
            <Typography variant="h5" fontWeight={700} color="primary.main">
              Me Leva!
            </Typography>
          </Link>

          {sent ? (
            <>
              <CheckCircleIcon sx={{ fontSize: 56, color: "success.main" }} />
              <Typography variant="h6" fontWeight={700} textAlign="center">
                Email enviado!
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Verifique sua caixa de entrada (e o spam). Clique no link do email para redefinir sua senha.
              </Typography>
              <Link href="/login" style={{ textDecoration: "none", width: "100%" }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                >
                  Voltar ao login
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Informe seu email e enviaremos um link para redefinir sua senha.
              </Typography>

              {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}

              <Box component="form" action={handleSubmit} sx={{ width: "100%" }}>
                <Stack spacing={2}>
                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    autoComplete="email"
                    autoFocus
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    startIcon={<EmailIcon />}
                    disabled={isPending}
                    sx={{ minHeight: 44 }}
                  >
                    {isPending ? "Enviando..." : "Enviar link de recuperação"}
                  </Button>
                </Stack>
              </Box>

              <Link href="/login" style={{ textDecoration: "none" }}>
                <Button startIcon={<ArrowBackIcon />} size="small" color="inherit">
                  Voltar ao login
                </Button>
              </Link>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
