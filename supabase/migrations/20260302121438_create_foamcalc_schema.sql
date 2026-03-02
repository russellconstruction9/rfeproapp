-- migration: create foamcalc schema
-- description: creates tables for profiles, settings, inventory, customers, and estimates with rls enabled.

-- create profiles table to extend auth.users
create table profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  business_name text,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

-- create settings table
create table settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  open_cell_yield numeric default 16000,
  closed_cell_yield numeric default 4000,
  open_cell_price numeric default 2000,
  closed_cell_price numeric default 2500,
  created_at timestamptz default now(),
  constraint unique_user_settings unique (user_id)
);

alter table settings enable row level security;

-- create inventory table
create table inventory (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  open_cell_sets numeric default 0,
  closed_cell_sets numeric default 0,
  updated_at timestamptz default now(),
  constraint unique_user_inventory unique (user_id)
);

alter table inventory enable row level security;

-- create customers table
create table customers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  phone text,
  address text,
  created_at timestamptz default now()
);

alter table customers enable row level security;

-- create estimates table
create table estimates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  customer_id uuid references customers(id) on delete cascade not null,
  date timestamptz default now(),
  status text check (status in ('draft', 'sold')) default 'draft',
  open_sets numeric default 0,
  closed_sets numeric default 0,
  estimated_cost numeric default 0,
  total_area numeric default 0,
  total_board_feet numeric default 0,
  created_at timestamptz default now()
);

alter table estimates enable row level security;

-- RLS POLICIES

-- PROFILES
-- policy to allow users to view their own profile
create policy "users can view their own profile"
  on profiles for select
  using ( auth.uid() = id );

-- policy to allow users to update their own profile
create policy "users can update their own profile"
  on profiles for update
  using ( auth.uid() = id );

-- policy to allow users to insert their own profile (usually handled by trigger, but good for backup)
create policy "users can insert their own profile"
  on profiles for insert
  with check ( auth.uid() = id );

-- SETTINGS
-- policy to allow users to view their own settings
create policy "users can view their own settings"
  on settings for select
  using ( auth.uid() = user_id );

-- policy to allow users to update their own settings
create policy "users can update their own settings"
  on settings for update
  using ( auth.uid() = user_id );

-- policy to allow users to insert their own settings
create policy "users can insert their own settings"
  on settings for insert
  with check ( auth.uid() = user_id );

-- INVENTORY
-- policy to allow users to view their own inventory
create policy "users can view their own inventory"
  on inventory for select
  using ( auth.uid() = user_id );

-- policy to allow users to update their own inventory
create policy "users can update their own inventory"
  on inventory for update
  using ( auth.uid() = user_id );

-- policy to allow users to insert their own inventory
create policy "users can insert their own inventory"
  on inventory for insert
  with check ( auth.uid() = user_id );

-- CUSTOMERS
-- policy to allow users to view their own customers
create policy "users can view their own customers"
  on customers for select
  using ( auth.uid() = user_id );

-- policy to allow users to insert their own customers
create policy "users can insert their own customers"
  on customers for insert
  with check ( auth.uid() = user_id );

-- policy to allow users to update their own customers
create policy "users can update their own customers"
  on customers for update
  using ( auth.uid() = user_id );

-- policy to allow users to delete their own customers
create policy "users can delete their own customers"
  on customers for delete
  using ( auth.uid() = user_id );

-- ESTIMATES
-- policy to allow users to view their own estimates
create policy "users can view their own estimates"
  on estimates for select
  using ( auth.uid() = user_id );

-- policy to allow users to insert their own estimates
create policy "users can insert their own estimates"
  on estimates for insert
  with check ( auth.uid() = user_id );

-- policy to allow users to update their own estimates
create policy "users can update their own estimates"
  on estimates for update
  using ( auth.uid() = user_id );

-- policy to allow users to delete their own estimates
create policy "users can delete their own estimates"
  on estimates for delete
  using ( auth.uid() = user_id );

-- TRIGGER to create profile, settings, and inventory on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.settings (user_id)
  values (new.id);

  insert into public.inventory (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
