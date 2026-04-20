ALTER TABLE interest_forms ADD COLUMN terms_accepted BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE adoption_forms ADD COLUMN terms_accepted BOOLEAN NOT NULL DEFAULT false;
