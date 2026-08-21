#!/usr/bin/env node
/* ============================================================================
   RENDER GROUND  —  a real 3D grid floor, ray-cast once, offline
   ============================================================================
   Casts a ray through every pixel, intersects it with the floor plane, and
   shades the hit by its distance to the nearest grid line. That is a real
   perspective render: the geometry is computed, not approximated.

   WHY NOT CSS, WHICH IS WHAT THIS REPLACES
   A plane pitched with rotateX gives ONE-point perspective — the receding
   family converges, the crossing family stays parallel to the horizon forever.
   The asset is drawn in two-point, so the floor never quite agreed with it.
   Worse, a CSS grid's lines are a fixed number of screen pixels wide at every
   depth, which is the real "pseudo-3D" tell: a painted line on a real floor
   gets thinner as it recedes. Here it does, because the width is in world
   units and the projection handles the rest.

   WHY NOT WebGL AT RUNTIME
   Nothing moves. Paying 200 kB of library and a GPU context every page load to
   redraw an identical still frame would be absurd. Render once, ship a mask.

   WHY IT IS A MASK AND NOT A PICTURE
   The output is white with a varying alpha channel — geometry only, no colour.
   CSS fills it with a token, so the ground still themes with everything else
   and no colour value escapes theme.css. It also compresses far better than a
   coloured render of the same thing.

   PROVENANCE
   Writes a .params.json beside the output recording exactly what produced it,
   for the same reason every generated image here has a .prompt.txt: a
   regenerable asset with no record of its inputs is not regenerable.

   Run:  node scripts/render-ground.mjs [--name trust-ground] [flags below]
   ========================================================================= */

import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const argv = process.argv.slice(2);
const arg = (flag, fallback) => {
  const i = argv.indexOf(`--${flag}`);
  return i === -1 ? fallback : Number(argv[i + 1]);
};
const argS = (flag, fallback) => {
  const i = argv.indexOf(`--${flag}`);
  return i === -1 ? fallback : argv[i + 1];
};

/* ── Parameters ───────────────────────────────────────────────────────────
   Expressed in the terms that actually matter — where the horizon sits, where
   the lines converge — rather than in camera angles. Pitch and yaw are then
   derived, because "vanishing point at 103% of the width" is a thing you can
   measure off the asset, and "yaw −31.5°" is not. */
const P = {
  name: argS("name", "trust-ground"),
  width: arg("width", 2048),
  height: arg("height", 1152),

  /* Horizon, % of image height. 50 means the camera looks dead level. */
  horizon: arg("horizon", 50),
  /* Where the receding lines converge, % of image width. May be off-frame.
     DERIVED FROM THE ASSET: the yacht's waterline rises 7.36° to the right —
     measured off the cut-out's alpha channel — and extending it to a horizon
     at 50% crosses x = 103%. Put the vanishing point there and the floor
     recedes along the vessel's own axis. */
  vanishX: arg("vanish-x", 103),

  /* Horizontal field of view, degrees. A long lens (30-40) keeps the second
     vanishing point off-frame and matches how the asset was shot; a wide one
     drags it into frame and the floor starts to look like a skate ramp. */
  fov: arg("fov", 36),
  /* Camera height in grid cells. This, not the grid spacing, is what sets how
     dense the floor reads — the two are a ratio and only one need vary. */
  eye: arg("eye", 2.6),

  /* The plane itself, as a share of full mask alpha. The floor is a SURFACE
     with lines on it, not lines floating in a void — without this the eye has
     nothing to read as a plane and the grid looks like a wireframe hanging in
     space. Kept well below the line level so the lines still sit on top of it
     rather than in it. */
  fill: arg("fill", 0.28),

  /* Line width in world units, where one cell is 1. Constant in WORLD space,
     so it thins with distance the way a painted line does. */
  line: arg("line", 0.016),
  /* Every Nth line is heavier, which is what stops a fine grid reading as
     texture rather than as measurement. 0 disables. */
  major: arg("major", 5),
  majorLine: arg("major-line", 0.03),

  /* Distance fog, in cells. Lines are fully present at `fogNear` and gone by
     `fogFar`. Without this the grid piles into moiré at the horizon and the
     mush reads as a rendering fault rather than as distance. */
  fogNear: arg("fog-near", 6),
  fogFar: arg("fog-far", 58),

  /* Atmosphere above the horizon: haze that thins with height, so the sky is
     not simply an empty half of the frame. In cells-equivalent screen terms —
     fraction of the image height over which it falls off. */
  haze: arg("haze", 0.16),
  hazeFall: arg("haze-fall", 0.22),

  /* Supersampling. Offline, so there is no reason to be shy: 4 means 16
     samples a pixel and the thinnest lines antialias properly instead of
     crawling. */
  ss: arg("ss", 4),
};

const DEG = Math.PI / 180;
const aspect = P.width / P.height;
const tanHalfFov = Math.tan((P.fov * DEG) / 2);

/* Camera angles, derived from where things must land.

   A direction d projects to ndcX = (d.x/d.z) / (aspect·tanHalfFov). The
   receding lines run along world +z, so after yawing the camera by θ they
   project to ndcX = −tanθ / (aspect·tanHalfFov). Solve for θ.

   The horizon is the set of directions with d.y = 0; pitching by φ puts it at
   ndcY = tanφ / tanHalfFov. Solve for φ. */
