import { RECORD } from "@/content/evidence-record";

/* ============================================================================
   ASSET & EVIDENCE HISTORY — FIXTURE
   ============================================================================
   One property, four verified states, eight months apart.

   ⚠️  THIS IS THE ARGUMENT, NOT A LIST. Four isolated certificates are worth
   four times one certificate. A chronology is worth more than that, because
   it answers a question no single record can: what changed, and when was the
   last time anybody actually looked? Every decision in this fixture serves
   that — the events are in one column, they are dated, and the newest does
   not replace the others.

   ⚠️  VERIFIED AND SUPERSEDED ARE DIFFERENT AXES. A record that was verified
   stays verified; verification is a fact about a moment and it does not
   decay. "Superseded" says only that a newer record exists. Collapsing the
   two — greying out old records, or calling them unverified — would destroy
   the thing that makes a history valuable, which is that it preserves what
   was known at the time.

   ⚠️  NO TRUST SCORE. Not "98% confidence", not a health ring, not a green
   dial. Delphi knows when somebody last looked at this property; it does not
   know what the property looks like now. Recency is a fact and is stated as
   one. Anything that implies continuous knowledge of a physical asset is a
   claim the product cannot make.

   Shares its world with content/evidence-record.ts and content/dashboard.ts:
   the 22 August record is the one rendered in full elsewhere on the page, so
   its code, capture count and address are imported rather than retyped.
   ========================================================================= */

export const ASSET = {
  name: RECORD.address.replace(", London", ""),
  locality: "London SW1X",
  type: "Residential property",
  state: "Active",
  hero: "/assets/captures/cadogan-front-elevation-878.webp",
  /* The generic model, with one sector's identifiers in it: asset, its
     references, its evidence, its history. A yacht would carry IMO and MMSI
     here, a vehicle a VIN, a plot a phase — the shape does not change. */
  identity: [
    { label: "Asset ID", value: "DV-AST-001842", mono: true },
    { label: "Reference", value: "EL-CHEL-02918", mono: true },
    { label: "Asset type", value: "Residential property" },
    { label: "Organisation", value: "Ellerby London" },
  ],
} as const;

export const SUMMARY = {
  records: "12",
  recordsLabel: "Evidence records",
  /* Recency as a fact, never as a verdict. "Today" is what makes the next
     line defensible: a photograph does not stay proof of current condition,
     and the honest thing is to say when the observation happened rather than
     to imply the asset has not moved since. */
  lastVerified: "22 Aug 2026",
  age: "Today",
  firstVerified: "14 Jan 2026",
  stakeholders: "4",
  note: "No subsequent verified capture exists.",
} as const;

export const TABS = ["Overview", "Evidence", "Timeline", "Jobs", "Access"] as const;
export const ACTIVE_TAB = "Timeline";

/* The most recent state, summarised so somebody opening the asset does not
   have to read eight months of history to learn the one thing they came for.
   Facts about the session, not conclusions about the property. */
export const LATEST = {
  headline: `Verified ${SUMMARY.lastVerified} at 14:51`,
  facts: [
    `${RECORD.captureCount} captures`,
    "Capture session complete",
    "Location recorded throughout",
    "Evidence sealed",
  ],
  action: "View evidence record",
} as const;

/* The philosophy, in one sentence, sitting under the timeline where it
   explains what the reader has just looked at. Without it, "Superseded"
   reads as "expired". */
export const PERSISTENCE =
  "Evidence records are retained as a chronological history. New verification adds to the asset record rather than replacing prior evidence.";

export type AssetEvent = {
  date: string;
  /** Just the day, for the horizontal strip. */
  shortDate: string;
  title: string;
  /** One or two words, for the horizontal strip. A four-word title in a
   *  quarter of the page's width wraps to three lines and the strip stops
   *  being scannable, which is the only thing it is for. */
  short: string;
  /* Categories are per industry — a yacht has pre-charter and refit, a
     project has groundworks and handover. Shown as a tag on the event rather
     than as a filter bar, because it makes the same point in no space. */
  category: string;
  captures: number;
  code: string;
  by?: string;
  window?: string;
  /** Basenames under public/assets/captures. */
  thumbs?: string[];
  /** True for the newest. Everything older is verified AND superseded. */
  current?: boolean;
};

export const EVENTS: AssetEvent[] = [
  {
    date: "22 August 2026",
    shortDate: "22 Aug 2026",
    title: "Pre-tenancy condition",
    short: "Pre-tenancy",
    category: "Condition inspection",
    captures: RECORD.captureCount,
    code: RECORD.code,
    by: "James Williams",
    window: RECORD.window,
    thumbs: [
      "cadogan-front-elevation",
      "cadogan-reception-room",
      "cadogan-kitchen",
      "cadogan-principal-bedroom",
    ],
    current: true,
  },
  {
    date: "18 June 2026",
    shortDate: "18 Jun 2026",
    title: "Property marketing refresh",
    short: "Marketing",
    category: "Sales marketing",
    captures: 12,
    code: "A7KQ-P91M",
    by: "Lucy Martin",
    thumbs: ["cadogan-reception-room", "cadogan-study", "cadogan-garden"],
  },
  {
    date: "3 March 2026",
    shortDate: "3 Mar 2026",
    title: "Maintenance inspection",
    short: "Maintenance",
    category: "Maintenance",
    captures: 18,
    code: "DQ52-L8AE",
    by: "Alex Reid",
  },
  {
    date: "14 January 2026",
    shortDate: "14 Jan 2026",
    title: "Initial property record",
    short: "Initial record",
    category: "Inventory",
    captures: 24,
    code: "J9F4-KC22",
    by: "Emma Cole",
  },
];

/* What is booked next. An asset record that cannot commission its own next
   capture is a filing cabinet; this is the seam where a history becomes a
   process. The inventory job is the same one the dashboard shows in progress
   against this property. */
export const OPEN_WORK = [
  {
    title: "Inventory schedule",
    assignee: "James Williams",
    detail: "Capturing · due today 15:00",
  },
  {
    title: "Quarterly inspection",
    assignee: "Emma Cole",
    detail: "Scheduled · 1 September",
  },
];

/* Evidence usually exists because several parties need to rely on the same
   facts. Naming them is what turns "a record" into "a record between
   people". */
export const STAKEHOLDERS = [
  { name: "Ellerby London", role: "Managing agent", initials: "EL" },
  { name: "Property owner", role: "Owner", initials: "PO" },
  { name: "James Williams", role: "Photographer", initials: "JW" },
  { name: "ABC Property Management", role: "Inspector", initials: "AP" },
];
