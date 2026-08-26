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

/* The contracting entity and contact address are imported, not retyped. The
   Terms name the company; /company shows the same details in its procurement
   block; a reader who compares them must not find two different answers. */
import { brand } from "@/content/site";
import { entity } from "@/content/company";

export type LegalSection = {
  id: string;
  heading: string;
  body: string[];
  /** Enumerated clause. Rendered as a list between `body` and `after` — see
   *  the note in LegalPage. Use it where a reader needs to check whether one
   *  specific item is covered, not for prose that merely has several parts. */
  list?: string[];
  /** Paragraphs that follow the list. Usually the qualification a list needs
   *  after it rather than before it. */
  after?: string[];
  /** Irreducibly tabular disclosure — the lawful-bases mapping and the
   *  sub-processor list. Both are three-column facts a reader cross-references
   *  rather than reads, and prose versions of either are unusable. Rendered
   *  between `list` and `after`. */
  table?: { head: string[]; rows: string[][] };
  todo?: boolean;
};

/* ============================================================================
   PRIVACY POLICY
   ============================================================================
   ⚠️  NOT DRAFTED BY A LAWYER. See the file header.

   ── TWO CLAIMS THAT WERE WRONG, AND MUST NOT COME BACK ────────────────────

   1. "The fingerprint is a hash. It does not contain, and CANNOT BE REVERSED
      to reveal, your photographs, location or personal data."

      Hashing is one-way in the conventional sense, but it is a
      pseudonymisation technique, not anonymisation, and pseudonymised data
      can remain personal data where it can be related back to an identifiable
      person. The v4 scheme publishes salted commitments to the published
      latitude, longitude and capture time, and supplies the verification salt
      as a public input — which is precisely the situation where an absolute
      "cannot" is the wrong word. Section 08 now says what the record contains
      and what it is designed to do, and makes no irreversibility claim.

   2. "Reducing published precision does not weaken verification."

      It does not weaken the INTEGRITY PROTECTION. It does reduce the
      precision of the proposition proved: Nearby establishes an area, not a
      coordinate. Conflating the two overstates the product. Section 06 now
      separates them.

   Both were small pieces of wording. Both mattered, because a company selling
   evidential precision cannot be imprecise about what its own technology
   does — that is the same failure the compliance rules in trust.ts guard
   against, in a different document.

   ── "SENSITIVE" IS USED CAREFULLY ─────────────────────────────────────────
   "Special category data" has a statutory meaning. Ordinary photographs and
   geolocation are not automatically special category, though a photograph can
   become biometric special-category data where it is specifically processed
   for unique identification, and images can reveal special-category facts.
   The intro therefore says "highly privacy-sensitive", which carries the
   intent without asserting a legal classification.

   ── DPIA (not page copy — an internal exercise) ───────────────────────────
   Delphi combines precise location, photography, device behaviour and
   attestation, and potentially persistent histories of people interacting
   with assets. Regulator guidance identifies location and behaviour tracking,
   innovative technology, dataset combination and highly personal data among
   the factors relevant to whether a DPIA is required. One should be carried
   out and retained even if counsel concludes it is not strictly mandatory for
   every workflow.
   ========================================================================= */
