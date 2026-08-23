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
       stacked card, so without it a mobile visitor downloaded the 960.

       240 is for the jump tiles at the top of the industries page, which show
       the SAME picture as the card they jump to, about 130 CSS px wide behind
       the label. Served flat with no srcSet — behind a mask that has already
       dissolved most of it, softness at 2x is invisible. */
    widths: [240, 480, 960, 1920],
    webp: { quality: 80, effort: 6 },
    sources: [
      { file: "yacht-handover.png", name: "yacht-handover" },
      /* Transparent. The trust stage sits it on a dark ground with nothing
         behind it, so the master must carry a real alpha channel — sharp
         preserves it into WebP, but it cannot invent one. */
      { file: "yacht-cutout.png", name: "yacht-cutout" },
      /* The pair the trust engine argues over: one saloon, one angle, two
         dates. They must stay a matched pair — the whole argument is that
         nothing changed except the damage, so a reshoot means reshooting
         BOTH. Shown small, inside callout and certificate boxes, so 240/480
         are the sizes that actually get served; PanelImage's srcSet does not
         reference the larger two at all.

         These masters are 882×496, well under the 960 and 1920 tiers, so
         withoutEnlargement writes those two at 882 rather than upscaling.
         Same bytes under three names — harmless, and cheaper than special-
         casing the group's widths for one pair.

         Supersedes saloon-delivery/-redelivery.png, a lower-grade interior
         at a taller crop, which in turn superseded the lone saloon-damage.png
         detail shot. Every master and prompt stays in assets-src as a record
         of the take; only the current pair is converted. */
      { file: "yacht-saloon-delivery.png", name: "yacht-saloon-delivery" },
      { file: "yacht-saloon-redelivery.png", name: "yacht-saloon-redelivery" },
      /* The rest of the condition survey Act Two opens with. Seven rooms that
         are never argued about — which is the point of them: they are there to
         show that the record was an ordinary walk round the vessel, made
         before anybody had a reason to want one.

         Only 240 and 480 are ever served. They appear at about 200px on the
         survey card and 62px in the filed pile, and nothing on the stage ever
         opens one larger. */
      { file: "yacht-flybridge.png", name: "yacht-flybridge" },
      { file: "yacht-bar.png", name: "yacht-bar" },
      { file: "yacht-aft-deck.png", name: "yacht-aft-deck" },
      { file: "yacht-tender-garage.png", name: "yacht-tender-garage" },
      { file: "yacht-dining.png", name: "yacht-dining" },
      { file: "yacht-master-cabin.png", name: "yacht-master-cabin" },
      { file: "yacht-master-ensuite.png", name: "yacht-master-ensuite" },
      { file: "villa-listing.png", name: "villa-listing" },
      { file: "villa-checkout.png", name: "villa-checkout" },
      { file: "construction-milestone.png", name: "construction-milestone" },
      { file: "claim-inspection.png", name: "claim-inspection" },
      { file: "vehicle-handover.png", name: "vehicle-handover" },
      { file: "asset-inspection.png", name: "asset-inspection" },
      { file: "consignment-handover.png", name: "consignment-handover" },
      { file: "equipment-return.png", name: "equipment-return" },

      /* ── Property Rentals ──
         The same nine-cell arrangement as the yacht set and for the same
         reason: the trust engine's second act ends by opening two frames of
         one room side by side, so those two have to be ONE PHOTOGRAPH TAKEN
         TWICE — same camera, same light, only the damage different. A pair
         generated separately never matches, so all nine come out of a single
         3x3 render and are split. See rental-grid.prompt.txt.

         Deliberately NOT the cadogan-* set under public/assets/captures.
         Those nine are the evidence record on /platform/renderings and are
         staying as they are; these are the same house photographed for a
         different purpose, and the pair is the purpose. */
      { file: "rental-front-elevation.png", name: "rental-front-elevation" },
      { file: "rental-entrance-hall.png", name: "rental-entrance-hall" },
      { file: "rental-kitchen.png", name: "rental-kitchen" },
      { file: "rental-bedroom.png", name: "rental-bedroom" },
      { file: "rental-bathroom.png", name: "rental-bathroom" },
      { file: "rental-study.png", name: "rental-study" },
      { file: "rental-garden.png", name: "rental-garden" },
      /* The matched pair. Reshoot one and you reshoot both — see the note on
         the yacht saloon pair above, which this follows exactly. */
      { file: "rental-reception-checkin.png", name: "rental-reception-checkin" },
      { file: "rental-reception-checkout.png", name: "rental-reception-checkout" },
      /* ── Development & Construction ──
         One island photographed at six moments of its own build: plot,
         foundations, structure, roof, fit-out, handover. The trust stage will
         dissolve between them where the yacht and the townhouse simply stand,
         so unlike every other asset here these six are a SEQUENCE and have to
         stay registered — the villa cannot drift between one stage and the
         next.

         Split from one 2x3 render. Cut at the WAIST between islands rather
         than at the exact third, because the six are packed tightly enough to
         interlock, and each cell then keeps only its largest connected mass
         so no sliver of a neighbour survives. Every stage is the same 768x341
         window taken at the same offset inside its own cell, which is what
         holds them in register. See build-stages.source.txt.

         Transparent, like the yacht: these stand on the bare stage. */
      { file: "build-1-plot.png", name: "build-1-plot" },
      { file: "build-2-foundations.png", name: "build-2-foundations" },
      { file: "build-3-structure.png", name: "build-3-structure" },
      { file: "build-4-roof.png", name: "build-4-roof" },
      { file: "build-5-fitout.png", name: "build-5-fitout" },
      { file: "build-6-handover.png", name: "build-6-handover" },

      /* ── The concealed works ──
         The four things a buyer can see for about a week and then never
         again: waterproofing, pipework, electrical, structural. Act One shows
         them being covered; Act Two shows them being recorded first. Same
         build in both — what differs is only whether anything was captured.

         ⚠️  conceal-waterproofing and conceal-waterproofing-covered ARE A
         MATCHED PAIR and the stage dissolves one into the other. Same
         bathroom, same camera, same corners, same drain — the membrane simply
         disappears under the stone. Reshoot one and you reshoot both; a pair
         of different rooms proves nothing, which is the same rule the yacht
         saloon pair follows.

         conceal-wall-covered came back as a plain finished wall with nothing
         tying it to the pipework frame, so it is NOT a second pair. Kept as a
         generic finished surface; the bathroom does the concealment beat. */
      { file: "conceal-waterproofing.png", name: "conceal-waterproofing" },
      { file: "conceal-pipework.png", name: "conceal-pipework" },
      { file: "conceal-electrical.png", name: "conceal-electrical" },
      { file: "conceal-structural.png", name: "conceal-structural" },
      { file: "conceal-waterproofing-covered.png", name: "conceal-waterproofing-covered" },
      { file: "conceal-wall-covered.png", name: "conceal-wall-covered" },

      /* PLACEHOLDER, and named for the slot rather than the picture so that
         replacing it is a file drop and nothing else. Nick is supplying a
         proper cut-out; until then this is the intro townhouse photograph,
         which is opaque and rectangular where the stage wants an alpha
         cut-out. Its master is 736px, so the 960 and 1920 tiers write 736 —
         it renders at ~291 design px, half that, so nothing is soft. */
      { file: "rental-asset.png", name: "rental-asset" },
    ],
  },
  {
    /* The six core-signal images. Their own group because their own widths:
       they render at about 320 CSS px in a three-across row on /platform and
       nothing on the site ever opens one larger, so 320 and 640 are exactly
       1x and 2x and the features group's 960 and 1920 tiers would write two
       more copies of a 906px master under misleading names.

       Sliced out of ONE generation — see signals-grid.prompt.txt and
       scripts/slice-grid.mjs. A set that has to look like a set is cheaper
       and more consistent as a single gridded render than as six calls that
       each reinterpret the light. */
    name: "signals",
    src: join(process.cwd(), "assets-src", "features"),
    out: join(process.cwd(), "public", "assets", "features"),
    widths: [320, 640],
    webp: { quality: 82, effort: 6 },
    sources: [
      { file: "signal-device.png", name: "signal-device" },
      { file: "signal-application.png", name: "signal-application" },
      { file: "signal-capture.png", name: "signal-capture" },
      { file: "signal-time.png", name: "signal-time" },
      { file: "signal-location.png", name: "signal-location" },
      { file: "signal-integrity.png", name: "signal-integrity" },
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
    name: "renderings",
    src: join(process.cwd(), "assets-src", "renderings"),
    out: join(process.cwd(), "public", "assets", "renderings"),
    /* Content INSIDE the app mockups on /platform/renderings, as opposed to
       the device chrome around them.

       368 and 736 are 1x and 2x of the capture preview, and 736 is also the
       master's own width — deliberately, because there is no more resolution
       to be had. See townhouse-facade.source.txt: the ceiling is what forced
       a contained preview rather than a full-bleed one. */
    widths: [368, 736],
    /* Photographic, opaque, and shown small behind a live-camera treatment
       that is panning slightly, so detail is not the thing being judged. */
    webp: { quality: 80, effort: 6 },
    sources: [{ file: "townhouse-facade.png", name: "townhouse-facade" }],
  },
  {
    name: "captures",
    src: join(process.cwd(), "assets-src", "renderings"),
    out: join(process.cwd(), "public", "assets", "captures"),
    /* The nine captures of 18 Cadogan Square, inside the evidence record on
       /platform/renderings. Split from one 3x3 generation — see
       cadogan-grid.prompt.txt for why one, and for the measured gutters the
       split had to clear.

       Two widths because the screen shows each of these at exactly two sizes
       and nothing between: 240 for a thumbnail in the strip, and 878 — the
       cell's own full width — for whichever one is open in the viewer. Only
       one 878 is ever fetched per view; the srcSet picks it.

       Their own group rather than joining "renderings" above, because that
       group's master is 736 wide and would write a 736 file under an 878
       name. A srcSet that misreports a width is worse than an extra group. */
    widths: [240, 878],
    webp: { quality: 80, effort: 6 },
    sources: [
      { file: "cadogan-front-elevation.png", name: "cadogan-front-elevation" },
      { file: "cadogan-entrance-hall.png", name: "cadogan-entrance-hall" },
      { file: "cadogan-reception-room.png", name: "cadogan-reception-room" },
      { file: "cadogan-kitchen.png", name: "cadogan-kitchen" },
      { file: "cadogan-principal-bedroom.png", name: "cadogan-principal-bedroom" },
      { file: "cadogan-bathroom.png", name: "cadogan-bathroom" },
      { file: "cadogan-study.png", name: "cadogan-study" },
      { file: "cadogan-garden.png", name: "cadogan-garden" },
      { file: "cadogan-rear-elevation.png", name: "cadogan-rear-elevation" },
    ],
  },
  {
    name: "device",
    src: join(process.cwd(), "assets-src", "device"),
    out: join(process.cwd(), "public", "assets", "device"),
    /* UI chrome rather than a photograph, and it renders at exactly one size:
       a 24rem column on /platform/renderings, so 1x = 384 and 2x = 768. Both
       sit under the 928px master, so neither is an upscale and the two files
       genuinely differ — unlike a group whose top tiers collapse onto the
       master's own width. */
    /* 928 is the master's own width, added when the paired layout on
       /platform/renderings began drawing the phone at 36rem. At that size a
       2x display wants 1152 and there is no more picture to give it — 928 is
       the ceiling, and serving it beats serving 768 stretched. */
    widths: [384, 768, 928],
    /* Higher quality than the photographic groups. This is a hard-edged
       object on transparency: the bezel highlight is a one-pixel gradient and
       the screen edge is the boundary a rendering is aligned to, so ringing
       here is visible in a way it is not in a photograph of the sea.

       Alpha is the whole point of the asset — sharp carries it into WebP, and
       the screen must stay transparent for anything to show through it. */
    webp: { quality: 92, effort: 6 },
    sources: [{ file: "iphone-frame.png", name: "iphone-frame" }],
  },
  {
    name: "industries",
    src: join(process.cwd(), "assets-src", "industries"),
    out: join(process.cwd(), "public", "assets", "industries"),
    /* The panel renders at roughly 500 CSS px on a wide screen, so 1x ≈ 560
       and 2x ≈ 1120. Eight of these eventually load on one page, so the
       ceiling stays low on purpose. The jump tiles do NOT come from here —
       they show the annotated figure the card shows, so their 240 lives in
       the features group above. */
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
