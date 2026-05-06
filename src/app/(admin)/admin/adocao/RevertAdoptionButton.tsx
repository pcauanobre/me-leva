"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Typography,
  Alert,
} from "@mui/material";
import UndoIcon from "@mui/icons-material/Undo";
import { revertAdoption } from "./actions";

interface Props {
  animalId: string;
  animalName: string;
  hasLinkedForm: boolean;
}

export default function RevertAdoptionButton({
  animalId,
  animalName,
  hasLinkedForm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reopen, setReopen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await revertAdoption(animalId, reopen && hasLinkedForm);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setReopen(false);
      }
    });
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color="warning"
        startIcon={<UndoIcon />}
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        Reverter
      </Button>
      <Dialog
        open={open}
        onClose={() => !isPending && setOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Reverter adoção?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              <strong>{animalName}</strong> voltará para "disponível" e
              aparecerá no catálogo público novamente.
            </Typography>
            {hasLinkedForm && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reopen}
                    onChange={(e) => setReopen(e.target.checked)}
                  />
                }
                label="Também reabrir formulário do candidato (volta para pendente)"
              />
            )}
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            color="inherit"
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Revertendo..." : "Reverter"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
