import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Copia un texto al portapapeles, con respaldo.
 *
 * `navigator.clipboard` necesita contexto seguro y permiso, y no siempre los
 * hay: un WebView, un navegador viejo, o alguien que abrio el enlace por http.
 * Copiar el enlace del regalo es justo lo que no puede fallar, asi que si el
 * camino bueno se cae se prueba el de siempre.
 */
export async function copiarAlPortapapeles(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Sigue el respaldo.
  }
  try {
    const area = document.createElement('textarea');
    area.value = texto;
    // Fuera de la vista pero enfocable: un textarea con `display: none` no se
    // puede seleccionar, y sin seleccion no hay nada que copiar.
    area.setAttribute('aria-hidden', 'true');
    area.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
    document.body.appendChild(area);
    area.select();
    const bien = document.execCommand('copy');
    area.remove();
    return bien;
  } catch {
    return false;
  }
}

/**
 * Boton que copia un texto y lo dice.
 *
 * Lo comparten el numero de Yape, el enlace del regalo en el aviso de pago y
 * el paso de "guarda tu enlace" al generarlo: todos necesitan lo mismo
 * —copiar, avisar de que se copio y volver solos a su estado—, y tener ese
 * estado repetido en cada sitio era pedir que se desincronizaran.
 */
export function BotonCopiar({
  texto,
  etiqueta,
  className,
  variant = 'outline',
}: {
  /** Lo que va al portapapeles. */
  texto: string;
  /** Lo que se lee en el boton mientras no se ha copiado. */
  etiqueta: string;
  className?: string;
  variant?: 'outline' | 'default';
}) {
  const [copiado, setCopiado] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      onClick={async () => {
        if (!(await copiarAlPortapapeles(texto))) return;
        setCopiado(true);
        window.setTimeout(() => setCopiado(false), 2000);
      }}
      className={className}
    >
      {copiado ? (
        <Check className="mr-2 size-4 shrink-0" />
      ) : (
        <Copy className="mr-2 size-4 shrink-0" />
      )}
      {copiado ? '¡Copiado!' : etiqueta}
    </Button>
  );
}
