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
  headline: "A trusted evidence layer for physical assets",
  standfirst:
    "A hybrid mobile and web platform for capturing, managing and verifying trusted evidence about real-world assets.",
  body:
    "Delphi Verify helps organisations create a trusted record of the observed state of a physical asset at an important moment — so counterparties can make decisions using evidence they can independently inspect.",
} as const;

/* ── How it works ─────────────────────────────────────────────────────────
   Section two, and the one that makes the product tangible. Everything else
   on this page describes assurance; this describes a system — a person
   standing in front of an asset, and a counterparty who later has to rely on
   what they saw.

   ⚠️  ONE NOUN FOR THE OBJECT, AND IT IS "CERTIFICATE". Not evidence record,
   not verification record, not report — the app calls it a certificate, the
   verification page calls it a certificate, and /trust and
   /platform/technical call it a certificate. Two names for one thing is
   worse than either name, and a reader who meets both assumes there are two
   things. The only "record" left in this section is the EXTERNAL integrity
   record under stage three, which really is a different object and is not
   ours.

   ⚠️  NO MECHANISM NAMES IN THIS SECTION. No App Attest, no SHA-256, no EAS,
   no Base. Those explain how Delphi implements the assurance and they belong
   on /platform/technical; naming them here answers a question the reader has
   not asked yet, and turns "what does this do for me" into "here is our
   stack". The four-word strip at the foot is as far as the mechanism goes.

   Every claim below is written against what ships today. The notes on each
   stage record WHY it is defensible, because the temptation when this section
   is next edited will be to round the language up.  */
export const howItWorks = {
  /* Short. The user's framing was "from physical asset to trusted evidence",
     which is the right idea at twice the length an eyebrow can carry — the
     others on this site are two or three words. */
  eyebrow: "From asset to evidence",
  headline: "From capture to a certificate another party can rely on.",
  standfirst:
    "Delphi connects the person standing in front of the asset with the people who later need to rely on what was observed. Evidence is captured through the mobile platform, processed and protected by Delphi, then made available as a web-based certificate.",

  stages: [
    {
      id: "capture",
      n: "01",
      kicker: "Capture",
      title: "Create evidence at the asset",
      body:
        "An authorised user captures photos or video directly through Delphi on their mobile device. The platform records the circumstances of capture alongside the media rather than relying on information supplied afterwards.",
      shot: "capture",
      shotAlt:
        "The Delphi capture screen, framing a building with the GPS accuracy and capture time shown over the viewfinder",
      /* Supported today: controlled iOS photo and video capture, precise
         location collection, local review before publication, and
         server-side checks at publication. */
      points: [
        {
          label: "Controlled capture",
          body:
            "Media originates through the Delphi capture environment rather than being selected from an existing photo library.",
        },
        {
          label: "Time & location",
          body:
            "Capture time and device-derived location are recorded as part of the evidence.",
        },
        {
          label: "Immediate review",
          body: "Evidence can be reviewed before the certificate is published.",
        },
      ],
    },
    {
      id: "certificate",
      n: "02",
      kicker: "Create the certificate",
      title: "Corroborate, protect and organise the evidence",
      body:
        "Delphi combines the captured media with supporting signals, checks the integrity of the capture process and creates a structured certificate.",
      shot: "certificate",
      shotAlt:
        "A published Delphi certificate showing its reference, verified status and captured media",
      /* Supported today: publication validates the session, the ordered media
         commitments, capture timestamps, media hashes, device attestation and
         the location and privacy requirements before a certificate exists at
         all. None of those mechanisms is named here — see the warning above. */
      points: [
        {
          label: "Corroboration",
          body:
            "Device, application, capture time, location and media integrity are evaluated together.",
        },
        {
          label: "Integrity protection",
          body:
            "The captured evidence is cryptographically protected so subsequent substitution or alteration can be detected.",
        },
        {
          label: "Privacy controls",
          body:
            "Sensitive information, including location, can be exposed at the level appropriate to the workflow.",
        },
      ],
    },
    {
      id: "verify",
      n: "03",
      kicker: "Verify",
      title: "Give the relying party direct access to the certificate",
      body:
        "The resulting certificate can be opened by the receiving party through a QR code or public reference, allowing them to inspect the evidence and its verification status directly.",
      /* ⚠️  PLACEHOLDER SHOT. This stage is about a counterparty opening the
         record in a browser, with no account and no app — and the only
         screenshots that exist are from the iOS app. The scanner is the
         nearest honest thing: it is the route into a public certificate, and
         it does not show a signed-in Delphi workspace. Replace it with a
         capture of the public verification page the moment one exists, and
         delete this note. */
      shot: "scan",
      shotAlt:
        "The Delphi scanner, ready to open a certificate from its QR code or public reference",
      /* Supported today: unauthenticated public verification by QR or public
         code, exposing the evidence, capture metadata, verification state and
         the external anchor where one has been confirmed. */
      points: [
        {
          label: "No account required",
          body:
            "A recipient does not need to become a Delphi user simply to inspect a public certificate.",
        },
        {
          label: "Evidence and context together",
          body:
            "The certificate can present media, capture time, location, verification status and supporting integrity information.",
        },
        {
          label: "Independent integrity check",
          /* "record", twice, and correctly: this one is the EXTERNAL
             integrity record, which is a different object from the
             certificate and is not Delphi's. Do not sweep it into
             "certificate" — see the noun warning at the top. */
          /* "Where ... has been confirmed" and "can link" are both doing real
             work. Anchoring is asynchronous, so a certificate may be verified
             and correct while its external record is still pending. */
          body:
            "Where an external integrity record has been confirmed, the certificate can link the verifier to that independently maintained record.",
        },
      ],
    },
  ],

  /* The assurance model, in four words, under the three things a customer
     actually touches. Deliberately secondary: the stages above are the story.

     These used to link to the four pillars that expanded them; the pillars
     are gone and so are the links. See the note on `steps`. */
  assurance: {
    label: "What happens behind the certificate",
    /* No hrefs. These carried links to the four assurance pillars that used
       to expand them, and the pillars came off the page. Three of the four
       now have nowhere honest to point, so all four are plain — the section
       below makes the argument they used to link to. */
    steps: [
      { label: "Capture", body: "Evidence originates through Delphi." },
      { label: "Corroborate", body: "Multiple signals are assessed together." },
      {
        label: "Secure",
        body: "Evidence integrity is protected against silent alteration.",
      },
      {
        label: "Verify",
        body: "The relying party can inspect the resulting certificate.",
      },
    ],
  },
} as const;

