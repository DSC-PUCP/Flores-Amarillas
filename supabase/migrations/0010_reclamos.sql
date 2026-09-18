-- Libro de Reclamaciones digital.
--
-- Es obligatorio por el Codigo de Proteccion y Defensa del Consumidor, y las
-- pasarelas de pago lo piden para aprobar una afiliacion. Tiene que vivir en
-- el propio sitio: un enlace a un formulario de fuera no cuenta.
--
-- Dos cosas lo hacen distinto de `pagos`:
--
-- 1. Cada hoja lleva un correlativo visible y sin huecos. Se arma con una
--    secuencia y no contando filas, que con dos personas enviando a la vez
--    daria el mismo numero a las dos.
-- 2. Quien reclama tiene que quedarse con ese codigo. Como la tabla no se
--    puede leer desde el navegador —tiene nombre, documento y domicilio de
--    gente real—, la insercion va por una funcion `security definer` que
--    devuelve el codigo y nada mas.

-- ---------------------------------------------------------------
-- 1. LA TABLA
-- ---------------------------------------------------------------

create sequence if not exists public.reclamos_correlativo;

create table if not exists public.reclamos (
  id             uuid        primary key default gen_random_uuid(),
  -- Visible para quien reclama: "LR-000001".
  codigo         text        not null unique,
  tipo           text        not null,

  -- Quien reclama.
  nombre         text        not null,
  tipo_documento text        not null,
  documento      text        not null,
  domicilio      text        not null,
  correo         text        not null,
  telefono       text        not null,
  -- Si es menor de edad, quien firma por el.
  apoderado      text,

  -- Que contrato.
  tipo_bien      text        not null,
  descripcion    text        not null,
  monto          numeric(10, 2),

  -- El reclamo en si.
  detalle        text        not null,
  pedido         text        not null,

  -- Gestion interna.
  estado         text        not null default 'pendiente',
  respuesta      text,
  creado_en      timestamptz not null default now(),
  respondido_en  timestamptz,

  constraint reclamos_tipo_valido      check (tipo in ('reclamo', 'queja')),
  constraint reclamos_bien_valido      check (tipo_bien in ('producto', 'servicio')),
  constraint reclamos_estado_valido    check (estado in ('pendiente', 'respondido')),
  constraint reclamos_documento_valido check (tipo_documento in ('DNI', 'CE', 'pasaporte')),
  constraint reclamos_nombre_no_vacio  check (length(trim(nombre)) between 2 and 120),
  constraint reclamos_correo_valido    check (correo ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint reclamos_detalle_no_vacio check (length(trim(detalle)) >= 10),
  constraint reclamos_pedido_no_vacio  check (length(trim(pedido)) >= 10)
);

-- La consulta de cada dia es "que falta por responder", y esa lista es corta.
create index if not exists reclamos_pendientes_idx on public.reclamos (creado_en desc)
  where estado = 'pendiente';

-- ---------------------------------------------------------------
-- 2. RLS
-- ---------------------------------------------------------------

alter table public.reclamos enable row level security;

-- Sin policy de ninguna clase: al navegador no se le deja ni leer ni escribir
-- directamente. Lo unico que puede hacer es llamar a la funcion de abajo.
revoke select, insert, update, delete on public.reclamos from anon, authenticated;

-- ---------------------------------------------------------------
-- 3. REGISTRAR UN RECLAMO
-- ---------------------------------------------------------------

-- Inserta y devuelve solo el codigo. `security definer` porque la tabla esta
-- cerrada: asi el navegador puede dejar su hoja sin poder leer las de nadie.
create or replace function public.registrar_reclamo(
  p_tipo           text,
  p_nombre         text,
  p_tipo_documento text,
  p_documento      text,
  p_domicilio      text,
  p_correo         text,
  p_telefono       text,
  p_tipo_bien      text,
  p_descripcion    text,
  p_detalle        text,
  p_pedido         text,
  p_monto          numeric default null,
  p_apoderado      text    default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  nuevo_codigo text;
begin
  nuevo_codigo := 'LR-' || lpad(nextval('public.reclamos_correlativo')::text, 6, '0');

  insert into public.reclamos (
    codigo, tipo, nombre, tipo_documento, documento, domicilio, correo,
    telefono, apoderado, tipo_bien, descripcion, monto, detalle, pedido
  ) values (
    nuevo_codigo, p_tipo, p_nombre, p_tipo_documento, p_documento, p_domicilio,
    p_correo, p_telefono, p_apoderado, p_tipo_bien, p_descripcion, p_monto,
    p_detalle, p_pedido
  );

  return nuevo_codigo;
end;
$$;

revoke execute on function public.registrar_reclamo(
  text, text, text, text, text, text, text, text, text, text, text, numeric, text
) from public;
grant execute on function public.registrar_reclamo(
  text, text, text, text, text, text, text, text, text, text, text, numeric, text
) to anon, authenticated;
