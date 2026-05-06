"use client";

import { useState, useTransition } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Autocomplete,
  Avatar,
  Box,
  Paper,
  Typography,
  Chip,
  Stack,
  TextField,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link as MuiLink,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteIcon from "@mui/icons-material/Delete";
import PetsIcon from "@mui/icons-material/Pets";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  INTERVIEW_QUESTIONS,
  QUESTION_GROUPS,
} from "@/lib/adoptionQuestions";
import type { AdoptionFormRow } from "@/lib/supabase/types";
import {
  updateAdoptionFormStatus,
  updateAdoptionFormData,
  deleteAdoptionForm,
  approveAdoptionForm,
} from "../actions";
import type { AvailableAnimal } from "./page";

const STATUS_CONFIG = {
  pendente: { label: "Pendente", color: "warning" as const },
  aprovado: { label: "Aprovado", color: "success" as const },
  rejeitado: { label: "Rejeitado", color: "error" as const },
};

const MARITAL_LABELS: Record<string, string> = {
  solteiro: "Solteiro(a)",
  casado: "Casado(a)",
  viuvo: "Viúvo(a)",
  divorciado: "Divorciado(a)",
  outro: "Outro",
};

const SPECIES_LABELS: Record<string, string> = {
  cao: "Cão",
  cachorro: "Cachorro",
  gato: "Gato",
  outro: "Outro",
};

const SEX_LABELS: Record<string, string> = {
  macho: "Macho",
  femea: "Fêmea",
  tanto_faz: "Tanto faz",
};

const AGE_LABELS: Record<string, string> = {
  filhote: "Filhote",
  adulto: "Adulto",
  tanto_faz: "Tanto faz",
};

const COAT_LABELS: Record<string, string> = {
  longa: "Longa",
  curta: "Curta",
  tanto_faz: "Tanto faz",
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("55")) return digits;
  return `55${digits}`;
}

interface Props {
  form: AdoptionFormRow;
  availableAnimals: AvailableAnimal[];
  linkedAnimal: AvailableAnimal | null;
}

