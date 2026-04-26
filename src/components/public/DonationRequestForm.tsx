"use client";

import { useEffect, useRef, useState, useTransition } from "react";
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
  MenuItem,
  Divider,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Link from "next/link";
import { submitDonationRequest } from "@/app/(public)/quero-doar/actions";
import PhoneInput from "@/components/PhoneInput";
import {
  trackFormOpen,
  trackFormStep,
  trackFormSubmit,
} from "@/lib/analytics/client";

const FORM_NAME = "donation";

function computeStep(form: HTMLFormElement | null): number {
  if (!form) return 1;
  const fd = new FormData(form);
  const has = (k: string) => !!(fd.get(k)?.toString().trim());
  let step = 1;
  if (has("name") && has("email") && has("whatsapp")) step = 2;
  if (
    step >= 2 &&
    has("animal_name") &&
    has("species") &&
    has("sex") &&
    has("description")
  )
    step = 3;
  if (step >= 3 && has("donation_reason") && has("urgency")) step = 4;
  return step;
}

export default function DonationRequestForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement | null>(null);
  const lastStepRef = useRef(1);

  useEffect(() => {
    trackFormOpen(FORM_NAME);
  }, []);

  function handleProgress() {
    const step = computeStep(formRef.current);
    if (step > lastStepRef.current) {
      lastStepRef.current = step;
      trackFormStep(FORM_NAME, step);
    }
  }

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitDonationRequest(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        trackFormSubmit(FORM_NAME);
      }
    });
  }

  if (success) {
    return (
      <Paper className="animate-scale-in" sx={{ p: { xs: 3, sm: 5 }, textAlign: "center" }}>
        <CheckCircleIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: "success.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Solicitação recebida!
        </Typography>
        <Typography color="text.secondary">
          Recebemos sua solicitação de doação. Nossa equipe irá analisar as informações e entrará em contato pelo WhatsApp em breve.
        </Typography>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 1 }}>
          O recebimento desta solicitação não garante a aceitação do animal — a ONG avalia cada caso individualmente.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 4 } }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        component="form"
        action={handleSubmit}
        ref={formRef}
        onBlur={handleProgress}
        onChange={handleProgress}
      >
        {/* Honeypot */}
        <input
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
        />

        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Seus dados
            </Typography>
            <Stack spacing={2}>
              <TextField name="name" label="Nome completo" required fullWidth />
              <TextField name="email" label="Email" type="email" required fullWidth />
              <PhoneInput name="whatsapp" label="WhatsApp (com DDD)" required fullWidth />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Dados do animal
            </Typography>
            <Stack spacing={2}>
              <TextField name="animal_name" label="Nome do animal" required fullWidth />
              <TextField name="species" label="Espécie" select required fullWidth defaultValue="">
                <MenuItem value="">Selecione</MenuItem>
                <MenuItem value="cachorro">Cachorro</MenuItem>
                <MenuItem value="gato">Gato</MenuItem>
                <MenuItem value="outro">Outro</MenuItem>
              </TextField>
              <TextField name="breed" label="Raça (opcional)" fullWidth />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  name="age_months"
                  label="Idade aproximada (meses)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                <TextField name="sex" label="Sexo" select required fullWidth defaultValue="">
                  <MenuItem value="">Selecione</MenuItem>
                  <MenuItem value="macho">Macho</MenuItem>
                  <MenuItem value="femea">Fêmea</MenuItem>
                </TextField>
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControlLabel
                  control={<Checkbox name="neutered" value="true" />}
                  label="Castrado(a)"
                />
                <FormControlLabel
                  control={<Checkbox name="vaccinated" value="true" />}
                  label="Vacinado(a)"
                />
              </Stack>
              <TextField
                name="description"
                label="Descrição do animal (temperamento, comportamento, saúde)"
                required
                fullWidth
                multiline
                rows={4}
                placeholder="Conte como o animal se comporta, se tem alguma condição de saúde, se convive com outros animais ou crianças..."
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Sobre a doação
            </Typography>
            <Stack spacing={2}>
              <TextField
                name="donation_reason"
                label="Motivo da doação"
                required
                fullWidth
                multiline
                rows={3}
                placeholder="Por que você precisa doar o animal?"
              />
              <TextField name="urgency" label="Urgência" select required fullWidth defaultValue="normal">
                <MenuItem value="normal">Normal — tenho tempo para o processo</MenuItem>
                <MenuItem value="urgente">Urgente — preciso de resposta rápida</MenuItem>
              </TextField>
            </Stack>
          </Box>

          <Divider />

          <Stack spacing={1}>
            <FormControlLabel
              control={<Checkbox name="terms_accepted" value="true" required />}
              label={
                <Typography variant="body2">
                  Li e concordo com os{" "}
                  <Link href="/termos" target="_blank" style={{ color: "#8B3FA0" }}>
                    Termos de Uso
                  </Link>
                  , incluindo a responsabilidade sobre a veracidade das informações fornecidas
                </Typography>
              }
            />

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Ao enviar, você declara ser o legítimo responsável pelo animal e que todas as informações são verdadeiras.
            </Typography>
          </Stack>

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SendIcon />}
            disabled={isPending}
            sx={{ minHeight: 48 }}
          >
            {isPending ? "Enviando..." : "Enviar Solicitação de Doação"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