/* ── More than a photograph ───────────────────────────────────────────────
   Section three, and the one that answers the question a customer actually
   has: why is this better than the photograph I could take myself?

   It is a COMMERCIAL section, not a security one. Most of it is a plain
   two-column comparison a reader can take in without reading a sentence;
   the rest introduces the one idea that makes Delphi a platform rather than
   a camera — that no single signal is trusted on its own.

   ⚠️  NOTHING FROM THE IMPLEMENTATION. No App Attest, no SHA-256, no EAS, no
   Base, no chain ids, no nonces, no expiry windows, no signature counters,
   no server validation rules. Every one of those answers "how", and this
   section only answers "why is it different". They live on
   /platform/technical, which is where a reader who wants them will go.

   ⚠️  THE LEFT COLUMN IS NOT AN ACCUSATION. An ordinary photograph is not
   fraudulent, and this copy must never imply the reader's current process is
   dishonest — origin *may* be uncertain, metadata *can* be altered. The
   problem is that a truthful photograph and an untruthful one look identical
   to the person receiving them, which is a different and far more sellable
   point. It is also why that column carries no red and no crosses: absence
   of assurance is not a failed verification, and on this site the evidence
   palette means something specific. */
export const moreThanAPhotograph = {
  eyebrow: "Why it is different",
  headline: "More than a photograph",
  standfirst: [
    "An ordinary photograph can show what something looked like, but its origin, timing and location can be difficult to establish independently.",
    "Delphi creates evidence through a controlled capture process and evaluates multiple signals together before the certificate is published.",
  ],

  /* Six paired rows. The titles carry the section on their own — the
     sentences are for the reader who stops, not the one who scans. */
  compare: {
    plainLabel: "Ordinary photograph",
    delphiLabel: "Delphi evidence",
    rows: [
      {
        plain: {
          title: "Origin may be uncertain",
          body: "Existing media can be copied, forwarded or supplied from elsewhere.",
        },
        delphi: {
          title: "Controlled capture",
          body: "Evidence is created through Delphi's capture environment.",
        },
      },
      {
        plain: {
          title: "Metadata can be altered",
          body: "Dates, locations and file metadata can be changed or removed.",
        },
        delphi: {
          title: "Capture circumstances recorded",
          body: "Time, location and capture context are bound into the certificate.",
        },
      },
      {
        plain: {
          title: "Individual signals are easy to challenge",
          body: "A photograph or a GPS field on its own provides limited assurance.",
        },
        delphi: {
          title: "Multiple signals corroborated",
          body: "Delphi evaluates several independent signals together.",
        },
      },
      {
        plain: {
          title: "Reproduced images may appear genuine",
          body: "A photograph of a screen or of a printed image can be difficult to tell apart by eye.",
        },
        delphi: {
          title: "Reproduction-risk screening",
          body: "Captured photographs are screened for reproduction risk.",
        },
      },
      {
        plain: {
          title: "Subsequent alteration may be difficult to detect",
          body: "Nothing in an ordinary file establishes whether it changed after it was taken.",
        },
        delphi: {
          title: "Evidence integrity protected",
          body: "The certificate is cryptographically protected so substitution or alteration can be detected.",
        },
      },
      {
        plain: {
          title: "Evidence is usually controlled by one party",
          body: "The side that took the photograph is the side that keeps it.",
        },
        delphi: {
          title: "Direct counterparty verification",
          body: "A certificate can be opened and checked independently of the person who created it.",
        },
      },
    ],
  },

  /* The platform idea, in one sentence and one diagram. */
  model: {
    headline: "No single signal is trusted on its own",
    /* SETS UP the diagram rather than summarising it. This used to say what
       the line under the certificate now says, which meant the reader was
       told the answer, shown the six questions, and then told the answer
       again. The pictures below are six ways an apparently convincing
       photograph can still be wrong; this sentence has to make a reader
       willing to look at them. */
    body:
      "Any one of these can be misleading, and none of them announces when it is. A timestamp and a location field are claims about the evidence, made by the same device that produced it.",
    signalsLabel: "Core Delphi signals",
    hub: "Delphi certificate",
    /* The resolution, and it belongs ON the certificate. Six frames of doubt
       resolve into one object, which is the whole shape of the section. */
    hubNote:
      "None of these signals proves anything on its own. Delphi looks for agreement between them.",
  },

  asset: {
    headline: "One evidence model. Different signals.",
    /* ONE qualification, for the group, rather than a marker against every
       line. Five direction chips in a row make a shipped platform look like
       a plan; one honest sentence and one chip on the heading say the same
       thing without it.

       ⚠️  What must not happen is the qualification quietly going away. The
       signals below are architecture, not inventory — every one of them is
       `available: false` in platform-technical.ts. */
    note:
      "Delphi is designed to incorporate additional asset-specific corroboration according to the needs of each workflow.",
  },
} as const;

