#!/usr/bin/env node
/* ============================================================================
   CAPTURE TRUST  —  record the trust engine running, as a GIF
   ============================================================================
   Drives the stage in a real browser, grabs the stage element frame by frame,
   and encodes the result. For sending to someone who is not going to visit the
   site, and for checking the whole thing end to end without watching it live
   thirty times.

   REAL TIME, NOT A FAKE CLOCK
   Playwright can install a fake clock and tick it deterministically, which
   would give perfectly even frames. It is the wrong tool here: it fakes JS
   timers only, and half of what this piece does — the leader draws, the
   certificate flights, the marching dashes — is CSS transitions and
   animations running on the compositor clock. Ticking the JS clock would race
   the step machine ahead of its own animations.

   So frames are captured as fast as the browser will give them, their real
   timestamps recorded, and the output encoded at the measured average rate.
   A few milliseconds of jitter is invisible; a step machine out of sync with
   its transitions is not.

    A GIF of a 38-second animation is a large file whatever you do — 256
   colours, one frame per delay, no interframe prediction. Width is the main
   lever, then --colours, then --fps. Expect tens of megabytes at 1200px; if
   that matters more than universal playback, record a video instead.

   VIDEO instead, with --video: Playwright records the viewport itself, at the
   browser's own frame rate rather than as fast as a screenshot loop can go,
   and hands back a WebM roughly a tenth the size of the GIF and smoother than
   it. The catch is that it records the VIEWPORT, so the stage is stretched to
   fill it first — see fillViewport below.

   VP8/WebM is the only codec available: the bundled ffmpeg has libvpx and
   nothing else, no H.264. Fine for the web, Slack and every browser; not for
   PowerPoint, which wants MP4 and would need a real ffmpeg installed.

   Run:  node scripts/capture-trust.mjs [--url …] [--fps 12] [--width 1200]
         [--colours 256] [--seconds 44] [--out <file>]
         [--video]        WebM instead of GIF, 1920x1080 by default
         [--video --mp4]  H.264 MP4 — needs the ffmpeg-static devDependency
   ========================================================================= */

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import sharp from "sharp";
/* gifenc is CommonJS, so the named ESM import Node would normally synthesise
   is not available — take the default and destructure. */
import gifenc from "gifenc";
const { GIFEncoder, quantize, applyPalette } = gifenc;
import {
  mkdirSync,
  rmSync,
  readdirSync,
  statSync,
  writeFileSync,
  copyFileSync,
  existsSync,
} from "node:fs";

/* ffmpeg's failures are all on stderr; piping it turns a one-line explanation
   into a buffer dump of its own banner, so let it through. */
const FF_IO = { stdio: ["ignore", "ignore", "inherit"] };

/* TWO ffmpegs, and the difference matters.

   Playwright ships one beside its browsers to encode its own screencasts:
   VP8 and PNG only, no H.264, and no image2 demuxer to read a frame
   sequence. ffmpeg-static is a full build — it is what makes MP4 possible,
   and it is a devDependency rather than a system install so nothing outside
   this folder has to change.

   Prefer the full one wherever it is present; fall back to Playwright's so
   the script still works from a bare checkout that has not run `npm i`. */
async function fullFfmpeg() {
  try {
    const mod = await import("ffmpeg-static");
    return mod.default ?? null;
  } catch {
    return null;
  }
}
function findFfmpeg() {
  const root = join(
    process.env.LOCALAPPDATA ?? process.env.HOME ?? "",
    "ms-playwright",
  );
  if (!existsSync(root)) return null;
  const dir = readdirSync(root).find((d) => d.startsWith("ffmpeg-"));
  if (!dir) return null;
  const exe = readdirSync(join(root, dir)).find((f) => f.startsWith("ffmpeg-"));
  return exe ? join(root, dir, exe) : null;
}
import { join, resolve, dirname } from "node:path";

const argv = process.argv.slice(2);
const arg = (flag, fallback) => {
  const i = argv.indexOf(`--${flag}`);
  return i === -1 ? fallback : argv[i + 1];
};

const URL = arg("url", "http://localhost:5195/");
const FPS = Number(arg("fps", 12));
/* The palette size. Lowering it is the cheapest lever on file size, but see
   the note by the quantiser before reaching for it — on type over a flat
   ground it costs more than it saves. */
