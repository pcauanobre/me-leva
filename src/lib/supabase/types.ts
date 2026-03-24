export type AnimalStatus = "disponivel" | "adotado";
export type AnimalSpecies = "cachorro" | "gato" | "outro";
export type AnimalSize = "pequeno" | "medio" | "grande";
export type AnimalSex = "macho" | "femea";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type UserRole = "admin" | "user";

export interface Animal {
  id: string;
  name: string;
  slug: string;
  species: AnimalSpecies;
  breed: string | null;
  age_months: number | null;
  size: AnimalSize | null;
  sex: AnimalSex;
  neutered: boolean;
  vaccinated: boolean;
  description: string | null;
  status: AnimalStatus;
  photo_urls: string[];
  cover_photo: string | null;
  submitted_by: string | null;
  submission_status: SubmissionStatus | null;
  admin_feedback: string | null;
  adopted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
}

export interface InterestFormRow {
  id: string;
  animal_id: string;
  name: string;
  phone: string;
  message: string | null;
  created_at: string;
  animals?: Pick<Animal, "id" | "name" | "slug" | "cover_photo"> | null;
}

export type Database = {
  public: {
    Tables: {
      animals: {
        Row: Animal;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      interest_forms: {
        Row: InterestFormRow;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSetting;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
