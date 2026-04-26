export type AnimalStatus = "disponivel" | "adotado";
export type AnimalSpecies = "cachorro" | "gato" | "outro";
export type AnimalSize = "pequeno" | "medio" | "grande";
export type AnimalSex = "macho" | "femea";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type UserRole = "admin" | "user";
export type AdoptionFormStatus = "pendente" | "aprovado" | "rejeitado";
export type DonationRequestStatus = "pendente" | "aceito" | "recusado";

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

export interface AdoptionFormRow {
  id: string;
  email: string;
  whatsapp: string;
  full_name: string;
  social_media: string;
  address: string;
  age: number;
  marital_status: string;
  education_level: string;
  profession: string;
  animal_species: string;
  animal_sex: string;
  animal_age: string;
  animal_coat: string;
  interview_answers: Record<string, string>;
  animal_id: string | null;
  status: AdoptionFormStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  animals?: Pick<Animal, "id" | "name" | "slug" | "cover_photo"> | null;
}

export interface DonationRequest {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  animal_name: string;
  species: string;
  breed: string | null;
  age_months: number | null;
  sex: string;
  neutered: boolean;
  vaccinated: boolean;
  description: string;
  donation_reason: string;
  urgency: "urgente" | "normal";
  status: DonationRequestStatus;
  admin_notes: string | null;
  reviewed_at: string | null;
  converted_animal_id: string | null;
  terms_accepted: boolean;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export type AnalyticsEventType =
  | "page_view"
  | "pet_click"
  | "pet_view_detail"
  | "adoption_form_open"
  | "adoption_form_step"
  | "adoption_form_submit"
  | "adoption_form_abandon"
  | "account_signup_start"
  | "account_signup_complete"
  | "login"
  | "logout"
  | "donation_form_submit"
  | "outbound_click"
  | "error";

export interface AnalyticsSession {
  id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  country: string | null;
  city: string | null;
  is_authenticated: boolean;
  first_seen_at: string;
  last_seen_at: string;
  ended_at: string | null;
}

export interface AnalyticsEvent {
  id: string;
  session_id: string;
  user_id: string | null;
  event_type: AnalyticsEventType;
  path: string | null;
  animal_id: string | null;
  form_step: number | null;
  duration_ms: number | null;
  metadata: Record<string, unknown>;
  created_at: string;
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
      adoption_forms: {
        Row: AdoptionFormRow;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      analytics_sessions: {
        Row: AnalyticsSession;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      analytics_event_type: AnalyticsEventType;
    };
    CompositeTypes: Record<string, never>;
  };
};