export default function AdoptionFormDetail({
  form,
  availableAnimals,
  linkedAnimal,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState<AvailableAnimal | null>(
    linkedAnimal && linkedAnimal.status === "disponivel" ? linkedAnimal : null,
  );

  // Editable state
  const [editData, setEditData] = useState({
    email: form.email,
    whatsapp: form.whatsapp,
    full_name: form.full_name,
    social_media: form.social_media,
    address: form.address,
    age: form.age,
    marital_status: form.marital_status,
    education_level: form.education_level,
    profession: form.profession,
    animal_species: form.animal_species,
    animal_sex: form.animal_sex,
    animal_age: form.animal_age,
    animal_coat: form.animal_coat,
    interview_answers: { ...form.interview_answers },
    admin_notes: form.admin_notes || "",
  });

  // Dialogs
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const statusCfg = STATUS_CONFIG[form.status];
  const questionsMap = new Map(INTERVIEW_QUESTIONS.map((q) => [q.key, q]));

  function handleFieldChange(field: string, value: string | number) {
    setEditData((prev) => ({ ...prev, [field]: value }));
  }

  function handleInterviewChange(key: string, value: string) {
    setEditData((prev) => ({
      ...prev,
      interview_answers: { ...prev.interview_answers, [key]: value },
    }));
  }

  function handleSave() {
    setError("");
    startTransition(async () => {
      const result = await updateAdoptionFormData(form.id, {
        email: editData.email,
        whatsapp: editData.whatsapp,
        full_name: editData.full_name,
        social_media: editData.social_media,
        address: editData.address,
        age: editData.age,
        marital_status: editData.marital_status,
        education_level: editData.education_level,
        profession: editData.profession,
        animal_species: editData.animal_species,
        animal_sex: editData.animal_sex,
        animal_age: editData.animal_age,
        animal_coat: editData.animal_coat,
        interview_answers: editData.interview_answers,
        admin_notes: editData.admin_notes || null,
      });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMsg("Alterações salvas com sucesso!");
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleApprove() {
    if (!selectedAnimal) {
      setError("Selecione um animal disponível antes de aprovar.");
      setApproveOpen(false);
      return;
    }
    const animalId = selectedAnimal.id;
    startTransition(async () => {
      const result = await approveAdoptionForm(
        form.id,
        animalId,
        editData.admin_notes || undefined,
      );
      if (result.error) setError(result.error);
      else {
        setSuccessMsg(
          `Formulário aprovado! ${selectedAnimal.name} foi marcado(a) como adotado(a).`,
        );
        router.refresh();
      }
      setApproveOpen(false);
    });
  }

  function handleReject() {
    startTransition(async () => {
      const result = await updateAdoptionFormStatus(
        form.id,
        "rejeitado",
        editData.admin_notes || undefined
      );
      if (result.error) setError(result.error);
      else {
        setSuccessMsg("Formulário rejeitado.");
        router.refresh();
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAdoptionForm(form.id);
      if (result.error) setError(result.error);
      else router.push("/admin/adocao");
    });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {error && <Alert severity="error">{error}</Alert>}
      {successMsg && (
        <Alert severity="success" onClose={() => setSuccessMsg("")}>
          {successMsg}
        </Alert>
      )}

      {/* Header actions */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip label={statusCfg.label} color={statusCfg.color} />
            <Typography variant="body2" color="text.secondary">
              Enviado em{" "}
              {new Date(form.created_at).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            {!editing ? (
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
                size="small"
              >
                Editar
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={isPending}
                  size="small"
                >
                  {isPending ? "Salvando..." : "Salvar"}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setEditing(false);
                    setEditData({
                      email: form.email,
                      whatsapp: form.whatsapp,
                      full_name: form.full_name,
                      social_media: form.social_media,
                      address: form.address,
                      age: form.age,
                      marital_status: form.marital_status,
                      education_level: form.education_level,
                      profession: form.profession,
                      animal_species: form.animal_species,
                      animal_sex: form.animal_sex,
                      animal_age: form.animal_age,
                      animal_coat: form.animal_coat,
                      interview_answers: { ...form.interview_answers },
                      admin_notes: form.admin_notes || "",
                    });
                  }}
                  size="small"
                >
                  Cancelar
                </Button>
              </>
            )}

            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => setApproveOpen(true)}
              disabled={form.status === "aprovado" || isPending}
              size="small"
            >
              Aprovar
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<BlockIcon />}
              onClick={() => setRejectOpen(true)}
              disabled={form.status === "rejeitado" || isPending}
              size="small"
            >
              Rejeitar
            </Button>

            <IconButton
              component="a"
              href={`https://wa.me/${formatPhone(form.whatsapp)}?text=${encodeURIComponent(`Oi ${form.full_name}! Vi seu formulário de adoção. Vamos conversar?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              color="success"
              size="small"
            >
              <WhatsAppIcon />
            </IconButton>

            <IconButton
              color="error"
              size="small"
              onClick={() => setDeleteOpen(true)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </Paper>

      {/* Animal vinculado */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            {linkedAnimal?.cover_photo ? (
              <Avatar
                src={linkedAnimal.cover_photo}
                alt={linkedAnimal.name}
                sx={{ width: 56, height: 56 }}
              />
            ) : (
              <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.light" }}>
                <PetsIcon />
              </Avatar>
            )}
            <Box>
              <Typography variant="caption" color="text.secondary">
                Animal vinculado
              </Typography>
              {linkedAnimal ? (
                <Box>
                  <MuiLink
                    component={NextLink}
                    href={`/admin/animais/${linkedAnimal.id}`}
                    fontWeight={600}
                    underline="hover"
                  >
                    {linkedAnimal.name}
                  </MuiLink>
                  <Typography variant="body2" color="text.secondary">
                    {SPECIES_LABELS[linkedAnimal.species] || linkedAnimal.species}
                    {linkedAnimal.status === "adotado" && " · adotado"}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Nenhum animal vinculado ainda. Selecione um ao aprovar.
                </Typography>
              )}
            </Box>
          </Stack>
        </Stack>
      </Paper>

      {/* Section 1: Contact */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Dados de Contato
        </Typography>
        <Stack spacing={2}>
          <InfoRow
            label="Email"
            value={editData.email}
            editing={editing}
            onChange={(v) => handleFieldChange("email", v)}
          />
          <InfoRow
            label="WhatsApp"
            value={editData.whatsapp}
            editing={editing}
            onChange={(v) => handleFieldChange("whatsapp", v)}
          />
        </Stack>
      </Paper>

      {/* Section 2: Adopter */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Dados do(a) Adotante
        </Typography>
        <Stack spacing={2}>
          <InfoRow
            label="Nome completo"
            value={editData.full_name}
            editing={editing}
            onChange={(v) => handleFieldChange("full_name", v)}
          />
          <InfoRow
            label="Facebook/Instagram"
            value={editData.social_media}
            editing={editing}
            onChange={(v) => handleFieldChange("social_media", v)}
          />
          <InfoRow
            label="Endereço"
            value={editData.address}
            editing={editing}
            onChange={(v) => handleFieldChange("address", v)}
            multiline
          />
          <InfoRow
            label="Idade"
            value={String(editData.age)}
            editing={editing}
            onChange={(v) => handleFieldChange("age", parseInt(v) || 0)}
            type="number"
          />
          <InfoRow
            label="Estado Civil"
            value={editing ? editData.marital_status : (MARITAL_LABELS[editData.marital_status] || editData.marital_status)}
            editing={editing}
            onChange={(v) => handleFieldChange("marital_status", v)}
          />
          <InfoRow
            label="Escolaridade"
            value={editData.education_level}
            editing={editing}
            onChange={(v) => handleFieldChange("education_level", v)}
          />
          <InfoRow
            label="Profissão"
            value={editData.profession}
            editing={editing}
            onChange={(v) => handleFieldChange("profession", v)}
          />
        </Stack>
      </Paper>

      {/* Section 3: Animal Preference */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Dados do Animal de Interesse
        </Typography>
        <Stack spacing={2}>
          <InfoRow
            label="Espécie"
            value={editing ? editData.animal_species : (SPECIES_LABELS[editData.animal_species] || editData.animal_species)}
            editing={editing}
            onChange={(v) => handleFieldChange("animal_species", v)}
          />
          <InfoRow
            label="Sexo"
            value={editing ? editData.animal_sex : (SEX_LABELS[editData.animal_sex] || editData.animal_sex)}
            editing={editing}
            onChange={(v) => handleFieldChange("animal_sex", v)}
          />
          <InfoRow
            label="Idade do animal"
            value={editing ? editData.animal_age : (AGE_LABELS[editData.animal_age] || editData.animal_age)}
            editing={editing}
            onChange={(v) => handleFieldChange("animal_age", v)}
          />
          <InfoRow
            label="Pelagem"
            value={editing ? editData.animal_coat : (COAT_LABELS[editData.animal_coat] || editData.animal_coat)}
            editing={editing}
            onChange={(v) => handleFieldChange("animal_coat", v)}
          />
        </Stack>
      </Paper>

      {/* Section 4: Interview */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Entrevista
        </Typography>

        {QUESTION_GROUPS.map((group) => (
          <Accordion key={group.label} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{group.label}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2.5}>
                {group.keys.map((key) => {
                  const question = questionsMap.get(key);
                  if (!question) return null;
                  const answer =
                    editData.interview_answers[key] || "";

                  return (
                    <Box key={key}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {question.text}
                      </Typography>
                      {editing ? (
                        <TextField
                          value={answer}
                          onChange={(e) =>
                            handleInterviewChange(key, e.target.value)
                          }
                          fullWidth
                          multiline={question.type === "text"}
                          rows={question.type === "text" ? 2 : 1}
                          size="small"
                        />
                      ) : (
                        <Typography variant="body1">
                          {answer || (
                            <em style={{ color: "#999" }}>
                              Não respondido
                            </em>
                          )}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Admin Notes */}
      <Paper sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Notas do Admin
        </Typography>
        <TextField
          value={editData.admin_notes}
          onChange={(e) => handleFieldChange("admin_notes", e.target.value)}
          fullWidth
          multiline
          rows={3}
          placeholder="Anotações internas sobre este candidato..."
        />
      </Paper>

      {/* Approve Dialog with Animal Selection */}
      <Dialog
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Aprovar candidato
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Selecione o animal adotado por <strong>{form.full_name}</strong>.
            O animal escolhido será marcado como adotado.
          </Typography>
          <Autocomplete
            options={availableAnimals}
            value={selectedAnimal}
            onChange={(_, value) => setSelectedAnimal(value)}
            getOptionLabel={(option) =>
              `${option.name} (${SPECIES_LABELS[option.species] || option.species})`
            }
            isOptionEqualToValue={(opt, val) => opt.id === val.id}
            renderOption={(props, option) => {
              const { key, ...rest } = props as React.HTMLAttributes<HTMLLIElement> & { key?: string };
              return (
                <Box
                  component="li"
                  key={option.id}
                  {...rest}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: "100%" }}>
                    {option.cover_photo ? (
                      <Avatar src={option.cover_photo} sx={{ width: 36, height: 36 }} />
                    ) : (
                      <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.light" }}>
                        <PetsIcon fontSize="small" />
                      </Avatar>
                    )}
                    <Box>
                      <Typography fontWeight={600}>{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {SPECIES_LABELS[option.species] || option.species}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Animal adotado"
                placeholder="Digite o nome do animal..."
              />
            )}
            noOptionsText="Nenhum animal disponível"
          />
          {availableAnimals.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Não há animais com status "disponível" no momento. Cadastre ou
              libere um animal antes de aprovar este formulário.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setApproveOpen(false)} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleApprove}
            disabled={!selectedAnimal || isPending}
          >
            {isPending ? "Aprovando..." : "Aprovar e marcar adotado"}
          </Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        onConfirm={handleReject}
        title="Rejeitar formulário"
        message={`Deseja rejeitar o formulário de "${form.full_name}"?`}
        confirmLabel="Rejeitar"
        confirmColor="error"
      />
      <ConfirmDialog
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Excluir formulário"
        message={`Tem certeza que deseja excluir permanentemente o formulário de "${form.full_name}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        confirmColor="error"
      />
    </Box>
  );
}

// Helper component for info rows
function InfoRow({
  label,
  value,
  editing,
  onChange,
  multiline,
  type,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  type?: string;
}) {
  if (editing) {
    return (
      <TextField
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        fullWidth
        size="small"
        multiline={multiline}
        rows={multiline ? 2 : 1}
        type={type}
      />
    );
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1">{value || "—"}</Typography>
    </Box>
  );
}
