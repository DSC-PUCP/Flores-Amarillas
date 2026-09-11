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

- `public/images/sunflower-bouquet.png`: original generado con la herramienta integrada `image_gen`.
- `public/images/sunflower-bouquet.webp`: versión de entrega optimizada con `cwebp`, con transparencia, aproximadamente 433 KB frente a 1.8 MB del original. Usada en hero y dedicatoria.
- `public/images/memory-together.jpg` y `memory-day.jpg`: fotos de ejemplo descargadas de las mismas URLs de Unsplash que ya utilizaba la ruta de previews. No son fotos de clientes ni testimonios.

Prompt utilizado con la herramienta integrada:

> Use case: ads-marketing. Asset type: decorative botanical hero asset for a yellow flowers day digital dedication website. Create a photorealistic editorial cutout of a lush small bouquet of five vivid golden yellow sunflowers and tiny yellow daisies with beautiful rich dark green leaves, stems tied loosely with a thin coral ribbon. Front three-quarter view, gently leaning toward right, natural organic asymmetrical arrangement, all flowers and stems visible within frame, bright natural sunlight, crisp tactile petals, sophisticated warm contemporary florist art direction. Isolated on a genuinely transparent background with alpha, no background rectangle, no paper wrapping, no vase, no people, no letters or text, no watermark. Portrait 3:4 composition with a little transparent breathing room on each edge. Rich saturated yellow and green, realistic not illustration.

## Verificación

- `bun run build`: compilación y prerender de producción.
- `bun --bun run test`: pruebas de edición sin recarga, público, reinicio, apertura de carta, actualización de datos, galería y copia de enlaces.
- Biome en archivos modificados y `git diff --check`.
- Respuestas HTTP y HTML del home y del ejemplo con destinatario personalizado; el ejemplo renderiza el sobre real.
- La comprobación TypeScript global encuentra errores en módulos existentes de viajes, Storybook, gráficos y otras plantillas fuera del rediseño.

No hubo navegador conectado para revisión visual en esta sesión. La consulta al Supabase configurado no resolvió DNS, por lo que no se verificaron los precios ni la disponibilidad del catálogo en vivo. Los estados de carga/error permiten reintentar sin mostrar datos de compra inventados. No se modificaron datos remotos ni se desplegó el sitio.