export const privacy = {
  title: "Privacy policy",
  updated: "Draft — pending legal review",
  intro:
    "This policy explains what personal information Delphi Verify processes, why, and what control you have over it. Delphi handles photographs of real places and precise capture locations. We treat both as highly privacy-sensitive information.",
  sections: [
    {
      id: "who-we-are",
      heading: "Who we are",
      body: [
        `Delphi Verify provides an evidence-certificate platform. The company responsible is ${entity.legalName}, a corporation incorporated in the State of Delaware, United States.`,
        `Registered address: ${entity.registeredAddress}.`,
        `Privacy enquiries: ${brand.email}.`,
      ],
      /* Outstanding: (a) whether a UK and/or EEA Article 27 representative
         must be appointed — a US-established controller offering services to
         UK or EEA individuals generally requires one, and it must be named
         here; (b) whether a data protection officer is required; (c) a
         dedicated privacy address rather than the general contact one. */
      todo: true,
    },
    {
      id: "our-role",
      heading: "Our role as controller or processor",
      body: [
        "Our data protection role depends on which processing is in question, and it is not the same throughout the service.",
        "Where an organisation uses Delphi Verify to commission evidence — deciding what is captured, why, who may access it and how long it is kept — that organisation is generally the controller for the evidence, and we act as its processor. Our processing is then governed by the data processing agreement with that organisation, and by its instructions.",
        "We are an independent controller for processing where we determine the purposes ourselves: administering accounts, securing and operating the platform, detecting and preventing fraud and misuse, providing support, and meeting our own legal obligations.",
        "Where you use Delphi Verify as an individual rather than through an organisation, we are the controller for that processing.",
        "One organisation can be controller for some processing and processor for other processing at the same time. Which applies turns on who determines the purposes and means, not on who holds the data.",
      ],
    },
    {
      id: "what-we-process",
      heading: "What information we process",
      body: [],
      list: [
        "Account data: the email address associated with your account, and the identity provider used to sign in (Apple, Google, or email and password).",
        "Evidence data: photographs and video captured through the Delphi Verify app, the capture time reported by the device, the device location at the moment of capture, and the accuracy of that location.",
        "Integrity data: device and application attestation records, media hashes, and the proof material required to verify a certificate.",
        "Certificate content: the title, description and other details supplied when publishing.",
        "Organisation data: the jobs, assets, workflows and user roles configured by an organisation using the platform.",
        "Support data: correspondence with us, and the records needed to answer it.",
        "Operational data: logs necessary to run, secure and support the service.",
      ],
      after: [
        "Evidence data may contain information about people other than the person capturing it. Section 05 deals with that specifically.",
      ],
    },
    {
      id: "lawful-bases",
      heading: "Why we process it, and our lawful bases",
      body: [
        "Where we act as controller, we rely on the following lawful bases. Where we act as processor for an organisation, that organisation determines the basis for its own processing.",
      ],
      table: {
        head: ["Purpose", "Information", "Proposed lawful basis"],
        rows: [
          [
            "Providing the service",
            "Account data, evidence data, certificate content, organisation data",
            "Performance of a contract",
          ],
          [
            "Verification and attestation",
            "Integrity data, evidence data",
            "Performance of a contract; legitimate interests in the reliability of certificates",
          ],
          [
            "Security, fraud and misuse prevention",
            "Operational data, integrity data, account data",
            "Legitimate interests in protecting the service and the people who rely on it",
          ],
          [
            "Support",
            "Support data, account data",
            "Performance of a contract; legitimate interests in answering enquiries",
          ],
          [
            "Legal and regulatory compliance",
            "As required in the circumstances",
            "Legal obligation",
          ],
          [
            "Website analytics",
            "Limited usage data, only if analytics are enabled",
            "Consent",
          ],
        ],
      },
      after: [
        "Where we rely on legitimate interests, you may object — see section 11. Where we rely on consent, you may withdraw it at any time, and withdrawal does not affect processing already carried out.",
      ],
      /* ⚠️ The mapping above is proposed, not settled. Counsel must confirm
         each row against the processing actually carried out, run and record
         a legitimate interests assessment for every row relying on it, and
         correct any row where the basis is wrong. Do not simply accept it
         because it looks complete. */
      todo: true,
    },
    {
      id: "people-in-captures",
      heading: "Evidence and people appearing in captures",
      body: [
        "Evidence captured through Delphi Verify records real places, and can contain information about people who have never used the service — a tenant, a family member, an employee, a contractor, a visitor, a vehicle registration, or personal possessions visible in a room.",
        "This policy applies to those people as well as to account holders. If you are identifiable in evidence held by Delphi Verify, the rights in section 11 are available to you.",
        "Where the evidence was captured for an organisation, that organisation is generally the controller and decides what is captured and why. We will usually need to refer a request to it, and will tell you when we do.",
        "Whoever captures evidence is responsible for doing so lawfully, including obtaining any permission needed to photograph a property, asset or location and respecting the rights of people who may appear. Our terms of service and data processing agreements place that responsibility on the capturing party.",
      ],
    },
    {
      id: "location",
      heading: "Location privacy",
      body: [
        "Location is central to what Delphi proves, and among the most privacy-sensitive information we handle.",
        "When publishing a certificate you choose a location privacy level. At 'exact', precise coordinates appear on the certificate. At 'nearby' and 'area', published coordinates are snapped to a coarser grid and the displayed address is generalised.",
        "Reducing published precision does not change the integrity protection applied to the location evidence. It reduces the precision of the location disclosed to certificate viewers: a certificate published at 'nearby' or 'area' establishes an area rather than an exact coordinate, and establishes it just as robustly.",
        "Where the available accuracy cannot support the level requested, the privacy level is automatically restricted rather than published misleadingly.",
      ],
    },
    {
      id: "sharing",
      heading: "Public and private sharing",
      body: [
        "A public certificate can be opened by anyone holding its eight-character code, without a Delphi Verify account. That is the purpose of the product: evidence is only useful if the party who needs convincing can inspect it directly.",
        "Treat a public code or link as capable of reaching anyone. It can be forwarded, and once someone has opened a certificate they may copy, download, screenshot or record what it shows. A code is not access control.",
        "Where the product provides a private or restricted sharing mechanism, the access controls applying to it are described at the point of use. Only treat sharing as restricted where we describe that specific workflow as private.",
        "Decisions about what is captured and what is published are made by the person capturing, or by the organisation they act for. If you are identifiable in a certificate you did not publish, section 05 explains how this policy applies to you.",
      ],
    },
    {
      id: "blockchain",
      heading: "Blockchain and permanent integrity records",
      body: [
        "When an evidence record is sealed, a cryptographic commitment is published to the Ethereum Attestation Service on Base mainnet.",
        "The blockchain record contains cryptographic commitments rather than copies of the photographs or plaintext location data. These commitments are designed to allow integrity verification without publishing the underlying evidence to the blockchain.",
        "The on-chain record is permanent. Deleting a certificate removes the media and certificate data we hold, but does not delete or alter the attestation already published. We do not control that record and cannot revise or withdraw it.",
        "This is worth understanding before publishing, because it is the one part of the process that cannot be undone.",
      ],
    },
    {
      id: "service-providers",
      heading: "Service providers and international transfers",
      body: [
        "We rely on the following providers to operate the service. Each processes information only as needed for the purpose shown.",
      ],
      table: {
        head: ["Provider", "Purpose", "Processing location and transfer basis"],
        rows: [
          [
            "Google Cloud",
            "Managed database and asynchronous task processing",
            "To be confirmed",
          ],
          [
            "Firebase (Google)",
            "Identity, media storage and API surface",
            "To be confirmed",
          ],
          [
            "Apple",
            "Device and application attestation for captures made on iOS",
            "To be confirmed",
          ],
          [
            "Base / Ethereum Attestation Service",
            "Public attestation of cryptographic commitments",
            "Public distributed network, not a single location",
          ],
        ],
      },
      after: [
        "Where information is transferred outside the UK or EEA, we put in place an appropriate transfer mechanism. The mechanism applicable to each provider is shown above once confirmed.",
      ],
      /* ⚠️ Outstanding, and required disclosure rather than nice to have:
         the processing region configured for each provider, and the transfer
         mechanism actually relied on — the UK Extension to the EU–US Data
         Privacy Framework where the provider is certified, or Article 46
         safeguards such as the IDTA or the UK Addendum to the SCCs, with the
         transfer risk assessment recorded. Confirm the list is complete
         against the deployed infrastructure before publication; anything
         added later must appear here. */
      todo: true,
    },
    {
      id: "retention",
      heading: "Retention and deletion",
      body: [
        "You may delete a certificate. Deletion is irreversible: media and certificate data are removed, an audit record of the deletion is retained, and the public code subsequently returns a removed state rather than silently disappearing.",
        "Deletion is asynchronous. Data is removed from live systems first and cycles out of backups afterwards.",
        "You may delete your account, which anonymises or removes the associated profile. Where evidence was created for an organisation, deleting your individual account does not delete that organisation's records.",
      ],
      table: {
        head: ["Information", "Retained", "Determined by"],
        rows: [
          [
            "Evidence and media",
            "Until deleted, or as agreed with the organisation",
            "Customer instruction; enterprise agreement",
          ],
          [
            "Account data",
            "For the life of the account",
            "Contract; deleted or anonymised on closure",
          ],
          [
            "Deletion audit records",
            "Retained after the evidence is deleted",
            "Integrity of the record that a deletion occurred",
          ],
          ["Security and operational logs", "To be confirmed", "Security need; legal obligation"],
          ["Support records", "To be confirmed", "Handling the enquiry and any follow-up"],
          ["Backups", "Maximum cycle to be confirmed", "Backup rotation schedule"],
        ],
      },
      after: [
        "Blockchain attestations are not subject to these periods. As section 08 explains, they are permanent and outside our control.",
      ],
      /* ⚠️ The three "to be confirmed" rows are facts only Delphi holds: log
         retention, support record retention, and the maximum period within
         which deleted data cycles out of backups. State the real figures —
         a retention table with gaps is a disclosure that has not been made. */
      todo: true,
    },
    {
      id: "your-rights",
      heading: "Your rights",
      body: [
        "Under UK and EU data protection law you have rights of access, rectification, erasure, restriction, portability and objection, and the right to withdraw consent where we rely on it. Which rights apply in a given case depends on the circumstances and on the lawful basis for the processing.",
        "You have the right to object to processing carried out on the basis of legitimate interests. We draw that to your attention specifically rather than leaving it in a list.",
        `To exercise any right, contact ${brand.email}. We will respond within the period the law allows and will tell you if we need to verify your identity first.`,
        "Where we act as processor for an organisation, we will refer your request to that organisation, which is responsible for answering it, and will tell you that we have done so.",
        "You may complain to your local supervisory authority at any time. In the United Kingdom that is the Information Commissioner's Office.",
      ],
      after: [
        "Rectification of sealed evidence works differently, because altering a sealed record would destroy the integrity it exists to provide. Our intended approach is to preserve the original record and to correct, annotate, revoke or supersede it, so that the correction is visible rather than the history being silently rewritten.",
      ],
      /* ⚠️ Counsel to confirm that the rectification approach above satisfies
         the right to rectification and the right to erasure given the
         immutable attestation, and to define the operational process for
         handling a request that reaches Delphi but belongs to a customer
         controller — including timescales and what the requester is told. */
      todo: true,
    },
    {
      id: "cookies",
      heading: "This website",
      body: [
        "We use one essential cookie, delphi_cookie_consent, for 180 days to remember whether you accepted or rejected optional services. It is necessary to respect your privacy choice and cannot be disabled through our settings.",
        "With your permission, preferences storage remembers choices such as light or dark theme, and authentication storage supports sign-in on protected Delphi Verify applications. Declining these categories leaves this public website functional.",
        "Analytics are disabled until you consent. If enabled, our EU-hosted PostHog project receives page visits and named interactions together with limited browser and device information. We disable automatic element capture, session replay, person profiles and automatic error capture, and redact public certificate codes from analytics URLs.",
        "Google Maps and OpenStreetMap content are disabled until you consent to embedded maps. Enabling maps sends your IP address and request information to the relevant map provider when its content loads.",
        "You can accept, reject or change any optional category at any time through Cookie settings in the footer. Withdrawing consent stops future collection but does not affect processing already carried out with your consent.",
      ],
    },
    {
      id: "contact",
      heading: "Contact and complaints",
      body: [
        `${entity.legalName}, ${entity.registeredAddress}.`,
        `Privacy enquiries and rights requests: ${brand.email}.`,
        "If you are not satisfied with our response, you may complain to your local data protection supervisory authority.",
      ],
    },
  ] satisfies LegalSection[],
} as const;

