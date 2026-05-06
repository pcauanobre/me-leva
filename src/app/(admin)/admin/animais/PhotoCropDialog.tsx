"use client";

import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Slider,
  Stack,
  Typography,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface PendingFile {
  file: File;
  url: string;
}

interface Props {
  open: boolean;
  pending: PendingFile | null;
  onCancel: () => void;
  onConfirm: (croppedBlob: Blob, originalName: string) => void;
}

const OUTPUT_W = 1200;
const OUTPUT_H = 900; // 4:3

export default function PhotoCropDialog({
  open,
  pending,
  onCancel,
  onConfirm,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [imgNatural, setImgNatural] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [containerSize, setContainerSize] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{
    x: number;
    y: number;
    ox: number;
    oy: number;
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setImgNatural(null);
  }, [open, pending?.url]);

  useEffect(() => {
    if (!open) return;
    function measure() {
      if (containerRef.current) {
        setContainerSize(containerRef.current.clientWidth);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open]);

  function onImgLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const img = e.currentTarget;
    setImgNatural({ w: img.naturalWidth, h: img.naturalHeight });
  }

  const containerH = containerSize * (3 / 4);

  function baseScale() {
    if (!imgNatural || !containerSize) return 1;
    return Math.max(
      containerSize / imgNatural.w,
      containerH / imgNatural.h,
    );
  }

  function clampOffset(next: { x: number; y: number }, scale: number) {
    if (!imgNatural || !containerSize) return next;
    const renderedW = imgNatural.w * scale;
    const renderedH = imgNatural.h * scale;
    const maxX = Math.max(0, (renderedW - containerSize) / 2);
    const maxY = Math.max(0, (renderedH - containerH) / 2);
    return {
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    };
  }

  const scale = baseScale() * zoom;

  function onPointerDown(e: React.PointerEvent) {
    if (!imgNatural) return;
    setDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset(
      clampOffset(
        { x: dragStart.current.ox + dx, y: dragStart.current.oy + dy },
        scale,
      ),
    );
  }

  function onPointerUp() {
    setDragging(false);
    dragStart.current = null;
  }

  function handleZoomChange(_: Event, value: number | number[]) {
    const v = Array.isArray(value) ? value[0] : value;
    setZoom(v);
    const newScale = baseScale() * v;
    setOffset((prev) => clampOffset(prev, newScale));
  }

  function reset() {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }

  async function handleConfirm() {
    if (!imgNatural || !containerSize || !pending) return;

    const renderedW = imgNatural.w * scale;
    const renderedH = imgNatural.h * scale;
    const left = (containerSize - renderedW) / 2 + offset.x;
    const top = (containerH - renderedH) / 2 + offset.y;

    const sx = (-left) / scale;
    const sy = (-top) / scale;
    const sW = containerSize / scale;
    const sH = containerH / scale;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = pending.url;
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("img load failed"));
    });

    ctx.drawImage(img, sx, sy, sW, sH, 0, 0, OUTPUT_W, OUTPUT_H);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!blob) return;
    onConfirm(blob, pending.file.name);
  }

  const renderedW = imgNatural ? imgNatural.w * scale : 0;
  const renderedH = imgNatural ? imgNatural.h * scale : 0;

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3 } } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Ajustar foto</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Arraste para reposicionar e use o zoom para enquadrar a foto.
            A área visível é o que será publicado.
          </Typography>

          <Box
            ref={containerRef}
            sx={{
              width: "100%",
              aspectRatio: "4 / 3",
              bgcolor: "#0a0a0a",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
              touchAction: "none",
              cursor: dragging ? "grabbing" : "grab",
              userSelect: "none",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {pending && (
              <img
                ref={imgRef}
                src={pending.url}
                alt="prévia"
                draggable={false}
                onLoad={onImgLoad}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: renderedW || "auto",
                  height: renderedH || "auto",
                  transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                  pointerEvents: "none",
                  maxWidth: "none",
                }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="caption" sx={{ minWidth: 50 }}>
              Zoom
            </Typography>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              onChange={handleZoomChange}
              sx={{ flex: 1 }}
            />
            <Button
              size="small"
              startIcon={<RestartAltIcon />}
              onClick={reset}
            >
              Reset
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!imgNatural}
        >
          Salvar e enviar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
