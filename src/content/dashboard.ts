import { RECORD } from "@/content/evidence-record";

/* ============================================================================
   ENTERPRISE DASHBOARD — FIXTURE
   ============================================================================
   The contents of one picture: an afternoon in a London residential agency
   that commissions trusted evidence across a few hundred assets.

   ⚠️  IT SHARES A WORLD WITH THE EVIDENCE RECORD. The dashboard and the
   record sit on the same page, and 18 Cadogan Square appears on both — as a
   job still capturing in the work table, and as the sealed record it becomes.
   The code and the capture count are IMPORTED rather than retyped, because a
   viewer who notices they differ has learned only that neither is real. See
   the warning at the top of content/evidence-record.ts.

   ⚠️  OPERATIONAL, NOT ANALYTICAL. No charts, no trend lines, no executive
   scorecards. The four numbers at the top are counts a person acts on, and
   the biggest thing on the screen is a list of work. A dashboard of graphs
   would say Delphi reports on evidence; this says Delphi is how the evidence
   gets made.

   ⚠️  THE STATUS WORDS ARE THE PRODUCT'S VOCABULARY. A platform whose whole
   proposition is removing uncertainty cannot have an interface that
   introduces it — no "processing state 04", no "pending execution". Every
   value below is a phrase somebody would say out loud.
   ========================================================================= */

export const ORG = {
  /* What the workspace selector shows. An enterprise will have countries,
     regions, offices and portfolios under this; the selector is the seam
     where that hierarchy appears, and a single-person account never opens
     it. */
  /* INVENTED, and it has to be. An earlier draft used a real prime-London
     agency's name, which on a marketing rendering implies a customer
     relationship that does not exist — and puts somebody else's brand inside
     a picture of our product. A surname does the same job: it reads as an
     agency, and it belongs to nobody. */
  workspace: "Ellerby London",
  /* The information model, stated once and quietly: an organisation contains
     assets, assets carry jobs, jobs produce evidence records. Everything else
     on this screen is an instance of that sentence. */
  scope: "London Residential",
  scopeCounts: "24 active jobs · 318 assets · 1,842 evidence records",
  user: { name: "Sarah Davies", initials: "SD" },
} as const;

export const PAGE = {
  greeting: "Good afternoon, Sarah",
  heading: "Evidence operations",
  standfirst:
    "Track capture activity, evidence records and assets across your organisation.",
  /* The strongest control on the screen, and deliberately. Nearly every
     web-originated workflow starts with somebody saying "I need trusted
     evidence of this asset" — and the job it creates is what lands in the
     photographer's task list on the first mobile rendering. This button is
     where that loop closes. */
  action: "Create job",
  search: "Search jobs, assets, evidence or certificate IDs…",
} as const;

/* Four counts, not four charts. `tone` decides the colour of the figure, and
   only one of them gets one — a dashboard where every number is coloured has
   no way left to say "look here". */
export const STATS = [
  { value: "24", label: "Active jobs", note: "Assigned or in progress" },
  { value: "8", label: "Due today", note: "Evidence expected today" },
  { value: "142", label: "Completed", note: "Records produced this month" },
  {
    value: "3",
    label: "Need attention",
    note: "Something requires action",
    /* Amber, not red. Nothing here has failed — a job is late, a capture is
       waiting to be looked at, a job has nobody on it. Red is for a
       verification that did not pass, and spending it on a triage state
       leaves nothing to say when one really does. */
    tone: "pending" as const,
  },
] as const;

export const ATTENTION = {
  headline: "3 jobs need attention",
  detail: "1 overdue · 1 capture requires review · 1 unassigned",
  action: "Review",
} as const;

/* Visible and collapsed. They say "this scales past one office" without
   spending any of the screen on proving it. */
export const FILTERS = [
  "All workflows",
  "All assignees",
  "All statuses",
  "Due",
  "Chelsea Office",
] as const;

/* Draft → Assigned → Accepted → Capturing → Submitted → Review → Verified,
   plus two states that sit outside the sequence rather than in it:
   `Scheduled` is accepted work with a future date, and `Unassigned` is a job
   with nobody on it, which is why it is the one status that reads as a
   problem. */
