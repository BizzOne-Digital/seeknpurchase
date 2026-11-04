import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const manifest = JSON.parse(await readFile('scripts/image-manifest.json', 'utf8'));
for (const { asset: [name, width, height], source } of manifest) {
  const destination = path.join('public/images', `${name}.webp`);
  await mkdir(path.dirname(destination), { recursive: true });
  let quality = 80;
  let buffer;
  do {
    buffer = await sharp(source).resize(width, height, { fit: 'cover' }).webp({ quality }).toBuffer();
    quality -= 5;
  } while (buffer.length >= 300_000 && quality >= 40);
  if (buffer.length >= 300_000) throw new Error(`Image exceeds 300KB: ${name}`);
  await writeFile(destination, buffer);
  console.log(`${destination}: ${width}x${height}, ${buffer.length} bytes`);
}
