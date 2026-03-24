import type { Metadata } from "next";
import { Box, Typography, Stack, Paper, Alert } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import SubmissionForm from "../SubmissionForm";

export const metadata: Metadata = {
  title: "Cadastrar Animal",
};

export default function NovaSubmissaoPage() {
  return (
    <Box className="animate-fade-in-up">
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
          Cadastrar Animal
        </Typography>
        <Typography color="text.secondary">
          Preencha os dados do animal que você deseja colocar para adoção.
        </Typography>
      </Stack>

      <Alert
        severity="info"
        icon={<InfoIcon />}
        sx={{
          mb: { xs: 3, sm: 4 },
          borderRadius: 2,
          bgcolor: "primary.50",
          color: "primary.dark",
          py: { xs: 0.5, sm: 1 },
          "& .MuiAlert-icon": { color: "primary.main" },
        }}
      >
        <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
          <strong>Como funciona:</strong> Após enviar, a administradora irá
          revisar os dados e fotos. Você será notificado sobre a aprovação ou
          se ajustes forem necessários. Você pode adicionar fotos após criar
          a solicitação.
        </Typography>
      </Alert>

      <SubmissionForm />
    </Box>
  );
}
