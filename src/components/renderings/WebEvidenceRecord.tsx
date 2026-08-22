import { cn } from "@/lib/cn";
import { brand } from "@/content/site";
import {
  RECORD,
  CAPTURES,
  OPEN_CAPTURE,
  OPEN_DETAIL,
  VERIFICATION,
  SIGNALS,
  TIMELINE,
} from "@/content/evidence-record";
import { CaptureMap } from "@/components/renderings/CaptureMap";

/* ============================================================================
   RENDERING — EVIDENCE RECORD (web)
   ============================================================================
   What somebody opens after a capture job completes. It has to answer four
   questions before the reader has decided to read anything:

     what was captured, when and where, what Delphi checked,
     and can they check it themselves without asking Delphi

   So it is laid out as an evidence file, not a photo gallery. The captures are
   indexed and stay indexed, because the sealed record commits to media, time,
   latitude and longitude AT each index — the ordering is part of what is
   attested, not a display choice.

   ⚠️  ONLY CLAIM WHAT THE CERTIFICATE ACTUALLY PROVES. Today's record carries
   media, capture time, location and cryptographic integrity. It does not prove
   the truth of what is depicted, and it does not adjudicate anything. Every
   tick below names a recorded fact — "captured through Delphi", "location
   recorded" — never a conclusion. If a signal is added to the product later,
   it can be added here; inventing one here first is how a marketing page ends
   up describing software that does not exist.

   Authored at 1440x900 and scaled by WebFrame — see WEB_CANVAS in
   pages/PlatformRenderings.tsx.

   ⚠️  NOT A SCREENSHOT.
   ========================================================================= */

export function WebEvidenceRecord() {
  return (
    <div
      data-theme="light"
      className="flex h-full w-full overflow-hidden bg-surface-sunken text-ink"
    >
      <Sidebar />
      <div
        className="flex min-w-0 flex-1 flex-col overflow-y-auto"
      >
        <RecordHeader />
        <SummaryTiles />
        <Evidence />
        <CaptureLocation />
        <CaptureSequence />
        <WhyAccepted />
        <SealedRecord />
      </div>
    </div>
  );
}

/* Dark, because the real web app's is — see the job-management screen in the
   asset library. data-theme="dark" on the subtree rather than a palette of
   its own: the same mechanism the site's inverse sections use, so the app
   chrome and the marketing page cannot drift apart. */
function Sidebar() {
  const nav = ["Dashboard", "Jobs", "Certificates", "Evidence", "Settings"];
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
              item === "Evidence"
                ? "bg-surface-raised font-semibold text-ink"
                : "text-ink-secondary",
            )}
          >
            {item}
          </span>
        ))}
      </nav>
    </div>
  );
}

function RecordHeader() {
  return (
    <div className="shrink-0 border-b border-line bg-surface px-8 pb-4 pt-5">
      <div className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-verified">
            <Icon name="check" className="h-[13px] w-[13px]" />
            Verified evidence record
          </span>
          <h1 className="mt-2 text-[27px] font-bold leading-tight tracking-[-0.02em]">
            {RECORD.address}
          </h1>
          <p className="mt-1 text-[14px] text-ink-secondary">
            {RECORD.job}
          </p>
          <p className="mt-3 flex items-center gap-2.5 text-[12.5px] text-ink-secondary">
            {/* The certificate code, in the same monospace the public
                certificate uses. It is the persistent identifier for this
                evidence and a reader should learn to recognise it. */}
            <span className="rounded-[5px] bg-surface-accent px-2 py-[3px] font-mono text-[12.5px] font-semibold tracking-[0.04em] text-ink-accent">
              {RECORD.code}
            </span>
            <Dot />
            {RECORD.captureCount} captures
            <Dot />
            Completed {RECORD.completed}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Action label="View public certificate" />
          <Action label="Share" />
          <Action label="Export" />
          <span className="flex h-[32px] w-[32px] items-center justify-center rounded-md border border-line text-[15px] text-ink-secondary">
            ⋯
          </span>
        </div>
      </div>
    </div>
  );
}

function Action({ label }: { label: string }) {
  return (
    <span className="rounded-md border border-line px-3 py-[7px] text-[12.5px] font-medium text-ink">
      {label}
    </span>
  );
}

const Dot = () => <span className="text-ink-muted">·</span>;

/* The human-readable summary of what was sealed. Four, because the four
   questions the page has to answer are what was captured, when, where and
   whether it can be checked. */
const TILES = [
  { big: String(RECORD.captureCount), label: "Captures", note: "Original media captured in Delphi" },
  { big: RECORD.window, label: "Capture window", note: RECORD.date },
  { big: RECORD.latitude, label: "Location", note: RECORD.locationLong },
  { big: "Sealed", label: "Integrity record", note: `Attestation recorded on ${RECORD.network}`, tick: true },
];

