import { Apartado, LegalPage } from './LegalPage';
import { DIAS_PARA_RESPONDER, negocio, SERVICIO } from './negocio';

/**
 * Terminos y condiciones.
 *
 * Borrador de trabajo: describe lo que el sitio hace de verdad hoy —como se
 * crea un regalo, como se cobra, cuanto dura el enlace— pero no lo ha revisado
 * ningun abogado. Antes de publicarlo conviene que alguien lo lea con la
 * normativa delante; lo que no se puede es inventarse la parte del titular,
 * que sale de `negocio.ts`.
 */
export function Terminos() {
  return (
    <LegalPage
      titulo="Términos y condiciones"
      entradilla={`Estas condiciones rigen el uso de ${negocio.nombreComercial} y la compra de sus dedicatorias. Al crear o pagar un regalo, las aceptas.`}
    >
      <Apartado titulo="Quién presta el servicio">
        <p>
          El titular es <strong>{negocio.nombre}</strong>, con RUC{' '}
          <strong>{negocio.ruc}</strong> y domicilio en {negocio.direccion}.
          Puedes escribirnos a{' '}
          <a className="underline" href={`mailto:${negocio.correo}`}>
            {negocio.correo}
          </a>{' '}
          o llamarnos al {negocio.telefono}.
        </p>
      </Apartado>

      <Apartado titulo="Qué vendemos">
        <p>Ofrecemos {SERVICIO}</p>
        <p>
          Cada diseño tiene un precio fijo, visible en el catálogo antes de
          comprar, en soles y con IGV incluido cuando corresponde. Es un{' '}
          <strong>pago único</strong>: no hay suscripción, ni cobros
          recurrentes, ni renovaciones automáticas.
        </p>
      </Apartado>

      <Apartado titulo="Cómo se compra">
        <p>
          Eliges un diseño, lo personalizas con tus textos, fotos y música, y
          generas el regalo. En ese momento te damos el enlace de tu página:{' '}
          <strong>ese enlace es el producto</strong>, y es tu responsabilidad
          guardarlo y compartirlo con quien quieras.
        </p>
        <p>
          Hasta que el pago se confirme, la página se ve como vista previa, con
          una marca de agua. Al confirmarlo la activamos y la marca desaparece.
        </p>
      </Apartado>

      <Apartado titulo="Contenido que subes">
        <p>
          Las fotos, los textos y la música que subes siguen siendo tuyos. Al
          subirlos nos autorizas únicamente a alojarlos y mostrarlos dentro de
          tu página, que es lo que hace falta para que el regalo funcione. No
          los usamos para nada más ni los cedemos a terceros.
        </p>
        <p>
          Te comprometes a subir solo contenido sobre el que tengas derechos y
          que no sea ilegal ni ofensivo. Si nos consta que una página incumple
          esto, podemos retirarla.
        </p>
      </Apartado>

      <Apartado titulo="Cuánto dura tu página">
        <p>
          Una vez pagada, tu página queda alojada de forma permanente mientras
          el servicio siga en funcionamiento. Si algún día tuviéramos que
          cerrarlo, avisaríamos con antelación al correo de contacto para que
          puedas descargar tu contenido.
        </p>
        <p>
          Las páginas creadas y no pagadas son vistas previas temporales y
          pueden expirar.
        </p>
      </Apartado>

      <Apartado titulo="Reclamos">
        <p>
          Tienes a tu disposición nuestro Libro de Reclamaciones digital. Todo
          reclamo o queja se responde en un plazo máximo de{' '}
          {DIAS_PARA_RESPONDER} días hábiles, según el Código de Protección y
          Defensa del Consumidor.
        </p>
      </Apartado>
    </LegalPage>
  );
}
