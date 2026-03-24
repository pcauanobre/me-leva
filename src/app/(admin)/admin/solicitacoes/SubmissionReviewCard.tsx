"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { approveSubmission, rejectSubmission } from "./actions";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Props {
  animalId: string;
}

export default function SubmissionReviewCard({ animalId }: Props) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleApprove() {
    setApproveOpen(false);
    setError(null);
    startTransition(async () => {
      const result = await approveSubmission(animalId);
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin");
      }
    });
  }

  function handleReject(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await rejectSubmission(animalId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        setRejectOpen(false);
        router.push("/admin/solicitacoes");
      }
    });
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="contained"
          color="success"
          startIcon={
            isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <CheckCircleIcon />
            )
          }
          onClick={() => setApproveOpen(true)}
          disabled={isPending}
          fullWidth
          sx={{
            py: 1.2,
            fontWeight: 700,
            fontSize: "0.95rem",
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Aprovar e Publicar
        </Button>
        <Button
          variant="outlined"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
          fullWidth
          sx={{
            py: 1.2,
            fontWeight: 700,
            fontSize: "0.95rem",
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Rejeitar
        </Button>
      </Stack>

      <ConfirmDialog
        open={approveOpen}
        title="Aprovar solicitação"
        message="O animal será publicado no catálogo e ficará visível para todos. Deseja continuar?"
        confirmLabel="Aprovar e Publicar"
        confirmColor="success"
        onConfirm={handleApprove}
        onCancel={() => setApproveOpen(false)}
      />

      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <Box component="form" action={handleReject}>
          <DialogTitle sx={{ fontWeight: 700, pb: 0 }}>
            Rejeitar Solicitação
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              O usuário receberá o feedback abaixo e poderá corrigir e reenviar
              a solicitação.
            </Typography>
            <TextField
              name="feedback"
              label="Motivo da rejeição"
              fullWidth
              multiline
              rows={4}
              required
              placeholder="Ex: Fotos estão desfocadas, por favor envie fotos mais nítidas do animal..."
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: 2 },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setRejectOpen(false)}
              color="inherit"
              sx={{ textTransform: "none" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              color="error"
              variant="contained"
              disabled={isPending}
              startIcon={
                isPending ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CancelIcon />
                )
              }
              sx={{
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 2,
                px: 3,
              }}
            >
              {isPending ? "Rejeitando..." : "Rejeitar Solicitação"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
