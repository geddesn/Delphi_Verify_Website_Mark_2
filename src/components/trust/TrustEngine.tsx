import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { acts, trustEngineCopy } from "@/content/trust-scenes";
import type { TrustParty, TrustScene, StagePoint } from "@/content/trust-scenes";

/* ============================================================================
   TRUST ENGINE — two acts
   ============================================================================
   Asset in the middle. Counterparties arrive around it on spokes. The same
   charter runs twice: once without a record, once with one.

   ── THE RULE THAT MAKES IT WORK ───────────────────────────────────────────
   The incident is rendered from ONE definition and appears at the identical
   anchor in both acts. Nothing about the accident changes between them. If it
   did, the story would read as "Delphi prevents damage" — a claim we cannot
   make. The sameness is the argument, so it is enforced structurally here
   rather than left to whoever edits the content.

   ── STEP MACHINE ──────────────────────────────────────────────────────────
   One flat list. Every visual is a pure function of the step index, so there
   are no overlapping timers and scrubbing anywhere is trivial. REST is both
   the last step and the initial state, which is what makes the prerendered
   HTML meaningful.

   ── VISUAL LANGUAGE ───────────────────────────────────────────────────────
   Leaders, halos and dots reuse the callout treatment from Callout.tsx —
   already proven legible over arbitrary photography, and it buys continuity
   with the industry page for free.
   ========================================================================= */

const STEPS = [
  /* ── ACT ONE — without a record ── */
  { id: "a1-asset", ms: 1600 }, //  0
  { id: "a1-owner", ms: 1400 }, //  1
  { id: "a1-charterer", ms: 1400 }, //  2
  { id: "a1-captain", ms: 1400 }, //  3
  { id: "a1-delivery", ms: 1200 }, //  4  handover, unrecorded
  { id: "a1-charter", ms: 1400 }, //  5
  { id: "a1-incident", ms: 1800 }, //  6
  { id: "a1-redelivery", ms: 1300 }, //  7
  { id: "a1-dispute", ms: 2800 }, //  8
  { id: "a1-unresolved", ms: 2800 }, //  9  freeze, grey
  /* ── THE TURN ── */
  { id: "turn", ms: 1400 }, // 10
  /* ── ACT TWO — with a record ── */
  { id: "a2-asset", ms: 1100 }, // 11
  { id: "a2-owner", ms: 1000 }, // 12
  { id: "a2-capture", ms: 2400 }, // 13 ⭐ the one difference
  { id: "a2-charterer", ms: 1200 }, // 14 arrives AFTER the record
  { id: "a2-captain", ms: 1200 }, // 15
  { id: "a2-charter", ms: 1200 }, // 16
  { id: "a2-incident", ms: 1800 }, // 17 identical to step 6
  { id: "a2-recapture", ms: 2000 }, // 18
  { id: "a2-compare", ms: 2600 }, // 19
  { id: "a2-resolved", ms: 0 }, // 20 REST
] as const;

const REST = STEPS.length - 1;
const TURN = 10;

/* ── Derived state — every visual is one of these ──────────────────────── */
const s = {
  act: (n: number) => (n < TURN ? 1 : n === TURN ? 0 : 2),
  owner: (n: number) => (n >= 1 && n < TURN) || n >= 12,
  charterer: (n: number) => (n >= 2 && n < TURN) || n >= 14,
  captain: (n: number) => (n >= 3 && n < TURN) || n >= 15,
  delphi: (n: number) => n >= 13,
  incident: (n: number) => (n >= 6 && n < TURN) || n >= 17,
  dispute: (n: number) => n >= 8 && n <= 9,
  frozen: (n: number) => n === 9,
  deliveryCert: (n: number) => n >= 13,
  redeliveryCert: (n: number) => n >= 18,
  compare: (n: number) => n >= 19,
  resolved: (n: number) => n >= REST,
};

