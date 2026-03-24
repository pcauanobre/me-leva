"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Alert,
  Paper,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadPhotos, deletePhoto } from "./actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
  animalId: string;
  photos: string[];
}

export default function PhotoUploader({ animalId, photos: initialPhotos }: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    // Validate files
    for (const file of Array.from(files)) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        setError("Apenas JPG, PNG ou WebP");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Cada foto deve ter no maximo 5MB");
        return;
      }
    }

    setError(null);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("photos", f));

    startTransition(async () => {
      const result = await uploadPhotos(animalId, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.urls) {
        setPhotos(result.urls);
      }
    });

    // Reset input
    if (fileRef.current) fileRef.current.value = "";
  }

  function confirmDeletePhoto() {
    if (!deleteUrl) return;
    const url = deleteUrl;
    startTransition(async () => {
      const result = await deletePhoto(animalId, url);
      if (result.error) {
        setError(result.error);
      } else {
        setPhotos((prev) => prev.filter((p) => p !== url));
      }
      setDeleteUrl(null);
    });
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Fotos ({photos.length}/5)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
        {photos.map((url) => (
          <Box
            key={url}
            sx={{
              position: "relative",
              width: { xs: "calc(50% - 8px)", sm: 150 },
              height: { xs: "auto", sm: 150 },
              aspectRatio: { xs: "1", sm: "unset" },
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Image
              src={url}
              alt="Foto do animal"
              fill
              style={{ objectFit: "cover" }}
            />
            <IconButton
              size="small"
              onClick={() => setDeleteUrl(url)}
              disabled={isPending}
              sx={{
                position: "absolute",
                top: 4,
                right: 4,
                bgcolor: "rgba(0,0,0,0.6)",
                color: "white",
                "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      {photos.length < 5 && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => fileRef.current?.click()}
            disabled={isPending}
          >
            {isPending ? "Enviando..." : "Adicionar Fotos"}
          </Button>
        </>
      )}
      <ConfirmDialog
        open={!!deleteUrl}
        title="Remover foto"
        message="Tem certeza que deseja remover esta foto?"
        confirmLabel="Remover"
        confirmColor="error"
        onConfirm={confirmDeletePhoto}
        onCancel={() => setDeleteUrl(null)}
      />
    </Paper>
  );
}
