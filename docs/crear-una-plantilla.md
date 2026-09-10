# Cómo crear una plantilla nueva

Guía paso a paso. Al final tienes una plantilla que el cliente puede
personalizar, previsualizar, pagar y regalar.

> **Regla de oro:** una plantilla vive en **dos sitios** que tienen que estar
> sincronizados — el código del repo y una fila en la tabla `templates` de
> Supabase. El 90% de los "no me aparece la plantilla" es que falta uno de los dos.

---

## Antes de empezar

```bash
git checkout developer && git pull
git checkout -b plantilla/mi-plantilla
bun install
bun run dev
```

> No uses el flag `--bun`. `bun --bun run build` revienta con
> `wrangler.unstable_readConfig is not a function`.

Elige tu `template_key` **ahora** y no lo cambies después. Es la cadena que une
el código con la base de datos. Convención: minúsculas y guiones bajos, por
ejemplo `ramo_girasoles`.

---

## Paso 1 · Crear el archivo

```
src/modules/templates/components/templates/RamoGirasoles.tsx
```

Si tu plantilla necesita subcomponentes propios, crea una carpeta en vez de un
archivo suelto y mete todo dentro:

```
templates/ramo_girasoles/
├── App.tsx
├── components/
│   ├── Sobre.tsx
│   └── Petalos.tsx
├── constants.ts
└── types.ts
```

**Todo lo que sea solo tuyo va dentro de tu carpeta.** No lo dejes en la raíz de
`templates/`: ahí parece compartido y otro dev va a dudar si puede tocarlo.

---

## Paso 2 · El componente y su contrato

Tu componente recibe exactamente dos props:

```tsx
import type { TemplateSlideProps } from '../../types';

export function RamoGirasoles({ templateData, isPreview }: TemplateSlideProps) {
  const data = templateData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-yellow-200">
      <h1>{String(data.personA)} y {String(data.personB)}</h1>
      <p>{String(data.message)}</p>
      {data.image && <img src={String(data.image)} alt="" />}
    </div>
  );
}
```

| Prop | Tipo | Para qué |
|---|---|---|
| `templateData` | `TemplateData` | Lo que el cliente llenó en el formulario |
| `isPreview` | `boolean \| undefined` | `true` mientras no ha pagado |

### Tres cosas que hay que saber de `templateData`

**Es un diccionario sin tipar.** Su tipo real es
`Record<string, string | number | boolean | Array | null | undefined>`. No hay
autocompletado ni te va a avisar si escribes mal una clave. Envuelve en
`String(...)` o `Number(...)` al usarlo.

**Las imágenes llegan como URL, no como archivo.** Cuando el cliente sube una
foto, el servicio la manda al storage de Supabase y **reemplaza el valor por la
URL pública** antes de guardar. Tu componente siempre lee un string.

**Los arrays de imágenes llegan como array de URLs.** Un campo
`timelinePhotos` de tipo `array` con `item_type: 'image'` te llega como
`['https://...', 'https://...']`.

### Qué hacer con `isPreview`

Sirve para marcar visualmente que es una vista previa, no para esconder
contenido. **El preview muestra la plantilla completa** — es el anzuelo de venta:
el cliente ve exactamente lo que compra.

Encima de tu componente, la ruta ya pinta una barra fija con el precio y el botón
de pago. Tú no tienes que dibujar nada de eso.

Úsalo, como mucho, para una marca de agua o para desactivar algo que no quieras
que se comparta antes de pagar.

---

## Paso 3 · Definir el formulario

Este es el paso que más se subestima. El formulario **no se programa**: se
describe como datos y el motor lo dibuja solo.

