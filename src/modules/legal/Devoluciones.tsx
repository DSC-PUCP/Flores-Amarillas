import { Apartado, LegalPage } from './LegalPage';
import { DIAS_PARA_RESPONDER, negocio } from './negocio';

/**
 * Politica de cambios o devoluciones.
 *
 * La postura es la acordada: se devuelve el dinero cuando el regalo no llego a
 * entregarse o falla por causa nuestra, y no se devuelve una vez entregado y
 * funcionando, por tratarse de contenido digital hecho a medida.
 *
 * Mismo aviso que en los terminos: es un borrador honesto de lo que hacemos,
 * no un texto revisado por un abogado.
 */
export function Devoluciones() {
  return (
    <LegalPage
      titulo="Política de cambios o devoluciones"
      entradilla="Qué pasa si algo sale mal con tu regalo, y en qué casos te devolvemos el dinero."
    >
      <Apartado titulo="Cuándo te devolvemos el dinero">
        <p>Te devolvemos el importe íntegro si:</p>
        <ul className="ml-5 list-disc space-y-2">
          <li>
            Pagaste y tu página nunca llegó a activarse, o quedó inaccesible por
            un problema nuestro.
          </li>
          <li>
            La página no funciona como se ofrecía —no carga, pierde tus fotos o
            tu música— y no conseguimos arreglarlo.
          </li>
          <li>Se te cobró dos veces el mismo regalo.</li>
        </ul>
        <p>
          En cualquiera de estos casos, escríbenos y lo resolvemos: primero
          intentamos arreglar la página, y si no es posible, devolvemos el
          dinero por el mismo medio con el que pagaste.
        </p>
      </Apartado>

      <Apartado titulo="Cuándo no procede la devolución">
        <p>
          Una vez que tu página está entregada y funcionando,{' '}
          <strong>no hay devolución</strong>. Es contenido digital hecho a
          medida con tus fotos y tus palabras: no se puede devolver ni revender,
          y desde que tienes el enlace ya lo recibiste entero.
        </p>
        <p>
          Tampoco procede por haber cambiado de opinión, por haberte equivocado
          al escribir algo —eso lo corregimos sin coste— o porque la persona que
          lo recibió no lo abriera.
        </p>
      </Apartado>

      <Apartado titulo="Cambios">
        <p>
          Los cambios de contenido son gratuitos: si te equivocaste en un
          nombre, una fecha o una foto, escríbenos y lo corregimos sobre la
          misma página, sin volver a cobrar.
        </p>
        <p>
          Cambiar a un diseño distinto del que compraste supone un regalo nuevo.
          Si el diseño nuevo cuesta lo mismo o menos, lo hacemos sin coste
          adicional.
        </p>
      </Apartado>

      <Apartado titulo="Cómo pedirlo">
        <p>
          Escríbenos a{' '}
          <a className="underline" href={`mailto:${negocio.correo}`}>
            {negocio.correo}
          </a>{' '}
          o por WhatsApp al {negocio.telefono}, con el enlace de tu página y lo
          que pasó. Respondemos en un máximo de {DIAS_PARA_RESPONDER} días
          hábiles, y si procede la devolución la tramitamos en ese mismo plazo.
        </p>
        <p>
          Esta política no limita los derechos que te reconoce el Código de
          Protección y Defensa del Consumidor.
        </p>
      </Apartado>
    </LegalPage>
  );
}
