import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { trustStages, trustEngineCopy } from "@/content/trust-scenes";
import type { TrustScene } from "@/content/trust-scenes";

/* ============================================================================
   TRUST ENGINE
   ============================================================================
   The animated centrepiece: two counterparties, an exchange, a dispute, and
   Delphi arriving from underneath to change the relationship.

   ── WHY IT IS BUILT THIS WAY ──────────────────────────────────────────────

   DOM and SVG with real text, not canvas. The labels stay indexable,
   translatable for the other locales, readable by a screen reader and able to
   reflow on a phone. A canvas or a Lottie export would look identical on a
   laptop and lose all four.

   Effects are CSS. Glow is layered drop-shadow, depth is `perspective` plus
   translateZ, beams are stroke-dashoffset. All compositor-level. Animated SVG
   filters were deliberately avoided: feGaussianBlur re-rasterises every frame
   and is the reliable way to make this stutter on a mid-range Android.

   ── THE STEP MACHINE ──────────────────────────────────────────────────────

   One flat list of steps rather than nested beats, because every visual is
   then a pure function of the step index — no overlapping timers, and
   scrubbing to any point is trivial. REST is the last step AND the initial
   state, which is what makes the prerendered HTML meaningful.

   ── STATES THAT ARE NOT AFTERTHOUGHTS ────────────────────────────────────

   Prerender / no JS : renders REST — the resolved diagram, complete.
   Reduced motion    : stays on REST, never animates, says so.
   Not yet scrolled  : stays on REST until it is actually on screen.
   ========================================================================= */

/* Durations in ms. Index into this list IS the animation state. */
const STEPS = [
  { id: "settle", ms: 1100 }, //  0 both parties present
  { id: "pass-1-out", ms: 850 }, //  1 A → B
  { id: "pass-1-back", ms: 850 }, //  2 B → A
  { id: "pass-2-out", ms: 850 }, //  3 A → B again, unremarkable
  { id: "dispute", ms: 2600 }, //  4 stalls mid-lane and fails
  { id: "arrive", ms: 1900 }, //  5 Delphi rises, beams draw
  { id: "stage-1", ms: 620 }, //  6 Capture
  { id: "stage-2", ms: 620 }, //  7 Corroborate
  { id: "stage-3", ms: 620 }, //  8 Seal
  { id: "stage-4", ms: 620 }, //  9 Verify
  { id: "clear", ms: 1000 }, // 10 token clears and completes
  { id: "rest", ms: 0 }, // 11 outcomes, hold
] as const;

const REST = STEPS.length - 1;

/* Where the travelling token sits, as a percentage of the lane. */
function tokenPercent(step: number): number {
  if (step <= 0) return 0;
  if (step === 1) return 100;
  if (step === 2) return 0;
  if (step >= 3 && step <= 9) return 55; // stalls, and stays stalled
  return 100; // cleared and delivered
}

type TokenState = "neutral" | "failed" | "verified";
function tokenState(step: number): TokenState {
  if (step >= 4 && step <= 9) return "failed";
  if (step >= 10) return "verified";
  return "neutral";
}