const COLOURS = Number(arg("colours", 256));
const VIDEO = argv.includes("--video");
/* MP4 needs H.264, which only the full ffmpeg has — see fullFfmpeg below. */
const MP4 = argv.includes("--mp4");

/* Video defaults to 1920 wide because YouTube buckets by HEIGHT: at 900 it
   will never offer a 1080p option however clean the source is. */
const WIDTH = Number(arg("width", VIDEO ? 1920 : 1200));
/* The whole piece: five seconds of title card, then roughly seventeen each
   for the two acts and a beat for the turn, plus a little to rest on the
   final frame. */
const SECONDS = Number(arg("seconds", 44));
const OUT = resolve(
  arg("out", VIDEO ? (MP4 ? "trust-engine.mp4" : "trust-engine.webm") : "trust-engine.gif"),
);

/* Recording the viewport means the stage has to BE the viewport. Everything
   else on the page is hidden rather than scrolled away, because a fixed
   element is the only reliable way to fill a frame exactly — scrolling leaves
   a sliver of whatever is above or below. The background is lifted off the
   section the stage normally sits in, so the ground still has the right
   colour behind it. */
const fillViewport = () => {
  const stage = document.querySelector(".isolate");
  if (!stage) return;
  const section = stage.closest("section");
  const bg = section ? getComputedStyle(section).backgroundColor : "#000";
  const style = document.createElement("style");
  style.textContent = `
    body > * { visibility: hidden !important; }
    .capture-frame {
      visibility: visible !important;
      position: fixed !important;
      inset: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      aspect-ratio: auto !important;
      margin: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: ${bg} !important;
      z-index: 2147483647 !important;
    }
    .capture-frame * { visibility: visible !important; }
    html, body { background: ${bg} !important; overflow: hidden !important; }
  `;
  document.head.appendChild(style);
  stage.classList.add("capture-frame");
};

const frameDir = join(
  process.env.TEMP ?? "/tmp",
  `trust-frames-${process.pid}`,
);
rmSync(frameDir, { recursive: true, force: true });
mkdirSync(frameDir, { recursive: true });

console.log(`Recording ${URL}`);
console.log(`  ${SECONDS}s at ~${FPS}fps, ${WIDTH}px wide`);

const browser = await chromium.launch();

/* 16:9 for video, matching the stage's own aspect so nothing is letterboxed.
   The GIF path keeps a taller viewport because it clips the stage out of a
   normal page rather than making the stage the page. */
/* 1920x1080, because YouTube buckets by HEIGHT: at 900 it will never offer a
   1080p option however clean the source is. --width overrides. */
const VIDEO_SIZE = {
  width: VIDEO ? WIDTH : 1600,
  height: VIDEO ? Math.round((WIDTH * 9) / 16) : 900,
};
/* Recording begins the moment the context exists, which is before the page
   has even loaded — so the lead-in is measured and trimmed off at the end
   rather than left as several seconds of a still frame. */
