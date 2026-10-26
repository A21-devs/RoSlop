-- Everything RoSlop needs, in one go. Safe to run again whenever the app says
-- your database is behind: it only adds what's missing.

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  universe_id bigint,
  place_id bigint,
  project_path text,
  stage text not null default 'pitched',
  version text not null default 'v0.1'
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  game_id uuid references games on delete set null,
  agent text not null,
  title text not null,
  brief text not null default '',
  status text not null default 'queued',
  priority text not null default 'normal',
  requested_by text not null default 'you',
  parent_id uuid references tasks on delete set null,
  needs_studio boolean not null default false,
  estimate real not null default 0,
  used real not null default 0,
  machine_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  result text,
  ask jsonb
);
create index if not exists tasks_open on tasks (user_id, status) where status in ('queued', 'held', 'working', 'needs_you');

create table if not exists task_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid not null references tasks on delete cascade,
  kind text not null default 'note',
  text text not null
);
create index if not exists task_events_task on task_events (task_id, created_at);

create table if not exists proofs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid references tasks on delete set null,
  game_id uuid references games on delete set null,
  agent text not null,
  title text not null,
  note text not null default '',
  kind text not null default 'image',
  url text not null,
  verdict text not null default 'waiting',
  feedback text,
  decided_at timestamptz
);

create table if not exists pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  title text not null,
  summary text not null default '',
  why text not null default '',
  stats jsonb not null default '[]',
  beats jsonb not null default '[]',
  money text not null default '',
  clip text not null default '',
  reuses jsonb not null default '[]',
  risks jsonb not null default '[]',
  score int not null default 5,
  status text not null default 'waiting',
  source text not null default 'pulse'
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  game_id uuid references games on delete set null,
  name text not null,
  kind text not null,
  roblox_id text,
  file_url text,
  tags jsonb not null default '[]'
);

create table if not exists machines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  name text not null,
  os text not null,
  role text not null default 'remote',
  last_seen timestamptz not null default now(),
  studio_slots int not null default 0,
  provider text
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  game_id uuid references games on delete set null,
  author text not null,
  text text not null,
  task_ids jsonb not null default '[]'
);

create table if not exists game_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  game_id uuid not null references games on delete cascade,
  playing int not null default 0,
  visits bigint not null default 0,
  favorites bigint not null default 0,
  up_votes bigint not null default 0,
  down_votes bigint not null default 0
);
create index if not exists game_stats_game on game_stats (game_id, created_at);

create table if not exists usage_windows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  started_at timestamptz not null default now(),
  used real not null default 0,
  tokens bigint not null default 0
);

create table if not exists market_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  source text not null default 'roblox',
  sort text not null default 'rising',
  items jsonb not null default '[]'
);

create table if not exists settings (
  user_id uuid primary key default auth.uid() references auth.users on delete cascade,
  provider text not null default 'claude',
  cap real not null default 0.8,
  max_agents int not null default 3,
  hold_low_priority boolean not null default true,
  weekly_spare real not null default 0.15,
  window_tokens bigint not null default 4000000,
  savings jsonb not null default '{}',
  apps jsonb not null default '[]',
  connectors jsonb not null default '{}',
  vault_path text,
  studio_mcp text
);
alter table settings add column if not exists blender jsonb not null default '{}';
alter table settings add column if not exists mcp_found jsonb;
alter table settings add column if not exists templates jsonb not null default '[]';
alter table settings add column if not exists studio jsonb not null default '{}';
alter table machines add column if not exists studios_open int;
alter table pitches add column if not exists details jsonb not null default '{}';
alter table settings add column if not exists folders jsonb not null default '[]';
alter table settings add column if not exists style jsonb not null default '[]';

-- Each person only ever sees their own rows, and changes stream live to the app.
do $$
declare t text;
begin
  foreach t in array array['games', 'tasks', 'task_events', 'proofs', 'pitches', 'assets', 'machines', 'messages', 'game_stats', 'usage_windows', 'market_snapshots', 'settings'] loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "own rows" on %I', t);
    execute format('create policy "own rows" on %I for all using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when duplicate_object then null;
    end;
  end loop;
end $$;

-- Screenshots, clips and uploads. Files live under <user id>/...
insert into storage.buckets (id, name, public) values ('files', 'files', false) on conflict do nothing;
drop policy if exists "own files" on storage.objects;
create policy "own files" on storage.objects for all
  using (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'files' and (storage.foldername(name))[1] = auth.uid()::text);
