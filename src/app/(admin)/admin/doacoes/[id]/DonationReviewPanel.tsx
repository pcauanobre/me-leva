"use client";

import { useState, useTransition } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ConfirmDialog from "@/components/ConfirmDialog";
import { acceptDonation, rejectDonation } from "../actions";

interface Props {
  donationId: string;
}

export default function DonationReviewPanel({ donationId }: Props) {
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    setError(null);
    startTransition(async () => {
      const result = await acceptDonation(donationId);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  function handleReject() {
    if (!adminNotes.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await rejectDonation(donationId, adminNotes);
      if (result?.error) {
        setError(result.error);
      }
    });
    setRejectOpen(false);
  }

  return (
    <Box sx={{ mt: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <Button
          variant="contained"
          color="success"
          size="large"
          startIcon={<CheckCircleIcon />}
          onClick={() => setAcceptOpen(true)}
          disabled={isPending}
          sx={{ fontWeight: 700 }}
        >
          Aceitar Doação
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="large"
          startIcon={<CancelIcon />}
          onClick={() => setRejectOpen(true)}
          disabled={isPending}
          sx={{ fontWeight: 700 }}
        >
          Recusar
        </Button>
      </Stack>

      <ConfirmDialog
        open={acceptOpen}
        title="Aceitar doação"
        message="O animal será criado no catálogo com status 'disponível para adoção'. Você será redirecionado para adicionar fotos. Confirmar?"
        confirmLabel="Aceitar e criar animal"
        confirmColor="success"
        onConfirm={handleAccept}
        onCancel={() => setAcceptOpen(false)}
      />

      {/* Reject dialog with notes field */}
      {rejectOpen && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2,
          }}
          onClick={() => setRejectOpen(false)}
        >
          <Box
            sx={{
              bgcolor: "background.paper",
              borderRadius: 3,
              p: 3,
              maxWidth: 480,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ fontWeight: 700, fontSize: "1.1rem", mb: 1 }}>
              Recusar solicitação
            </Box>
            <Box sx={{ color: "text.secondary", mb: 2, fontSize: "0.9rem" }}>
              Informe o motivo da recusa para registrar no histórico.
            </Box>
            <TextField
              label="Motivo da recusa"
              multiline
              rows={3}
              fullWidth
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={() => setRejectOpen(false)} color="inherit">
                Cancelar
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleReject}
                disabled={!adminNotes.trim() || isPending}
              >
                Confirmar Recusa
              </Button>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}
