"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Stack,
  Typography,
  Select,
  MenuItem,
  Paper,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { updateAnimalStatus, deleteAnimal } from "./actions";
import ConfirmDialog from "@/components/ConfirmDialog";

const STATUS_COLORS: Record<string, "success" | "default"> = {
  disponivel: "success",
  adotado: "default",
};

const STATUS_LABELS: Record<string, string> = {
  disponivel: "Disponível",
  adotado: "Adotado",
};

const SPECIES_LABELS: Record<string, string> = {
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

interface Props {
  animals: {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    status: string;
    cover_photo: string | null;
    created_at: string;
  }[];
}

export default function AnimalTable({ animals }: Props) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await updateAnimalStatus(id, status);
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      await deleteAnimal(deleteTarget.id);
      setDeleteTarget(null);
    });
  }

  if (animals.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary">
          Nenhum animal cadastrado ainda.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Desktop: Table */}
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>Animal</TableCell>
              <TableCell>Espécie</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {animals.map((animal, index) => (
              <TableRow key={animal.id} hover sx={{ opacity: isPending ? 0.5 : 1, animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar
                      variant="rounded"
                      src={animal.cover_photo ?? undefined}
                      sx={{ width: 48, height: 48 }}
                    >
                      {animal.name[0]}
                    </Avatar>
                    <Box>
                      <Typography fontWeight={600}>{animal.name}</Typography>
                      {animal.breed && (
                        <Typography variant="caption" color="text.secondary">
                          {animal.breed}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{SPECIES_LABELS[animal.species] ?? animal.species}</TableCell>
                <TableCell>
                  <Select
                    value={animal.status}
                    size="small"
                    onChange={(e) => handleStatusChange(animal.id, e.target.value)}
                    sx={{ minWidth: 130 }}
                  >
                    <MenuItem value="disponivel">Disponível</MenuItem>
                    <MenuItem value="adotado">Adotado</MenuItem>
                  </Select>
                </TableCell>
                <TableCell>
                  {new Date(animal.created_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    component={Link}
                    href={`/admin/animais/${animal.id}`}
                    color="primary"
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    size="small"
                    onClick={() => setDeleteTarget({ id: animal.id, name: animal.name })}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Mobile: Cards */}
      <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" }, opacity: isPending ? 0.5 : 1 }}>
        {animals.map((animal, index) => (
          <Paper key={animal.id} sx={{ p: 2, animation: "fadeInUp 0.3s ease both", animationDelay: `${index * 0.04}s` }}>
            {/* Row 1: Avatar + name/breed on left, status dropdown on right */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
              <Avatar
                variant="rounded"
                src={animal.cover_photo ?? undefined}
                sx={{ width: 48, height: 48 }}
              >
                {animal.name[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography fontWeight={700} noWrap>
                  {animal.name}
                </Typography>
                {animal.breed && (
                  <Typography variant="caption" color="text.secondary">
                    {animal.breed}
                  </Typography>
                )}
              </Box>
              <Select
                value={animal.status}
                size="small"
                onChange={(e) => handleStatusChange(animal.id, e.target.value)}
                sx={{ minWidth: 110, "& .MuiSelect-select": { py: 1 } }}
              >
                <MenuItem value="disponivel">Disponível</MenuItem>
                <MenuItem value="adotado">Adotado</MenuItem>
              </Select>
            </Stack>

            {/* Row 2: Espécie chip + date */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <Chip
                label={SPECIES_LABELS[animal.species] ?? animal.species}
                size="small"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary">
                {new Date(animal.created_at).toLocaleDateString("pt-BR")}
              </Typography>
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            {/* Row 3: Edit button + Delete icon button */}
            <Stack direction="row" alignItems="center" spacing={1}>
              <Link href={`/admin/animais/${animal.id}`} style={{ textDecoration: "none" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  sx={{ textTransform: "none", minHeight: 40 }}
                >
                  Editar
                </Button>
              </Link>
              <Box sx={{ flex: 1 }} />
              <IconButton
                color="error"
                onClick={() => setDeleteTarget({ id: animal.id, name: animal.name })}
                sx={{ width: 40, height: 40 }}
              >
                <DeleteIcon />
              </IconButton>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir animal"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        confirmColor="error"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

