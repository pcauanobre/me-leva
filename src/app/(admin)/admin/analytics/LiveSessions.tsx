"use client";

import { useEffect, useState } from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

interface Props {
  initialCount: number;
}

export default function LiveSessions({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    let active = true;
    async function tick() {
      try {
        const res = await fetch("/api/analytics/live", { cache: "no-store" });
        if (!res.ok) return;
        const json = (await res.json()) as { count?: number };
        if (active && typeof json.count === "number") setCount(json.count);
      } catch {
        // ignore
      }
    }
    const id = setInterval(tick, 30_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Chip
        icon={
          <FiberManualRecordIcon
            sx={{ color: "#10B981 !important", fontSize: 14 }}
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            <Typography component="span" fontWeight={700}>
              {count}
            </Typography>
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              sessão{count === 1 ? "" : "es"} ao vivo
            </Typography>
          </Box>
        }
        variant="outlined"
        sx={{ height: 32 }}
      />
    </Stack>
  );
}
