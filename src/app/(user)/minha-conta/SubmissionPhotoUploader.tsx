"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Typography,
  Alert,
  Paper,
  LinearProgress,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import StarIcon from "@mui/icons-material/Star";
import { uploadSubmissionPhotos, deleteSubmissionPhoto } from "./actions";
import { compressImage } from "@/lib/utils/compressImage";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
  animalId: string;
  photos: string[];
  readOnly?: boolean;
}

export default function SubmissionPhotoUploader({
  animalId,
  photos: initialPhotos,
  readOnly,
}: Props) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDragOver, setIsDragOver] = useState(false);
  const [deleteUrl, setDeleteUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);

      for (const file of fileArray) {
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
          setError("Apenas JPG, PNG ou WebP sao aceitos.");
          return;
        }
      }

      if (photos.length + fileArray.length > 5) {
        setError(`Voce pode adicionar mais ${5 - photos.length} foto(s).`);
        return;
      }

      setError(null);

      // Compress files > 5MB automatically
      const MAX_SIZE = 5 * 1024 * 1024;
      const processed: File[] = [];
      for (const file of fileArray) {
        if (file.size > MAX_SIZE) {
          try {
            processed.push(await compressImage(file, MAX_SIZE));
          } catch {
            setError(`Erro ao comprimir ${file.name}`);
            return;
          }
        } else {
          processed.push(file);
        }
      }

      const formData = new FormData();
      processed.forEach((f) => formData.append("photos", f));

      startTransition(async () => {
        const result = await uploadSubmissionPhotos(animalId, formData);
        if (result.error) {
          setError(result.error);
        } else if (result.urls) {
          setPhotos(result.urls);
        }
      });
    },
    [animalId, photos.length]
  );

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  }

  function confirmDeletePhoto() {
    if (!deleteUrl) return;
    const url = deleteUrl;
    startTransition(async () => {
      const result = await deleteSubmissionPhoto(animalId, url);
      if (result.error) {
        setError(result.error);
      } else {
        setPhotos((prev) => prev.filter((p) => p !== url));
      }
      setDeleteUrl(null);
    });
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, position: "relative" }}>
      {isPending && (
        <LinearProgress
          sx={{ position: "absolute", top: 0, left: 0, right: 0, borderRadius: "12px 12px 0 0" }}
        />
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <PhotoCameraIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Fotos do Animal
          </Typography>
        </Stack>
        <Chip
          label={`${photos.length}/5`}
          size="small"
          color={photos.length === 0 ? "default" : "primary"}
          variant={photos.length === 5 ? "filled" : "outlined"}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Photo grid */}
      {photos.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
          {photos.map((url, i) => (
            <Box
              key={url}
              sx={{
                position: "relative",
                width: { xs: "calc(50% - 6px)", sm: 160 },
                aspectRatio: "1",
                borderRadius: 2,
                overflow: "hidden",
                border: "2px solid",
                borderColor: i === 0 ? "primary.main" : "divider",
              }}
            >
              <Image
                src={url}
                alt={`Foto ${i + 1}`}
                fill
                style={{ objectFit: "cover" }}
                sizes="160px"
              />
              {i === 0 && (
                <Chip
                  icon={<StarIcon />}
                  label="Capa"
                  size="small"
                  color="primary"
                  sx={{
                    position: "absolute",
                    bottom: 6,
                    left: 6,
                    fontSize: "0.7rem",
                    height: 24,
                  }}
                />
              )}
              {!readOnly && (
                <IconButton
                  size="small"
                  onClick={() => setDeleteUrl(url)}
                  disabled={isPending}
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    bgcolor: "rgba(0,0,0,0.6)",
                    color: "white",
                    width: 28,
                    height: 28,
                    "&:hover": { bgcolor: "error.main" },
                  }}
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          ))}
        </Stack>
      )}

      {/* Drop zone */}
      {!readOnly && photos.length < 5 && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            style={{ display: "none" }}
          />
          <Box
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            sx={{
              border: "2px dashed",
              borderColor: isDragOver ? "primary.main" : "divider",
              borderRadius: 2,
              p: { xs: 2, sm: 4 },
              textAlign: "center",
              cursor: "pointer",
              bgcolor: isDragOver ? "primary.50" : "grey.50",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: "primary.light",
                bgcolor: "grey.100",
              },
            }}
          >
            <CloudUploadIcon
              sx={{
                fontSize: { xs: 32, sm: 40 },
                color: isDragOver ? "primary.main" : "grey.400",
                mb: 1,
              }}
            />
            <Typography fontWeight={600} gutterBottom>
              {isPending
                ? "Enviando fotos..."
                : "Arraste fotos aqui ou clique para selecionar"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              JPG, PNG ou WebP - Max 5MB cada - Ate{" "}
              {5 - photos.length} foto(s) restante(s)
            </Typography>
          </Box>
        </>
      )}

      {photos.length === 0 && readOnly && (
        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: "grey.50",
          }}
        >
          <PhotoCameraIcon sx={{ fontSize: 40, color: "grey.300", mb: 1 }} />
          <Typography color="text.secondary">
            Nenhuma foto adicionada.
          </Typography>
        </Box>
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
