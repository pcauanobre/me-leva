import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Stack,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import AnimalCard from "@/components/public/AnimalCard";

export default async function HomePage() {
  const supabase = await createServerClient();

  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

  const { data: animals } = await supabase
    .from("animals")
    .select("id, name, slug, species, size, status, cover_photo, age_months, created_at, adopted_at")
    .or("submission_status.is.null,submission_status.eq.approved")
    .or(`status.neq.adotado,and(status.eq.adotado,adopted_at.gt.${threeDaysAgo})`)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #8B3FA0 0%, #E8618C 100%)",
          color: "white",
          py: { xs: 5, md: 10 },
          textAlign: "center",
        }}
      >
        <Container maxWidth="md">
          <img src="/logo.svg" alt="Me Leva!" width={72} height={72} style={{ marginBottom: 16, opacity: 0.9 }} className="animate-fade-in-up" />
          <Typography
            className="animate-fade-in-up delay-1"
            variant="h2"
            fontWeight={800}
            sx={{ fontSize: { xs: "1.75rem", md: "3.5rem" }, mb: { xs: 1.5, md: 2 } }}
          >
            Adote um amigo.
            <br />
            Mude uma vida.
          </Typography>
          <Typography
            className="animate-fade-in-up delay-2"
            variant="h6"
            sx={{ mb: { xs: 3, md: 4 }, opacity: 0.9, fontWeight: 400, fontSize: { xs: "0.95rem", md: "1.25rem" } }}
          >
            Animais resgatados em Fortaleza esperando por um lar amoroso.
          </Typography>
          <Link href="/animais" style={{ textDecoration: "none" }} className="animate-fade-in-up delay-3">
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "primary.main",
                px: { xs: 3, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontSize: { xs: "0.9rem", sm: "1.1rem" },
                "&:hover": { bgcolor: "grey.100" },
              }}
              startIcon={<SearchIcon />}
            >
              Ver Animais Disponíveis
            </Button>
          </Link>
        </Container>
      </Box>

      {/* How it works — above animals */}
      <Box sx={{ bgcolor: "grey.50", py: { xs: 4, md: 8 } }}>
        <Container maxWidth="md">
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
          >
            Como funciona?
          </Typography>
          <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mt: { xs: 1, md: 2 } }}>
            {[
              {
                step: "1",
                title: "Escolha",
                desc: "Navegue pelos animais disponíveis e encontre seu match.",
              },
              {
                step: "2",
                title: "Preencha",
                desc: "Envie o formulário de interesse com seus dados.",
              },
              {
                step: "3",
                title: "Adote",
                desc: "Entraremos em contato para combinar a adoção.",
              },
            ].map((item, index) => (
              <Grid key={item.step} size={{ xs: 12, md: 4 }} className={`animate-fade-in-up delay-${index + 1}`}>
                <Stack alignItems="center" textAlign="center" spacing={{ xs: 0.5, md: 1 }}>
                  <Box
                    sx={{
                      width: { xs: 40, sm: 56 },
                      height: { xs: 40, sm: 56 },
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: { xs: "1rem", sm: "1.25rem" },
                      fontWeight: 700,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    {item.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    {item.desc}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Featured animals */}
      {animals && animals.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            textAlign="center"
            gutterBottom
            sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
          >
            Conheça nossos resgatados
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ mb: { xs: 3, md: 5 }, fontSize: { xs: "0.875rem", md: "1rem" } }}
          >
            Cada um deles tem uma história e merece um final feliz.
          </Typography>

          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
            {animals.map((animal, index) => (
              <Grid key={animal.id} size={{ xs: 6, sm: 6, md: 4 }} sx={{ animation: "fadeInUp 0.4s ease both", animationDelay: `${index * 0.05}s` }}>
                <AnimalCard animal={animal} />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: { xs: 3, md: 4 } }}>
            <Link href="/animais" style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="large" sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                Ver todos os animais
              </Button>
            </Link>
          </Box>
        </Container>
      )}

      {/* CTA: Cadastrar animal */}
      <Box className="animate-fade-in-up" sx={{ py: { xs: 4, md: 8 }, textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}>
            Quer doar um animal?
          </Typography>
          <Typography color="text.secondary" sx={{ mb: { xs: 2, md: 3 }, fontSize: { xs: "0.875rem", md: "1rem" } }}>
            Cadastre o animal na nossa plataforma e encontraremos um lar
            amoroso para ele.
          </Typography>
          <Link href="/minha-conta/novo" style={{ textDecoration: "none" }}>
            <Button variant="contained" size="large" sx={{ px: { xs: 3, sm: 4 }, py: { xs: 1, sm: 1.5 }, fontSize: { xs: "0.9rem", sm: "1rem" } }}>
              Cadastrar Animal para Adoção
            </Button>
          </Link>
        </Container>
      </Box>
    </>
  );
}
