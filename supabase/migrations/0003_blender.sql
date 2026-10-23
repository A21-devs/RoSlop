alter table settings add column if not exists blender jsonb not null default '{}';
alter table settings add column if not exists mcp_found jsonb;
