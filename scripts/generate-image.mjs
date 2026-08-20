#!/usr/bin/env node
/* ============================================================================
   IMAGE GENERATION  —  Runway text_to_image
   ============================================================================
   The runway-api Claude Code plugin ships a generator, but it whitelists three
   models (`gen4_image`, `gen4_image_turbo`, `gemini_2.5_flash`) in a hardcoded
   table. The account has access to nine. gen4_image is two generations old and
   demonstrably drops negative constraints — three attempts at the property
   sales shot each ignored "no French interiors" — so this calls the API
   directly instead.

   Patching the plugin was the alternative and was rejected: it lives in
   ~/.claude/plugins/cache/ and is overwritten on every plugin update.

   Run:  node scripts/generate-image.mjs --prompt-file <file> --name <slug>

   Masters land in assets-src/industries/ and are NOT served. public/ is for
   optimised WebP only — a 1.7 MB PNG in there would ship to production.
   Pair every master with its .prompt.txt: for a company selling provenance,
   the prompt is the image's provenance.
   ========================================================================= */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const API = "https://api.dev.runwayml.com";
const VERSION = "2024-11-06";

/* Defaults chosen for the industries set: seedream5_pro is the same price as
   the gen4_image we were using (5 credits at 1K) but far newer, and holds
   compositional instructions that gen4_image discards.

   Ratios are per-model, not universal — seedream5_pro rejects gen4_image's
   1920:1080. 2720:1530 is true 16:9 at the 2K tier (9 credits). Send a wrong
   one and the 400 lists every accepted value, which costs nothing.

   promptText ceilings are per-model too: gen4_image caps at 1000 characters,
   seedream5_pro at 4000. The house-style template in *.prompt.txt only just
   fits under 4000, so new detail has to be traded against something already
   there rather than appended. */
const DEFAULTS = {
  model: "seedream5_pro",
  ratio: "2720:1530",
  out: "assets-src/industries",
};

/* ── args ─────────────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2);
const arg = (flag, fallback) => {
  const i = argv.indexOf(flag);
  return i === -1 ? fallback : argv[i + 1];
};

const promptFile = arg("--prompt-file");
const inlinePrompt = arg("--prompt");
const name = arg("--name");
const model = arg("--model", DEFAULTS.model);
const ratio = arg("--ratio", DEFAULTS.ratio);
const outDir = resolve(process.cwd(), arg("--out", DEFAULTS.out));

if (!name || (!promptFile && !inlinePrompt)) {
  console.error(
    "Usage: node scripts/generate-image.mjs --prompt-file <file> --name <slug>\n" +
      "       [--model seedream5_pro] [--ratio 1920:1080] [--out dir]",
  );
  process.exit(1);
}

const key = process.env.RUNWAYML_API_SECRET;
if (!key) {
  console.error("✗ RUNWAYML_API_SECRET is not set.");
  console.error("  It lives in Windows User env — pull it in first:");
  console.error(
    "  $env:RUNWAYML_API_SECRET = [Environment]::GetEnvironmentVariable('RUNWAYML_API_SECRET','User')",
  );
  process.exit(1);
}

/* Prompt files carry two audiences. Everything above a line of three or more
   dashes is for us — the model/ratio/task header, and any note explaining why
   a take was reshot. Only what follows is sent.

   This matters practically: seedream5_pro caps promptText at 4000 characters,
   and commentary was silently eating that budget. Files with no separator are
   sent whole, so the existing v1 prompts still work unchanged. */
const RAW = promptFile
  ? readFileSync(resolve(promptFile), "utf8")
  : inlinePrompt;

const SEPARATOR = /^-{3,}\s*$/m;
const promptText = (
  SEPARATOR.test(RAW) ? RAW.split(SEPARATOR).slice(1).join("\n") : RAW
).trim();

/* Per-model ceilings. Fail here rather than paying for a 400. */
const PROMPT_LIMITS = { seedream5_pro: 4000, gen4_image: 1000 };
const limit = PROMPT_LIMITS[model];
if (limit && promptText.length > limit) {
  console.error(
    `✗ Prompt is ${promptText.length} characters; ${model} accepts ${limit}.`,
  );
  console.error(
    `  Trade detail against something already in the brief rather than appending,`,
  );
  console.error(
    `  or move explanatory notes above a "---" separator so they are not sent.`,
  );
  process.exit(1);
}
console.log(`  prompt: ${promptText.length}/${limit ?? "?"} characters`);

const headers = {
  Authorization: `Bearer ${key}`,
  "X-Runway-Version": VERSION,
  "Content-Type": "application/json",
};

/* ── generate ─────────────────────────────────────────────────────────────── */

console.log(`Model:  ${model}`);
console.log(`Ratio:  ${ratio}`);
console.log(`Prompt: ${promptText.length} chars`);

const create = await fetch(`${API}/v1/text_to_image`, {
  method: "POST",
  headers,
  body: JSON.stringify({ promptText, model, ratio }),
});

if (!create.ok) {
  /* Print the whole body — Runway's validation errors name the accepted
     values, which is how we learn each model's real ratio and length limits
     rather than guessing at them. */
  console.error(`✗ ${create.status} ${create.statusText}`);
  console.error(await create.text());
  process.exit(1);
}

const { id } = await create.json();
console.log(`Task:   ${id}`);

/* ── poll ─────────────────────────────────────────────────────────────────── */

const started = Date.now();
let url;

for (;;) {
  await new Promise((r) => setTimeout(r, 5000));

  const res = await fetch(`${API}/v1/tasks/${id}`, { headers });
  if (!res.ok) {
    console.error(`✗ poll failed: ${res.status}`);
    console.error(await res.text());
    process.exit(1);
  }

  const task = await res.json();
  const secs = Math.round((Date.now() - started) / 1000);

  if (task.status === "SUCCEEDED") {
    url = task.output?.[0];
    if (!url) {
      console.error("✗ SUCCEEDED but no output URL");
      console.error(JSON.stringify(task, null, 2));
      process.exit(1);
    }
    console.log(`  SUCCEEDED (${secs}s)`);
    break;
  }

  if (task.status === "FAILED") {
    console.error(`✗ FAILED (${secs}s): ${task.failure ?? "no reason given"}`);
    console.error(JSON.stringify(task, null, 2));
    process.exit(1);
  }

  console.log(`  ${task.status} (${secs}s)...`);

  if (secs > 600) {
    console.error("✗ timed out after 10 minutes");
    process.exit(1);
  }
}

/* ── download ─────────────────────────────────────────────────────────────── */

mkdirSync(outDir, { recursive: true });

const img = await fetch(url);
const bytes = Buffer.from(await img.arrayBuffer());
const outPath = join(outDir, `${name}.png`);
writeFileSync(outPath, bytes);

/* The prompt is written alongside the master so the two never separate. */
writeFileSync(
  join(outDir, `${name}.prompt.txt`),
  `model: ${model}\nratio: ${ratio}\ntask:  ${id}\n\n${promptText}\n`,
);

console.log(`\n✓ ${outPath}  (${(bytes.length / 1024 / 1024).toFixed(2)} MB)`);
