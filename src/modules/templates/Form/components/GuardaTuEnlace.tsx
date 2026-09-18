import { ArrowRight, Link2, TriangleAlert } from 'lucide-react';
import { BotonCopiar } from '@/components/ui/boton-copiar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * El paso del enlace, entre generar el regalo y verlo.
 *
 * Quien llega aqui acaba de crear su regalo y no sabe como se lo va a hacer
 * llegar a nadie: el formulario nunca pide un correo ni un telefono, asi que
 * la pregunta que queda flotando es "y ahora que". La respuesta es esta
 * direccion, y es la unica que hay: no se manda sola a ningun sitio y quien no
 * la guarde tiene que volver a buscarla.
 *
 * Por eso se ensena antes de llevar al regalo y no despues. Al llegar al
 * regalo la atencion se va entera a la plantilla —que es lo que se queria
 * ver—, y el aviso de guardar el enlace se lo come la sorpresa.
 *
 * El diálogo no se cierra al pulsar fuera ni con Escape a proposito: es un
 * paso del camino, no un aviso que estorba.
 */
export function GuardaTuEnlace({
  open,
  enlace,
  onContinuar,
}: {
  open: boolean;
  /** La direccion del regalo, absoluta y lista para pegar en un chat. */
  enlace: string;
  onContinuar: () => void;
}) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-0 bg-[#FFFCF4] text-[#183E32] sm:max-w-md"
        showCloseButton={false}
        onPointerDownOutside={(evento) => evento.preventDefault()}
        onEscapeKeyDown={(evento) => evento.preventDefault()}
      >
        <DialogHeader>
          <span
            aria-hidden="true"
            className="mx-auto grid size-14 place-items-center rounded-full bg-[#FFD329] text-[#183E32]"
          >
            <Link2 className="size-7" />
          </span>
          <DialogTitle className="text-center font-display text-2xl leading-tight sm:text-3xl">
            Tu regalo ya tiene
            <br />
            su propia dirección.
          </DialogTitle>
          <DialogDescription className="text-center text-sm leading-relaxed text-[#597157]">
            Con este enlace lo compartes cuando quieras y donde quieras: por
            WhatsApp, por Instagram o en persona. Guárdalo antes de seguir.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2 rounded-2xl border-2 border-[#B7801A] bg-[#FFF8D7] p-4">
          <p className="flex items-start gap-2 text-sm font-bold text-[#8A5A00]">
            <TriangleAlert
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0"
            />
            <span>
              IMPORTANTE: guarda este enlace. Es la única forma de volver a tu
              regalo y de que esa persona lo abra.
            </span>
          </p>
          <p className="mt-3 rounded-xl border border-[#183E32]/15 bg-white px-3 py-2.5 text-xs leading-relaxed break-all text-[#183E32] select-all">
            {enlace}
          </p>
          <BotonCopiar
            texto={enlace}
            etiqueta="Copiar el enlace"
            className="mt-3 h-11 w-full bg-[#183E32] font-semibold text-white hover:bg-[#285642]"
            variant="default"
          />
        </div>

        <Button
          type="button"
          onClick={onContinuar}
          className="mt-4 h-12 w-full rounded-full bg-[#FFD329] font-semibold text-[#183E32] hover:bg-[#F0C51C]"
        >
          Ver mi regalo
          <ArrowRight className="ml-2 size-4 shrink-0" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
