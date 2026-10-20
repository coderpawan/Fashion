create extension if not exists pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'look_status') THEN
    CREATE TYPE look_status AS ENUM ('draft', 'scheduled', 'published');
  END IF;
END $$;

create table if not exists admin_users (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists looks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  category_id uuid references categories(id) on delete set null,
  published_at timestamptz,
  scheduled_at timestamptz,
  status look_status not null default 'draft',
  main_image_path text,
  video_path text,
  instagram_url text,
  youtube_url text,
  thumbnail_path text,
  price numeric,
  original_price numeric,
  currency text not null default 'INR',
  brand text,
  material text,
  color text,
  sizes jsonb,
  fit text,
  occasion text,
  length text,
  pattern text,
  care_instructions text,
  styling_tips text,
  additional_notes text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id) on delete set null
);

create table if not exists look_media (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references looks(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  alt_text text,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists shopping_links (
  id uuid primary key default gen_random_uuid(),
  look_id uuid not null references looks(id) on delete cascade,
  retailer_name text not null,
  affiliate_url text not null,
  button_label text not null,
  displayed_price numeric,
  currency text not null default 'INR',
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  site_name text not null default 'Fashion with Ankita',
  logo_path text,
  homepage_headline text not null default 'Daily fashion finds curated for you',
  homepage_introduction text not null default 'Discover elegant outfits, statement accessories and modern styling inspiration.',
  about_page_content text,
  instagram_url text,
  youtube_url text,
  footer_content text,
  affiliate_disclosure text,
  ai_disclaimer text,
  updated_at timestamptz not null default now(),
  unique (site_name)
);

create index if not exists idx_looks_published_on on looks (status, published_at desc);
create index if not exists idx_looks_category_idx on looks (category_id, status, published_at desc);
create index if not exists idx_looks_slug on looks (slug);
create index if not exists idx_categories_slug on categories (slug);
create index if not exists idx_shopping_links_look on shopping_links (look_id, display_order);

create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

DROP TRIGGER IF EXISTS set_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS set_looks_updated_at ON looks;
DROP TRIGGER IF EXISTS set_shopping_links_updated_at ON shopping_links;
DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;

create trigger set_categories_updated_at
before update on categories
for each row execute function update_updated_at_column();

create trigger set_looks_updated_at
before update on looks
for each row execute function update_updated_at_column();

create trigger set_shopping_links_updated_at
before update on shopping_links
for each row execute function update_updated_at_column();

create trigger set_site_settings_updated_at
before update on site_settings
for each row execute function update_updated_at_column();

create or replace function is_admin_user()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users au
    where au.user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin_user() to authenticated;

drop policy if exists "Admins can manage admin list" on admin_users;

alter table admin_users enable row level security;
alter table categories enable row level security;
alter table looks enable row level security;
alter table look_media enable row level security;
alter table shopping_links enable row level security;
alter table site_settings enable row level security;

DROP POLICY IF EXISTS "Public can read published looks" ON looks;
DROP POLICY IF EXISTS "Public can read active categories" ON categories;
DROP POLICY IF EXISTS "Public can read published media and settings" ON look_media;
DROP POLICY IF EXISTS "Public can read shopping links for published looks" ON shopping_links;
DROP POLICY IF EXISTS "Public can read site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage all data" ON looks;
DROP POLICY IF EXISTS "Admins can manage all media" ON look_media;
DROP POLICY IF EXISTS "Admins can manage all shopping links" ON shopping_links;
DROP POLICY IF EXISTS "Admins can manage category data" ON categories;
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can manage admin list" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated admin to upload to storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated admin to update storage" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated admin to delete storage" ON storage.objects;
DROP POLICY IF EXISTS "Public can read fashion-media bucket" ON storage.objects;

create policy "Public can read published looks"
on looks for select to public using (status = 'published' and published_at <= now());

create policy "Public can read active categories"
on categories for select to public using (is_active = true);

create policy "Public can read published media and settings"
on look_media for select to public using (true);

create policy "Public can read shopping links for published looks"
on shopping_links for select to public using (exists (
  select 1 from looks l where l.id = shopping_links.look_id and l.status = 'published' and l.published_at <= now()
));

create policy "Public can read site settings"
on site_settings for select to public using (true);

create policy "Admins can manage all data"
on looks for all to authenticated using (is_admin_user()) with check (is_admin_user());
create policy "Admins can manage all media"
on look_media for all to authenticated using (is_admin_user()) with check (is_admin_user());
create policy "Admins can manage all shopping links"
on shopping_links for all to authenticated using (is_admin_user()) with check (is_admin_user());
create policy "Admins can manage category data"
on categories for all to authenticated using (is_admin_user()) with check (is_admin_user());
create policy "Admins can manage site settings"
on site_settings for all to authenticated using (is_admin_user()) with check (is_admin_user());
create policy "Admins can manage admin list"
on admin_users for all to authenticated using (is_admin_user()) with check (is_admin_user());

create policy "Allow authenticated admin to upload to storage"
on storage.objects for insert to authenticated with check (
  bucket_id = 'fashion-media' and is_admin_user()
);

create policy "Allow authenticated admin to update storage"
on storage.objects for update to authenticated using (
  bucket_id = 'fashion-media' and is_admin_user()
);

create policy "Allow authenticated admin to delete storage"
on storage.objects for delete to authenticated using (
  bucket_id = 'fashion-media' and is_admin_user()
);

create policy "Public can read fashion-media bucket"
on storage.objects for select to public using (bucket_id = 'fashion-media');
