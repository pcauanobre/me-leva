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
  Avatar,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

export const metadata: Metadata = {
  title: "Solicitações",
};

const STATUS_CONFIG: Record<string, { label: string; color: "warning" | "success" | "error" }> = {
  pending: { label: "Pendente", color: "warning" },
  approved: { label: "Aprovado", color: "success" },
  rejected: { label: "Rejeitado", color: "error" },
};

export default async function SolicitacoesPage() {
  const supabase = await createServerClient();

  const { data: submissions } = await supabase
    .from("animals")
    .select("id, name, species, cover_photo, submission_status, created_at, submitted_by")
    .in("submission_status", ["pending", "rejected"])
    .order("created_at", { ascending: false });

  // Get profile names for submitters
  const submitterIds = [...new Set((submissions ?? []).map((s) => s.submitted_by).filter(Boolean))];
  let profileMap: Record<string, string> = {};

  if (submitterIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", submitterIds);

    profileMap = Object.fromEntries(
      (profiles ?? []).map((p) => [p.id, p.full_name])
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Solicitações de Cadastro
      </Typography>

      {!submissions?.length ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Nenhuma solicitação recebida.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Desktop: Table */}
          <Paper sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer>
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Animal</TableCell>
                    <TableCell>Enviado por</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {submissions.map((sub, index) => {
                    const config = STATUS_CONFIG[sub.submission_status ?? "pending"];
                    return (
                      <TableRow key={sub.id} hover sx={{ animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar
                              variant="rounded"
                              src={sub.cover_photo ?? undefined}
                              sx={{ width: 48, height: 48 }}
                            >
                              {sub.name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography fontWeight={600}>{sub.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {sub.species}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          {sub.submitted_by
                            ? profileMap[sub.submitted_by] ?? "Usuário"
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={config.label}
                            color={config.color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell align="right">
                          <Link href={`/admin/solicitacoes/${sub.id}`}>
                            <Button
                              size="small"
                              startIcon={<VisibilityIcon />}
                            >
                              Revisar
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Mobile: Cards */}
          <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
            {submissions.map((sub, index) => {
              const config = STATUS_CONFIG[sub.submission_status ?? "pending"];
              return (
                <Paper key={sub.id} sx={{ p: 2, animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
                  {/* Row 1: Avatar + animal name + species */}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                    <Avatar
                      variant="rounded"
                      src={sub.cover_photo ?? undefined}
                      sx={{ width: 48, height: 48 }}
                    >
                      {sub.name?.[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {sub.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sub.species}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Row 2: Enviado por */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Enviado por:{" "}
                    <Typography component="span" variant="body2" fontWeight={600} color="text.primary">
                      {sub.submitted_by
                        ? profileMap[sub.submitted_by] ?? "Usuário"
                        : "-"}
                    </Typography>
                  </Typography>

                  {/* Row 3: Status chip + date */}
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Chip
                      label={config.label}
                      color={config.color}
                      size="small"
                    />
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(sub.created_at).toLocaleDateString("pt-BR")}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Row 4: Revisar button */}
                  <Link href={`/admin/solicitacoes/${sub.id}`} style={{ textDecoration: "none" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{ textTransform: "none" }}
                    >
                      Revisar
                    </Button>
                  </Link>
                </Paper>
              );
            })}
          </Stack>
        </>
      )}
    </Box>
  );
}
