# El sistema de plantillas por dentro

Cómo funcionan los registros, cómo un esquema declarativo se convierte en un
formulario, y cómo los datos de ese formulario terminan pintados en una página.

Audiencia: dev que va a modificar el motor, no solo escribir una plantilla.

---

## 1. El problema que resuelve

Queremos vender N diseños distintos. Cada uno pide datos distintos al cliente y
los pinta distinto. Las opciones malas son evidentes: una ruta por diseño, o un
`if` gigante, o un formulario que pide la unión de todos los campos posibles.

La solución del proyecto es un **registro de plugins con interfaz de usuario
dirigida por datos**. La aplicación no conoce ninguna plantilla concreta: conoce
un contrato y un diccionario.

Dos consecuencias que importan para el equipo:

- Agregar una plantilla no toca lógica de negocio.
- Varios devs trabajan en paralelo porque cada plantilla es un archivo aislado.

---

## 2. Las cuatro piezas

| Pieza | Archivo | Rol |
|---|---|---|
| `TEMPLATE_COMPONENTS` | `components/config/template-components.ts` | Clave → componente React |
| `TEMPLATES_CATALOG` | mismo archivo | Clave → configuración con el esquema del formulario |
| `TemplateRenderer` | `components/TemplateRenderer.tsx` | Resuelve la clave y renderiza |
| `TemplateForm` | `Form/TemplateForm.tsx` | Convierte el esquema en inputs |

Y la bisagra que lo sostiene todo: **`template_key`**, una cadena que existe a la
vez como columna en Postgres y como clave en los dos diccionarios de TypeScript.

---

## 3. Por qué hay dos registros y no uno

La pregunta obvia es por qué `TEMPLATES_CATALOG` no incluye el componente, si
`TemplateConfig` ya tiene un campo `component`. La respuesta está en que se
consumen en momentos distintos del ciclo de vida:

```
TEMPLATES_CATALOG   →  se lee al LISTAR y al PERSONALIZAR  (necesita el esquema)
TEMPLATE_COMPONENTS →  se lee al RENDERIZAR una página ya creada
```

`TemplateRenderer` no importa `TEMPLATES_CATALOG`: recibe una `templateKey` y
busca en `TEMPLATE_COMPONENTS`. Si usara el catálogo, renderizar una página
arrastraría todos los esquemas de formulario de todas las plantillas.

En la práctica la separación es imperfecta: `TemplateConfig.component` está
declarado y nadie lo usa para renderizar. Es duplicación heredada. Mientras las
dos entradas se agreguen juntas, no molesta.

> **Deuda anotada:** unificar en un solo registro tipado, con el componente
> cargado por `React.lazy` para que cada plantilla sea su propio chunk. Hoy
> **todas** las plantillas entran en el bundle aunque el cliente vea una sola.
> Con siete plantillas y animaciones, eso pesa. No tocar antes del 21.

---

## 4. Resolución: de la clave al componente

```tsx
export function TemplateRenderer({ templateKey, templateData, isPreview = true }) {
  const TemplateComponent = TEMPLATE_COMPONENTS[templateKey] || DefaultTemplate;
  return <TemplateComponent templateData={templateData} isPreview={isPreview} />;
}
```

Tres decisiones en tres líneas:

**Búsqueda por diccionario, no `switch`.** Agregar una plantilla es agregar una
entrada, no modificar una función.

**Respaldo silencioso.** Si la clave no existe, cae en `DefaultTemplate`, que
pinta "No se encontró la plantilla". No lanza excepción. Bueno para el cliente
—no ve una pantalla en blanco— y malo para nosotros: **un `template_key` mal
escrito no rompe nada visiblemente, solo deja de vender esa plantilla**. Nadie se
entera hasta que alguien reclama.

Si añades observabilidad al proyecto, este es el primer sitio donde poner un log.

**`isPreview` por defecto en `true`.** Falla hacia el lado seguro: si alguien
llama al renderizador sin decir nada, se comporta como vista previa. Nunca
regalas el contenido pagado por olvido.

---

## 5. El esquema del formulario y su precedencia

Una plantilla puede traer su esquema de dos sitios: la columna `schema_json` de
Postgres, o `TEMPLATES_CATALOG` en el código. La regla vive en `services.ts`:

