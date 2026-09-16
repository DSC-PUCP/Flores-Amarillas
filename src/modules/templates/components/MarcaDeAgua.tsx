/**
 * Marca de agua de "Vista Previa" para el regalo sin pagar.
 *
 * Nacio dentro de `plantilla_luis_arce` y vivia solo ahi. Ahora la pone
 * `TemplateRenderer` para todas por igual, que es lo unico que evita tener el
 * mismo bloque repetido en cada plantilla y olvidarlo en la siguiente.
 *
 * Va `fixed` y no `absolute` como la original: aquella se apoyaba en que su
 * plantilla ocupa exactamente una pantalla. Las demas hacen scroll, y una capa
 * absoluta se quedaria arriba mientras el regalo sigue bajando, que es justo
 * la parte que no queremos regalar sin cobrar.
 */
interface MarcaDeAguaProps {
  /** Lo que se repite en diagonal. */
  texto?: string;
}

/**
 * Suficientes para cubrir una pantalla grande girada 45 grados. Mas filas no
 * se ven y solo cuestan nodos.
 */
const FILAS = 10;
const POR_FILA = 10;

export function MarcaDeAgua({ texto = 'Vista Previa' }: MarcaDeAguaProps) {
  return (
    <div
      aria-hidden="true"
      data-marca-de-agua=""
      /*
       * `mix-blend-difference` en vez de un color fijo.
       *
       * La original era azul marino, que se leia perfecto sobre el amarillo
       * palido de su plantilla y desaparecia sobre el jardin 3D de noche
       * —comprobado—. Con difference, el texto se invierte respecto a lo que
       * tenga debajo: sale gris sobre el papel crema y claro sobre el verde
       * oscuro, sin que ninguna plantilla tenga que configurar nada.
       */
      className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center overflow-hidden opacity-35 mix-blend-difference"
    >
      <div className="flex -rotate-45 scale-150 flex-col gap-24">
        {Array.from({ length: FILAS }).map((_, fila) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rejilla fija, no se reordena
            key={fila}
            className="flex gap-24 whitespace-nowrap"
          >
            {Array.from({ length: POR_FILA }).map((_, columna) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: rejilla fija, no se reordena
                key={columna}
                // Blanco puro: es lo que `difference` necesita para invertir
                // limpio. El color final lo decide el fondo, no esta clase.
                className="text-6xl font-black tracking-widest text-white uppercase md:text-8xl"
              >
                {texto}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