export function TrustEngine({
  scene,
  className,
}: {
  scene: TrustScene;
  className?: string;
}) {
  /* REST on both server and first client render, so hydration matches and the
     prerendered markup is the finished diagram rather than an empty stage. */
  const [step, setStep] = useState<number>(REST);
  const [reduced, setReduced] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const play = useCallback(() => {
    stop();
    setStep(0);
    const advance = (i: number) => {
      if (i >= REST) {
        setStep(REST);
        return;
      }
      timer.current = window.setTimeout(() => {
        setStep(i + 1);
        advance(i + 1);
      }, STEPS[i].ms);
    };
    advance(0);
  }, [stop]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const sync = () => setReduced(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Play once, when it is actually on screen. A centrepiece that has already
     finished by the time you scroll to it is not a centrepiece. */
  useEffect(() => {
    if (reduced || hasPlayed) return;
    const el = stageRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasPlayed(true);
          play();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, hasPlayed, play]);

  useEffect(() => stop, [stop]);

  const showDelphi = step >= 5;
  const showBeams = step >= 5;
  const stagesLit = Math.max(0, Math.min(4, step - 5));
  const showDispute = step >= 4 && step <= 9;
  const showOutcomes = step >= REST;
  const tPct = tokenPercent(step);
  const tState = tokenState(step);

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* ── Stage ────────────────────────────────────────────────────────
          `perspective` here is what makes translateZ on the nodes read as
          depth rather than as scale. Cheap, GPU, and works on a phone —
          which real 3D would not. */}
      <div
        ref={stageRef}
        className="relative isolate overflow-hidden rounded-lg border border-line-strong"
        style={{
          perspective: "1400px",
          background:
            "radial-gradient(120% 90% at 50% 110%, var(--fx-accent-halo), transparent 60%)",
        }}
      >
        <StageGrid />

        <div className="relative grid gap-6 p-6 md:p-10 lg:grid-cols-[1fr_auto_1fr] lg:items-start lg:gap-8">
          <PartyCard
            party={scene.a}
            asset={scene.asset}
            assetAlt={scene.assetAlt}
            depth={step >= 5 ? 0 : 18}
          />

          {/* Lane: the exchange, and where it fails. */}
          <Lane
            label={scene.exchange}
            percent={tPct}
            state={tState}
            shaking={step === 4}
          />

          <PartyCard party={scene.b} depth={step >= 5 ? 0 : 18} />
        </div>

        {/* Dispute — the loudest thing on the stage while it is up. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-1/2 z-20 flex -translate-y-1/2 justify-center px-6 transition-opacity",
            showDispute ? "opacity-100" : "opacity-0",
          )}
          style={{ transitionDuration: "var(--duration-normal)" }}
          aria-hidden
        >
          <div className="max-w-md text-center">
            <p
              className="text-display text-ink"
              style={{ filter: "drop-shadow(0 0 22px var(--fx-failed-glow))" }}
            >
              “{scene.dispute}”
            </p>
            <p className="mt-2 font-mono text-mono-sm uppercase text-failed">
              {scene.stall}
            </p>
          </div>
        </div>

        {/* Beams from Delphi out to each party. */}
        <Beams drawn={showBeams} />

        {/* Delphi, rising from below. */}
        <DelphiPanel
          label={scene.delphi}
          visible={showDelphi}
          stagesLit={stagesLit}
        />
      </div>

      {/* ── Outcomes ───────────────────────────────────────────────────── */}
      <ul className="grid gap-3 sm:grid-cols-3">
        {scene.outcomes.map((o, i) => (
          <li
            key={o}
            className={cn(
              "rounded-md border border-line bg-surface-raised p-4 text-body-sm text-ink-secondary shadow-card transition-all",
              showOutcomes
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0",
            )}
            style={{
              transitionDuration: "var(--duration-normal)",
              transitionDelay: showOutcomes ? `${i * 110}ms` : "0ms",
            }}
          >
            <span
              aria-hidden
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-verified align-middle"
            />
            {o}
          </li>
        ))}
      </ul>

      {/* ── Controls / status ──────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        {reduced ? (
          <p className="text-body-sm text-ink-muted">
            {trustEngineCopy.staticNote}
          </p>
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
        <p className="font-mono text-mono-sm uppercase text-ink-muted">
          {scene.sector}
        </p>
      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

/** Faint measured grid, echoing the hero. Atmosphere, not information. */
function StageGrid() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--fx-node-edge) 1px, transparent 1px)," +
          "linear-gradient(to bottom, var(--fx-node-edge) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "var(--mask-stage-fade)",
        WebkitMaskImage: "var(--mask-stage-fade)",
      }}
    />
  );
}

