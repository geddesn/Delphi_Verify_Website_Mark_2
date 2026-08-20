#!/usr/bin/env node
/* ============================================================================
   WHOLE-SITE PDF
   ============================================================================
   Renders every public route into a single PDF, for review, sharing and print.

   Run:  npm run build && npm run pdf
   Out:  dist-pdf/delphi-verify.pdf

   This is a review tool, not part of the shipped site. Nothing here is
   deployed and no PDF is committed — a checked-in PDF goes stale the moment
   copy changes, silently, which is worse than not having one.

   Design decisions worth keeping:

   • One route = one PDF page, at the full height of the document. A marketing
     site chopped into A4 slices is unreadable; a tall page preserves the
     design exactly as it is on screen.

   • Light theme is forced. The prerendered HTML carries no data-theme, so a
     headless browser would follow whatever colour scheme the machine reports
     and the PDF would differ between people running it.

   • Reduced motion is forced. The hero backdrops cycle and cross-fade; without
     this the capture lands on a random frame and no two runs match. With it
     every route captures its first frame, so the output is reproducible.

   • printBackground is on. Inverted sections are `bg-canvas` deep navy — off
     by default the whole hero would print white with white text on it.

   Routes come from the same SSR bundle prerender.mjs uses, so this cannot
   drift from the real route table.
   ========================================================================= */

import { createServer } from "node:http";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const SSR = join(ROOT, "dist-ssr", "entry-server.js");
const OUT_DIR = join(ROOT, "dist-pdf");
const OUT_FILE = join(OUT_DIR, "delphi-verify.pdf");

/* Wide enough for the lg: breakpoint, so the PDF shows the desktop layout
   rather than the stacked mobile one. */
const WIDTH = 1440;

/* Routes excluded from the review PDF. /styleguide is an internal tool and
   legal pages are long boilerplate nobody reviews visually. Override with
   `--all`. */
const SKIP = new Set(["/styleguide", "/privacy", "/terms"]);
const includeAll = process.argv.includes("--all");

/* ── preflight ────────────────────────────────────────────────────────────── */

if (!existsSync(DIST) || !existsSync(SSR)) {
  console.error("✗ No build found. Run `npm run build` first.");
  process.exit(1);
}

let chromium, PDFDocument;
try {
  ({ chromium } = await import("playwright"));
  ({ PDFDocument } = await import("pdf-lib"));
} catch {
  console.error("✗ Missing dependencies for the PDF capture.");
  console.error("  npm i -D playwright pdf-lib && npx playwright install chromium");
  process.exit(1);
}

const { routeTable } = await import(pathToFileURL(SSR).href);
const routes = routeTable
  .map((r) => r.path)
  .filter((p) => includeAll || !SKIP.has(p));

/* ── static server ────────────────────────────────────────────────────────── */

const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".xml": "application/xml",
  ".txt": "text/plain",
};

const server = createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(req.url.split("?")[0]);
    /* Prerendered routes are directories containing index.html. */
    const file = extname(path)
      ? join(DIST, path)
      : join(DIST, path, "index.html");
    const body = await readFile(file);
    res.writeHead(200, {
      "Content-Type": TYPES[extname(file)] ?? "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
});

const port = await new Promise((resolve) => {
  server.listen(0, () => resolve(server.address().port));
});
const origin = `http://127.0.0.1:${port}`;

/* ── capture ──────────────────────────────────────────────────────────────── */

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 1000 },
  deviceScaleFactor: 2,
  colorScheme: "light",
  reducedMotion: "reduce",
});
const page = await context.newPage();

const pdfs = [];
let failed = 0;

for (const route of routes) {
  const url = `${origin}${route}`;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });

    /* Fonts are self-hosted and async; without this headings render in the
       fallback face and the whole PDF looks wrong. */
    await page.evaluate(() => document.fonts.ready);

    /* Every image decoded, including the lazy card photography further down
       the page — a PDF has no viewport to scroll, so nothing else triggers
       them. */
    await page.evaluate(async () => {
      window.scrollTo(0, document.body.scrollHeight);
      await Promise.all(
        [...document.images]
          .filter((i) => !i.complete)
          .map((i) => new Promise((r) => (i.onload = i.onerror = r))),
      );
      window.scrollTo(0, 0);
    });

    const height = await page.evaluate(
      () => document.documentElement.scrollHeight,
    );

    const buf = await page.pdf({
      width: `${WIDTH}px`,
      height: `${height}px`,
      printBackground: true,
      pageRanges: "1",
    });

    pdfs.push({ route, buf, height });
    console.log(
      `  ✓ ${route.padEnd(22)} ${String(height).padStart(6)}px  ${(buf.length / 1024).toFixed(0).padStart(5)} kB`,
    );
  } catch (err) {
    failed++;
    console.warn(`  ⚠ ${route.padEnd(22)} failed: ${err.message.split("\n")[0]}`);
  }
}

await browser.close();
server.close();

if (pdfs.length === 0) {
  console.error("\n✗ Nothing captured.");
  process.exit(1);
}

/* ── merge ────────────────────────────────────────────────────────────────── */

const merged = await PDFDocument.create();
merged.setTitle("Delphi Verify — website");
merged.setSubject("Full site capture for review");

for (const { buf } of pdfs) {
  const doc = await PDFDocument.load(buf);
  const pages = await merged.copyPages(doc, doc.getPageIndices());
  pages.forEach((p) => merged.addPage(p));
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, await merged.save());

const size = (await readFile(OUT_FILE)).length;
console.log(
  `\n✓ ${routes.length - failed}/${routes.length} routes → dist-pdf/delphi-verify.pdf ` +
    `(${(size / 1024 / 1024).toFixed(1)} MB)`,
);
if (!includeAll) {
  console.log(`  Skipped ${[...SKIP].join(", ")} — pass --all to include them.`);
}
if (failed) process.exitCode = 1;