```ts
const enrichTemplateWithCatalogSchema = (template: Template): Template => {
  const catalogConfig = TEMPLATES_CATALOG[template.templateKey];
  if (catalogConfig) {
    return { ...template, schemaJson: catalogConfig.templateForm };
  }
  return template;
};
```

**El código gana siempre.** Si la clave está en el catálogo, `schema_json` de la
base se descarta por completo.

Esto no es un accidente: el esquema es lógica, no contenido. Versionarlo en git,
tiparlo y revisarlo en un PR vale más que poder editarlo desde un dashboard. La
columna en la base queda como escotilla para plantillas que no están en el
catálogo.

En el estado actual eso importa mucho: de las siete plantillas, **solo dos están
en `TEMPLATES_CATALOG`**. Las otras cinco dependen de una columna `schema_json`
que hoy está vacía, y por eso arrancan con `is_visible = 0`.

### El tipo del esquema

```ts
type TemplateForm = TemplateFormStep[];
type TemplateFormStep = { title: string; fields: TemplateField[] };
```

`TemplateField` es una unión discriminada por `type` — siete variantes: `string`,
`textarea`, `number`, `boolean`, `date`, `image`, `array`. Cada una añade sus
propios modificadores (`max_length`, `item_type`, `min_items`…).

La unión discriminada es lo que hace que `TemplateForm.tsx` pueda ser una cadena
de comprobaciones de `field.type` con el tipo estrechado en cada rama.

---

## 6. Del esquema a los inputs

`TemplateForm.tsx` recorre los pasos y, dentro de cada uno, despacha por
`field.type`. Es un renderizador de formularios genérico, no un formulario.

Consecuencias de diseño que hay que tener presentes:

**No hay validación declarativa más allá de lo que el esquema expresa.**
`required` y `max_length` se aplican en el input. No hay reglas cruzadas entre
campos, ni validación con Zod. Si necesitas "la fecha B tiene que ser posterior a
la A", hoy no hay dónde ponerlo.

**Agregar un tipo de campo nuevo es tocar código compartido.** Un tipo `audio`
requiere: extender la unión en `core/models/template.ts`, añadir una rama en
`TemplateForm.tsx`, y contemplarlo en la subida de archivos. Son tres archivos
que usan todas las plantillas — el cambio más peligroso que puede hacer un dev de
plantillas. Hacerlo aditivo y temprano.

**Los archivos no viajan en el estado del formulario.** Los inputs de tipo
`image` no meten un `File` dentro de `configJson`; se acumulan aparte como
`FileUploadRef[]`, con la clave del campo y el archivo. El `configJson` que sale
del formulario tiene los campos de texto llenos y los de imagen todavía sin valor
definitivo.

Esa separación es la que hace posible el paso siguiente.

---

## 7. La subida de archivos y `setValueByPath`

Acá está la pieza más ingeniosa del módulo. En `Form/services.ts`:

```ts
const pageId = crypto.randomUUID();
const updatedConfig = { ...configJson };

for (const { key, file } of files) {
  const filesToProcess = Array.isArray(file) ? file : [file];
  const uploadedUrls: string[] = [];

  for (const singleFile of filesToProcess) {
    const uploadResult = await storageRepository.uploadImage({
      file: singleFile, pageId, fileId: crypto.randomUUID(),
    });
    uploadedUrls.push(uploadResult.getValue());
  }

  if (Array.isArray(file)) setValueByPath(updatedConfig, key, uploadedUrls);
  else                     setValueByPath(updatedConfig, key, uploadedUrls[0]);
}
```

El `pageId` se genera **en el cliente, antes de tocar la base**. Eso permite usarlo
como carpeta en el storage (`pages/<pageId>/<fileId>.jpg`) y como clave primaria
de la fila, en la misma operación. Es lo que hace que el enlace sea conocido antes
de que exista la página.

Y `setValueByPath` resuelve el problema de escribir en una estructura anidada
que todavía no existe:

```ts
const setValueByPath = (obj, path, value) => {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current)) {
      const nextKey = keys[i + 1];
      current[key] = /^\d+$/.test(nextKey) ? [] : {};   // ← el truco
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
};
```

