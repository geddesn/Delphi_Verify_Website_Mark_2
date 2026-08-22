/* ============================================================================
   PLATFORM RENDERINGS — SCREEN BRIEFS
   ============================================================================
   Five interface renderings: three mobile, two web. Together they walk the
   whole product — a job arrives, it is captured under guidance, it becomes a
   record, the record is managed at scale, and it accumulates into an asset's
   history.

   ⚠️  THESE ARE RENDERINGS, NOT SCREENSHOTS. Nothing here is a photograph of
   shipped software. For a company whose entire proposition is that a record
   means what it says, a rendering presented as a product shot is the one
   dishonesty we cannot afford — so the page says so in its standfirst, and
   any caption added later must keep saying so.

   The brief for each screen lives here rather than in a document elsewhere,
   so the requirement and the slot it describes cannot drift apart. `shows` is
   the checklist the finished rendering has to satisfy; `message` is the single
   thing a viewer should leave with, and is the test of whether it worked.
   ========================================================================= */

export type RenderingSurface = "mobile" | "web" | "both";

export type Rendering = {
  id: string;
  surface: RenderingSurface;
  /** Short form for the sub-nav, where five long titles will not fit. */
  navLabel: string;
  title: string;
  /** One line: what the screen exists to prove. */
  purpose: string;
  /** What has to appear on it. */
  shows: string[];
  /** The sentence the screen has to leave a viewer with. */
  message: string;
};

/* The frame each rendering is drawn into. Fixed per surface so the three
   mobile screens sit at identical scale beside each other and read as one
   device rather than three — and so a rendering swapped in later cannot
   quietly change the page's rhythm. */
export const surfaceFrame = {
  /* No ratio: a mobile rendering's outer shape comes from the phone image
     below, not from here. The label is the design target it is drawn to. */
  mobile: { label: "390 × 844", device: "Mobile" },
  web: { label: "1440 × 900", ratio: "1440 / 900", device: "Web" },
  /* One record on two surfaces, drawn as two frames in a single slot rather
     than as two entries in the list — they are the same object, and split
     across two slots they would drift. */
  both: { label: "1440 × 900 · 390 × 844", device: "Web & Mobile" },
} as const;

/* ── The device frame ──────────────────────────────────────────────────────
   The photographic iPhone the three mobile renderings are drawn into.

   BOTH the background AND the screen are transparent — 77.6% of the image;
   only the phone body is opaque. That is what makes it useful: a rendering
   sits BEHIND the frame and shows through the screen, and the opaque bezel
   paints over everything else.

   So the screen needs NO rounded corners and NO notch mask in CSS. A plain
   rectangle behind the image is masked by the image itself, corners and notch
   and all, exactly as a physical device masks what is under its glass. Adding
   a border-radius here would be sanding a shape that is already cut.

   The aperture below is MEASURED off the alpha channel, not eyeballed: flood
   the transparent background inwards from the border, and whatever stays
   transparent and unreached is the screen. 774x1680 inside 928x1824 — ratio
   0.4607, against the iPhone's own 390/844 = 0.4621.

   ⚠️  REPLACE THE IMAGE AND THESE FOUR NUMBERS MUST BE MEASURED AGAIN.
   assets-src/device/iphone-frame.source.txt records how. Nothing fails loudly
   if they are stale — the renderings just sit crooked inside the bezel, which
   is the kind of wrong that survives review. */
export const phoneFrame = {
  base: "/assets/device/iphone-frame",
  width: 928,
  height: 1824,
  screen: {
    left: "8.297%",
    top: "3.947%",
    width: "83.405%",
    height: "92.105%",
  },
} as const;

export const renderingsPage = {
  eyebrow: "Renderings",
  /* Every top-level H1 on the site opens on a different word — see the note
     in content/industries.ts. Home takes "Trusted", Platform "Evidence",
     Industries "Your", Trust and Company "Built". This one takes "Five". */
  headline: "Five screens, from field capture to enterprise oversight.",
  standfirst:
    "Two mobile screens follow one job from assignment to guided capture. The record it produces is shown on both surfaces at once. Two further web screens show that evidence managed across a portfolio. These are interface renderings rather than screenshots of shipped software — they show the product as designed, and are labelled as such wherever they appear.",
} as const;

