/* ============================================================================
   INDUSTRIES
   ============================================================================
   Nine sectors, grouped into four families, on a single page.

   Each is written as scenario → problem → application → value. The SCENARIO is
   the headline, not the sector name: "A charter returns with damage and the
   parties disagree about when it happened" does more work than "Yachts &
   marine" ever will, and it is the same trust problem restated nine times,
   which is the whole argument.

   DELIBERATELY NOT ON THIS PAGE:
   - The universal evidence line (App Attest, in-app capture, reproduction
     screening, device time, precise location, EAS anchor). Repeating it nine
     times dragged the page back into implementation detail. It lives on
     /platform and /platform/technical; this page links there once.
   - Per-sector roadmap markers. Nine "X would strengthen this sector further"
     lines made the platform read as unfinished in every vertical. The same
     information is now stated once, in the cross-industry section, under a
     single development-direction marker.

   `corroboration` below is retained per sector because it is true and useful
   when the individual vertical pages are built. It is NOT rendered on this
   page. Do not reintroduce it card-by-card.

   When an individual vertical page is built, add `pageHref` and the card
   becomes a link automatically.
   ========================================================================= */

/* ── Commercial outcomes ───────────────────────────────────────────────────
   The company-wide value framework. Sectors tag two or three each.
   Qualitative on purpose: no numbers attach to these until they are real.

   RENDERED ON /platform, in the section that asks where stronger evidence
   creates value. It is not rendered on this page any more: it had a section
   of its own here and tags on each card, and both went — the tags because
   across nine sectors they resolved to nearly the same three labels and so
   distinguished nothing, the section because four abstract headings asked a
   reader to map the value back onto their own operation, which is work the
   nine scenarios below already do concretely.

   That it survived the cut is the whole reason it could be reused rather
   than rewritten. It stays HERE rather than moving to platform.ts because
   the per-sector `outcomes` tags below are typed against it, and those are
   the expensive half.

   ⚠️  "SUPPORT asset value", never "increase". See the note on that entry. */
export const outcomes = [
  {
    id: "revenue",
    label: "Increase revenue",
    body: "Support faster decisions, remote acceptance and higher-trust transactions.",
  },
  {
    id: "profit",
    label: "Increase profit",
    body: "Reduce repeat inspections, checking, administration and dispute-management cost.",
  },
  {
    id: "risk",
    label: "Reduce risk",
    body: "Strengthen evidence and clarify accountability between counterparties.",
  },
  {
    /* "Support", not "Increase". Delphi does not raise what an asset is
       worth; it reduces the information asymmetry that discounts it. */
    id: "asset-value",
    label: "Support asset value",
    /* ⚠️  A VALUE STATEMENT, NOT A FEATURE CLAIM. "Build a history" is
       something a customer does by making certificates over time, and that
       ships today. It is NOT the persistent asset passport, which is
       development direction — see the `passports` pillar in platform.ts. If
       this line ever grows into "Delphi maintains an asset history", it has
       crossed over and must come back. */
    body: "Build a more trustworthy history that reduces information asymmetry.",
  },
] as const;

export type OutcomeId = (typeof outcomes)[number]["id"];

/* ── Families ──────────────────────────────────────────────────────────────
   Four groups rather than a flat list of nine. A grouped page reads as a
   platform with coherent applications; a flat one reads as a list of markets
   somebody hoped would work. */
export const families = [
  { id: "property", title: "Property & built environment" },
  { id: "mobility", title: "Mobility & high-value assets" },
  { id: "risk-transfer", title: "Risk & transfer" },
  { id: "government", title: "Government & high assurance" },
] as const;

export type FamilyId = (typeof families)[number]["id"];

export type Industry = {
  id: string;
  name: string;
  family: FamilyId;
  /* Where deployment experience is deepest. Renders as a quiet marker, not as
     a "primary vs also applicable" split — no sector is labelled lesser. */
  featured?: boolean;
  /* One line: the situation, in the buyer's own words. This is the headline. */
  situation: string;
  /* One sentence. Anything longer belongs on the sector page. */
  problem: string;
  /* One or two sentences. */
  application: string;
  /* Exactly three. */
  value: string[];
  /* Commercial framework mapping. Retained for the sector pages and for the
     outcomes section, but NO LONGER rendered on the cards — across nine
     sectors it resolved to almost the same three labels every time, so it
     carried nearly no information per card. */
  outcomes: OutcomeId[];
  /* The moments at which evidence is captured in this sector — the answer to
     "when would I use this?". Deliberately the sector's own vocabulary
     ("Redelivery", not "Return"), because recognition is the point. Three or
     four; more than four and the row wraps and stops scanning. */
  moments: string[];
  /* Development direction, retained for the sector pages. NOT rendered here —
     see the file header. */
  corroboration: string;
  pageHref?: string;
  /* Illustrative scene photography, generated rather than documentary. It
     depicts the situation, never the product — see IndustryShot. */
  image?: string;
  imageAlt?: string;
};

