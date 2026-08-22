import { cn } from "@/lib/cn";
import { brand } from "@/content/site";
import { useDemoScroll } from "@/components/renderings/useDemoScroll";
import { ORG, PAGE } from "@/content/dashboard";
import {
  ASSET,
  SUMMARY,
  TABS,
  ACTIVE_TAB,
  LATEST,
  PERSISTENCE,
  EVENTS,
  OPEN_WORK,
  STAKEHOLDERS,
  type AssetEvent,
} from "@/content/asset-history";

/* ============================================================================
   RENDERING — WEB, ASSET & EVIDENCE HISTORY
   ============================================================================
   The screen that changes the mental model.

   The other four say Delphi verifies photographs. This one says Delphi keeps
   a trusted history of a physical thing: open a property, a vessel, a plot or
   a machine and read what verified evidence exists for it, who made it, when,
   and what has changed. Four isolated certificates are worth four times one
   certificate; a chronology is worth more than that, because it answers the
   question no single record can — when did anybody last actually look?

   ⚠️  THE TIMELINE IS THE PAGE. Everything above it is identification and
   everything below is context. If a reader takes one thing from three seconds
   here it must be the column of dated states running down the left, because
   that column IS the platform proposition.

   ⚠️  NO TRUST SCORE, NO HEALTH RING, NO PERCENTAGE. Delphi knows when
   somebody last looked at this property. It does not know what the property
   looks like now, and any dial implying otherwise is a claim about continuous
   knowledge of the physical world that the product does not have. Recency is
   stated as a fact — see SUMMARY.note.

   ⚠️  OLD RECORDS ARE NOT GREYED OUT. Verified and superseded are different
   axes: verification is a fact about a moment and does not decay, while
   supersession only says a newer record exists. Fading the older entries — or
   dropping their ticks — would destroy the one thing that makes a history
   worth keeping.

   Authored at 1440x900 and scaled by WebFrame. Taller than the frame on
   purpose: a real page in a real scrollport, walked down and back by
   useDemoScroll.

   ⚠️  NOT A SCREENSHOT. See the warning at the top of content/renderings.ts.
   ========================================================================= */

export function WebAssetHistory() {
  const scroller = useDemoScroll<HTMLDivElement>();

  return (
    <div
      data-theme="light"
      className="flex h-full w-full overflow-hidden bg-surface-sunken text-ink"
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <div ref={scroller} className="min-w-0 flex-1 overflow-y-auto px-8 pb-8">
          <AssetHead />
          <HeroAndSummary />
          <TimelineStrip />
          <Tabs />
          <LatestState />
          <EvidenceHistory />
          <div className="mt-7 grid grid-cols-2 gap-6">
            <OpenWork />
            <Stakeholders />
          </div>
        </div>
      </div>
    </div>
  );
}

/* Identical to the dashboard's, and imported nowhere — the two renderings
   share content but not markup, because a shared chrome component would make
   a change to one screen silently change the other, and these are pictures of
   a design rather than a design system. Assets is the active item here. */
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
              item === "Assets"
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
      <span className="flex shrink-0 items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 text-[13px] font-semibold text-ink">
        {ORG.workspace}
        <Chevron />
      </span>
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

/* The ASSET is the primary object here, not the record — which is the whole
   difference between this screen and the evidence record. */
function AssetHead() {
  return (
    <div className="pb-5 pt-6">
      <span className="flex items-center gap-1.5 text-[12px] text-ink-secondary">
        <BackArrow />
        Assets
      </span>
      <div className="mt-3 flex items-start justify-between gap-8">
        <div className="min-w-0">
          <h1 className="text-[26px] font-semibold leading-tight text-ink">
            {ASSET.name}
          </h1>
          <p className="mt-1.5 text-[13px] text-ink-secondary">
            {ASSET.locality} · {ASSET.type}
            <span className="ml-2 rounded-sm bg-verified-tint px-1.5 py-0.5 text-[11px] font-semibold text-verified">
              {ASSET.state}
            </span>
          </p>
        </div>
        {/* An asset record that cannot commission its own next capture is a
            filing cabinet. This is where a history becomes a process. */}
        <span className="flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-[13px] font-semibold text-accent-ink">
          <PlusIcon />
          {PAGE.action}
        </span>
      </div>
    </div>
  );
}

