import { cn } from "@/lib/cn";
import { brand } from "@/content/site";

/* ============================================================================
   RENDERING — MOBILE 01, MY TASKS
   ============================================================================
   Real DOM at true device scale, not a picture of one. Everything here is
   authored in iPhone logical pixels — 390x844 — and the frame scales it; see
   PHONE_SCREEN in pages/PlatformRenderings.tsx. So `text-[15px]` here really
   is 15px on the device, and the whole screen can be judged at the size it
   would actually be held at.

   Colour comes from the same semantic tokens as the website, so the app and
   the marketing site cannot drift apart. The screen is pinned to
   data-theme="light" — a picture of a light application should not invert
   because the page around it is dark. A dark variant is a matter of removing
   that attribute, which is why it is set in exactly one place below.

   THE FIXTURE IS PART OF THE RENDERING, NOT SITE COPY. It lives here rather
   than in content/ because it is the contents of a picture: four tasks chosen
   to show four different states across three industries, which is the whole
   argument the screen makes. Change it and you change what the screen proves.

   ⚠️  NOT A SCREENSHOT. Nothing here is running software. See the warning at
   the top of content/renderings.ts.
   ========================================================================= */

/* Measured off the frame's own alpha channel, in device pixels: the notch is
   30.6 tall and 177.4 wide, leaving 106.3 clear either side. The status bar
   sits in those gutters — anything centred at the top would be behind it. */
const NOTCH_HEIGHT = 31;

type TaskState = "ready" | "progress" | "waiting" | "verified";

/* Human-readable throughout, deliberately. "OPEN", "PENDING_PROCESSING" and
   "ASSIGNED" are what the system calls these; a person on a doorstep with a
   phone does not care what the system calls them. */
const STATE: Record<TaskState, { label: string; tone: string; dot: string }> = {
  ready: {
    label: "Ready",
    tone: "text-ink-accent",
    dot: "bg-accent",
  },
  progress: {
    label: "In progress",
    tone: "text-pending",
    dot: "bg-pending",
  },
  waiting: {
    label: "Waiting",
    tone: "text-ink-muted",
    dot: "bg-ink-muted",
  },
  verified: {
    label: "Verified",
    tone: "text-verified",
    dot: "bg-verified",
  },
};

type Task = {
  asset: string;
  job: string;
  /* Why the task exists, in the sector's own words. This is the line that
     says Delphi supports structured industry workflows rather than asking
     people to upload photographs. */
  workflow: string;
  state: TaskState;
  when: string;
  /* What Delphi will require. Restrained on purpose — the home screen should
     not read as a security product. The detail comes after the task opens. */
  requires?: string;
  progress?: { done: number; of: number };
  action?: string;
};

const TASKS: Task[] = [
  {
    asset: "14 Berkeley Square",
    job: "Listing Evidence Capture",
    workflow: "Property Sale · Listing",
    state: "ready",
    when: "Due today · 11:30",
    requires: "12 captures · Location required",
    action: "Start",
  },
  {
    /* The cross-industry beat. One yacht among the property makes the point
       that this is a platform, and makes it without a word of explanation. */
    asset: "MY Aurora",
    job: "Charter Redelivery Inspection",
    workflow: "Yacht Charter · Redelivery",
    state: "progress",
    when: "Due today · 16:00",
    progress: { done: 7, of: 15 },
    action: "Continue",
  },
  {
    asset: "Project Aria · Level 3",
    job: "Pre-Pour Verification",
    workflow: "Construction · Milestone",
    state: "waiting",
    when: "Scheduled tomorrow",
    requires: "Waiting for site access",
  },
];

/* 28 Eaton Place is here rather than in the list above, where the brief first
   put it. Two reasons, and the second is the real one:

   The header says three tasks need attention today, and a task that is
   already verified needs none — it was quietly making that count wrong.

   And the two sections then divide the work properly. Above: three live
   tasks, three states, three industries. Below: what is already settled. That
   is the argument the screen exists to make — evidence does not stop at
   capture, it accumulates — and it makes it without a fourth card. */
