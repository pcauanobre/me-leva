import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AnimalTable from "./AnimalTable";

export const metadata: Metadata = {
  title: "Animais",
};

export default async function AnimaisPage() {
  const supabase = await createServerClient();

  const { data: animals } = await supabase
    .from("animals")
    .select("id, name, species, breed, status, cover_photo, created_at")
    .order("created_at", { ascending: false });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Animais
        </Typography>
        <Link href="/admin/animais/novo" style={{ textDecoration: "none" }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Novo Animal
          </Button>
        </Link>
      </Box>

      <Paper>
        <AnimalTable animals={animals ?? []} />
      </Paper>
    </Box>
  );
}
