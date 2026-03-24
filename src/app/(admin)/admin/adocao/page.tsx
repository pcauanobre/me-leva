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
  IconButton,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InboxIcon from "@mui/icons-material/Inbox";
import type { AdoptionFormRow } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Formulários de Adoção",
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

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
  aprovado: { label: "Aprovado", color: "success" as const },
  rejeitado: { label: "Rejeitado", color: "error" as const },
};

const SPECIES_LABELS: Record<string, string> = {
  cao: "Cão",
  gato: "Gato",
};

interface AdocaoPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdocaoPage({ searchParams }: AdocaoPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "todos";
  const supabase = await createServerClient();

  let query = supabase
    .from("adoption_forms")
    .select("*")
    .order("created_at", { ascending: false });

  if (statusFilter !== "todos") {
    query = query.eq("status", statusFilter);
  }

  const { data: forms } = await query;
  const typedForms = (forms || []) as AdoptionFormRow[];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        Formulários de Adoção
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={statusFilter}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="Todos"
            value="todos"
            component={Link}
            href="/admin/adocao"
          />
          <Tab
            label="Pendentes"
            value="pendente"
            component={Link}
            href="/admin/adocao?status=pendente"
          />
          <Tab
            label="Aprovados"
            value="aprovado"
            component={Link}
            href="/admin/adocao?status=aprovado"
          />
          <Tab
            label="Rejeitados"
            value="rejeitado"
            component={Link}
            href="/admin/adocao?status=rejeitado"
          />
        </Tabs>
      </Paper>

      {typedForms.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <InboxIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">
            Nenhum formulário de adoção recebido ainda.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Desktop Table */}
          <TableContainer
            component={Paper}
            sx={{ display: { xs: "none", md: "block" } }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Candidato(a)</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>WhatsApp</TableCell>
                  <TableCell>Espécie</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {typedForms.map((form) => {
                  const statusCfg = STATUS_CONFIG[form.status];
                  return (
                    <TableRow key={form.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {form.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {form.profession}
                        </Typography>
                      </TableCell>
                      <TableCell>{form.email}</TableCell>
                      <TableCell>{form.whatsapp}</TableCell>
                      <TableCell>
                        {SPECIES_LABELS[form.animal_species] ||
                          form.animal_species}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusCfg.label}
                          color={statusCfg.color}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(form.created_at)}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Link href={`/admin/adocao/${form.id}`}>
                            <IconButton size="small" color="primary">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Link>
                          <IconButton
                            size="small"
                            color="success"
                            component="a"
                            href={`https://wa.me/${formatPhone(form.whatsapp)}?text=${encodeURIComponent(`Oi ${form.full_name}! Vi seu formulário de adoção. Vamos conversar?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WhatsAppIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Cards */}
          <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
            {typedForms.map((form) => {
              const statusCfg = STATUS_CONFIG[form.status];
              return (
                <Paper key={form.id} sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Box>
                      <Typography fontWeight={600}>
                        {form.full_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {form.email}
                      </Typography>
                    </Box>
                    <Chip
                      label={statusCfg.label}
                      color={statusCfg.color}
                      size="small"
                    />
                  </Stack>

                  <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {SPECIES_LABELS[form.animal_species] ||
                        form.animal_species}{" "}
                      &middot; {form.profession}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(form.created_at)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Link href={`/admin/adocao/${form.id}`}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                      >
                        Ver detalhes
                      </Button>
                    </Link>
                    <IconButton
                      size="small"
                      color="success"
                      component="a"
                      href={`https://wa.me/${formatPhone(form.whatsapp)}?text=${encodeURIComponent(`Oi ${form.full_name}! Vi seu formulário de adoção. Vamos conversar?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <WhatsAppIcon />
                    </IconButton>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
}