export const industries: Industry[] = [
  {
    id: "property-sales",
    name: "Property Sales",
    family: "property",
    featured: true,
    situation:
      "A buyer is committing to a property they have seen once, or not at all.",
    problem:
      "Listing photographs are unverifiable, often out of date, and routinely flattering.",
    application:
      "Verified condition capture at listing, at exchange and at completion — producing a certificate any party can open, without an account.",
    value: [
      "Give remote buyers grounds to commit earlier",
      "Reduce renegotiation driven by disputed condition",
      "Evidence the state of the property at exchange",
    ],
    outcomes: ["revenue", "risk", "asset-value"],
    moments: ["Listing", "Viewing", "Exchange", "Completion"],
    corroboration:
      "Title and address references would strengthen this sector further.",
    image: "property-sales",
    imageAlt:
      "An estate agent photographing the drawing room of a prime central London townhouse. The phone screen shows the same room being framed.",
  },
  {
    id: "rentals",
    name: "Rentals & Hospitality",
    family: "property",
    featured: true,
    situation: "A tenant moves out and the deposit is contested.",
    problem:
      "Check-in and check-out reports rest on photographs whose date and origin cannot be proven.",
    application:
      "Verified condition records at check-in, check-out and during the tenancy, each sealed at the moment of capture so the sequence itself is evidence.",
    value: [
      "Resolve deposit disputes on evidence rather than assertion",
      "Cut the administrative cost of contested check-outs",
      "Standardise inventory quality across a portfolio",
    ],
    outcomes: ["profit", "risk"],
    moments: ["Check-in", "Mid-tenancy", "Check-out", "Deposit claim"],
    corroboration:
      "Unit identity and tenancy-date binding would strengthen this sector further.",
    image: "rentals",
    imageAlt:
      "A villa manager photographing the interior of a Maldives resort villa at changeover, linen squared and nothing personal left out. The phone screen shows the same room being framed.",
  },
  {
    id: "construction",
    name: "Development & Construction",
    family: "property",
    featured: true,
    situation: "A milestone payment depends on work nobody off-site has seen.",
    problem:
      "Progress claims rest on photographs that cannot be tied reliably to a date or a location, and covered work becomes unauditable once it is buried.",
    application:
      "Verified build-state capture at milestones, before covering works, at snagging and at handover.",
    value: [
      "Substantiate milestone and stage payment applications",
      "Evidence covered works before they become inaccessible",
      "Support remote sign-off without a site visit",
    ],
    outcomes: ["revenue", "profit", "risk"],
    moments: ["Milestone", "Before covering", "Snagging", "Handover"],
    corroboration:
      "Plot identity and project-record references would strengthen this sector further.",
    image: "construction",
    imageAlt:
      "A site manager photographing exposed conduit, pipework and a distribution board inside a villa under construction, before the services are covered over.",
  },
  {
    id: "yachts-marine",
    name: "Yachts & Marine",
    family: "mobility",
    situation:
      "A charter returns with damage and the parties disagree about when it happened.",
    problem:
      "Delivery and redelivery condition is recorded inconsistently across owners, captains, brokers, yards and insurers.",
    application:
      "Verified condition at delivery, incident and redelivery — establishing what changed, when it changed and who held responsibility.",
    value: [
      "Recover charter damage on documented evidence",
      "Reduce downtime spent arguing over responsibility",
      "Build vessel history that carries value at resale",
    ],
    outcomes: ["profit", "risk", "asset-value"],
    moments: ["Delivery", "Charter", "Incident", "Redelivery"],
    corroboration:
      "Vessel identity and navigational position would strengthen this sector further.",
    image: "yachts-marine",
    imageAlt:
      "A yacht officer photographing the teak aft deck and tender of a motor yacht berthed in a Mediterranean marina.",
  },
  {
    id: "automotive",
    name: "Automotive & Mobility",
    family: "mobility",
    situation:
      "A rental vehicle comes back with damage that was not there at handover. Allegedly.",
    problem:
      "Vehicle handover checks are fast, informal and weakly evidenced.",
    application:
      "Verified condition capture at handover and return, producing a record both parties can inspect.",
    value: [
      "Resolve handover damage disputes quickly",
      "Reduce write-offs of unrecoverable damage costs",
      "Evidence fleet condition for remarketing",
    ],
    outcomes: ["profit", "risk", "asset-value"],
    moments: ["Handover", "Return", "Damage claim", "Remarketing"],
    corroboration:
      "VIN and registration binding would strengthen this sector further.",
    image: "automotive",
    imageAlt:
      "A handover agent photographing the flank of a dark executive saloon standing under an architectural canopy, palms and desert planting beyond.",
  },
  {
    id: "industrial",
    name: "Industrial & Financed Assets",
    family: "mobility",
    situation: "A lender is financing equipment it has never seen.",
    problem:
      "Asset-backed lending depends on the existence, condition and location of collateral, and a conventional inspection report ages immediately.",
    application:
      "Verified existence, condition and location checks at origination and on a recurring basis through the life of the facility.",
    value: [
      "Confirm collateral exists and remains where it should",
      "Reduce the cost of periodic physical inspection",
      "Support end-of-lease condition assessment",
    ],
    outcomes: ["profit", "risk", "asset-value"],
    moments: ["Origination", "Periodic check", "Servicing", "End of lease"],
    corroboration:
      "Serial numbers and asset tagging would strengthen this sector further.",
    image: "industrial",
    imageAlt:
      "An asset inspector photographing the fuselage and engine of a business jet standing in a maintenance hangar.",
  },
  {
    id: "insurance",
    name: "Insurance & Claims",
    family: "risk-transfer",
    situation:
      "A claim arrives and nobody can establish what the asset looked like before.",
    problem:
      "First-notification evidence is supplied by the claimant, in their own time, in a format that cannot be authenticated.",
    application:
      "Verified capture at inception, at inspection and at first notification of loss, giving underwriters and adjusters evidence whose timing and origin are established.",
    value: [
      "Reduce inspection visits for straightforward claims",
      "Establish pre-loss condition at policy inception",
      "Settle legitimate claims faster with less checking",
    ],
    outcomes: ["profit", "risk"],
    moments: ["Inception", "Inspection", "First notification", "Settlement"],
    corroboration:
      "Policy and claim reference binding would strengthen this sector further.",
    image: "insurance",
    imageAlt:
      "A loss adjuster photographing a stained, sagging ceiling and water-damaged wall in a London reception room, the sofa sheeted and the floorboards cupped.",
  },
  {
    id: "logistics",
    name: "Logistics & Handover",
    family: "risk-transfer",
    situation: "Goods arrive damaged and three parties have handled them.",
    problem:
      "When custody passes through multiple hands, establishing where damage occurred is often impossible.",
    application:
      "Verified condition capture at each transfer of custody, creating a documented chain rather than a set of disconnected claims.",
    value: [
      "Locate responsibility at the correct point in the chain",
      "Reduce goodwill write-offs for unattributable damage",
      "Support cargo claims with dated records",
    ],
    outcomes: ["profit", "risk"],
    moments: ["Despatch", "Custody transfer", "Receipt", "Cargo claim"],
    corroboration:
      "Consignment and container references would strengthen this sector further.",
    image: "logistics",
    imageAlt:
      "A fine art handler in white gloves photographing an opened plywood crate holding a wrapped framed artwork at handover.",
  },
  {
    /* Defence procurement will ask about accreditation the Trust page cannot
       yet answer — see the compliance status there before pursuing it hard. */
    id: "defence",
    name: "Defence & Government",
    family: "government",
    situation:
      "Equipment returns from deployment and nobody agrees what condition it left in.",
    problem:
      "Condition at issue, return and inspection is recorded inconsistently, and often by the party with an interest in the answer.",
    application:
      "Verified condition capture at issue, return, inspection and maintenance milestones, producing a dated record a party who did not create it can check.",
    value: [
      "Establish condition at each transfer of responsibility",
      "Reduce disputes between units, depots and contractors",
      "Retain asset history across postings and contract changes",
    ],
    outcomes: ["profit", "risk"],
    moments: ["Issue", "Custody transfer", "Inspection", "Return"],
    corroboration:
      "Asset and serial references would strengthen this sector further.",
    image: "defence",
    imageAlt:
      "A technician photographing the open tailgate of a military support vehicle in a maintenance hangar, an inspection platform and tool bench alongside.",
  },
];

