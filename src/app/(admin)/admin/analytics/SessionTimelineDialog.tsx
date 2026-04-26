"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Stack,
  Typography,
  Chip,
  Divider,
} from "@mui/material";

const EVENT_LABELS: Record<string, string> = {
  page_view: "Página visitada",
  pet_click: "Clique em pet",
  pet_view_detail: "Visualizou pet",
  adoption_form_open: "Abriu formulário",
  adoption_form_step: "Avançou passo do formulário",
  adoption_form_submit: "Enviou formulário",
  adoption_form_abandon: "Abandonou formulário",
  account_signup_start: "Iniciou cadastro",
  account_signup_complete: "Concluiu cadastro",
  login: "Login",
  logout: "Logout",
  donation_form_submit: "Enviou pedido de doação",
  outbound_click: "Clique externo",
  error: "Erro",
};

const EVENT_COLORS: Record<
  string,
  "default" | "primary" | "secondary" | "success" | "error" | "info" | "warning"
> = {
  page_view: "default",
  pet_click: "info",
  adoption_form_open: "secondary",
  adoption_form_step: "secondary",
  adoption_form_submit: "success",
  adoption_form_abandon: "warning",
  account_signup_start: "info",
  account_signup_complete: "success",
  login: "primary",
  logout: "default",
  donation_form_submit: "success",
  error: "error",
};

interface SessionInfo {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  is_authenticated: boolean;
  user_email: string | null;
  first_seen_at: string;
  last_seen_at: string;
}

interface EventRow {
  id: string;
  event_type: string;
  path: string | null;
  animal_name: string | null;
  form_step: number | null;
  duration_ms: number | null;
  created_at: string;
}

interface Props {
  session: SessionInfo;
  events: EventRow[];
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(ms: number | null): string {
  if (ms === null || ms === undefined) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  return `${m}min ${rs}s`;
}

export default function SessionTimelineDialog({ session, events }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function close() {
    const sp = new URLSearchParams(params.toString());
    sp.delete("session");
    router.push(sp.toString() ? `?${sp.toString()}` : "?");
  }

  return (
    <Dialog open onClose={close} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            Jornada da sessão
          </Typography>
          <Chip
            size="small"
            color={session.is_authenticated ? "success" : "default"}
            label={session.is_authenticated ? "Autenticada" : "Anônima"}
          />
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {session.id}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
            {session.user_email && (
              <Chip size="small" label={`Usuário: ${session.user_email}`} />
            )}
            {session.ip_address && (
              <Chip size="small" label={`IP: ${session.ip_address}`} />
            )}
            {session.device_type && (
              <Chip size="small" label={session.device_type} />
            )}
            {session.browser && (
              <Chip size="small" label={session.browser} />
            )}
            {session.os && <Chip size="small" label={session.os} />}
            {session.referrer && (
              <Chip size="small" label={`Origem: ${session.referrer}`} />
            )}
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Início: {formatTime(session.first_seen_at)} · Última atividade:{" "}
            {formatTime(session.last_seen_at)}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {events.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
            Nenhum evento registrado para esta sessão.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {events.map((ev) => (
              <Box
                key={ev.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "auto 1fr auto" },
                  gap: 1.5,
                  alignItems: "center",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Chip
                  size="small"
                  color={EVENT_COLORS[ev.event_type] ?? "default"}
                  label={EVENT_LABELS[ev.event_type] ?? ev.event_type}
                  sx={{ justifySelf: "start" }}
                />
                <Box sx={{ minWidth: 0 }}>
                  {ev.path && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      noWrap
                    >
                      {ev.path}
                    </Typography>
                  )}
                  {ev.animal_name && (
                    <Typography variant="caption" color="text.secondary">
                      Pet: {ev.animal_name}
                    </Typography>
                  )}
                  {ev.form_step !== null && (
                    <Typography variant="caption" color="text.secondary">
                      {ev.path ? " · " : ""}Passo {ev.form_step}
                    </Typography>
                  )}
                  {ev.duration_ms !== null && (
                    <Typography variant="caption" color="text.secondary">
                      {" · Duração: "}
                      {formatDuration(ev.duration_ms)}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {formatTime(ev.created_at)}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}
