# Promociones por código

Quien tiene un código lo escribe al final del formulario y su regalo sale
gratis o a un precio fijo, según el código. Cada uno reparte un número fijo de
cupos y deja de servir cuando se acaban.

| Código        | Precio | Cupos |
| ------------- | -----: | ----: |
| `Guardian219` | S/ 3   | 25    |
| `Letras219`   | gratis | 25    |

## Cómo funciona

1. La persona llena su regalo y pulsa **Revisar regalo completo**.
2. En la tarjeta **¿Todo listo?** hay dos botones: el verde de siempre (crea la
   vista previa y le cobra el precio del plan) y, debajo de la línea, **¿Tienes
   un código?** con el campo y el botón amarillo **Generar mi regalo con
   código**.
3. Al pulsar el amarillo se revisa el código, se sube todo, se crea la página y
   se gasta un cupo. A partir de ahí depende del código:
   - **Gratis** (precio 0): la página nace con `is_paid = true` y sin fecha de
     expiración, y se va directo a `/lovepage/{id}`, sin marca de agua.
   - **Con precio**: la página se queda como vista previa igual que siempre y
     se abre el diálogo de Yape con el monto de la promoción —no el del plan—.
     La persona paga, sube su captura y ve el mismo mensaje de guardar el
     enlace y esperar. Al cerrarlo llega a su regalo.
4. El pago con descuento se guarda en la misma tabla `pagos` y se activa igual
   que cualquier otro, a mano.

Las mayúsculas no importan: `letras219` y `LETRAS219` son el mismo código.

En la **plantilla gratuita no se pregunta por el código**: ahí no hay nada que
descontar y solo gastaría un cupo.

La web **no puede** activar nada por su cuenta. El navegador nunca escribe
`is_paid`: llama a `canjear_promo`, una función `security definer` que revisa el
código y descuenta el cupo en la misma transacción. El mismo candado que puso
`0001` y respetan `0003` y `0006`.

La tabla `promos` tampoco se puede leer desde el navegador. Si se pudiera,
cualquiera abriría el inspector y se copiaría los códigos.

## Antes de nada: aplicar las migraciones

Pega en el **SQL Editor** de Supabase, en orden y una sola vez cada uno:

1. `supabase/migrations/0007_promos.sql`
2. `supabase/migrations/0008_promos_descuento.sql`

Hasta que lo hagas, el campo se ve pero cualquier código falla con
`Could not find the function public.revisar_promo`.

## El día a día

Ver cómo va la promoción:

```sql
select * from public.promos_uso;
```

Da los cupos que quedan (`restantes`), los que ya se usaron (`canjeadas`,
contados sobre las páginas que salieron de cada código) y a qué precio va cada
uno.

Los pagos pendientes ya traen el monto correcto: la columna `precio` de
`public.pagos_pendientes` es el de la promo cuando la página salió de un código,
y `promo` dice cuál fue. Sin eso te pediría cuadrar S/ 12 con un Yape de S/ 3.

Cambiar el precio o el tope de un código:

```sql
update public.promos set precio_descuento = 5 where codigo = 'Guardian219';
update public.promos set cantidad = 40     where codigo = 'Guardian219';
```

Cerrar una promoción antes de tiempo — con 0 cupos el código deja de servir, y
las páginas ya regaladas no se tocan:

```sql
update public.promos set cantidad = 0 where codigo = 'Letras219';
```

Crear otra promoción (precio 0 = regalo):

```sql
insert into public.promos (nombre, codigo, cantidad, precio_descuento)
values ('Nombre de la promo', 'Codigo219', 25, 3);
```

Ver qué páginas salieron de un código:

```sql
select pa.id, pr.codigo, pa.is_paid
from public.pages pa
join public.promos pr on pr.id = pa.promo_id;
```

## Lo que conviene saber

- **El código es la credencial.** Quien lo tenga puede gastar cupos, y si se
  filtra (una captura en un grupo, por ejemplo) se gasta la promoción entre
  desconocidos. El tope de daño es `cantidad`.
- **Una persona puede usarlo varias veces.** No hay noción de usuario en el
  proyecto, así que nada impide que alguien haga 25 regalos con el mismo
  código. Si hace falta limitarlo, hay que pedir algo que identifique (correo)
  y guardarlo junto al canje.
- **El cupo se gasta al canjear, no al pagar.** Con un código de descuento, si
  la persona abandona sin pagar, el cupo ya se fue. Se devuelve a mano:
  `update public.promos set cantidad = cantidad + 1 where codigo = '…';`
- **Si vuelve al enlace antes de que actives su pago, la barra de arriba le
  pide el precio del plan, no el de la promo.** La página no lleva escrito su
  monto y `promos` no se puede leer desde el navegador. El monto que vale es el
  de `pagos_pendientes`, que sí es el de la promo. Se arregla guardando el
  precio en la propia página, pero eso es una columna más en `pages`.
- **No se reparten cupos de más.** `canjear_promo` bloquea la fila del código
  mientras descuenta, así que dos canjes simultáneos hacen cola en vez de leer
  los dos la misma cantidad.
- **Pulsar el botón dos veces no gasta dos cupos** en la misma página: el canje
  solo cuenta si esa página no tenía código todavía.
- **Los cupos no vuelven** si se borra una página regalada.
