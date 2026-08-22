import { cn } from "@/lib/cn";
import { brand } from "@/content/site";
import { useDemoScroll } from "@/components/renderings/useDemoScroll";
import {
  ORG,
  PAGE,
  STATS,
  ATTENTION,
  FILTERS,
  JOBS,
  RECENT,
  ACTIVITY,
  type Job,
} from "@/content/dashboard";

/* ============================================================================
   RENDERING — WEB, ENTERPRISE DASHBOARD
   ============================================================================
   The reason an organisation buys this rather than a phone.

   Three seconds should be enough to leave with: my organisation can see what
   evidence needs collecting, what is happening now, what has been produced,
   and where somebody needs to step in. An operational command centre for
   trusted physical evidence — not an executive scorecard.

   ⚠️  NO CHARTS. The instinct on a dashboard is trend lines and doughnuts,
   and they would be the wrong screen entirely. What a person needs here is
   what needs doing, what is happening, what exists, and what is stuck — all
   four of which are lists and counts. A page of graphs says Delphi reports on
   evidence; a page of work says Delphi is how the evidence gets made.

   ⚠️  IT IS THE CUSTOMER'S APPLICATION, NOT AN ADMIN PORTAL. Creating jobs,
   assigning people, reviewing captures and opening records are ordinary
   customer work. Billing, platform configuration and support tooling live
   somewhere else, and calling this screen "Admin" would put the customer on
   the wrong side of their own product.

   ── WHERE IT SITS IN THE SEQUENCE ──
   My Tasks says what I have to do. Guided Capture collects it. The Evidence
   Record is what comes out. This is the same thing seen from above, a
   thousand at a time — and the Create job button is where the loop closes,
   because the job it makes is what lands in the task list on the first
   rendering.

   Authored at 1440x900 and scaled by WebFrame — see WEB_CANVAS. Taller than
   the frame on purpose: it is a real page in a real scrollport, walked down
   and back by useDemoScroll.

   ⚠️  NOT A SCREENSHOT. Nothing here is running software. See the warning at
   the top of content/renderings.ts.
   ========================================================================= */