const recordingFrom = Date.now();
const context = await browser.newContext({
  viewport: VIDEO ? VIDEO_SIZE : { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  ...(VIDEO ? { recordVideo: { dir: frameDir, size: VIDEO_SIZE } } : {}),
});
/* Paint the page dark before anything else can paint it white.

   Recording starts with the context, which is before the first frame the
   compositor produces — so the opening of every take was six tenths of a
   second of the browser's blank white page. The lead-in trim cannot reliably
   remove it: the cut is a stream copy, so it snaps to the nearest keyframe
   and lands inside the flash.

   #030416 is --delphi-1000, the site's canvas, converted out of OKLCH. It is
   here rather than read from the page because the point is to be in place
   before the stylesheet is. */
await context.addInitScript(() => {
  const paint = () => {
    const el = document.documentElement;
    if (el) el.style.background = "#030416";
  };
  paint();
  document.addEventListener("DOMContentLoaded", paint);
});

const page = await context.newPage();

/* "load", not "networkidle". A Vite dev server holds an HMR websocket open
   for the life of the page, so the network never goes idle and goto can sit
   there until it times out — silently, because nothing has been logged yet.
   Everything this needs is present at load; the explicit waits below cover
   the rest. */
page.setDefaultTimeout(20_000);
await page.goto(URL, { waitUntil: "load", timeout: 30_000 });

const stage = page.locator(".isolate").first();
await stage.waitFor({ state: "attached" });
/* One image is enough to know the assets are being served. */
await page
  .locator('img[src*="yacht-cutout"]')
  .first()
  .waitFor({ state: "attached" });
console.log("  page ready");

/* Pin the stage BEFORE anything else touches the page.
   Recording it while it is still an element on a scrolling page means the
   scroll into view is in the footage, and trimming that off afterwards does
   not work reliably: the cut is a stream copy, so it snaps back to the
   nearest keyframe and lands somewhere in the middle of the movement. Once
   the stage is fixed to the viewport there is nothing to scroll to. */
if (VIDEO) await page.evaluate(fillViewport);

/* Everything on the STAGE decoded before the first frame: an image popping in
   halfway through is the one artefact a viewer will notice every time.

   ⚠️  ONLY the stage, and never without a deadline. decode() on a lazy image
   that is off-screen NEVER SETTLES — it does not resolve and it does not
   reject — and pinning the stage to the viewport hides the rest of the page,
   so every other image on it becomes exactly that. A bare Promise.all over
   the whole document hangs here forever, silently, after the last thing was
   logged. */
await page.evaluate(async (scroll) => {
  const stage = document.querySelector(".isolate");
  if (scroll) stage?.scrollIntoView({ block: "center" });
  const imgs = [...(stage?.querySelectorAll("img") ?? [])];
  await Promise.all(
    imgs.map((i) =>
      Promise.race([
        i.decode().catch(() => {}),
        new Promise((r) => setTimeout(r, 3000)),
      ]),
    ),
  );
}, !VIDEO);
/* Long enough for the stylesheet, the fonts and the first images to be on
   screen. The cut lands here, so this is the frame the video opens on. */
await page.waitForTimeout(1500);
console.log("  assets decoded");
await page.waitForTimeout(1200);

/* Start from the top rather than wherever the scroll trigger left it. */
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(
    (x) => x.textContent?.trim() === "Act one",
  );
  b?.click();
});
const leadIn = (Date.now() - recordingFrom) / 1000;

/* Clip once, then shoot the viewport. locator.screenshot() re-finds the
   element and recomputes its box on every frame, which costs more than the
   capture — it held the rate to 8fps where this manages the full 12. */
