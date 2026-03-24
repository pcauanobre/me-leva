"use client";

import { useState } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import { formatPhoneDisplay, phoneToDigits } from "@/lib/utils/formatPhone";

type PhoneInputProps = Omit<TextFieldProps, "onChange" | "value"> & {
  defaultValue?: string;
  name: string;
};

export default function PhoneInput({ defaultValue, name, ...props }: PhoneInputProps) {
  const [display, setDisplay] = useState(
    defaultValue ? formatPhoneDisplay(defaultValue) : ""
  );

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhoneDisplay(e.target.value);
    setDisplay(formatted);
  }

  return (
    <>
      {/* Hidden input with digits only for form submission */}
      <input type="hidden" name={name} value={phoneToDigits(display)} />
      <TextField
        {...props}
        value={display}
        onChange={handleChange}
        placeholder="(85) 99999-9999"
        inputProps={{ inputMode: "tel", maxLength: 16 }}
      />
    </>
  );
}
