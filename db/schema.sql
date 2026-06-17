-- ============================================================
--  Nous & Chill — schéma PostgreSQL
--  Reprend le modèle Airtable décrit dans HANDOFF.md, sous forme
--  relationnelle, pour migrer vers un hébergeur Postgres
--  quelconque (Supabase, Neon, Railway, RDS, instance auto-gérée…).
--
--  Usage :
--    psql "$DATABASE_URL" -f db/schema.sql
--    psql "$DATABASE_URL" -f db/seed.sql
-- ============================================================

create extension if not exists pgcrypto; -- pour gen_random_uuid()

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
create table users (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  name                text not null,
  role                text not null check (role in ('samuel', 'mathilde', 'amis_samuel', 'amis_mathilde')),
  magic_token         text,
  token_expires_at    timestamptz,
  session_token       text,
  session_expires_at  timestamptz,
  created_at          timestamptz not null default now()
);

create unique index users_magic_token_idx   on users (magic_token)   where magic_token is not null;
create unique index users_session_token_idx on users (session_token) where session_token is not null;

-- ------------------------------------------------------------
-- Episodes
-- ------------------------------------------------------------
create table episodes (
  id          uuid primary key default gen_random_uuid(),
  number      integer not null unique,
  title       text not null,
  date        date not null,
  place       text not null,
  duration    text,
  tags        text[] not null default '{}',
  cover_url   text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Reviews — un seul compte-rendu par (episode, author)
-- author_role est dénormalisé depuis users.role pour appliquer
-- la règle de confidentialité sans jointure (et la figer même si
-- le rôle d'un utilisateur change plus tard).
-- ------------------------------------------------------------
create table reviews (
  id                uuid primary key default gen_random_uuid(),
  episode_id        uuid not null references episodes (id) on delete cascade,
  author_id         uuid not null references users (id) on delete cascade,
  author_role       text not null check (author_role in ('samuel', 'mathilde', 'amis_samuel', 'amis_mathilde')),
  rating            integer not null check (rating between 1 and 5),
  favorite_moment   text,
  awkward_moment    text,
  funny_quote       text,
  summary           text,
  would_redo        text check (would_redo in ('yes', 'no', 'maybe')),
  song              text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (episode_id, author_id)
);

create index reviews_episode_idx on reviews (episode_id);

-- ------------------------------------------------------------
-- Ideas
-- ------------------------------------------------------------
create table ideas (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  proposed_by   uuid not null references users (id) on delete cascade,
  status        text not null default 'voting' check (status in ('voting', 'selected', 'scheduled', 'done')),
  created_at    timestamptz not null default now()
);

-- Remplace les multi-links Airtable `likes` / `dislikes` :
-- une ligne par utilisateur et par idée, écrasée à chaque revote
-- (kind = 'clear' supprime simplement la ligne).
create table idea_votes (
  idea_id   uuid not null references ideas (id) on delete cascade,
  user_id   uuid not null references users (id) on delete cascade,
  kind      text not null check (kind in ('like', 'dislike')),
  voted_at  timestamptz not null default now(),
  primary key (idea_id, user_id)
);

-- ------------------------------------------------------------
-- VoteQuestions / VoteResults — sondages anonymes
-- Aucune table ne référence l'utilisateur ayant voté : seul le
-- compteur agrégé par option est stocké, conformément à la règle
-- "Aucune trace de qui a voté n'est jamais écrite côté serveur".
-- ------------------------------------------------------------
create table vote_questions (
  id        uuid primary key default gen_random_uuid(),
  question  text not null,
  options   jsonb not null, -- ex. ["E01 Premier Verre", "E02 Cinéma Mystère"]
  active    boolean not null default true
);

create table vote_results (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references vote_questions (id) on delete cascade,
  option        text not null,
  count         integer not null default 0,
  unique (question_id, option)
);

-- ------------------------------------------------------------
-- Synthese — singleton écrit en fin de saison
-- ------------------------------------------------------------
create table synthese (
  id              uuid primary key default gen_random_uuid(),
  body_md         text,
  generated_at    timestamptz,
  avg_rating      numeric(3, 2),
  best_episode_id uuid references episodes (id)
);

-- ------------------------------------------------------------
-- Settings — singleton (une seule ligne en pratique)
-- ------------------------------------------------------------
create table settings (
  id                  uuid primary key default gen_random_uuid(),
  season_unlocked     boolean not null default false,
  season_end_date     date not null
);

-- ------------------------------------------------------------
-- updated_at automatique sur reviews
-- ------------------------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger reviews_set_updated_at
  before update on reviews
  for each row
  execute function set_updated_at();
