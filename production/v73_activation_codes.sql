-- SmartESH v73: one-time activation codes for 365-day Premium
create table if not exists public.activation_settings_v73 (
 id int primary key default 1 check (id=1), facebook_url text, contact_email text, updated_at timestamptz not null default now()
);
insert into public.activation_settings_v73(id) values(1) on conflict(id) do nothing;

create table if not exists public.activation_codes_v73 (
 id uuid primary key default gen_random_uuid(), code text not null unique, plan text not null check(plan in ('student','teacher')),
 status text not null default 'unused' check(status in ('unused','used','expired','disabled')), note text,
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(),
 expires_at timestamptz, redeemed_by uuid references public.profiles(id), redeemed_at timestamptz
);
create index if not exists activation_codes_v73_status_idx on public.activation_codes_v73(status,created_at desc);
alter table public.activation_settings_v73 enable row level security;
alter table public.activation_codes_v73 enable row level security;

drop policy if exists activation_settings_read_v73 on public.activation_settings_v73;
create policy activation_settings_read_v73 on public.activation_settings_v73 for select to authenticated using(true);
drop policy if exists activation_settings_admin_v73 on public.activation_settings_v73;
create policy activation_settings_admin_v73 on public.activation_settings_v73 for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists activation_codes_admin_read_v73 on public.activation_codes_v73;
create policy activation_codes_admin_read_v73 on public.activation_codes_v73 for select to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

create or replace function public.create_activation_code_v73(p_plan text,p_note text default null) returns text language plpgsql security definer set search_path=public as $$
declare c text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'Admin эрх шаардлагатай'; end if;
 if p_plan not in ('student','teacher') then raise exception 'Эрхийн төрөл буруу'; end if;
 loop c:='SMT-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,4))||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,4)); exit when not exists(select 1 from public.activation_codes_v73 where code=c); end loop;
 insert into public.activation_codes_v73(code,plan,note,created_by,expires_at) values(c,p_plan,nullif(trim(p_note),''),auth.uid(),now()+interval '30 days'); return c;
end $$;

create or replace function public.redeem_activation_code_v73(p_code text) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.activation_codes_v73%rowtype; urole text; base_start timestamptz;
begin
 if auth.uid() is null then raise exception 'Нэвтэрсэн account шаардлагатай'; end if;
 select * into r from public.activation_codes_v73 where code=upper(replace(trim(p_code),' ','')) for update;
 if not found then raise exception 'Код буруу байна'; end if;
 if r.status<>'unused' then raise exception 'Энэ код ашиглагдсан эсвэл идэвхгүй байна'; end if;
 if r.expires_at is not null and r.expires_at<now() then update public.activation_codes_v73 set status='expired' where id=r.id; raise exception 'Кодын хугацаа дууссан байна'; end if;
 select role into urole from public.profiles where id=auth.uid();
 if urole is null then raise exception 'Account profile олдсонгүй'; end if;
 if urole<>r.plan then raise exception 'Энэ код '||r.plan||' account-д зориулагдсан'; end if;
 select greatest(now(),coalesce(max(ends_at),now())) into base_start from public.entitlements where user_id=auth.uid() and status='active' and ends_at>now();
 insert into public.entitlements(user_id,plan,starts_at,ends_at,status) values(auth.uid(),r.plan,now(),base_start+interval '365 days','active');
 update public.profiles set access_status='premium' where id=auth.uid();
 update public.activation_codes_v73 set status='used',redeemed_by=auth.uid(),redeemed_at=now() where id=r.id;
 return jsonb_build_object('ok',true,'plan',r.plan,'ends_at',base_start+interval '365 days');
end $$;
revoke all on function public.create_activation_code_v73(text,text) from public;
revoke all on function public.redeem_activation_code_v73(text) from public;
grant execute on function public.create_activation_code_v73(text,text) to authenticated;
grant execute on function public.redeem_activation_code_v73(text) to authenticated;
