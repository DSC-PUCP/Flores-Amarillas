/**
 * Borra del Storage las fotos de las paginas que ya no sirven.
 *
 *   bun scripts/limpiar-storage.ts              (solo mira y cuenta)
 *   bun scripts/limpiar-storage.ts --aplicar    (borra de verdad)
 *
 * Por defecto NO borra nada: imprime lo que haria. Es un script que toca
 * produccion y no hay papelera de reciclaje.
 *
 * ---------------------------------------------------------------------------
 * Que se borra y que no
 *
 * En el bucket, cada regalo guarda sus fotos en `pages/<id>/`. Ese `<id>` es
 * el de la fila en `public.pages`, asi que se puede cruzar una cosa con otra.
 *
 * Se borra la carpeta de una pagina cuando:
 *   - expiro hace mas de `--gracia-horas` (24 por defecto), y
 *   - no esta pagada, y
 *   - no tiene ningun aviso de pago en la tabla `pagos`.
 *
 * Tambien se borran las carpetas huerfanas —sin fila en `pages`—, pero solo si
 * todos sus archivos son mas viejos que la gracia. Esto ultimo importa mas de
 * lo que parece: al crear un regalo las fotos se suben ANTES de insertar la
 * fila, asi que una subida en curso es indistinguible de una huerfana. Sin esa
 * espera, una limpieza a media tarde podria borrarle las fotos a alguien que
 * esta llenando el formulario en ese momento.
 *
 * Nunca se toca:
 *   - `comprobantes/`, que son las capturas de Yape. Son la prueba de un pago
 *     y no cuestan casi nada; borrarlas solo puede salir mal.
 *   - una pagina pagada, ni una sin fecha de expiracion (las gratuitas).
 *   - una pagina con un aviso de pago pendiente: puede que el pago este por
 *     confirmarse, y al activarla tiene que verse completa.
 */

import { createClient } from '@supabase/supabase-js';

const BUCKET = 'flores-amarillas';
const PREFIJO = 'pages';
/** Cuantas rutas se mandan por llamada a `remove`. */
const LOTE = 100;

// --------------------------------------------------------------------------
// Argumentos
// --------------------------------------------------------------------------

function leerNumero(
  args: string[],
  bandera: string,
  porDefecto: number
): number {
  const i = args.indexOf(bandera);
  if (i === -1) return porDefecto;
  const valor = Number(args[i + 1]);
  if (!Number.isFinite(valor) || valor < 0)
    throw new Error(`${bandera} necesita un numero de horas (0 o mas).`);
  return valor;
}

// --------------------------------------------------------------------------
// Conexion
// --------------------------------------------------------------------------

/**
 * Abre la conexion. Se hace aqui dentro y no al cargar el modulo para que
 * importarlo —las pruebas lo hacen— no tenga efectos ni pueda cortar el
 * proceso.
 */
function conectar() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !clave) {
    throw new Error(
      [
        'Faltan credenciales.',
        '',
        'Este script necesita la clave de servicio: la anonima puede subir al',
        'bucket pero no borrar, y tampoco puede leer la tabla de pagos.',
        '',
        'En PowerShell, desde la carpeta del proyecto:',
        '  $env:VITE_SUPABASE_URL="https://<proyecto>.supabase.co"',
        '  $env:SUPABASE_SERVICE_ROLE_KEY="<service_role del panel>"',
        '  bun scripts/limpiar-storage.ts',
        '',
        'La clave esta en Supabase > Project Settings > API > service_role.',
      ].join('\n')
    );
  }

  return createClient(url, clave, { auth: { persistSession: false } });
}

type Cliente = ReturnType<typeof conectar>;

// --------------------------------------------------------------------------
// Datos
// --------------------------------------------------------------------------

export type Pagina = { id: string; is_paid: boolean | null; expires_at: string | null };

