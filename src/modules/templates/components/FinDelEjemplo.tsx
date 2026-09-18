import { Link } from '@tanstack/react-router';
import { ArrowRight, LayoutGrid } from 'lucide-react';

/**
 * El cierre de una pagina de ejemplo.
 *
 * Las plantillas no tienen boton de retroceder: estan hechas para quien recibe
 * el regalo, que no tiene a donde volver. En un ejemplo eso deja al cliente
 * encerrado justo cuando acaba de ver lo que queria ver, con el boton de atras
 * del navegador como unica salida. Asi que al terminar el recorrido se pone
 * delante este cierre, con las dos unicas cosas que puede querer hacer:
 * mirar otros disenos o quedarse con este.
 *
 * Tapa la plantilla en vez de sustituirla: el regalo sigue detras, atenuado, y
 * se entiende que lo que acaba es el ejemplo y no la pagina.
 */
export function FinDelEjemplo({ templateId }: { templateId: number }) {
  return (
    <div
      /*
       * z-[1100]: por encima de todo lo que pinta una plantilla (llegan a
       * z-70) y de la marca de agua (z-100). En un ejemplo no hay barra de
       * cobro, pero se deja por encima tambien de ella (z-1000) para que no
       * aparezca media pantalla de cobro sobre el cierre si algun dia un
       * ejemplo se queda sin activar.
       */
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-[#0B1F19]/70 px-5 py-8 backdrop-blur-sm motion-safe:animate-in motion-safe:fade-in motion-safe:duration-700"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fin-del-ejemplo-titulo"
    >
      <div className="w-full max-w-md rounded-[28px] bg-[#FFFCF4] p-8 text-center text-[#183E32] shadow-2xl sm:p-10">
        <h2
          id="fin-del-ejemplo-titulo"
          className="font-display text-[clamp(1.9rem,6vw,2.6rem)] leading-tight"
        >
          Gracias por ver este ejemplo.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#597157]">
          Esto es exactamente lo que abre la persona a la que se lo regales, con
          tus fotos, tus palabras y su canción.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/template/$id"
            params={{ id: String(templateId) }}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#FFD329] px-5 py-3 text-sm font-semibold text-[#183E32] hover:bg-[#F0C51C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
          >
            Configurar esta plantilla
            <ArrowRight size={16} className="shrink-0" />
          </Link>
          <Link
            to="/template"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[#183E32]/20 px-5 py-3 text-sm font-semibold text-[#183E32] hover:border-[#183E32]/50 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#183E32]"
          >
            <LayoutGrid size={16} className="shrink-0" />
            Ver más plantillas
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * La cuenta atras de los ejemplos que no tienen final.
 *
 * El jardin en 3D y la dedicatoria gratuita no son un recorrido con ultima
 * pantalla: se pasean. No hay momento en el que "acaben", asi que el ejemplo
 * se corta por tiempo, y el tiempo se ensena para que el corte no sorprenda
 * a mitad de un paseo.
 */
export function CuentaAtrasDelEjemplo({ segundos }: { segundos: number }) {
  const minutos = Math.floor(segundos / 60);
  const resto = segundos % 60;
  return (
    <output
      aria-live="off"
      className="fixed right-4 top-4 z-[1050] rounded-full bg-[#0B1F19]/70 px-3.5 py-1.5 text-xs font-semibold text-white/90 tabular-nums backdrop-blur-sm"
    >
      Ejemplo · {minutos}:{String(resto).padStart(2, '0')}
    </output>
  );
}
