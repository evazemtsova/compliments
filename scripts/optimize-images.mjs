#!/usr/bin/env node
// Re-encodes PNG sources in public/pictures/ and public/emotions/ to WebP
// at a sensible max width. Deletes original PNGs after success.
//
// Run: node scripts/optimize-images.mjs

import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import sharp from 'sharp';

const TARGETS = [
  { dir: 'public/pictures', maxWidth: 800, quality: 82 },
  { dir: 'public/emotions', maxWidth: 600, quality: 85 },
];

async function processDir({ dir, maxWidth, quality }) {
  const entries = await readdir(dir);
  const pngs = entries.filter(f => extname(f).toLowerCase() === '.png');
  if (pngs.length === 0) {
    console.log(`[skip] ${dir} — no PNGs`);
    return;
  }

  let beforeBytes = 0;
  let afterBytes = 0;

  for (const file of pngs) {
    const src = join(dir, file);
    const dst = src.replace(/\.png$/i, '.webp');
    const srcStat = await stat(src);
    beforeBytes += srcStat.size;

    await sharp(src)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality })
      .toFile(dst);

    const dstStat = await stat(dst);
    afterBytes += dstStat.size;

    await unlink(src);
    console.log(
      `  ${file}: ${(srcStat.size / 1024).toFixed(0)} KB → ${(dstStat.size / 1024).toFixed(0)} KB`
    );
  }

  const saved = ((1 - afterBytes / beforeBytes) * 100).toFixed(1);
  console.log(
    `[${dir}] ${pngs.length} files: ${(beforeBytes / 1024 / 1024).toFixed(1)} MB → ${(afterBytes / 1024 / 1024).toFixed(1)} MB (−${saved}%)`
  );
}

for (const target of TARGETS) {
  console.log(`\n=== ${target.dir} (max ${target.maxWidth}px, q${target.quality}) ===`);
  await processDir(target);
}
console.log('\nDone.');
