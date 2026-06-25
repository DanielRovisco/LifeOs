-- Corre isto no Supabase: SQL Editor → New query → cola e executa

-- Tabela key-value: imita o window.storage do protótipo em artefacto,
-- para reaproveitar a lógica sem reescrever tudo de raiz.
-- É a única tabela usada pela app — tudo (tarefas, objetivos, carteira,
-- despesas, ordenado, check-ins) vive aqui como JSON em lib/storage.js.
create table kv_store (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

-- RLS: por simplicidade neste projeto pessoal (uso individual), desativa RLS.
-- Se quiseres autenticação multi-user no futuro, ativa RLS e cria políticas por user_id.
alter table kv_store disable row level security;
