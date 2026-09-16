-- SmartESH v53 — Production QPay payment + entitlement
-- Run once in Supabase SQL Editor.

alter table public.payments add column if not exists plan text;
alter table public.payments add column if not exists created_at timestamptz not null default now();
alter table public.payments add column if not exists sender_invoice_no text unique;
alter table public.payments add column if not exists qpay_invoice_id text unique;
alter table public.payments add column if not exists callback_received_at timestamptz;
alter table public.payments add column if not exists raw_verification jsonb;
alter table public.payments add column if not exists qr_text text;
alter table public.payments add column if not exists qpay_urls jsonb;
alter table public.payments add column if not exists invoice_created_at timestamptz;

alter table public.entitlements add column if not exists payment_id uuid references public.payments(id);

create index if not exists payments_user_created_v53 on public.payments(user_id,created_at desc);
create index if not exists payments_sender_invoice_v53 on public.payments(sender_invoice_no);
create index if not exists entitlements_user_end_v53 on public.entitlements(user_id,ends_at desc);

alter table public.payments enable row level security;
alter table public.entitlements enable row level security;

drop policy if exists user_read_own_payments_v53 on public.payments;
create policy user_read_own_payments_v53 on public.payments
for select using (user_id=auth.uid() or public.current_role()='admin');

drop policy if exists user_read_own_entitlements_v53 on public.entitlements;
create policy user_read_own_entitlements_v53 on public.entitlements
for select using (user_id=auth.uid() or public.current_role()='admin');

-- Browser receives read-only access. Inserts/verification/entitlement writes happen
-- only in Vercel serverless functions with SUPABASE_SERVICE_ROLE_KEY.

select 'SmartESH v53 payment schema installed' as status;
