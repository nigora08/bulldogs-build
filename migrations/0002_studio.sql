-- Datum studio: saved projects and teams.
-- user ids are text to match Better Auth's "user"."id".

create table if not exists teams (
  id text primary key,
  name text not null,
  invite_code text not null unique,
  created_by text not null references "user" ("id") on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  team_id text not null references teams (id) on delete cascade,
  user_id text not null references "user" ("id") on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

create index if not exists team_members_user_idx on team_members (user_id);

create table if not exists projects (
  id text primary key,
  owner_id text not null references "user" ("id") on delete cascade,
  team_id text references teams (id) on delete set null,
  title text not null,
  brief text not null,
  campus text not null check (campus in ('open', 'yale')),
  constraints jsonb not null,
  chosen_route_id text,
  chosen_route_name text,
  blueprint jsonb not null,
  step_count integer not null default 0,
  deadline date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_owner_idx on projects (owner_id);
create index if not exists projects_team_idx on projects (team_id);

create table if not exists project_checks (
  project_id text not null references projects (id) on delete cascade,
  step_id text not null,
  done_by text not null,
  primary key (project_id, step_id)
);

create table if not exists project_bom (
  project_id text not null references projects (id) on delete cascade,
  line_id text not null,
  status text not null check (status in ('need', 'ordered', 'in_hand')),
  primary key (project_id, line_id)
);

create table if not exists decisions (
  id text primary key,
  project_id text not null references projects (id) on delete cascade,
  user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists decisions_project_idx on decisions (project_id, created_at);
