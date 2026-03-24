import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { Box, Typography } from "@mui/material";
import type { Animal } from "@/lib/supabase/types";
import StoryGenerator from "./StoryGenerator";

export const metadata: Metadata = {
  title: "Gerar Stories",
};

export default async function StoriesPage() {
  const supabase = await createServerClient();

  const { data } = await supabase
    .from("animals")
    .select("id, name, cover_photo, species")
    .not("cover_photo", "is", null)
    .or("submission_status.is.null,submission_status.eq.approved")
    .order("name");

  const animals = (data ?? []) as Pick<Animal, "id" | "name" | "cover_photo" | "species">[];

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight={800}
        gutterBottom
        sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
      >
        Gerar Stories
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Selecione os animais e gere imagens prontas para o Instagram Stories.
      </Typography>
      <StoryGenerator animals={animals} />
    </Box>
  );
}
