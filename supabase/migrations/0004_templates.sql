alter table settings add column if not exists templates jsonb not null default '[]';