function HeroAndSummary() {
  return (
    <div className="grid grid-cols-[1.55fr_1fr] gap-5">
      {/* A verified photograph from the latest record, not stock. The asset a
          reader is looking at should be the asset Delphi has evidence of. */}
      {/* h-full, not a fixed height. The panels beside it stack to whatever
          their content needs, and a fixed hero left a band of dead page
          between the bottom of the photograph and the strip below — which is
          the first thing the eye finds after the address. As a stretched grid
          item the picture simply matches the column next to it. */}
      <img
        aria-hidden
        alt=""
        src={ASSET.hero}
        className="block h-full w-full rounded-lg object-cover"
      />

      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-line bg-surface px-5 py-4">
          <span className="block text-[30px] font-semibold leading-none text-ink">
            {SUMMARY.records}
          </span>
          <span className="mt-1.5 block text-[13px] font-semibold text-ink">
            {SUMMARY.recordsLabel}
          </span>
          <dl className="mt-3 flex flex-col gap-1.5 border-t border-line pt-3 text-[11px]">
            <Row label="Last verified" value={`${SUMMARY.lastVerified} · ${SUMMARY.age}`} />
            <Row label="First verified" value={SUMMARY.firstVerified} />
            <Row label="Stakeholders" value={SUMMARY.stakeholders} />
          </dl>
          {/* The honest half of "last verified". A photograph does not stay
              proof of current condition, and saying so is what stops the
              date above reading as a guarantee. */}
          <p className="mt-2.5 text-[10px] leading-snug text-ink-muted">
            {SUMMARY.note}
          </p>
        </div>

        <div className="rounded-lg border border-line bg-surface px-5 py-4">
          <dl className="flex flex-col gap-1.5 text-[11px]">
            {ASSET.identity.map((item) => (
              <Row
                key={item.label}
                label={item.label}
                value={item.value}
                mono={"mono" in item && item.mono}
              />
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd
        className={cn(
          "min-w-0 truncate text-right text-ink",
          mono ? "font-mono tracking-wide" : "font-semibold",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* The whole history in one line, above everything that explains it.
   A reader who takes nothing else from this screen should take this: four
   dated states, spaced out over eight months, on one asset.

   ⚠️  LEFT TO RIGHT IS OLDEST TO NEWEST — the reverse of the list below it.
   That is not an inconsistency. A horizontal axis is time and reads forward;
   a vertical feed is a stack and reads newest-first, which is what every
   record list a person has ever used does. Making them agree would break one
   convention to satisfy the other.

   A four-column grid rather than justify-between, so the dot centres land on
   exact percentages and the dotted rule can be drawn between the first and
   last of them without measuring anything. */
function TimelineStrip() {
  const chronological = [...EVENTS].reverse();
  const half = 100 / chronological.length / 2;

  return (
    <div className="relative mt-5">
      <span
        aria-hidden
        className="absolute top-[6px] border-t border-dashed border-line-strong"
        style={{ left: `${half}%`, right: `${half}%` }}
      />
      <div className="grid" style={{ gridTemplateColumns: `repeat(${chronological.length}, minmax(0, 1fr))` }}>
        {chronological.map((event) => (
          <span key={event.code} className="flex flex-col items-center gap-1.5">
            {/* After the rule in the DOM, so it paints over it. */}
            <span
              aria-hidden
              className={cn(
                "h-[13px] w-[13px] rounded-full border-2",
                event.current
                  ? "border-accent bg-accent"
                  : "border-line-strong bg-surface",
              )}
            />
            <span className="font-mono text-[10px] tracking-wide text-ink-muted">
              {event.shortDate}
            </span>
            <span
              className={cn(
                "text-[12px]",
                event.current ? "font-semibold text-ink" : "text-ink-secondary",
              )}
            >
              {event.short}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function Tabs() {
  return (
    <div className="mt-6 flex items-center gap-1 border-b border-line">
      {TABS.map((tab) => (
        <span
          key={tab}
          className={cn(
            "-mb-px border-b-2 px-3 pb-2.5 text-[13px]",
            tab === ACTIVE_TAB
              ? "border-accent font-semibold text-ink"
              : "border-transparent text-ink-secondary",
          )}
        >
          {tab}
        </span>
      ))}
    </div>
  );
}

/* What somebody came for, before they read eight months of history. Facts
   about the session — never a conclusion about the property. No thumbnails
   here: the first timeline entry below carries them, and showing the same
   four photographs twice on one screen wastes the only space this page has. */
function LatestState() {
  return (
    <div className="mt-5 flex items-center gap-5 rounded-lg border border-verified bg-verified-tint px-5 py-3.5">
      <TickIcon />
      <div className="min-w-0">
        <span className="block text-[13px] font-semibold text-ink">
          Latest verified state · {LATEST.headline}
        </span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-secondary">
          {LATEST.facts.join(" · ")}
        </span>
      </div>
      <span className="ml-auto flex shrink-0 items-center gap-1 text-[12px] font-semibold text-ink-accent">
        {LATEST.action}
        <Arrow />
      </span>
    </div>
  );
}

function EvidenceHistory() {
  return (
    <div className="mt-7">
      <div className="flex items-center justify-between gap-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
          Evidence history
        </h2>
        {/* The single strongest idea on the page after the timeline itself:
            two independently verified states, compared. It is what a
            before-and-after photograph has never been able to be. */}
        <span className="flex items-center gap-1.5 rounded-md border border-line bg-surface px-3 py-1.5 text-[12px] font-semibold text-ink">
          <CompareIcon />
          Compare records
        </span>
      </div>

      {/* The rule runs the height of the list and the markers sit on it, so
          four events read as one thread rather than four cards. */}
      <div className="relative mt-4 pl-6">
        <span
          aria-hidden
          className="absolute bottom-3 left-[5px] top-2 w-px bg-line-strong"
        />
        {EVENTS.map((event) => (
          <Event key={event.code} event={event} />
        ))}
      </div>

      <p className="mt-4 max-w-3xl text-[11px] leading-relaxed text-ink-muted">
        {PERSISTENCE}
      </p>
    </div>
  );
}

function Event({ event }: { event: AssetEvent }) {
  return (
    <div className="relative pb-6 last:pb-0">
      <span
        aria-hidden
        className={cn(
          "absolute -left-6 top-1.5 h-[11px] w-[11px] rounded-full border-2 border-surface",
          event.current ? "bg-accent" : "bg-ink-muted",
        )}
      />
      <span className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
        {event.date}
      </span>

      <div className="mt-1.5 rounded-lg border border-line bg-surface px-5 py-4">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <span className="block text-[15px] font-semibold text-ink">
              {event.title}
            </span>
            <span className="mt-1 block text-[11px] text-ink-muted">
              {event.category} · {event.captures} captures
              {event.by && ` · captured by ${event.by}`}
              {event.window && ` · ${event.window}`}
            </span>
          </div>

          {/* Verified on every entry, current on one. Two facts, one line:
              the older records were verified and still are — they have simply
              been added to. */}
          <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold text-verified">
            <TickIcon />
            Verified
            <span className="font-normal text-ink-muted">
              · {event.current ? "Current" : "Superseded"}
            </span>
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-wide text-ink-secondary">
            {event.code}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-ink-accent">
            Open evidence record
            <Arrow />
          </span>
        </div>

        {event.thumbs && (
          <div className="mt-3 flex gap-2">
            {event.thumbs.map((thumb) => (
              <img
                key={thumb}
                aria-hidden
                alt=""
                src={`/assets/captures/${thumb}-240.webp`}
                className="block h-[54px] w-[80px] rounded-sm object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OpenWork() {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        Open work
      </h2>
      <div className="mt-3 rounded-lg border border-line bg-surface">
        {OPEN_WORK.map((job) => (
          <div
            key={job.title}
            className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-b-0"
          >
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-ink">
                {job.title}
              </span>
              <span className="mt-0.5 block truncate text-[11px] text-ink-muted">
                {job.assignee} · {job.detail}
              </span>
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1 text-[11px] font-semibold text-ink-accent">
              View job
              <Arrow />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stakeholders() {
  return (
    <div>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
        People &amp; organisations
      </h2>
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line">
        {STAKEHOLDERS.map((person) => (
          <div key={person.name} className="flex items-center gap-2.5 bg-surface px-4 py-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-[10px] font-semibold text-ink-secondary">
              {person.initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[12px] text-ink">{person.name}</span>
              <span className="block truncate text-[10px] text-ink-muted">
                {person.role}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Marks ──────────────────────────────────────────────────────────────── */

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

function BackArrow() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 6H2M5.5 2.5 2 6l3.5 3.5" />
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

function TickIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 text-verified" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 8.5 3.2 3.2L13 5" />
    </svg>
  );
}

function CompareIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-secondary" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.8" y="3.2" width="5.2" height="9.6" rx="1" />
      <rect x="9" y="3.2" width="5.2" height="9.6" rx="1" />
    </svg>
  );
}
