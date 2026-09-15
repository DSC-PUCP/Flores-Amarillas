import { describe, expect, it } from 'vitest';
import { createDirInput, isJumpKey, sideForKey } from './spring-game-input';

describe('entrada del jardin', () => {
  it('mantiene la direccion mientras el dedo siga apoyado', () => {
    const input = createDirInput();
    expect(input.dir()).toBe(0);
    input.press('right', 7);
    expect(input.dir()).toBe(1);
    expect(input.dir()).toBe(1); // sigue, nadie la borra entre frames
    input.release('right', 7);
    expect(input.dir()).toBe(0);
  });

  it('deja saltar con otro dedo sin soltar la direccion', () => {
    const input = createDirInput();
    input.press('right', 1); // un dedo sostiene ▶
    // el otro dedo toca A: el salto no pasa por aca, y la direccion no se mueve
    expect(input.dir()).toBe(1);
    input.release('right', 1);
    expect(input.dir()).toBe(0);
  });

  it('soltar un dedo no cancela al otro que pide el mismo lado', () => {
    const input = createDirInput();
    input.press('right', 1);
    input.press('right', 2);
    input.release('right', 1);
    expect(input.dir()).toBe(1);
    input.release('right', 2);
    expect(input.dir()).toBe(0);
  });

  it('con los dos lados a la vez avanza, y al soltar uno queda el otro', () => {
    const input = createDirInput();
    input.press('left', 1);
    input.press('right', 2);
    expect(input.dir()).toBe(1);
    input.release('right', 2);
    expect(input.dir()).toBe(-1);
  });

  it('mezcla teclado y dedos sin pisarse', () => {
    const input = createDirInput();
    input.press('right', 'arrowright');
    input.press('right', 3);
    input.release('right', 'arrowright'); // se suelta la tecla, el dedo sigue
    expect(input.dir()).toBe(1);
  });

  it('soltar algo que no estaba apretado no rompe nada', () => {
    const input = createDirInput();
    input.press('right', 1);
    input.release('left', 99);
    input.release('right', 42);
    expect(input.dir()).toBe(1);
  });

  it('releaseAll deja todo quieto', () => {
    const input = createDirInput();
    input.press('left', 1);
    input.press('right', 2);
    input.releaseAll();
    expect(input.dir()).toBe(0);
  });

  it('lee las teclas sin importar mayusculas', () => {
    expect(sideForKey('ArrowLeft')).toBe('left');
    expect(sideForKey('A')).toBe('left');
    expect(sideForKey('d')).toBe('right');
    expect(sideForKey('ArrowRight')).toBe('right');
    expect(sideForKey('Escape')).toBeUndefined();
    expect(isJumpKey(' ')).toBe(true);
    expect(isJumpKey('W')).toBe(true);
    expect(isJumpKey('ArrowUp')).toBe(true);
    expect(isJumpKey('x')).toBe(false);
  });
});