/* Short labels for the jump grid on this page and the sector strip on
   /platform. Defined once so the two cannot drift apart. Order matches
   `industries` above; `id` must match an entry there or the anchor points at
   nothing. Full names are too long for a five-column grid — "Development &
   construction" wraps to three lines. */
export const industryShortcuts = [
  { id: "property-sales", label: "Property" },
  { id: "rentals", label: "Rentals" },
  { id: "construction", label: "Construction" },
  { id: "insurance", label: "Insurance" },
  { id: "yachts-marine", label: "Yachts" },
  { id: "automotive", label: "Vehicles" },
  { id: "industrial", label: "Industrial" },
  { id: "logistics", label: "Logistics" },
  { id: "defence", label: "Defence" },
] as const;

/* Backdrops cycled behind the hero on every top-level page — home, platform,
   industries, trust and company. Defined here because they are the sector
   photography; imported directly by each page rather than aliased per page,
   so there is one list and one place to change it.

   Same sectors as the cards, but with the people removed — a person in a faded
   background reads as a ghost, and the eye keeps trying to resolve them
   instead of reading the headline. `alt` is deliberately absent: these are
   decorative, announce nothing, and are hidden from assistive technology. */
export const industryBackdrops = [
  { name: "townhouse", label: "Prime London townhouse" },
  { name: "yacht", label: "Motor yacht berthed at night, Cote d'Azur" },
  { name: "villa", label: "Overwater villa at dusk, Maldives" },
  { name: "construction", label: "Villa under construction, concrete frame" },
  { name: "jet", label: "Business jet in a lit hangar at dusk" },
  /* Kept two apart from the Maldives villa so the two never run back to back. */
  { name: "gulf-villa", label: "Contemporary villa at dusk, Abu Dhabi" },
] as const;

