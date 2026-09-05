-- ============================================================
-- Revistas Digitales para Clubes Deportivos — schema v1 (mono-cliente)
-- Diseñado con club_id/slug en la tabla principal para que migrar a
-- multi-tenant más adelante sea un ALTER, no una reescritura.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- CLUB (singleton, slug fijo por ahora) ----------
create table if not exists club (
  slug text primary key default 'sportboys',
  nombre text not null,
  eyebrow text,
  fecha_fundacion date,
  hero_titulo_pre text,
  hero_titulo_em text,
  hero_titulo_post text,
  hero_subtitulo text,
  hero_cifras jsonb not null default '[]'::jsonb, -- [{numero,label}]
  escudo_url text,
  hero_bg_url text,
  fundacion_relato text,
  fundacion_foto_url text,
  fundacion_foto_caption text,
  kits_intro text,
  camadas_intro text,
  mistica_intro text,
  hermandad_texto text,
  actualidad_intro text,
  actualidad_de_donde text,
  actualidad_hacia_donde text,
  actualidad_bg_url text,
  memoria_intro text,
  memoria_nota text,
  galeria_intro text,
  cta_titulo text,
  cta_texto text,
  updated_at timestamptz not null default now()
);

-- ---------- FUNDADORES ----------
create table if not exists founders (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  nombre text not null,
  apodo text,
  es_presidente boolean not null default false,
  orden int not null default 0
);

-- ---------- CAMISETAS / KITS (evolución de identidad) ----------
create table if not exists kits (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  anio text not null,
  nombre text not null,
  descripcion text,
  color_hex text default '#999999',
  imagen_url text,
  orden int not null default 0
);

-- ---------- CAMADAS / GENERACIONES ----------
create table if not exists camadas (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  nombre text not null,       -- "Primera camada — Los Fundadores"
  emoji text default '🥇',
  descripcion text,
  imagen_url text,
  orden int not null default 0
);

create table if not exists camada_jugadores (
  id uuid primary key default gen_random_uuid(),
  camada_id uuid not null references camadas(id) on delete cascade,
  nombre text not null,
  rol_destacado text,          -- "Capitán", "Arquero", null si es jugador normal
  orden int not null default 0
);

-- ---------- ANÉCDOTAS / MÍSTICA ----------
create table if not exists anecdotas (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  tag text,
  titulo text not null,
  texto text,
  cita text,
  imagen_url text,
  orden int not null default 0
);

-- ---------- RIVALIDADES / HITOS ----------
create table if not exists rivales (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  label text not null,
  nombres text not null,
  orden int not null default 0
);

create table if not exists stats_hitos (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  numero text not null,
  etiqueta text not null,
  orden int not null default 0
);

-- ---------- MEMORIA (homenajes) ----------
create table if not exists memoria (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  nombre text not null,
  orden int not null default 0
);

-- ---------- MEDIA (fotos y videos: hermandad strip + galería + testimonios) ----------
create table if not exists media_gallery (
  id uuid primary key default gen_random_uuid(),
  club_slug text not null references club(slug) on delete cascade,
  seccion text not null check (seccion in ('hermandad','galeria','testimonios')),
  tipo text not null check (tipo in ('foto','video')),
  url text not null,
  caption text,
  autor text,        -- solo se usa en testimonios
  orden int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS: lectura pública, escritura solo admin autenticado
-- ============================================================
alter table club enable row level security;
alter table founders enable row level security;
alter table kits enable row level security;
alter table camadas enable row level security;
alter table camada_jugadores enable row level security;
alter table anecdotas enable row level security;
alter table rivales enable row level security;
alter table stats_hitos enable row level security;
alter table memoria enable row level security;
alter table media_gallery enable row level security;

do $$
declare t text;
begin
  for t in select unnest(array['club','founders','kits','camadas','camada_jugadores','anecdotas','rivales','stats_hitos','memoria','media_gallery'])
  loop
    execute format('drop policy if exists "public read" on %I', t);
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('drop policy if exists "admin write" on %I', t);
    execute format('create policy "admin write" on %I for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'')', t);
  end loop;
end $$;

-- ============================================================
-- STORAGE: bucket público "media" con escritura solo para admin
-- ============================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update using (bucket_id = 'media' and auth.role() = 'authenticated');

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete using (bucket_id = 'media' and auth.role() = 'authenticated');