export const renderings: Rendering[] = [
  {
    id: "mobile-tasks",
    surface: "mobile",
    navLabel: "My Tasks",
    title: "My Tasks",
    purpose:
      "Establish that Delphi is an operational tool with assigned work in it, not a camera app.",
    shows: [
      "A list of tasks assigned to this user",
      "A deliberate mix of industries — property listing capture, yacht redelivery inspection, construction milestone check",
      "Asset or workflow type on every row",
      "Due date and status, so the list reads as work rather than history",
    ],
    message: "Delphi organises trusted evidence collection in the field.",
  },
  {
    id: "mobile-capture",
    surface: "mobile",
    navLabel: "Guided Capture",
    title: "Guided Capture",
    /* The one screen that has to be right. Everything else on this page is
       context for what happens here. */
    purpose:
      "Show the core of the product: capture that is guided, structured and evidenced as it happens.",
    shows: [
      "The subject named plainly — address, vessel or project",
      "A capture checklist with required media counts",
      "Instructions for the person holding the phone",
      "Live trust indicators: location required, time verified, device verified",
      "One large, unambiguous start-capture control",
    ],
    message:
      "Delphi does not just take photographs. It captures verified evidence with its context.",
  },
  {
    /* BOTH surfaces, and the pair is the argument.

       It was drafted as the third phone screen — what the person in the field
       is left holding — then moved to the desktop, because everything that
       makes the record persuasive (twenty indexed captures, the fingerprint,
       the route to recompute it) needs a desk to be read at. Both of those
       were half right. The record is one object that two very different
       people open: whoever captured it, on the phone still in their hand, and
       whoever has to rely on it, weeks later, at a desk. Show only the
       desktop and it reads as back-office software; only the phone, and the
       part that makes it checkable has nowhere to go.

       Web is drawn first and at full width because 1440px needs the room to
       stay legible. Side by side would put the desktop canvas into roughly
       half the container, and nothing on it could be read. */
    id: "evidence-record",
    surface: "both",
    navLabel: "Evidence Record",
    title: "Evidence Record",
    purpose:
      "Show what a completed capture becomes: a structured evidence file somebody else can inspect, rather than an album of verified photographs.",
    shows: [
      "The record's own identity — address, job, certificate code, completion date",
      "What was sealed, in four figures: count, capture window, location, integrity",
      "The captures themselves, INDEXED — the sealed record commits to media, time and location at each index, so the ordering is attested rather than presentational",
      "One capture open, with what was recorded about it and the fingerprint of its original bytes",
      "The sealed record — network, schema, media count, state — and a route to recompute the commitments without asking Delphi",
      "The same record on the phone, where whoever captured it sees it",
    ],
    message:
      "Delphi does not produce verified photographs. It produces an evidence record somebody else can check.",
  },
  {
    id: "web-dashboard",
    surface: "web",
    navLabel: "Dashboard",
    title: "Enterprise Dashboard",
    purpose:
      "Show the management layer — the reason an organisation buys this rather than a phone.",
    /* ⚠️  NO CHARTS. The instinct here is trend lines and doughnuts, and they
       would make the wrong argument: a page of graphs says Delphi reports on
       evidence, where a page of work says Delphi is how the evidence gets
       made. What a person needs is what to do, what is happening, what
       exists, and what is stuck — all four of which are counts and lists. */
    /* Updated to the screen that was built. `shows` is the checklist the
       rendering has to satisfy, so a brief describing assets the drawing does
       not contain is worse than no brief — it reads as a rendering that
       missed. */
    shows: [
      "Four operational counts — active, due today, completed, needing attention",
      "A triage strip naming what is stuck and why, in amber rather than red",
      "A work table: asset, workflow, the person assigned, status, and when it is due",
      "Recent evidence across three industries, and a chronological activity feed",
      "Search that takes a certificate ID as readily as an address",
    ],
    message:
      "Teams create, assign, track and manage evidence workflows at scale.",
  },
  {
    id: "web-case",
    surface: "web",
    navLabel: "Case Timeline",
    title: "Asset & Evidence Timeline",
    /* The strategic screen. The other four show captures; this one shows that
       captures accumulate into something an asset carries with it. */
    purpose:
      "Show that Delphi builds an evidential history around an asset rather than a pile of one-off captures.",
    /* Updated to the screen that was built, like the dashboard's above. */
    shows: [
      "One asset in focus, with a verified photograph of it rather than stock",
      "How many records exist, when the first and last were made, and how long ago",
      "A dated timeline of verified states, newest first, each with its certificate",
      "Capture thumbnails on the records that have them",
      "A compare-records action, and the open work booked against the asset",
      "The people and organisations the evidence is between",
    ],
    /* ⚠️  NO TRUST SCORE. Not a percentage, not a health ring, not a dial.
       Delphi knows when somebody last looked at this asset; it does not know
       what the asset looks like now, and anything implying continuous
       knowledge of the physical world is a claim the product cannot make.
       Recency is a fact and is stated as one.

       ⚠️  OLD RECORDS ARE NOT GREYED OUT. Verified and superseded are
       different axes — verification is a fact about a moment and does not
       decay, while supersession only says a newer record exists. Fading the
       older entries would destroy the thing that makes a history worth
       keeping. */
    message:
      "Delphi creates a structured, reviewable history of verified evidence.",
  },
];