function SummaryTiles() {
  return (
    <div className="grid shrink-0 grid-cols-4 gap-px border-b border-line bg-line">
      {TILES.map((t) => (
        <div key={t.label} className="bg-surface px-8 py-3">
          <p
            className={cn(
              "flex items-center gap-1.5 text-[20px] font-bold tracking-[-0.02em]",
              t.tick && "text-verified",
            )}
          >
            {t.tick && <Icon name="check" className="h-[16px] w-[16px]" />}
            {t.big}
          </p>
          <p className="mt-1 text-[12px] font-semibold text-ink">{t.label}</p>
          <p className="mt-0.5 text-[11.5px] text-ink-muted">{t.note}</p>
        </div>
      ))}
    </div>
  );
}

function Evidence() {
  return (
    /* A fixed height rather than flex-1. Once the column scrolls there is no
       spare height to claim, and a flex-1 here would collapse to its content
       and take the viewer with it. */
    <div className="flex h-[452px] shrink-0 flex-col">
      <div className="flex min-h-0 flex-1">
        {/* The capture itself, on the sunken tone so the photograph is the
            brightest thing in the region rather than competing with a white
            panel around it. */}
        <div className="flex min-w-0 flex-1 items-center justify-center bg-ink/[0.04] p-5">
          <img
            src={`/assets/captures/${OPEN_CAPTURE.name}-878.webp`}
            srcSet={`/assets/captures/${OPEN_CAPTURE.name}-240.webp 240w, /assets/captures/${OPEN_CAPTURE.name}-878.webp 878w`}
            sizes="700px"
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full rounded-md object-contain shadow-raised"
          />
        </div>

        <div className="flex w-[326px] shrink-0 flex-col border-l border-line bg-surface px-6 py-4">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
            Capture #{String(OPEN_CAPTURE.n).padStart(2, "0")}
          </p>
          <p className="mt-1.5 text-[16px] font-bold tracking-[-0.01em]">
            {OPEN_CAPTURE.label}
          </p>

          <dl className="mt-3.5 flex flex-col gap-2.5">
            <Field label="Captured" value={`${RECORD.date} · ${OPEN_CAPTURE.time} BST`} />
            <Field
              label="Location"
              value={`${OPEN_DETAIL.coordinates}  ${OPEN_DETAIL.accuracy}`}
              mono
            />
            <Field label="Source" value={OPEN_DETAIL.source} />
            <Field label="Original media" value={OPEN_DETAIL.media} />
          </dl>

          <div className="mt-4 border-t border-line pt-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
              Verification
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {VERIFICATION.map((v) => (
                <li
                  key={v}
                  className="flex items-center gap-2 text-[12.5px] text-ink-secondary"
                >
                  <Icon name="check" className="h-[13px] w-[13px] shrink-0 text-verified" />
                  {v}
                </li>
              ))}
            </ul>
          </div>

          {/* The fingerprint is of the ORIGINAL BYTES, not of a preview or a
              filename — which is the whole reason a third party can recompute
              it. Truncated here; the full value belongs in the technical
              disclosure, not on the summary. */}
          <div className="mt-auto border-t border-line pt-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
              Media fingerprint
            </p>
            <p className="mt-1.5 font-mono text-[11.5px] text-ink-secondary">
              {OPEN_DETAIL.fingerprint}
            </p>
          </div>
        </div>
      </div>

      <Filmstrip />
    </div>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </dt>
      <dd className={cn("mt-0.5 text-[12.5px] text-ink", mono && "font-mono")}>
        {value}
      </dd>
    </div>
  );
}

/* Indexed, because the record is. The number is not a caption — it is the
   position the sealed attestation commits to. */
function Filmstrip() {
  return (
    <div className="flex shrink-0 items-center gap-2.5 border-t border-line bg-surface px-5 py-2.5">
      {CAPTURES.map((c) => (
        <div key={c.n} className="w-[104px] shrink-0">
          <div
            className={cn(
              "relative aspect-[16/9] overflow-hidden rounded-[5px]",
              c.n === OPEN_CAPTURE.n
                ? "ring-2 ring-accent ring-offset-2 ring-offset-surface"
                : "opacity-70",
            )}
          >
            <img
              src={`/assets/captures/${c.name}-240.webp`}
              alt=""
              aria-hidden
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-1.5 truncate font-mono text-[10px] text-ink-muted">
            #{String(c.n).padStart(2, "0")} {c.time}
          </p>
        </div>
      ))}
      <div className="flex h-[58px] w-[70px] shrink-0 items-center justify-center rounded-[5px] border border-dashed border-line-strong text-[12px] font-semibold text-ink-muted">
        +{RECORD.captureCount - CAPTURES.length}
      </div>
    </div>
  );
}

