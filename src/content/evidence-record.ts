/* ============================================================================
   EVIDENCE RECORD — SHARED FIXTURE
   ============================================================================
   One sealed record, rendered twice: WebEvidenceRecord and
   MobileEvidenceRecord. Both read from here.

   ⚠️  THIS FILE EXISTS BECAUSE THE TWO MUST AGREE. The renderings sit one
   above the other on /platform/renderings, and a viewer WILL compare them. If
   the phone says nineteen captures and the desktop says twenty, or the codes
   differ by a character, the only thing they learn is that neither is real.
   Restating any of this inside a component defeats the point of the file.

   ⚠️  ONLY WHAT THE CERTIFICATE ACTUALLY CARRIES. Today's record establishes
   that specific media was captured through the app, on a device that passed
   attestation, at the device-reported time and location, and that nothing has
   changed since it was sealed. It does not establish that the depicted state
   is what somebody says it is, and it adjudicates nothing. Every line below
   names a RECORDED FACT — "capture time recorded" — never a conclusion. Add a
   signal here only once the underlying check exists; inventing one first is
   how a marketing page ends up describing software that does not.

   The nine captures are pictures; the record says twenty. That gap is shown
   rather than hidden — the desktop strip ends on a +11 tile, which is what a
   record of twenty would do at that width.
   ========================================================================= */

export const RECORD = {
  address: "18 Cadogan Square, London",
  job: "Property Condition — Pre-Tenancy Inspection",
  /* The persistent identifier for this evidence, in the same monospace the
     public certificate uses. A reader should learn to recognise the shape. */
  code: "W1MQ-E4ML",
  captureCount: 20,
  window: "14:32–14:47",
  date: "22 August 2026",
  completed: "22 Aug 2026",
  locationShort: "Cadogan Sq.",
  locationLong: "Cadogan Square, London SW1X",
  /* Cadogan Square, to match the pin. The map geocodes `address` above
     rather than taking a lat/lng, so these two must be kept honest by hand —
     they are what a reader checks the pin against. */
  latitude: "51.4966° N",
  network: "Base mainnet",
  attestation: "EAS",
  schema: "Delphi Evidence v4",
  state: "Active",
} as const;

export type Capture = {
  /* The record's own index, not the gallery's position. The sealed
     attestation commits to media, latitude, longitude and capture time AT
     each index, so this ordering is attested rather than presentational.
     Reorder these and they no longer describe the record they claim to. */
  n: number;
  /** Basename under public/assets/captures. */
  name: string;
  label: string;
  time: string;
};

export const CAPTURES: Capture[] = [
  { n: 1, name: "cadogan-front-elevation", label: "Exterior — Front elevation", time: "14:32:18" },
  { n: 2, name: "cadogan-entrance-hall", label: "Entrance hall", time: "14:34:02" },
  { n: 3, name: "cadogan-reception-room", label: "Reception room", time: "14:35:47" },
  { n: 4, name: "cadogan-study", label: "Study", time: "14:36:31" },
  { n: 5, name: "cadogan-principal-bedroom", label: "Principal bedroom", time: "14:37:12" },
  { n: 6, name: "cadogan-bathroom", label: "Bathroom", time: "14:37:55" },
  { n: 7, name: "cadogan-kitchen", label: "Kitchen — West wall", time: "14:38:21" },
  { n: 8, name: "cadogan-garden", label: "Garden", time: "14:44:09" },
  { n: 9, name: "cadogan-rear-elevation", label: "Exterior — Rear elevation", time: "14:47:03" },
];

/* Which capture is open in the desktop viewer. Seven, the kitchen, because a
   record whose open item is the first one reads as untouched. */
export const OPEN_CAPTURE = CAPTURES[6];

/** What was recorded about the open capture. */
export const OPEN_DETAIL = {
  /* Nudged 5 m west of its original 0.161083° W on 2026-08-23. At the zoom
     the /trust Exact panel now uses, the old longitude put the dot astride
     the party wall between two houses, which reads as a capture that cannot
     say which building it was taken at — the opposite of what that panel
     claims. Moved toward No. 18, so it also narrows the standing gap between
     these coordinates and RECORD.address rather than widening it.
     Keep in step with CAPTURE_POINT below. */
  coordinates: "51.496612° N, 0.161155° W",
  accuracy: "±4.2 m",
  source: "Delphi Verify iOS",
  media: "4032 × 3024 · 4.8 MB JPEG",
  /* Of the ORIGINAL BYTES — not of a preview, a filename or a URL. That is
     the whole reason a third party can recompute it and get the same answer. */
  fingerprint: "SHA-256 c8f2a74d…89e23d",
} as const;

/* The same position as OPEN_DETAIL.coordinates above, in the decimal degrees
   a map library wants. Two representations of one fact, so they are declared
   adjacently: if the capture moves, both lines change together or the site
   starts contradicting itself in public.

   Used by the location-privacy panels on /trust, which plot this point at
   three disclosure levels. scripts/fetch-borough.mjs holds a copy — it cannot
   import TypeScript — and asserts that this point falls inside the borough
   polygon it generates, so a transposed sign fails the build rather than
   quietly relocating the property. */
export const CAPTURE_POINT = { lat: 51.496612, lng: -0.161155 } as const;

/* Each names a fact that was recorded, never a conclusion drawn from it. */
export const VERIFICATION = [
  "Captured directly in Delphi Verify",
  "Capture time recorded",
  "Location recorded",
  "Media integrity sealed",
];

/* The order the property was walked. A route with times on it is the start of
   a capture session; twenty isolated photographs are not. */
export const TIMELINE = [
  { time: "14:32", label: "Exterior" },
  { time: "14:34", label: "Entrance hall" },
  { time: "14:37", label: "Reception" },
  { time: "14:38", label: "Kitchen" },
  { time: "14:47", label: "Rear exterior" },
];

/* The six signals behind "no single signal is trusted on its own", as they
   stand for THIS record.

   ⚠️  `available` IS LOAD-BEARING. It must reflect what the product actually
   checks today, and false must render as "not yet" rather than as a tick.
   Ticking a check that does not exist is the one failure this page cannot
   survive: everything else on it is a design proposal, but a verification
   claim is a statement about shipped software. Promote an entry only when the
   underlying check does. */
export const SIGNALS = [
  {
    label: "Device",
    note: "Hardware attestation passed",
    available: true,
  },
  {
    label: "Application",
    note: "Authentic Delphi application",
    available: true,
  },
  {
    label: "Capture",
    note: "Media captured through the in-app camera",
    available: true,
  },
  {
    label: "Time",
    note: "Capture time recorded and sealed",
    available: true,
  },
  {
    label: "Location",
    note: "Location recorded per capture and sealed",
    available: true,
  },
  {
    /* Screening for photographs OF photographs. Described on /platform as
       something the app does; kept here as the one entry that shows what a
       signal looks like before it is claimed. Flip it when it ships. */
    label: "Reproduction",
    note: "Re-capture screening — not yet in this record",
    available: false,
  },
];
