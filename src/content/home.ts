/* ============================================================================
   HOMEPAGE CONTENT
   ============================================================================
   The homepage answers four questions in about thirty seconds:
     1. What does Delphi do?      → hero
     2. Why does it matter?       → the pattern, then business value
     3. Where can I use it?       → industries
     4. Why should I trust it?    → how it works, trust, check it yourself

   NOTE ON CLAIMS: everything here is written to be defensible. Where a claim
   depends on a fact only Delphi can confirm (certifications, deployments,
   volumes), it is either omitted or explicitly marked. Do not add numbers,
   logos or outcomes until they are real — a procurement officer who catches
   one overclaim discounts the entire site.
   ========================================================================= */

export const hero = {
  eyebrow: "Evidence infrastructure",
  headline: "Trusted evidence for the physical world.",
  standfirst:
    /* "create a trusted record of the observed …", not "establish". Delphi
       records what was observed; it does not determine physical reality. */
    "Delphi Verify helps organisations create a trusted record of the observed condition, location and state of physical assets at important moments — reducing disputes, fraud risk and uncertainty between counterparties.",
  /* Illustrative sample rendered in the hero evidence panel.
     Mirrors the real report: eight-character public code, device-reported
     capture time, SHA-256 media hash, and the actual verification stages. */
  sample: {
    status: "Delphi verified",
    assetLabel: "Residential property · exterior · 4 photos, 1 video",
    certificateId: "4K7M-92QX",
    capturedAt: "2026-05-27 11:28:36",
    coordinates: "50.9219, −1.3875 · nearby",
    hash: "9f2c4e8a71b3d05fca6e19b84d7c2035e8a1f6b9c4d70e2a",
    chain: [
      { label: "Device attestation", state: "verified" },
      { label: "In-app capture", state: "verified" },
      { label: "Reproduction screening", state: "verified" },
      { label: "Time & location", state: "verified" },
      { label: "EAS anchor · Base", state: "verified" },
    ],
  },
} as const;

/* ── The pattern ───────────────────────────────────────────────────────────
   The intellectual foundation of the company. This section is what makes
   Delphi legible as a platform rather than a property tool: it names the
   recurring situation, then shows the same shape appearing everywhere.

   NOTHING RENDERS THIS TODAY. `conditions` was the head of /industries until
   the jump tiles replaced it: four abstract headings a reader had to map onto
   their own operation, standing between them and the nine concrete scenarios
   that do the same job better. Kept because the argument is still the right
   one and still unwritten anywhere else — see point 4 in pages/Industries.tsx. */
export const pattern = {
  eyebrow: "The pattern",
  headline: "Where physical assets and money meet, trust becomes expensive.",
  intro:
    "From a property sale to a yacht charter, an insurance claim or a construction milestone, the same problem keeps appearing: one party needs reliable evidence about the physical world that another party is willing to accept.",
  conditions: [
    {
      n: "01",
      title: "A valuable physical object",
      body: "Something real whose condition, location or existence carries financial weight.",
    },
    {
      n: "02",
      title: "Two or more counterparties",
      body: "A transaction, a handover, or a transfer of responsibility between parties.",
    },
    {
      n: "03",
      title: "Different incentives",
      body: "Each side holds incomplete information, and each has reason to remember events differently.",
    },
    {
      n: "04",
      title: "A financial consequence",
      body: "Disagreement about what was true costs somebody meaningful money.",
    },
  ],
  conclusion:
    /* Not "removes the argument by establishing what was true". Delphi records
       what was observed and protects that record; it does not adjudicate the
       facts, and it cannot remove a dispute. */
    "When these conditions are present, disagreement about physical reality becomes expensive. Delphi Verify gives both sides a stronger shared record of what was observed — in a form either can check independently.",
} as const;

/* The hero's phone. Three screens rather than the platform page's five: the
   homepage is making one point — capture it, seal it, check it — and a longer
   cycle starts to read as a product tour before the reader has been told what
   the product is for. */
export const heroScreens = ["capture", "certificate", "scan"] as const;

/* ── Closing CTA ──────────────────────────────────────────────────────────
   The previous homepage ended at the footer with no closing call to action —
   a straightforward conversion loss. */
/* Used by the homepage and /platform/technical. The prompts do the work the
   old paragraph did, in a third of the words — and each one names a moment a
   buyer will recognise from their own operation. */
export const closing = {
  /* "Industry", not "workflow". The homepage pairs this with the nine
     sector tiles, and a reader scanning those is being asked to find
     themselves on a list of industries — the question above the list has
     to be the one the list answers. /platform/technical shows the same
     prompts without the tiles and reads no worse for it. */
  headline: "Where does trust break down in your industry?",
  /* Sits over the tile grid. Short, because the tiles are the content. */
  tilesLabel: "Find yours",
  prompts: [
    "A handover that goes wrong.",
    "A claim that is hard to substantiate.",
    "An inspection that costs more than it should.",
    "A milestone nobody off-site can verify.",
    "A transfer of responsibility nobody recorded properly.",
  ],
  primary: { label: "Request a demonstration", href: "/contact" },
  secondary: { label: "Explore the platform", href: "/platform" },
} as const;