export type JobStatus =
  | "Capturing"
  | "Assigned"
  | "Review"
  | "Unassigned"
  | "Scheduled";

export type Job = {
  asset: string;
  /** Basename under public/assets/captures, for the row thumbnail. */
  thumb?: string;
  workflow: string;
  assignee?: { name: string; role: string; initials: string };
  status: JobStatus;
  due: string;
  /** Late, or otherwise wanting a person. Draws the row's marker amber. */
  flagged?: boolean;
};

/* Five rows: one being captured now, one waiting to start, one back for
   review, one nobody has picked up, and one later in the week. Between them
   they show the whole sequence without a legend. */
export const JOBS: Job[] = [
  {
    asset: RECORD.address.replace(", London", ""),
    thumb: "cadogan-front-elevation",
    /* ⚠️  NOT the pre-tenancy condition job. That one finished — the activity
       feed below has its capture completing at 14:47 and its record sealing
       at 14:51, and a job whose record is sealed cannot still be in Active
       Work. James is on the second job at the same property, which is also
       the one the asset history shows as open. Three renderings, one
       afternoon, no contradictions. */
    workflow: "Inventory schedule",
    assignee: { name: "James Williams", role: "Photographer", initials: "JW" },
    status: "Capturing",
    due: "Today 15:00",
  },
  {
    asset: "42 Eaton Place",
    workflow: "Sales verification",
    assignee: { name: "Lucy Martin", role: "Property manager", initials: "LM" },
    status: "Assigned",
    due: "Today 17:00",
  },
  {
    asset: "9 Chester Terrace",
    workflow: "Handover",
    assignee: { name: "Alex Reid", role: "Lettings", initials: "AR" },
    status: "Review",
    due: "Today",
    flagged: true,
  },
  {
    asset: "16 Grosvenor Square",
    workflow: "Sales verification",
    status: "Unassigned",
    due: "Tomorrow",
    flagged: true,
  },
  {
    asset: "27 Wilton Crescent",
    workflow: "Inspection",
    assignee: { name: "Emma Cole", role: "Surveyor", initials: "EC" },
    status: "Scheduled",
    due: "24 Aug",
  },
];

/* Three assets, three industries, one evidence model — said with pictures
   rather than with a paragraph, so the screen shows Delphi is asset-agnostic
   without turning into a second industries page.

   The first is the record rendered in full elsewhere on this page. Its code
   and address come from the shared fixture for that reason. */
export const RECENT = [
  {
    asset: RECORD.address.replace(", London", ""),
    workflow: "Pre-tenancy condition",
    code: RECORD.code,
    image: "/assets/captures/cadogan-front-elevation-240.webp",
  },
  {
    asset: "MY Aurora",
    workflow: "Pre-charter condition",
    code: "D4Y7-P2KG",
    image: "/assets/features/yacht-aft-deck-240.webp",
  },
  {
    asset: "Plot 18 — Baccarat Maldives",
    workflow: "Construction progress",
    code: "P8Q2-J5MT",
    image: "/assets/features/construction-milestone-240.webp",
  },
] as const;

/* Chronological and restrained. It gives a reader the history without making
   them open an audit log, and it is what makes the screen feel like something
   people are using rather than a layout.

   The 14:47 entry counts the same captures the evidence record does. */
export const ACTIVITY = [
  {
    time: "14:51",
    text: `Evidence record ${RECORD.code} sealed`,
    detail: RECORD.address.replace(", London", ""),
    tone: "verified" as const,
  },
  {
    time: "14:47",
    text: "James Williams completed capture",
    detail: `${RECORD.captureCount} of ${RECORD.captureCount} required items`,
  },
  {
    time: "14:31",
    text: "Lucy Martin started capture",
    detail: "42 Eaton Place",
  },
  {
    time: "13:54",
    text: "Alex Reid submitted evidence for review",
    detail: "9 Chester Terrace",
  },
  {
    time: "12:48",
    text: "Sarah Davies created a new job",
    detail: "16 Grosvenor Square",
  },
];
