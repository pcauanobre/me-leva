import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  Alert,
  Grid,
  IconButton,
  Fab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PetsIcon from "@mui/icons-material/Pets";
import type { Animal } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Minha Conta",
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: "warning" | "success" | "error";
    desc: string;
  }
> = {
  pending: {
    label: "Em Análise",
    color: "warning",
    desc: "Aguardando revisão da administradora",
  },
  approved: {
    label: "Aprovado",
    color: "success",
    desc: "Visível no catálogo público",
  },
  rejected: {
    label: "Ajustes Necessários",
    color: "error",
    desc: "Clique para ver o feedback e editar",
  },
};

const SPECIES_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

export default async function MinhaContaPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("animals")
    .select(
      "id, name, species, cover_photo, submission_status, admin_feedback, slug, created_at"
    )
    .eq("submitted_by", user!.id)
    .order("created_at", { ascending: false });

  const submissions = (data ?? []) as Pick<
    Animal,
    | "id"
    | "name"
    | "species"
    | "cover_photo"
    | "submission_status"
    | "admin_feedback"
    | "slug"
    | "created_at"
  >[];

  const { data: whatsappSetting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "admin_whatsapp")
    .single();

  const whatsapp = whatsappSetting?.value || null;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
          Minhas Solicitações
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Acompanhe o status dos animais que você cadastrou.
        </Typography>
      </Box>

      {/* FAB */}
      <Link href="/minha-conta/novo" className="animate-pulse-once" style={{ textDecoration: "none", position: "fixed", bottom: 24, right: 24, zIndex: 1000 }}>
        <Fab color="primary">
          <AddIcon />
        </Fab>
      </Link>

      {/* WhatsApp */}
      {whatsapp && (
        <Card
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
            color: "white",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "flex-start", sm: "center" },
              gap: 2,
              py: 2,
            }}
          >
            <WhatsAppIcon sx={{ fontSize: 32 }} />
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={600}>
                Dúvidas sobre o processo?
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Fale diretamente com a administradora pelo WhatsApp.
              </Typography>
            </Box>
            <Button
              variant="contained"
              href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              sx={{
                bgcolor: "white",
                color: "#128C7E",
                "&:hover": { bgcolor: "grey.100" },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Abrir Chat
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {submissions.length === 0 ? (
        <Card
          sx={{
            textAlign: "center",
            py: 8,
            px: 4,
            border: "2px dashed",
            borderColor: "divider",
            bgcolor: "transparent",
            boxShadow: "none",
          }}
        >
          <PetsIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma solicitação ainda
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Cadastre um animal para adoção e acompanhe o processo aqui.
          </Typography>
          <Link href="/minha-conta/novo" style={{ textDecoration: "none" }}>
            <Button variant="contained" startIcon={<AddIcon />}>
              Cadastrar Primeiro Animal
            </Button>
          </Link>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {submissions.map((sub, index) => {
            const config =
              STATUS_CONFIG[sub.submission_status ?? "pending"];
            return (
              <Grid key={sub.id} size={{ xs: 12, sm: 6, lg: 4 }} sx={{ animation: "fadeInUp 0.4s ease both", animationDelay: `${index * 0.05}s` }}>
                <Link
                  href={`/minha-conta/${sub.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                      },
                    }}
                  >
                    {/* Photo */}
                    <Box
                      sx={{
                        position: "relative",
                        pt: { xs: "40%", sm: "56%" },
                        bgcolor: "grey.100",
                      }}
                    >
                      {sub.cover_photo ? (
                        <Image
                          src={sub.cover_photo}
                          alt={sub.name}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                        />
                      ) : (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PetsIcon sx={{ fontSize: 48, color: "grey.300" }} />
                        </Box>
                      )}
                      <Chip
                        label={config.label}
                        color={config.color}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    <CardContent sx={{ py: { xs: 1.5, sm: 2 } }}>
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="h6" fontWeight={700}>
                            {sub.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(sub.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </Typography>
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                          {SPECIES_LABELS[sub.species] ?? sub.species}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontStyle: "italic" }}
                        >
                          {config.desc}
                        </Typography>

                        {sub.submission_status === "rejected" &&
                          sub.admin_feedback && (
                            <Alert severity="error" sx={{ mt: 1 }} icon={false}>
                              <Typography variant="caption" fontWeight={600}>
                                Feedback:
                              </Typography>
                              <Typography variant="caption" display="block">
                                {sub.admin_feedback.length > 80
                                  ? sub.admin_feedback.slice(0, 80) + "..."
                                  : sub.admin_feedback}
                              </Typography>
                            </Alert>
                          )}

                        {sub.submission_status === "approved" && (
                          <Chip
                            label="Ver no catálogo →"
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ alignSelf: "flex-start", mt: 0.5 }}
                          />
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
