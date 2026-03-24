"use client";

import { Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days === 0) return "Adicionado hoje";
  if (days === 1) return "1 dia atrás";
  if (days < 30) return `${days} dias atrás`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 mês atrás";
  if (months < 12) return `${months} meses atrás`;
  const years = Math.floor(months / 12);
  return `${years} ${years === 1 ? "ano" : "anos"} atrás`;
}

function urgencyColor(dateStr: string): "default" | "warning" | "error" {
  const days = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days > 60) return "error";
  if (days > 30) return "warning";
  return "default";
}

export default function TimeChip({ createdAt }: { createdAt: string }) {
  return (
    <Chip
      icon={<AccessTimeIcon />}
      label={timeAgo(createdAt)}
      size="small"
      color={urgencyColor(createdAt)}
      variant="outlined"
    />
  );
}
