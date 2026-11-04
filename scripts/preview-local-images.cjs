const fs = require('node:fs');
const sharp = require('sharp');
const manifest = require('./image-manifest.json');
(async () => {
  const columns = 6, tileWidth = 240, tileHeight = 190;
  const tiles = await Promise.all(manifest.map(async ({ asset: [name] }, index) => {
    const image = await sharp(`public/images/${name}.webp`).resize(240, 160, { fit: 'contain', background: '#F8F5EF' }).png().toBuffer();
    const title = name.split('/').pop();
    const label = Buffer.from(`<svg width="240" height="30"><rect width="240" height="30" fill="#F8F5EF"/><text x="5" y="18" font-size="9" fill="#172333">${title}</text></svg>`);
    return [
      { input: image, left: index % columns * tileWidth, top: Math.floor(index / columns) * tileHeight },
      { input: label, left: index % columns * tileWidth, top: Math.floor(index / columns) * tileHeight + 160 },
    ];
  }));
  fs.mkdirSync('tmp/imagegen', { recursive: true });
  await sharp({ create: { width: columns * tileWidth, height: Math.ceil(manifest.length / columns) * tileHeight, channels: 3, background: '#F8F5EF' } }).composite(tiles.flat()).jpeg({ quality: 85 }).toFile('tmp/imagegen/contact-sheet.jpg');
})().catch((error) => { console.error(error); process.exitCode = 1; });
