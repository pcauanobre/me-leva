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
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import InboxIcon from "@mui/icons-material/Inbox";
import MarkAdoptedButton from "./MarkAdoptedButton";
import { formatPhoneDisplay } from "@/lib/utils/formatPhone";

export const metadata: Metadata = {
  title: "Formulários de Interesse",
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

export default async function FormulariosPage() {
  const supabase = await createServerClient();

  const { data: forms } = await supabase
    .from("interest_forms")
    .select("*, animals(id, name, slug, cover_photo, status)")
    .order("created_at", { ascending: false });

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
        Formulários de Interesse
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Pessoas interessadas em adotar. Clique no WhatsApp para entrar em contato.
      </Typography>

      {!forms?.length ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <InboxIcon sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
          <Typography color="text.secondary" fontWeight={500}>
            Nenhum formulário recebido ainda.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Desktop: Table */}
          <Paper sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Animal</TableCell>
                    <TableCell>Interessado</TableCell>
                    <TableCell>Mensagem</TableCell>
                    <TableCell>Data</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Contato</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {forms.map((form, index) => {
                    const waNumber = formatPhone(form.phone);
                    const waText = encodeURIComponent(
                      `Oi ${form.name}! Vi seu interesse em adotar o(a) ${form.animals?.name ?? "animal"}. Vamos conversar?`
                    );
                    const waLink = `https://wa.me/${waNumber}?text=${waText}`;

                    return (
                      <TableRow key={form.id} hover sx={{ animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Avatar
                              variant="rounded"
                              src={form.animals?.cover_photo ?? undefined}
                              sx={{ width: 40, height: 40 }}
                            >
                              {form.animals?.name?.[0] ?? "?"}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600}>
                              {form.animals?.name ?? "Animal removido"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {form.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatPhoneDisplay(form.phone)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 280,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {form.message || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(form.created_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {form.animals?.id && (
                            <MarkAdoptedButton
                              animalId={form.animals.id}
                              animalName={form.animals.name ?? "Animal"}
                              alreadyAdopted={form.animals.status === "adotado"}
                            />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Link
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <IconButton
                              sx={{
                                bgcolor: "#25D366",
                                color: "white",
                                "&:hover": { bgcolor: "#1DA851" },
                                width: 40,
                                height: 40,
                              }}
                            >
                              <WhatsAppIcon />
                            </IconButton>
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
            {forms.map((form, index) => {
              const waNumber = formatPhone(form.phone);
              const waText = encodeURIComponent(
                `Oi ${form.name}! Vi seu interesse em adotar o(a) ${form.animals?.name ?? "animal"}. Vamos conversar?`
              );
              const waLink = `https://wa.me/${waNumber}?text=${waText}`;

              return (
                <Paper key={form.id} sx={{ p: 2, animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
                  {/* Animal + Person */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                    <Avatar
                      variant="rounded"
                      src={form.animals?.cover_photo ?? undefined}
                      sx={{ width: 48, height: 48 }}
                    >
                      {form.animals?.name?.[0] ?? "?"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontWeight={700} noWrap>
                        {form.animals?.name ?? "Animal removido"}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {form.name}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Details */}
                  <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatPhoneDisplay(form.phone)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarTodayIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(form.created_at)}
                      </Typography>
                    </Stack>
                    {form.message && (
                      <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                        <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: "text.secondary", mt: 0.2 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                          {form.message}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Divider sx={{ mb: 1.5 }} />

                  {/* Actions */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {form.animals?.id && (
                      <MarkAdoptedButton
                        animalId={form.animals.id}
                        animalName={form.animals.name ?? "Animal"}
                        alreadyAdopted={form.animals.status === "adotado"}
                      />
                    )}
                    <Box sx={{ flex: 1 }} />
                    <Link
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}
                    >
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<WhatsAppIcon />}
                        sx={{
                          bgcolor: "#25D366",
                          "&:hover": { bgcolor: "#1DA851" },
                          textTransform: "none",
                          fontWeight: 600,
                        }}
                      >
                        WhatsApp
                      </Button>
                    </Link>
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
