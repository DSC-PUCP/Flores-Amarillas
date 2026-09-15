export type Side = 'left' | 'right';
/** Nombre de la tecla, o el pointerId del dedo que esta apoyado. */
export type InputId = string | number;

const KEY_SIDE: Record<string, Side> = {
  arrowleft: 'left',
  a: 'left',
  arrowright: 'right',
  d: 'right',
};

/** El lado que pide una tecla, sin importar mayusculas. */
export const sideForKey = (key: string): Side | undefined =>
  KEY_SIDE[key.toLowerCase()];

export const isJumpKey = (key: string) =>
  [' ', 'arrowup', 'w'].includes(key.toLowerCase());

/**
 * Lleva la cuenta de quien esta pidiendo ir a cada lado.
 *
 * Cada fuente se identifica sola -las teclas por su nombre, los dedos por su
 * pointerId- y por eso se pueden mantener dos a la vez: un dedo sostiene ▶
 * mientras el otro toca A para saltar, y soltar uno no cancela al otro. En el
 * celular no hay teclado, asi que el pad tactil tiene que bastarse solo.
 */
export function createDirInput() {
  const held: Record<Side, Set<InputId>> = {
    left: new Set(),
    right: new Set(),
  };

  return {
    press(side: Side, id: InputId) {
      held[side].add(id);
    },
    release(side: Side, id: InputId) {
      held[side].delete(id);
    },
    /** Al pausar o perder el foco no queda ningun lado apretado. */
    releaseAll() {
      held.left.clear();
      held.right.clear();
    },
    /** Si se piden los dos lados a la vez gana la derecha, que es el avance. */
    dir(): -1 | 0 | 1 {
      if (held.right.size > 0) return 1;
      if (held.left.size > 0) return -1;
      return 0;
    },
  };
}

export type DirInput = ReturnType<typeof createDirInput>;
