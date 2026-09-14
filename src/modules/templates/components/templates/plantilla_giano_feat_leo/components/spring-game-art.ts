export interface GardenArt {
  background: HTMLImageElement;
  boy: HTMLCanvasElement[];
  girl: HTMLCanvasElement[];
}

const image = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const asset = new Image();
    asset.onload = () => resolve(asset);
    asset.onerror = () => reject(new Error('No se pudo cargar el jardín.'));
    asset.src = src;
  });

/** Select only the requested poses; remove the sheet's border-connected white
 * at decode time, retaining the white shirt details inside each character. */
function frame(
  source: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Tu navegador no pudo preparar los personajes.');
  ctx.drawImage(source, x, y, width, height, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height);
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];
  const enqueue = (i: number) => {
    if (visited[i]) return;
    visited[i] = 1;
    const p = i * 4;
    if (
      pixels.data[p] > 225 &&
      pixels.data[p + 1] > 225 &&
      pixels.data[p + 2] > 225
    )
      queue.push(i);
  };
  for (let i = 0; i < width; i++) {
    enqueue(i);
    enqueue((height - 1) * width + i);
  }
  for (let i = 0; i < height; i++) {
    enqueue(i * width);
    enqueue(i * width + width - 1);
  }
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const i = queue[cursor];
    pixels.data[i * 4 + 3] = 0;
    if (i % width > 0) enqueue(i - 1);
    if (i % width < width - 1) enqueue(i + 1);
    if (i >= width) enqueue(i - width);
    if (i < width * (height - 1)) enqueue(i + width);
  }
  ctx.putImageData(pixels, 0, 0);
  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  for (let iy = 0; iy < height; iy++)
    for (let ix = 0; ix < width; ix++) {
      if (pixels.data[(iy * width + ix) * 4 + 3]) {
        left = Math.min(left, ix);
        right = Math.max(right, ix);
        top = Math.min(top, iy);
        bottom = Math.max(bottom, iy);
      }
    }
  const trimmed = document.createElement('canvas');
  trimmed.width = right - left + 1;
  trimmed.height = bottom - top + 1;
  trimmed
    .getContext('2d')
    ?.drawImage(
      canvas,
      left,
      top,
      trimmed.width,
      trimmed.height,
      0,
      0,
      trimmed.width,
      trimmed.height
    );
  return trimmed;
}

let artPromise: Promise<GardenArt> | undefined;
export function loadGardenArt() {
  artPromise ??= Promise.all([
    image('/images/spring/game-garden.png'),
    image('/images/spring/game-boy-sheet.jpg'),
    image('/images/spring/game-girl-sheet.jpg'),
  ])
    .then(([background, boy, girl]) => ({
      background,
      boy: [
        frame(boy, 0, 0, 341, 512),
        frame(boy, 341, 0, 342, 512),
        frame(boy, 341, 512, 342, 512),
      ],
      girl: [
        frame(girl, 0, 512, 341, 512),
        frame(girl, 341, 0, 342, 512),
        frame(girl, 683, 0, 341, 512),
      ],
    }))
    .catch((error: unknown) => {
      artPromise = undefined;
      throw error;
    });
  return artPromise;
}
