-- SmartESH v72 — Manual bank transfer + receipt verification
create table if not exists public.payment_settings_v72 (
  id int primary key check (id=1), bank_name text, account_number text, account_holder text, note text, updated_at timestamptz default now()
);
insert into public.payment_settings_v72(id) values(1) on conflict do nothing;

create table if not exists public.manual_payment_requests_v72 (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  plan text not null check(plan in ('student','teacher')), amount int not null check(amount in (10000,20000)),
  transfer_code text not null, receipt_path text not null, note text, status text not null default 'pending' check(status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id), reviewed_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists manual_payment_user_v72 on public.manual_payment_requests_v72(user_id,created_at desc);

alter table public.payment_settings_v72 enable row level security;
alter table public.manual_payment_requests_v72 enable row level security;
drop policy if exists payment_settings_read_v72 on public.payment_settings_v72;
create policy payment_settings_read_v72 on public.payment_settings_v72 for select to authenticated using(true);
drop policy if exists payment_settings_admin_v72 on public.payment_settings_v72;
create policy payment_settings_admin_v72 on public.payment_settings_v72 for all to authenticated using(public.current_role()='admin') with check(public.current_role()='admin');
drop policy if exists manual_payment_own_read_v72 on public.manual_payment_requests_v72;
create policy manual_payment_own_read_v72 on public.manual_payment_requests_v72 for select to authenticated using(user_id=auth.uid() or public.current_role()='admin');
drop policy if exists manual_payment_own_insert_v72 on public.manual_payment_requests_v72;
create policy manual_payment_own_insert_v72 on public.manual_payment_requests_v72 for insert to authenticated with check(user_id=auth.uid() and status='pending' and ((plan='student' and amount=10000) or (plan='teacher' and amount=20000)));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('payment-receipts-v72','payment-receipts-v72',false,5242880,array['image/jpeg','image/png']) on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists receipt_upload_own_v72 on storage.objects;
create policy receipt_upload_own_v72 on storage.objects for insert to authenticated with check(bucket_id='payment-receipts-v72' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists receipt_read_v72 on storage.objects;
create policy receipt_read_v72 on storage.objects for select to authenticated using(bucket_id='payment-receipts-v72' and ((storage.foldername(name))[1]=auth.uid()::text or public.current_role()='admin'));

create or replace function public.approve_manual_payment_v72(p_request_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare r public.manual_payment_requests_v72%rowtype; base_start timestamptz;
begin
 if public.current_role()<>'admin' then raise exception 'Admin only'; end if;
 select * into r from public.manual_payment_requests_v72 where id=p_request_id for update;
 if r.id is null then raise exception 'Payment request not found'; end if;
 if r.status<>'pending' then raise exception 'Payment request already reviewed'; end if;
 if (r.plan='student' and r.amount<>10000) or (r.plan='teacher' and r.amount<>20000) then raise exception 'Invalid amount'; end if;
 select greatest(now(),coalesce(max(ends_at),now())) into base_start from public.entitlements where user_id=r.user_id and status='active' and ends_at>now();
 insert into public.entitlements(user_id,plan,starts_at,ends_at,status) values(r.user_id,r.plan,now(),base_start+interval '365 days','active');
 update public.profiles set access_status='premium' where id=r.user_id;
 update public.manual_payment_requests_v72 set status='approved',reviewed_by=auth.uid(),reviewed_at=now() where id=p_request_id;
end$$;
create or replace function public.reject_manual_payment_v72(p_request_id uuid) returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_role()<>'admin' then raise exception 'Admin only'; end if;
 update public.manual_payment_requests_v72 set status='rejected',reviewed_by=auth.uid(),reviewed_at=now() where id=p_request_id and status='pending';
end$$;
grant execute on function public.approve_manual_payment_v72(uuid) to authenticated;
grant execute on function public.reject_manual_payment_v72(uuid) to authenticated;
select 'SmartESH v72 manual payment installed' as status;