/* ============================================================================
   TERMS OF SERVICE
   ============================================================================
   ⚠️  NOT DRAFTED BY A LAWYER. See the file header.

   WHAT THIS IS. A plain-English scaffold that describes how the product
   actually behaves, structured so counsel can complete the three sections
   that genuinely require them rather than rewrite the whole document.

   WHAT IT DELIBERATELY IS NOT. It is not a port of the previously published
   May 2026 Terms, and those should not be pasted back over it. They carried
   very broad disclaimers, asserted AI and liveness capabilities that must
   only appear once actually deployed, and specified Portuguese governing law
   — which is anomalous now the contracting entity is a Delaware corporation.

   THE TONE IS LOAD-BEARING. Plain English, explicit boundaries, no attempt to
   make Delphi verification mean more than it does. The risk at legal review is
   that this reverts to generic defensive boilerplate; the boundaries in
   sections 04 and 05 in particular are the product's proposition stated
   contractually, and weakening them to sound safer would make the document
   less accurate, not more.

   ── SECTIONS COUNSEL MUST COMPLETE (all `todo: true`) ─────────────────────
   16 warranties · 17 liability · 19 governing law. Each states the decisions
   to be taken rather than proposing operative wording, because a drafted
   clause reads as finished and this is the page where that matters most.

   ── NO FEES SECTION, DELIBERATELY ────────────────────────────────────────
   Nothing here governs paid direct-to-consumer transactions yet. When
   subscriptions or paid certificates arrive, a "Fees and subscriptions"
   section slots in between 14 (intellectual property) and 15, and must cover
   price, renewal, cancellation, refunds, tax, the payment processor and
   cooling-off rights. UK distance-selling rules impose pre-contract and
   cancellation requirements, with further subscription-contract rules
   expected in spring 2027. Adding it later is a content change, not a
   restructure — which is why the slot is named here rather than stubbed as
   an empty section that would sit on the live page saying nothing.
   ========================================================================= */
