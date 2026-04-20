CREATE TABLE donation_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Tutor (doador)
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  whatsapp        TEXT NOT NULL,

  -- Animal
  animal_name     TEXT NOT NULL,
  species         TEXT NOT NULL,   -- cachorro, gato, outro
  breed           TEXT,
  age_months      INTEGER,
  sex             TEXT NOT NULL,   -- macho, femea
  neutered        BOOLEAN NOT NULL DEFAULT false,
  vaccinated      BOOLEAN NOT NULL DEFAULT false,
  description     TEXT NOT NULL,

  -- Contexto da doação
  donation_reason TEXT NOT NULL,
  urgency         TEXT NOT NULL DEFAULT 'normal'
                  CHECK (urgency IN ('urgente', 'normal')),

  -- Admin workflow
  status          TEXT NOT NULL DEFAULT 'pendente'
                  CHECK (status IN ('pendente', 'aceito', 'recusado')),
  admin_notes     TEXT,
  reviewed_at     TIMESTAMPTZ,
  converted_animal_id UUID REFERENCES animals(id) ON DELETE SET NULL,

  -- Legal
  terms_accepted  BOOLEAN NOT NULL DEFAULT false,

  -- Honeypot anti-bot
  website         TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_donation_requests_status ON donation_requests(status);
CREATE INDEX idx_donation_requests_created_at ON donation_requests(created_at DESC);

ALTER TABLE donation_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_donation_requests"
  ON donation_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admin_manage_donation_requests"
  ON donation_requests FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER donation_requests_updated_at
  BEFORE UPDATE ON donation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
