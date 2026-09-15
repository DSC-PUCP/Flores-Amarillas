# Plantilla premium de Flores Amarillas

La plantilla real que utiliza el formulario es `plantilla_giano_feat_leo`.
Se mantiene esa clave y la compatibilidad con las dedicatorias existentes.

## Situación encontrada

- El álbum admitía seis fotos, pero una selección nueva reemplazaba la anterior.
- Una sola imagen en un campo múltiple se enviaba como `File`, se guardaba como URL individual y el lector del álbum la ignoraba.
- El límite anunciado por el formulario no se aplicaba al seleccionar archivos.
- La foto principal y las miniaturas se recortaban con `object-cover`.
- La imagen del vale era una sola foto circular de 96 px.
- El fondo oscuro y los grandes resplandores de la música dominaban todas las escenas. El desplazamiento obligatorio por pantallas dificultaba recorrer contenido largo.

## Diseño y comportamiento actuales

- Flores ilustradas con pétalos redondeados, girasoles en distintos tamaños, margaritas, retama, hojas y lazo. Sin fotos florales realistas en la premium.
- Nueva colección kawaii inspirada en la referencia: conejito celeste, osito, gatito gris, perrito, panda, zorro y pollito. Cabezas grandes, cuerpos pequeños, ojos ovalados negros, mejillas rosas y colores pastel planos con contorno oscuro. Se eliminaron los dibujos anteriores, incluida la variante de ojos azules.
- Personajes y ramo hechos en SVG sin fotos, textura de pelaje ni sombreado 3D. Cabeza, orejas, parpadeo, respiración, patitas, pétalos y cola tienen animaciones independientes. La mirada sigue el puntero y tocar el personaje abre el regalo. Se respeta movimiento reducido.
- El campo `mascot` guarda la elección. Los identificadores antiguos compatibles usan las ilustraciones nuevas; `white-rabbit` pasa al conejito kawaii. El formulario conserva la elección al cambiar de paso y la dedicatoria publicada no muestra un selector.
- Selector con miniaturas y radios accesibles: cuadrícula en el editor, fila deslizable en la portada de la prueba independiente.
- La ramita de la carta tiene un área SVG con margen superior para mostrar el girasol completo y se sitúa dentro del papel, con espacio reservado junto al saludo. La enredadera de fondo de esa sección también queda dentro del escenario.
- Composiciones distintas por sección: pradera y guirnalda en la presentación, maceta de tulipanes en el álbum, enredadera y sello floral en la carta, abeja y pradera en las razones, cesta de picnic en el vale y corona floral en el cierre.
- Fondos con nubes móviles y degradados suaves en crema, salvia y melocotón; pétalos, tallos, alas y ramas tienen movimientos independientes. Los colores de la canción se incorporan de forma sutil a las escenas claras. El centro permanece despejado y las animaciones decorativas se pausan en secciones inactivas. Se respeta movimiento reducido.
- Títulos en DM Serif Display, párrafos en Manrope y firmas en serif cursiva.
- Papel crema, verde y amarillo fijo para el álbum, la carta, las razones y el vale. El fondo oscuro y los degradados de la canción se limitan a la sección del disco. La portada, la presentación y el cierre también son claros. El reproductor conserva su color.
- Un solo álbum incluye la foto principal y hasta 12 fotos adicionales. Se ven completas, con botones, miniaturas, gestos laterales y ampliación. No avanza automáticamente.
- El vale admite hasta seis fotos grandes en su propio carrusel, disponibles después de raspar o usar «Descubrir sin raspar». También se muestra la antigua `couponImage` si existe.
- El formulario permite añadir archivos en distintas selecciones, eliminar y reordenar fotos; aplica el máximo y libera las URLs temporales de previsualización.
- Recorrido por scroll con ajuste a cada pantalla. Un escenario fijo muestra solo una sección con entrada suave; las demás quedan ocultas e inactivas y conservan su estado. Las cartas y álbumes largos se desplazan dentro de esa sección. El foco de la carta desplaza su contenedor, sin saltar el recorrido. El cierre muestra la frase y firma, sin crédito de marca ni botón de reinicio. Hay navegación con PageUp, PageDown, flechas verticales, Home y End. Con movimiento reducido, los cambios son inmediatos.
- Los elementos florales comparten componentes SVG parametrizados; cada composición combina especies, posiciones y recipientes diferentes. No se reutiliza el ramo de portada como decoración rotada.