export function WebDashboard() {
  const scroller = useDemoScroll<HTMLDivElement>();

  return (
    <div
      data-theme="light"
      className="flex h-full w-full overflow-hidden bg-surface-sunken text-ink"
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        {/* Only the working area scrolls. A sidebar and a search bar that
            scroll away are not a sidebar and a search bar. */}
        <div ref={scroller} className="min-w-0 flex-1 overflow-y-auto px-8 pb-8">
          <PageHead />
          <Stats />
          <AttentionStrip />
          <ActiveWork />
          <div className="mt-7 grid grid-cols-[1.85fr_1fr] gap-6">
            <RecentEvidence />
            <Activity />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Dark, like the evidence record's — data-theme="dark" on the subtree rather
   than a palette of its own, which is the same mechanism the site's inverse
   sections use. The app chrome and the marketing page cannot drift apart.

   The nav names the architecture: work to do, the things it is done to, what
   it produced, and who does it. Organisation and Settings are pushed to the
   foot because they are not the job. */
function Sidebar() {
  const nav = ["Home", "Jobs", "Assets", "Evidence", "Team"];
  const foot = ["Organisation", "Settings"];
  return (
    <div
      data-theme="dark"
      className="flex w-[208px] shrink-0 flex-col bg-canvas px-4 py-5 text-ink"
    >
      <span
        role="img"
        aria-label={brand.name}
        className="mb-7 ml-2 block h-[26px] w-[91px]"
        style={{
          backgroundColor: "var(--logo-ink)",
          maskImage: "url(/assets/logo.svg)",
          WebkitMaskImage: "url(/assets/logo.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
      <nav className="flex flex-col gap-0.5">
        {nav.map((item) => (
          <span
            key={item}
            className={cn(
              "rounded-md px-3 py-2 text-[13px]",
              item === "Home"
                ? "bg-surface-raised font-semibold text-ink"
                : "text-ink-secondary",
            )}
          >
            {item}
          </span>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-0.5 border-t border-line pt-4">
        {foot.map((item) => (
          <span key={item} className="rounded-md px-3 py-2 text-[13px] text-ink-secondary">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <div className="flex h-14 shrink-0 items-center gap-6 border-b border-line bg-surface px-8">
      {/* The workspace selector. One organisation today; the seam where
          countries, offices and portfolios appear when there are any, and
          which a single-person account never opens. */}
      <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[13px] font-semibold text-ink">
        {ORG.workspace}
        <Chevron />
      </span>

      {/* Certificate IDs belong in the placeholder. Typing W1MQ-E4ML and
          landing on the record is what turns a pile of certificates into an
          evidence system, and the search field is the only place on the
          screen that can say so. */}
      <span className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-line bg-surface-sunken px-3 py-1.5 text-[13px] text-ink-muted">
        <SearchIcon />
        <span className="truncate">{PAGE.search}</span>
      </span>

      <span className="flex shrink-0 items-center gap-4">
        <BellIcon />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-accent-ink">
          {ORG.user.initials}
        </span>
      </span>
    </div>
  );
}

function PageHead() {
  return (
    <div className="flex items-start justify-between gap-8 pb-6 pt-6">
      <div className="min-w-0">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
          {PAGE.greeting}
        </span>
        <h1 className="mt-1.5 text-[26px] font-semibold leading-tight text-ink">
          {PAGE.heading}
        </h1>
        <p className="mt-1.5 text-[13px] text-ink-secondary">{PAGE.standfirst}</p>
        {/* The information model, in one quiet line: an organisation holds
            assets, assets carry jobs, jobs produce evidence records. */}
        <p className="mt-2.5 text-[12px] text-ink-muted">
          <span className="font-semibold text-ink-secondary">{ORG.scope}</span>
          {" · "}
          {ORG.scopeCounts}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-ink">
        <PlusIcon />
        {PAGE.action}
      </span>
    </div>
  );
}

function Stats() {
  return (
    <div className="grid grid-cols-4 gap-4">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="rounded-lg border border-line bg-surface px-5 py-4"
        >
          <span
            className={cn(
              "block text-[30px] font-semibold leading-none",
              "tone" in stat && stat.tone === "pending" ? "text-pending" : "text-ink",
            )}
          >
            {stat.value}
          </span>
          <span className="mt-2 block text-[13px] font-semibold text-ink">
            {stat.label}
          </span>
          <span className="mt-0.5 block text-[11px] text-ink-muted">{stat.note}</span>
        </div>
      ))}
    </div>
  );
}

/* Triage, not adjudication. Delphi is saying a job is late, a capture is
   waiting to be looked at and one has nobody on it — all workflow facts. It
   is not deciding anything about the evidence, and this strip must never
   start reading as though it were. */
function AttentionStrip() {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-lg border border-pending bg-pending-tint px-5 py-3">
      <AlertIcon />
      <span className="text-[13px] font-semibold text-ink">{ATTENTION.headline}</span>
      <span className="text-[12px] text-ink-secondary">{ATTENTION.detail}</span>
      <span className="ml-auto flex items-center gap-1 text-[12px] font-semibold text-ink-accent">
        {ATTENTION.action}
        <Arrow />
      </span>
    </div>
  );
}

function ActiveWork() {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
          Active work
        </h2>
        {/* Visible and collapsed: enough to say this scales past one office
            without spending the screen on proving it. */}
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <span
              key={f}
              className="flex items-center gap-1 rounded-md border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-secondary"
            >
              {f}
              <Chevron />
            </span>
          ))}
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-line bg-surface">
        <div className="grid grid-cols-[1.5fr_1.1fr_1.2fr_0.8fr_0.7fr] gap-4 border-b border-line px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
          <span>Asset</span>
          <span>Workflow</span>
          <span>Assigned to</span>
          <span>Status</span>
          <span>Due</span>
        </div>
        {JOBS.map((job) => (
          <JobRow key={job.asset} job={job} />
        ))}
      </div>
    </div>
  );
}

/* The row carries a person, not just a name. The enterprise proposition is
   not asset → software → certificate; it is organisation → person → asset →
   capture → record → counterparty, and the only place that whole chain is
   visible at once is here. */
function JobRow({ job }: { job: Job }) {
  return (
    <div className="grid grid-cols-[1.5fr_1.1fr_1.2fr_0.8fr_0.7fr] items-center gap-4 border-b border-line px-5 py-3 last:border-b-0">
      <span className="flex min-w-0 items-center gap-2.5">
        {job.thumb ? (
          <img
            aria-hidden
            alt=""
            src={`/assets/captures/${job.thumb}-240.webp`}
            className="h-8 w-8 shrink-0 rounded-sm object-cover"
          />
        ) : (
          /* An asset mark, not an empty box. Four blank grey squares down a
             column read as four images that failed to load; a glyph reads as
             a job whose asset has no cover shot yet, which is what it is. */
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-line bg-surface-sunken">
            <AssetIcon />
          </span>
        )}
        <span className="truncate text-[13px] font-semibold text-ink">
          {job.asset}
        </span>
      </span>

      <span className="truncate text-[12px] text-ink-secondary">{job.workflow}</span>

      {job.assignee ? (
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[10px] font-semibold text-ink-secondary">
            {job.assignee.initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] text-ink">
              {job.assignee.name}
            </span>
            <span className="block truncate text-[10px] text-ink-muted">
              {job.assignee.role}
            </span>
          </span>
        </span>
      ) : (
        <span className="text-[12px] text-ink-muted">—</span>
      )}

      <StatusPill job={job} />

      <span
        className={cn(
          "text-[12px]",
          job.flagged ? "font-semibold text-pending" : "text-ink-secondary",
        )}
      >
        {job.due}
      </span>
    </div>
  );
}

function StatusPill({ job }: { job: Job }) {
  const attention = job.status === "Unassigned" || job.status === "Review";
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          job.status === "Capturing"
            ? "bg-accent"
            : attention
              ? "bg-pending"
              : "bg-ink-muted",
        )}
      />
      <span className="text-[12px] text-ink">{job.status}</span>
    </span>
  );
}

