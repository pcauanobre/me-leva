"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Chip,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export interface AbandonedRow {
  sessionId: string;
  ip: string | null;
  device: string | null;
  browser: string | null;
  isAuthenticated: boolean;
  reachedStep: number;
  totalSteps: number;
  durationMs: number | null;
  lastSeenAt: string;
}

interface Props {
  rows: AbandonedRow[];
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

function formatDuration(ms: number | null): string {
  if (!ms || ms <= 0) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const min = Math.floor(s / 60);
  return `${min}min ${s % 60}s`;
}

export default function AbandonedFormsList({ rows }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  if (rows.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Nenhum formulário abandonado no período. 🎉
      </Box>
    );
  }

  function open(id: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("session", id);
    router.push(`?${sp.toString()}`);
  }

  return (
    <Stack spacing={1.5}>
      {rows.map((row) => {
        const pct = Math.round((row.reachedStep / row.totalSteps) * 100);
        const missing = 100 - pct;
        return (
          <Box
            key={row.sessionId}
            onClick={() => open(row.sessionId)}
            sx={{
              p: { xs: 1.5, sm: 2 },
              border: "1px solid",
              borderColor: "warning.light",
              borderRadius: 2,
              bgcolor: "rgba(255, 167, 38, 0.05)",
              cursor: "pointer",
              transition: "transform 0.15s, box-shadow 0.15s",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                <WarningAmberIcon color="warning" />
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} sx={{ fontSize: "0.95rem" }}>
                    Parou no passo {row.reachedStep} de {row.totalSteps} — faltavam{" "}
                    {missing}% para completar
                  </Typography>
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={deviceLabel(row.device)}
                    />
                    {row.browser && (
                      <Chip size="small" variant="outlined" label={row.browser} />
                    )}
                    {row.ip && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`IP: ${row.ip}`}
                        sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                      />
                    )}
                    <Chip
                      size="small"
                      variant="outlined"
                      label={row.isAuthenticated ? "Logado" : "Anônimo"}
                      color={row.isAuthenticated ? "success" : "default"}
                    />
                    {row.durationMs && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`Tempo gasto: ${formatDuration(row.durationMs)}`}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
              <Box sx={{ minWidth: { xs: "100%", sm: 200 } }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="baseline"
                >
                  <Typography variant="caption" color="text.secondary">
                    Progresso
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    {pct}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  color="warning"
                  sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5 }}
                >
                  Última atividade:{" "}
                  {new Date(row.lastSeenAt).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
