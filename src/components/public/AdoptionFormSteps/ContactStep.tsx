"use client";

import { TextField, FormControlLabel, Checkbox, Typography } from "@mui/material";
import Link from "next/link";
import { formatPhoneDisplay, phoneToDigits } from "@/lib/utils/formatPhone";

interface ContactStepProps {
  data: { email: string; whatsapp: string; terms_accepted: boolean };
  onChange: (field: string, value: string) => void;
  onBooleanChange: (field: string, value: boolean) => void;
  errors: Record<string, string>;
}

export default function ContactStep({ data, onChange, onBooleanChange, errors }: ContactStepProps) {
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = phoneToDigits(e.target.value);
    onChange("whatsapp", digits);
  }

  return (
    <>
      <TextField
        label="Email"
        type="email"
        value={data.email}
        onChange={(e) => onChange("email", e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
        fullWidth
        required
      />
      <TextField
        label="Contato (WhatsApp - de preferência)"
        value={formatPhoneDisplay(data.whatsapp)}
        onChange={handlePhoneChange}
        error={!!errors.whatsapp}
        helperText={errors.whatsapp}
        fullWidth
        required
        placeholder="(85) 99999-9999"
        inputProps={{ inputMode: "tel", maxLength: 16 }}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={data.terms_accepted}
            onChange={(e) => onBooleanChange("terms_accepted", e.target.checked)}
            required
          />
        }
        label={
          <Typography variant="body2">
            Li e concordo com os{" "}
            <Link href="/termos" target="_blank" style={{ color: "#8B3FA0" }}>
              Termos de Uso
            </Link>
          </Typography>
        }
      />
      {errors.terms_accepted && (
        <Typography variant="body2" color="error" sx={{ mt: -1 }}>
          {errors.terms_accepted}
        </Typography>
      )}
    </>
  );
}
