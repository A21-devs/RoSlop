alter table pitches add column if not exists details jsonb not null default '{}';