async function leerPaginas(supabase: Cliente): Promise<Map<string, Pagina>> {
  const paginas = new Map<string, Pagina>();
  const porPagina = 1000;
  for (let desde = 0; ; desde += porPagina) {
    const { data, error } = await supabase
      .from('pages')
      .select('id, is_paid, expires_at')
      .range(desde, desde + porPagina - 1);
    if (error) throw new Error(`No se pudo leer pages: ${error.message}`);
    for (const fila of data ?? []) paginas.set(fila.id, fila as Pagina);
    if (!data || data.length < porPagina) return paginas;
  }
}

/** Paginas con algun aviso de pago. Se quedan como estan, pase lo que pase. */
async function leerPaginasConPago(supabase: Cliente): Promise<Set<string>> {
  const { data, error } = await supabase.from('pagos').select('page_id');
  if (error) {
    /*
     * Solo se perdona un error: que la tabla no exista todavia (es de la
     * migracion 0006). Entonces no hay avisos que proteger y el resto del
     * script sigue valiendo.
     *
     * Cualquier otro fallo —tipicamente la clave— aborta. Seguir seria
     * quedarse sin la unica red que impide borrarle las fotos a alguien que ya
     * pago y esta esperando que le activen su regalo.
     */
    const noExiste =
      error.code === '42P01' ||
      /does not exist|could not find the table/i.test(error.message);
    if (!noExiste) {
      throw new Error(
        `No se pudo leer la tabla de pagos (${error.message}). Se aborta: sin ` +
          'esa lista no se distingue una pagina abandonada de una que espera ' +
          'que le confirmes el pago.'
      );
    }
    console.warn(
      'Aviso: la tabla de pagos no existe todavia; no hay avisos que proteger.\n'
    );
    return new Set();
  }
  return new Set((data ?? []).map((fila) => fila.page_id as string));
}

export type Archivo = { nombre: string; creado: string | null; bytes: number };

/** Lista las carpetas de `pages/` y, dentro de cada una, sus archivos. */
async function leerCarpetas(supabase: Cliente): Promise<Map<string, Archivo[]>> {
  const carpetas = new Map<string, Archivo[]>();
  const ids: string[] = [];
  const porPagina = 100;

  for (let desde = 0; ; desde += porPagina) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(PREFIJO, { limit: porPagina, offset: desde });
    if (error) throw new Error(`No se pudo listar el bucket: ${error.message}`);
    // Las "carpetas" de Storage no son reales: son entradas sin metadata.
    for (const entrada of data ?? []) {
      if (!entrada.id) ids.push(entrada.name);
    }
    if (!data || data.length < porPagina) break;
  }

  for (const id of ids) {
    const archivos: Archivo[] = [];
    for (let desde = 0; ; desde += porPagina) {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .list(`${PREFIJO}/${id}`, { limit: porPagina, offset: desde });
      if (error) throw new Error(`No se pudo listar ${id}: ${error.message}`);
      for (const archivo of data ?? []) {
        if (!archivo.id) continue;
        archivos.push({
          nombre: archivo.name,
          creado: archivo.created_at ?? null,
          bytes: Number(archivo.metadata?.size ?? 0),
        });
      }
      if (!data || data.length < porPagina) break;
    }
    carpetas.set(id, archivos);
  }

  return carpetas;
}

// --------------------------------------------------------------------------
// Decision
// --------------------------------------------------------------------------

type Motivo = 'expirada' | 'huerfana';
type Veredicto =
  | { borrar: true; motivo: Motivo }
  | { borrar: false; motivo: string };

