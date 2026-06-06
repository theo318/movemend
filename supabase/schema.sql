-- MoveMend database schema (Supabase Postgres)
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists "pgcrypto";

create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  doctor_notes text not null default '',
  diagnosis text not null default '',
  treatment_plan text not null default '',
  symptoms text not null default '',
  analysis_json jsonb not null
);

create table if not exists progress_logs (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references cases (id) on delete cascade,
  pain_score int not null check (pain_score between 0 and 10),
  exercise_completed boolean not null default false,
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists progress_logs_case_id_idx on progress_logs (case_id);

-- The app talks to Supabase with the service role key from the server only,
-- so row-level security is left disabled for the hackathon. Enable RLS and
-- add policies before exposing the anon key to the browser.
