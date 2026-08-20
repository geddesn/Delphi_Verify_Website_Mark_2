/* ============================================================================
   TRUST CENTRE
   ============================================================================

   Statuses below were confirmed with Delphi on 2026-08-20:
   ISO 27001 implementation complete, awaiting independent certification
   (~2–4 weeks); GDPR compliant; SOC 2 not started.

   ⚠️  Re-confirm before launch, and again whenever any of it changes.  ⚠️

   The rule, which is worth holding to strictly:

       "certified"    → an auditor has issued a certificate. Nothing less.
       "in-progress"  → an audit is genuinely underway, with an engaged auditor.
       "aligned"      → controls designed against the framework. No audit.
       "pending-certification" → implementation done, auditor not yet issued.
       "not-started"  → no assessment begun. Say so, or omit the framework.

   Overstating any of these is the single fastest way to lose an enterprise
   deal. Procurement teams verify certification claims, and a company selling
   evidence integrity that overstates its own compliance position has
   contradicted its entire proposition.
   ========================================================================= */

export type ComplianceStatus =
  | "certified" /* An auditor has issued a certificate. Nothing less. */
  | "pending-certification" /* Implementation complete, awaiting the auditor. */
  | "in-progress" /* Audit genuinely underway. */
  | "compliant" /* A legal obligation met (e.g. GDPR) — not a certification. */
  | "aligned" /* Designed against a framework. No audit. */
  | "not-started"; /* Say so, or omit the framework entirely. */

export const trustHero = {
  eyebrow: "Trust centre",
  headline: "Built to be examined.",
  standfirst:
    "Delphi Verify asks organisations to rely on its evidence. That is a serious request, and it deserves more than a reassuring paragraph. This section sets out how the system is secured, how data is handled, how evidence integrity is maintained, and exactly where our certification position currently stands.",
} as const;

export type TrustPillar = {
  id: string;
  title: string;
  summary: string;
  items: { label: string; body: string }[];
};

