import { useMutation } from '@tanstack/react-query';
import {
  Heart,
  ImageUp,
  Loader2,
  PartyPopper,
  Timer,
  TriangleAlert,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BotonCopiar } from '@/components/ui/boton-copiar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NUMERO_YAPE,
  QR_YAPE_URL,
  registrarAvisoPago,
  validarAvisoPago,
} from '../yape';

interface YapeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  precio: number;
  /**
   * Enlace del regalo. Por defecto la direccion actual, que es la del propio
   * regalo cuando el dialogo se abre desde ahi.
   *
   * Hay que pasarlo cuando se cobra desde otra pantalla —el editor, al canjear
   * un codigo con descuento—: si no, se guardaria el enlace del formulario y
   * se le diria a la persona que guarde una direccion que no lleva a su
   * regalo.
   */
  enlace?: string;
}

/**
 * Cobro por Yape con verificacion a mano.
 *
 * No hay pasarela: el cliente escanea, paga y sube la captura. Quien atiende
 * compara con la notificacion de Yape en su celular y activa la pagina. Por
 * eso este formulario no promete nada inmediato —seria mentir— y la pagina de
 * atras sigue recargandose sola hasta que la activacion llega.
 */
export function YapeDialog({
  open,
  onOpenChange,
  pageId,
  precio,
  enlace,
}: YapeDialogProps) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);
  // El mismo enlace que se guarda con el aviso de pago: la direccion de esta
  // pagina. Se lee al vuelo y no se guarda en estado porque no cambia mientras
  // el dialogo esta abierto.
  const enlaceDelRegalo =
    enlace ?? (typeof window === 'undefined' ? '' : window.location.href);

  // La miniatura es un blob local: sube recien al enviar, asi que mientras
  // tanto no hay ninguna URL remota que mostrar.
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  useEffect(() => {
    if (!comprobante) {
      setVistaPrevia(null);
      return;
    }
    const url = URL.createObjectURL(comprobante);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [comprobante]);

  const enviar = useMutation({
    // Recibe el archivo por parametro en vez de leerlo del estado: asi no hace
    // falta un `as File` para convencer a TypeScript de algo que ya comprobo
    // la validacion.
    mutationFn: (archivo: File) =>
      registrarAvisoPago({
        pageId,
        nombre,
        correo,
        comprobante: archivo,
        enlace: enlaceDelRegalo,
      }),
  });

  const limpiar = () => {
    setNombre('');
    setCorreo('');
    setComprobante(null);
    setErrorValidacion(null);
    enviar.reset();
  };

  const alCerrar = (siguiente: boolean) => {
    // Solo se limpia al cerrar tras un envio bueno. Si algo fallo, el cliente
    // vuelve a abrir y encuentra lo que ya habia escrito.
    if (!siguiente && enviar.isSuccess) limpiar();
    onOpenChange(siguiente);
  };

  const alEnviar = (evento: React.FormEvent) => {
    evento.preventDefault();
    const problema = validarAvisoPago({ nombre, correo, comprobante });
    setErrorValidacion(problema);
    if (problema || !comprobante) return;
    enviar.mutate(comprobante);
  };

  return (
    <Dialog open={open} onOpenChange={alCerrar}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        {enviar.isSuccess ? (
          /*
           * Tres cosas, en este orden: el gracias, el enlace —que es lo unico
           * que la persona puede perder para siempre— y la espera.
           *
           * El bloque del enlace lleva el aviso mas fuerte a proposito: si
           * cierra esta ventana sin guardarlo, el regalo sigue existiendo pero
           * se queda sin quien lo abra.
           */
          <div className="py-2">
            <DialogHeader>
              <span
                aria-hidden="true"
                className="mx-auto mb-3 grid size-16 place-items-center rounded-full bg-[#FFF8D7] text-[#183E32] ring-4 ring-[#F7C325]/40"
              >
                <PartyPopper className="size-8" />
              </span>
              <DialogTitle className="text-center font-display text-2xl leading-tight sm:text-3xl">
                ¡Muchas gracias
                <br />
                por preferirnos!
              </DialogTitle>
              <DialogDescription className="sr-only">
                Pago recibido. Guarda el enlace de tu regalo y compártelo.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-5 rounded-2xl border-2 border-[#B7801A] bg-[#FFF8D7] p-4">
              <p className="flex items-start gap-2 text-sm font-bold text-[#8A5A00]">
                <TriangleAlert
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0"
                />
                <span>
                  IMPORTANTE: guarda este enlace y compártelo con esa persona
                  tan especial.
                </span>
              </p>
              <p className="mt-3 rounded-xl border border-[#183E32]/15 bg-white px-3 py-2.5 text-xs leading-relaxed break-all text-[#183E32] select-all">
                {enlaceDelRegalo}
              </p>
              <BotonCopiar
                texto={enlaceDelRegalo}
                etiqueta="Copiar el enlace"
                className="mt-3 h-11 w-full bg-[#183E32] font-semibold text-white hover:bg-[#285642]"
                variant="default"
              />
            </div>

            <p className="mt-4 flex items-center justify-center gap-2 text-center text-sm font-semibold">
              <Timer aria-hidden="true" className="size-4 shrink-0" />
              En 5 minutos máx. esta página mostrará la versión habilitada
              <Heart
                aria-hidden="true"
                className="size-4 shrink-0 fill-[#F17B62] text-[#F17B62]"
              />
            </p>

            {/*
              Sin colores propios: la variante `outline` ya usa los tokens del
              tema, y asi se lee igual en claro y en oscuro. El bloque del
              enlace si lleva paleta fija, pero porque pinta su propio fondo.
            */}
            <Button
              onClick={() => alCerrar(false)}
              variant="outline"
              className="mt-5 w-full"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                Activa tu enlace por S/ {precio.toFixed(2)}
              </DialogTitle>
              <DialogDescription>
                Yapea el monto exacto al QR, sube tu captura y déjanos tus
                datos.
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-2xl border border-[#183E32]/15 bg-[#FFF8D7] p-4 text-center">
              <img
                src={QR_YAPE_URL}
                alt="Código QR de Yape para pagar"
                className="mx-auto w-48 max-w-full rounded-xl bg-white object-contain p-2"
                width={192}
                height={192}
              />
              <p className="mt-3 text-sm font-semibold text-[#183E32]">
                Monto exacto: S/ {precio.toFixed(2)}
              </p>
              {/*
                El numero escrito en el propio boton: asi sirve igual aunque
                copiar falle —navegadores sin permiso de portapapeles, o una
                pagina servida por http— y siempre se puede teclear a mano.
              */}
              <BotonCopiar
                texto={NUMERO_YAPE}
                etiqueta={`Copiar ${NUMERO_YAPE}`}
                className="mt-3 w-full border-[#183E32]/30 bg-white font-semibold tabular-nums text-[#183E32] hover:bg-[#FFF8D7]"
              />
            </div>

            <form className="space-y-4" onSubmit={alEnviar}>
              <div className="space-y-2">
                <Label htmlFor="pago-nombre">Nombre completo</Label>
                <Input
                  id="pago-nombre"
                  autoComplete="name"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Como aparece en tu Yape"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pago-correo">Correo electrónico</Label>
                <Input
                  id="pago-correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  placeholder="tu@correo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pago-comprobante">Comprobante de pago</Label>
                {/*
                  El input nativo queda accesible para el teclado y los
                  lectores de pantalla; lo que se ve es el recuadro de abajo.
                  Un boton que dispara .click() sobre un input escondido con
                  `hidden` se pierde del arbol de accesibilidad.
                */}
                {/*
                  Sin `required`: el navegador no puede plantar su globo de
                  error sobre un control que no se ve, y Chrome cancela el
                  envio entero con "not focusable". La ausencia de captura la
                  avisa `validarAvisoPago`, y con mejores palabras.
                */}
                <input
                  ref={inputArchivo}
                  id="pago-comprobante"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    setComprobante(e.target.files?.[0] ?? null);
                    setErrorValidacion(null);
                  }}
                />
                {vistaPrevia ? (
                  <div className="flex items-center gap-3 rounded-xl border border-[#183E32]/15 p-3">
                    <img
                      src={vistaPrevia}
                      alt="Tu comprobante"
                      className="size-16 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-[#597157]">
                      {comprobante?.name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Quitar el comprobante"
                      onClick={() => {
                        setComprobante(null);
                        if (inputArchivo.current)
                          inputArchivo.current.value = '';
                      }}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto w-full flex-col gap-1 border-dashed py-6"
                    onClick={() => inputArchivo.current?.click()}
                  >
                    <ImageUp aria-hidden="true" className="size-5" />
                    <span className="text-sm font-semibold">
                      Subir captura del Yape
                    </span>
                    <span className="text-xs font-normal text-[#597157]">
                      JPG, PNG o WEBP · hasta 5 MB
                    </span>
                  </Button>
                )}
              </div>

              {(errorValidacion || enviar.isError) && (
                <p className="text-sm text-red-600" role="alert">
                  {errorValidacion ?? enviar.error?.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={enviar.isPending}
                className="h-12 w-full bg-[#183E32] text-base font-semibold text-white hover:bg-[#285642]"
              >
                {enviar.isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {enviar.isPending ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