## Vista previa y verificación

El catálogo ofrece «Personalizar este diseño» y «Ver ejemplo». La premium tiene una miniatura propia con el animalito y ramo kawaii animados, guirnalda, carta, foto y vinilo; reutiliza los componentes reales y funciona aunque falte o falle `previewImageUrl`.

La página principal muestra una demostración con ejemplos preparados para pareja, amistad y familia. Se puede alternar Gratuita/Premium, reiniciar el ejemplo o abrirlo en pantalla completa; no repite los campos de personalización ni el selector de animalitos. «Crear este regalo» lleva al formulario de la plantilla elegida cuando está disponible en el catálogo. La prueba independiente conserva su selector de portada.

Los formularios siguen el orden del contenido. El básico pide portada (nombres), carta, una foto opcional y fecha opcional del contador; no pide `timelinePhotos` ni muestra un carrusel en su demo. Las dedicatorias antiguas siguen pudiendo leer sus fotos guardadas. La premium agrupa portada, presentación, canción, álbum, carta, razones, vale y despedida. Fecha y frase final están en sus propias secciones. Cada paso declara su sección de vista previa y explica dónde aparece su contenido. La navegación permite ir a una sección sin perder datos; la revisión lleva al primer paso con un campo obligatorio sin completar.

`/template/$id` concentra la personalización. En computadora muestra formulario y vista previa en dos columnas; en celular permite alternar «Editar» y «Vista previa», conservando datos, paso e iframe. Textos, animalito, fotos locales reordenadas y canciones se envían al mismo iframe mediante mensajes del mismo origen, validados con Zod. Las URLs locales de las fotos se mantienen al escribir y se liberan al quitarlas o salir.

El reproductor de YouTube se inicializa cuando aparece su contenedor, incluso si el editor empezó sin canciones. Quitar la última canción libera el reproductor; elegir otra lo vuelve a crear. Los eventos de instancias eliminadas se ignoran y cambiar textos no recarga el fragmento. El iframe del editor permite audio, y el disco indica carga o errores reales de YouTube.

La premium abre la sección del campo o paso que se edita. La carta se muestra abierta durante la edición; las secciones opcionales vacías explican qué añadir. La vista gratuita también muestra su carta y recuerdos durante la edición. «Revisar regalo completo» valida los campos obligatorios y vuelve a la portada para recorrer la experiencia real, sin ayudas ni carta forzada. La revisión permite seguir editando o «Crear mi regalo», que utiliza la creación existente. No se implementó la pasarela de pago.


Abrir `/preview?template=premium`. La vista gratuita de `/preview` sigue disponible. La demo premium incluye un fragmento de «Yellow» de Coldplay como canción de ejemplo, además del álbum, carta, razones y vale.
Las imágenes de personas en este ejemplo son fotos de demostración existentes.

Comprobaciones: build de producción, suite Vitest completa (109 pruebas), Biome en los archivos modificados, `git diff --check` y respuesta HTML de la vista premium.
Vitest se ejecutó con `bun run test`: `bun --bun run test` falló al importar Zod en el runtime de Bun.
El chequeo global de TypeScript sigue encontrando errores previos de rutas, Storybook, gráficos y otras plantillas; no reporta errores en los archivos de esta mejora.
Se revisaron los siete animalitos kawaii, la ramita de la carta y las composiciones florales renderizando sus SVG; no hubo navegador disponible para verificar el diseño completo en escritorio o móvil.
No se desplegó el sitio ni se crearon dedicatorias en Supabase durante la verificación.
