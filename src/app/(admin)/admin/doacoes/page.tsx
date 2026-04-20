import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import type { DonationRequest } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Solicitações de Doação",
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "warning" as const },
  aceito: { label: "Aceito", color: "success" as const },
  recusado: { label: "Recusado", color: "error" as const },
};

const SPECIES_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

interface DoacoesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function DoacoesPage({ searchParams }: DoacoesPageProps) {
  const { status } = await searchParams;
  const activeStatus = status || "pendente";

  const supabase = await createServerClient();

  const query = supabase
    .from("donation_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeStatus !== "todos") {
    query.eq("status", activeStatus);
  }

  const { data } = await query;
  const rows = (data ?? []) as DonationRequest[];

  const tabs = [
    { value: "pendente", label: "Pendentes" },
    { value: "aceito", label: "Aceitos" },
    { value: "recusado", label: "Recusados" },
    { value: "todos", label: "Todos" },
  ];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Solicitações de Doação
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Tutores que querem encontrar um novo lar para seus animais.
      </Typography>

      <Tabs
        value={activeStatus}
        sx={{ mb: 3 }}
        TabIndicatorProps={{ style: { height: 3 } }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            component={Link}
            href={`/admin/doacoes?status=${tab.value}`}
          />
        ))}
      </Tabs>

      {rows.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <InboxIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">Nenhuma solicitação encontrada.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Tutor</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Animal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Espécie</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Urgência</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const statusCfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.pendente;
                return (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {row.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.whatsapp}
                      </Typography>
                    </TableCell>
                    <TableCell>{row.animal_name}</TableCell>
                    <TableCell>{SPECIES_LABELS[row.species] ?? row.species}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.urgency === "urgente" ? "Urgente" : "Normal"}
                        color={row.urgency === "urgente" ? "error" : "default"}
                        size="small"
                        variant={row.urgency === "urgente" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusCfg.label}
                        color={statusCfg.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{formatDate(row.created_at)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          component={Link}
                          href={`/admin/doacoes/${row.id}`}
                          size="small"
                          startIcon={<VisibilityIcon />}
                          variant="outlined"
                        >
                          Ver
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
