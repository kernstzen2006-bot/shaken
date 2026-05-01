-- Run this SQL in Supabase SQL Editor

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read/update their own profile
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

-- Keep profile in sync when new auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Promote one user to admin (replace with real email)
-- update public.profiles set role = 'admin' where email = 'admin@yourdomain.com';

-- Admins should be able to manage profiles (view/update roles)
-- Admins table to avoid recursive policies when checking admin status
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

drop policy if exists "Admins can manage profiles" on public.profiles;
create policy "Admins can manage profiles"
on public.profiles
for all
using (exists (select 1 from public.admins a where a.id = auth.uid()))
with check (exists (select 1 from public.admins a where a.id = auth.uid()));

-- Products table
create extension if not exists "pgcrypto";

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price integer not null default 0,
  image text,
  alt_image text,
  images jsonb,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Basic policies: allow authenticated admin users to insert/update/delete, everyone can select
drop policy if exists "Public can select products" on public.products;
create policy "Public can select products"
on public.products
for select
using (true);

drop policy if exists "Authenticated admins can mutate products" on public.products;
create policy "Authenticated admins can mutate products"
on public.products
for all
using (
  exists (select 1 from public.admins a where a.id = auth.uid())
  or lower(coalesce(auth.jwt() ->> 'email', '')) = lower('ernstzenkhalid6@gmail.com')
)
with check (
  exists (select 1 from public.admins a where a.id = auth.uid())
  or lower(coalesce(auth.jwt() ->> 'email', '')) = lower('ernstzenkhalid6@gmail.com')
);

-- Orders table (simple sample)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  total integer not null default 0,
  items jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "Users can manage own orders" on public.orders;
create policy "Users can manage own orders"
on public.orders
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Customers / profiles are already handled by public.profiles

-- Note: Create a storage bucket named 'product-images' in Supabase Storage (public) for uploads.