export const industriesPage = {
  eyebrow: "Where it applies",
  /* Every top-level H1 opens on a different word. Home takes "Trusted
     evidence…", Platform takes "Evidence…", Trust and Company both take
     "Built…". This page takes the reader.

     It used to read "When it matters what was actually true." — true, and
     the condition all nine sectors share, but it described a philosophical
     situation rather than a business one. A reader arriving here is asking
     whether this is for them and what it is worth, and an abstraction is a
     poor answer to both. This names them, and it names a cost they are
     already carrying — which is the only kind of saving that needs no proof
     to be interesting. */
  headline: "Your industry pays for trust it cannot check.",
  /* Deliberately load-bearing in three places: it lists sectors by name so a
     reader can find themselves before scrolling, it says what the record is
     in one clause rather than describing the technology, and it closes on
     all three kinds of value — sooner (created), cheaper (saved), and not
     argued (protected). No numbers: none are ours to quote yet. */
  standfirst:
    "The same shape appears in property, marine, construction, insurance and defence — something valuable changes hands, and neither side can independently establish the condition it was in. Delphi Verify gives both a record neither of them owns and either of them can check, so transactions complete sooner, assurance costs less, and disagreements are settled or avoided rather than argued.",
  familiesEyebrow: "Solutions",
  familiesHeadline:
    "Industries where trusted physical evidence matters.",
} as const;

/* The reason Delphi can credibly span these markets. States what corroborates
   today, then what the model is designed to accept — once, under a single
   direction marker, instead of nine per-sector roadmap lines. The sector
   mapping itself is shared with /platform; see `corroboration` there. */
export const crossIndustry = {
  eyebrow: "One technology, many applications",
  headline: "One platform. Different evidence for different assets.",
  body: "The assurance model does not change between sectors. What changes is the corroborating evidence available for the asset in front of you.",
  linkLabel: "How Delphi works",
  linkHref: "/platform",
} as const;

export const industriesCta = {
  headline: "Where does trust break down in your workflow?",
  prompts: [
    "A handover that goes wrong.",
    "A claim that is difficult to substantiate.",
    "An inspection that costs too much.",
    "A physical milestone nobody can independently verify.",
  ],
  primary: { label: "Talk to Delphi", href: "/contact" },
} as const;
