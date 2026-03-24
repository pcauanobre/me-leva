import type { Metadata } from "next";
import { Box, Typography } from "@mui/material";
import AnimalForm from "../AnimalForm";

export const metadata: Metadata = {
  title: "Novo Animal",
};

export default function NovoAnimalPage() {
  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Novo Animal
      </Typography>
      <AnimalForm />
    </Box>
  );
}
