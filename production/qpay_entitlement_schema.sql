-- SmartESH v45
alter table payments add column if not exists sender_invoice_no text unique;
alter table payments add column if not exists qpay_invoice_id text unique;
alter table payments add column if not exists callback_received_at timestamptz;
alter table payments add column if not exists raw_verification jsonb;
alter table entitlements add column if not exists payment_id uuid references payments(id);
create index if not exists payments_user_status_idx on payments(user_id,status,verified_at desc);
create index if not exists entitlements_active_idx on entitlements(user_id,status,ends_at desc);
