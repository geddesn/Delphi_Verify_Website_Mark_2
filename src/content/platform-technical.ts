/* ============================================================================
   PLATFORM — TECHNICAL MODEL  (/platform/technical)
   ============================================================================
   The deep page. /platform carries the assurance proposition in a few hundred
   words; everything here is for the reader who needs the mechanism — a
   security reviewer, an architect, a procurement technical assessor.

   Written against PRODUCT_TECHNICAL_DESCRIPTION.md — the current shipped
   implementation. Claims here are deliberately limited to what exists.

   Anything aspirational is marked `available: false` or carried in a clearly
   labelled roadmap block. Do not promote a roadmap item to a capability claim
   without confirming it has shipped — a procurement team that catches one
   overstatement discounts the whole site, and the product being sold here is
   evidential accuracy.
   ========================================================================= */

export const technicalHero = {
  eyebrow: "Technical model",
  headline: "How Delphi decides that evidence can be trusted.",
  standfirst:
    "Delphi secures the path from capture to certificate: attesting the device with Apple App Attest, requiring capture inside the Delphi app, screening for reproduced images, binding time and location to the record, and anchoring a cryptographic proof on a public blockchain.",
  backLabel: "Platform overview",
} as const;

export type Stage = {
  id: string;
  n: string;
  title: string;
  summary: string;
  detail: string[];
};

export const stages: Stage[] = [
  {
    id: "capture",
    n: "01",
    title: "Capture",
    summary:
      "Evidence originates inside the Delphi capture environment. It cannot be supplied from outside it.",
    detail: [
      "Photos and videos are recorded through the Delphi Verify iOS app using the device camera. Media cannot be selected from the photo library, imported from another device, or uploaded from an external source. This single constraint removes the largest category of evidential fraud: submitting an image that is genuine, but is not of this asset, at this time, in this place.",
      "A certificate holds between one and twenty items of evidence, and both photos and video are supported. Each item is reviewed before it is accepted into the draft.",
      "The app requires foreground precise location, and can refuse to capture when iOS reports reduced location accuracy. Position samples are stabilised on the device, and samples that are stale, invalid or insufficiently accurate are rejected rather than recorded with a caveat.",
      "A capture session is single-use and expires twenty-four hours after the first capture. Evidence assembled in one session cannot be quietly extended or reused later.",
    ],
  },
  {
    id: "attest",
    n: "02",
    title: "Attest",
    summary:
      "The device and the application prove they are what they claim to be, using Apple App Attest.",
    detail: [
      "On first use, the app generates an App Attest key in the device's secure hardware, attests it against Apple, and registers the verified device with Delphi. The attestation public key and signature counter are retained.",
      "At publication, the app signs a canonical payload covering the capture session, the session nonce, the selected privacy level and the ordered list of media commitments. Delphi verifies that the device belongs to the user, that the platform and attestation environment are valid, that the assertion signature and bundle identity are correct, and that the signature counter has strictly advanced.",
      "The practical consequence is worth stating plainly: an ordinary API client cannot publish arbitrary media as though it had come from the trusted iOS capture flow. The attestation is what makes the capture constraint enforceable rather than merely stated.",
      "Photos are additionally screened for reproduction risk — images of screens, printed photographs and other reproduced surfaces — which is the most common way an otherwise sound capture pipeline is defeated. Analysis returns an accepted, rejected or technically-failed result, and a rejected analysis blocks publication.",
    ],
  },
  {
    id: "seal",
    n: "03",
    title: "Seal",
    summary:
      "The evidence is committed, hashed and recorded in a single publication transaction.",
    detail: [
      "Source media is hashed with SHA-256 before upload, and the complete manifest is committed in advance. The server later requires the publication proof to reference exactly the expected commitments, in capture order — so media cannot be substituted, reordered or added after the fact.",
      "Publication is refused if the session has expired or been used, if media counts, order or commitments do not match, if hashes are invalid or duplicated, if a photo analysis was rejected, if timestamps fall outside the session window, if the privacy requirements are unmet, or if the device is not verified.",
      "On success the certificate is written together with its media, proof, verification status and a pending blockchain anchor, and a public eight-character code is issued.",
    ],
  },
  {
    id: "anchor",
    n: "04",
    title: "Anchor",
    summary:
      "A proof is published to the Ethereum Attestation Service on Base, outside Delphi's control.",
    detail: [
      "After the certificate is committed, Delphi submits an Ethereum Attestation Service (EAS) attestation containing the certificate proof to Base mainnet, chain ID 8453.",
      "The anchor moves from pending to submitted to confirmed, or records a failure with a stored error. The public report distinguishes a certificate that has been created from one whose record is confirmed on-chain — a distinction we surface rather than smooth over, because the two are not the same assurance.",
      "Once confirmed, the report exposes the transaction hash and attestation UID, which link directly to the external EAS explorer. The purpose is narrow and worth being precise about: it establishes that this exact proof existed in this exact form at that point in time, on a record Delphi does not control and cannot quietly revise.",
    ],
  },
  {
    id: "verify",
    n: "05",
    title: "Verify",
    summary:
      "Anyone holding the code can inspect the evidence and check it independently.",
    detail: [
      "A certificate opens from a QR code or an eight-character public code. No account and no relationship with Delphi is required — which matters, because the party who most needs to trust the evidence is rarely the party who created it.",
      "The report presents the media, the device-reported capture time, the number and type of evidence files, the capture location and accuracy, capture and device verification status, and the blockchain anchor state.",
      "An expandable independent-verification section exposes the decoded proof fields and media hashes, so a technical reviewer can recompute the relevant values rather than taking the interface at its word.",
      "If a certificate has been deleted, the code returns a permanent removed state rather than silently disappearing.",
    ],
  },
];