export const pillars: TrustPillar[] = [
  {
    id: "security",
    title: "Security",
    summary:
      "The controls protecting the platform, the evidence it holds, and the people who access it.",
    items: [
      {
        label: "Secure architecture",
        body: "Segregated environments, least-privilege service access, and infrastructure operated on established cloud platforms rather than self-managed hardware.",
      },
      {
        label: "Encryption",
        body: "Evidence is encrypted in transit and at rest. Cryptographic material is managed through platform key management rather than held in application code.",
      },
      {
        label: "Access control",
        body: "Role-based access, authentication controls for administrative functions, and logging of privileged actions.",
      },
      {
        label: "Device and application integrity",
        body: "Capture is refused on devices that fail integrity checks or where the application cannot be attested as authentic.",
      },
      {
        label: "Monitoring",
        body: "Platform monitoring and alerting on availability and anomalous access patterns.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    summary:
      "Delphi handles photographs of real places and the locations at which they were taken. Both warrant care.",
    items: [
      {
        label: "Data minimisation",
        body: "Evidence packages carry what verification requires. Additional personal data is not collected because it might one day be useful.",
      },
      {
        label: "Location sensitivity",
        body: "Location is among the most sensitive data Delphi processes. Certificates are designed so that evidence can be verified without exposing more precision than the situation requires.",
      },
      {
        label: "Customer control",
        body: "Customers determine what is captured, who may open a certificate, and what is shared with a counterparty.",
      },
      {
        label: "Retention",
        body: "Retention periods are defined by customer agreement. Evidence intended to be durable and data intended to be transient are handled differently.",
      },
      {
        label: "No third-party trackers on this site",
        body: "This website self-hosts its fonts and does not load third-party tracking scripts by default. Cookie choices are respected rather than assumed.",
      },
    ],
  },
  {
    id: "integrity",
    title: "Evidence integrity",
    summary:
      "The properties that make Delphi evidence worth relying on, and the ways it can be checked.",
    items: [
      {
        label: "Capture provenance",
        body: "Evidence originates inside the Delphi capture environment. Images cannot be imported from a gallery or supplied from an external source.",
      },
      {
        label: "Chain of custody",
        body: "Each stage from capture to certificate is recorded, so the path the evidence took is itself part of the record.",
      },
      {
        label: "Cryptographic sealing",
        body: "Evidence packages are reduced to a fingerprint. Any subsequent change produces a different fingerprint, making alteration detectable.",
      },
      {
        label: "Independent verification",
        body: "The fingerprint is anchored on a public blockchain. Verification does not require trusting Delphi, or Delphi continuing to exist.",
      },
      {
        label: "Stated limitations",
        body: "Delphi establishes that a photograph was captured at a given time and place, through a verified device and application, and has not changed since. It does not interpret what the photograph means. That distinction matters, and we would rather state it than let it be assumed.",
      },
    ],
  },
  {
    id: "continuity",
    title: "Business continuity",
    summary:
      "Evidence is only useful if it is available when it is needed — which may be years after capture.",
    items: [
      {
        label: "Availability",
        body: "Platform hosted on established cloud infrastructure with managed redundancy.",
      },
      {
        label: "Backup",
        body: "Evidence data is backed up, with restoration procedures documented and tested.",
      },
      {
        label: "Disaster recovery",
        body: "Recovery procedures are defined, with objectives agreed as part of enterprise agreements.",
      },
      {
        label: "Independent durability",
        body: "Because fingerprints are anchored externally, a certificate holder retains the means to verify evidence integrity independently of Delphi's own systems.",
      },
    ],
  },
];

/* Status confirmed by Delphi, 2026-08-20.

   ⚠️ ISO 27001 — the moment the certificate is issued, change `status` to
   "certified" and update the statement with the certifying body and date.
   Until then the badge asset in the brand folder MUST NOT appear on this site;
   displaying a certification mark before issuance is a misrepresentation, and
   an unusually damaging one for a company selling evidential integrity. */
export const compliance: {
  framework: string;
  status: ComplianceStatus;
  statement: string;
  /* Badge filename in public/assets/certifications. Add one ONLY alongside a
     status of "certified" — the Trust page will not render it otherwise, and
     that gate is deliberate. See the note above `infrastructure`. */
  mark?: string;
}[] = [
  {
    framework: "ISO/IEC 27001",
    status: "pending-certification",
    statement:
      "Our ISO/IEC 27001 implementation is complete and we are awaiting independent certification. We are not yet certified, and we will say so until the certificate is issued.",
  },
  {
    framework: "Data protection (UK / EU GDPR)",
    status: "compliant",
    statement:
      "Delphi Verify processes personal data in accordance with UK and EU data protection law. A data processing agreement is available to customers.",
  },
  {
    framework: "SOC 2",
    status: "not-started",
    statement:
      "A SOC 2 assessment has not been started, and no report is available. If SOC 2 is a requirement of your procurement process, tell us — knowing which standards our customers actually need is genuinely useful to us.",
  },
];

/* ============================================================================
   INFRASTRUCTURE ATTRIBUTIONS
   ============================================================================
   Technology logos, NOT certification marks. Every entry states something the
   product verifiably does, each traceable to PRODUCT_TECHNICAL_DESCRIPTION.md.

   ⚠️  WHY THERE ARE NO ISO 27001 OR SOC 2 BADGES HERE.

   The previous site showed both, beside copy describing "ISO 27001 and SOC 2
   Type II readiness". A badge is scanned; a caveat is read. Together they
   assert a certification that is not held.

   SOC 2 is the harder line. That artwork is the AICPA SOC service-organization
   mark, which AICPA licenses only to organisations that have completed a SOC
   examination and hold a report. SOC 2 has not been started here, so using it
   would be a licensing violation on top of a false claim — and procurement
   teams verify certification claims as a matter of routine.

   ISO 27001 certification is expected within weeks. When the certificate is
   ISSUED — not before — set that entry's status to "certified" in `compliance`
   above and give it a `mark`. The Trust page renders a badge only for a
   "certified" row, so nothing else needs changing and nothing can leak early.

   Stripe appeared on the old page and is omitted: there is no payment
   processing anywhere in the product description, so it would have attributed
   something that does not happen.
   ========================================================================= */
export const infrastructure = {
  eyebrow: "Built on",
  headline: "The systems underneath, named.",
  standfirst:
    "Delphi runs on established infrastructure rather than self-managed hardware, and the guarantees on this page depend on specific, checkable technology. Naming it lets a reviewer verify our claims against somebody else's documentation instead of ours.",
  items: [
    {
      logo: "apple",
      name: "Apple App Attest",
      body: "Hardware-backed attestation that a capture came from the genuine Delphi app on an uncompromised device. This is what makes the in-app capture rule enforceable rather than merely stated.",
    },
    {
      logo: "google-cloud",
      name: "Google Cloud",
      body: "Managed Postgres and asynchronous task processing. Evidence sits on operated infrastructure with managed redundancy, not on hardware we maintain ourselves.",
    },
    {
      logo: "firebase",
      name: "Firebase",
      body: "Identity, media storage and the API surface. Every private request carries a verified identity token before any evidence is touched.",
    },
    {
      logo: "base-network",
      name: "Base · Ethereum Attestation Service",
      body: "Certificate proofs are anchored as EAS attestations on Base mainnet, chain ID 8453 — a record Delphi does not control and cannot quietly revise.",
    },
  ],
  note: "These are technology attributions, not endorsements, partnerships or certifications. Each names a system Delphi depends on, so that our claims can be checked against its documentation rather than ours.",
} as const;

export const complianceNote = {
  headline: "On the precision of these statements",
  body:
    "We have chosen to state our certification position exactly, including where certification has not yet been obtained. A company whose product is evidential integrity should not describe its own compliance position loosely. If a certification matters to your procurement process and we do not yet hold it, tell us — it is useful for us to know which standards our customers actually require.",
} as const;

export const legalDocs = [
  { label: "Privacy policy", href: "/privacy", note: "How personal data is handled" },
  { label: "Terms of service", href: "/terms", note: "Contractual terms of use" },
  { label: "Data processing agreement", href: "/contact", note: "Available to customers on request" },
  { label: "Sub-processor list", href: "/contact", note: "Available on request" },
] as const;

export const securityContact = {
  headline: "Reporting a security issue",
  body:
    "If you believe you have found a vulnerability in Delphi Verify, please contact us directly. We will acknowledge your report, keep you informed while we investigate, and will not pursue action against good-faith security research.",
  email: "contact@delphiverify.com",
} as const;
