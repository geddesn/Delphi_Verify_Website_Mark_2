import { cn } from "@/lib/cn";

/* ============================================================================
   RENDERING — EVIDENCE RECORD (mobile)
   ============================================================================
   The same sealed record as WebEvidenceRecord, seen by the other person who
   opens it: whoever captured it, on the phone still in their hand, minutes
   after submitting.

   IT IS THE SAME RECORD, so the facts must match its desktop twin exactly —
   same address, same code, same twenty captures, same window, same fingerprint.
   A viewer comparing the two frames and finding different numbers learns that
   neither is real. The shared fixture in content/evidence-record.ts exists for
   that reason; do not restate any of it here.

   WHAT DIFFERS IS EMPHASIS, NOT CONTENT. At a desk the question is "can I rely
   on this" — hence the desktop's indexed strip, fingerprint and the route to
   recompute. In a hand on a doorstep it is "did that go through" — hence the
   verdict, the count, and one way to hand it on. The detail is not hidden, it
   is one tap away, which is what the certificate row is.

   Authored at iPhone logical pixels (390x844).

   ⚠️  NOT A SCREENSHOT.
   ========================================================================= */

import { RECORD, CAPTURES, OPEN_DETAIL, SIGNALS } from "@/content/evidence-record";
import { CaptureMap } from "@/components/renderings/CaptureMap";

const NOTCH_HEIGHT = 31;

/* Four, the same four the desktop tiles carry, in the same order. */
const FACTS = [
  { label: "Captures", value: `${RECORD.captureCount}` },
  { label: "Window", value: RECORD.window },
  { label: "Location", value: RECORD.locationShort },
  { label: "Integrity", value: "Sealed", tick: true },
];