const RECENT = [
  { asset: "28 Eaton Place", job: "Completion Verification", when: "09:42" },
  { asset: "67 Pont Street", job: "Viewing Evidence", when: "Yesterday" },
];

export function MobileTasks() {
  return (
    <div
      data-theme="light"
      className="flex h-full w-full flex-col overflow-hidden bg-surface-sunken text-ink"
    >
      <StatusBar />
      <AppHeader />

      {/* The scrolling body. It genuinely overflows the screen — the fold
          falls inside the Recent list, which is what a real phone would do
          and reads as more screen than the picture can show. */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <Greeting />
        <StartCapture />
        <TaskList />
        <Recent />
      </div>

      <TabBar />
    </div>
  );
}

/* ── Chrome ───────────────────────────────────────────────────────────────── */

function StatusBar() {
  return (
    <div
      className="flex shrink-0 items-start justify-between px-[27px] pt-[13px]"
      style={{ height: NOTCH_HEIGHT + 13 }}
    >
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <span className="flex items-center gap-[5px]">
        {/* Signal, wifi, battery — simple enough that the simplicity reads as
            correct rather than as a bad drawing of the real thing. */}
        <svg viewBox="0 0 18 12" className="h-[11px] w-[17px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={i * 4.5}
              y={8 - i * 2.4}
              width="3"
              height={4 + i * 2.4}
              rx="1"
              fill="currentColor"
            />
          ))}
        </svg>
        <svg viewBox="0 0 16 12" className="h-[11px] w-[15px]" aria-hidden>
          <path
            d="M1 4.4a10 10 0 0 1 14 0M3.6 7.1a6.4 6.4 0 0 1 8.8 0M8 10.2h.01"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
        <svg viewBox="0 0 26 12" className="h-[11px] w-[25px]" aria-hidden>
          <rect
            x="0.6"
            y="0.6"
            width="21"
            height="10.8"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.4"
            strokeWidth="1.2"
          />
          <rect x="2.2" y="2.2" width="15" height="7.6" rx="1.8" fill="currentColor" />
          <path d="M23.4 4.2v3.6a2 2 0 0 0 0-3.6Z" fill="currentColor" fillOpacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

function AppHeader() {
  return (
    <div className="flex shrink-0 items-center justify-between bg-surface px-[20px] pb-[10px] pt-[6px]">
      {/* The site's own wordmark, drawn the same way the header draws it — a
          mask over --logo-ink, so it inverts with the theme for free. Not the
          Wordmark component itself: that is a link to the homepage, and a
          navigating logo inside a picture of an app is a trap. */}
      <span
        role="img"
        aria-label={brand.name}
        className="block h-[21px] w-[74px]"
        style={{
          backgroundColor: "var(--logo-ink)",
          maskImage: "url(/assets/logo.svg)",
          WebkitMaskImage: "url(/assets/logo.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskPosition: "left center",
          WebkitMaskPosition: "left center",
        }}
      />
      <span className="flex items-center gap-[14px]">
        <span className="relative">
          <Icon name="bell" className="h-[19px] w-[19px] text-ink-secondary" />
          <span className="absolute -right-[1px] -top-[1px] h-[7px] w-[7px] rounded-full bg-accent ring-2 ring-surface" />
        </span>
        <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-surface-accent text-[11.5px] font-semibold text-ink-accent">
          AL
        </span>
      </span>
    </div>
  );
}

function Greeting() {
  return (
    <div className="bg-surface px-[20px] pb-[10px]">
      {/* Secondary to the greeting, as it should be: the organisation is
          context, not the thing the reader came for. */}
      <p className="text-[10.5px] font-medium uppercase tracking-[0.09em] text-ink-muted">
        Knight Frank · London Residential
      </p>
      <h1 className="mt-[5px] text-[23px] font-bold leading-[1.15] tracking-[-0.02em]">
        Good morning, Alex
      </h1>
      <p className="mt-[3px] text-[13.5px] text-ink-secondary">
        3 tasks need your attention today
      </p>
    </div>
  );
}

