export const FINISH = 1400;
export const OBSTACLES = [260, 520, 780, 1020, 1200];

/** Horizontal speed in game-units/s while move key is held. */
const WALK_SPEED = 85;
/** Jump initial velocity. */
const JUMP_V = 140;
/** Gravity. */
const GRAVITY = 320;
/** Height in game-units above which the player clears an obstacle. */
const CLEAR_HEIGHT = 14;
/** Width (half) of obstacle hitbox in game-units. */
const OBS_HALF = 10;

export interface GardenGame {
  x: number;
  y: number;
  velocity: number;
  elapsed: number;
  /** Seconds remaining in stumble flash. */
  stumble: number;
  passed: number[];
  won: boolean;
  /** Current horizontal intent: -1 left, 0 neutral, 1 right. */
  dir: number;
  /** Facing direction: -1 left, 1 right. */
  facing: number;
}

export const newGardenGame = (): GardenGame => ({
  x: 40,
  y: 0,
  velocity: 0,
  elapsed: 0,
  stumble: 0,
  passed: [],
  won: false,
  dir: 0,
  facing: 1,
});

export function jumpGarden(game: GardenGame) {
  if (game.y === 0 && !game.won) game.velocity = JUMP_V;
}

export function setDir(game: GardenGame, dir: -1 | 0 | 1) {
  game.dir = dir;
  if (dir !== 0) {
    game.facing = dir;
  }
}

export function stepGarden(game: GardenGame, delta: number) {
  if (game.won) return;
  const dt = Math.min(delta, 0.05);
  game.elapsed += dt;
  game.stumble = Math.max(0, game.stumble - dt);

  // Horizontal movement - ONLY moves when a direction key/button is held
  let speed = 0;
  if (game.dir === 1) {
    speed = WALK_SPEED + (game.stumble > 0 ? -30 : 0);
  } else if (game.dir === -1) {
    speed = -(WALK_SPEED + (game.stumble > 0 ? -30 : 0));
  }
  const nextX = Math.max(10, game.x + speed * dt);

  // Vertical
  game.y = Math.max(0, game.y + game.velocity * dt);
  game.velocity = game.y > 0 ? game.velocity - GRAVITY * dt : 0;

  // Collision: block forward movement if hitting an obstacle and not cleared it
  let blocked = false;
  for (const obstacle of OBSTACLES) {
    const inRange =
      nextX + OBS_HALF > obstacle - OBS_HALF &&
      nextX - OBS_HALF < obstacle + OBS_HALF;
    if (inRange && !game.passed.includes(obstacle)) {
      if (game.y < CLEAR_HEIGHT) {
        // Collision — stop at the obstacle edge
        blocked = true;
        game.stumble = 0.6;
      } else {
        // Cleared by jumping
        game.passed.push(obstacle);
      }
    }
    // Mark as passed once fully over
    if (game.x > obstacle + OBS_HALF && !game.passed.includes(obstacle)) {
      game.passed.push(obstacle);
    }
  }

  if (!blocked) {
    game.x = nextX;
  }

  if (game.x >= FINISH) {
    game.x = FINISH;
    game.y = 0;
    game.velocity = 0;
    game.won = true;
    game.facing = 1;
  }
}
