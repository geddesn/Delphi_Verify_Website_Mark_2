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

export type RenderingSurface = "mobile" | "web";

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
    "Three mobile screens follow one job from assignment to sealed record. Two web screens show the same evidence managed across a portfolio. These are interface renderings rather than screenshots of shipped software — they show the product as designed, and are labelled as such wherever they appear.",
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
    id: "mobile-record",
    surface: "mobile",
    navLabel: "Evidence Record",
    title: "Evidence Record",
    purpose:
      "Show what the person in the field actually ends up with once a capture is complete.",
    shows: [
      "A summary of what was submitted",
      "Time, date and location",
      "Media thumbnails",
      "Evidence status, verified",
      "A trust panel: device, app integrity, capture time, capture location",
      "View certificate and share actions",
    ],
    message: "Delphi turns a capture into a record that stands on its own.",
  },
  {
    id: "web-dashboard",
    surface: "web",
    navLabel: "Dashboard",
    title: "Enterprise Dashboard",
    purpose:
      "Show the management layer — the reason an organisation buys this rather than a phone.",
    shows: [
      "Headline figures: active cases, pending captures, completed evidence events, overdue exceptions",
      "A work table with filters by workflow, industry, assignee and status",
      "A side panel of recent activity",
      "Entries that span sectors — 14 Berkeley Square, MY Aurora, Project Aria",
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
    shows: [
      "One asset in focus — a property, a vessel or a project",
      "Asset summary, workflow stage and the people assigned",
      "An evidence timeline with the stages named in the asset's own terms — listing, viewing, exchange, completion; or delivery, incident, redelivery",
      "Capture history with media thumbnails",
      "A verification summary",
      "Share, export and certificate actions",
    ],
    message:
      "Delphi creates a structured, reviewable history of verified evidence.",
  },
];
