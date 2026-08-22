import { cn } from "@/lib/cn";

/* ============================================================================
   RENDERING — MOBILE 02, GUIDED CAPTURE
   ============================================================================
   The screen that has to carry the argument. My Tasks says Delphi has work in
   it; this one says why that work is different from pointing a camera at a
   house.

   The brief separates two things and so does the layout, because the
   distinction IS the product:

     what the PERSON must do    — the instruction, the plan, the requirements
     what DELPHI is checking    — location, device, time, integrity

   The first is prose in the reader's own language. The second is four quiet
   ticks that never explain themselves. Merge them and it becomes a security
   product; keep them apart and it reads as guided work that happens to be
   trustworthy.

   Authored at iPhone logical pixels (390x844) like the rest — see the note at
   the top of MobileTasks.

   ⚠️  NOT A SCREENSHOT. Nothing here is running software.
   ========================================================================= */

const NOTCH_HEIGHT = 31;

/* Deliberately mid-task. A capture screen at 0 of 12 shows a workflow that has
   not started; at 12 of 12 it is over. Four of twelve is the only state that
   shows a sequence being worked through, which is the thing being claimed. */
const PROGRESS = { done: 4, of: 12 };

/* WHAT IS BEING CAPTURED. The screen itself is generic — the workflow supplies
   the subject, the plan and the requirements, which is the actual architecture
   of guided capture and not a convenience for this file. The property below is
   the default because it is what /platform/renderings shows; the trust engine
   passes a yacht through the same component. */
export type CaptureSubject = {
  asset: string;
  /** Workflow and stage, one line: "Listing Evidence Capture · Property Sale". */
  job: string;
  /** The single item due right now. */
  subject: string;
  instruction: string;
  /** The viewfinder picture, already sized. */
  image: string;
  imageSrcSet?: string;
  imageSizes?: string;
  /** The ordered plan. The item at `done` is the one in the viewfinder. */
  plan: readonly string[];
  done: number;
  /** Required captures in total, which may be more than `plan` shows. */
  total: number;
};

/* The plan, in the order it is walked. Two things are load-bearing here: the
   completed items are named rooms rather than ticks, so a reader sees that
   Delphi decided what was required; and the current item is not first, so the
   list obviously continues above and below. */
const PLAN = [
  "Property entrance",
  "Address / number",
  "Entrance hall",
  "Reception room",
  "Front elevation",
  "Kitchen",
  "Principal bedroom",
  "Garden",
  "Rear elevation",
];

const PROPERTY: CaptureSubject = {
  asset: "14 Berkeley Square",
  job: "Listing Evidence Capture · Property Sale",
  subject: "Front Elevation",
  instruction:
    "Capture the full front of the property from across the street, with the main entrance in frame.",
  image: "/assets/renderings/townhouse-facade-736.webp",
  imageSrcSet:
    "/assets/renderings/townhouse-facade-368.webp 368w, /assets/renderings/townhouse-facade-736.webp 736w",
  imageSizes: "300px",
  plan: PLAN,
  done: PROGRESS.done,
  total: PROGRESS.of,
};

/* Four, compact, and never more than a word or two. The brief is explicit
   that this must not become a technical panel — the reader should register
   that checks exist, not read them. Hashes, coordinates and chain references
   belong in the evidence record, not over a viewfinder. */
const CHECKS = [
  { label: "Location", ok: true },
  { label: "Device", ok: true },
  { label: "Time", ok: true },
  { label: "Integrity", ok: true },
];

export function MobileCapture({
  subject = PROPERTY,
}: {
  subject?: CaptureSubject;
} = {}) {
  const s = subject;
  return (
    <div
      data-theme="light"
      className="flex h-full w-full flex-col overflow-hidden bg-surface text-ink"
    >
      <StatusBar />
      <TaskHeader s={s} />
      <Instruction s={s} />
      <Viewfinder s={s} />
      <CapturePlan s={s} />
    </div>
  );
}

