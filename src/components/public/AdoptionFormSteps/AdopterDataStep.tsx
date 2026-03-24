"use client";

import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";

interface AdopterDataStepProps {
  data: {
    full_name: string;
    social_media: string;
    address: string;
    age: string;
    marital_status: string;
    education_level: string;
    profession: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

const MARITAL_OPTIONS = [
  { value: "solteiro", label: "Solteiro(a)" },
  { value: "casado", label: "Casado(a)" },
  { value: "viuvo", label: "Viúvo(a)" },
  { value: "divorciado", label: "Divorciado(a)" },
  { value: "outro", label: "Outro" },
];

export default function AdopterDataStep({
  data,
  onChange,
  errors,
}: AdopterDataStepProps) {
  return (
    <>
      <TextField
        label="Nome e sobrenome"
        value={data.full_name}
        onChange={(e) => onChange("full_name", e.target.value)}
        error={!!errors.full_name}
        helperText={errors.full_name}
        fullWidth
        required
      />
      <TextField
        label="Facebook ou Instagram"
        value={data.social_media}
        onChange={(e) => onChange("social_media", e.target.value)}
        error={!!errors.social_media}
        helperText={errors.social_media}
        fullWidth
        required
      />
      <TextField
        label="Endereço completo (rua, número, bairro, cidade, CEP)"
        value={data.address}
        onChange={(e) => onChange("address", e.target.value)}
        error={!!errors.address}
        helperText={errors.address}
        fullWidth
        required
        multiline
        rows={2}
      />
      <TextField
        label="Idade"
        type="number"
        value={data.age}
        onChange={(e) => onChange("age", e.target.value)}
        error={!!errors.age}
        helperText={errors.age}
        fullWidth
        required
        slotProps={{ htmlInput: { min: 18 } }}
      />
      <FormControl fullWidth required error={!!errors.marital_status}>
        <InputLabel>Estado Civil</InputLabel>
        <Select
          value={data.marital_status}
          label="Estado Civil"
          onChange={(e) => onChange("marital_status", e.target.value)}
        >
          {MARITAL_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {errors.marital_status && (
          <FormHelperText>{errors.marital_status}</FormHelperText>
        )}
      </FormControl>
      <TextField
        label="Qual a sua escolaridade?"
        value={data.education_level}
        onChange={(e) => onChange("education_level", e.target.value)}
        error={!!errors.education_level}
        helperText={errors.education_level}
        fullWidth
        required
      />
      <TextField
        label="Profissão"
        value={data.profession}
        onChange={(e) => onChange("profession", e.target.value)}
        error={!!errors.profession}
        helperText={errors.profession}
        fullWidth
        required
      />
    </>
  );
}
