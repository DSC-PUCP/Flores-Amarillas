$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

$systemDisk = [System.IO.DriveInfo]::new($env:SystemDrive)
$freeGb = [math]::Round($systemDisk.AvailableFreeSpace / 1GB, 1)
if ($systemDisk.AvailableFreeSpace -lt 4GB) {
  throw "Solo hay $freeGb GB libres en $env:SystemDrive. Libera espacio antes de descargar las imágenes de Supabase."
}
if ($systemDisk.AvailableFreeSpace -lt 10GB) {
  Write-Warning "Quedan $freeGb GB libres en $env:SystemDrive; Supabase puede necesitar más espacio durante la primera descarga."
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
  throw 'Falta Docker Desktop. Instálalo y arranca su motor antes de continuar.'
}
$dockerReady = $false
$dockerError = ''
for ($attempt = 1; $attempt -le 4; $attempt++) {
  $ErrorActionPreference = 'Continue'
  $dockerResult = & $docker.Source info --format '{{.ServerVersion}}' 2>&1
  $dockerExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($dockerExitCode -eq 0) {
    $dockerReady = $true
    break
  }
  $dockerError = ($dockerResult | Out-String).Trim()
  if ($attempt -lt 4) {
    Write-Host 'Esperando a que Docker Desktop termine de iniciar...'
    Start-Sleep -Seconds 5
  }
}
if (-not $dockerReady) {
  if (-not $dockerError) { $dockerError = 'El motor no respondió.' }
  throw "Docker Desktop no está disponible: $dockerError"
}

$localCli = Join-Path $projectRoot 'node_modules\.bin\supabase.exe'
$legacyCli = Join-Path $projectRoot 'node_modules\.bin\supabase.cmd'
if (Test-Path $localCli) {
  $supabase = $localCli
} elseif (Test-Path $legacyCli) {
  $supabase = $legacyCli
} else {
  $command = Get-Command supabase -ErrorAction SilentlyContinue
  if (-not $command) {
    throw 'Falta Supabase CLI. Ejecuta bun install primero.'
  }
  $supabase = $command.Source
}

Write-Host 'Iniciando Supabase local (la primera descarga puede tardar varios minutos)...'
$startLog = Join-Path ([System.IO.Path]::GetTempPath()) ('flores-supabase-' + [guid]::NewGuid().ToString('N') + '.log')
try {
  $ErrorActionPreference = 'Continue'
  & $supabase start --yes --output json *> $startLog
  $startExitCode = $LASTEXITCODE
  $ErrorActionPreference = 'Stop'
  if ($startExitCode -ne 0) {
    $details = Get-Content $startLog -Tail 35 | Where-Object {
      $_ -match '(?i)(failed|error|denied|unavailable|timeout|refused)' -and
      $_ -notmatch '(?i)(Try rerunning|--debug)' -and
      $_ -notmatch '(?i)(secret|token|key|eyJ)'
    } | Select-Object -Last 1
    if (-not $details) { $details = 'Ejecuta supabase start para ver el detalle.' }
    throw "No se pudo iniciar Supabase: $details"
  }
} finally {
  $ErrorActionPreference = 'Stop'
  Remove-Item -LiteralPath $startLog -Force -ErrorAction SilentlyContinue
}

Write-Host 'Aplicando migraciones pendientes a Supabase local...'
$ErrorActionPreference = 'Continue'
$migrationResult = & $supabase migration up --local 2>&1
$migrationExitCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
if ($migrationExitCode -ne 0) {
  $migrationDetails = ($migrationResult | Select-Object -Last 15 | Out-String).Trim()
  if (-not $migrationDetails) { $migrationDetails = 'No se recibió información adicional.' }
  throw "No se pudieron aplicar las migraciones locales: $migrationDetails"
}

$ErrorActionPreference = 'Continue'
$statusJson = & $supabase status --output json 2>$null
$statusExitCode = $LASTEXITCODE
$ErrorActionPreference = 'Stop'
if ($statusExitCode -ne 0) {
  throw 'Supabase arrancó, pero no se pudo consultar su estado.'
}
$status = ($statusJson -join "`n") | ConvertFrom-Json
$apiUrl = [string]$status.API_URL
$anonKey = [string]$status.ANON_KEY
if (-not $anonKey) { $anonKey = [string]$status.PUBLISHABLE_KEY }

if ($apiUrl -notmatch '^http://(127\.0\.0\.1|localhost):\d+$' -or -not $anonKey) {
  throw 'Faltan la URL o la publishable key local en supabase status; .env no se modificó.'
}

$envPath = Join-Path $projectRoot '.env'
if (-not (Test-Path $envPath)) {
  Copy-Item (Join-Path $projectRoot '.env.example') $envPath
}
$encoding = [System.Text.UTF8Encoding]::new($false)
$contents = [System.IO.File]::ReadAllText($envPath)
if ($contents -match '(?m)^VITE_SUPABASE_URL=https://') {
  $backupPath = Join-Path $projectRoot '.env.remote.local'
  if (-not (Test-Path $backupPath)) {
    Copy-Item $envPath $backupPath
    Write-Host 'Configuración remota anterior guardada en .env.remote.local (ignorado por Git).'
  }
}

$newline = if ($contents.Contains("`r`n")) { "`r`n" } else { "`n" }
$values = [ordered]@{
  VITE_SUPABASE_URL = $apiUrl
  VITE_SUPABASE_PUBLISHABLE_KEY = $anonKey
}
foreach ($name in $values.Keys) {
  $line = $name + '=' + $values[$name]
  $pattern = '(?m)^' + [regex]::Escape($name) + '=.*$'
  if ([regex]::IsMatch($contents, $pattern)) {
    $contents = [regex]::Replace($contents, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($match) $line })
  } else {
    $contents = $contents.TrimEnd("`r", "`n") + $newline + $line + $newline
  }
}
[System.IO.File]::WriteAllText($envPath, $contents, $encoding)

Write-Host "Supabase local listo: $apiUrl (Studio: http://127.0.0.1:54323)"
Write-Host 'Claves locales guardadas en .env sin mostrarlas.'

$existingListener = Get-NetTCPConnection -LocalPort 5173 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existingListener) {
  $ownerId = $existingListener.OwningProcess
  throw "El puerto 5173 ya está ocupado por el proceso $ownerId. Revisa http://localhost:5173/ y cierra esa instancia antes de volver a ejecutar local:up."
}

$bun = Get-Command bun -ErrorAction SilentlyContinue
if ($bun) {
  & $bun.Source --bun run dev
} else {
  $vite = Join-Path $projectRoot 'node_modules\.bin\vite.cmd'
  if (Test-Path $vite) {
    Write-Host 'Bun no está en PATH; iniciando Vite desde node_modules.'
    & $vite dev --host --strictPort
  } else {
    Write-Host 'Bun no está disponible en esta terminal. Inicia la app con bun --bun run dev.'
  }
}
