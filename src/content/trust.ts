/* ============================================================================
   TRUST CENTRE
   ============================================================================

   THE QUESTION THIS PAGE ANSWERS:

       "Can I trust Delphi Verify, as a company, with my organisation's
        evidence?"

   NOT "how does Delphi evidence work?" — /platform and /platform/technical
   answer that, at length, and this page used to answer it a second time in
   slightly different words. Controlled capture, device and application
   signals, time and location corroboration, media integrity and independent
   verification all belong over there. What belongs here is our posture:
   security, data handling, infrastructure, and an exact statement of where
   our compliance position stands.

   If you find yourself adding a mechanism explanation below, it probably
   wants to be a link to /platform/technical instead.

   ---------------------------------------------------------------------------
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

   There is deliberately NO passage explaining that we are being precise. The
   page demonstrates it by saying "awaiting certification" where a competitor
   would imply certification; narrating that choice on top of demonstrating it
   reads as defensive, and makes the claim weaker rather than stronger.
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
    "Delphi Verify is designed to create evidence others can rely on. We apply the same standard to ourselves: clear security controls, responsible data handling, independent infrastructure and precise statements about our compliance status.",
} as const;

/* Status confirmed by Delphi, 2026-08-20.

   ⚠️ ISO 27001 — the moment the certificate is issued, change `status` to
   "certified" and update the statement with the certifying body and date.
   Until then the badge asset in the brand folder MUST NOT appear on this site;
   displaying a certification mark before issuance is a misrepresentation, and
   an unusually damaging one for a company selling evidential integrity.

   Statements are one line each, on purpose. This block is scanned by a
   procurement reviewer looking for three answers, not read as prose. Anything
   longer than a line belongs in the security documentation we send them. */
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
      "Implementation complete. We are not yet certified, and we will say so until the certificate is issued.",
  },
  {
    framework: "UK / EU GDPR",
    status: "compliant",
    statement:
      "Data protection framework implemented. A data processing agreement is available to customers.",
  },
  {
    framework: "SOC 2",
    status: "not-started",
    statement:
      "No assessment has been started and no report is available. If SOC 2 is a requirement of your procurement process, tell us.",
  },
];

/* ============================================================================
   HOW DELPHI PROTECTS EVIDENCE
   ============================================================================
   Four cards, replacing what were four sections and nineteen labelled rows
   covering security, privacy, evidence integrity and business continuity.

   The individual controls were all true and all defensible; collectively they
   read as a security questionnaire rendered as a web page, and nobody
   remembers nineteen things. Four is the number an enterprise buyer can carry
   into a meeting. The controls themselves now live where a security reviewer
   will actually want them — in the documentation we send on request.

   The stated limitation that used to sit under "evidence integrity" — that
   Delphi establishes when, where and by what a photograph was captured, and
   does not interpret what it shows — is made on /platform, which is the page
   that makes the evidential claim in the first place. It has not been
   softened, it is stated where the claim is.
   ========================================================================= */
export const protections = {
  eyebrow: "Protection",
  headline: "How Delphi protects evidence.",
  items: [
    {
      title: "Secure platform",
      body: "Encryption in transit and at rest, controlled access, segregated environments and monitoring.",
    },
    {
      title: "Privacy by design",
      body: "Data minimisation, controlled sharing and retention based on customer requirements.",
    },
    {
      title: "Evidence integrity",
      body: "Controlled capture, chain of custody, cryptographic sealing and independently checkable integrity records.",
    },
    {
      title: "Durable evidence",
      body: "Managed cloud infrastructure, backups and recovery procedures, with external integrity records that remain independently inspectable.",
    },
  ],
} as const;

/* ============================================================================
   INFRASTRUCTURE ATTRIBUTIONS
   ============================================================================
   A strip, not a section. Naming the systems underneath is worth doing — it
   lets a reviewer check our claims against somebody else's documentation
   rather than ours — but four paragraphs about Apple, Google, Firebase and
   Base is more attention than an attribution deserves on the primary trust
   page. The detail lives on /platform/technical, which is where a reviewer
   who cares about it is going anyway.

   ⚠️  DO NOT reinstate the old Apple line, which described App Attest as
   proving the genuine app on an "uncompromised device". Apple is more careful
   than that: App Attest establishes a genuine Apple device, a genuine
   application and an untampered payload, and Apple explicitly notes that an
   attacker who modifies the operating system may be able to bypass its
   restrictions. If this ever needs a sentence again, the accurate one is:

       "Helps verify that requests originate from a genuine Apple device
        running the genuine Delphi application."

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
  headline: "Built on established infrastructure.",
  items: [
    { logo: "apple", name: "Apple App Attest" },
    { logo: "google-cloud", name: "Google Cloud" },
    { logo: "firebase", name: "Firebase" },
    { logo: "base-network", name: "Base · Ethereum Attestation Service" },
  ],
  note: "Technology attributions, not endorsements, partnerships or certifications.",
  link: { label: "View technical architecture", href: "/platform/technical" },
} as const;

/* ============================================================================
   DOCUMENTATION & SECURITY CONTACT
   ============================================================================
   One closing section carrying what used to be three: the legal documents, a
   vulnerability disclosure block, and a standalone procurement CTA that asked
   for the same thing a second time.
   ========================================================================= */
export const documentation = {
  eyebrow: "Documentation",
  headline: "Security & compliance documentation.",
} as const;

export const legalDocs = [
  { label: "Privacy policy", href: "/privacy", note: "How personal data is handled" },
  { label: "Terms of service", href: "/terms", note: "Contractual terms of use" },
  { label: "Data processing agreement", href: "/contact", note: "Available to customers on request" },
  /* Published, not "available on request". Recipients and international
     transfers are a required disclosure rather than something a reviewer
     should have to ask for, so this points at the table in the policy. */
  { label: "Sub-processor list", href: "/privacy#service-providers", note: "Published in the privacy policy" },
] as const;

export const securityReview = {
  headline: "Running a security review?",
  body:
    "Tell us what your review process requires and we will provide what we have — including being straightforward about anything we do not.",
  cta: { label: "Request security documentation", href: "/contact" },
} as const;

export const securityContact = {
  headline: "Found a security issue?",
  body:
    "We will acknowledge your report, keep you informed while we investigate, and will not pursue action against good-faith security research.",
  email: "contact@delphiverify.com",
} as const;