if (VIDEO) {
  /* Nothing to do but let it run. Playwright is capturing every frame the
     compositor produces, which is the point — no screenshot loop can keep up
     with a CSS transition, and the ones it misses are exactly the frames a
     draw or a flight is made of. */
  console.log(`  recording ${SECONDS}s…`);
  await page.waitForTimeout(SECONDS * 1000);

  /* Order matters. Closing the context is what finalises the file, but the
     browser has to still be up for saveAs to fetch it — close both first and
     it fails with "target has been closed", which reads like the recording
     never happened. */
  const video = page.video();
  await context.close();
  mkdirSync(dirname(OUT), { recursive: true });
  const raw = join(frameDir, "raw.webm");
  if (video) await video.saveAs(raw);
  await browser.close();

  /* Trim the lead-in — RE-ENCODED, not stream-copied.
     A copy was the obvious choice (the bundled ffmpeg only makes VP8, so
     re-encoding VP8 costs quality for nothing) and it does not work: -ss on a
     copy snaps to the nearest keyframe, and the keyframes here are far enough
     apart that the cut kept landing inside the page load. The opening was
     white, then dark, then white again — the browser painting a blank tab,
     then the document, then the stylesheet.

     Re-encoding makes the cut exact. At 2 Mbps against an 0.9 Mbps source the
     loss is not visible, and it is the only way to be certain what the first
     frame is. */
  const full = await fullFfmpeg();
  const ffmpeg = full ?? findFfmpeg();

  if (MP4 && !full) {
    console.error("\n✗ MP4 needs the full ffmpeg: npm i -D ffmpeg-static");
    process.exit(1);
  }

  if (ffmpeg && leadIn > 0.5) {
    /* One pass: seek, trim and encode together. H.264 where it is available,
       VP8 where it is not.

       yuv420p and +faststart are not optional for anything that will be
       uploaded or embedded — 4:2:0 is what every player and every platform
       decodes, and faststart moves the index to the front so a browser can
       begin playing before the file has finished arriving. */
    const codec = MP4
      ? ["-c:v", "libx264", "-crf", "18", "-preset", "slow",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
      : ["-c:v", "libvpx", "-b:v", "2M", "-deadline", "good",
         "-cpu-used", "2", "-auto-alt-ref", "0"];

    execFileSync(
      ffmpeg,
      ["-y", "-ss", leadIn.toFixed(2), "-i", raw, ...codec, OUT],
      FF_IO,
    );
    console.log(`
  trimmed ${leadIn.toFixed(1)}s of lead-in`);
  } else {
    copyFileSync(raw, OUT);
  }
  rmSync(frameDir, { recursive: true, force: true });

  console.log(
    `
  ✓ ${OUT}  ${VIDEO_SIZE.width}×${VIDEO_SIZE.height}, ${SECONDS}s` +
      `  (${(statSync(OUT).size / 1024 / 1024).toFixed(1)} MB)`,
  );
  process.exit(0);
}

const box = await stage.boundingBox();
if (!box) throw new Error("stage has no bounding box");
const clip = {
  x: Math.round(box.x),
  y: Math.round(box.y),
  width: Math.round(box.width),
  height: Math.round(box.height),
};

const interval = 1000 / FPS;
const started = Date.now();
let n = 0;

while (Date.now() - started < SECONDS * 1000) {
  const due = started + n * interval;
  const wait = due - Date.now();
  if (wait > 2) await page.waitForTimeout(wait);
  await page.screenshot({
    path: join(frameDir, `f${String(n).padStart(5, "0")}.png`),
    clip,
    animations: "allow",
  });
  n++;
  if (n % 60 === 0) process.stdout.write(`  ${n} frames\r`);
}

await context.close();
await browser.close();

const elapsed = (Date.now() - started) / 1000;
const actual = n / elapsed;
const delay = Math.round(1000 / actual);
console.log(`
  ${n} frames over ${elapsed.toFixed(1)}s → ${actual.toFixed(1)}fps`);

/* ── Encoding ─────────────────────────────────────────────────────────────
   By hand, because neither of the obvious tools can do it on this machine:
   the only ffmpeg here is the cut-down build Playwright ships to encode its
   own screencasts, which has no PNG decoder and cannot read an image
   sequence; and sharp's build writes a multi-page input back out as a single
   flattened frame, for animated WebP as well as GIF. gifenc is ~15 kB of
   pure JS and does exactly this one job.

   ONE PALETTE FOR THE WHOLE ANIMATION, sampled across it rather than taken
   from the first frame. A GIF gets 256 colours; choosing them per frame
   makes every flat navy area shimmer as the palette shifts underneath it,
   and choosing them from frame one alone means Act Two's greens and the
   certificate whites were never in the running. */
const files = readdirSync(frameDir)
  .filter((f) => f.endsWith(".png"))
  .sort();

const toRGBA = async (file) => {
  const { data, info } = await sharp(join(frameDir, file))
    .resize({ width: WIDTH })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data: new Uint8ClampedArray(data), w: info.width, h: info.height };
};

console.log("Sampling a palette…");
const SAMPLES = 24;
const stride = Math.max(1, Math.floor(files.length / SAMPLES));
const sampled = [];
for (let i = 0; i < files.length; i += stride) sampled.push(await toRGBA(files[i]));
const pool = new Uint8ClampedArray(
  Buffer.concat(sampled.map((f) => Buffer.from(f.data))),
);
/* NO prequantize, and 256 colours by default.
   Rounding the low bits off first does shrink the file, and it wrecks this
   particular image: the stage is white type and hairlines over flat navy, so
   almost every pixel that matters is an antialiased edge, and crushing those
   speckles the headline and the panel titles. Flat photographic fills would
   not have minded. Know which you have. */
const palette = quantize(pool, COLOURS, { format: "rgba4444" });

console.log(`Encoding ${files.length} frames…`);
const gif = GIFEncoder();
let w = 0;
let h = 0;
for (let i = 0; i < files.length; i++) {
  const f = await toRGBA(files[i]);
  w = f.w;
  h = f.h;
  gif.writeFrame(applyPalette(f.data, palette, "rgba4444"), f.w, f.h, {
    palette: i === 0 ? palette : undefined,
    delay,
    repeat: 0,
  });
  if (i % 60 === 0) process.stdout.write(`  ${i}/${files.length}
`);
}
gif.finish();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, gif.bytes());
console.log(
  `
  ✓ ${OUT}  ${w}×${h}, ${files.length} frames, ${delay}ms each` +
    `  (${(statSync(OUT).size / 1024 / 1024).toFixed(1)} MB)`,
);

rmSync(frameDir, { recursive: true, force: true });
