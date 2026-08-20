/* ============================================================================
   PLATFORM — OVERVIEW  (/platform)
   ============================================================================
   The assurance proposition in a few hundred words. The mechanism lives at
   /platform/technical, in platform-technical.ts.

   The split is deliberate: a reader deciding whether Delphi is worth a
   conversation needs to understand the shape of the assurance, not every
   mechanism that produces it. Depth is one click away for the people who need
   it, which is how serious infrastructure companies communicate.

   CLAIMS: this page must stay inside what ships. The corroboration pillar is
   the trap — the sector-specific signals below are DIRECTION, not capability,
   and every one of them is `available: false` in platform-technical.ts. They
   are shown because the extensibility is the platform argument, and they are
   marked so nobody can read them as inventory. Do not remove the marking.
   ========================================================================= */

export const platformHero = {
  eyebrow: "Platform",
  /* Not "Trusted evidence for the physical world" — that is the homepage H1
     and its <title>. Two indexed pages must not share one. */
  headline: "Evidence counterparties can rely on.",
  standfirst:
    "When an important decision depends on the state of a physical asset, Delphi Verify creates a record both sides can trust.",
  body:
    "Rather than trusting a photograph, timestamp or location claim in isolation, Delphi combines multiple signals into a single independently verifiable record.",
} as const;

export type Pillar = {
  id: string;
  n: string;
  title: string;
  body: string[];
  /* Set only where the pillar describes direction rather than capability. */
  status?: "direction";
};

export const pillars: Pillar[] = [
  {
    id: "capture",
    n: "01",
    title: "Trusted capture",
    body: [
      "Evidence is created within Delphi's controlled capture environment, reducing the risk that previously created or unrelated media is presented as current evidence.",
    ],
  },
  {
    id: "corroboration",
    n: "02",
    title: "Corroborate",
    body: [
      "Delphi evaluates multiple signals together, and no single signal is treated as proof on its own.",
    ],
  },
  {
    id: "integrity",
    n: "03",
    title: "Secure",
    body: [
      "Once evidence is published, the captured media and its integrity proof are cryptographically protected, so later substitution or alteration can be detected.",
      /* Deliberately narrow. Authorised users can still edit a certificate's
         title and description, so "the certificate can never change" would be
         false. The claim is about the evidence and its proof, not the whole
         object. */
      "Descriptive details such as the title can be edited by authorised users; the evidence itself and the proof over it cannot be silently changed.",
    ],
  },
  {
    id: "verification",
    n: "04",
    title: "Verify",
    body: [
      "A counterparty can inspect a certificate without needing to trust the person who created it — from a QR code or public code, with no Delphi account.",
      /* Not "does not depend on Delphi existing". The integrity record is
         anchored externally, which is a narrower and defensible claim. */
      "The integrity record is anchored outside Delphi's own systems, so a verifier can compare the certificate proof against an independently maintained record.",
    ],
  },
  {
    id: "privacy",
    n: "05",
    title: "Privacy and control",
    body: [
      "Trusted evidence does not require unnecessary disclosure.",
      "Delphi retains the information verification needs, while exposing sensitive detail — including precise location — only at the level the workflow actually requires.",
    ],
  },
  {
    id: "passports",
    n: "06",
    title: "Asset history",
    status: "direction",
    body: [
      "Evidence becomes more valuable over time. A verified record answers a question about one moment; a sequence of them builds a trusted history.",
      "Persistent asset passports are an active area of product development, for workflows where historical provenance creates additional value. Certificates today are individual records.",
    ],
  },
];

/* ── Corroboration detail, split honestly ─────────────────────────────────
   `live` is what every certificate carries today. `bySector` is architecture,
   not inventory: each entry is `available: false` in platform-technical.ts and
   is rendered under an explicit direction marker. */
export const corroboration = {
  liveLabel: "Corroborated on every certificate today",
  live: [
    "Device",
    "Application",
    "Capture time",
    "Precise location",
  ],
  sectorLabel: "Designed to accept asset-specific signals",
  sectorNote:
    "This is what makes Delphi a platform rather than a camera: the model takes corroboration specific to the asset, not simply more photographs. The signals below are development direction.",
  bySector: [
    { sector: "Property", signal: "Title and address reference" },
    { sector: "Yachts", signal: "Vessel identity and navigational position" },
    { sector: "Vehicles", signal: "VIN and telemetry" },
    { sector: "Industrial assets", signal: "Serial number and IoT" },
    { sector: "Construction", signal: "Project and milestone data" },
  ],
} as const;

/* Stated on the overview because the choice is part of the proposition. The
   mechanism and its limits are on the technical page. */
export const privacyLevels = [
  { level: "Exact", body: "Precise coordinates, where the position is itself the evidence." },
  { level: "Nearby", body: "Coordinates snapped to a coarser grid, address generalised." },
  { level: "Area", body: "An approximate region only, with no specific address." },
] as const;

/* Sectors come from industryShortcuts in content/industries.ts — one list,
   shared with the jump grid on that page, so a new sector appears in both
   without being added twice. */
export const sectorStrip = {
  headline: "One platform. Different evidence for different industries.",
} as const;

export const technicalLink = {
  eyebrow: "For technical reviewers",
  headline: "The full mechanism, stage by stage.",
  /* Named algorithms and providers belong on the technical page, not on the
     public one. This says what the reader will find, not what it is built from. */
  body:
    "Device and application integrity, capture provenance, reproduction-risk screening, media integrity, external anchoring and what independent verification actually exposes — set out in full, including what is not yet shipped.",
  label: "Read the technical model",
  href: "/platform/technical",
} as const;

/* Real app screenshots cross-fading over the backdrop in the hero.

   Only the five curated product shots. The Assets folder also holds
   screenshots_splash, screenshots_settings and screenshots_login — all three
   are excluded deliberately: splash and settings both carry a "Delphi Verify
   Staging / v1.24.1" build marker, and settings additionally shows a
   placeholder account, a credit balance and a Delete account row. None of
   that belongs on a marketing site. If they are ever re-shot from a release
   build with clean data, they can be added here. */
export const platformScreens = [
  "capture",
  "scan",
  "certificate",
  "certificate-location",
  "packs",
] as const;

export const platformCta = {
  headline: "Tell us where trust breaks down in your workflow.",
  primary: { label: "Talk to Delphi", href: "/contact" },
  secondary: { label: "Explore Trust & Security", href: "/trust" },
} as const;
