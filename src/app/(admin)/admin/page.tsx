import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionIcon from "@mui/icons-material/Description";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Animal } from "@/lib/supabase/types";
import TimeChip from "./TimeChip";

export const metadata: Metadata = {
  title: "Dashboard",
};


const STATUS_LABELS: Record<string, string> = {
  disponivel: "Disponível",
  adotado: "Adotado",
};

const STATUS_COLORS: Record<string, "success" | "default"> = {
  disponivel: "success",
  adotado: "default",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function AdminDashboard() {
  const supabase = await createServerClient();

  // Get admin name
  const { data: { user } } = await supabase.auth.getUser();
  let adminName = "Carol";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();
    if (profile?.full_name) adminName = profile.full_name.split(" ")[0];
  }

  const greeting = getGreeting();

  const [animalsRes, adoptedRes, formsRes, pendingRes] =
    await Promise.all([
      supabase
        .from("animals")
        .select("id", { count: "exact", head: true })
        .neq("status", "adotado")
        .or("submission_status.is.null,submission_status.eq.approved"),
      supabase
        .from("animals")
        .select("id", { count: "exact", head: true })
        .eq("status", "adotado"),
      supabase
        .from("interest_forms")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("animals")
        .select("id", { count: "exact", head: true })
        .eq("submission_status", "pending"),
    ]);

  // Fetch recent animals in catalog (for the table)
  const { data: recentAnimals } = await supabase
    .from("animals")
    .select(
      "id, name, species, status, cover_photo, created_at, submission_status"
    )
    .or("submission_status.is.null,submission_status.eq.approved")
    .neq("status", "adotado")
    .order("created_at", { ascending: true })
    .limit(10);

  const animals = (recentAnimals ?? []) as Pick<
    Animal,
    | "id"
    | "name"
    | "species"
    | "status"
    | "cover_photo"
    | "created_at"
    | "submission_status"
  >[];

  const stats = [
    {
      label: "Disponíveis",
      value: animalsRes.count ?? 0,
      icon: <PetsIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#8B3FA0",
      bg: "#F8F0FA",
      href: "/admin/animais",
    },
    {
      label: "Adotados",
      value: adoptedRes.count ?? 0,
      icon: <CheckCircleIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#10B981",
      bg: "#D1FAE5",
      href: "/admin/animais",
    },
    {
      label: "Solicitações",
      value: pendingRes.count ?? 0,
      icon: <AssignmentIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#F97316",
      bg: "#FED7AA",
      href: "/admin/solicitacoes",
    },
    {
      label: "Formulários",
      value: formsRes.count ?? 0,
      icon: <DescriptionIcon sx={{ fontSize: { xs: 28, sm: 36 } }} />,
      color: "#E8618C",
      bg: "#FDE8F0",
      href: "/admin/formularios",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" }, mb: 0.5 }}>
        {greeting}, {adminName}! 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Aqui está o resumo do Me Leva! hoje.
      </Typography>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid key={stat.label} size={{ xs: 6, sm: 4, md: 2.4 }} sx={{ animation: "fadeInUp 0.4s ease both", animationDelay: `${index * 0.05}s` }}>
            <Link href={stat.href} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.15s",
                  "&:hover": { transform: "translateY(-2px)" },
                }}
              >
                <CardContent sx={{ p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
                  <Box
                    sx={{
                      width: { xs: 36, sm: 44 },
                      height: { xs: 36, sm: 44 },
                      borderRadius: 2,
                      bgcolor: stat.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: stat.color,
                      mb: 1.5,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      {/* Animals waiting longest */}
      <Paper className="animate-fade-in-up delay-4">
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccessTimeIcon color="primary" />
            <Typography variant="h6" fontWeight={700}>
              Animais no catálogo
            </Typography>
            <Typography variant="body2" color="text.secondary">
              (mais antigos primeiro)
            </Typography>
          </Stack>
          <Link href="/admin/animais" style={{ textDecoration: "none" }}>
            <Button endIcon={<ArrowForwardIcon />} size="small">
              Ver todos
            </Button>
          </Link>
        </Box>
        <Divider />

        {animals.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              Nenhum animal no catálogo ainda.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Desktop: Table */}
            <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" }}>Animal</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" }}>Espécie</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" }}>No catálogo há</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "text.secondary", fontSize: "0.8rem" }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {animals.map((animal, index) => (
                    <TableRow key={animal.id} hover sx={{ "&:last-child td": { borderBottom: 0 }, animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            variant="rounded"
                            src={animal.cover_photo ?? undefined}
                            sx={{ width: 48, height: 48 }}
                          >
                            {animal.name[0]}
                          </Avatar>
                          <Typography fontWeight={700}>
                            {animal.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {animal.species === "cachorro" ? "🐶 Cachorro" : animal.species === "gato" ? "🐱 Gato" : "🐾 Outro"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={STATUS_LABELS[animal.status] ?? animal.status}
                          color={STATUS_COLORS[animal.status] ?? "default"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <TimeChip createdAt={animal.created_at} />
                      </TableCell>
                      <TableCell align="right">
                        <Link href={`/admin/animais/${animal.id}`} style={{ textDecoration: "none" }}>
                          <Button size="small" variant="outlined">
                            Editar
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile: Cards */}
            <Stack spacing={1.5} sx={{ display: { xs: "flex", md: "none" }, p: 2 }}>
              {animals.map((animal) => (
                <Paper key={animal.id} variant="outlined" sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                      variant="rounded"
                      src={animal.cover_photo ?? undefined}
                      sx={{ width: 40, height: 40 }}
                    >
                      {animal.name[0]}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {animal.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {animal.species}
                      </Typography>
                    </Box>
                    <Chip
                      label={STATUS_LABELS[animal.status] ?? animal.status}
                      color={STATUS_COLORS[animal.status] ?? "default"}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                    <TimeChip createdAt={animal.created_at} />
                    <Box sx={{ flex: 1 }} />
                    <Link href={`/admin/animais/${animal.id}`} style={{ textDecoration: "none" }}>
                      <Button size="small">Editar</Button>
                    </Link>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
}
