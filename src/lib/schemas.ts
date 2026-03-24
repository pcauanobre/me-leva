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
