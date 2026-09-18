import { CheckCircle2, Loader2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RegistrarReclamoInput } from '@/core/interfaces/reclamo-repository';
import { reclamoRepository } from '@/repository/reclamos';
import { Apartado, LegalPage } from './LegalPage';
import { DIAS_PARA_RESPONDER, negocio } from './negocio';

/**
 * Libro de Reclamaciones digital.
 *
 * Es obligatorio y tiene que estar en el propio sitio: un enlace a un
 * formulario de fuera no cumple. Por eso esto es un formulario nativo que
 * escribe en nuestra base y devuelve un correlativo, y no un `mailto:` ni un
 * formulario alojado en otro servicio.
 *
 * La hoja se guarda por RPC (`registrar_reclamo`): la tabla esta cerrada al
 * navegador porque lleva nombre, documento y domicilio de gente real.
 */

const campoClase = 'mt-1.5';

function Campo({
  id,
  etiqueta,
  children,
  ayuda,
}: {
  id: string;
  etiqueta: string;
  children: React.ReactNode;
  ayuda?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm font-semibold text-[#183E32]">
        {etiqueta}
      </Label>
      {children}
      {ayuda && <p className="mt-1 text-xs text-[#597157]">{ayuda}</p>}
    </div>
  );
}

export function LibroDeReclamaciones() {
  const [enviando, setEnviando] = useState(false);
  const [codigo, setCodigo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (enviando) return;

    const datos = new FormData(evento.currentTarget);
    const texto = (clave: string) => String(datos.get(clave) ?? '').trim();
    const montoCrudo = texto('monto');

    const input: RegistrarReclamoInput = {
      tipo: texto('tipo') === 'queja' ? 'queja' : 'reclamo',
      nombre: texto('nombre'),
      tipoDocumento: texto(
        'tipoDocumento'
      ) as RegistrarReclamoInput['tipoDocumento'],
      documento: texto('documento'),
      domicilio: texto('domicilio'),
      correo: texto('correo'),
      telefono: texto('telefono'),
      apoderado: texto('apoderado') || undefined,
      tipoBien: texto('tipoBien') === 'producto' ? 'producto' : 'servicio',
      descripcion: texto('descripcion'),
      // El monto es opcional: hay reclamos que no van de dinero.
      monto: montoCrudo ? Number(montoCrudo) : undefined,
      detalle: texto('detalle'),
      pedido: texto('pedido'),
    };

    setEnviando(true);
    setError(null);
    const guardado = await reclamoRepository.registrar(input);
    setEnviando(false);

    if (guardado.isFailure()) {
      setError(
        guardado.getError()?.message ??
          'No se pudo registrar tu reclamo. Vuelve a intentarlo.'
      );
      return;
    }
    setCodigo(guardado.getValue() ?? null);
  };

  if (codigo) {
    return (
      <LegalPage titulo="Tu reclamo quedó registrado">
        <div className="rounded-2xl border-2 border-[#1d6b4f] bg-[#EFF8F1] p-6">
          <p className="flex items-center gap-2 font-semibold text-[#1d6b4f]">
            <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
            Hoja número {codigo}
          </p>
          <p className="mt-3 text-sm leading-relaxed">
            Guarda este número: es tu constancia. Te responderemos a tu correo
            en un máximo de {DIAS_PARA_RESPONDER} días hábiles.
          </p>
        </div>
      </LegalPage>
    );
  }

  return (
    <LegalPage
      titulo="Libro de Reclamaciones"
      entradilla={`Conforme al Código de Protección y Defensa del Consumidor. Tu hoja queda registrada aquí mismo y la respondemos en un máximo de ${DIAS_PARA_RESPONDER} días hábiles.`}
    >
      <Apartado titulo="Datos del proveedor">
        <p>
          {negocio.nombre} · RUC {negocio.ruc}
          <br />
          {negocio.direccion}
          <br />
          {negocio.correo} · {negocio.telefono}
        </p>
      </Apartado>

      <form onSubmit={enviar} className="space-y-8">
        <Apartado titulo="Tus datos">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Campo id="nombre" etiqueta="Nombre completo">
                <Input
                  id="nombre"
                  name="nombre"
                  required
                  maxLength={120}
                  className={campoClase}
                />
              </Campo>
            </div>
            <Campo id="tipoDocumento" etiqueta="Tipo de documento">
              <select
                id="tipoDocumento"
                name="tipoDocumento"
                required
                className={`${campoClase} h-9 w-full rounded-md border border-[#183E32]/20 bg-white px-3 text-sm`}
              >
                <option value="DNI">DNI</option>
                <option value="CE">Carné de extranjería</option>
                <option value="pasaporte">Pasaporte</option>
              </select>
            </Campo>
            <Campo id="documento" etiqueta="Número de documento">
              <Input
                id="documento"
                name="documento"
                required
                maxLength={20}
                className={campoClase}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo id="domicilio" etiqueta="Domicilio">
                <Input
                  id="domicilio"
                  name="domicilio"
                  required
                  maxLength={200}
                  className={campoClase}
                />
              </Campo>
            </div>
            <Campo id="correo" etiqueta="Correo electrónico">
              <Input
                id="correo"
                name="correo"
                type="email"
                required
                className={campoClase}
              />
            </Campo>
            <Campo id="telefono" etiqueta="Teléfono">
              <Input
                id="telefono"
                name="telefono"
                required
                maxLength={30}
                className={campoClase}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo
                id="apoderado"
                etiqueta="Padre, madre o apoderado"
                ayuda="Solo si quien reclama es menor de edad."
              >
                <Input
                  id="apoderado"
                  name="apoderado"
                  maxLength={120}
                  className={campoClase}
                />
              </Campo>
            </div>
          </div>
        </Apartado>

        <Apartado titulo="Lo contratado">
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo id="tipoBien" etiqueta="Tipo">
              <select
                id="tipoBien"
                name="tipoBien"
                required
                className={`${campoClase} h-9 w-full rounded-md border border-[#183E32]/20 bg-white px-3 text-sm`}
              >
                <option value="servicio">Servicio</option>
                <option value="producto">Producto</option>
              </select>
            </Campo>
            <Campo id="monto" etiqueta="Monto reclamado (S/)" ayuda="Opcional.">
              <Input
                id="monto"
                name="monto"
                type="number"
                min="0"
                step="0.01"
                className={campoClase}
              />
            </Campo>
            <div className="sm:col-span-2">
              <Campo
                id="descripcion"
                etiqueta="Descripción"
                ayuda="Qué compraste. Si tienes el enlace de tu página, pégalo aquí."
              >
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  required
                  rows={3}
                  className={campoClase}
                />
              </Campo>
            </div>
          </div>
        </Apartado>

        <Apartado titulo="Tu reclamo">
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-[#183E32]">
                Tipo
              </legend>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="tipo"
                  value="reclamo"
                  defaultChecked
                  className="mt-1"
                />
                <span>
                  <strong>Reclamo</strong> — disconformidad con el producto o
                  servicio.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="tipo"
                  value="queja"
                  className="mt-1"
                />
                <span>
                  <strong>Queja</strong> — malestar con la atención recibida.
                </span>
              </label>
            </fieldset>
            <Campo id="detalle" etiqueta="Detalle">
              <Textarea
                id="detalle"
                name="detalle"
                required
                rows={5}
                minLength={10}
                className={campoClase}
              />
            </Campo>
            <Campo id="pedido" etiqueta="Qué pides">
              <Textarea
                id="pedido"
                name="pedido"
                required
                rows={3}
                minLength={10}
                className={campoClase}
              />
            </Campo>
          </div>
        </Apartado>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={enviando}
          className="h-12 w-full rounded-full bg-[#183E32] font-semibold text-white hover:bg-[#285642]"
        >
          {enviando ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> Enviando…
            </>
          ) : (
            'Enviar mi hoja de reclamación'
          )}
        </Button>
      </form>
    </LegalPage>
  );
}
