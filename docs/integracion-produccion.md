# Entrega para integrar pagos con Flow en producción

El archivo `.env.example` se entrega en este mismo commit como referencia de las variables necesarias. Sus valores son ejemplos: el integrador debe configurar los valores reales en el entorno de despliegue. El `.env` local no se publica automáticamente.

## Variables de entorno

| Variable | Qué configurar |
| --- | --- |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase productivo. |
| `VITE_SUPABASE_KEY` | Clave pública (`anon`/`publishable`) del mismo proyecto. |
| `VITE_SERVER_URL` | URL HTTPS pública de la aplicación, por ejemplo `https://flores-amarillas.a20212540.workers.dev`, sin barra final. Debe estar definida antes de compilar. |
| `FLOW_MODE` | `production`; selecciona la API productiva de Flow y usa `VITE_SERVER_URL` para los callbacks. |
| `FLOW_API_KEY` y `FLOW_SECRET_KEY` | Par de claves productivas de la misma cuenta de Flow. Configurarlas como secretos del servidor/Worker. |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada del proyecto Supabase productivo. Configurarla como secreto del servidor/Worker. |

`SERVER_URL` no se usa cuando `FLOW_MODE=production`. Si cambia el dominio público, hay que actualizar `VITE_SERVER_URL` y volver a compilar y desplegar. Ninguna clave privada debe llevar el prefijo `VITE_`.

## Flujo de pago

1. El comprador ingresa su correo y pulsa **Continuar a Flow**.
2. El servidor consulta el precio del plan en Supabase y crea la orden mediante la API de Flow, usando `FLOW_API_KEY` y `FLOW_SECRET_KEY`. El comprador es redirigido al checkout de Flow.
3. Flow notifica el resultado a `/api/flow/confirm` en el dominio de `VITE_SERVER_URL`. El servidor consulta el estado real del pago en Flow y verifica la orden, el monto y la moneda.
4. Si el pago está confirmado, el servidor usa `SUPABASE_SERVICE_ROLE_KEY` para actualizar `pages.is_paid` en el proyecto indicado por `VITE_SUPABASE_URL`.
5. Flow devuelve al comprador a `/api/flow/return` en el mismo dominio. La pantalla de resultado muestra el enlace de su página cuando el pago está confirmado.

Antes de habilitar compras, el integrador debe asegurar que el Supabase productivo tenga aplicada la migración `supabase/migrations/0003_flow_pages.sql` y que los precios de los planes sean correctos.
