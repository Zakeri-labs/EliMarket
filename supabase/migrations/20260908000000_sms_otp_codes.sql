-- Stores hashed OTP codes for phone sign-in once real SMS (iSmart SMS /
-- Infocomm) replaces the fixed-code bypass in src/config/otp-bypass.ts.
-- Only the service-role key (used exclusively from server actions) ever
-- reads or writes this table, so RLS is enabled with no policies.

create table if not exists public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists otp_codes_phone_created_at_idx
  on public.otp_codes (phone, created_at desc);

alter table public.otp_codes enable row level security;