export function decidir(
  id: string,
  archivos: Archivo[],
  pagina: Pagina | undefined,
  conPago: Set<string>,
  limite: Date
): Veredicto {
  if (conPago.has(id)) return { borrar: false, motivo: 'tiene aviso de pago' };

  if (!pagina) {
    // Sin fila: o se abandono el formulario, o se esta subiendo ahora mismo.
    if (archivos.length === 0) return { borrar: false, motivo: 'vacia' };
    const masNuevo = archivos.reduce(
      (max, archivo) =>
        archivo.creado && archivo.creado > max ? archivo.creado : max,
      ''
    );
    if (!masNuevo) return { borrar: false, motivo: 'sin fecha, no se arriesga' };
    if (new Date(masNuevo) > limite)
      return { borrar: false, motivo: 'huerfana reciente (quiza subiendo)' };
    return { borrar: true, motivo: 'huerfana' };
  }

  if (pagina.is_paid) return { borrar: false, motivo: 'pagada' };
  if (!pagina.expires_at) return { borrar: false, motivo: 'sin expiracion' };
  const expira = new Date(pagina.expires_at);
  if (expira > new Date()) return { borrar: false, motivo: 'todavia viva' };
  if (expira > limite)
    return { borrar: false, motivo: 'expiro dentro de la gracia' };
  return { borrar: true, motivo: 'expirada' };
}

// --------------------------------------------------------------------------

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function main() {
  const args = process.argv.slice(2);
  const aplicar = args.includes('--aplicar');
  const graciaHoras = leerNumero(args, '--gracia-horas', 24);
  const supabase = conectar();
  const limite = new Date(Date.now() - graciaHoras * 60 * 60 * 1000);

  console.log(`Bucket: ${BUCKET}/${PREFIJO}`);
  console.log(
    `Gracia: ${graciaHoras} h (se perdona lo expirado o subido despues de ${limite.toISOString()})`
  );
  console.log(aplicar ? 'Modo: BORRAR\n' : 'Modo: solo mirar (--aplicar para borrar)\n');

  const [paginas, conPago, carpetas] = await Promise.all([
    leerPaginas(supabase),
    leerPaginasConPago(supabase),
    leerCarpetas(supabase),
  ]);

  const aBorrar: { id: string; motivo: Motivo; rutas: string[]; bytes: number }[] =
    [];
  const conservadas = new Map<string, number>();

  for (const [id, archivos] of carpetas) {
    const veredicto = decidir(id, archivos, paginas.get(id), conPago, limite);
    if (!veredicto.borrar) {
      conservadas.set(veredicto.motivo, (conservadas.get(veredicto.motivo) ?? 0) + 1);
      continue;
    }
    aBorrar.push({
      id,
      motivo: veredicto.motivo,
      rutas: archivos.map((archivo) => `${PREFIJO}/${id}/${archivo.nombre}`),
      bytes: archivos.reduce((total, archivo) => total + archivo.bytes, 0),
    });
  }

  console.log(`Carpetas en el bucket: ${carpetas.size}`);
  for (const [motivo, cuantas] of [...conservadas].sort())
    console.log(`  se conservan ${String(cuantas).padStart(4)} · ${motivo}`);

  const archivos = aBorrar.reduce((total, c) => total + c.rutas.length, 0);
  const bytes = aBorrar.reduce((total, c) => total + c.bytes, 0);
  console.log(
    `\nPara borrar: ${aBorrar.length} carpetas · ${archivos} archivos · ${mb(bytes)}`
  );
  for (const carpeta of aBorrar)
    console.log(
      `  ${carpeta.id}  ${carpeta.motivo.padEnd(9)} ${String(carpeta.rutas.length).padStart(2)} arch.  ${mb(carpeta.bytes)}`
    );

  if (aBorrar.length === 0) {
    console.log('\nNada que hacer.');
    return;
  }

  if (!aplicar) {
    console.log('\nNo se borro nada. Repite con --aplicar si estas de acuerdo.');
    return;
  }

  const rutas = aBorrar.flatMap((carpeta) => carpeta.rutas);
  let borrados = 0;
  for (let i = 0; i < rutas.length; i += LOTE) {
    const lote = rutas.slice(i, i + LOTE);
    const { data, error } = await supabase.storage.from(BUCKET).remove(lote);
    if (error) throw new Error(`Fallo al borrar: ${error.message}`);
    borrados += data?.length ?? 0;
    console.log(`  borrados ${borrados}/${rutas.length}`);
  }
  console.log(`\nListo: ${borrados} archivos borrados · ${mb(bytes)} liberados.`);
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
