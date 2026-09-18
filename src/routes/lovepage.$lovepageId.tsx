import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LovepageService } from '@/modules/lovepage/services';
import { enlaceDeCulqi } from '@/modules/payments/culqi';
import { registrarCompraPorWhatsapp } from '@/modules/payments/whatsapp';
import { PlanService } from '@/modules/plan/services';
import {
  esEjemplo,
  modoFinDe,
  SEGUNDOS_DE_EJEMPLO,
} from '@/modules/templates/components/config/ejemplos';
import {
  CuentaAtrasDelEjemplo,
  FinDelEjemplo,
} from '@/modules/templates/components/FinDelEjemplo';
import { TemplateRenderer } from '@/modules/templates/components/TemplateRenderer';
import { TemplateService } from '@/modules/templates/services';

export const Route = createFileRoute('/lovepage/$lovepageId')({
  loader: async ({ params }) => {
    const lovepage = await LovepageService.getLovepage(params.lovepageId);
    if (!lovepage) throw new Error('Pagina no encontrada');
    const template = await TemplateService.getTemplateById(lovepage.templateId);
    if (!template) throw new Error('Plantilla no encontrada');
    const plan = await PlanService.getPlanById(template.planId);
    if (!plan) throw new Error('Plan no encontrado');
    return {
      ...lovepage,
      templateKey: template.templateKey,
      // Lo necesita el cierre de los ejemplos, para "Configurar esta
      // plantilla": el id del diseno, no el de la pagina.
      templateId: template.id,
      price: plan.price,
    };
  },
  component: RouteComponent,
});

/**
 * Lo que tarda en aparecer el cobro.
 *
 * El regalo se abre limpio y unos segundos despues entran la barra y la marca
 * de agua. Con las dos cosas ya puestas en el primer fotograma, lo primero que se
 * veia era una pantalla con un cartel de pago encima y un "Vista Previa"
 * cruzado: se veia tan mal que quitaba las ganas de pagar, que es exactamente
 * lo contrario de lo que tiene que hacer. Dando ese respiro, primero se ve el
 * regalo —que es lo que convence— y luego lo que cuesta.
 */
const MS_ANTES_DEL_COBRO = 3000;

const ctaClassName =
  'rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-yellow-400';