Mira la línea marcada: **decide si crear un array o un objeto mirando si el
siguiente segmento de la ruta es numérico.** Así `"timelinePhotos.0"` crea un
array y `"header.background.url"` crea objetos anidados, sin que el servicio sepa
nada de la forma de datos de ninguna plantilla.

Es lo que permite que cada plantilla invente su propia estructura de `configJson`
sin tocar el motor.

> **Cuidado al extenderlo.** `setValueByPath` escribe en el objeto por referencia
> y no valida el path. Un `key` con un segmento como `__proto__` sería
> contaminación de prototipo. Hoy los `key` vienen del esquema, que escribimos
> nosotros, así que no es explotable — pero si alguna vez el path viniera del
> cliente, hay que sanearlo.

---

## 8. Persistencia

Con las URLs ya sustituidas, se calcula la expiración y se inserta:

```ts
const expiresAt = plan.price === 0
  ? null
  : new Date(Date.now() + PREVIEW_EXPIRATION_MINUTES * 60 * 1000);
```

La fila queda con `is_paid = false` y todo el contenido dentro de una columna
`jsonb`. **No hay esquema relacional para el contenido de una plantilla**, y es
la decisión correcta: cada plantilla tiene forma distinta y esa forma cambia cada
campaña.

El precio de esa flexibilidad es que Postgres no valida nada del contenido. Un
`configJson` con claves mal escritas se guarda igual de bien.

---

## 9. El ciclo de lectura

Cuando alguien abre `/lovepage/<uuid>`:

```
loader (servidor)
  ├── LovepageService.getLovepage(id)      → fila de pages
  ├── TemplateService.getTemplateById(...)  → fila de templates
  └── PlanService.getPlanById(...)          → fila de plans
        ↓
  { ...page, templateKey, price }
        ↓
  isPreview = !(isPaid || configJson === null || expiresAt === null)
        ↓
  <TemplateRenderer templateKey={...} templateData={configJson} isPreview={...} />
```

`getLovepage` es donde vive la expiración, y no funciona como uno esperaría:

```ts
if ((!lovepage.isPaid || lovepage.expiresAt === null) &&
    lovepage.expiresAt && lovepage.expiresAt < new Date())
  return { ...lovepage, configJson: null };
```

**La expiración se evalúa al leer, no hay ningún proceso que borre nada.** La fila
sigue intacta en la base; lo que se devuelve es una copia con el contenido en
`null`, y la ruta pinta "tu página ya no está disponible".

Dos consecuencias prácticas:

- **No hay tarea programada que mantener.** Una cosa menos que se puede caer.
- **Una página expirada revive al pagar.** `activate_love_page` pone `is_paid` en
  `true` y `expires_at` en `null`; la próxima lectura devuelve el contenido
  completo. Un cliente que pagó tarde no tiene que rehacer nada — díselo a quien
  atienda ventas.

---

## 10. Modos de fallo y dónde mirar

| Síntoma | Dónde está roto |
|---|---|
| "No se encontró la plantilla" | `template_key` de la base no coincide con `TEMPLATE_COMPONENTS` |
| El formulario sale vacío | La clave no está en `TEMPLATES_CATALOG` y `schema_json` está vacío |
| Un campo llega `undefined` | El `name` del esquema no coincide con lo que lee el componente |
| La imagen se ve rota | El bucket no es público, o `BUCKET_NAME` no coincide con el bucket real |
| Todo se ve pero no aparece en el catálogo | `is_visible = 0`, o falta la fila |
| "Ya no está disponible" con una página pagada | `is_paid` no se actualizó: revisa permisos de la función RPC |

---

## 11. Deuda técnica, priorizada

**Después del 21, no antes.**

1. **Carga diferida por plantilla.** Hoy las siete van en el bundle principal.
   `React.lazy` por entrada del registro reduciría el peso inicial bastante.
2. **Unificar los dos registros** en uno tipado, y borrar el campo `component` de
   `TemplateConfig`, que nadie usa.
3. **Tipar `TemplateData` por plantilla** con genéricos, para que el componente
   declare qué campos espera y el compilador cruce eso con el esquema. Hoy el
   desajuste entre esquema y componente solo se detecta probando.
4. **Validación con Zod derivada del esquema**, para tener reglas cruzadas entre
   campos.
5. **Un log cuando el respaldo se activa.** Hoy una clave mal escrita falla en
   silencio.
