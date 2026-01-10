-- Create table to support email OTP verification for protected downloads

create extension if not exists pgcrypto;

create table if not exists public.download_email_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  email text not null,
  purpose text not null default 'hwid_tool_download',
  code_hash text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempts int not null default 0,
  ip text,
  user_agent text
);

create index if not exists download_email_otps_user_purpose_idx
  on public.download_email_otps (user_id, purpose, created_at desc);

create index if not exists download_email_otps_expires_idx
  on public.download_email_otps (expires_at);
