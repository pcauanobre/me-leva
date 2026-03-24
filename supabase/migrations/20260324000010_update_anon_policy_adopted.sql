-- Update anon SELECT policy to include recently adopted animals (3-day grace period)
drop policy if exists "Public read available animals" on animals;

create policy "Public read available animals"
  on animals for select
  to anon
  using (
    (submission_status is null or submission_status = 'approved')
    and (
      status != 'adotado'
      or (status = 'adotado' and adopted_at > now() - interval '3 days')
    )
  );

-- Also update authenticated policy to match
drop policy if exists "Authenticated read animals" on animals;

create policy "Authenticated read animals"
  on animals for select
  to authenticated
  using (
    (
      (submission_status is null or submission_status = 'approved')
      and (
        status != 'adotado'
        or (status = 'adotado' and adopted_at > now() - interval '3 days')
      )
    )
    or submitted_by = auth.uid()
    or is_admin()
  );
