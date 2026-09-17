# Pagos por Yape

El cobro se realiza por Yape y **la verificación es manual**.

## Cómo funciona

1. El cliente crea su regalo y llega a `/lovepage/{id}` en vista previa.
2. Pulsa **Comprar plan** y se abre el formulario: QR, monto exacto, nombre,
   correo y captura del pago.
3. Al enviar, la captura sube al bucket `flores-amarillas`
   (`comprobantes/{pageId}/…`) y queda una fila en la tabla `pagos` con estado
   `pendiente`.
4. Te llega la notificación de Yape al celular. Comparas y activas.
5. La página del cliente se recarga sola cada 10 segundos: en cuanto activas,
   se desbloquea sin que él haga nada.

La web **no puede** activar nada por su cuenta. Marcar `is_paid` es una
operación exclusiva del servidor con `service_role`.

## Antes de nada: aplicar las migraciones

Aplica las migraciones pendientes de `supabase/migrations` en orden. La `0006`
crea los pagos Yape y la `0007` limpia los campos heredados de Flow. Hasta que
estén aplicadas, el formulario o el panel administrativo pueden fallar.

## El día a día

Ver lo que falta por revisar:

```sql
select * from public.pagos_pendientes;
```

Te da: `pago_id`, cuándo llegó, nombre, correo, el enlace del comprobante, el
enlace del regalo y el precio que le tocaba, para cuadrarlo con el Yape.

Cuando el monto y el nombre coinciden con tu notificación, activa:

```sql
select * from public.activar_pago('pega-aqui-el-pago_id');
```

Eso hace las dos cosas a la vez: abre la página (`is_paid = true`, sin fecha de
expiración) y marca el pago como `activado`, para que no vuelva a salir en la
lista. Te devuelve el enlace del cliente por si quieres comprobarlo.

Si un comprobante es falso o no cuadra:

```sql
update public.pagos set estado = 'rechazado' where id = 'el-pago_id';
```

## Cosas que conviene saber

- **La vista previa dura 45 minutos.** Si alguien paga y no lo verificas a
  tiempo, verá «Tu vista previa terminó». No se pierde nada: al activar, su
  regalo vuelve entero. Si esto molesta, se cambia el intervalo en el trigger
  `set_page_insert_defaults` (migración `0003_page_defaults.sql`).
- **Los comprobantes quedan en un bucket público.** La ruta lleva un UUID, así
  que nadie la adivina, pero quien tenga el enlace ve la imagen. Si quieres que
  sea privado de verdad, hay que crear un bucket aparte con RLS y firmar las
  URLs al mirarlas.
- **Nadie recibe correos.** Se guarda el correo del cliente para poder
  escribirle, pero el envío no está montado: si quieres avisarle, hoy es a
  mano.
- **Para cambiar el QR**, sube la imagen nueva al bucket y pega su URL en
  `QR_YAPE_URL`, en `src/modules/payments/yape.ts`.