export function MobileEvidenceRecord() {
  return (
    <div
      data-theme="light"
      className="flex h-full w-full flex-col overflow-hidden bg-surface-sunken text-ink"
    >
      <StatusBar />

      {/* The verdict, on the accent surface, before anything else. This is the
          one screen in the set where the reader wants an answer rather than a
          task, and making them assemble it from four tiles would be a worse
          answer than simply giving it. */}
      <div className="shrink-0 bg-surface px-[20px] pb-[16px]">
        <div className="flex items-center gap-[9px]">
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-verified-tint">
            <Icon name="check" className="h-[14px] w-[14px] text-verified" />
          </span>
          <span className="text-[12px] font-bold uppercase tracking-[0.09em] text-verified">
            Evidence verified
          </span>
        </div>
        <h1 className="mt-[10px] text-[21px] font-bold leading-tight tracking-[-0.02em]">
          {RECORD.address}
        </h1>
        <p className="mt-[3px] text-[12.5px] leading-snug text-ink-secondary">
          {RECORD.job}
        </p>
        <p className="mt-[10px] flex items-center gap-[7px] text-[11.5px] text-ink-secondary">
          <span className="rounded-[5px] bg-surface-accent px-[7px] py-[2px] font-mono text-[11.5px] font-semibold tracking-[0.04em] text-ink-accent">
            {RECORD.code}
          </span>
          Completed {RECORD.completed}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* The same four figures as the desktop tiles, two up rather than four
            across. */}
        <div className="grid grid-cols-2 gap-px border-y border-line bg-line">
          {FACTS.map((f) => (
            <div key={f.label} className="bg-surface px-[20px] py-[10px]">
              <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink-muted">
                {f.label}
              </p>
              <p
                className={cn(
                  "mt-[2px] flex items-center gap-[4px] text-[14px] font-bold tracking-[-0.01em]",
                  f.tick && "text-verified",
                )}
              >
                {f.tick && <Icon name="check" className="h-[12px] w-[12px]" />}
                {f.value}
              </p>
            </div>
          ))}
        </div>

        {/* The captures, indexed. Three across rather than the desktop's
            filmstrip, but the number under each is the same number — it is
            the position the attestation commits to, not a caption. */}
        <div className="px-[20px] pt-[14px]">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
              Captures
            </h2>
            <span className="text-[11px] text-ink-muted">
              {RECORD.captureCount} sealed
            </span>
          </div>

          <div className="mt-[9px] grid grid-cols-3 gap-[7px]">
            {/* All nine, same as the desktop filmstrip. Six left a hole above
                the buttons, and a record that shows fewer captures than its
                twin invites exactly the comparison it would lose. */}
            {CAPTURES.map((c) => (
              <div key={c.n}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-[7px] bg-surface">
                  <img
                    src={`/assets/captures/${c.name}-240.webp`}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="mt-[4px] font-mono text-[9.5px] text-ink-muted">
                  #{String(c.n).padStart(2, "0")} {c.time}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* One tap to the thing that makes it checkable. The hashes and the
            schema are not on this screen, but the way to them is. */}
        <div className="mt-[14px] px-[20px]">
          <div className="flex items-center gap-[11px] rounded-[13px] border border-line bg-surface px-[14px] py-[12px]">
            <span className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-[10px] bg-surface-accent">
              <Icon name="seal" className="h-[16px] w-[16px] text-ink-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold leading-tight">
                Sealed evidence record
              </span>
              <span className="mt-[1px] block truncate font-mono text-[10.5px] text-ink-muted">
                {RECORD.network} · {RECORD.schema}
              </span>
            </span>
            <Icon
              name="chevron"
              className="h-[14px] w-[14px] shrink-0 text-ink-muted"
            />
          </div>
        </div>

        {/* The map answers what the coordinates cannot: a reader who does not
            know what 51.492134 means still knows whether a pin is on the
            right street. The same real Google map as the desktop, at the
            same address — see CaptureMap. */}
        <div className="mt-[16px] px-[20px]">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
            Capture location
          </h2>
          {/* Tall enough that the pin has somewhere to sit. Below about
              120px the map is a band of street names with the marker jammed
              against the edges, which says less than no map at all. */}
          <div className="mt-[9px] h-[126px] overflow-hidden rounded-[11px] border border-line">
            <CaptureMap />
          </div>
          <div className="mt-[9px] flex items-start gap-[8px]">
            <Icon
              name="check"
              className="mt-[2px] h-[13px] w-[13px] shrink-0 text-verified"
            />
            <p className="text-[11.5px] leading-snug text-ink-secondary">
              <span className="font-semibold text-ink">
                All {RECORD.captureCount} captures
              </span>{" "}
              consistent with the expected location. Recorded per capture, not
              once for the job.
            </p>
          </div>
          <p className="mt-[7px] font-mono text-[10.5px] text-ink-muted">
            {OPEN_DETAIL.coordinates} · {OPEN_DETAIL.accuracy}
          </p>
        </div>

        {/* The six signals, compact. Same data as the desktop, so a reader
            comparing the two frames finds the same answer — including the one
            that is not a tick. */}
        <div className="mt-[18px] px-[20px] pb-[16px]">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
            Why Delphi accepted this
          </h2>
          <ul className="mt-[9px] flex flex-col">
            {SIGNALS.map((sig) => (
              <li
                key={sig.label}
                className="flex items-center gap-[9px] border-b border-line py-[8px]"
              >
                {sig.available ? (
                  <Icon
                    name="check"
                    className="h-[13px] w-[13px] shrink-0 text-verified"
                  />
                ) : (
                  <span className="h-[9px] w-[9px] shrink-0 rounded-full border border-line-strong" />
                )}
                <span className="w-[74px] shrink-0 text-[11.5px] font-semibold">
                  {sig.label}
                </span>
                <span
                  className={cn(
                    "min-w-0 flex-1 truncate text-[11px]",
                    sig.available ? "text-ink-secondary" : "text-ink-muted",
                  )}
                >
                  {sig.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sharing is the whole point of holding it. A record nobody else can
          open is not evidence, it is a photo album. */}
      <div className="shrink-0 border-t border-line bg-surface px-[20px] pb-[26px] pt-[12px]">
        <div className="flex gap-[9px]">
          <span className="flex flex-1 items-center justify-center gap-[7px] rounded-[12px] bg-accent py-[12px] text-[13.5px] font-semibold text-accent-ink">
            <Icon name="share" className="h-[15px] w-[15px]" />
            Share record
          </span>
          <span className="flex items-center justify-center rounded-[12px] border border-line px-[16px] text-[13.5px] font-semibold text-ink">
            Export
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="flex shrink-0 items-start justify-between bg-surface px-[27px] pt-[13px]"
      style={{ height: NOTCH_HEIGHT + 13 }}
    >
      <span className="text-[15px] font-semibold tracking-tight">9:41</span>
      <span className="flex items-center gap-[5px]">
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

const PATHS = {
  check: "m4 12.5 5 5 11-11",
  chevron: "m9 5 7 7-7 7",
  seal: "M12 3.2 20 6v6.2c0 5-3.4 8-8 9.6-4.6-1.6-8-4.6-8-9.6V6l8-2.8ZM8.6 12l2.5 2.5 4.3-4.6",
  share: "M12 15V4m0 0L8 8m4-4 4 4M5 14v5h14v-5",
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
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
