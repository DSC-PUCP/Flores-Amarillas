import { createFileRoute, useRouter } from '@tanstack/react-router';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LovepageService } from '@/modules/lovepage/services';
import { YapeDialog } from '@/modules/payments/components/YapeDialog';
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
      price: lovepage.flowAmount ?? plan.price,
    };
  },
  component: RouteComponent,
});

/**
 * Lo que tarda en aparecer el cobro.
 *
 * El regalo se abre limpio y un segundo despues entran la barra y la marca de
 * agua. Con las dos cosas ya puestas en el primer fotograma, lo primero que se
 * veia era una pantalla con un cartel de pago encima y un "Vista Previa"
 * cruzado: se veia tan mal que quitaba las ganas de pagar, que es exactamente
 * lo contrario de lo que tiene que hacer. Dando un segundo, primero se ve el
 * regalo —que es lo que convence— y luego lo que cuesta.
 */
const MS_ANTES_DEL_COBRO = 5000;

const ctaClassName =
  'rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/30 hover:from-amber-400 hover:to-yellow-400';

function RouteComponent() {
  const lovepage = Route.useLoaderData();
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

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
  // Se ignora `flowCheckoutUrl` a proposito: las paginas creadas antes traen
  // una orden de Flow que ya no lleva a ningun lado, y mandar ahi a alguien
  // que quiere pagar es peor que no ofrecerle nada.
  const openCheckout = () => setCheckoutOpen(true);

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
              Pagas por Yape y lo abrimos apenas verifiquemos.
            </p>
          </div>
          <Button onClick={openCheckout} className={ctaClassName}>
            Comprar plan
          </Button>
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
            {needsPayment && (
              <Button onClick={openCheckout} className={ctaClassName}>
                {`Comprar plan por S/ ${lovepage.price.toFixed(2)}`}
              </Button>
            )}
          </div>
        </div>
      )}

      <YapeDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        pageId={lovepage.id}
        precio={lovepage.price}
      />
    </>
  );
}
