"use client";

import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from "@mui/material";

interface AnimalPreferenceStepProps {
  data: {
    animal_species: string;
    animal_sex: string;
    animal_age: string;
    animal_coat: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export default function AnimalPreferenceStep({
  data,
  onChange,
  errors,
}: AnimalPreferenceStepProps) {
  return (
    <>
      <FormControl error={!!errors.animal_species} required>
        <FormLabel>Espécie</FormLabel>
        <RadioGroup
          value={data.animal_species}
          onChange={(e) => onChange("animal_species", e.target.value)}
        >
          <FormControlLabel value="cao" control={<Radio />} label="Cão" />
          <FormControlLabel value="gato" control={<Radio />} label="Gato" />
        </RadioGroup>
        {errors.animal_species && (
          <FormHelperText>{errors.animal_species}</FormHelperText>
        )}
      </FormControl>

      <FormControl error={!!errors.animal_sex} required>
        <FormLabel>Sexo</FormLabel>
        <RadioGroup
          value={data.animal_sex}
          onChange={(e) => onChange("animal_sex", e.target.value)}
        >
          <FormControlLabel value="macho" control={<Radio />} label="Macho" />
          <FormControlLabel value="femea" control={<Radio />} label="Fêmea" />
          <FormControlLabel
            value="tanto_faz"
            control={<Radio />}
            label="Tanto faz"
          />
        </RadioGroup>
        {errors.animal_sex && (
          <FormHelperText>{errors.animal_sex}</FormHelperText>
        )}
      </FormControl>

      <FormControl error={!!errors.animal_age} required>
        <FormLabel>Idade do animal</FormLabel>
        <RadioGroup
          value={data.animal_age}
          onChange={(e) => onChange("animal_age", e.target.value)}
        >
          <FormControlLabel
            value="filhote"
            control={<Radio />}
            label="Filhote"
          />
          <FormControlLabel
            value="adulto"
            control={<Radio />}
            label="Adulto"
          />
          <FormControlLabel
            value="tanto_faz"
            control={<Radio />}
            label="Tanto faz"
          />
        </RadioGroup>
        {errors.animal_age && (
          <FormHelperText>{errors.animal_age}</FormHelperText>
        )}
      </FormControl>

      <FormControl error={!!errors.animal_coat} required>
        <FormLabel>Pelagem</FormLabel>
        <RadioGroup
          value={data.animal_coat}
          onChange={(e) => onChange("animal_coat", e.target.value)}
        >
          <FormControlLabel value="longa" control={<Radio />} label="Longa" />
          <FormControlLabel value="curta" control={<Radio />} label="Curta" />
          <FormControlLabel
            value="tanto_faz"
            control={<Radio />}
            label="Tanto faz"
          />
        </RadioGroup>
        {errors.animal_coat && (
          <FormHelperText>{errors.animal_coat}</FormHelperText>
        )}
      </FormControl>
    </>
  );
}
