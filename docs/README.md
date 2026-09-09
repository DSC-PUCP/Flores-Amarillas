# Guia de arquitectura

Este repositorio es un template generico basado en TanStack Start + Cloudflare
Workers + Supabase. El objetivo es dejar una base lista para empezar a
desarrollar con rutas, datos y UI ya integrados.

## Stack

- TanStack Start + Vite + React 19 + TypeScript
- TanStack Router (file based)
- TanStack Query (server state)
- Tailwind CSS + shadcn UI
- Supabase (auth + data)
- Cloudflare Workers (SSR y deploy)

## Estructura de carpetas

- `src/routes`: rutas file based de TanStack Router
- `src/modules`: modulos por feature (UI, hooks, servicios)
- `src/core`: modelos y contratos (tipos, interfaces)
- `src/repository`: acceso a datos y mapeos (Supabase)
- `src/components`: UI compartida
- `src/lib`: utilidades transversales (supabase, helpers)
- `src/data`: datos de ejemplo
- `src/assets`: estilos y assets

## Patrones principales

### 1) Rutas (routes)

Cada archivo en `src/routes` representa una ruta. Se recomienda:

- Usar `createFileRoute` en cada archivo.
- Validar search params con `zod` y `validateSearch`.
- Usar `loader` y `loaderDeps` para precargar datos con Query.

### 2) Modulos (feature first)

Cada modulo vive en `src/modules/<feature>` y contiene:

- `components`: UI interna del feature
- `hooks`: hooks de Query y estado
- `pages`: pantallas usadas por rutas
- `services.ts`: orquestacion entre UI y repositorio

### 3) Core (modelos e interfaces)

En `src/core` definimos tipos y contratos. Por ejemplo:

- `src/core/models`: tipos de dominio (Item, Status, etc)
- `src/core/interfaces`: contratos de repositorio

Esto ayuda a separar UI de datos y mantener consistencia.

### 4) Repositorio (data access)

En `src/repository` definimos las integraciones con Supabase:

- `database.types.ts` define el schema tipado
- `items` contiene queries y mapeos

Los metodos retornan `Result<T>` para mantener manejo de errores uniforme.

### 5) Servicios + Hooks

Los servicios convierten los metodos del repositorio en funciones seguras y
los hooks usan TanStack Query para cache y revalidacion.

Ejemplo:

- `ItemService.listItems()`
- `useListItems()` con `useQuery`

## Flujo de datos recomendado

1. Ruta valida parametros y precarga datos (loader)
2. Hook usa TanStack Query con el mismo queryKey
3. Servicio llama al repositorio
4. Repositorio consulta Supabase y mapea tipos

## Ejemplo base

El template incluye un feature de ejemplo en `src/modules/items`:

- Listado con filtros
- Detalle de item
- Formulario de creacion

Las rutas viven bajo `/travel` por compatibilidad del template. Puedes
renombrar esa carpeta y actualizar links para tu dominio.

## Supabase

1. Configura `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.
2. Actualiza `src/repository/database.types.ts` con tu schema real.
3. Crea tu repositorio con queries a tus tablas.

## Cloudflare Workers

- Configuracion en `wrangler.json`
- Genera tipos con `bun --bun run cf-typegen`
- Deploy con `bun --bun run deploy`

## Recomendaciones

- Mantener un modulo por feature
- Reusar componentes en `src/components/ui`
- Validar inputs con `zod`
- Ejecutar `bun --bun run check` antes de subir cambios
