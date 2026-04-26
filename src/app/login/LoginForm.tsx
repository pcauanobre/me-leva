"use client";

import { useState, useTransition } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";

import EmailIcon from "@mui/icons-material/Email";
import LockResetIcon from "@mui/icons-material/LockReset";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Link from "next/link";
import { login } from "./actions";
import { sendResetEmail, verifyResetCode, updatePassword } from "./resetActions";
import { trackLogin } from "@/lib/analytics/client";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Reset password dialog state
  const [resetOpen, setResetOpen] = useState(false);
  const [resetStep, setResetStep] = useState(0); // 0=email, 1=code, 2=password, 3=done
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetPending, startResetTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    trackLogin();
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleSendReset() {
    if (!resetEmail.trim()) {
      setResetError("Informe seu email");
      return;
    }
    setResetError(null);
    startResetTransition(async () => {
      const result = await sendResetEmail(resetEmail);
      if (result.error) {
        setResetError(result.error);
      } else {
        setResetStep(1);
      }
    });
  }

  function handleVerifyCode() {
    if (!resetCode || resetCode.length < 6) {
      setResetError("Informe o código do email");
      return;
    }
    setResetError(null);
    startResetTransition(async () => {
      const result = await verifyResetCode(resetEmail, resetCode);
      if (result.error) {
        setResetError(result.error);
      } else {
        setResetStep(2);
      }
    });
  }

  function handleUpdatePassword(formData: FormData) {
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("password_confirm") as string;

    if (!password || password.length < 6) {
      setResetError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (password !== passwordConfirm) {
      setResetError("As senhas não conferem");
      return;
    }
    setResetError(null);
    startResetTransition(async () => {
      const result = await updatePassword(password);
      if (result.error) {
        setResetError(result.error);
      } else {
        setResetStep(3);
      }
    });
  }

  function closeReset() {
    setResetOpen(false);
    setResetStep(0);
    setResetEmail("");
    setResetCode("");
    setResetError(null);
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
          <Typography variant="body2" color="text.secondary">
            Entre na sua conta
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
              />
              <TextField
                name="password"
                label="Senha"
                type="password"
                required
                fullWidth
                autoComplete="current-password"
              />
              <Typography
                variant="caption"
                color="primary.main"
                fontWeight={500}
                textAlign="center"
                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => setResetOpen(true)}
              >
                Esqueci minha senha
              </Typography>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={isPending}
                sx={{ minHeight: 44 }}
              >
                {isPending ? "Entrando..." : "Entrar"}
              </Button>
              <Typography variant="body2" textAlign="center">
                Não tem conta?{" "}
                <Link href="/registro" style={{ color: "#8B3FA0", fontWeight: 600 }}>
                  Criar conta
                </Link>
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Reset Password Dialog */}
      <Dialog
        open={resetOpen}
        onClose={closeReset}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>
          Redefinir senha
        </DialogTitle>

        <DialogContent>
          {resetError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setResetError(null)}>
              {resetError}
            </Alert>
          )}

          {/* Step 0: Enter email */}
          {resetStep === 0 && (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Informe o email da sua conta. Enviaremos um código de verificação.
              </Typography>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                autoFocus
              />
            </Stack>
          )}

          {/* Step 1: Enter code only */}
          {resetStep === 1 && (
            <Stack spacing={2}>
              <Alert severity="info" variant="outlined">
                Código enviado para <strong>{resetEmail}</strong>. Verifique sua caixa de entrada e spam.
              </Alert>
              <TextField
                label="Código do email"
                fullWidth
                autoFocus
                placeholder="123456"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                inputProps={{ maxLength: 8, inputMode: "numeric" }}
              />
            </Stack>
          )}

          {/* Step 2: New password (only after code validated) */}
          {resetStep === 2 && (
            <Box component="form" id="reset-pw-form" action={handleUpdatePassword}>
              <Stack spacing={2}>
                <Alert severity="success" variant="outlined">
                  Código verificado! Agora defina sua nova senha.
                </Alert>
                <TextField
                  name="password"
                  label="Nova senha"
                  type="password"
                  fullWidth
                  autoFocus
                  autoComplete="new-password"
                  inputProps={{ minLength: 6 }}
                />
                <TextField
                  name="password_confirm"
                  label="Confirmar nova senha"
                  type="password"
                  fullWidth
                  autoComplete="new-password"
                />
              </Stack>
            </Box>
          )}

          {/* Step 3: Done */}
          {resetStep === 3 && (
            <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: "success.main" }} />
              <Typography variant="h6" fontWeight={700}>
                Senha redefinida!
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Feche este popup e faça login com a nova senha.
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          {resetStep === 0 && (
            <>
              <Button onClick={closeReset} color="inherit">Cancelar</Button>
              <Button
                variant="contained"
                onClick={handleSendReset}
                disabled={resetPending}
                startIcon={resetPending ? <CircularProgress size={18} /> : <EmailIcon />}
              >
                {resetPending ? "Enviando..." : "Enviar código"}
              </Button>
            </>
          )}
          {resetStep === 1 && (
            <>
              <Button onClick={() => { setResetStep(0); setResetCode(""); }} color="inherit">Voltar</Button>
              <Button
                variant="contained"
                onClick={handleVerifyCode}
                disabled={resetPending || resetCode.length < 6}

                startIcon={resetPending ? <CircularProgress size={18} /> : undefined}
              >
                {resetPending ? "Verificando..." : "Verificar código"}
              </Button>
            </>
          )}
          {resetStep === 2 && (
            <>
              <Button onClick={closeReset} color="inherit">Cancelar</Button>
              <Button
                type="submit"
                form="reset-pw-form"
                variant="contained"
                disabled={resetPending}
                startIcon={resetPending ? <CircularProgress size={18} /> : <LockResetIcon />}
              >
                {resetPending ? "Salvando..." : "Redefinir senha"}
              </Button>
            </>
          )}
          {resetStep === 3 && (
            <Button variant="contained" onClick={closeReset} fullWidth>
              Fechar
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
