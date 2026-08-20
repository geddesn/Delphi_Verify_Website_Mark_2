#!/usr/bin/env node
/* ============================================================================
   OPEN GRAPH IMAGE
   ============================================================================
   Without og:image, every share of this site — LinkedIn, Slack, WhatsApp,
   Teams — renders as a bare text card. For a B2B site whose links get pasted
   into procurement threads, that is a real loss, and the previous site had one.

   Composed deterministically from the brand tokens and the real logo rather
   than generated or hand-designed, so it cannot drift from the site.

   Output is PNG, not WebP: some social scrapers still refuse WebP.

   Run:  npm run og
   ========================================================================= */

import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const OUT_DIR = join(process.cwd(), "public", "assets", "social");
mkdirSync(OUT_DIR, { recursive: true });

const W = 1200;
const H = 630;

/* ── OKLCH → sRGB hex, so the card uses the exact token values from
      src/styles/theme.css rather than an eyeballed approximation. ───────── */
function oklchToHex(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(h);
  const bb = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * bb;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * bb;
  const s_ = L - 0.0894841775 * a - 1.291485548 * bb;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  const lin = [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const to8 = (v) => {
    const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
    return Math.max(0, Math.min(255, Math.round(c * 255)));
  };
  return "#" + lin.map(to8).map((n) => n.toString(16).padStart(2, "0")).join("");
}

/* Values copied from theme.css LAYER 1. If the brand changes there, change
   them here too — this is the one intentional duplication, because the card
   is generated outside the browser and cannot read CSS variables. */
const NAVY_DEEP = oklchToHex(0.120, 0.048, 275); // --delphi-1000
const NAVY = oklchToHex(0.175, 0.068, 275);      // --delphi-950
const ACCENT = oklchToHex(0.675, 0.128, 275);    // --delphi-400
const VERIFIED = oklchToHex(0.624, 0.148, 152);  // --signal-verified
const INK = "#f7f7f9";
const MUTED = "#a8abbb";

/* The logo is a single flat colour, so recolour it to white for the card. */
const logo = readFileSync(join(process.cwd(), "public", "assets", "logo.svg"), "utf8")
  .replace(/#2D3187/gi, "#ffffff");
const logoDataUri =
  "data:image/svg+xml;base64," + Buffer.from(logo).toString("base64");

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function card({ title, kicker }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
    <pattern id="grid" width="72" height="72" patternUnits="userSpaceOnUse">
      <path d="M72 0H0V72" fill="none" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>

  <!-- Accent rule, echoing the eyebrow device used across the site -->
  <rect x="80" y="96" width="56" height="3" fill="${ACCENT}"/>
  <text x="152" y="107" fill="${ACCENT}" font-family="IBM Plex Sans, Segoe UI, sans-serif"
        font-size="19" font-weight="700" letter-spacing="2.6">${esc(kicker.toUpperCase())}</text>

  <text x="80" y="248" fill="${INK}" font-family="IBM Plex Sans, Segoe UI, sans-serif"
        font-size="76" font-weight="700" letter-spacing="-2.2">${esc(title.line1)}</text>
  <text x="80" y="338" fill="${INK}" font-family="IBM Plex Sans, Segoe UI, sans-serif"
        font-size="76" font-weight="700" letter-spacing="-2.2">${esc(title.line2)}</text>

  <!-- Evidence chip: mono, state dot, exactly as the site renders it -->
  <rect x="80" y="404" width="316" height="44" rx="4" fill="${VERIFIED}" fill-opacity="0.16"/>
  <circle cx="104" cy="426" r="4" fill="${VERIFIED}"/>
  <text x="120" y="432" fill="${VERIFIED}" font-family="IBM Plex Mono, monospace"
        font-size="16" letter-spacing="1.2">DELPHI VERIFIED · 4K7M-92QX</text>

  <line x1="80" y1="512" x2="${W - 80}" y2="512" stroke="#ffffff" stroke-opacity="0.14"/>

  <image href="${logoDataUri}" x="80" y="540" width="188" height="53"/>

  <text x="${W - 80}" y="574" text-anchor="end" fill="${MUTED}"
        font-family="IBM Plex Mono, monospace" font-size="17" letter-spacing="0.4">delphiverify.com</text>
</svg>`;
}

const CARDS = [
  {
    file: "og-default.png",
    kicker: "Evidence infrastructure",
    title: { line1: "Trusted evidence for", line2: "the physical world." },
  },
];

for (const c of CARDS) {
  const svg = card(c);
  const outPath = join(OUT_DIR, c.file);
  await sharp(Buffer.from(svg)).png({ quality: 90, compressionLevel: 9 }).toFile(outPath);
  const { size } = await sharp(outPath).metadata().then(async (m) => ({
    size: (await import("node:fs")).statSync(outPath).size,
    ...m,
  }));
  console.log(`  ✓ ${c.file}  ${W}×${H}  ${(size / 1024).toFixed(0)} kB`);
}

/* Keep the SVG source alongside for inspection/tweaking. */
writeFileSync(join(OUT_DIR, "og-default.svg"), card(CARDS[0]));

console.log("\n✓ Social card written to public/assets/social/");