/* The six signals every certificate carries today: what each one is called,
   the question it answers, the doubts it has to settle, and a picture.

   THE QUESTIONS ARE ADVERSARIAL, and they have to be. "Is the capture coming
   from a recognised device environment?" describes a check being performed;
   "Is this a trustworthy physical device?" is the question a counterparty is
   actually asking, and it is the one that makes the picture beside it mean
   something. The section is not a feature list — it is six reasons an
   apparently convincing photograph might still be challenged.

   THE CHECKS ARE OVERLAID IN HTML, not drawn into the images. Generated
   lettering is unreliable; overlaid type is crisp, uses the real typeface,
   survives an edit without another render, is readable by a screen reader
   and can be translated. Every prompt in assets-src/ forbids text for the
   same reason — see AnnotationPanel.

   ⚠️  THE CHECKS MUST STAY QUESTIONS. Written as statements they become a
   list of things Delphi detects, which is a capability claim about
   mechanisms this page has deliberately not described. As questions they are
   what a sceptical counterparty would ask, which is true and is the point.

   THE PICTURES ARE ONE INVESTIGATION. One London townhouse, one professional,
   one phone, six moments of a working day: outside the building, at the
   viewfinder, photographing a monitor, in the settings, on the map, and at a
   laptop with the photograph open in an editing workspace. They came out of
   ONE render and were cut apart, so the property, the person, the coat and
   the light are the same by construction rather than by luck. See
   assets-src/features/signals-grid.prompt.txt.

   They replaced six abstract studio objects — a glass monolith, a steel iris,
   a stack of plates — which were handsome and said nothing, and which could
   have sat on any infrastructure site. The old brief is kept beside the new
   one as signals-abstract.prompt.txt. */
export const signals = [
  {
    label: "Device",
    question: "Is this a trustworthy physical device?",
    checks: ["Real device?", "Jailbroken?", "Simulated environment?"],
    /* Outside the townhouse, holding an entirely ordinary phone. Nothing
       about how it looks tells a counterparty anything, which is the frame. */
    image: "signal-device",
  },
  {
    label: "Application",
    question: "Did the genuine Delphi app create the evidence?",
    checks: ["Official application?", "Authentic build?", "Modified software?"],
    /* Over the shoulder at the viewfinder. Seeing an interface is not
       evidence that the interface produced the evidence. */
    image: "signal-application",
  },
  {
    label: "Capture",
    question: "Was the camera observing the real asset?",
    /* The sharpest of the six, and the only one whose picture does the
       arguing on its own: she is photographing a monitor that is displaying
       a photograph of a room. */
    checks: ["Live scene?", "A screen or a print?", "Reproduction risk?"],
    image: "signal-capture",
  },
  {
    label: "Time",
    question: "Did the capture actually happen when claimed?",
    /* Not hypothetical: a phone will let you turn automatic time off and set
       the clock by hand, which is why reading the device's own timestamp and
       calling it verified would be worth nothing. */
    checks: ["Device time correct?", "Manually changed?", "Independent corroboration?"],
    image: "signal-time",
  },
  {
    label: "Location",
    question: "Was the device really where it says it was?",
    checks: ["Current fix?", "Spoofed?", "Accuracy sufficient?"],
    /* A map, a dot and an accuracy circle. A latitude and longitude in
       metadata is a claim, not a fact about the world. */
    image: "signal-location",
  },
  {
    label: "Media integrity",
    question: "Is this still exactly what was captured?",
    checks: ["Original pixels?", "Altered after capture?", "Same evidence committed?"],
    /* The photograph open on a laptop in an editing workspace, the phone
       beside it. The change that matters is never an absurd one. */
    image: "signal-integrity",
  },
] as const;

