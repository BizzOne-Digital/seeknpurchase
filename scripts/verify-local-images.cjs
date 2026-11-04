const fs = require('node:fs');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const ts = require('typescript');
require.extensions['.ts'] = (module, file) => module._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, file);

(async () => {
  const manifest = require('./image-manifest.json');
  const { normalizeImageUrl } = require('../src/lib/utils.ts');
  assert.equal(manifest.length, 36);
  assert.equal(new Set(manifest.map(({ asset }) => asset[0])).size, 36);
  for (const { asset: [name, width, height] } of manifest) {
    const url = `/images/${name}.webp`;
    const file = `public${url}`;
    const metadata = await sharp(file).metadata();
    assert.equal(metadata.format, 'webp', name);
    assert.equal(metadata.width, width, name);
    assert.equal(metadata.height, height, name);
    assert.ok(fs.statSync(file).size < 300_000, name);
    assert.equal(normalizeImageUrl(url), url, name);
  }
  const demo = require('../src/lib/demo-data.ts');
  let references = 0;
  function check(value) {
    if (typeof value === 'string' && value.startsWith('/images/')) {
      assert.ok(fs.existsSync(`public${value}`), value);
      references++;
    } else if (value && typeof value === 'object') Object.values(value).forEach(check);
  }
  check(demo);
  console.log(`Verified 36 WebP assets: dimensions, size <300KB, local URL normalization, and ${references} existing image references.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
