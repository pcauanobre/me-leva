import type { Metadata } from "next";
import { Container, Box } from "@mui/material";
import AdoptionForm from "@/components/public/AdoptionForm";

export const metadata: Metadata = {
  title: "Formulário de Adoção",
  description:
    "Preencha o formulário de candidatura para adotar um animalzinho resgatado pela Me Leva!",
};

interface AdotarPageProps {
  searchParams: Promise<{ animal?: string }>;
}

export default async function AdotarPage({ searchParams }: AdotarPageProps) {
  const params = await searchParams;
  const animalId = params.animal || undefined;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: { xs: 2, sm: 4 } }}>
        <AdoptionForm animalId={animalId} />
      </Box>
    </Container>
  );
}
