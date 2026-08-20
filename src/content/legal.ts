/* ============================================================================
   LEGAL PAGES
   ============================================================================

   ⚠️  NOT LEGAL ADVICE — REVIEW BEFORE PUBLISHING  ⚠️
   ---------------------------------------------------------------------------
   This is a structured scaffold describing how the product actually behaves,
   drawn from PRODUCT_TECHNICAL_DESCRIPTION.md. It is NOT a substitute for the
   existing published policies, and it is not drafted by a lawyer.

   Before launch, either:
     (a) port the current live text from delphiverify.com/privacy and /terms
         into the sections below, or
     (b) have these reviewed and completed by your legal adviser.

   Sections that require a decision or a fact only Delphi holds are marked
   `todo: true` and render with a visible reviewer's note in non-production
   builds, so an unfinished clause cannot quietly ship.
   ========================================================================= */

export type LegalSection = {
  id: string;
  heading: string;
  body: string[];
  todo?: boolean;
};

export const privacy = {
  title: "Privacy policy",
  updated: "Draft — pending legal review",
  intro:
    "This policy explains what personal data Delphi Verify processes, why, and what control you have over it. Delphi handles photographs of real places and the locations at which they were captured; both are treated as sensitive.",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      body: [
        "Delphi Verify provides an evidence-certificate platform. For the purposes of data protection law, the data controller is the registered entity identified on our company page.",
      ],
      todo: true,
    },
    {
      id: "what-we-collect",
      heading: "What we collect",
      body: [
        "Account data: the email address associated with your account, and the identity provider used to sign in (Apple, Google, or email and password).",
        "Evidence data: photographs and video captured through the Delphi Verify app, together with the capture time reported by the device, the device location at the moment of capture, and the accuracy of that location.",
        "Integrity data: device and application attestation records, media hashes, and the proof material required to verify a certificate.",
        "Certificate content: the title and optional description you supply when publishing.",
        "Operational data: logs necessary to run, secure and support the service.",
      ],
    },
    {
      id: "location",
      heading: "Location data",
      body: [
        "Location is central to what Delphi proves, and is among the most sensitive data we handle.",
        "When publishing a certificate you choose a location privacy level. At 'exact', precise coordinates appear on the certificate. At 'nearby' and 'area', published coordinates are snapped to a coarser grid and the displayed address is generalised.",
        "Reducing published precision does not weaken verification: the underlying capture retains the evidence needed to check the proof.",
        "Where the available accuracy cannot support the level requested, the privacy level is automatically restricted rather than published misleadingly.",
      ],
    },
    {
      id: "sharing",
      heading: "Who can see a certificate",
      body: [
        "A published certificate can be opened by anyone holding its eight-character public code. That is the purpose of the product: evidence is only useful if the party who needs convincing can inspect it without an account.",
        "You control what is captured and to whom you distribute a code.",
      ],
    },
    {
      id: "blockchain",
      heading: "Blockchain records",
      body: [
        "A cryptographic fingerprint of the evidence is published to the Ethereum Attestation Service on Base mainnet. This record is public and, by design, cannot be altered or removed by Delphi.",
        "The fingerprint is a hash. It does not contain, and cannot be reversed to reveal, your photographs, location or personal data.",
        "This has a consequence worth stating plainly: while certificate data can be deleted from Delphi, the on-chain fingerprint is permanent.",
      ],
    },
    {
      id: "retention",
      heading: "Retention and deletion",
      body: [
        "You may delete a certificate. Deletion is asynchronous and irreversible: media and certificate data are removed, an audit record of the deletion is retained, and the public code subsequently returns a removed state.",
        "You may delete your account, which anonymises or removes the associated profile.",
        "Retention periods for enterprise customers are set by agreement.",
      ],
      todo: true,
    },
    {
      id: "your-rights",
      heading: "Your rights",
      body: [
        "Under UK and EU data protection law you have rights of access, rectification, erasure, restriction, portability and objection. To exercise any of them, contact us.",
        "You may also complain to your local supervisory authority.",
      ],
    },
    {
      id: "processors",
      heading: "Sub-processors",
      body: [
        "Delphi Verify relies on infrastructure providers to operate the service. A current sub-processor list is available to customers on request.",
      ],
      todo: true,
    },
    {
      id: "cookies",
      heading: "This website",
      body: [
        "This site self-hosts its fonts and does not load third-party tracking scripts by default. Any analytics are loaded only after consent, and declining leaves the site fully functional.",
      ],
    },
  ] satisfies LegalSection[],
} as const;

export const terms = {
  title: "Terms of service",
  updated: "Draft — pending legal review",
  intro:
    "These terms govern use of the Delphi Verify application, platform and certificates.",
  sections: [
    {
      id: "service",
      heading: "The service",
      body: [
        "Delphi Verify allows an authenticated user to capture photographic and video evidence through the Delphi Verify iOS application, publish it as a certificate, and allow third parties to verify that certificate.",
      ],
    },
    {
      id: "what-delphi-establishes",
      heading: "What a certificate establishes — and what it does not",
      body: [
        "A Delphi certificate establishes that specific media was captured through the Delphi Verify application, on a device that passed attestation, at the device-reported time and location recorded, and that the evidence has not been altered since it was sealed.",
        "A certificate does not interpret what the media shows. It does not establish ownership, value, legal title, fitness, compliance, or the accuracy of any description supplied by the user.",
        "Delphi does not warrant that a certificate will be accepted as evidence by any court, tribunal, insurer, regulator or counterparty.",
        "This boundary is stated deliberately. Overstating what the product proves would undermine the value of what it does prove.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      body: [
        "You must not attempt to circumvent capture controls, device or application attestation, or reproduction screening.",
        "You must not capture evidence you have no lawful right to capture, and you are responsible for obtaining any permission required to photograph a property, asset or location.",
        "You must not use the service to harass, surveil or endanger any person.",
      ],
    },
    {
      id: "accounts",
      heading: "Accounts",
      body: [
        "You are responsible for activity under your account and for keeping your credentials secure. Email and password accounts must complete email verification before use.",
      ],
    },
    {
      id: "availability",
      heading: "Availability",
      body: [
        "We aim to keep the service available but do not guarantee uninterrupted operation. Service levels for enterprise customers are set by agreement.",
        "Because certificate fingerprints are anchored externally, certificate holders retain a means of verifying evidence integrity independently of Delphi's own systems.",
      ],
      todo: true,
    },
    {
      id: "liability",
      heading: "Liability",
      body: [
        "To be completed by legal counsel: limitation of liability, indemnities, and applicable exclusions.",
      ],
      todo: true,
    },
    {
      id: "governing-law",
      heading: "Governing law",
      body: [
        "To be completed: governing law and jurisdiction, consistent with the registered entity.",
      ],
      todo: true,
    },
  ] satisfies LegalSection[],
} as const;
