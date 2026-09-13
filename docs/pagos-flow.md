# Pagos con Flow

Cada página de pago es una orden: `pages.id` se envía como `commerceOrder`.
El correo se pide una sola vez antes de abrir el checkout alojado de Flow y no
se guarda en Supabase. La respuesta del navegador no activa la página: los
endpoints de confirmación y retorno consultan `payment/getStatus` y solo
activan cuando Flow devuelve estado 2, moneda PEN, el mismo número de orden y
el monto guardado en `pages.flow_amount`.

## Configuración local

1. Instala Bun y arranca Docker Desktop. Ejecuta `bun install`.
2. En Windows, ejecuta `bun run local:up` (o
   `powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/local-up.ps1`).
   Este comando inicia el Supabase local mediante su CLI, aplica las migraciones
   y `supabase/seed.sql` en el primer arranque, guarda sus tres valores en
   `.env` (incluida `VITE_SERVER_URL=http://localhost:5173`) y arranca Vite.
   Si `.env` apuntaba a un proyecto remoto, conserva
   una copia en `.env.remote.local` (ignorada por Git). Docker Desktop debe
   estar funcionando antes; el primer arranque descarga varias imágenes.
3. Entra al [dashboard sandbox](https://dashboard.sandbox.flow.cl/login) con
   una cuenta de pruebas distinta de la productiva. Si aún no existe,
   [créala aquí](https://dashboard.sandbox.flow.cl/register). Busca
   **Integraciones → Integración por API** y obtén su API Key y Secret Key.
   Configura
   `FLOW_MODE=sandbox`, `FLOW_API_KEY`, `FLOW_SECRET_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY`. No uses el prefijo `VITE_` para secretos.
4. Deja `local:up` abierto y ejecuta `ngrok http 5173` en otra terminal.
   Copia la URL HTTPS que muestra ngrok a `SERVER_URL` en `.env`, sin barra
   final, por ejemplo `SERVER_URL=https://ejemplo.ngrok-free.app`. Reinicia
   Vite para cargar la variable y admitir ese hostname. Mantén ngrok y Vite
   activos mientras Flow procesa el pago. Si cambia la URL de ngrok, actualiza
   `SERVER_URL` y reinicia Vite antes de crear otra orden. `localhost` no sirve
   como callback externo de Flow.
   En sandbox, `urlConfirmation` usa ngrok para que llegue la notificación de
   Flow; `urlReturn` usa `VITE_SERVER_URL=http://localhost:5173` para que el
   navegador vuelva directamente a la app sin el aviso del plan gratuito de
   ngrok. Este retorno local funciona cuando pruebas en la misma computadora.

La CLI de Supabase ya administra los contenedores Docker locales; no necesitas
un `docker-compose.yml` adicional. `docker compose up` tampoco arranca Docker
Desktop si su motor no responde. Evita `supabase db reset` si quieres conservar
datos locales: ese comando recrea la base de datos.

Si Docker devuelve `unexpected commit digest` al descargar
`supabase/postgres`, abre **Docker Desktop → Troubleshoot → Restart Docker
Desktop** y vuelve a ejecutar `bun run local:up`. No uses **Clean up data**:
también borraría datos de otros proyectos Docker.
Antes del primer arranque deja al menos 10 GB libres en la unidad donde Docker
guarda sus imágenes; con menos de 4 GB, `local:up` se detiene antes de descargar.

Flow usa `POST /api/flow/confirm` para notificar y
`POST /api/flow/return` para devolver el navegador. Ambos reciben un
`token` de formulario, consultan Flow y verifican la orden antes de tocar
`is_paid`. `POST /api/payment/create` recibe `pageId` y `email`, calcula
el precio en el servidor y devuelve la URL de Flow.
El retorno de Flow redirige a `/payment/result/:pageId`. Esa pantalla consulta
`pages.is_paid`: si el pago está confirmado, muestra el enlace completo de la
página y permite copiarlo; si aún no se confirmó, espera y vuelve a consultar.
En sandbox local el enlace usa `localhost` y solo sirve en la misma computadora;
en producción usa el dominio público de la app.

Si `payment/create` devuelve HTTP 401 en sandbox, el formulario muestra el
mensaje de negocio devuelto por Flow. Comprueba que `FLOW_API_KEY` y
`FLOW_SECRET_KEY` pertenezcan a la misma cuenta de **sandbox** y reinicia Vite
después de editar `.env`. Un 401 aquí ocurre antes del checkout y del webhook.
`apiKey not found` suele indicar que se usó una clave de producción contra
`sandbox.flow.cl`; ambos entornos tienen credenciales separadas.

## Pruebas

Ejecuta `bun --bun run lint`, `bun --bun run test` y
`bun --bun run build`. En sandbox prueba pago correcto, pendiente,
rechazado, recarga antes de pagar y callbacks repetidos. Comprueba en
Supabase que solo el pago correcto pone `is_paid=true` y
`expires_at=null`. Prueba también una página gratuita y una vista previa
vencida. Los planes pagados necesitan un precio mayor a S/ 2 en Flow Perú.

## Paso a producción

Antes de aplicar la migración `0003_flow_pages.sql`, compara el esquema
remoto y el historial con `bunx supabase migration list --linked` y
`bunx supabase db push --dry-run`. Las migraciones `0001` y `0002` se
escribieron originalmente para ejecutarse en el SQL Editor y pueden no estar
registradas en el historial remoto; reconcilia ese historial antes del
`db push`. Nunca ejecutes `db reset --linked` en producción ni
`db push --include-seed`.

Configura `FLOW_MODE=production`, las credenciales productivas, la clave
`service_role` y
`VITE_SERVER_URL=https://flores-amarillas.a20212540.workers.dev` en el despliegue.
En este modo Flow envía la confirmación y el retorno al servidor de la app
desplegada; `SERVER_URL` de ngrok se ignora. La ruta del servidor verifica el
token con Flow y actualiza Supabase por HTTPS con la clave privada. No se
necesita un túnel ni una conexión privada entre el frontend y Supabase.
Comprueba
que los precios productivos de `plans` son correctos antes de habilitar
compras. Una orden Flow queda asociada a una página; al volver a pulsar
«Comprar» se reabre el mismo checkout.

Este diseño conserva una sola orden por página. Si Flow cierra esa orden y no
permite otro intento dentro del mismo checkout, habrá que crear una nueva
página o ampliar el modelo para guardar varios intentos. Compruébalo en
sandbox antes de pasar a producción.