/* Three assets from three industries, said with photographs. It is the
   cheapest possible way to show the model is asset-agnostic — and much
   cheaper than a paragraph claiming it. */
function RecentEvidence() {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        Recent evidence
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-4">
        {RECENT.map((item) => (
          <div
            key={item.code}
            className="overflow-hidden rounded-lg border border-line bg-surface"
          >
            <img
              aria-hidden
              alt=""
              src={item.image}
              className="block h-[92px] w-full object-cover"
            />
            <div className="px-3.5 py-3">
              <span className="block truncate text-[12px] font-semibold text-ink">
                {item.asset}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
                {item.workflow}
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-verified">
                <TickIcon />
                Verified
              </span>
              <span className="mt-1.5 block font-mono text-[10px] tracking-wide text-ink-secondary">
                {item.code}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Activity() {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        Activity
      </h2>
      <div className="mt-3 rounded-lg border border-line bg-surface px-4 py-3">
        {ACTIVITY.map((entry) => (
          <div
            key={entry.time}
            className="flex gap-3 border-b border-line py-2.5 last:border-b-0 last:pb-0 first:pt-0"
          >
            <span className="w-9 shrink-0 pt-px font-mono text-[10px] text-ink-muted">
              {entry.time}
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "flex items-start gap-1.5 text-[12px]",
                  "tone" in entry && entry.tone === "verified"
                    ? "font-semibold text-ink"
                    : "text-ink",
                )}
              >
                {"tone" in entry && entry.tone === "verified" && <TickIcon />}
                <span className="min-w-0">{entry.text}</span>
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
                {entry.detail}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Marks ──────────────────────────────────────────────────────────────── */

function AssetIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 13.5h11M4 13.5V5l4-2.5L12 5v8.5" />
      <path d="M6.6 13.5v-3h2.8v3" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 4.5 3 3 3-3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5" />
      <path d="m10.5 10.5 3 3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 shrink-0 text-ink-secondary" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6.5a4 4 0 0 1 8 0c0 3 1 4 1 4H3s1-1 1-4Z" />
      <path d="M6.6 13a1.6 1.6 0 0 0 2.8 0" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M6 2v8M2 6h8" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 shrink-0 text-pending" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.4 14.2 13H1.8Z" />
      <path d="M8 6.6v3M8 11.2h.01" />
    </svg>
  );
}

function TickIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="mt-px h-3 w-3 shrink-0 text-verified" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8.5 3.2 3.2L13 5" />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5" />
    </svg>
  );
}
