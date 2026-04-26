"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

export interface RecentSession {
  id: string;
  ip_address: string | null;
  device_type: string | null;
  browser: string | null;
  is_authenticated: boolean;
  last_seen_at: string;
  last_event_type: string | null;
  last_event_path: string | null;
}

interface Props {
  sessions: RecentSession[];
}

const DEVICE_LABELS: Record<string, string> = {
  mobile: "Celular",
  tablet: "Tablet",
  desktop: "Desktop",
  bot: "Bot",
};

function deviceLabel(value: string | null): string {
  if (!value) return "Desconhecido";
  return DEVICE_LABELS[value] ?? value;
}

export default function RecentSessionsTable({ sessions }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  function open(id: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("session", id);
    router.push(`?${sp.toString()}`);
  }

  if (sessions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          Nenhuma sessão registrada no período.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ overflowX: "auto" }}>
      <Table size="small" sx={{ minWidth: 720 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Sessão
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Dispositivo
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              IP
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Auth
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Último evento
            </TableCell>
            <TableCell sx={{ fontWeight: 700, color: "text.secondary" }}>
              Última atividade
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map((s) => (
            <TableRow
              key={s.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => open(s.id)}
            >
              <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                {s.id.slice(0, 8)}…
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  <Chip
                    size="small"
                    label={deviceLabel(s.device_type)}
                    variant="outlined"
                  />
                  {s.browser && (
                    <Chip size="small" label={s.browser} variant="outlined" />
                  )}
                </Stack>
              </TableCell>
              <TableCell sx={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                {s.ip_address ?? "—"}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={s.is_authenticated ? "Sim" : "Não"}
                  color={s.is_authenticated ? "success" : "default"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                {s.last_event_type ? (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Chip
                      size="small"
                      label={s.last_event_type}
                      variant="outlined"
                    />
                    {s.last_event_path && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace" }}
                        noWrap
                      >
                        {s.last_event_path}
                      </Typography>
                    )}
                  </Stack>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    —
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">
                  {new Date(s.last_seen_at).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
