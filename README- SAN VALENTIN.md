# 🌻 Flores Amarillas

Web de DSC PUCP para regalar páginas personalizadas el **21 de septiembre**.
El usuario elige una plantilla, la personaliza con sus fotos y textos, y obtiene
un enlace permanente tras pagar por WhatsApp. **Todo lo recaudado va a fondos de
DSC PUCP.**

Este proyecto parte de [`DSC-PUCP/valentine-web-gift`](https://github.com/DSC-PUCP/valentine-web-gift)
(ver [Créditos](#créditos)).

---

## Requisitos

- **Bun** v1.3.8 o superior — el proyecto no usa npm.
- Cuenta de Cloudflare con Workers habilitado.
- Proyecto de Supabase.

Instalar Bun en Windows:

```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

Instalar Bun en macOS/Linux:

```bash
curl -fsSL https://bun.sh/install | bash
```

> **Windows:** si clonas este repo y falla con `Filename too long`, usa
> `git -c core.longpaths=true clone ...`. Hay rutas de plantillas muy anidadas.

> **No uses el flag `--bun`.** `bun --bun run build` falla con
> `wrangler.unstable_readConfig is not a function`: ese flag obliga a ejecutar
> los binarios con el runtime de Bun, y la interoperabilidad CommonJS de Bun no
> expone ese export de wrangler al plugin de Cloudflare. Con `bun run build` a
> secas, vite corre bajo Node y compila bien. Es lo que hace CI.

## Arranque

```bash
bun install
cp .env.example .env   # y completa los valores
bun run dev
```

## Variables de entorno

| Variable | Obligatoria | Para qué |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | sí | URL del proyecto de Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | sí | Clave pública de Supabase |

## Scripts

```bash
bun run dev       # servidor de desarrollo
bun run build     # build de producción
bun run check     # formatea y lintea (correr ANTES de cada PR)
bun run test      # tests
bun run deploy    # build + deploy a Cloudflare Workers
```

---

## Cómo funciona

1. El usuario elige una plantilla en `/template` y la personaliza en `/template/$id`.
2. Se crea una fila en `pages` con `is_paid = false`. Si el plan es pagado, el
   preview expira a los **45 minutos**.
3. El usuario ve su página en `/lovepage/$lovepageId` con una barra de vista previa
   y un botón que abre WhatsApp con el enlace y el monto ya escritos.
4. Envía el comprobante de Yape/Plin por WhatsApp.
5. El encargado valida el pago y activa la página, que llama a la RPC
   `activate_love_page` de Supabase.
6. El enlace queda permanente.

## Estructura

```
src/
├── routes/          rutas file-based (cada archivo = una URL)
├── modules/         un módulo por feature: landing, templates, lovepage, plan, auth
├── core/            modelos de dominio e interfaces de repositorio
├── repository/      acceso a Supabase, devuelve Result<T>
├── components/ui/   shadcn compartido
└── lib/             cliente de Supabase, helpers
```

Flujo de datos: **ruta (loader) → hook (Query) → service → repository → Supabase.**

Guía de arquitectura completa en [`docs/README.md`](docs/README.md).

## Agregar una plantilla

1. Crear el componente en `src/modules/templates/components/templates/MiPlantilla.tsx`.
   Recibe `{ templateData, isPreview }`.
2. Exportarlo desde `templates/index.ts`.
3. Registrarlo en `TEMPLATE_COMPONENTS` (`components/config/template-components.ts`)
   con su `template_key`.
4. Si tiene formulario propio, agregar su config a `TEMPLATES_CATALOG`.
5. Poner los assets en `templates/assets/`.
6. **Insertar la fila en la tabla `templates` de Supabase** con el mismo
   `template_key`, su `plan_id` y su `schema_json`.

El paso 6 es el que se olvida y hace que la plantilla no aparezca aunque el
código esté perfecto.

Ver también el diagrama en `docs/proceso_agregar_plantilla.drawio`.

## Cómo trabajamos

- `main` es producción. Se trabaja en `developer` y se abre PR.
- De `developer` a `main` mergea únicamente el tech lead.
- **Nada llega a `main` sin el checklist de QA firmado.** Después del
  lanzamiento el sitio tiene clientes pagando: cada deploy pasa por regresión.
- `bun run check` antes de cada PR.
- Una plantilla = una rama. El único archivo compartido es
  `template-components.ts`: agrega solo tu línea.

Una plantilla está terminada cuando se ve bien en un celular real de 360 px,
sus campos guardan y se releen, las imágenes que sube el usuario se muestran,
funciona en preview y en pagado, está registrada en `TEMPLATE_COMPONENTS` con su
fila en Supabase, y **alguien que no la programó la usó de punta a punta**.

---

## Pendientes conocidos

- [ ] **Recrear y versionar el schema de Supabase.** El proyecto original nunca
      lo versionó; el schema se deduce de `src/repository/database.types.ts`.
      Debe quedar en `supabase/migrations/`.
- [ ] **Auditar las políticas RLS.** El cliente escribe en `pages` con la clave
      anónima, que es pública. `is_paid` solo debe poder cambiarlo la RPC.
- [ ] Re-pintar las plantillas heredadas a la identidad de flores amarillas.
- [ ] Panel `/admin` para activar páginas sin disparar un POST a mano.

## Créditos

Construido sobre el trabajo del equipo de DSC PUCP que sacó `valentine-web-gift`
en febrero de 2026: Paul Espettia, gainOwo, leo-puk, Renatto Tobias Garcia Arce,
Diego Ochoa, Sandy, giano-montano, mako, Luchex, Jorge Chamorro y SergioCB20.