function RouteComponent() {
  const lovepage = Route.useLoaderData();
  const router = useRouter();

  useEffect(() => {
    if (lovepage.price <= 0 || lovepage.isPaid) return;
    const interval = window.setInterval(() => void router.invalidate(), 10_000);
    return () => window.clearInterval(interval);
  }, [lovepage.price, lovepage.isPaid, router]);

  const hayQuePagar = lovepage.price > 0 && !lovepage.isPaid;

  /*
   * El cobro entra con un segundo de retraso (ver `MS_ANTES_DEL_COBRO`).
   *
   * Se arranca en `false` y se enciende con un temporizador en vez de dejarlo
   * siempre visible: asi el primer fotograma es el regalo y nada mas.
   */
  const [cobroVisible, setCobroVisible] = useState(false);
  useEffect(() => {
    if (!hayQuePagar) return;
    const id = window.setTimeout(
      () => setCobroVisible(true),
      MS_ANTES_DEL_COBRO
    );
    return () => window.clearTimeout(id);
  }, [hayQuePagar]);
  const needsPayment = hayQuePagar && cobroVisible;

  /*
   * Los ejemplos del catalogo.
   *
   * Son paginas reales y ya activadas, asi que por aqui pasan como cualquier
   * regalo; lo unico que cambia es que al acabar se pone delante el cierre con
   * los dos botones, porque las plantillas no tienen boton de retroceder y el
   * cliente se quedaba encerrado. Ver `config/ejemplos.ts`.
   */
  const esUnEjemplo = esEjemplo(lovepage.id);
  const porTemporizador =
    esUnEjemplo && modoFinDe(lovepage.templateKey) === 'temporizador';
  const [ejemploTerminado, setEjemploTerminado] = useState(false);
  const [segundos, setSegundos] = useState(SEGUNDOS_DE_EJEMPLO);

  useEffect(() => {
    if (!porTemporizador) return;
    const id = window.setInterval(() => {
      setSegundos((quedan) => {
        if (quedan <= 1) {
          window.clearInterval(id);
          setEjemploTerminado(true);
          return 0;
        }
        return quedan - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [porTemporizador]);

  // `useCallback` no: lo recibe una plantilla que lo mete en un `useEffect`
  // con el en las dependencias, y una funcion nueva en cada render la haria
  // repetirse. Con el setter de estado, que React mantiene estable, no pasa.
  const [avisarDelFinal] = useState(() => () => setEjemploTerminado(true));

  /*
   * El enlace de pago de Culqi que corresponde a este precio, si lo hay.
   *
   * `null` cuando el monto no tiene enlace creado en el panel de Culqi; ese
   * plan cae al WhatsApp de siempre. Ver `payments/culqi.ts`.
   */
  const culqiLink = enlaceDeCulqi(lovepage.price);

  /*
   * El cobro por WhatsApp, para los planes que aun no tienen enlace de Culqi.
   *
   * Se anota el pago como pendiente antes de salir: al saltar al chat la
   * pestana se va, y guardarlo despues nos dejaria un mensaje de alguien que
   * no aparece en ninguna lista.
   *
   * El enlace del regalo es `window.location.href` y no uno armado: estamos
   * en la pagina del regalo, asi que esta es su direccion buena, con el
   * dominio y el subpath que de verdad tenga el despliegue.
   */
  const [comprando, setComprando] = useState(false);
  const [avisoDeCompra, setAvisoDeCompra] = useState<string | null>(null);
  const comprarPorWhatsapp = async () => {
    if (comprando) return;
    setComprando(true);
    setAvisoDeCompra(null);
    try {
      const chat = await registrarCompraPorWhatsapp({
        pageId: lovepage.id,
        enlace: window.location.href,
      });
      if (!chat) {
        setAvisoDeCompra(
          'Anotamos tu compra. Escríbenos por WhatsApp con el enlace de esta página para activarla.'
        );
        return;
      }
      window.location.assign(chat);
    } catch (error) {
      setAvisoDeCompra(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar tu compra'
      );
    } finally {
      setComprando(false);
    }
  };

  const paymentButton = culqiLink ? (
    <Button asChild className={ctaClassName}>
      <a href={culqiLink} target="_blank" rel="noreferrer">
        Pagar
      </a>
    </Button>
  ) : (
    <Button
      onClick={comprarPorWhatsapp}
      disabled={comprando}
      className={ctaClassName}
    >
      {comprando ? 'Un momento…' : 'Pagar'}
    </Button>
  );

  return (
    <>
      {/*
        z-[1000]: las plantillas usan hasta z-70 para sus adornos y sus zonas
        invisibles de navegacion. Con z-50 esta barra quedaba debajo y
        aquellas se comian el clic de "Comprar plan": se veia el boton y no se
        podia pagar. La marca de agua (z-100) tambien queda por debajo, que es
        lo correcto: no tapa el cobro.
      */}
      {needsPayment && lovepage.configJson && (
        <div className="fixed inset-x-0 top-0 z-[1000] flex flex-col gap-3 border-b border-amber-200 bg-white p-4 shadow-xl dark:border-amber-900 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
              <Sparkles className="h-4 w-4 text-amber-500" /> Vista previa
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Activa tu enlace permanente por S/ {lovepage.price.toFixed(2)}.
              {culqiLink
                ? ' Paga en línea con CulqiLink.'
                : ' Te escribimos por WhatsApp para cerrar la compra.'}
            </p>
            {avisoDeCompra && (
              <p
                role="alert"
                className="mt-1 text-sm font-medium text-amber-700 dark:text-amber-400"
              >
                {avisoDeCompra}
              </p>
            )}
          </div>
          {paymentButton}
        </div>
      )}

      {porTemporizador && !ejemploTerminado && (
        <CuentaAtrasDelEjemplo segundos={segundos} />
      )}
      {esUnEjemplo && ejemploTerminado && (
        <FinDelEjemplo templateId={lovepage.templateId} />
      )}

      {lovepage.configJson ? (
        <TemplateRenderer
          templateKey={lovepage.templateKey}
          templateData={lovepage.configJson}
          isPreview={needsPayment}
          marcaDeAgua={needsPayment}
          /*
            Solo se escucha el final en los ejemplos que lo avisan. En un
            regalo de verdad no se pasa nada: quien lo recibe se queda en la
            ultima pantalla, que es donde tiene que quedarse.
          */
          onComplete={
            esUnEjemplo && !porTemporizador ? avisarDelFinal : undefined
          }
        />
      ) : (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-100 via-yellow-100 to-lime-100 p-8">
          <div className="max-w-md space-y-5 rounded-3xl bg-white/90 p-10 text-center shadow-2xl">
            <h1 className="text-2xl font-bold text-amber-700">
              Tu vista previa terminó
            </h1>
            <p className="text-slate-700">
              Tu página está guardada y vuelve completa en cuanto confirmemos tu
              pago.
            </p>
            {needsPayment && paymentButton}
          </div>
        </div>
      )}

      {/*
        Aqui estaba el Yape —QR, captura y revision a mano— como respaldo de
        los planes sin enlace de Culqi. Ese respaldo ahora es WhatsApp, asi que
        el dialogo se queda sin puerta de entrada.

        `YapeDialog` no se borra todavia: ya no lo usa nadie —Girasol cobra por
        Culqi y el resto por WhatsApp—, asi que es codigo muerto a la espera de
        que alguien confirme que no hace falta volver a colgarlo.
      */}
    </>
  );
}
