import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, ImageUp, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
import { QR_YAPE_URL, registrarAvisoPago, validarAvisoPago } from '../yape';

interface YapeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageId: string;
  precio: number;
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
}: YapeDialogProps) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  const inputArchivo = useRef<HTMLInputElement>(null);

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
        enlace: window.location.href,
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
          <div className="py-4 text-center">
            <CheckCircle2
              aria-hidden="true"
              className="mx-auto mb-4 size-12 text-[#1E3B2A]"
            />
            <DialogHeader>
              <DialogTitle className="text-center text-2xl">
                Recibido. Gracias.
              </DialogTitle>
              <DialogDescription className="text-center">
                Revisamos tu pago y activamos tu enlace apenas lo confirmemos.
                Deja esta página abierta: se desbloquea sola. Guardamos tu
                correo por si necesitamos escribirte.
              </DialogDescription>
            </DialogHeader>
            <Button
              onClick={() => alCerrar(false)}
              className="mt-6 bg-[#183E32] text-white hover:bg-[#285642]"
            >
              Entendido
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Activa tu enlace por S/ {precio.toFixed(2)}</DialogTitle>
              <DialogDescription>
                Yapea el monto exacto al QR, sube tu captura y déjanos tus
                datos. Verificamos a mano, así que puede tomar de 2 a 5 minutos.
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
                        if (inputArchivo.current) inputArchivo.current.value = '';
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
