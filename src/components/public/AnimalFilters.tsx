"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";

export default function AnimalFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const species = searchParams.get("especie") ?? "";
  const size = searchParams.get("porte") ?? "";
  const age = searchParams.get("idade") ?? "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/animais?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearFilters = useCallback(() => {
    router.push("/animais");
  }, [router]);

  const hasFilters = species || size || age;

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: { xs: 1, sm: 2 },
        alignItems: "center",
        mb: { xs: 2, sm: 4 },
      }}
    >
      <FormControl size="small" sx={{ minWidth: { xs: "calc(50% - 4px)", sm: 140 } }}>
        <InputLabel>Espécie</InputLabel>
        <Select
          value={species}
          label="Espécie"
          onChange={(e) => updateFilter("especie", e.target.value)}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="cachorro">Cachorro</MenuItem>
          <MenuItem value="gato">Gato</MenuItem>
          <MenuItem value="outro">Outro</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: { xs: "calc(50% - 4px)", sm: 140 } }}>
        <InputLabel>Porte</InputLabel>
        <Select
          value={size}
          label="Porte"
          onChange={(e) => updateFilter("porte", e.target.value)}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="pequeno">Pequeno</MenuItem>
          <MenuItem value="medio">Médio</MenuItem>
          <MenuItem value="grande">Grande</MenuItem>
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: { xs: "calc(50% - 4px)", sm: 140 } }}>
        <InputLabel>Idade</InputLabel>
        <Select
          value={age}
          label="Idade"
          onChange={(e) => updateFilter("idade", e.target.value)}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="filhote">Filhote (0-12m)</MenuItem>
          <MenuItem value="jovem">Jovem (1-3a)</MenuItem>
          <MenuItem value="adulto">Adulto (3-8a)</MenuItem>
          <MenuItem value="idoso">Idoso (8+a)</MenuItem>
        </Select>
      </FormControl>

      {hasFilters && (
        <Button size="small" onClick={clearFilters} color="inherit">
          Limpar filtros
        </Button>
      )}
    </Box>
  );
}
