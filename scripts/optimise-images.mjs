#!/usr/bin/env node
/* ============================================================================
   IMAGE PIPELINE
   ============================================================================
   Converts image masters to responsive WebP and writes them into public/.

   Two groups, because they have genuinely different needs:

   • product    — iOS screenshots, 1350×2760 PNGs at 1.3–3.4 MB. Sourced from
                  OneDrive, outside the repo. Transparent phone frames with a
                  soft drop shadow, so alpha must be preserved.

   • industries — generated scene photography, 2720×1530. Sourced from
                  assets-src/ inside the repo. Opaque, landscape, rendered far
                  wider than a phone mock, so it needs its own width pair.

   Run:  npm run images
   Re-run whenever a master is refreshed or added.

   Deliberately NOT part of `npm run build`: the product masters live on a path
   that only exists on one machine. The generated WebP is committed instead, so
   the build never depends on OneDrive being present. A missing source group
   warns and is skipped rather than failing the run — adding an industry image
   must not require the product screenshots to be reachable.
   ========================================================================= */

import sharp from "sharp";
import { readdirSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const GROUPS = [
  {
    /* Wide feature images that carry callout panels. Rendered full-bleed
       across a section, so they need more width than the industry cards and
       are never centre-cropped to a square. */
    name: "features",
    src: join(process.cwd(), "assets-src", "features"),
    out: join(process.cwd(), "public", "assets", "features"),
    /* 480 exists for the phone case: the figure renders ~270px wide in a
       stacked card, so without it a mobile visitor downloaded the 960. */
    widths: [480, 960, 1920],
    webp: { quality: 80, effort: 6 },
    sources: [
      { file: "yacht-handover.png", name: "yacht-handover" },
      { file: "villa-listing.png", name: "villa-listing" },
    ],
  },
  {
    name: "product",
    src:
      process.env.DV_ASSETS ??
      "C:/Users/nick_/OneDrive/03 Companies/Delphi Verify/Assets",
    out: join(process.cwd(), "public", "assets", "product"),
    /* A phone mock renders at roughly 260–340 CSS px, so 1x ≈ 340, 2x ≈ 680.
       Anything larger is wasted bytes on an image nobody zooms into. */
    widths: [340, 680],
    webp: { quality: 82, effort: 6, alphaQuality: 90 },
    sources: [
      { file: "screenshots_capture.png", name: "capture" },
      { file: "screenshots_certificate.png", name: "certificate" },
      {
        file: "screenshots_certificate-location.png",
        name: "certificate-location",
      },
      { file: "screenshots_scan.png", name: "scan" },
      { file: "screenshots_packs.png", name: "packs" },
    ],
  },
  {
    name: "industries",
    src: join(process.cwd(), "assets-src", "industries"),
    out: join(process.cwd(), "public", "assets", "industries"),
    /* The panel renders at roughly 500 CSS px on a wide screen, so 1x ≈ 560
       and 2x ≈ 1120. Eight of these eventually load on one page, so the
       ceiling stays low on purpose. */
    widths: [560, 1120],
    /* Opaque photographs — no alpha to preserve, and quality drops a little
       further than the screenshots because photographic noise hides it. */
    webp: { quality: 78, effort: 6 },
    /* Versions are explicit. Rejected takes stay in assets-src as a record of
       what was tried and must not be picked up by a directory scan. */
    sources: [
      { file: "property-sales-v5.png", name: "property-sales" },
      { file: "rentals-v2.png", name: "rentals" },
      { file: "construction-v3.png", name: "construction" },
      { file: "insurance-v1.png", name: "insurance" },
      { file: "yachts-marine-v1.png", name: "yachts-marine" },
      { file: "automotive-v1.png", name: "automotive" },
      { file: "industrial-v1.png", name: "industrial" },
      { file: "logistics-v1.png", name: "logistics" },
      { file: "defence-v1.png", name: "defence" },
    ],
  },
  {
    /* Backdrops for the industries hero — the same sectors with the people
       taken out, cycled behind the headline and masked away before they reach
       the text. They sit at low opacity on the inverted section, so softness
       matters far less than it would in the cards. */
    name: "backdrops",
    src: join(process.cwd(), "assets-src", "backdrops"),
    out: join(process.cwd(), "public", "assets", "backdrops"),
    /* `withoutEnlargement` means an undersized master simply yields two files
       at its native width rather than an upscaled blur — the townhouse test
       image is only 736px wide, so it does exactly that. Real backdrops should
       be generated at 2720×1530 like the card photography. */
    widths: [720, 1440],
    webp: { quality: 76, effort: 6 },
    sources: [
      { file: "townhouse.png", name: "townhouse" },
      { file: "yacht-v1.png", name: "yacht" },
      { file: "construction-v1.png", name: "construction" },
      { file: "villa-v1.png", name: "villa" },
      { file: "jet-v1.png", name: "jet" },
      { file: "gulf-villa-v1.png", name: "gulf-villa" },
    ],
  },
  {
    /* Founder portraits. Displayed at about 180 CSS px, so 1x ≈ 180 and
       2x ≈ 360. Tess's master is only 346px wide, so `withoutEnlargement`
       caps her 2x at native rather than upscaling — acceptable at this size,
       but a larger original would be better if one exists. */
    name: "team",
    src: join(process.cwd(), "assets-src", "team"),
    out: join(process.cwd(), "public", "assets", "team"),
    widths: [180, 360],
    webp: { quality: 82, effort: 6 },
    sources: [
      { file: "tess.png", name: "tess" },
      { file: "nick.jpg", name: "nick" },
    ],
  },
];

let written = 0;
let savedBytes = 0;

for (const group of GROUPS) {
  console.log(`\n${group.name}`);

  if (!existsSync(group.src)) {
    console.warn(`  ⚠ source folder not found, skipped: ${group.src}`);
    continue;
  }

  mkdirSync(group.out, { recursive: true });
  const available = new Set(readdirSync(group.src));

  for (const { file, name } of group.sources) {
    if (!available.has(file)) {
      console.warn(`  ⚠ missing, skipped: ${file}`);
      continue;
    }

    const srcPath = join(group.src, file);
    const srcSize = statSync(srcPath).size;
    const meta = await sharp(srcPath).metadata();

    for (const w of group.widths) {
      const outName = `${name}-${w}.webp`;
      const outPath = join(group.out, outName);

      await sharp(srcPath)
        .resize({ width: w, withoutEnlargement: true })
        .webp(group.webp)
        .toFile(outPath);

      const outSize = statSync(outPath).size;
      written++;
      if (w === group.widths.at(-1)) savedBytes += srcSize - outSize;

      console.log(
        `  ✓ ${outName.padEnd(32)} ${String(w).padStart(4)}px  ${(outSize / 1024).toFixed(0).padStart(4)} kB`,
      );
    }

    console.log(
      `    from ${file} (${meta.width}×${meta.height}, ${(srcSize / 1024 / 1024).toFixed(1)} MB)`,
    );
  }
}

console.log(
  `\n✓ Wrote ${written} images — ` +
    `${(savedBytes / 1024 / 1024).toFixed(1)} MB saved vs the source masters`,
);
