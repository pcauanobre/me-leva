import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Stack,
} from "@mui/material";
import PetsIcon from "@mui/icons-material/Pets";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { computeCurrentAge } from "@/lib/utils/computeAge";

const SPECIES_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

const SIZE_LABELS: Record<string, string> = {
  pequeno: "Pequeno",
  medio: "Médio",
  grande: "Grande",
};

interface Props {
  animal: {
    id: string;
    name: string;
    slug: string;
    species: string;
    size: string | null;
    status: string;
    cover_photo: string | null;
    age_months: number | null;
    created_at: string;
    adopted_at?: string | null;
  };
}

export default function AnimalCard({ animal }: Props) {
  const isAdopted = animal.status === "adotado";
  const ageLabel = computeCurrentAge(animal.age_months, animal.created_at);

  const cardContent = (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.2s, box-shadow 0.2s",
        "& img": { transition: "transform 0.4s ease" },
        ...(!isAdopted && {
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          },
          "&:hover img": { transform: "scale(1.05)" },
          "&:active": {
            transform: "scale(0.98)",
          },
        }),
        ...(isAdopted && {
          opacity: 0.75,
        }),
      }}
    >
      <Box sx={{ position: "relative", pt: { xs: "100%", sm: "75%" }, bgcolor: "grey.100" }}>
        {animal.cover_photo ? (
          <Image
            src={animal.cover_photo}
            alt={animal.name}
            fill
            style={{
              objectFit: "cover",
              ...(isAdopted && { filter: "grayscale(100%)" }),
            }}
            sizes="(max-width: 600px) 50vw, (max-width: 900px) 50vw, 33vw"
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
            <PetsIcon sx={{ fontSize: 64, color: "grey.300" }} />
          </Box>
        )}

        {/* Adopted overlay */}
        {isAdopted && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 0.5,
            }}
          >
            <FavoriteIcon sx={{ fontSize: 36, color: "#E8618C" }} />
            <Chip
              label="Adotado!"
              sx={{
                bgcolor: "#E8618C",
                color: "white",
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            />
          </Box>
        )}

      </Box>
      <CardContent sx={{ flexGrow: 1, p: { xs: 1.5, sm: 2 }, "&:last-child": { pb: { xs: 1.5, sm: 2 } } }}>
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: "0.9rem", sm: "1.25rem" } }}
        >
          {animal.name}
        </Typography>
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={0.5}
          sx={{
            "& > :nth-of-type(n+3)": {
              display: { xs: "none", sm: "flex" },
            },
          }}
        >
          <Chip
            label={SPECIES_LABELS[animal.species] ?? animal.species}
            size="small"
            variant="outlined"
            sx={{ "& .MuiChip-label": { fontSize: { xs: "0.65rem", sm: "0.8125rem" } } }}
          />
          {animal.size && (
            <Chip
              label={SIZE_LABELS[animal.size]}
              size="small"
              variant="outlined"
              sx={{ "& .MuiChip-label": { fontSize: { xs: "0.65rem", sm: "0.8125rem" } } }}
            />
          )}
          {ageLabel !== "Não informada" && (
            <Chip
              label={ageLabel}
              size="small"
              variant="outlined"
              sx={{ "& .MuiChip-label": { fontSize: { xs: "0.65rem", sm: "0.8125rem" } } }}
            />
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  if (isAdopted) {
    return <Box sx={{ height: "100%" }}>{cardContent}</Box>;
  }

  return (
    <Link
      href={`/animais/${animal.slug}`}
      style={{ textDecoration: "none", display: "block", height: "100%" }}
    >
      {cardContent}
    </Link>
  );
}