```tsx
import type { TemplateConfig, TemplateForm } from '@/core/models/template';

const ramoGirasolesForm: TemplateForm = [
  {
    title: 'Protagonistas',
    fields: [
      { name: 'personA', label: 'Tu nombre',  type: 'string', max_length: 25, required: true },
      { name: 'personB', label: 'Su nombre',  type: 'string', max_length: 25, required: true },
      { name: 'startDate', label: '¿Desde cuándo?', type: 'date', required: true },
    ],
  },
  {
    title: 'El mensaje',
    fields: [
      { name: 'message', label: 'Escribe tu dedicatoria', type: 'textarea', max_length: 250, required: true },
    ],
  },
  {
    title: 'Recuerdos',
    fields: [
      { name: 'image', label: 'Foto de portada', type: 'image', required: true },
      { name: 'timelinePhotos', label: 'Momentos juntos', type: 'array', item_type: 'image', min_items: 1, max_items: 5, required: false },
    ],
  },
];
```

Cada objeto del array es un **paso** del formulario, con su título. El cliente
los recorre en orden.

### Tipos de campo disponibles

Todos aceptan `name`, `label` y `required`. Estos son los extras:

| `type` | Extras | Llega al componente como |
|---|---|---|
| `string` | `max_length`, `format` (`hex`, `email`, `url`, `date`), `default` | `string` |
| `textarea` | `max_length` | `string` |
| `number` | — | `number` |
| `boolean` | `default` | `boolean` |
| `date` | `default` | `string` |
| `image` | `default` | `string` con la URL pública |
| `array` | `item_type` (`image`, `string`, `number`, `boolean`), `min_items`, `max_items`, `item_max_length` | array del tipo correspondiente |

> **`name` es la clave exacta.** Si el campo se llama `personA`, tu componente
> lee `templateData.personA`. Un typo acá no da error de compilación: da un campo
> vacío en producción.

> **Pon `max_length` siempre.** Sin límite, alguien pega tres párrafos y te
> rompe el diseño. Escribe tus textos de ejemplo con el largo máximo y comprueba
> que no desborde en un celular de 360 px.

---

## Paso 4 · Exportar la configuración

Al final de tu archivo:

```tsx
export const ramoGirasolesConfig = {
  templateForm: ramoGirasolesForm,
  component: RamoGirasoles,
} satisfies TemplateConfig;
```

El `satisfies` te valida la forma sin perder el tipo concreto. Úsalo, no lo
cambies por `: TemplateConfig`.

---

## Paso 5 · Exportarla desde el barrel

En `templates/index.ts`, agrega **solo tu línea**:

```ts
export { RamoGirasoles, ramoGirasolesConfig } from './RamoGirasoles';
```

Si tu plantilla vive en una carpeta, apunta a su `App`:

```ts
export { RamoGirasoles, ramoGirasolesConfig } from './ramo_girasoles/App';
```

---

## Paso 6 · Registrarla en los dos mapas

En `components/config/template-components.ts` hay **dos** registros y necesitas
estar en ambos:

```ts
export const TEMPLATE_COMPONENTS: Record<string, React.FC<...>> = {
  // ...
  'ramo_girasoles': RamoGirasoles,
};

export const TEMPLATES_CATALOG: Record<string, TemplateConfig> = {
  // ...
  'ramo_girasoles': ramoGirasolesConfig,
};
```

| Registro | Si falta | Síntoma |
|---|---|---|
| `TEMPLATE_COMPONENTS` | El renderizador no encuentra el componente | Pantalla que dice "No se encontró la plantilla" |
| `TEMPLATES_CATALOG` | No hay formulario | El cliente entra a personalizar y no ve ningún campo |

> ⚠️ **Este archivo lo tocan todos los devs.** Es la única fuente real de
> conflictos de merge del proyecto. Agrega solo tu línea y, al resolver un
> conflicto, **no borres las ajenas**.

---

## Paso 7 · Los assets

Mete tus imágenes en una carpeta con el nombre de tu plantilla:

```
src/modules/templates/assets/images/ramo_girasoles/
src/modules/templates/assets/gifs/ramo_girasoles/
```

E impórtalas, no las referencies por ruta de texto:

