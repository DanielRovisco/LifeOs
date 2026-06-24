-- Corre isto no Supabase: SQL Editor → New query → cola e executa

-- Tabela key-value: imita o window.storage do protótipo em artefacto,
-- para reaproveitar a lógica sem reescrever tudo de raiz.
create table kv_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table kv_store disable row level security;

-- (Tabelas relacionais abaixo ficam disponíveis para uma migração futura mais robusta,
-- mas não são usadas pela versão inicial do site — ignora-as por agora.)


create table tasks (
  id bigint generated always as identity primary key,
  text text not null,
  done boolean default false,
  area text default 'PESSOAL',
  due date,
  created_at timestamptz default now()
);

create table expenses (
  id bigint generated always as identity primary key,
  desc text not null,
  value numeric not null,
  recurring boolean default true,
  created_at timestamptz default now()
);

create table portfolio_entries (
  id bigint generated always as identity primary key,
  date date not null,
  value numeric not null,
  created_at timestamptz default now()
);

create table checkins (
  id bigint generated always as identity primary key,
  week text not null,
  date date not null,
  text text,
  done_tasks int,
  total_tasks int,
  created_at timestamptz default now()
);

create table settings (
  key text primary key,
  value jsonb
);

-- valores iniciais
insert into settings (key, value) values
  ('income', '1296'),
  ('apy_goal', '{"principal": 12450, "rate": 3.5, "startDate": "2026-06-01"}');

-- RLS: por simplicidade neste projeto pessoal (uso individual), desativa RLS.
-- Se quiseres autenticação multi-user no futuro, ativa RLS e cria políticas por user_id.
alter table tasks disable row level security;
alter table expenses disable row level security;
alter table portfolio_entries disable row level security;
alter table checkins disable row level security;
alter table settings disable row level security;
