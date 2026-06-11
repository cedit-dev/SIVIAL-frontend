# SinVial Backend Database Schema

This document is the contract for the PostgreSQL database. The database should enable PostGIS before creating tables.

```sql
create extension if not exists pgcrypto;
create extension if not exists postgis;
```

## users

```sql
create table users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## uploaded_files

```sql
create table uploaded_files (
  id uuid primary key default gen_random_uuid(),
  original_name text not null,
  storage_path text not null,
  public_url text not null,
  mime_type text,
  size_bytes integer not null default 0,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);
```

## import_batches

```sql
create table import_batches (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  source_file_path text not null,
  source_pdf_path text,
  status text not null check (status in ('processing', 'completed', 'completed_with_errors', 'failed')),
  total_rows integer not null default 0,
  imported_rows integer not null default 0,
  error_rows integer not null default 0,
  errors jsonb not null default '[]'::jsonb,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
```

## accidents

`lat`, `lng`, and `geom` are nullable because the official source currently includes `VIA-KM-SITIO` but no coordinates.

```sql
create table accidents (
  id uuid primary key default gen_random_uuid(),
  numero integer,
  fecha date not null,
  hora time not null,
  dia text,
  via_km_sitio text,
  clase_accidente text,
  fallecido_raw text,
  lesionado_raw text,
  zona text,
  vehiculo_1 text,
  vehiculo_2 text,
  vehiculo_3 text,
  condicion_lesionado text,
  condicion_fallecido text,
  sexo text,
  edad integer,
  hipotesis text,
  tipo text not null check (tipo in ('choque', 'atropello', 'volcamiento', 'caida_motocicleta', 'choque_animal', 'otro')),
  gravedad text not null check (gravedad in ('fatal', 'grave', 'leve', 'solo_danos')),
  victimas integer not null default 0,
  fallecidos integer not null default 0,
  lesionados integer not null default 0,
  via text not null,
  descripcion text not null,
  dia_semana text not null check (dia_semana in ('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')),
  lat double precision,
  lng double precision,
  geom geography(Point, 4326),
  geocoding_status text not null default 'pending' check (geocoding_status in ('pending', 'located', 'failed', 'manual')),
  import_batch_id uuid references import_batches(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index accidents_fecha_idx on accidents(fecha);
create index accidents_tipo_idx on accidents(tipo);
create index accidents_gravedad_idx on accidents(gravedad);
create index accidents_dia_semana_idx on accidents(dia_semana);
create index accidents_geom_idx on accidents using gist(geom);
```

## accident_vehicles

```sql
create table accident_vehicles (
  id uuid primary key default gen_random_uuid(),
  accident_id uuid not null references accidents(id) on delete cascade,
  position integer not null,
  vehicle_type text not null check (vehicle_type in ('automovil', 'motocicleta', 'camion', 'bicicleta', 'peaton', 'bus', 'otro')),
  created_at timestamptz not null default now(),
  unique(accident_id, position)
);

create index accident_vehicles_type_idx on accident_vehicles(vehicle_type);
```

## decretos

```sql
create table decretos (
  id uuid primary key default gen_random_uuid(),
  numero text not null,
  titulo text not null,
  categoria text not null check (categoria in ('Velocidad', 'Señalización', 'Sanciones', 'Movilidad', 'General')),
  fecha_expedicion date not null,
  fecha_vigencia date,
  estado text not null check (estado in ('Vigente', 'Derogado')),
  descripcion text,
  archivo_url text not null,
  archivo_nombre text not null,
  archivo_tamano integer not null default 0,
  creado_por uuid references users(id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index decretos_categoria_idx on decretos(categoria);
create index decretos_estado_idx on decretos(estado);
create index decretos_fecha_expedicion_idx on decretos(fecha_expedicion);
```

## traffic_signs

```sql
create table traffic_signs (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('prohibicion', 'advertencia', 'informacion')),
  nombre text not null,
  descripcion text not null,
  lat double precision not null,
  lng double precision not null,
  geom geography(Point, 4326) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index traffic_signs_tipo_idx on traffic_signs(tipo);
create index traffic_signs_geom_idx on traffic_signs using gist(geom);
```

## Seed user example

Generate the hash in Node with `bcryptjs.hash("12345", 10)` and insert it:

```sql
insert into users (email, password_hash, name, role)
values ('admin@ufpso.edu.co', '<bcrypt-hash>', 'Administrador SinVial', 'admin');
```
