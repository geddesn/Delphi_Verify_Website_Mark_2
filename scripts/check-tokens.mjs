#!/usr/bin/env node
/* ============================================================================
   DESIGN TOKEN DRIFT GUARD
   ============================================================================
   Fails the build if any component hard-codes a colour instead of using a
   semantic token.

   This exists because of exactly how the previous Delphi site decayed: the
   shadcn tokens were left at stock greyscale while the brand navy was applied
   ad hoc as one-off utility classes. Nothing caught it, so it spread.

   Run:  npm run check:tokens
   ========================================================================= */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

/* theme.css is the one place raw values are allowed to live. */
const ALLOWED_FILES = new Set(["src/styles/theme.css"]);

const RULES = [
  {
    id: "hex-colour",
    // #fff / #ffffff / #ffffffff
    pattern: /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
    message: "Hard-coded hex colour. Use a semantic token (bg-surface, text-ink…).",
  },
  {
    id: "raw-colour-fn",
    pattern: /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\s*\(/g,
    message: "Raw colour function. Define it in theme.css and reference the token.",
  },
  {
    id: "arbitrary-colour-class",
    // bg-[#123456], text-[rgb(...)], border-[oklch(...)]
    pattern: /\b(?:bg|text|border|fill|stroke|from|via|to|ring|shadow|outline|decoration|accent|caret)-\[(?:#|rgb|hsl|oklch|oklab|lab|lch)[^\]]*\]/g,
    message: "Arbitrary colour utility. Add a token to theme.css instead.",
  },
  {
    id: "tailwind-palette-colour",
    // Tailwind's built-in palette — bypasses the Delphi token layer entirely.
    pattern:
      /\b(?:bg|text|border|fill|stroke|ring|from|via|to)-(?:slate|gray|grey|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|\d{3})\b/g,
    message:
      "Tailwind default palette colour. Use a Delphi semantic token so themes and rebrands stay centralised.",
  },
];

/* SVG path data and data: URIs legitimately contain hex-like sequences. */
const IGNORE_LINE = [
  /\bd=["']/,
  /data:image\//,
  /^\s*\/\//,
  /^\s*\*/,
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if ([".ts", ".tsx", ".css", ".html"].includes(extname(full))) out.push(full);
  }
  return out;
}

const violations = [];

for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split("\\").join("/");
  if (ALLOWED_FILES.has(rel)) continue;

  const lines = readFileSync(file, "utf8").split("\n");

  lines.forEach((line, i) => {
    if (IGNORE_LINE.some((re) => re.test(line))) return;

    for (const rule of RULES) {
      rule.pattern.lastIndex = 0;
      const found = line.match(rule.pattern);
      if (found) {
        violations.push({
          file: rel,
          line: i + 1,
          match: found[0],
          rule: rule.id,
          message: rule.message,
        });
      }
    }
  });
}

if (violations.length === 0) {
  console.log("✓ Token check passed — no hard-coded colours outside theme.css");
  process.exit(0);
}

console.error(
  `\n✗ Token check failed — ${violations.length} hard-coded colour${
    violations.length === 1 ? "" : "s"
  } found outside theme.css\n`,
);

for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    ${v.match}  [${v.rule}]`);
  console.error(`    → ${v.message}\n`);
}

console.error(
  "All colour belongs in src/styles/theme.css. See its header for the layer model.\n",
);
process.exit(1);
