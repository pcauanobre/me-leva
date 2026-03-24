"use client";

import { TextField } from "@mui/material";
import { formatPhoneDisplay, phoneToDigits } from "@/lib/utils/formatPhone";

interface ContactStepProps {
  data: { email: string; whatsapp: string };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function ContactStep({ data, onChange, errors }: ContactStepProps) {
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
    </>
  );
}
