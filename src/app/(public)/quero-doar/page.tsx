import type { Metadata } from "next";
import { Container, Typography, Box, Paper, Stack } from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import SearchIcon from "@mui/icons-material/Search";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DonationRequestForm from "@/components/public/DonationRequestForm";

export const metadata: Metadata = {
  title: "Quero Doar um Animal",
  description:
    "Precisa doar seu animal? Envie uma solicitação para a Me Leva! Nossa equipe irá avaliar e entrar em contato.",
};

const STEPS = [
  { icon: <PetsIcon />, title: "Preencha o formulário", text: "Informe seus dados, os dados do animal e o motivo da doação." },
  { icon: <SearchIcon />, title: "Análise pela ONG", text: "Nossa equipe avalia cada solicitação para garantir o bem-estar do animal." },
  { icon: <ChatIcon />, title: "Entraremos em contato", text: "Se aprovado, entramos em contato pelo WhatsApp para combinar os próximos passos." },
  { icon: <CheckCircleIcon />, title: "Animal entra no catálogo", text: "O animal é cadastrado na plataforma e disponibilizado para adoção responsável." },
];

export default function QueroDoarePage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: "1.75rem", sm: "2.5rem" } }}>
        Quero Doar um Animal
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4, fontSize: { xs: "0.95rem", sm: "1rem" } }}>
        Se você precisa encontrar um novo lar para seu animal, a Me Leva! pode ajudar. Antes de aceitar o animal em nossa plataforma, nossa equipe avalia a solicitação para garantir que tudo seja feito de forma responsável.
      </Typography>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4, bgcolor: "primary.50" }} variant="outlined">
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Como funciona
        </Typography>
        <Stack spacing={2}>
          {STEPS.map((step, i) => (
            <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
              <Box sx={{ color: "primary.main", mt: 0.25, flexShrink: 0 }}>
                {step.icon}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={700}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.text}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Paper>

      <DonationRequestForm />
    </Container>
  );
}