function StatusBar() {
  return (
    <div
      className="flex shrink-0 items-start justify-between px-[27px] pt-[13px]"
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

/* Where the reader is, and in what. The progress bar is the only chrome the
   brief asks to be "very visible" — it is what says this is a sequence with
   an end rather than an open-ended camera roll. */
function TaskHeader({ s }: { s: CaptureSubject }) {
  const pct = (s.done / s.total) * 100;
  return (
    <div className="shrink-0 px-[20px] pb-[11px]">
      <div className="flex items-center gap-[10px]">
        <Icon name="back" className="h-[19px] w-[19px] shrink-0 text-ink-secondary" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[16px] font-bold leading-tight tracking-[-0.015em]">
            {s.asset}
          </span>
          <span className="block truncate text-[11.5px] leading-tight text-ink-secondary">
            {s.job}
          </span>
        </span>
      </div>

      <div className="mt-[9px] flex items-center gap-[9px]">
        <span className="h-[4px] flex-1 overflow-hidden rounded-full bg-surface-sunken">
          <span
            className="block h-full rounded-full bg-accent"
            style={{ width: `${pct}%` }}
          />
        </span>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-ink-secondary">
          {s.done} of {s.total}
        </span>
      </div>
    </div>
  );
}

/* What the person does. Prose, not parameters — and short enough to be read
   standing on a pavement holding a phone. */
function Instruction({ s }: { s: CaptureSubject }) {
  return (
    <div className="shrink-0 px-[20px] pb-[8px]">
      <h1 className="text-[19px] font-bold leading-tight tracking-[-0.02em]">
        {s.subject}
      </h1>
      <p className="mt-[3px] text-[12.5px] leading-[1.35] text-ink-secondary">
        {s.instruction}
      </p>
    </div>
  );
}

/* The live camera. A still photograph asked to read as a viewfinder, which it
   only does if it moves — see the cam-drift / cam-shake note in theme.css.
   Two nested elements because the two motions must not share a transform. */
function Viewfinder({ s }: { s: CaptureSubject }) {
  return (
    <div className="relative mx-[20px] shrink-0 overflow-hidden rounded-[18px] bg-ink">
      <div className="relative aspect-[358/340] w-full overflow-hidden">
        <div className="cam-drift absolute inset-0">
          <div className="cam-shake absolute inset-0">
            <img
              key={s.image}
              src={s.image}
              srcSet={s.imageSrcSet}
              sizes={s.imageSizes}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Framing guide. Corners only — a full rule of thirds grid over a
            façade reads as a photography app, and this is not one. */}
        <div className="pointer-events-none absolute inset-[16px]">
          {[
            "left-0 top-0 border-l-2 border-t-2 rounded-tl-[6px]",
            "right-0 top-0 border-r-2 border-t-2 rounded-tr-[6px]",
            "left-0 bottom-0 border-b-2 border-l-2 rounded-bl-[6px]",
            "right-0 bottom-0 border-b-2 border-r-2 rounded-br-[6px]",
          ].map((pos) => (
            <span
              key={pos}
              className={cn("absolute h-[22px] w-[22px] border-ink-inverse/70", pos)}
            />
          ))}
        </div>

        {/* Subject label, top left. The one overlay that says what Delphi
            believes it is looking at. */}
        <span className="absolute left-[14px] top-[13px] rounded-full bg-ink/55 px-[10px] py-[4px] text-[10.5px] font-semibold uppercase tracking-[0.07em] text-ink-inverse backdrop-blur-sm">
          {s.subject}
        </span>

        {/* The quality hint — one line, present tense, and green because it
            is passing. The brief warns against being ambitious here; this is
            the whole of it. */}
        <span className="absolute bottom-[13px] left-[14px] flex items-center gap-[5px] rounded-full bg-ink/55 px-[10px] py-[4px] text-[10.5px] font-medium text-ink-inverse backdrop-blur-sm">
          <Icon name="check" className="h-[11px] w-[11px] text-verified" />
          Subject in frame
        </span>
      </div>

      {/* Delphi's own checks, on the black below the picture. Deliberately
          off the image: they are not about what is in frame. */}
      <div className="flex items-center justify-between px-[16px] py-[9px]">
        {CHECKS.map((c) => (
          <span
            key={c.label}
            className="flex items-center gap-[4px] text-[10px] font-medium text-ink-inverse/85"
          >
            <Icon name="check" className="h-[10px] w-[10px] text-verified" />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* The shutter sits IN the plan block rather than floating over the camera, so
   the eye goes picture -> button -> what is left. */
function CapturePlan({ s }: { s: CaptureSubject }) {
  return (
    <div className="mt-[9px] flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-center pb-[9px]">
        <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full border-[3px] border-line-strong">
          <span className="h-[46px] w-[46px] rounded-full bg-accent" />
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden rounded-t-[18px] bg-surface-sunken px-[20px] pt-[13px]">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
            Capture plan
          </h2>
          <span className="text-[11px] text-ink-muted">
            {s.total - s.done} remaining
          </span>
        </div>

        <ul className="mt-[9px] flex flex-col gap-[7px]">
          {/* State is derived from position rather than stored beside each
              label: anything before `done` is finished, the item AT it is in
              the viewfinder, the rest are waiting. One number moves the whole
              list, which is what lets the trust engine step it. */}
          {s.plan.map((label, i) => {
            const state =
              i < s.done ? "done" : i === s.done ? "current" : "todo";
            return (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-[9px] text-[12.5px]",
                  state === "current" && "font-semibold text-ink",
                  state === "done" && "text-ink-muted",
                  state === "todo" && "text-ink-secondary",
                )}
              >
                {state === "done" && (
                  <Icon name="check" className="h-[13px] w-[13px] shrink-0 text-verified" />
                )}
                {state === "current" && (
                  <span className="flex h-[13px] w-[13px] shrink-0 items-center justify-center">
                    <span className="h-[9px] w-[9px] rounded-full border-[3px] border-accent" />
                  </span>
                )}
                {state === "todo" && (
                  <span className="h-[13px] w-[13px] shrink-0 rounded-full border border-line-strong" />
                )}
                <span className="truncate">{label}</span>
                {state === "current" && (
                  <span className="ml-auto shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-accent">
                    Now
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const PATHS = {
  back: "M15 5 8 12l7 7",
  check: "m4 12.5 5 5 11-11",
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
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