/* ── Corroboration detail, split honestly ─────────────────────────────────
   `live` is what every certificate carries today. `bySector` is architecture,
   not inventory: each entry is `available: false` in platform-technical.ts and
   is rendered under an explicit direction marker. */
export const corroboration = {
  liveLabel: "Corroborated on every certificate today",
  /* Derived, never hand-listed — see the note on `signals`. */
  live: signals.map((x) => x.label),
  sectorLabel: "Designed to accept asset-specific signals",
  sectorNote:
    "This is what makes Delphi a platform rather than a camera: the model takes corroboration specific to the asset, not simply more photographs. The signals below are development direction.",
  bySector: [
    /* One array, two pages: the asset strip on /platform and the sector
       list on /industries both render this. */
    { sector: "Property", signal: "Address and property reference" },
    { sector: "Yachts", signal: "Vessel identity and navigational data" },
    { sector: "Vehicles", signal: "VIN and telemetry" },
    { sector: "Construction", signal: "Project and milestone data" },
    { sector: "Industrial assets", signal: "Serial number and asset data" },
  ],
} as const;

/* ── Built for the moments where physical reality matters ─────────────────
   Section four, and deliberately the shortest of them. Section three says
   why Delphi evidence is different; this only has to say WHERE that
   difference turns into money, and then hand off to /industries.

   ⚠️  NO SECTOR DETAIL HERE. Property, rentals, yachts and the rest have a
   page of their own, and section three already carries the per-sector
   corroboration signals. Naming them again with their own copy is how this
   page starts looping over itself — the handoff at the foot is a link, not
   a summary.

   ⚠️  THE EIGHT MOMENTS ARE NOT A SEQUENCE. A claim does not follow an
   inspection and a repair does not follow a milestone; they are alternative
   occasions on which somebody needs a certificate. Arrows between them
   would say otherwise, and this page already uses arrows for the one thing
   that IS a sequence — capture, corroborate, secure, verify. */
export const moments = {
  eyebrow: "Where it creates value",
  headline: "Built for the moments where physical reality matters.",
  standfirst:
    "Delphi fits into workflows where an important decision depends on the condition, location, existence or state of a physical asset — especially where different parties may later have different accounts of what happened.",

  events: [
    { icon: "handover", label: "Handover", body: "Establish condition when responsibility changes." },
    { icon: "inspection", label: "Inspection", body: "Create a trusted record of what was observed." },
    { icon: "delivery", label: "Delivery", body: "Record condition at despatch and receipt." },
    { icon: "incident", label: "Incident", body: "Capture contemporaneous evidence of an event." },
    { icon: "claim", label: "Claim", body: "Strengthen the evidential position around loss or damage." },
    { icon: "milestone", label: "Milestone", body: "Establish physical progress at an important project stage." },
    { icon: "repair", label: "Repair", body: "Record condition before and after intervention." },
    { icon: "return", label: "Return", body: "Show what changed during use, hire or custody." },
  ],

  value: {
    headline: "Stronger evidence creates commercial value.",
    body:
      "Where uncertainty about one of these moments has a financial consequence, better evidence can be worth measuring.",
  },

  /* A link, not a second industries page. */
  industries: {
    headline: "The same model applies across very different industries.",
    body:
      "From property and construction to yachts, insurance, vehicles and industrial assets, the underlying trust problem is often the same.",
    label: "Explore where verified evidence applies",
    href: "/industries",
  },
} as const;

/* ── NO LONGER RENDERED ──────────────────────────────────────────────────
   Everything from here to the foot of this file came off /platform when the
   page was cut back to its hero and the how-it-works section, ready for a
   rewrite. It is kept rather than deleted because it is the source material
   for that rewrite, and because some of it was carefully hedged — the
   direction markers on `bySector` and `passports`, and the deliberately
   narrow integrity claim, all took work to get honest and should be reused
   rather than re-derived.

   ⚠️  These say "certificate" and must keep saying it. See the noun warning
   above before reinstating any of it. */
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
