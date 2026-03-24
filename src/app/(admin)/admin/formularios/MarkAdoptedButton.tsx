"use client";

import { useState, useTransition } from "react";
import { Button, CircularProgress } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CheckIcon from "@mui/icons-material/Check";
import { updateAnimalStatus } from "../animais/actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
  animalId: string;
  animalName: string;
  alreadyAdopted: boolean;
}

export default function MarkAdoptedButton({ animalId, animalName, alreadyAdopted }: Props) {
  const [adopted, setAdopted] = useState(alreadyAdopted);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setConfirmOpen(false);
    startTransition(async () => {
      const result = await updateAnimalStatus(animalId, "adotado");
      if (!result.error) {
        setAdopted(true);
      }
    });
  }

  if (adopted) {
    return (
      <Button
        size="small"
        disabled
        startIcon={<CheckIcon />}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          color: "#10B981 !important",
          borderColor: "#10B981",
        }}
        variant="outlined"
      >
        Confirmado
      </Button>
    );
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={isPending ? <CircularProgress size={16} /> : <FavoriteIcon />}
        onClick={() => setConfirmOpen(true)}
        disabled={isPending}
        sx={{
          textTransform: "none",
          fontWeight: 600,
          borderColor: "#E8618C",
          color: "#E8618C",
          "&:hover": { bgcolor: "#FFF0F5", borderColor: "#C93D6A" },
        }}
      >
        Confirmar adoção
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        title="Marcar como adotado"
        message={`Marcar "${animalName}" como adotado? O animal ficará cinza no site por 3 dias e depois será removido da listagem pública.`}
        confirmLabel="Sim, foi adotado!"
        confirmColor="success"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
