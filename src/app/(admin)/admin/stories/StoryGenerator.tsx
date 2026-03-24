"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

interface Animal {
  id: string;
  name: string;
  cover_photo: string | null;
  species: string;
}

interface Props {
  animals: Animal[];
}

// Layout variations based on how many animals in the group
const LAYOUTS: Record<number, { slots: { cx: number; cy: number; w: number; h: number; rotation: number }[]; drawOrder: number[] }> = {
  1: {
    slots: [
      { cx: 540, cy: 856, w: 832, h: 840, rotation: -1.9 },
    ],
    drawOrder: [0],
  },
  2: {
    slots: [
      { cx: 358, cy: 558, w: 612, h: 620, rotation: -6 },
      { cx: 700, cy: 1252, w: 616, h: 616, rotation: 9.5 },
    ],
    drawOrder: [0, 1],
  },
  3: {
    slots: [
      { cx: 308, cy: 536, w: 520, h: 528, rotation: -6 },
      { cx: 772, cy: 856, w: 536, h: 536, rotation: 3.6 },
      { cx: 372, cy: 1360, w: 528, h: 512, rotation: -6.2 },
    ],
    drawOrder: [0, 2, 1], // slot 1 on top
  },
};

const CANVAS_W = 1080;
const CANVAS_H = 1920;

