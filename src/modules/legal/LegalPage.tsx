import { Link } from '@tanstack/react-router';
import { ArrowLeft, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { FALTAN_DATOS } from './negocio';

/**
 * El marco de las paginas legales.
 *
 * Las tres —terminos, devoluciones y el Libro de Reclamaciones— se leen, no se
 * usan: una sola columna estrecha, tipografia grande y nada que distraiga. No
 * comparten nada con el catalogo aparte de la paleta, y por eso viven en su
 * propio modulo en vez de colgar de `templates`.
 */
export function LegalPage({
  titulo,
  entradilla,
  children,
}: {
  titulo: string;
  entradilla?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh bg-[#FFFCF4] px-5 py-8 text-[#183E32] sm:px-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/template"
          className="mb-9 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[#597157] hover:text-[#183E32] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
        >
          <ArrowLeft size={16} /> Volver a los diseños
        </Link>

        <h1 className="font-display text-[clamp(2.1rem,4.5vw,3.2rem)] leading-[1.1] tracking-tight">
          {titulo}
        </h1>
        {entradilla && (
          <p className="mt-4 text-base leading-relaxed text-[#597157]">
            {entradilla}
          </p>
        )}

        {/*
          Aviso de que aun faltan los datos del titular.

          Se ensena en pantalla y no en un comentario del codigo a proposito:
          una pagina legal con el titular a medias no sirve —ni ante INDECOPI ni
          ante la pasarela—, y lo peor que puede pasar es que se publique sin
          que nadie se de cuenta. Desaparece solo al rellenar `negocio.ts`.
        */}
        {FALTAN_DATOS && (
          <p
            role="alert"
            className="mt-8 flex items-start gap-2 rounded-2xl border-2 border-[#B7801A] bg-[#FFF8D7] p-4 text-sm font-semibold text-[#8A5A00]"
          >
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
            <span>
              Faltan datos del titular. Complétalos en{' '}
              <code className="font-mono">src/modules/legal/negocio.ts</code>{' '}
              antes de publicar esta página o de enviar la afiliación a la
              pasarela.
            </span>
          </p>
        )}

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-[#38513f]">
          {children}
        </div>
      </div>
    </div>
  );
}

/** Un apartado con su titulo, para no repetir clases en cada pagina. */
export function Apartado({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl text-[#183E32]">{titulo}</h2>
      {children}
    </section>
  );
}