/* Corroborating signals. `available: false` items are roadmap and are rendered
   as such — never as capability. Confirm before promoting any of them. */
export const signals = [
  { label: "Apple App Attest", note: "Hardware-backed device and app attestation", available: true },
  { label: "In-app capture only", note: "No library import or external upload", available: true },
  /* Photographs specifically — video does not receive the same analysis, and
     "reproduction screening" unqualified implies it does. */
  { label: "Photo reproduction screening", note: "Photographs screened for screens, prints and reproduced surfaces", available: true },
  { label: "Precise location required", note: "Reduced-accuracy capture refused", available: true },
  { label: "Device capture time", note: "Bound to a single-use 24-hour session", available: true },
  { label: "SHA-256 media hashing", note: "Committed before upload, verified at publication", available: true },
  { label: "EAS anchor on Base", note: "Chain ID 8453, externally inspectable", available: true },
  { label: "Video evidence", note: "With thumbnail and media property validation", available: true },
  { label: "Asset identifiers", note: "VIN, serial, title or consignment reference", available: false },
  { label: "Navigational position", note: "Vessel and marine corroboration", available: false },
  { label: "QR and NFC tags", note: "Physical asset tagging", available: false },
  { label: "Telemetry and IoT", note: "Connected asset data", available: false },
] as const;

export const roadmapNote = {
  headline: "What is shipped, and what is not",
  body:
    "The signals above the divider are in the product today. Those below it are development direction, shown because they explain where the platform is going rather than what it currently does. We would rather be clear about the boundary than let it be inferred.",
} as const;

/* Location privacy is a genuine differentiator. The overview page states the
   three levels; the mechanism and its limits belong here. */
export const locationPrivacy = {
  eyebrow: "Location privacy",
  headline: "Prove where, without exposing exactly where.",
  standfirst:
    "Location is the most sensitive thing Delphi records. Evidence usually needs to establish where something was — but it rarely needs to publish that to the nearest metre for anyone holding the code.",
  levels: [
    {
      level: "Exact",
      body: "Precise coordinates are shown on the certificate. Appropriate where the specific position is itself the evidence.",
    },
    {
      level: "Nearby",
      body: "Public coordinates are snapped to a coarser grid, and the displayed address is generalised.",
    },
    {
      level: "Area",
      body: "Only an approximate area is published — enough to establish region without disclosing a specific address.",
    },
  ],
  note:
    "The privacy level is chosen at publication, and is automatically restricted if the available accuracy cannot support the level requested. Reduced public precision does not weaken verification: the underlying capture retains the device-derived evidence needed to check the proof.",
} as const;

export const deployment = {
  eyebrow: "Deployment",
  headline: "How Delphi is used today.",
  standfirst:
    "Verification is only useful where the work already happens. Here is what deploying Delphi currently involves — and what it does not yet include.",
  points: [
    {
      title: "iOS capture app",
      body: "Evidence is captured through the Delphi Verify app on iOS, by the people who already attend the asset. Sign-in with Apple, Google or email.",
      available: true,
    },
    {
      title: "Third-party verification",
      body: "Certificates open from a QR code or public code with no account and no onboarding, so counterparties, adjusters and lenders can check evidence directly.",
      available: true,
    },
    {
      title: "Certificate management",
      body: "Published certificates can be browsed, edited where authorised, and deleted — with deletion recorded and the public code returning a removed state.",
      available: true,
    },
    {
      title: "Programmatic integration",
      body: "A partner-facing API for creating capture requests and retrieving certificates from your own systems is not yet available. Integration requirements are something we are actively scoping with early customers.",
      available: false,
    },
    {
      title: "Android capture",
      body: "Capture is currently iOS only. The device attestation model is built on Apple App Attest; an Android equivalent is not yet shipped.",
      available: false,
    },
  ],
  note:
    "If your deployment depends on something in the second group, tell us. Knowing which of these actually blocks a rollout is genuinely useful to us.",
} as const;