/* The one strong accent object on the screen. It is what makes the same page
   work for a personal user with nothing assigned to them — for them this is
   the whole product, and it must not look like an afterthought under a list
   of somebody else's work. */
function StartCapture() {
  return (
    <div className="bg-surface px-[20px] pb-[12px]">
      <div className="flex items-center gap-[13px] rounded-[15px] bg-accent px-[15px] py-[12px]">
        <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[11px] bg-accent-ink/15">
          <Icon name="plus" className="h-[19px] w-[19px] text-accent-ink" />
        </span>
        <span className="min-w-0">
          <span className="block text-[15.5px] font-semibold leading-tight text-accent-ink">
            Start new capture
          </span>
          <span className="mt-[2px] block text-[11.5px] leading-tight text-accent-ink/75">
            For a property, vehicle or other asset
          </span>
        </span>
        <Icon
          name="chevron"
          className="ml-auto h-[15px] w-[15px] shrink-0 text-accent-ink/60"
        />
      </div>
    </div>
  );
}

function TaskList() {
  return (
    <div className="px-[20px] pt-[10px]">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[17px] font-bold tracking-[-0.01em]">My Tasks</h2>
        {/* Two words, not a filter bar. On a phone the default view is the
            only one most people will ever use. */}
        <span className="flex items-center gap-[12px] text-[12px]">
          <span className="font-semibold text-ink">Today</span>
          <span className="text-ink-muted">Upcoming</span>
          <span className="text-ink-muted">Done</span>
        </span>
      </div>

      <div className="mt-[10px] flex flex-col gap-[7px]">
        {TASKS.map((t) => (
          <TaskCard key={t.asset} task={t} />
        ))}
      </div>
    </div>
  );
}

/** The hierarchy is the point: asset, then job, then why it exists, then
 *  urgency, then what is required, then the action. A reader should never
 *  have to decode internal workflow vocabulary to know what to do next. */
