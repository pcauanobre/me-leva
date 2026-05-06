"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
import PhotoCropDialog from "./PhotoCropDialog";

interface Props {
  animalId: string;
  photos: string[];
}

interface PendingFile {
  file: File;
  url: string;
}

export default function PhotoUploader({
  animalId,
  photos: initialPhotos,
}: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingFile | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (pending) URL.revokeObjectURL(pending.url);
    };
  }, [pending]);

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;

    const file = files[0];
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Apenas JPG, PNG ou WebP");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Cada foto deve ter no máximo 5MB");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setError(null);
    const url = URL.createObjectURL(file);
    setPending({ file, url });

    if (fileRef.current) fileRef.current.value = "";
  }

  function handleCropConfirm(blob: Blob, originalName: string) {
    const ext = originalName.split(".").pop() || "jpg";
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const cropped = new File([blob], `${baseName}-cropped.${ext}`, {
      type: "image/jpeg",
    });

    const formData = new FormData();
    formData.append("photos", cropped);

    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);

    startTransition(async () => {
      const result = await uploadPhotos(animalId, formData);
      if (result.error) {
        setError(result.error);
      } else if (result.urls) {
        setPhotos(result.urls);
      }
    });
  }

  function handleCropCancel() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
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
            onChange={handleFilePick}
            style={{ display: "none" }}
          />
          <Button
            variant="outlined"
            startIcon={<AddPhotoAlternateIcon />}
            onClick={() => fileRef.current?.click()}
            disabled={isPending}
          >
            {isPending ? "Enviando..." : "Adicionar Foto"}
          </Button>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 1 }}
          >
            Após selecionar, ajuste o enquadramento antes de enviar.
          </Typography>
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

      <PhotoCropDialog
        open={!!pending}
        pending={pending}
        onCancel={handleCropCancel}
        onConfirm={handleCropConfirm}
      />
    </Paper>
  );
}
