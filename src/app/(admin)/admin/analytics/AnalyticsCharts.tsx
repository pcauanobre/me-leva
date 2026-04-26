"use client";

import { BarChart } from "@mui/x-charts/BarChart";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box } from "@mui/material";

const PRIMARY = "#8B3FA0";
const SECONDARY = "#E8618C";
const ACCENT_GREEN = "#10B981";
const ACCENT_ORANGE = "#F97316";
const ACCENT_BLUE = "#3B82F6";

export interface FunnelDatum {
  label: string;
  value: number;
}

export function FunnelChart({ data }: { data: FunnelDatum[] }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Sem dados ainda no período selecionado.
      </Box>
    );
  }
  return (
    <BarChart
      layout="horizontal"
      height={320}
      yAxis={[{ scaleType: "band", data: data.map((d) => d.label) }]}
      xAxis={[{ label: "Sessões únicas" }]}
      series={[
        {
          data: data.map((d) => d.value),
          color: PRIMARY,
          label: "Sessões",
        },
      ]}
      grid={{ vertical: true }}
      margin={{ left: 140 }}
    />
  );
}

export interface StepDatum {
  step: number;
  sessions: number;
  avgDurationMs: number;
}

export function StepDropoffChart({ data }: { data: StepDatum[] }) {
  if (data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Ninguém chegou nos passos ainda.
      </Box>
    );
  }
  const labels = data.map((d) => `Passo ${d.step}`);
  return (
    <BarChart
      height={280}
      xAxis={[{ scaleType: "band", data: labels }]}
      yAxis={[{ label: "Sessões" }]}
      series={[
        {
          data: data.map((d) => d.sessions),
          color: SECONDARY,
          label: "Sessões que alcançaram",
        },
      ]}
    />
  );
}

export function AvgStepTimeChart({ data }: { data: StepDatum[] }) {
  if (data.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Sem dados de tempo por passo.
      </Box>
    );
  }
  const labels = data.map((d) => `Passo ${d.step}`);
  return (
    <BarChart
      height={280}
      xAxis={[{ scaleType: "band", data: labels }]}
      yAxis={[{ label: "Segundos (média)" }]}
      series={[
        {
          data: data.map((d) => Math.round(d.avgDurationMs / 1000)),
          color: ACCENT_BLUE,
          label: "Tempo médio (s)",
        },
      ]}
    />
  );
}

export interface PieDatum {
  id: number;
  label: string;
  value: number;
}

export function CategoryPie({ data }: { data: PieDatum[] }) {
  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
        Sem dados ainda.
      </Box>
    );
  }
  return (
    <PieChart
      height={260}
      series={[
        {
          data,
          innerRadius: 50,
          paddingAngle: 2,
          cornerRadius: 4,
        },
      ]}
      colors={[PRIMARY, SECONDARY, ACCENT_GREEN, ACCENT_ORANGE, ACCENT_BLUE, "#A78BFA", "#94A3B8"]}
    />
  );
}

export interface HourCell {
  weekday: number;
  hour: number;
  count: number;
}

export function HourHeatmap({ data }: { data: HourCell[] }) {
  const grid: number[][] = Array.from({ length: 7 }, () =>
    Array.from({ length: 24 }, () => 0)
  );
  let max = 0;
  for (const c of data) {
    if (c.weekday >= 0 && c.weekday < 7 && c.hour >= 0 && c.hour < 24) {
      grid[c.weekday][c.hour] = c.count;
      if (c.count > max) max = c.count;
    }
  }
  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `48px repeat(24, minmax(20px, 1fr))`,
          gap: "2px",
          minWidth: 600,
        }}
      >
        <Box />
        {Array.from({ length: 24 }).map((_, h) => (
          <Box
            key={`h-${h}`}
            sx={{
              fontSize: 10,
              textAlign: "center",
              color: "text.secondary",
            }}
          >
            {h}
          </Box>
        ))}
        {grid.map((row, dow) => (
          <Box key={`row-${dow}`} sx={{ display: "contents" }}>
            <Box
              sx={{
                fontSize: 11,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              {dayLabels[dow]}
            </Box>
            {row.map((cell, h) => {
              const intensity = max > 0 ? cell / max : 0;
              return (
                <Box
                  key={`c-${dow}-${h}`}
                  title={`${dayLabels[dow]} ${h}h — ${cell} eventos`}
                  sx={{
                    height: 24,
                    borderRadius: "3px",
                    bgcolor:
                      cell === 0
                        ? "#F1F5F9"
                        : `rgba(139, 63, 160, ${0.15 + intensity * 0.85})`,
                  }}
                />
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
