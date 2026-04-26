"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Stack,
  TextField,
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";

interface Props {
  from: string;
  to: string;
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
}

export default function DateRangeFilter({ from, to }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [fromValue, setFromValue] = useState(from);
  const [toValue, setToValue] = useState(to);

  function applyRange(nextFrom: string, nextTo: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set("from", nextFrom);
    sp.set("to", nextTo);
    sp.delete("session");
    router.push(`?${sp.toString()}`);
  }

  function selectPreset(value: string) {
    const today = todayIso();
    let nextFrom = from;
    if (value === "7d") nextFrom = daysAgo(7);
    else if (value === "30d") nextFrom = daysAgo(30);
    else if (value === "90d") nextFrom = daysAgo(90);
    else if (value === "today") nextFrom = today;
    setFromValue(nextFrom);
    setToValue(today);
    applyRange(nextFrom, today);
  }

  function detectPreset(): string {
    const today = todayIso();
    if (to !== today) return "custom";
    if (from === today) return "today";
    if (from === daysAgo(7)) return "7d";
    if (from === daysAgo(30)) return "30d";
    if (from === daysAgo(90)) return "90d";
    return "custom";
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", md: "center" }}
    >
      <ToggleButtonGroup
        size="small"
        exclusive
        value={detectPreset()}
        onChange={(_, value) => {
          if (value && value !== "custom") selectPreset(value);
        }}
      >
        <ToggleButton value="today">Hoje</ToggleButton>
        <ToggleButton value="7d">7 dias</ToggleButton>
        <ToggleButton value="30d">30 dias</ToggleButton>
        <ToggleButton value="90d">90 dias</ToggleButton>
      </ToggleButtonGroup>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          type="date"
          size="small"
          label="De"
          value={fromValue}
          onChange={(e) => setFromValue(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          size="small"
          label="Até"
          value={toValue}
          onChange={(e) => setToValue(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={() => applyRange(fromValue, toValue)}
        >
          Aplicar
        </Button>
      </Stack>
    </Stack>
  );
}
