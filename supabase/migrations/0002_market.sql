create table market_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  source text not null default 'roblox',
  sort text not null default 'rising',
  items jsonb not null default '[]'
);

alter table market_snapshots enable row level security;
create policy "own rows" on market_snapshots for all using (user_id = auth.uid()) with check (user_id = auth.uid());
alter publication supabase_realtime add table market_snapshots;
