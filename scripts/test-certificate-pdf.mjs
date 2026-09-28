import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const port = 4198;
const origin = `http://127.0.0.1:${port}`;
const server = spawn("node", ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { stdio: "ignore" });
let browser;

try {
  for (let attempt = 0; attempt < 50; attempt++) {
    try { if ((await fetch(origin)).ok) break; } catch { /* Server is starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  browser = await chromium.launch({ executablePath: existsSync(chrome) ? chrome : undefined });
  const page = await browser.newPage({ acceptDownloads: true });
  const gps = { lat: 43.852857, lng: 7.635702, accuracy: 1000, capturedAt: "2026-07-05T19:52:13Z" };
  let count = 2;
  let description = "Rose gold and diamonds";
  let tileRequests = 0;
  let mediaRequests = 0;
  const mediaImage = await readFile("public/assets/product/certificate-340.webp");
  const wideImage = await sharp(mediaImage).rotate(90).webp().toBuffer();
  await page.route("**/__certificate-media/**", (route) => {
    mediaRequests++;
    const index = Number(new URL(route.request().url()).searchParams.get("token")?.split("-").at(-1));
    return route.fulfill({ body: index % 2 ? wideImage : mediaImage, contentType: "image/webp" });
  });
  await page.route("https://tile.openstreetmap.org/**", (route) => {
    tileRequests++;
    return route.abort();
  });
  await page.route("**/api/verify/WO5D1KMZ", (route) => route.fulfill({ json: {
    publicCode: "WO5D1KMZ", viewCount: 0, title: "RolexTess", description,
    capturedAt: gps.capturedAt, gps,
    address: { formattedAddress: "Via Roma 12, Dolceacqua, Liguria, Italy", city: "Dolceacqua", county: null, region: "Liguria", country: "Italy" },
    media: Array.from({ length: count }, (_, index) => ({
      index: index + 1, type: "photo", sha256: "a".repeat(64),
      downloadUrl: `https://firebasestorage.googleapis.com/v0/b/example/o/photo.jpg?alt=media&token=test-${index}`, thumbnailDownloadUrl: null,
      durationMs: null, hasAudio: null, capturedAt: gps.capturedAt, gps,
    })), verificationStatus: "verified", captureVerification: { status: "verified", verifiedCaptures: 2 },
    deviceVerification: { status: "verified", verifiedAt: gps.capturedAt },
    anchor: { status: "confirmed", chainId: 8453, attestationUid: null, txHash: null, blockNumber: null, anchoredAt: null },
    mediaProof: { version: 4 },
  } }));
  for (const [scenario, mediaCount, expectedPages, accuracy, expectedAddress, text] of [
    ["2", 2, 1, 1000, "Liguria, Italy", "Rose gold and diamonds"],
    ["4", 4, 2, 250, "Dolceacqua, Liguria, Italy", "Rose gold and diamonds"],
    ["8", 8, 4, 10, "Via Roma 12, Dolceacqua, Liguria, Italy", "Rose gold and diamonds"],
    ["long", 4, 2, 250, "Dolceacqua, Liguria, Italy", "The original capture documents the object, its condition, and the surrounding context. ".repeat(4)],
    ["very-long", 2, null, 1000, "Liguria, Italy", "Complete description preserved across pages. ".repeat(500)],
  ]) {
    count = mediaCount;
    description = text;
    gps.accuracy = accuracy;
    await page.goto(`${origin}/v/WO5D1KMZ`);
    await page.evaluate(() => {
      const policy = document.createElement("meta");
      policy.httpEquiv = "Content-Security-Policy";
      policy.content = "img-src 'self' data:";
      document.head.append(policy);
    });
    await page.getByText(/Captured on/).first().waitFor();
    assert.match(await page.locator("main").innerText(), /UTC/);
    await page.getByText(expectedAddress, { exact: true }).waitFor();
    const downloadPromise = page.waitForEvent("download", { timeout: 30_000 });
    await page.getByRole("button", { name: "Download PDF" }).click();
    const download = await downloadPromise;
    assert.equal(download.suggestedFilename(), "delphi-certificate-WO5D-1KMZ.pdf");
    const bytes = await readFile(await download.path());
    if (process.env.PDF_PREVIEW_PATH) await writeFile(process.env.PDF_PREVIEW_PATH.replace(/\.pdf$/i, `-${scenario}.pdf`), bytes);
    const pdf = await PDFDocument.load(bytes);
    if (expectedPages === null) assert.ok(pdf.getPageCount() > 2);
    else assert.equal(pdf.getPageCount(), expectedPages);
    assert.equal(pdf.getTitle(), "Delphi Verify certificate WO5D-1KMZ");
  }
  assert.ok(mediaRequests > 0, "Certificate media must use the local proxy");
  assert.equal(tileRequests, 0, "PDF must not fetch map tiles");
  console.log("Certificate PDF download: 2, 4 and 8 images; long descriptions; UTC date; location accuracy; no map tiles");
} finally {
  await browser?.close();
  server.kill();
}
