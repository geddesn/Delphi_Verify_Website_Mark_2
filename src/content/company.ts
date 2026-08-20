/* ============================================================================
   COMPANY
   ============================================================================
   The previous company page described the systems as being operated by
   "pioneering ambassadors of the global digital asset community", which gives
   Delphi a crypto-startup character at precisely the moment it needs to read
   as serious infrastructure. That framing is removed here.

   ⚠️  PLACEHOLDERS: leadership entries, locations and the legal entity block
   are marked below. Enterprise buyers care about who they are contracting
   with — an unnamed team is a genuine obstacle in procurement. Fill these in
   or remove the section; do not ship it with invented names.
   ========================================================================= */

export const companyHero = {
  eyebrow: "Company",
  headline: "Built by people who understand technology, transactions and physical assets.",
  standfirst:
    "Delphi Verify exists because a surprising amount of commercial friction comes down to a simple problem: two parties cannot agree on what was physically true, and neither can prove it. We build the evidence infrastructure that settles it.",
} as const;

export const story = {
  eyebrow: "Why Delphi exists",
  /* Not "Photographs stopped being evidence" — too absolute, and untrue as
     stated. A photograph is still evidence; it is just far easier to
     challenge than it was, which is the actual argument below. */
  headline: "A photograph alone is increasingly easy to challenge.",
  body: [
    "For most of the past century, a photograph was reasonable proof that something existed and looked a particular way. That assumption has quietly collapsed. Images can be generated, altered convincingly, restaged, back-dated or simply taken somewhere else — and the tools to do so are now universal, free and require no skill.",
    "The consequence is not merely that fraud is easier. It is that honest parties can no longer prove they are being honest. A landlord with a genuine record of a property's condition, a contractor who really did complete the works, a claimant whose loss is entirely real — none of them can demonstrate it with a photograph any more, because a photograph no longer demonstrates anything on its own.",
    "Delphi Verify restores that capability. Not by asking anyone to trust an image, but by establishing the conditions under which it was captured, sealing the result, and making the whole thing checkable by whoever needs convincing.",
  ],
} as const;

export const principles = [
  {
    title: "Checkable beats trustworthy",
    body: "We would rather be verifiable than believed. Anything we assert about evidence should be something a third party can confirm without our cooperation.",
  },
  {
    title: "State limitations plainly",
    body: "Delphi establishes when, where and by what a photograph was captured, and that it has not changed since. It does not interpret what the image means. Overstating that boundary would undermine the evidence itself.",
  },
  {
    title: "Evidence must outlive us",
    body: "Anchoring fingerprints externally is a deliberate choice. A customer's ability to verify their evidence should not depend on Delphi's continued existence.",
  },
  {
    title: "Precision in our own claims",
    body: "A company selling evidential rigour cannot be loose about its own compliance position, its capabilities, or what it has actually deployed.",
  },
] as const;

/* ⚠️ PLACEHOLDER — replace with real people or delete the section entirely.
   `showLeadership: false` hides it until then. Never ship invented names. */
/* Sourced from the founders page in the Delphi brand content
   (Slide Deck Manager → brands/delphi/content/pages/founders-and-team.json).
   Real people, real roles — nothing here is invented.

   That source file also carries a founding engineer in Lisbon. He is omitted
   because this section is the two founders; add him here if the intention is
   a team page rather than a leadership one. */
export const showLeadership = true;
export const leadership: {
  name: string;
  role: string;
  location: string;
  bio: string;
  highlights: string[];
  /* Basename in public/assets/team. */
  portrait: string;
}[] = [
  {
    name: "Tess Davies",
    role: "Co-founder & CEO",
    location: "Monaco / UAE",
    bio: "Tess leads company strategy, commercial development, partnerships and fundraising. She runs customer discovery, enterprise relationships and go-to-market activity, drawing on international commercial networks across high-value property and luxury markets.",
    highlights: [
      "Investment & growth strategy",
      "Luxury property & partnerships",
      "Global business expansion",
    ],
    portrait: "tess",
  },
  {
    name: "Nick Geddes",
    role: "Co-founder & CTO",
    location: "Cambridge, UK",
    /* The Global Inkjet Systems / Nano Dimension detail comes from the public
       team page rather than the founders page. It is a specific, checkable
       credential, which is exactly what an enterprise buyer is looking for
       here — remove it if it should not be public. */
    bio: "Nick leads product, technology, engineering architecture, AI and security. A Cambridge-trained engineer, he co-founded Global Inkjet Systems and led it as CEO and CTO through to its acquisition by Nasdaq-listed Nano Dimension, and has held senior technology leadership roles across scientific software, AI and patented engineering technologies.",
    highlights: [
      "Product & engineering",
      "AI & security",
      "Built, scaled and exited ventures",
    ],
    portrait: "nick",
  },
];

/* ⚠️ PLACEHOLDER — confirm before launch. The previous site emphasised Lisbon.
   Enterprise buyers look for a real, named business presence. */
export const showLocations = false;
export const locations: { city: string; country: string; note: string }[] = [];

/* Registered entity, for enterprise procurement. Taken from the Terms of
   Service on the live site.

   `registrationNumber` is deliberately empty: the Delaware file number was not
   supplied, and a procurement team checking an invented one is exactly the
   failure this site is built to avoid. The row hides itself until it is set. */
export const showEntity = true;
export const entity = {
  legalName: "Delphi Verify Inc.",
  jurisdiction: "Incorporated in the State of Delaware, United States",
  registrationNumber: "",
  registeredAddress:
    "251 Little Falls Drive, Wilmington, New Castle County, Delaware 19808, United States",
} as const;

export const contactPage = {
  eyebrow: "Contact",
  headline: "Speak with Delphi Verify.",
  standfirst:
    "The most productive first conversation is usually about a specific problem rather than the technology. If there is a handover that keeps going wrong, a claim that is hard to substantiate, or an inspection that costs more than it should, that is the right place to start.",
  routes: [
    {
      title: "Evaluating Delphi",
      body: "Deployment, integration, pricing and pilots for organisations assessing verified evidence.",
      action: "Request a demonstration",
    },
    {
      title: "Security and procurement",
      body: "Security documentation, data processing agreements and sub-processor information for review teams.",
      action: "Request security documentation",
    },
    {
      title: "Verifying a certificate",
      body: "If someone has sent you a Delphi certificate code, you can open it directly without contacting us.",
      action: "Verify a certificate",
    },
  ],
  email: "contact@delphiverify.com",
} as const;