```tsx
import girasol from '../../assets/images/ramo_girasoles/girasol.png';
```

Así Vite las procesa, les pone hash y las sirve desde el CDN de Cloudflare.

> **Nunca escribas a mano una URL de Supabase en el código.** El proyecto arrastra
> seis URLs así apuntando al storage del proyecto de San Valentín, que no
> controlamos. Si ese proyecto desaparece, esas imágenes se caen.

---

## Paso 8 · Crear la fila en Supabase

Sin esto la plantilla **no existe** para la aplicación, por muy bien que esté el
código. En el SQL Editor:

```sql
insert into public.templates
  (name, description, plan_id, template_key, is_visible, preview_image_url)
values
  ('Ramo de girasoles',
   'Para quien te alegra los días',
   (select id from public.plans where name = 'Clasico'),
   'ramo_girasoles',
   1,
   null);
```

| Columna | Qué poner |
|---|---|
| `template_key` | **Exactamente** la misma cadena que usaste en el paso 6 |
| `plan_id` | Determina el precio. Sácalo por nombre, no adivines el número |
| `is_visible` | `1` para que aparezca, `0` para tenerla oculta mientras trabajas |
| `schema_json` | Déjalo por defecto. Si la clave está en `TEMPLATES_CATALOG`, el código ignora esta columna |
| `preview_image_url` | La miniatura del catálogo. Puede ir `null` al principio |

### Por qué `schema_json` casi siempre sobra

`TemplateService` hace esto al leer una plantilla:

```ts
const catalogConfig = TEMPLATES_CATALOG[template.templateKey];
if (catalogConfig) return { ...template, schemaJson: catalogConfig.templateForm };
return template;
```

Si registraste tu config en el catálogo, **el formulario del código gana** y lo
que haya en la base se descarta. Solo importa `schema_json` para plantillas que
no están en `TEMPLATES_CATALOG`.

Prefiere siempre el catálogo: queda versionado en git y tipado.

---

## Paso 9 · Probarla de verdad

**Modo preview.** Crea una página desde `/template`, llena el formulario y llega
a `/lovepage/<uuid>`. Tienes que ver la barra de vista previa con el precio.

**Modo pagado.** Actívala y recarga: la barra desaparece.

**Con datos reales, no de ejemplo.** Sube tus propias fotos y comprueba que se
ven. Es distinto de las imágenes que vienen por defecto.

**En un celular real.** No basta el modo responsive del navegador. Android e
iPhone, con datos móviles, ancho de 360 px.

**Con los textos al máximo.** Llena cada campo hasta su `max_length`.

---

## Paso 10 · Checklist de terminado

- [ ] Se ve bien en un celular real de 360 px
- [ ] Todos los campos guardan y se vuelven a leer
- [ ] Las imágenes que sube el cliente se muestran, no solo las de ejemplo
- [ ] Funciona en preview **y** en pagado
- [ ] Está en `TEMPLATE_COMPONENTS` y en `TEMPLATES_CATALOG`
- [ ] Tiene su fila en `templates` con el mismo `template_key`
- [ ] `bun run check` pasa limpio
- [ ] Alguien que no la programó la usó de punta a punta

---

## Errores frecuentes

| Síntoma | Causa |
|---|---|
| "No se encontró la plantilla" | Falta en `TEMPLATE_COMPONENTS`, o el `template_key` no coincide |
| No aparece en el catálogo | Falta la fila en Supabase, o tiene `is_visible = 0` |
| El formulario sale vacío | Falta en `TEMPLATES_CATALOG` |
| Un campo llega vacío | El `name` del campo no coincide con la clave que lee el componente |
| La imagen no se ve | Estás leyendo un objeto en vez de un string, o el bucket no es público |
| Se ve bien en el navegador y mal en el celular | Probaste en modo responsive en vez de en un teléfono |
| El build falla con `unstable_readConfig` | Usaste `bun --bun run build`. Quita el `--bun` |
