import { expect, it } from 'vitest';
import {
  FINISH,
  jumpGarden,
  newGardenGame,
  OBSTACLES,
  setDir,
  stepGarden,
} from './spring-game-engine';

const FRAME = 1 / 60;

/**
 * Camina hacia la derecha hasta `target`, con tope de frames. El tope importa:
 * el jugador mide OBS_HALF de ancho, asi que se frena unos 20 puntos antes del
 * obstaculo. Pedir un `target` mas cerca que eso colgaba la suite para siempre.
 */
function walkUntil(game: ReturnType<typeof newGardenGame>, target: number) {
  for (let f = 0; game.x < target && !game.won; f++) {
    if (f > 5000)
      throw new Error(`El jugador se quedo atascado en x=${game.x}`);
    stepGarden(game, FRAME);
  }
}

/** Run until won or maxFrames elapsed; returns the game state. */
function runUntilWon(
  maxFrames: number,
  onFrame?: (game: ReturnType<typeof newGardenGame>) => void
) {
  const game = newGardenGame();
  setDir(game, 1);
  for (let f = 0; f < maxFrames && !game.won; f++) {
    onFrame?.(game);
    stepGarden(game, FRAME);
  }
  return game;
}

it('does not move automatically when dir is 0', () => {
  const game = newGardenGame();
  for (let i = 0; i < 60; i++) stepGarden(game, FRAME);
  expect(game.x).toBe(40);
});

it('tracks facing direction when moving left and right', () => {
  const game = newGardenGame();
  expect(game.facing).toBe(1);
  setDir(game, -1);
  expect(game.facing).toBe(-1);
  setDir(game, 0);
  expect(game.facing).toBe(-1);
  setDir(game, 1);
  expect(game.facing).toBe(1);
});

it('finishes quickly with increased speed when player holds right and jumps each obstacle', () => {
  const game = runUntilWon(60 * 60, (g) => {
    // Jump when approaching an obstacle
    for (const obs of OBSTACLES) {
      const dist = obs - g.x;
      if (dist > 5 && dist < 30 && g.y === 0) jumpGarden(g);
    }
  });
  expect(game.won).toBe(true);
  expect(game.x).toBe(FINISH);
  expect(game.facing).toBe(1);
});

it('collision blocks player when not jumping', () => {
  const game = newGardenGame();
  setDir(game, 1);
  const obs = OBSTACLES[0];
  walkUntil(game, obs - 25);
  const xAtApproach = game.x;
  for (let i = 0; i < 60; i++) stepGarden(game, FRAME);
  expect(game.x).toBeLessThan(obs + 15);
  expect(game.x).toBeGreaterThan(xAtApproach - 1);
});

it('jumping clears an obstacle and allows progression', () => {
  const game = newGardenGame();
  setDir(game, 1);
  const obs = OBSTACLES[0];
  walkUntil(game, obs - 25);
  jumpGarden(game);
  for (let i = 0; i < 40; i++) stepGarden(game, FRAME);
  expect(game.x).toBeGreaterThan(obs);
});

it('prevents double jumps and freezes the completed level', () => {
  const game = newGardenGame();
  jumpGarden(game);
  stepGarden(game, FRAME);
  const velocity = game.velocity;
  jumpGarden(game);
  expect(game.velocity).toBe(velocity);
  game.won = true;
  const snapshot = { ...game };
  stepGarden(game, 1);
  expect(game).toEqual(snapshot);
});

it('moving left decreases x and moving right increases x', () => {
  const game = newGardenGame();
  setDir(game, 1);
  for (let i = 0; i < 30; i++) stepGarden(game, FRAME);
  const xAfterRight = game.x;
  expect(xAfterRight).toBeGreaterThan(40);

  setDir(game, -1);
  for (let i = 0; i < 30; i++) stepGarden(game, FRAME);
  expect(game.x).toBeLessThan(xAfterRight);
});

it('all obstacles are included in OBSTACLES array', () => {
  expect(OBSTACLES.length).toBe(5);
  expect(OBSTACLES.every((x) => x < FINISH)).toBe(true);
});
