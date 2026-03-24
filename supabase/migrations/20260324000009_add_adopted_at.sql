-- Track when an animal was marked as adopted (for 3-day grace period on public site)
alter table animals add column if not exists adopted_at timestamptz;

-- Backfill: set adopted_at = updated_at for existing adopted animals
update animals set adopted_at = updated_at where status = 'adotado' and adopted_at is null;
