import type { Animal } from "@/lib/supabase/types";

export type AdoptedAnimal = Pick<
  Animal,
  | "id"
  | "name"
  | "slug"
  | "species"
  | "sex"
  | "age_months"
  | "cover_photo"
  | "photo_urls"
  | "adopted_at"
  | "created_at"
>;

export interface LinkedForm {
  id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  animal_id: string;
}