const ndcX = (2 * P.vanishX) / 100 - 1;
const ndcY = 1 - (2 * P.horizon) / 100;
const yaw = -Math.atan(ndcX * aspect * tanHalfFov);
const pitch = Math.atan(ndcY * tanHalfFov);

const cosP = Math.cos(pitch), sinP = Math.sin(pitch);
const cosY = Math.cos(yaw), sinY = Math.sin(yaw);

/** Coverage of a line of half-width `hw` at distance `d` from its centre,
 *  with the sample footprint standing in for antialiasing. Binary here —
 *  supersampling does the smoothing, which is cheaper to reason about than an
 *  analytic filter and, offline, indistinguishable. */
const onLine = (d, hw) => (d < hw ? 1 : 0);

const W = P.width, H = P.height, SS = P.ss;
const alpha = new Float32Array(W * H);

for (let py = 0; py < H; py++) {
  for (let px = 0; px < W; px++) {
    let acc = 0;

    for (let sy = 0; sy < SS; sy++) {
      for (let sx = 0; sx < SS; sx++) {
        const x = px + (sx + 0.5) / SS;
        const y = py + (sy + 0.5) / SS;

        /* Ray through the pixel, in camera space, then rotated into the world
           by pitch and yaw. Not normalised — only ratios matter below. */
        const cx = ((x / W) * 2 - 1) * aspect * tanHalfFov;
        const cy = (1 - (y / H) * 2) * tanHalfFov;

        /* pitch about X, then yaw about Y */
        const py1 = cy * cosP - 1 * sinP;
        const pz1 = cy * sinP + 1 * cosP;
        const dx = cx * cosY + pz1 * sinY;
        const dy = py1;
        const dz = -cx * sinY + pz1 * cosY;

        if (dy >= 0) {
          /* Above the horizon: no floor. Atmosphere instead — haze that fades
             out with height, so the sky carries a little depth of its own. */
          const above = (P.horizon / 100) - y / H;
          if (above > 0) acc += P.haze * Math.exp(-above / P.hazeFall);
          continue;
        }

        /* Intersect the floor plane y = 0 from an eye at height P.eye. */
        const t = -P.eye / dy;
        if (!isFinite(t) || t <= 0) continue;

        const wx = dx * t;
        const wz = dz * t;

        /* Distance in cells from this point to the nearest grid line on each
           axis. Ranges 0..0.5. */
        const fx = Math.abs(wx - Math.round(wx));
        const fz = Math.abs(wz - Math.round(wz));

        let hit = Math.max(onLine(fx, P.line), onLine(fz, P.line));

        if (P.major > 0) {
          const mx = Math.abs(wx / P.major - Math.round(wx / P.major)) * P.major;
          const mz = Math.abs(wz / P.major - Math.round(wz / P.major)) * P.major;
          hit = Math.max(hit, onLine(mx, P.majorLine), onLine(mz, P.majorLine));
        }

        /* Range along the floor, not along the ray, so the fog does not
           thicken toward the corners of the frame. */
        const range = Math.hypot(wx, wz);
        const fog =
          range <= P.fogNear
            ? 1
            : range >= P.fogFar
              ? 0
              : 1 - (range - P.fogNear) / (P.fogFar - P.fogNear);

        /* The surface fades linearly, the lines as the square. The plane
           therefore carries on toward the horizon after its markings have
           dissolved — which is what distance actually looks like, and it
           saves the grid from piling into moiré where it converges. */
        acc += Math.max(hit * fog * fog, P.fill * fog);
      }
    }

    alpha[py * W + px] = Math.min(1, acc / (SS * SS));
  }
}

/* White, with the render in the alpha channel. */
const rgba = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  rgba[i * 4] = 255;
  rgba[i * 4 + 1] = 255;
  rgba[i * 4 + 2] = 255;
  rgba[i * 4 + 3] = Math.round(alpha[i] * 255);
}

const outDir = join(process.cwd(), "public", "assets", "ground");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${P.name}.webp`);

/* Near-lossless: the thin lines are exactly what lossy WebP smears, and a
   smeared mask shows up as a dirty haze once CSS multiplies it by a colour. */
await sharp(rgba, { raw: { width: W, height: H, channels: 4 } })
  .webp({ nearLossless: true, quality: 90, alphaQuality: 100, effort: 6 })
  .toFile(outFile);

writeFileSync(
  join(outDir, `${P.name}.params.json`),
  JSON.stringify(
    { ...P, derived: { yawDeg: yaw / DEG, pitchDeg: pitch / DEG, aspect } },
    null,
    2,
  ) + "\n",
);

const { size } = await sharp(outFile).metadata().then(async (m) => ({
  size: (await import("node:fs")).statSync(outFile).size,
  m,
}));

console.log(`  ✓ ${outFile}`);
console.log(`    ${W}×${H}, ${SS}×${SS} samples/px, ${(size / 1024).toFixed(0)} kB`);
console.log(
  `    horizon ${P.horizon}%  vanishing point ${P.vanishX}%  fov ${P.fov}°`,
);
console.log(
  `    → derived camera: yaw ${(yaw / DEG).toFixed(2)}°, pitch ${(pitch / DEG).toFixed(2)}°`,
);
