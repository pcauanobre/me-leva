import { z } from "zod";

export const animalSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.enum(["cachorro", "gato", "outro"], {
    error: "Espécie é obrigatória",
  }),
  breed: z.string().optional().default(""),
  age_months: z.coerce.number().int().min(0).optional(),
  size: z.enum(["pequeno", "medio", "grande"]).optional(),
  sex: z.enum(["macho", "femea"], { error: "Sexo é obrigatório" }),
  neutered: z.coerce.boolean().default(false),
  vaccinated: z.coerce.boolean().default(false),
  description: z.string().optional().default(""),
  status: z.enum(["disponivel", "adotado"]).default("disponivel"),
});

export type AnimalFormData = z.infer<typeof animalSchema>;

// Same as animalSchema but without status (set by admin on approval)
export const submissionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  species: z.enum(["cachorro", "gato", "outro"], {
    error: "Espécie é obrigatória",
  }),
  breed: z.string().optional().default(""),
  age_months: z.coerce.number().int().min(0).optional(),
  size: z.enum(["pequeno", "medio", "grande"]).optional(),
  sex: z.enum(["macho", "femea"], { error: "Sexo é obrigatório" }),
  neutered: z.coerce.boolean().default(false),
  vaccinated: z.coerce.boolean().default(false),
  description: z.string().optional().default(""),
});

export type SubmissionFormData = z.infer<typeof submissionSchema>;

export const registrationSchema = z
  .object({
    full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    password_confirm: z.string(),
    phone: z.string().optional().default(""),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Senhas não conferem",
    path: ["password_confirm"],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const rejectFeedbackSchema = z.object({
  feedback: z.string().min(1, "Informe o motivo da rejeição"),
});

export const interestFormSchema = z.object({
  animal_id: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
  phone: z
    .string()
    .min(10, "Telefone deve ter pelo menos 10 dígitos")
    .max(15, "Telefone inválido"),
  message: z.string().optional().default(""),
  consent: z.literal(true, {
    error: "Você deve aceitar a política de privacidade",
  }),
  website: z.string().max(0).optional(), // honeypot
});

export type InterestFormData = z.infer<typeof interestFormSchema>;

// --- Adoption Form Schemas ---

export const adoptionStep1Schema = z.object({
  email: z.string().email("Email inválido"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp deve ter pelo menos 10 dígitos")
    .max(15, "WhatsApp inválido"),
});

export const adoptionStep2Schema = z.object({
  full_name: z.string().min(2, "Nome é obrigatório"),
  social_media: z.string().min(1, "Facebook ou Instagram é obrigatório"),
  address: z.string().min(5, "Endereço completo é obrigatório"),
  age: z.coerce.number().int().min(18, "Idade mínima é 18 anos"),
  marital_status: z.string().min(1, "Estado civil é obrigatório"),
  education_level: z.string().min(1, "Escolaridade é obrigatória"),
  profession: z.string().min(1, "Profissão é obrigatória"),
});

export const adoptionStep3Schema = z.object({
  animal_species: z.enum(["cao", "gato"], {
    error: "Espécie é obrigatória",
  }),
  animal_sex: z.enum(["macho", "femea", "tanto_faz"], {
    error: "Sexo é obrigatório",
  }),
  animal_age: z.enum(["filhote", "adulto", "tanto_faz"], {
    error: "Idade do animal é obrigatória",
  }),
  animal_coat: z.enum(["longa", "curta", "tanto_faz"], {
    error: "Pelagem é obrigatória",
  }),
});

export const adoptionFormSchema = z.object({
  // Step 1
  email: z.string().email("Email inválido"),
  whatsapp: z
    .string()
    .min(10, "WhatsApp deve ter pelo menos 10 dígitos")
    .max(15, "WhatsApp inválido"),
  // Step 2
  full_name: z.string().min(2, "Nome é obrigatório"),
  social_media: z.string().min(1, "Facebook ou Instagram é obrigatório"),
  address: z.string().min(5, "Endereço completo é obrigatório"),
  age: z.coerce.number().int().min(18, "Idade mínima é 18 anos"),
  marital_status: z.string().min(1, "Estado civil é obrigatório"),
  education_level: z.string().min(1, "Escolaridade é obrigatória"),
  profession: z.string().min(1, "Profissão é obrigatória"),
  // Step 3
  animal_species: z.enum(["cao", "gato"], {
    error: "Espécie é obrigatória",
  }),
  animal_sex: z.enum(["macho", "femea", "tanto_faz"], {
    error: "Sexo é obrigatório",
  }),
  animal_age: z.enum(["filhote", "adulto", "tanto_faz"], {
    error: "Idade do animal é obrigatória",
  }),
  animal_coat: z.enum(["longa", "curta", "tanto_faz"], {
    error: "Pelagem é obrigatória",
  }),
  // Step 4: interview answers as record
  interview_answers: z.record(z.string(), z.string()),
  // Optional animal link
  animal_id: z.string().uuid().optional().nullable(),
  // Honeypot
  website: z.string().max(0).optional(),
});

export type AdoptionFormData = z.infer<typeof adoptionFormSchema>;