/* Where it was captured. The map earns its place by answering a question
   the coordinates cannot: a reader who does not know what 51.492134 means
   still knows whether a pin is on the right street.

   ⚠️  Each capture carries its OWN latitude and longitude into the sealed
   record — the certificate does not hold one location for the whole job. The
   line under the map says so, because it is the strongest thing about the
   design and the easiest to miss. */
function CaptureLocation() {
  return (
    <div className="shrink-0 border-t border-line bg-surface px-8 py-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
        Where the evidence was captured
      </h2>

      <div className="mt-3.5 flex gap-7">
        {/* Small on purpose. It is corroboration, not the subject — the
            captures above are the subject, and a half-page map pulls the eye
            straight past them. Wide rather than tall, because a street is. */}
        <div className="h-[132px] w-[360px] shrink-0 overflow-hidden rounded-md border border-line">
          <CaptureMap />
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3.5">
          <div>
            <p className="text-[24px] font-bold leading-none tracking-[-0.02em] text-verified">
              {RECORD.captureCount} / {RECORD.captureCount}
            </p>
            <p className="mt-1.5 text-[12.5px] font-semibold">
              captures consistent with the expected location
            </p>
            <p className="mt-1.5 text-[11.5px] leading-snug text-ink-secondary">
              Location was recorded independently for each capture and sealed
              into the record at its own index — not once for the job.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-x-8 border-t border-line pt-3">
            <Field label="Coordinates" value={OPEN_DETAIL.coordinates} mono />
            <Field label="Address" value={RECORD.locationLong} />
          </dl>
        </div>
      </div>
    </div>
  );
}

/* The order the property was walked. Twenty isolated photographs prove far
   less than a sequence does — a route with times on it is the beginning of a
   capture session rather than a pile of files. */
function CaptureSequence() {
  return (
    <div className="shrink-0 border-t border-line bg-surface px-8 py-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
        Capture sequence
      </h2>
      <ol className="mt-4 flex items-start">
        {TIMELINE.map((t, i) => (
          <li key={t.label} className="flex flex-1 items-start gap-3">
            <span className="flex flex-col items-center pt-0.5">
              <span className="h-[9px] w-[9px] rounded-full bg-accent" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[11.5px] text-ink-muted">
                {t.time}
              </span>
              <span className="mt-0.5 block truncate text-[12.5px] font-medium">
                {t.label}
              </span>
            </span>
            {i < TIMELINE.length - 1 && (
              <span className="mt-[4.5px] h-px flex-1 bg-line" />
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* The six signals, as rows rather than cards — they are a checklist, and six
   cards would give them the weight of six arguments.

   ⚠️  `available: false` renders as "not yet" and MUST keep doing so. A tick
   beside a check the product does not perform is the one lie this page cannot
   survive; see the warning at the top of content/evidence-record.ts. */
function WhyAccepted() {
  return (
    <div className="shrink-0 border-t border-line bg-surface px-8 py-6">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-muted">
        Why Delphi accepted this record
      </h2>
      <ul className="mt-3.5 grid grid-cols-2 gap-x-10 gap-y-2.5">
        {SIGNALS.map((sig) => (
          <li
            key={sig.label}
            className="flex items-center gap-3 border-b border-line pb-2.5"
          >
            {sig.available ? (
              <Icon
                name="check"
                className="h-[14px] w-[14px] shrink-0 text-verified"
              />
            ) : (
              <span className="h-[9px] w-[9px] shrink-0 rounded-full border border-line-strong" />
            )}
            <span className="w-[104px] shrink-0 text-[12px] font-semibold">
              {sig.label}
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[11.5px]",
                sig.available ? "text-ink-secondary" : "text-ink-muted",
              )}
            >
              {sig.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* The claim that makes the rest checkable. Deliberately plain: network,
   schema, count, state — the things a third party needs in order to go and
   recompute the commitments without asking us. */
function SealedRecord() {
  return (
    <div className="flex shrink-0 items-center justify-between border-t border-line bg-surface px-8 py-3">
      <div className="flex items-center gap-7">
        <span className="flex items-center gap-2">
          <Icon name="check" className="h-[15px] w-[15px] text-verified" />
          <span className="text-[13px] font-bold tracking-[-0.01em]">
            Sealed evidence record
          </span>
        </span>
        <span className="flex items-center gap-2.5 font-mono text-[11.5px] text-ink-secondary">
          {RECORD.attestation} <Dot /> {RECORD.network} <Dot /> {RECORD.schema}{" "}
          <Dot /> {RECORD.captureCount} media committed <Dot /> {RECORD.state}
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-accent">
        Independently verify hashes
        <Icon name="arrow" className="h-[13px] w-[13px]" />
      </span>
    </div>
  );
}

const PATHS = {
  check: "m4 12.5 5 5 11-11",
  arrow: "M4 12h15m-6-7 7 7-7 7",
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
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
