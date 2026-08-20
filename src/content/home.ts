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
   recurring situation, then shows the same shape appearing everywhere. */
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

/* ── The trust model ───────────────────────────────────────────────────────
   The pattern names the problem; this names the position. Two counterparties,
   one independent record, neither side holding the pen.

   CLAIMS: the four stages below are what ships today and match the evidence
   chain in `hero.sample`. Corroboration covers device, time and location —
   NOT asset identity, which is roadmap in every entry of industries.ts. Do
   not add "asset signals" here until it is real. */
export const trustModel = {
  eyebrow: "The position",
  headline: "Neither side holds the pen.",
  standfirst:
    "Both parties need the same account of a physical thing, and neither can be the one who writes it. Delphi Verify sits between them — recording what was true, and letting either side check it without asking the other.",
  parties: [
    {
      id: "a",
      label: "Party A",
      roles: "Owner · Seller · Landlord · Charter company · Insurer · Lender",
      holds: "Holds the asset, and the burden of evidencing it.",
      concern: "Will the other side accept my evidence?",
    },
    {
      id: "b",
      label: "Party B",
      roles: "Buyer · Tenant · Charterer · Claimant · Borrower · Contractor",
      holds: "Relies on the account, and carries the cost of it being wrong.",
      concern: "Was the damage already there?",
    },
  ],
  stages: [
    { n: "01", title: "Capture", body: "In-app, on an attested device." },
    { n: "02", title: "Corroborate", body: "Device, time and precise location." },
    { n: "03", title: "Seal", body: "Hashed and anchored, so change is evident." },
    { n: "04", title: "Verify", body: "Openly checkable, without an account." },
  ],
  event: {
    label: "Physical event",
    examples:
      "Handover · Inspection · Delivery · Incident · Damage · Completion · Claim · Return",
    note: "Delphi Verify records what was true about a physical asset at a specific moment.",
  },
  outcomes: [
    "Fewer disputes",
    "Less fraud",
    "Faster decisions",
    "Evidence that holds",
  ],
} as const;

/* ── Business value ────────────────────────────────────────────────────────
   Deliberately placed before any mention of hashes, GPS or blockchain.
   This is the section that makes the site legible to a CFO, an underwriter
   or an asset owner rather than only to a CTO. */
export const value = {
  eyebrow: "Commercial impact",
  headline: "Trust creates measurable value.",
  standfirst:
    "Verified evidence changes what an organisation can safely transact, how much checking it pays for, and how much risk it carries into every handover.",
  pillars: [
    {
      title: "Increase revenue",
      body: "Enable higher-trust transactions, remote decisions and premium services that would otherwise require someone to attend in person before anyone commits.",
    },
    {
      title: "Increase profit",
      body: "Reduce manual inspection, repeat visits, administration and the cost of managing disputes after the fact.",
    },
    {
      title: "Reduce risk",
      body: "Strengthen the evidential position, deter opportunistic claims, and establish clearer responsibility at the point where custody changes hands.",
    },
    {
      /* "Support", not "Increase". Delphi does not raise what an asset is
         worth; it reduces the information asymmetry that discounts it. */
      title: "Support asset value",
      body: "Build a trusted history that reduces information asymmetry for future buyers, lenders and insurers.",
    },
  ],
} as const;

/* ── The product itself ───────────────────────────────────────────────────
   Real captures from the iOS app rather than stock photography or an
   illustration. For a product whose whole claim is authenticity, showing the
   actual thing is both more persuasive and more consistent. */
export const product = {
  eyebrow: "The product",
  headline: "Capture, seal, share — from a phone.",
  standfirst:
    /* Not "no inspector required" — some deployments do use inspectors,
       specialists or contractors. The claim is that a separate visit is
       avoidable where the workflow allows, not that inspection never happens. */
    "Evidence can be captured by authorised people already present at the asset — an agent, a captain, a site manager or an inspector — avoiding a separate visit where the workflow allows.",
  shots: [
    {
      name: "capture" as const,
      alt: "The Delphi Verify camera capturing a house, showing a live GPS accuracy reading and timestamp overlaid on the viewfinder",
      caption:
        "Capture happens inside the app, with time and GPS accuracy shown live. Nothing can be imported from the photo library.",
    },
    {
      name: "certificate" as const,
      alt: "A published Delphi certificate showing its code, a Delphi Verified status, and the evidence photo with coordinates, timestamp and QR code",
      caption:
        "The published certificate: its code, verification status, and the evidence with time and location bound into the image.",
    },
    {
      name: "certificate-location" as const,
      alt: "A certificate's capture location shown on a map with coordinates, accuracy in metres and the resolved address",
      caption:
        "Capture location, accuracy and address — published at the precision level chosen at publication, not always exact.",
    },
  ],
} as const;

/* ── How it works (condensed) ─────────────────────────────────────────────
   The full treatment lives on /platform. Here it exists only to establish
   that there is a rigorous method behind the claim. */
/* Four steps, stated in plain language. This used to render the five technical
   stages from platform-technical.ts under a headline that said "four" — the
   count was wrong, and the homepage is the wrong place for attestation and
   anchoring mechanics. The mechanism lives on /platform. */
export const howItWorks = {
  eyebrow: "The method",
  headline: "Capture, corroborate, secure, verify.",
  standfirst:
    "Delphi does not rely on a single signal. Evidence is accepted only when several independent checks agree.",
  chain: [
    {
      n: "01",
      title: "Capture",
      body: "Evidence originates inside Delphi's controlled capture environment.",
    },
    {
      n: "02",
      title: "Corroborate",
      body: "Independent signals are evaluated together. No single signal is treated as proof on its own.",
    },
    {
      n: "03",
      title: "Secure",
      body: "The evidence and its proof are protected, so later substitution or alteration can be detected.",
    },
    {
      n: "04",
      title: "Verify",
      body: "A counterparty can inspect the certificate without trusting whoever created it.",
    },
  ],
  linkLabel: "How Delphi works",
  linkHref: "/platform",
} as const;

/* ── Trust strip ──────────────────────────────────────────────────────────
   Precise language only. "Aligned with" and "in progress" are used
   deliberately and must not be upgraded to "certified" until certification
   is actually held. */
/* One concise block, not a four-point summary of the Trust Centre. The detail
   is one click away and repeating it here only lengthened the homepage. */
export const trustStrip = {
  eyebrow: "Assurance",
  headline: "Built to be examined.",
  standfirst:
    "For the organisations Delphi is designed to serve, a security review is not optional. The controls, the data handling and the current certification status are documented in full — including the parts still in progress.",
  linkLabel: "Open the trust centre",
  linkHref: "/trust",
} as const;

/* REMOVED: the independent-verification section.

   Three reasons, all of them substantive rather than length:
   - it linked to /verify-hashes, a route that does not exist;
   - it claimed verification "does not depend on Delphi being honest, solvent,
     or still in business", which overstates independence — the media itself
     is held by Delphi, and only the proof is anchored externally;
   - the mechanism (decoded proof fields, media hashes, recomputation) belongs
     on /verify, where implementation detail increases trust rather than
     competing with the commercial argument.

   The "Verify a certificate" route is still offered in the header and hero. */

/* ── Closing CTA ──────────────────────────────────────────────────────────
   The previous homepage ended at the footer with no closing call to action —
   a straightforward conversion loss. */
/* Used by the homepage and /platform/technical. The prompts do the work the
   old paragraph did, in a third of the words — and each one names a moment a
   buyer will recognise from their own operation. */
export const closing = {
  headline: "Where does trust break down in your workflow?",
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
