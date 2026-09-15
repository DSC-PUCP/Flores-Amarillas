import type { GardenArt } from './spring-game-art';
import { FINISH, type GardenGame, OBSTACLES } from './spring-game-engine';

export function drawGarden(
  ctx: CanvasRenderingContext2D,
  game: GardenGame,
  time: number,
  reduced: boolean,
  art: GardenArt,
  moving: boolean
) {
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const camera = Math.max(0, Math.min(game.x - 65, FINISH - 195));
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), w, h);
  };
  const backdropWidth = (180 * art.background.width) / art.background.height;
  ctx.drawImage(
    art.background,
    -(camera / (FINISH - 195)) * (backdropWidth - 320),
    0,
    backdropWidth,
    180
  );

  const flower = (x: number, y: number, size: number) => {
    rect(x, y, 1, size + 4, '#537342');
    rect(x - 2, y + 3, 3, 1, '#668b49');
    rect(x - size / 2, y - 1, size, 3, '#b5832f');
    rect(x - size / 2, y - 2, size, 2, '#ffcf4d');
    rect(x - 1, y - size / 2, 3, size, '#f3c24a');
    rect(x, y, 1, 1, '#674b2f');
  };

  // Foreground scrolls faster than the distant garden to give the walk depth.
  for (let i = 0; i < 130; i++) {
    const x = i * 17 - camera;
    if (x > -12 && x < 330) {
      const y = 163 + (i % 4) * 3;
      flower(x, y, 4 + (i % 3));
      rect(x + 7, y + 5, 3, 1, '#9e874e');
    }
  }

  // Draw obstacles — troncos with visible solid hitbox
  for (const obstacle of OBSTACLES) {
    const x = obstacle - camera;
    const cleared = game.passed.includes(obstacle);
    const flash =
      game.stumble > 0 && !cleared && Math.floor(time * 14) % 2 === 0;
    // Shadow
    rect(x - 9, 142, 24, 3, '#72572f55');
    // Log body
    rect(x - 8, 134, 20, 9, flash ? '#9b3a1a' : '#66482e');
    rect(x - 7, 133, 18, 7, flash ? '#c84820' : '#a57743');
    rect(x - 7, 133, 18, 2, flash ? '#e06030' : '#c29456');
    rect(x - 5, 137, 12, 1, '#6c4d2e');
    // Stump side
    rect(x + 7, 134, 6, 8, '#dab078');
    rect(x + 8, 136, 3, 4, '#805731');
    rect(x + 9, 137, 1, 2, '#d1a16a');
    // Leaves
    rect(x - 3, 130, 2, 4, '#69894b');
    rect(x - 1, 129, 4, 2, '#8da35a');
    // Cleared tick
    if (cleared) {
      rect(x - 1, 126, 4, 1, '#ffe044');
      rect(x, 127, 2, 1, '#ffe044');
    }
  }

  // Butterflies
  for (let i = 0; i < 6; i++) {
    const x = (((i * 61 - camera * 0.35 + 350) % 350) + 350) % 350;
    const y = 42 + (i % 3) * 14 + (reduced ? 0 : Math.sin(time * 2 + i) * 5);
    const wing = reduced
      ? 3
      : 1 + Math.round(Math.abs(Math.sin(time * 8 + i)) * 3);
    rect(x, y, 1, 4, '#755334');
    rect(x - wing, y - 1, wing, 3, '#f9d37c');
    rect(x + 1, y - 1, wing, 3, '#f9d37c');
  }

  const girlX = FINISH + 43 - camera;
  // A flower-covered trellis marks the meeting place.
  for (const x of [girlX - 28, girlX + 28]) {
    rect(x, 76, 3, 68, '#755736');
    rect(x, 76, 1, 68, '#c2a275');
    for (let y = 83; y < 140; y += 13) flower(x, y, 5);
  }
  rect(girlX - 29, 76, 61, 4, '#987d51');
  for (let x = girlX - 25; x < girlX + 30; x += 8)
    flower(x, 75 + Math.abs(x - girlX) / 12, 5);

  const pose = (
    sprite: HTMLCanvasElement,
    center: number,
    feet: number,
    height: number,
    flip = false
  ) => {
    const width = (height * sprite.width) / sprite.height;
    ctx.save();
    ctx.translate(Math.round(center), Math.round(feet));
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(
      sprite,
      Math.round(-width / 2),
      -height,
      Math.round(width),
      height
    );
    ctx.restore();
  };

  const celebration = game.won && !reduced;
  const hop = celebration ? Math.max(0, Math.sin(time * 7)) * 10 : 0;
  const girlFrame = game.won
    ? celebration && Math.sin(time * 7) > 0.2
      ? 2
      : 1
    : 0;
  const isWalking = (game.dir !== 0 || game.won) && moving;
  const boyFrame =
    game.y > 0
      ? 2
      : isWalking && !reduced
        ? Math.floor(game.elapsed * 9) % 2
        : 0;

  rect(girlX - 12, 143, 24, 2, '#4d452a44');
  rect(game.x - camera - 11, 143, 22, 2, '#4d452a44');
  pose(art.girl[girlFrame], girlX, 144 - hop, 54, false);
  pose(
    art.boy[boyFrame],
    game.x - camera,
    144 - game.y,
    55,
    game.facing === -1
  );

  if (game.won) {
    // The offered bouquet bridges the two characters during their celebration.
    for (let i = 0; i < 3; i++)
      flower(girlX - 23 + i * 3, 121 - (i % 2) * 3, 5);
    for (let i = 0; i < 10; i++) {
      const x = girlX - 64 + i * 10;
      const y = 82 - ((time * (reduced ? 0 : 13) + i * 11) % 54);
      rect(x, y, 3, 3, '#d87581');
      rect(x + 4, y, 3, 3, '#d87581');
      rect(x + 1, y + 3, 5, 2, '#d87581');
      rect(x + 2, y + 5, 3, 2, '#d87581');
      rect(x + 3, y + 7, 1, 1, '#d87581');
    }
  }
}
