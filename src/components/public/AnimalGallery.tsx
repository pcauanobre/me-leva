"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Box, Stack, IconButton, Dialog, Backdrop } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PetsIcon from "@mui/icons-material/Pets";
import CloseIcon from "@mui/icons-material/Close";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";

interface Props {
  photos: string[];
  name: string;
}

export default function AnimalGallery({ photos, name }: Props) {
  const [current, setCurrent] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => {
    if (!lightboxOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight" && photos.length > 1) {
        setCurrent((p) => (p === photos.length - 1 ? 0 : p + 1));
      }
      if (e.key === "ArrowLeft" && photos.length > 1) {
        setCurrent((p) => (p === 0 ? photos.length - 1 : p - 1));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, photos.length]);

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
          cursor: "zoom-in",
          "&:hover .zoom-hint": { opacity: 1 },
        }}
        onClick={() => setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="Ampliar foto"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setLightboxOpen(true);
          }
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

        <Box
          className="zoom-hint"
          sx={{
            position: "absolute",
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 12 },
            bgcolor: "rgba(0,0,0,0.55)",
            color: "white",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: { xs: 1, sm: 0 },
            transition: "opacity 0.2s",
            pointerEvents: "none",
          }}
        >
          <ZoomOutMapIcon fontSize="small" />
        </Box>

        {photos.length > 1 && (
          <>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                setCurrent((p) => (p === 0 ? photos.length - 1 : p - 1));
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                setCurrent((p) => (p === photos.length - 1 ? 0 : p + 1));
              }}
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
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{ mt: { xs: 1, sm: 2 }, overflowX: "auto", pb: 0.5 }}
        >
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

      {/* Lightbox */}
      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth={false}
        fullScreen
        slots={{ backdrop: Backdrop }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: "rgba(0,0,0,0.95)",
              boxShadow: "none",
              m: 0,
            },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setLightboxOpen(false)}
        >
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{
              position: "absolute",
              top: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              bgcolor: "rgba(255,255,255,0.15)",
              color: "white",
              width: 48,
              height: 48,
              zIndex: 2,
              "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
            }}
            aria-label="Fechar"
          >
            <CloseIcon />
          </IconButton>

          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: "relative",
              width: "100%",
              height: "100%",
              maxWidth: "100vw",
              maxHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: { xs: 2, sm: 4 },
            }}
          >
            <Box
              sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                maxWidth: { xs: "100%", md: 1200 },
              }}
            >
              <Image
                src={photos[current]}
                alt={`${name} - foto ${current + 1}`}
                fill
                style={{ objectFit: "contain" }}
                sizes="100vw"
                priority
              />
            </Box>
          </Box>

          {photos.length > 1 && (
            <>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((p) =>
                    p === 0 ? photos.length - 1 : p - 1,
                  );
                }}
                sx={{
                  position: "absolute",
                  left: { xs: 8, sm: 24 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  width: 48,
                  height: 48,
                  zIndex: 2,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
                aria-label="Foto anterior"
              >
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent((p) =>
                    p === photos.length - 1 ? 0 : p + 1,
                  );
                }}
                sx={{
                  position: "absolute",
                  right: { xs: 8, sm: 24 },
                  top: "50%",
                  transform: "translateY(-50%)",
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  width: 48,
                  height: 48,
                  zIndex: 2,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
                aria-label="Próxima foto"
              >
                <ArrowForwardIosIcon />
              </IconButton>
            </>
          )}

          {photos.length > 1 && (
            <Box
              sx={{
                position: "absolute",
                bottom: { xs: 12, sm: 24 },
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                fontSize: 14,
                bgcolor: "rgba(0,0,0,0.5)",
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
              }}
            >
              {current + 1} / {photos.length}
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
}