export const terms = {
  title: "Terms of service",
  updated: "Draft — pending legal review",
  intro:
    "These terms govern use of the Delphi Verify application, platform and certificates. They are written to be read: where Delphi verification has a boundary, this document states it rather than leaving it to be inferred.",
  sections: [
    {
      id: "who-with",
      heading: "Who these Terms are with",
      body: [
        `These Terms are an agreement between you and ${entity.legalName}, a corporation incorporated in the State of Delaware, United States ("Delphi Verify", "we", "us").`,
        `Registered address: ${entity.registeredAddress}.`,
        `Contact: ${brand.email}.`,
      ],
      /* The Delaware file number is still unset in company.ts, and the address
         above is the registered agent's rather than a place of business. Both
         are the kind of detail a procurement team checks. */
      todo: true,
    },
    {
      id: "using-delphi",
      heading: "Using Delphi Verify",
      body: [
        "By using Delphi Verify you accept these Terms. If you do not accept them, do not use the service.",
        "You must have the legal capacity to enter into a contract. If you use Delphi Verify on behalf of an organisation, you confirm that you are authorised to accept these Terms for that organisation, and references to 'you' include it.",
        "If your organisation has entered into a separate written agreement with Delphi Verify, that agreement governs to the extent of any conflict with these Terms. Nothing here overrides a negotiated master services agreement, service level agreement or data processing agreement.",
      ],
    },
    {
      id: "service",
      heading: "The service",
      body: [
        "Delphi Verify is a platform for creating, holding and checking evidence about physical assets. Depending on how you access it and what your organisation has arranged, it may include:",
      ],
      list: [
        "capture of photographic and video evidence through the Delphi Verify mobile application",
        "a web platform for organisations, including jobs, workflows and asset records",
        "evidence records assembled from one or more captures",
        "verification certificates published from those records",
        "sharing of certificates, publicly or with specified recipients",
        "verification functionality allowing a recipient to check a certificate",
      ],
      after: [
        "Not every user has an account. A certificate can be opened and checked by a recipient who holds its code, without registering.",
        "The service changes as the product develops. We may add, alter or withdraw features; where a change materially reduces functionality you rely on, section 18 applies.",
      ],
    },
    {
      id: "what-verification-establishes",
      heading: "What Delphi verification establishes",
      body: [
        "A Delphi certificate is evidence about the creation and integrity of specific media. Within the limits described in section 05, a certificate establishes that:",
      ],
      list: [
        "the media was captured through the Delphi Verify application, rather than imported from a photo library or supplied from an external source",
        "the capture passed the device, application and other verification checks applied by Delphi at the time",
        "the capture carries the time and location reported by the device, at the accuracy recorded",
        "the media and published metadata presented for verification match the values cryptographically committed when the evidence record was sealed",
      ],
      after: [
        "The final point is what independent verification actually demonstrates, and it is stated in those terms deliberately: the committed values can be recomputed from the material presented and compared against the public attestation, so the claim is one a third party can test rather than one Delphi asks to be taken on trust.",
        "Verification checks establish what they establish at the time they are applied. They are strong signals, not absolute assertions about a device: the underlying platform attestation service is documented by its provider as unable to definitively identify every device whose operating system has been modified.",
      ],
    },
    {
      id: "what-verification-does-not-establish",
      heading: "What Delphi verification does not establish",
      body: [
        "A certificate does not interpret what the media shows. By itself, a certificate does not establish:",
      ],
      list: [
        "the identity or authority of any person appearing in or creating the media",
        "ownership of an asset, or legal title to it",
        "the value of an asset",
        "regulatory, building or other compliance",
        "the quality of any workmanship shown",
        "fitness for any purpose",
        "the accuracy of any title, description or annotation supplied by a user",
        "that the capture includes everything relevant to the matter in question",
        "that a scene was not arranged or staged before capture",
        "what occurred before or after the capture",
        "that the asset remains in the condition shown",
        "the admissibility of the evidence, or the weight any decision-maker will give it",
      ],
      after: [
        "Delphi Verify does not warrant that a certificate will be accepted by any court, tribunal, insurer, regulator, lender or counterparty. How much weight evidence carries is a matter for whoever is assessing it.",
      ],
    },
    {
      id: "certificates-and-sharing",
      heading: "Evidence, certificates and sharing",
      body: [
        "Publishing a certificate makes the media and metadata it contains available to anyone who can reach it. You decide what is captured, what is published, and to whom a code or link is distributed.",
        "Where a certificate is public, treat its code or link as capable of reaching anyone. It is not a secret, and it is not access control: anyone who holds it can open the certificate, and can copy, download or forward what they see. Only treat a sharing mechanism as restricted where Delphi describes that specific workflow as private.",
        "Before publishing you are responsible for holding the rights and permissions needed to capture and disclose the material — including any permission required to photograph a property, asset or location, and the rights of anyone identifiable in it.",
        "When choosing a location privacy level, consider what the certificate needs to prove rather than what it can disclose. Reducing published precision does not weaken verification.",
      ],
    },
    {
      id: "your-content",
      heading: "Your content and permissions",
      body: [
        "You retain ownership of the media and other content you supply. Delphi Verify claims no ownership of it.",
        "You grant us the licence we need to operate the service for you: to host, store, copy, transmit, process and analyse your content, generate previews and derived representations, make certificates available to the people you authorise, perform verification, and retain the integrity and audit information the service depends on.",
        "That licence is limited to providing, securing, supporting and improving the contracted service. It does not permit us to use your content for unrelated commercial purposes, and it ends when the content is deleted, save where retention is required for the integrity, audit or legal purposes described in sections 08 and 13.",
        "You are responsible for having the rights necessary to grant that licence.",
      ],
    },
    {
      id: "blockchain",
      heading: "Blockchain and cryptographic records",
      body: [
        "When an evidence record is sealed, a cryptographic commitment is published to the Ethereum Attestation Service on Base mainnet. That record is public and permanent.",
        "The commitment is a hash. It does not contain, and cannot be reversed to reveal, your media, location or personal data.",
        "This has a consequence you should understand before publishing: deleting a certificate from Delphi Verify removes the media and certificate data we hold, but does not delete or alter the attestation already recorded on the public blockchain. We do not control that record and cannot revise or withdraw it.",
        "Public blockchain infrastructure is operated independently of Delphi Verify. We do not control its availability, cost or continued operation.",
      ],
    },
    {
      id: "acceptable-use",
      heading: "Acceptable use",
      body: ["You must not:"],
      list: [
        "use the service for any unlawful purpose",
        "use it to commit fraud, or to create evidence intended to mislead",
        "circumvent, manipulate or interfere with capture controls, device or application attestation, reproduction screening, or any other verification control",
        "capture material you have no lawful right to capture, or photograph where photography is prohibited",
        "infringe anyone's privacy rights",
        "infringe copyright or other intellectual property rights",
        "harass, stalk, surveil or endanger any person",
        "upload or publish unlawful, abusive or harmful content",
        "attempt to gain unauthorised access to the service, to any account, or to any system or data",
        "introduce malware or other harmful code",
        "reverse engineer or decompile the service, or conduct security testing against it, except as permitted by applicable law or under our published vulnerability disclosure process",
        "interfere with, overload or degrade the service or the infrastructure it runs on",
        "misrepresent what a Delphi verification result means, or present a certificate as establishing something set out in section 05 as not established",
      ],
      after: [
        "The final prohibition matters as much as the others. Presenting 'Delphi verified' as covering something Delphi does not verify damages the reliability of every other certificate.",
      ],
    },
    {
      id: "accounts",
      heading: "Accounts and organisation users",
      body: [
        "Account details must be accurate and kept up to date. Email and password accounts must complete email verification before use.",
        "You are responsible for activity under your account and for keeping your credentials secure. Do not share an account except where the product provides for shared access. Tell us promptly if you believe your credentials or account have been compromised.",
        "Where an account belongs to an organisation, that organisation's administrators may manage it — including configuring it, accessing records created under it, and removing the user's access. Evidence created for an organisation belongs to that organisation's arrangements with us, not to the individual user's personal account.",
        "We may suspend an account where necessary for security, to address misuse, or to comply with a legal obligation. Section 13 sets out how suspension and termination work.",
      ],
    },
    {
      id: "privacy",
      heading: "Privacy and data",
      body: [
        "Our handling of personal information is governed by the Privacy Policy, and — where your organisation has one in place with us — by the applicable data processing agreement.",
        "Terms used in both documents carry the same meaning: evidence data, location, public and private certificates, deletion, and blockchain commitments.",
      ],
    },
    {
      id: "availability",
      heading: "Availability and third-party services",
      body: [
        "We aim to keep the service available, but we do not guarantee uninterrupted operation. Service levels for enterprise customers are set by agreement.",
        "Parts of the service depend on third-party infrastructure and networks — cloud hosting, identity providers, mobile platform services and public blockchain infrastructure among them. Those services can change or be interrupted in ways outside our control, and we are not responsible for interruptions attributable solely to them. This does not exclude responsibility for our own failure to take reasonable care in selecting, configuring or operating them.",
        "Where the original media and the other data required for verification have been retained, their integrity can be checked against the public attestation without relying on Delphi's verification conclusion. A blockchain attestation alone does not reconstruct evidence: verification requires the media, metadata and other committed inputs as well.",
      ],
    },
    {
      id: "termination",
      heading: "Suspension and termination",
      body: [
        "You may stop using the service at any time, and may close your account. Where evidence was created under an organisation's account, closing your individual access does not remove that organisation's records.",
        "We may suspend or restrict access where you have breached these Terms, where we reasonably suspect fraud or unlawful use, where there is a security risk, where we are required to do so by law, or for non-payment where fees apply. Except where the risk or a legal obligation requires immediate action, we will give notice and, where the breach can be put right, a reasonable opportunity to do so.",
        "Business users: we may also terminate for convenience on reasonable written notice, or as set out in any separate agreement.",
        "Consumers: we will not terminate your access arbitrarily. We will act only on the grounds set out above, will tell you why, and your statutory rights are unaffected.",
        "After termination, access to certificates and evidence held in the account ends, subject to any retention agreed with an organisation. Deletion follows the Privacy Policy. Blockchain attestations already published remain, as described in section 08.",
      ],
    },
    {
      id: "intellectual-property",
      heading: "Intellectual property",
      body: [
        "Delphi Verify owns the platform, applications, software, APIs, documentation, brand and trade marks. You receive a limited, non-exclusive, non-transferable right to use the service in accordance with these Terms.",
        "You own your content, as set out in section 07. Nothing in these Terms transfers ownership of it to us, or of our intellectual property to you.",
        "You must not copy, redistribute, sublicense, reverse engineer or create derivative works from the service, except to the extent applicable law expressly permits despite this restriction.",
      ],
    },
    {
      id: "reporting-content",
      heading: "Reporting infringing or unlawful content",
      body: [
        `If you believe material published through Delphi Verify infringes your rights or is unlawful, contact us at ${brand.email}. Tell us where the material is — the certificate code or link — what the problem is, and how to reach you. We will review reports and may remove material or suspend accounts under sections 09 and 13.`,
        "To report a security vulnerability, use the disclosure route on our trust page rather than this address.",
      ],
      /* Counsel to decide, before public certificate hosting scales: whether a
         designated DMCA agent must be registered with the US Copyright Office
         to rely on the section 512 safe harbour, what notice and counter-notice
         handling is required, and what repeat-infringer policy to adopt. The
         clause above is a reporting route, not a safe-harbour procedure. */
      todo: true,
    },
    {
      id: "warranties",
      heading: "Warranties and disclaimers",
      body: [
        "For counsel. The service is provided on the basis described in these Terms; the scope of any express warranty, and which implied warranties can properly be excluded, needs to be settled separately for the two audiences below.",
        "Business users: the intended position is that the service is provided without implied warranties to the extent permitted by law, save for the accuracy commitments made in sections 04 and 05, which are the product's proposition and should not be disclaimed away.",
        "Consumers: statutory rights cannot be excluded. Under UK consumer law a service must be performed with reasonable care and skill and must conform to what was promised about it, and a blanket disclaimer of those obligations would be unenforceable as well as inaccurate.",
      ],
      todo: true,
    },
    {
      id: "liability",
      heading: "Liability",
      body: [
        "For counsel. This section must be drafted with separate treatment for business and consumer users, rather than as a single broad exclusion. The previously published Terms attempted to exclude almost every category of damage, which is neither enforceable against consumers nor appropriate to Delphi's positioning.",
        "Business users — to be settled: which categories of indirect and consequential loss are excluded; the aggregate liability cap and how it is measured; carve-outs from that cap; a customer indemnity covering unlawful or customer-controlled content and third-party infringement claims; and whether privacy and security obligations warrant a separate, higher cap.",
        "Consumers — to be settled: the statutory carve-outs required by applicable consumer law, including liability for death or personal injury caused by negligence and for fraud, which cannot be excluded. UK guidance specifically warns against contractual rights weighted significantly in favour of the business.",
        "Applying to both: liability should not be excluded for matters within Delphi's control, and the drafting should not undercut the accuracy commitments in section 04.",
      ],
      todo: true,
    },
    {
      id: "changes",
      heading: "Changes to the service and Terms",
      body: [
        "We may update these Terms. When we do, we will post the updated version with a revised date, and where a change is material we will notify affected users by a reasonable means.",
        "Material changes apply from the date they take effect, not retrospectively. Continued use after that date indicates acceptance; if you do not accept a material change, you may stop using the service and close your account.",
        "Your statutory rights are unaffected, and this section does not permit us to change a separately negotiated agreement.",
      ],
    },
    {
      id: "governing-law",
      heading: "Governing law and disputes",
      body: [
        "For counsel. Delphi Verify Inc. is a Delaware corporation, which makes Delaware law the obvious candidate for the general and business-user position — but the choice should be made deliberately across three cases rather than applied uniformly, and the Portuguese governing law in the previously published Terms should not be carried over.",
        "General and business users — to be settled: governing law, and whether disputes go to agreed courts or to arbitration.",
        "Separate enterprise agreements: governed by whatever the relevant master services agreement specifies, which takes precedence under section 02.",
        "Consumers — to be settled: confirmation that the mandatory consumer protections and jurisdiction of the user's country of residence are unaffected, which they are in most jurisdictions regardless of a choice-of-law clause.",
      ],
      todo: true,
    },
    {
      id: "contact",
      heading: "Contact",
      body: [
        `${entity.legalName}, ${entity.registeredAddress}.`,
        `General and legal enquiries: ${brand.email}.`,
      ],
    },
  ] satisfies LegalSection[],
} as const;