export function TrustEngine({
  scene,
  className,
}: {
  scene: TrustScene;
  className?: string;
}) {
  /* REST on server and first client render, so hydration matches and the
     prerendered markup is the resolved comparison rather than an empty stage. */
  const [step, setStep] = useState<number>(REST);
  const [reduced, setReduced] = useState(false);
  const [played, setPlayed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  /* Plays from any step, not just the start — so a chapter button resumes the
     story from there rather than freezing on its first frame, which is what an
     earlier version did and made the chapters useless. */
  const playFrom = useCallback(
    (from: number) => {
      stop();
      setStep(from);
      const advance = (i: number) => {
        if (i >= REST) return;
        timer.current = window.setTimeout(() => {
          setStep(i + 1);
          advance(i + 1);
        }, STEPS[i].ms);
      };
      advance(from);
    },
    [stop],
  );

  const play = useCallback(() => playFrom(0), [playFrom]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const sync = () => setReduced(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced || played) return;
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (es.some((e) => e.isIntersecting)) {
          setPlayed(true);
          play();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, played, play]);

  useEffect(() => stop, [stop]);

  const act = s.act(step);
  const { owner, counterparty, operator } = scene.parties;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ChapterBar step={step} onJump={playFrom} reduced={reduced} />

      <div
        ref={stageRef}
        className="relative isolate aspect-[16/10] w-full overflow-hidden rounded-lg border border-line-strong transition-[filter] md:aspect-[16/9]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 115%, var(--fx-accent-halo), transparent 62%)",
          /* Act One ends drained of colour. The freeze is the point. */
          filter: s.frozen(step) ? "grayscale(0.85)" : "none",
          transitionDuration: "var(--duration-slow)",
        }}
      >
        <StageGrid />

        {/* ── The asset, centre ── */}
        <div
          className="absolute left-1/2 top-1/2 w-[46%] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-md border border-line-strong transition-opacity"
          style={{
            opacity: step === TURN ? 0.35 : 1,
            transitionDuration: "var(--duration-slow)",
          }}
        >
          <img
            src={`/assets/features/${scene.asset}-960.webp`}
            srcSet={`/assets/features/${scene.asset}-480.webp 480w, /assets/features/${scene.asset}-960.webp 960w`}
            sizes="(min-width: 1024px) 520px, 60vw"
            alt={scene.assetAlt}
            width={2720}
            height={1530}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </div>

        {/* ── Leaders ── */}
        <Leaders
          links={[
            { from: owner.panel, to: owner.anchor, on: s.owner(step), align: owner.align },
            { from: counterparty.panel, to: counterparty.anchor, on: s.charterer(step), align: counterparty.align },
            { from: operator.panel, to: operator.anchor, on: s.captain(step), align: operator.align },
            { from: scene.delphi.panel, to: scene.delphi.anchor, on: s.delphi(step), align: "bottom-left", accent: true },
          ]}
          disputing={s.dispute(step)}
          resolved={s.compare(step)}
        />

        {/* ── Counterparties ── */}
        <PartyPanel party={owner} on={s.owner(step)} />
        <PartyPanel party={counterparty} on={s.charterer(step)} />
        <PartyPanel party={operator} on={s.captain(step)} />

        {/* ── The incident — one definition, both acts ── */}
        <IncidentMark
          at={scene.incident.anchor}
          label={scene.incident.label}
          on={s.incident(step)}
          resolved={s.compare(step)}
        />

        {/* ── Delphi, from below (Act Two only) ── */}
        <DelphiPanel
          at={scene.delphi.panel}
          label={scene.delphi.label}
          on={s.delphi(step)}
          delivery={s.deliveryCert(step) ? scene.captures.delivery : undefined}
          redelivery={s.redeliveryCert(step) ? scene.captures.redelivery : undefined}
        />

        {/* ── Act One: the dispute ── */}
        <Overlay on={s.dispute(step)}>
          <div className="flex flex-col items-center gap-4 text-center">
            {scene.claims.map((c) => (
              <p
                key={c.text}
                className="text-heading text-ink"
                style={{ filter: "drop-shadow(0 0 20px var(--fx-failed-glow))" }}
              >
                “{c.text}”
              </p>
            ))}
          </div>
        </Overlay>

        {/* ── Act One: unresolved ── */}
        <Overlay on={s.frozen(step)}>
          <div className="text-center">
            <p className="text-display text-ink">{scene.unresolved.headline}</p>
            <p className="mt-3 font-mono text-mono-sm uppercase text-failed">
              {scene.unresolved.cost}
            </p>
          </div>
        </Overlay>

        {/* ── The turn ── */}
        <Overlay on={step === TURN}>
          <p className="text-display text-ink">{acts.turn.line}</p>
        </Overlay>

        {/* ── Act Two: resolved ── */}
        <Overlay on={s.resolved(step)}>
          <p
            className="max-w-2xl text-center text-display text-ink"
            style={{ filter: "drop-shadow(0 0 26px var(--fx-verified-glow))" }}
          >
            {scene.resolved.headline}
          </p>
        </Overlay>

        {/* Act marker, always present, bottom-left */}
        <p className="absolute bottom-3 left-4 font-mono text-mono-sm uppercase text-ink-muted">
          {act === 1 ? acts.one.marker : act === 2 ? acts.two.marker : acts.turn.marker}
          {act !== 0 && (
            <span className="ml-2 text-ink-secondary">
              {act === 1 ? acts.one.title : acts.two.title}
            </span>
          )}
        </p>
      </div>

      {/* ── Outcomes ── */}
      <ul className="grid gap-3 sm:grid-cols-3">
        {scene.resolved.outcomes.map((o, i) => (
          <li
            key={o}
            className={cn(
              "rounded-md border border-line bg-surface p-4 text-body-sm text-ink-secondary transition-all",
              s.resolved(step) ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
            style={{
              transitionDuration: "var(--duration-normal)",
              transitionDelay: s.resolved(step) ? `${i * 110}ms` : "0ms",
            }}
          >
            <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-verified align-middle" />
            {o}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-4">
        {reduced ? (
          <p className="text-body-sm text-ink-muted">{trustEngineCopy.staticNote}</p>
        ) : (
          <button
            type="button"
            onClick={play}
            className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line-strong px-3 py-2 text-body-sm text-ink-secondary transition-colors hover:border-ink-muted hover:text-ink"
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            <ReplayIcon />
            {trustEngineCopy.replay}
          </button>
        )}
        <p className="font-mono text-mono-sm uppercase text-ink-muted">{scene.sector}</p>
      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function ChapterBar({
  step,
  onJump,
  reduced,
}: {
  step: number;
  onJump: (n: number) => void;
  reduced: boolean;
}) {
  /* Thirty-three seconds is a long time to ask for. Chapters let a viewer go
     straight to the comparison, which is the part that actually argues. */
  const chapters = [
    { label: acts.one.marker, at: 0 },
    { label: acts.turn.marker, at: TURN },
    { label: acts.two.marker, at: 11 },
  ];
  if (reduced) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chapters.map((c, i) => {
        const next = chapters[i + 1]?.at ?? REST + 1;
        const active = step >= c.at && step < next;
        return (
          <button
            key={c.label}
            type="button"
            onClick={() => onJump(c.at)}
            aria-current={active ? "step" : undefined}
            className={cn(
              "cursor-pointer rounded-sm border px-2.5 py-1 font-mono text-mono-sm uppercase transition-colors",
              active
                ? "border-accent text-ink"
                : "border-line text-ink-muted hover:text-ink-secondary",
            )}
            style={{ transitionDuration: "var(--duration-fast)" }}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}

function StageGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.3]"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--fx-node-edge) 1px, transparent 1px)," +
          "linear-gradient(to bottom, var(--fx-node-edge) 1px, transparent 1px)",
        backgroundSize: "52px 52px",
        maskImage: "var(--mask-stage-fade)",
        WebkitMaskImage: "var(--mask-stage-fade)",
      }}
    />
  );
}

/** Panel footprint as a share of the stage, used to work out where a leader
 *  should leave from. Approximate on purpose — a few tenths is invisible. */
const PW = 20;
const PH = 15;

function departure(panel: StagePoint, align: string): StagePoint {
  const left = align.endsWith("left") ? panel.x : panel.x - PW;
  const top = align.startsWith("top") ? panel.y : panel.y - PH;
  return { x: left + PW / 2, y: top + PH / 2 };
}

function Leaders({
  links,
  disputing,
  resolved,
}: {
  links: {
    from: StagePoint;
    to: StagePoint;
    on: boolean;
    align: string;
    accent?: boolean;
  }[];
  disputing: boolean;
  resolved: boolean;
}) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {links.map((l, i) => {
        const d = departure(l.from, l.align);
        const stroke = l.accent
          ? "var(--fx-accent-glow)"
          : disputing && !l.accent
            ? "var(--fx-failed-glow)"
            : resolved
              ? "var(--fx-verified-glow)"
              : "var(--callout-line)";
        return (
          <g key={i}>
            {/* Dark halo first — a white hairline vanishes over pale sky. */}
            <line
              x1={d.x} y1={d.y} x2={l.to.x} y2={l.to.y}
              stroke="var(--callout-halo)" strokeWidth="3.5" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1}
              style={{
                strokeDashoffset: l.on ? 0 : 1,
                transition: "stroke-dashoffset var(--duration-slow) var(--ease-out-quart)",
              }}
            />
            <line
              x1={d.x} y1={d.y} x2={l.to.x} y2={l.to.y}
              stroke={stroke} strokeWidth="1.25" strokeLinecap="round"
              vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={1}
              style={{
                strokeDashoffset: l.on ? 0 : 1,
                transition:
                  "stroke-dashoffset var(--duration-slow) var(--ease-out-quart), stroke var(--duration-normal)",
              }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function PartyPanel({ party, on }: { party: TrustParty; on: boolean }) {
  return (
    <div
      className={cn(
        "absolute z-20 w-[20%] min-w-[170px] rounded-md border p-3 transition-all",
        party.align.endsWith("right") && "-translate-x-full",
        party.align.startsWith("bottom") && "-translate-y-full",
        on ? "opacity-100" : "opacity-0",
      )}
      style={{
        left: `${party.panel.x}%`,
        top: `${party.panel.y}%`,
        backgroundColor: "var(--callout-surface)",
        borderColor: "var(--callout-border)",
        transform: on ? undefined : "scale(0.96)",
        transitionDuration: "var(--duration-slow)",
        transitionTimingFunction: "var(--ease-out-quart)",
      }}
    >
      <p className="font-mono text-mono-sm uppercase text-callout-ink-muted">
        {party.label}
      </p>
      <p className="mt-0.5 text-body-sm font-semibold text-callout-ink">
        {party.role}
      </p>
      <p className="mt-1 text-caption text-callout-ink-muted">{party.holds}</p>
    </div>
  );
}

function IncidentMark({
  at,
  label,
  on,
  resolved,
}: {
  at: StagePoint;
  label: string;
  on: boolean;
  resolved: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all",
        on ? "opacity-100" : "opacity-0",
      )}
      style={{
        left: `${at.x}%`,
        top: `${at.y}%`,
        transform: on ? undefined : "translate(-50%,-50%) scale(0.6)",
        transitionDuration: "var(--duration-slow)",
        transitionTimingFunction: "var(--ease-out-quart)",
      }}
    >
      <span
        className={cn(
          "block h-3 w-3 rounded-full ring-4 ring-callout-halo",
          resolved ? "bg-verified" : "bg-failed",
        )}
        style={{
          filter: `drop-shadow(0 0 14px ${resolved ? "var(--fx-verified-glow)" : "var(--fx-failed-glow)"})`,
        }}
      />
      <span
        className="absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm px-2 py-1 font-mono text-mono-sm text-callout-ink"
        style={{ backgroundColor: "var(--callout-surface)" }}
      >
        {label}
      </span>
    </div>
  );
}

function DelphiPanel({
  at,
  label,
  on,
  delivery,
  redelivery,
}: {
  at: StagePoint;
  label: string;
  on: boolean;
  delivery?: { label: string; stamp: string; state: string };
  redelivery?: { label: string; stamp: string; state: string };
}) {
  return (
    <div
      className={cn(
        "absolute bottom-0 left-1/2 z-30 w-[min(88%,40rem)] -translate-x-1/2 rounded-t-md border border-b-0 p-4 transition-all",
        on ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0",
      )}
      style={{
        backgroundColor: "var(--callout-surface)",
        borderColor: "var(--callout-border)",
        boxShadow: on ? "0 -10px 60px var(--fx-accent-halo)" : "none",
        transitionDuration: "var(--duration-slow)",
        transitionTimingFunction: "var(--ease-out-quart)",
        marginBottom: `${100 - at.y}%`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          role="img"
          aria-label="Delphi Verify"
          className="block h-4 w-[57px] shrink-0"
          style={{
            backgroundColor: "var(--callout-ink)",
            maskImage: "url(/assets/logo.svg)",
            WebkitMaskImage: "url(/assets/logo.svg)",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskSize: "contain",
            WebkitMaskSize: "contain",
          }}
        />
        <p className="text-body-sm text-callout-ink">{label}</p>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Certificate cert={delivery} tone="verified" />
        <Certificate cert={redelivery} tone="failed" />
      </div>
    </div>
  );
}

function Certificate({
  cert,
  tone,
}: {
  cert?: { label: string; stamp: string; state: string };
  tone: "verified" | "failed";
}) {
  return (
    <div
      className="rounded-sm border p-2.5 transition-opacity"
      style={{
        borderColor: cert ? "var(--fx-accent-glow)" : "var(--callout-border)",
        opacity: cert ? 1 : 0.25,
        transitionDuration: "var(--duration-normal)",
      }}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "verified" ? "bg-verified" : "bg-failed",
          )}
          aria-hidden
        />
        <span className="font-mono text-mono-sm text-callout-ink">
          {cert?.label ?? "—"}
        </span>
      </div>
      <p className="mt-1 font-mono text-mono-sm text-callout-ink-muted">
        {cert?.stamp ?? " "}
      </p>
      <p className="font-mono text-mono-sm text-callout-ink-muted">
        {cert?.state ?? " "}
      </p>
    </div>
  );
}

function Overlay({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-[42%] z-40 flex -translate-y-1/2 justify-center px-6 transition-opacity",
        on ? "opacity-100" : "opacity-0",
      )}
      style={{ transitionDuration: "var(--duration-normal)" }}
      aria-hidden
    >
      {children}
    </div>
  );
}

function ReplayIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.7-3.97M13.5 2v3h-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
