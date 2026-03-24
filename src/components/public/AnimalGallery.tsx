"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, Stack, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PetsIcon from "@mui/icons-material/Pets";

interface Props {
  photos: string[];
  name: string;
}

export default function AnimalGallery({ photos, name }: Props) {
  const [current, setCurrent] = useState(0);

  if (!photos.length) {
    return (
      <Box
        sx={{
          width: "100%",
          pt: { xs: "100%", sm: "75%" },
          position: "relative",
          bgcolor: "grey.100",
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PetsIcon sx={{ fontSize: 80, color: "grey.300" }} />
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {/* Main image */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          pt: { xs: "100%", sm: "75%" },
          borderRadius: { xs: 2, sm: 3 },
          overflow: "hidden",
          bgcolor: "grey.100",
          animation: "fadeIn 0.3s ease",
        }}
      >
        <Image
          src={photos[current]}
          alt={`${name} - foto ${current + 1}`}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 900px) 100vw, 60vw"
          priority
        />

        {photos.length > 1 && (
          <>
            <IconButton
              onClick={() =>
                setCurrent((p) => (p === 0 ? photos.length - 1 : p - 1))
              }
              sx={{
                position: "absolute",
                left: { xs: 4, sm: 8 },
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                minWidth: 44,
                minHeight: 44,
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
            </IconButton>
            <IconButton
              onClick={() =>
                setCurrent((p) => (p === photos.length - 1 ? 0 : p + 1))
              }
              sx={{
                position: "absolute",
                right: { xs: 4, sm: 8 },
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(0,0,0,0.5)",
                color: "white",
                minWidth: 44,
                minHeight: 44,
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ mt: { xs: 1, sm: 2 }, overflowX: "auto", pb: 0.5 }}>
          {photos.map((url, i) => (
            <Box
              key={url}
              onClick={() => setCurrent(i)}
              sx={{
                width: { xs: 48, sm: 72 },
                height: { xs: 48, sm: 72 },
                flexShrink: 0,
                borderRadius: 1.5,
                overflow: "hidden",
                cursor: "pointer",
                border: "2px solid",
                borderColor: current === i ? "primary.main" : "transparent",
                opacity: current === i ? 1 : 0.6,
                transition: "opacity 0.2s, border-color 0.2s",
                position: "relative",
                "&:hover": { opacity: 1 },
              }}
            >
              <Image
                src={url}
                alt={`${name} - miniatura ${i + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 600px) 48px, 72px"
              />
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