function TaskCard({ task: t }: { task: Task }) {
  const state = STATE[t.state];
  const done = t.state === "verified";

  return (
    <div
      className={cn(
        "rounded-[15px] border border-line bg-surface px-[14px] py-[11px]",
        done && "opacity-[0.72]",
      )}
    >
      <div className="flex items-start gap-[10px]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15.5px] font-semibold leading-tight tracking-[-0.01em]">
            {t.asset}
          </p>
          <p className="mt-[2px] truncate text-[12.5px] text-ink-secondary">
            {t.job}
          </p>
        </div>

        {t.action ? (
          <button
            type="button"
            tabIndex={-1}
            className={cn(
              "shrink-0 rounded-full px-[15px] py-[7px] text-[12.5px] font-semibold",
              t.state === "ready"
                ? "bg-accent text-accent-ink"
                : "border border-line-strong text-ink",
            )}
          >
            {t.action}
          </button>
        ) : (
          <span
            className={cn(
              "flex shrink-0 items-center gap-[5px] text-[11.5px] font-semibold",
              state.tone,
            )}
          >
            {done && <Icon name="check" className="h-[13px] w-[13px]" />}
            {state.label}
          </span>
        )}
      </div>

      <p className="mt-[8px] text-[10.5px] font-medium uppercase tracking-[0.07em] text-ink-muted">
        {t.workflow}
      </p>

      <div className="mt-[7px] flex items-center gap-[7px] border-t border-line pt-[7px] text-[11.5px]">
        {!done && (
          <span className={cn("h-[6px] w-[6px] shrink-0 rounded-full", state.dot)} />
        )}
        <span className={cn(done ? "text-verified" : "text-ink-secondary")}>
          {t.when}
        </span>
        {t.requires && (
          <span className="ml-auto truncate pl-[8px] text-ink-muted">
            {t.requires}
          </span>
        )}
        {t.progress && (
          <span className="ml-auto flex items-center gap-[7px] pl-[8px]">
            <span className="h-[4px] w-[54px] overflow-hidden rounded-full bg-surface-sunken">
              <span
                className="block h-full rounded-full bg-pending"
                style={{ width: `${(t.progress.done / t.progress.of) * 100}%` }}
              />
            </span>
            <span className="shrink-0 text-ink-muted">
              {t.progress.done}/{t.progress.of}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}

/* Smaller than the tasks on purpose. Its job is to show that finished work
   persists as a record, not to compete with the work still to do. */
function Recent() {
  return (
    <div className="px-[20px] pt-[12px]">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
        Recent
      </h2>
      <div className="mt-[9px] flex flex-col">
        {RECENT.map((r) => (
          <div
            key={r.asset}
            className="flex items-center gap-[10px] border-b border-line py-[9px]"
          >
            <Icon name="check" className="h-[14px] w-[14px] shrink-0 text-verified" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-medium leading-tight">
                {r.asset}
              </span>
              <span className="block truncate text-[11.5px] text-ink-muted">
                {r.job}
              </span>
            </span>
            <span className="shrink-0 text-[11.5px] text-ink-muted">{r.when}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Four, not five. Profile lives behind the avatar in the header — see §10 of
   the brief. Capture is a destination rather than a floating button because
   it is the personal user's entire product. */
const TABS = [
  { label: "Home", icon: "home" as const, active: true },
  { label: "Work", icon: "work" as const },
  { label: "Capture", icon: "camera" as const },
  { label: "Evidence", icon: "shield" as const },
];

function TabBar() {
  return (
    <div className="shrink-0 border-t border-line bg-surface pt-[9px]">
      <div className="flex items-start justify-around px-[8px]">
        {TABS.map((t) => (
          <span
            key={t.label}
            className={cn(
              "flex w-[70px] flex-col items-center gap-[4px]",
              t.active ? "text-ink-accent" : "text-ink-muted",
            )}
          >
            <Icon name={t.icon} className="h-[21px] w-[21px]" />
            <span
              className={cn(
                "text-[10px] leading-none",
                t.active ? "font-semibold" : "font-medium",
              )}
            >
              {t.label}
            </span>
          </span>
        ))}
      </div>
      {/* The home indicator. Cheap, and its absence is the kind of thing that
          makes a mockup read as a web page in a phone-shaped box. */}
      <div className="flex h-[22px] items-center justify-center">
        <span className="h-[5px] w-[134px] rounded-full bg-ink/25" />
      </div>
    </div>
  );
}

/* ── Icons ────────────────────────────────────────────────────────────────── */

/* Local rather than shared. The annotation set in components/annotation/Panel
   is drawn for 16px captions beside evidence rows; these are app chrome at
   19-21px and want a different weight. Sharing them would mean one set
   serving two jobs badly. */
const PATHS = {
  plus: "M12 5v14M5 12h14",
  chevron: "m9 5 7 7-7 7",
  check: "m4 12.5 5 5 11-11",
  bell: "M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7M13.7 20a2 2 0 0 1-3.4 0",
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5",
  work: "M3.5 7.5h17v12h-17zM9 7.5V5.5h6v2",
  camera:
    "M3.5 8.5h3.2l1.6-2.4h7.4l1.6 2.4h3.2v11h-17zM12 16.6a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Z",
  shield: "M12 3.2 20 6v6.2c0 5-3.4 8-8 9.6-4.6-1.6-8-4.6-8-9.6V6l8-2.8ZM8.6 12l2.5 2.5 4.3-4.6",
} as const;

function Icon({
  name,
  className,
}: {
  name: keyof typeof PATHS;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
