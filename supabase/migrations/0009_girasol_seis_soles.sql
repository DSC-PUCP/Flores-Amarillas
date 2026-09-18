-- El plan Girasol pasa de S/ 3 a S/ 6.
--
-- Solo es el precio del plan. Nada mas depende de este numero: el cobro lo lee
-- de `plans` cada vez que se abre una pagina sin pagar, asi que las paginas que
-- ya estan creadas y sin pagar tambien empiezan a pedir 6.
--
-- Las que ya estan pagadas no se tocan: `is_paid` no depende del precio, y el
-- monto que se cobro de verdad vive en `pagos`.
--
-- Se busca por nombre y no por id: el id 2 es un detalle de como se cargaron
-- los datos en 0002, y si un dia se recargan el nombre sigue siendo el mismo.

-- Ojo: la descripcion de este plan dice "Antes s/ 10" y no se toca aqui,
-- porque el texto de venta no es cosa de una migracion. Con el precio en 6 el
-- descuento que anuncia queda mas flojo; si hay que cambiarlo, es un update de
-- `description` a lo que digan los de marketing.
update public.plans
   set price = 6.00
 where name = 'Girasol';
