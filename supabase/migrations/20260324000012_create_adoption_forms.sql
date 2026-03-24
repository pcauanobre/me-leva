-- Comprehensive adoption application form.
-- Structured columns for filterable data + JSONB for interview answers (63 questions).

CREATE TABLE adoption_forms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Section 1: Quick contact
  email           TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,

  -- Section 2: Adopter data
  full_name       TEXT NOT NULL,
  social_media    TEXT NOT NULL,
  address         TEXT NOT NULL,
  age             INTEGER NOT NULL,
  marital_status  TEXT NOT NULL,
  education_level TEXT NOT NULL,
  profession      TEXT NOT NULL,

  -- Section 3: Animal of interest
  animal_species  TEXT NOT NULL,   -- cao, gato
  animal_sex      TEXT NOT NULL,   -- macho, femea, tanto_faz
  animal_age      TEXT NOT NULL,   -- filhote, adulto, tanto_faz
  animal_coat     TEXT NOT NULL,   -- longa, curta, tanto_faz

  -- Section 4: Interview answers (JSONB keyed q1..q63)
  interview_answers JSONB NOT NULL DEFAULT '{}',

  -- Optional link to specific animal
  animal_id       UUID REFERENCES animals(id) ON DELETE SET NULL,

  -- Admin workflow
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  admin_notes     TEXT,
  reviewed_at     TIMESTAMPTZ,

  -- Metadata
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_adoption_forms_status ON adoption_forms(status);
CREATE INDEX idx_adoption_forms_created_at ON adoption_forms(created_at DESC);
CREATE INDEX idx_adoption_forms_animal_id ON adoption_forms(animal_id);

-- RLS
ALTER TABLE adoption_forms ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (no login required)
CREATE POLICY "Anyone can submit adoption form"
  ON adoption_forms FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admin can read
CREATE POLICY "Admin read adoption forms"
  ON adoption_forms FOR SELECT
  TO authenticated
  USING (is_admin());

-- Only admin can update (edit answers, change status)
CREATE POLICY "Admin update adoption forms"
  ON adoption_forms FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Only admin can delete
CREATE POLICY "Admin delete adoption forms"
  ON adoption_forms FOR DELETE
  TO authenticated
  USING (is_admin());
