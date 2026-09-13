# Flores-Amarillas
Venta de detalles digitales en plantillas sobre el día de las flores amarillas. Basado en el proyecto de San Valentín 

Integración de pagos: [docs/pagos-flow.md](docs/pagos-flow.md).

Desarrollo local en Windows (con Docker Desktop iniciado): `bun run local:up`.
Arranca Supabase, aplica migraciones y seed en el primer inicio, configura las
claves locales en `.env` e inicia la web. Si Bun no está en el PATH, usa
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/local-up.ps1`.
