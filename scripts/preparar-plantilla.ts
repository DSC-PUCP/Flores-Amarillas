import { readdir, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

const ORIGEN = 'src/modules/templates/assets/images/plantilla-1';
const DESTINO = 'SUBIR-A-SUPABASE/plantilla-1';

await mkdir(DESTINO, { recursive: true });
for (const nombre of await readdir(ORIGEN)) {
  if (!nombre.endsWith('.png')) continue;
  const salida = join(DESTINO, nombre.replace(/\.png$/, '.webp'));
  await sharp(join(ORIGEN, nombre))
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(salida);
  console.log(nombre, '->', salida);
}