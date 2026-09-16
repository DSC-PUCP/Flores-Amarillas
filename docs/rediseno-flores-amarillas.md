# Rediseño de Flores Amarillas

## Problema y propuesta

La portada anterior mostraba maquetas pequeñas, plantillas conceptuales que no existían en el catálogo y beneficios difíciles de relacionar con el producto. La paleta tenía poco contraste cromático y las secciones repetían promesas sin dejar experimentar el regalo.

La nueva página presenta el regalo, permite probarlo, explica qué contiene, muestra el proceso y después presenta planes y preguntas frecuentes. El amarillo girasol, verde profundo y coral distinguen los momentos del recorrido. Se mantiene React, TanStack Start, Tailwind y Supabase.

## Cambios principales

- Hero con ramo fotográfico, carta que invita a explorar y dos acciones claras.
- Ejemplo interactivo con nombres y mensajes editables. Los cambios llegan al iframe mediante mensajes del mismo origen, sin cerrar el sobre ni recargarlo. El destinatario de los mensajes y su estructura se validan.
- La demo y la plantilla gratuita real comparten `FlowerDedication`. El formulario y los datos existentes se conservan; cambia también la presentación de las dedicatorias que usan `plantilla_gratuita`.
- Sobre accesible por teclado, carta, galería, contador y estados de copia/compartir. El modo de ejemplo no publica ni comparte una dedicatoria real.
- Navegación móvil, indicadores de sección y progreso, acceso al contenido por teclado y respeto de movimiento reducido.
- Planes tomados del servicio real. Se elimina el fallback de precios ficticios de la portada; `/plansPreview` conserva sus datos explícitos de revisión.
- Condiciones de activación manual y vista previa de pago explicadas antes de comprar. Sin testimonios, contadores de clientes ni garantías inventadas.

## Recursos gráficos

Ya no viven en `public/images/` sino en Supabase Storage, bajo `publicas/`, y se
consumen desde `src/lib/imagenes.ts`. El motivo está explicado ahí: en producción
el sitio cuelga de un subpath y las rutas absolutas del tipo `/images/x.webp`
apuntaban al raíz del dominio.

- `sunflower-bouquet.webp`: ramo de girasoles, original generado con la herramienta integrada `image_gen` y entregado en WebP con transparencia (267 KB frente a 1.8 MB del PNG). Se usa en hero, dedicatoria y como `og:image`.
- `memory-together.webp` y `memory-day.webp`: fotos de ejemplo descargadas de las mismas URLs de Unsplash que ya utilizaba la ruta de previews. No son fotos de clientes ni testimonios.

Prompt utilizado con la herramienta integrada:

> Use case: ads-marketing. Asset type: decorative botanical hero asset for a yellow flowers day digital dedication website. Create a photorealistic editorial cutout of a lush small bouquet of five vivid golden yellow sunflowers and tiny yellow daisies with beautiful rich dark green leaves, stems tied loosely with a thin coral ribbon. Front three-quarter view, gently leaning toward right, natural organic asymmetrical arrangement, all flowers and stems visible within frame, bright natural sunlight, crisp tactile petals, sophisticated warm contemporary florist art direction. Isolated on a genuinely transparent background with alpha, no background rectangle, no paper wrapping, no vase, no people, no letters or text, no watermark. Portrait 3:4 composition with a little transparent breathing room on each edge. Rich saturated yellow and green, realistic not illustration.

## Verificación

- `bun run build`: compilación y prerender de producción.
- `bun --bun run test`: pruebas de edición sin recarga, público, reinicio, apertura de carta, actualización de datos, galería y copia de enlaces.
- Biome en archivos modificados y `git diff --check`.
- Respuestas HTTP y HTML del home y del ejemplo con destinatario personalizado; el ejemplo renderiza el sobre real.
- La comprobación TypeScript global encuentra errores en módulos existentes de viajes, Storybook, gráficos y otras plantillas fuera del rediseño.

No hubo navegador conectado para revisión visual en esta sesión. La consulta al Supabase configurado no resolvió DNS, por lo que no se verificaron los precios ni la disponibilidad del catálogo en vivo. Los estados de carga/error permiten reintentar sin mostrar datos de compra inventados. No se modificaron datos remotos ni se desplegó el sitio.

## Capa de movimiento (rama `angel-mp`)

Sobre el rediseño traspasado se añadió una capa de animación e interacción en
`src/modules/landing/motion.css`, que se carga después de `bloom.css` porque
aquel archivo cierra con un `animation: none` general para movimiento
reducido y cualquier animación nueva tiene que declararse después.

- **Revelado al hacer scroll.** Un único `IntersectionObserver`
  (`hooks/useScrollReveal.ts`) atiende todos los `[data-reveal]` de la página.
  Primero revela lo que ya está en pantalla y recién entonces marca
  `data-motion="on"` en la raíz, que es lo que activa el estado oculto en CSS:
  así el HTML pre-renderizado se ve completo aunque el JS no llegue y al
  hidratar no parpadea nada. Sin `IntersectionObserver` o con movimiento
  reducido, revela todo de una vez.
- **Parallax del hero** (`hooks/useParallax.ts`). Escribe `--px`, `--py` y
  `--scroll` como variables CSS desde `requestAnimationFrame`, sin estado de
  React. Cada capa del arte —ramo, sticker, carta, nota de entrega, órbita—
  se mueve a distinta profundidad. Inactivo en punteros gruesos.
- **Ambiente** (`art/Ambient.tsx`). Pétalos que caen, polen que sube y
  mariposas que cruzan, según los elementos propuestos en
  `creatividad/conceptos/elementos-flores-amarillas.md`. Valores escritos a
  mano, no sorteados, para que el marcado del servidor y el del cliente
  coincidan.
- **Navegación.** La barra se encoge y gana sombra al bajar, el subrayado de
  la sección activa se desliza, el menú móvil se despliega y repliega (queda
  en el DOM para poder animar el cierre) y aparece un botón de volver arriba.
- **Ejemplo interactivo.** Las ideas de dedicatoria se recorren con las
  flechas con un solo punto de tabulación, un indicador dice si los cambios
  ya llegaron al ejemplo, el contador avisa al acercarse al límite y el
  iframe aparece con una transición cuando termina de cargar.
- **Resto de secciones.** Entrada escalonada de tarjetas y pasos, la línea de
  cada paso se dibuja al entrar en pantalla, los planes escriben sus
  características de arriba abajo y la cinta del hero es una marquesina
  continua que se detiene al pasar el puntero.

Todo se apaga con `prefers-reduced-motion: reduce`, dejando el contenido
visible y nunca oculto.

### Verificación de esta rama

- `npm run build`: compilación y prerender de 9 páginas.
- `npm test`: 13 pruebas en verde, incluidas las del revelado (sin
  `IntersectionObserver`, con movimiento reducido y durante la hidratación),
  la navegación por teclado de las ideas, el indicador de sincronización y el
  contador de caracteres.
- `biome check` limpio en `src/modules/landing` y `src/routes`.
- Revisión del HTML servido en `/home`, `/preview` y `/template`.

No se revisó en un navegador real en esta sesión ni se verificaron precios
contra Supabase: el rediseño no cambia el esquema, las consultas ni los datos.