function PartyCard({
  party,
  asset,
  assetAlt,
  depth,
}: {
  party: TrustScene["a"];
  asset?: string;
  assetAlt?: string;
  depth: number;
}) {
  return (
    <div
      className="relative rounded-md border border-line-strong bg-surface-raised p-5 transition-transform"
      style={{
        transform: `translateZ(${depth}px)`,
        transitionDuration: "var(--duration-slow)",
        transitionTimingFunction: "var(--ease-out-quart)",
      }}
    >
      {asset && (
        <div className="mb-4 aspect-video overflow-hidden rounded-sm border border-line">
          <img
            src={`/assets/industries/${asset}-560.webp`}
            srcSet={`/assets/industries/${asset}-560.webp 560w, /assets/industries/${asset}-1120.webp 1120w`}
            sizes="(min-width: 1024px) 340px, 90vw"
            alt={assetAlt ?? ""}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <p className="font-mono text-mono-sm uppercase text-ink-muted">
        {party.label}
      </p>
      <p className="mt-1 text-subheading text-ink">{party.roles}</p>
      <p className="mt-2 text-body-sm text-ink-secondary">{party.holds}</p>
    </div>
  );
}

function Lane({
  label,
  percent,
  state,
  shaking,
}: {
  label: string;
  percent: number;
  state: TokenState;
  shaking: boolean;
}) {
  const glow =
    state === "failed"
      ? "var(--fx-failed-glow)"
      : state === "verified"
        ? "var(--fx-verified-glow)"
        : "var(--fx-accent-glow)";
  const fill =
    state === "failed"
      ? "bg-failed"
      : state === "verified"
        ? "bg-verified"
        : "bg-accent";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6 lg:min-w-[16rem] lg:py-0 lg:pt-24">
      <p className="font-mono text-mono-sm uppercase text-ink-muted">{label}</p>

      {/* The lane itself. Horizontal on desktop; the parties stack on mobile
          and this still reads as the path between them. */}
      <div
        className="relative h-px w-full"
        style={{ backgroundColor: "var(--fx-lane)" }}
      >
        <span
          className={cn(
            "absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[left,background-color]",
            fill,
            shaking && "animate-fx-shake",
          )}
          style={{
            left: `${percent}%`,
            filter: `drop-shadow(0 0 10px ${glow})`,
            transitionDuration: "var(--duration-slow)",
            transitionTimingFunction: "var(--ease-in-out)",
          }}
          aria-hidden
        />
      </div>
    </div>
  );
}

function Beams({ drawn }: { drawn: boolean }) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-10 h-full w-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      {[
        { d: "M 50 88 L 20 44" },
        { d: "M 50 88 L 80 44" },
      ].map((b, i) => (
        <path
          key={b.d}
          d={b.d}
          fill="none"
          stroke="var(--fx-accent-glow)"
          strokeWidth="1.25"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          strokeDasharray={1}
          style={{
            strokeDashoffset: drawn ? 0 : 1,
            transition: "stroke-dashoffset var(--duration-slow) var(--ease-out-quart)",
            transitionDelay: drawn ? `${i * 140}ms` : "0ms",
          }}
        />
      ))}
    </svg>
  );
}

function DelphiPanel({
  label,
  visible,
  stagesLit,
}: {
  label: string;
  visible: boolean;
  stagesLit: number;
}) {
  return (
    <div
      className={cn(
        "relative z-20 mx-auto mb-6 w-[min(92%,34rem)] rounded-md border p-5 transition-all md:mb-10",
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      )}
      style={{
        borderColor: "var(--fx-node-edge)",
        backgroundColor: "var(--callout-surface)",
        boxShadow: visible ? "0 0 60px var(--fx-accent-halo)" : "none",
        transitionDuration: "var(--duration-slow)",
        transitionTimingFunction: "var(--ease-out-quart)",
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

      <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {trustStages.map((s, i) => {
          const lit = i < stagesLit;
          return (
            <li
              key={s.n}
              className="rounded-sm border px-2.5 py-2 transition-all"
              style={{
                borderColor: lit ? "var(--fx-accent-glow)" : "var(--fx-node-edge)",
                boxShadow: lit ? "0 0 18px var(--fx-accent-halo)" : "none",
                opacity: lit ? 1 : 0.4,
                transitionDuration: "var(--duration-normal)",
              }}
            >
              <span className="block font-mono text-mono-sm text-callout-ink-muted">
                {s.n}
              </span>
              <span className="block text-caption text-callout-ink">
                {s.title}
              </span>
            </li>
          );
        })}
      </ol>
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
