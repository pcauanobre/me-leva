import type { Metadata } from "next";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import FavoriteIcon from "@mui/icons-material/Favorite";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import SecurityIcon from "@mui/icons-material/Security";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Conheça a história da protetora independente de Fortaleza que resgata e cuida de animais abandonados.",
};

export default function SobrePage() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        fontWeight={800}
        textAlign="center"
        gutterBottom
      >
        Sobre o Me Leva!
      </Typography>

      <Typography
        variant="h6"
        color="text.secondary"
        textAlign="center"
        sx={{ mb: 6 }}
      >
        Uma protetora independente de Fortaleza dedicada a resgatar, cuidar e
        encontrar lares amorosos para animais abandonados.
      </Typography>

      <Stack spacing={4}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Nossa Missão
          </Typography>
          <Typography color="text.secondary" lineHeight={1.8}>
            O Me Leva! nasceu da vontade de dar voz e visibilidade a animais
            resgatados das ruas de Fortaleza. Acreditamos que todo animal merece
            uma segunda chance e que a adoção responsável é o caminho para
            transformar vidas — tanto do animal quanto do adotante.
          </Typography>
        </Paper>

        <Grid container spacing={3}>
          {[
            {
              icon: <PetsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
              title: "Resgate",
              desc: "Resgatamos animais em situação de abandono e maus-tratos nas ruas de Fortaleza.",
            },
            {
              icon: <FavoriteIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
              title: "Cuidado",
              desc: "Cada animal recebe atendimento veterinário, vacinação, castração e muito carinho.",
            },
            {
              icon: (
                <VolunteerActivismIcon
                  sx={{ fontSize: 40, color: "primary.main" }}
                />
              ),
              title: "Adoção",
              desc: "Conectamos animais a famílias amorosas através de um processo transparente e seguro.",
            },
          ].map((item) => (
            <Grid key={item.title} size={{ xs: 12, md: 4 }}>
              <Paper sx={{ p: 3, textAlign: "center", height: "100%" }}>
                <Box sx={{ mb: 2 }}>{item.icon}</Box>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.desc}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper sx={{ p: 4 }}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <SecurityIcon sx={{ fontSize: 32, color: "primary.main", mt: 0.5 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Processo de Adoção
              </Typography>
              <Typography
                component="ol"
                color="text.secondary"
                lineHeight={2}
                sx={{ pl: 2 }}
              >
                <li>Navegue pelos animais disponíveis no nosso catálogo.</li>
                <li>
                  Encontrou seu match? Preencha o formulário de interesse na
                  página do animal.
                </li>
                <li>
                  Nossa equipe entrará em contato para uma conversa e
                  agendamento de visita.
                </li>
                <li>
                  Após aprovação, combinamos a entrega do animal ao novo lar.
                </li>
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