async function loadImage(src: string): Promise<HTMLImageElement> {
  // Fetch as blob to avoid CORS tainted canvas
  const res = await fetch(src);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function drawSlot(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  name: string,
  slot: { cx: number; cy: number; w: number; h: number; rotation: number }
) {
  const { cx, cy, w, h, rotation } = slot;
  const rad = (rotation * Math.PI) / 180;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rad);

  // Draw photo (cover entire slot, center crop)
  const imgRatio = img.width / img.height;
  const slotRatio = w / h;
  let sw: number, sh: number, sx: number, sy: number;

  if (imgRatio > slotRatio) {
    sh = img.height;
    sw = sh * slotRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / slotRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  const r = 16;
  const border = 16;

  // White border
  ctx.fillStyle = "#FFFFFF";
  ctx.beginPath();
  ctx.roundRect(-w / 2 - border, -h / 2 - border, w + border * 2, h + border * 2, r + 2);
  ctx.fill();

  // Clip to photo area
  ctx.beginPath();
  ctx.roundRect(-w / 2, -h / 2, w, h, r);
  ctx.clip();

  ctx.drawImage(img, sx, sy, sw, sh, -w / 2, -h / 2, w, h);

  // Name banner at bottom (fixed size regardless of slot)
  const bannerH = 64;
  const fontSize = 40;
  ctx.fillStyle = "rgba(107, 37, 128, 0.9)";
  ctx.fillRect(-w / 2, h / 2 - bannerH, w, bannerH);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold ${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name.toUpperCase(), 0, h / 2 - bannerH / 2, w - 30);

  ctx.restore();
}

async function generateStory(
  templateImg: HTMLImageElement,
  animalGroup: Animal[]
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  const ctx = canvas.getContext("2d")!;

  // Draw template background
  ctx.drawImage(templateImg, 0, 0, CANVAS_W, CANVAS_H);

  // Pick layout based on group size
  const layout = LAYOUTS[animalGroup.length] || LAYOUTS[3];
  const { slots, drawOrder } = layout;

  // Draw each animal photo in correct order
  for (const drawIdx of drawOrder) {
    if (drawIdx >= animalGroup.length) continue;
    const animal = animalGroup[drawIdx];
    if (!animal.cover_photo) continue;

    try {
      const img = await loadImage(animal.cover_photo);
      drawSlot(ctx, img, animal.name, slots[drawIdx]);
    } catch {
      ctx.save();
      const slot = slots[drawIdx];
      ctx.translate(slot.cx, slot.cy);
      ctx.rotate((slot.rotation * Math.PI) / 180);
      ctx.fillStyle = "#E0E0E0";
      ctx.beginPath();
      ctx.roundRect(-slot.w / 2, -slot.h / 2, slot.w, slot.h, 16);
      ctx.fill();
      ctx.fillStyle = "#999";
      ctx.font = "bold 24px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(animal.name, 0, 0);
      ctx.restore();
    }
  }

  return canvas.toDataURL("image/png");
}

export default function StoryGenerator({ animals }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [previews, setPreviews] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const templateRef = useRef<HTMLImageElement | null>(null);

  const toggleAnimal = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedAnimals = animals.filter((a) => selected.has(a.id));
  const storyCount = Math.ceil(selectedAnimals.length / 3);

  async function handleGenerate() {
    if (selectedAnimals.length === 0) return;
    setGenerating(true);
    setPreviews([]);

    try {
      // Load template
      if (!templateRef.current) {
        templateRef.current = await loadImage("/story-template.png");
      }

      const results: string[] = [];
      for (let i = 0; i < selectedAnimals.length; i += 3) {
        const group = selectedAnimals.slice(i, i + 3);
        const dataUrl = await generateStory(templateRef.current, group);
        results.push(dataUrl);
      }

      setPreviews(results);
    } catch (err) {
      console.error("Error generating stories:", err);
    } finally {
      setGenerating(false);
    }
  }

  function downloadImage(dataUrl: string, index: number) {
    const link = document.createElement("a");
    link.download = `meleva-story-${index + 1}.png`;
    link.href = dataUrl;
    link.click();
  }

  return (
    <Stack spacing={3}>
      {/* Selection header */}
      <Paper className="animate-fade-in-up" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={`${selected.size} selecionado${selected.size !== 1 ? "s" : ""}`}
              color={selected.size > 0 ? "primary" : "default"}
            />
            {selected.size > 0 && (
              <Typography variant="body2" color="text.secondary">
                → {storyCount} stor{storyCount === 1 ? "y" : "ies"}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" spacing={1}>
            {selected.size > 0 && (
              <Button
                variant="text"
                size="small"
                onClick={() => setSelected(new Set())}
              >
                Limpar
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={
                generating ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />
              }
              onClick={handleGenerate}
              disabled={selected.size === 0 || generating}
            >
              {generating ? "Gerando..." : "Gerar Stories"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Animal grid */}
      <Grid container spacing={{ xs: 1, sm: 2 }}>
        {animals.map((animal, index) => {
          const isSelected = selected.has(animal.id);
          return (
            <Grid key={animal.id} size={{ xs: 4, sm: 3, md: 2 }} sx={{ animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
              <Paper
                onClick={() => toggleAnimal(animal.id)}
                sx={{
                  cursor: "pointer",
                  overflow: "hidden",
                  border: "3px solid",
                  borderColor: isSelected ? "primary.main" : "transparent",
                  transition: "all 0.15s",
                  "&:hover": { borderColor: isSelected ? "primary.main" : "divider" },
                  position: "relative",
                }}
              >
                <Box sx={{ position: "relative", pt: "100%", bgcolor: "grey.100" }}>
                  {animal.cover_photo && (
                    <Image
                      src={animal.cover_photo}
                      alt={animal.name}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="120px"
                    />
                  )}
                  {/* Check overlay */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 6,
                      right: 6,
                      color: isSelected ? "primary.main" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    {isSelected ? (
                      <CheckCircleIcon sx={{ fontSize: 28 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ fontSize: 28 }} />
                    )}
                  </Box>
                </Box>
                <Box sx={{ p: 1, textAlign: "center" }}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    noWrap
                    display="block"
                  >
                    {animal.name}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Previews */}
      {previews.length > 0 && (
        <Paper className="animate-scale-in" sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Stories gerados ({previews.length})
          </Typography>
          <Grid container spacing={2}>
            {previews.map((dataUrl, i) => (
              <Grid key={i} size={{ xs: 6, sm: 4, md: 3 }}>
                <Paper
                  variant="outlined"
                  sx={{ overflow: "hidden", position: "relative" }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      pt: "177.78%", // 9:16 ratio
                      bgcolor: "grey.100",
                    }}
                  >
                    <img
                      src={dataUrl}
                      alt={`Story ${i + 1}`}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                  <Box sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => downloadImage(dataUrl, i)}
                      fullWidth
                      sx={{ textTransform: "none" }}
                    >
                      Baixar Story {i + 1}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Empty state */}
      {animals.length === 0 && (
        <Alert severity="info">
          Nenhum animal com foto cadastrada. Adicione fotos aos animais primeiro.
        </Alert>
      )}
    </Stack>
  );
}
