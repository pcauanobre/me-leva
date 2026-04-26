"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Box, Chip, Stack, Typography } from "@mui/material";
import PersonAddDisabledIcon from "@mui/icons-material/PersonAddDisabled";

export interface SignupAttempt {
  sessionId: string;
  ip: string | null;
  device: string | null;
  browser: string | null;
  lastSeenAt: string;
}

interface Props {
  rows: SignupAttempt[];
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

export default function SignupAttemptsList({ rows }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  if (rows.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Nenhuma tentativa de cadastro abandonada no período. 🎉
      </Box>
    );
  }

  function open(id: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("session", id);
    router.push(`?${sp.toString()}`);
  }

  return (
    <Stack spacing={1}>
      {rows.map((r) => (
        <Box
          key={r.sessionId}
          onClick={() => open(r.sessionId)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.25,
            border: "1px solid",
            borderColor: "info.light",
            borderRadius: 2,
            bgcolor: "rgba(59, 130, 246, 0.05)",
            cursor: "pointer",
            transition: "transform 0.15s",
            "&:hover": { transform: "translateY(-1px)" },
          }}
        >
          <PersonAddDisabledIcon color="info" />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography fontWeight={600} sx={{ fontSize: "0.9rem" }}>
              Abriu o cadastro mas não concluiu
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
              <Chip size="small" variant="outlined" label={deviceLabel(r.device)} />
              {r.browser && <Chip size="small" variant="outlined" label={r.browser} />}
              {r.ip && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`IP: ${r.ip}`}
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                />
              )}
            </Stack>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            {new Date(r.lastSeenAt).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
