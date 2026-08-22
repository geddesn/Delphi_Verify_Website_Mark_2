#!/usr/bin/env node
/* ============================================================================
   GRID SLICER
   ============================================================================
   One generation, many images. Runway bills per render, so a set that has to
   look like a set — same surface, same light, same lens — is cheaper AND more
   consistent as a single gridded frame than as N separate calls that each
   reinterpret the brief.

   Cuts a master into its cells and writes each one as its own master, ready
   for `npm run images`.

   Run:  node scripts/slice-grid.mjs --in <master.png> --cols 3 --rows 2 \
           --names device,application,capture,time,location,integrity \
           --prefix signal- --crop 16:9

   Names are given in READING ORDER — left to right, then down — which is the
   order the prompt file numbers the cells in. Get them out of order and the
   labels on the page describe the wrong pictures, which nothing downstream
   can catch.

   --crop takes a centre band out of each cell. A grid generated at one aspect
   ratio rarely divides into cells of the aspect ratio the page wants, and
   cropping here rather than in CSS means the discarded pixels never ship.
   ========================================================================= */

import sharp from "sharp";
import { existsSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const argv = process.argv.slice(2);
const arg = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i === -1 ? fallback : argv[i + 1];
};

const input = arg("--in");
const cols = Number(arg("--cols", 3));
const rows = Number(arg("--rows", 2));
const names = (arg("--names") ?? "").split(",").filter(Boolean);
const prefix = arg("--prefix", "");
const crop = arg("--crop");
const outDir = resolve(process.cwd(), arg("--out", dirname(input ?? ".")));

if (!input || names.length === 0) {
  console.error(
    "Usage: node scripts/slice-grid.mjs --in <master.png> --names a,b,c\n" +
      "       [--cols 3] [--rows 2] [--prefix signal-] [--crop 16:9] [--out dir]",
  );
  process.exit(1);
}
if (!existsSync(input)) {
  console.error(`✗ not found: ${input}`);
  process.exit(1);
}
if (names.length !== cols * rows) {
  console.error(
    `✗ ${names.length} names for ${cols}x${rows} = ${cols * rows} cells.\n` +
      "  Every cell needs a name, in reading order.",
  );
  process.exit(1);
}

const meta = await sharp(input).metadata();
/* Floor, then take the remainder off the last cell rather than letting a
   rounding error walk a seam into the next picture. */
const cellW = Math.floor(meta.width / cols);
const cellH = Math.floor(meta.height / rows);

let band = { w: cellW, h: cellH };
if (crop) {
  const [cw, ch] = crop.split(":").map(Number);
  const wanted = Math.round((cellW * ch) / cw);
  band = wanted <= cellH ? { w: cellW, h: wanted } : { w: Math.round((cellH * cw) / ch), h: cellH };
}
const offsetX = Math.round((cellW - band.w) / 2);
const offsetY = Math.round((cellH - band.h) / 2);

mkdirSync(outDir, { recursive: true });

for (let i = 0; i < names.length; i++) {
  const col = i % cols;
  const row = Math.floor(i / cols);
  const outPath = join(outDir, `${prefix}${names[i]}.png`);

  await sharp(input)
    .extract({
      left: col * cellW + offsetX,
      top: row * cellH + offsetY,
      width: band.w,
      height: band.h,
    })
    .png()
    .toFile(outPath);

  console.log(`  ✓ ${prefix}${names[i]}.png   ${band.w}x${band.h}  (r${row + 1}c${col + 1})`);
}

console.log(
  `\n✓ ${names.length} cells from ${meta.width}x${meta.height} ` +
    `(${cellW}x${cellH} each${crop ? `, cropped to ${crop}` : ""})`,
);
