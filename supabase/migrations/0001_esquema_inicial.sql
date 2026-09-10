-- Flores Amarillas - esquema inicial
-- Pegar completo en el SQL Editor de Supabase y ejecutar una sola vez.

-- ---------------------------------------------------------------
-- 1. TABLAS
-- ---------------------------------------------------------------

create table if not exists public.plans (
  id          bigint generated always as identity primary key,
  name        text          not null,
  price       numeric(10,2) not null default 0,
  description text          not null default '',
  features    jsonb         not null default '[]'::jsonb
);

create table if not exists public.templates (
  id                bigint generated always as identity primary key,
  name              text     not null,
  description       text,
  schema_json       jsonb    not null default '[]'::jsonb,
  plan_id           bigint   not null references public.plans (id),
  preview_image_url text,
  template_key      text     not null unique,
  -- smallint a proposito: el repositorio hace `row.is_visible > 0`
  is_visible        smallint not null default 0
);

create table if not exists public.pages (
  id          uuid        primary key default gen_random_uuid(),
  template_id bigint      not null references public.templates (id),
  config_json jsonb       not null,
  is_paid     boolean     not null default false,
  expires_at  timestamptz
);

create table if not exists public.files (
  id        uuid primary key default gen_random_uuid(),
  page_id   uuid not null references public.pages (id) on delete cascade,
  file_path text not null,
  file_type text not null
);

create index if not exists templates_plan_id_idx on public.templates (plan_id);
create index if not exists pages_template_id_idx on public.pages (template_id);
create index if not exists files_page_id_idx     on public.files (page_id);

-- ---------------------------------------------------------------
-- 2. FUNCION DE ACTIVACION
-- Unico camino legitimo para poner is_paid = true.
-- ---------------------------------------------------------------

create or replace function public.activate_love_page(target_page_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.pages
     set is_paid    = true,
         expires_at = null
   where id = target_page_id;
$$;

-- Nadie desde el navegador puede ejecutarla.
revoke execute on function public.activate_love_page(uuid) from public, anon, authenticated;
grant  execute on function public.activate_love_page(uuid) to service_role;

-- ---------------------------------------------------------------
-- 3. RLS
-- ---------------------------------------------------------------

alter table public.plans     enable row level security;
alter table public.templates enable row level security;
alter table public.pages     enable row level security;
alter table public.files     enable row level security;

-- Catalogo: solo lectura.
create policy "plans lectura publica"     on public.plans     for select to anon, authenticated using (true);
create policy "templates lectura publica" on public.templates for select to anon, authenticated using (true);

-- Datos de cliente: crear y leer, nunca modificar.
create policy "pages lectura publica"  on public.pages for select to anon, authenticated using (true);
create policy "pages insercion"        on public.pages for insert to anon, authenticated with check (true);
create policy "files lectura publica"  on public.files for select to anon, authenticated using (true);
create policy "files insercion"        on public.files for insert to anon, authenticated with check (true);

-- No existe policy de UPDATE ni DELETE sobre pages: RLS niega por defecto.
-- Cinturon y tirantes: quitamos tambien el privilegio a nivel de tabla.
revoke update, delete on public.pages from anon, authenticated;
revoke update, delete on public.files from anon, authenticated;
revoke insert, update, delete on public.plans     from anon, authenticated;
revoke insert, update, delete on public.templates from anon, authenticated;

-- ---------------------------------------------------------------
-- 4. STORAGE
-- Crear antes el bucket 'flores-amarillas' como PUBLICO desde el panel.
-- ---------------------------------------------------------------

create policy "subir a flores-amarillas"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'flores-amarillas');

create policy "leer flores-amarillas"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'flores-amarillas');
