import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { AnnotationPanel } from "@/components/annotation/Panel";
import { AnchorDot, Leaders, type LeaderSpec } from "@/components/annotation/Leaders";
import { useBoxes } from "@/components/annotation/useBoxes";
import {
  ChapterBar,
  DESIGN_W,
  OutcomeList,
  ReplayIcon,
  StageGrid,
  TitleCard,
  useStageScale,
} from "@/components/trust/TrustEngine";
import { acts, trustEngineCopy } from "@/content/trust-scenes";
import type { BuildStage, ConcealedWork, TrustBuildScene } from "@/content/trust-build";

/* ============================================================================
   TRUST BUILD — the construction piece
   ============================================================================
   The same core as TrustEngine, a different workflow on top. See TrustWorkflow
   in content/trust-scenes.ts for why that is a claim being made rather than an
   inconsistency being tolerated.

   ── WHY IT IS NOT TRUSTENGINE WITH DIFFERENT DATA ─────────────────────────
   TrustEngine tells a HANDOVER story: one asset, static, given to somebody,
   given back, and two honest accounts of a single fact. Every mechanism in it
   assumes that shape — a survey of eight rooms captured twice, one incident
   rendered from one definition at one anchor in both acts, a comparison of two
   frames at the end.

   A build has none of that. The asset does not exist at the start and is a
   different object at every beat. There is no incident and no dispute: what
   goes wrong is that the evidence is destroyed by the ordinary course of the
   work. Bending it onto those beats would have meant inventing an argument
   the sector does not have, and dropping the one it does.

   ── WHAT IS SHARED ────────────────────────────────────────────────────────
   Everything that draws: the floor, the title card, the scaling, the panels,
   the leaders, the tally, the transport controls. They come from TrustEngine
   and annotation/ rather than being reproduced, so the two pieces cannot
   drift into looking like two products. TrustEngine is acting as the shared
   stage module by default; if a third piece appears, split those exports into
   their own file rather than importing a second time from a scene component.

   ── THE RULE THAT MAKES IT WORK ───────────────────────────────────────────
   THE BUILD IS IDENTICAL IN BOTH ACTS. Same six stages in the same order, the
   same concealed work, the same wall closing over it on the same day. If Act
   Two built it better, faster or with fewer defects, the piece would be
   claiming that Delphi improves construction. It does not. The only thing
   that differs between the acts is whether anything was recorded before it
   stopped being visible — which is enforced here by both acts reading their
   stage index from the SAME table.
   ========================================================================= */

const STEPS = [
  { id: "intro-mark", ms: 900 },
  { id: "intro-line", ms: 1100 },
  { id: "intro-study", ms: 1700 },

  /* ── Act one: the same build, unrecorded ── */
  { id: "a1-plot", ms: 2400 },
  { id: "a1-schedule", ms: 2800 },
  /* The number is the hook, so it gets a beat to itself rather than sharing
     one with the bar it is derived from. */
  { id: "a1-exposure", ms: 3000 },
  { id: "a1-parties", ms: 2000 },
  { id: "a1-contract", ms: 2200 },
  { id: "a1-foundations", ms: 2200 },
  { id: "a1-photos", ms: 3200 },
  { id: "a1-structure", ms: 2200 },
  /* The concealed work, visible. Held: it is the thing the whole piece is
     about and a viewer needs long enough to register what they are seeing
     before it is taken away. */
  { id: "a1-detail", ms: 2800 },
  { id: "a1-cover", ms: 3200 },
  { id: "a1-fitout", ms: 1600 },
  { id: "a1-handover", ms: 2400 },
  { id: "a1-lost", ms: 3400 },

  { id: "turn", ms: 2400 },

  /* ── Act two: the same build, recorded ── */
  { id: "a2-plot", ms: 2400 },
  { id: "a2-foundations", ms: 2200 },
  { id: "a2-structure", ms: 2000 },
  /* Four captures, one beat. They are taken across a fortnight in the story
     and the record shows the dates; animating four separate beats would say
     the survey was the event, when the event is the covering that follows. */
  { id: "a2-conceal", ms: 3600 },
  { id: "a2-cover", ms: 3200 },
  { id: "a2-fitout", ms: 1800 },
  { id: "a2-handover", ms: 2200 },
  { id: "a2-record", ms: 3600 },
  { id: "a2-closing", ms: 3400 },
  { id: "a2-resolved", ms: 0 }, // REST
] as const;

const AT = Object.fromEntries(STEPS.map((s, i) => [s.id, i])) as Record<
  (typeof STEPS)[number]["id"],
  number
>;
const at = (id: string) => AT[id as (typeof STEPS)[number]["id"]] ?? 0;
const REST = STEPS.length - 1;
const TURN = at("turn");

const CHAPTERS = [
  { label: acts.one.marker, at: 0 },
  { label: acts.turn.marker, at: TURN },
  { label: acts.two.marker, at: at("a2-plot") },
];

/* WHICH STATE THE ISLAND IS IN, by step.
   ONE TABLE, READ BY BOTH ACTS — that is what enforces the identical build.
   A beat with no entry keeps whatever the last one said, the same way the
   narration holds. */
const STAGE_AT: Record<string, number> = {
  "a1-plot": 0,
  "a1-foundations": 1,
  "a1-structure": 2,
  "a1-cover": 3,
  "a1-fitout": 4,
  "a1-handover": 5,
  turn: 0,
  "a2-plot": 0,
  "a2-foundations": 1,
  "a2-structure": 2,
  "a2-cover": 3,
  "a2-fitout": 4,
  "a2-handover": 5,
};

/* HOW MANY INSTALMENTS HAVE FALLEN DUE, by step. Same table serves both acts
   for the same reason: the money is not what changes between them. */
const PAID_AT: Record<string, number> = {
  "a1-contract": 2,
  "a1-foundations": 3,
  "a1-structure": 4,
  "a1-handover": 5,
  turn: 0,
  "a2-plot": 2,
  "a2-foundations": 3,
  "a2-structure": 4,
  "a2-handover": 5,
};

/** Walk back to the last beat that set something, so a value holds through the
 *  beats that only move the picture. */
function held(table: Record<string, number>, step: number, fallback = 0) {
  for (let i = step; i >= 0; i--) {
    const v = table[STEPS[i].id];
    if (v !== undefined) return v;
  }
  return fallback;
}

const s = {
  intro: (n: number) => n < at("a1-plot"),
  introLine: (n: number) => n >= at("intro-line"),
  introStudy: (n: number) => n >= at("intro-study"),

  act: (n: number) => (n < TURN ? 1 : n === TURN ? 0 : 2),

  asset: (n: number) => n >= at("a1-plot") && n !== TURN,
  schedule: (n: number) => n >= at("a1-schedule") && n !== TURN,
  exposure: (n: number) => n >= at("a1-exposure") && n < at("a1-handover"),
  parties: (n: number) => (n >= at("a1-parties") && n < TURN) || n > TURN,

  /* Act one only: the photographs that arrive with the invoice. */
  photos: (n: number) => n >= at("a1-photos") && n < at("a1-cover"),

  /* The concealed work, open on the stage. Both acts — the work happens
     either way, and showing it only in act two would say Delphi put it
     there. */
  detail: (n: number) =>
    (n >= at("a1-detail") && n <= at("a1-cover")) ||
    (n >= at("a2-conceal") && n <= at("a2-cover")),
  /* …and covered. The frame does not change; what is in it does. */
  covered: (n: number) => n === at("a1-cover") || n === at("a2-cover"),
  /* Act two only: the mark that says this frame is on record. */
  detailCaptured: (n: number) => n >= at("a2-conceal") && n <= at("a2-cover"),

  /* The record panel: open from the first capture, and it never closes. */
  record: (n: number) => n >= at("a2-plot"),
  /* How many records exist, which is what fills the strip. */
  recordsAt: (n: number) => {
    if (n < at("a2-plot")) return 0;
    if (n < at("a2-foundations")) return 1;
    if (n < at("a2-structure")) return 2;
    if (n < at("a2-conceal")) return 3;
    if (n < at("a2-cover")) return 7; // the four concealed works land together
    if (n < at("a2-fitout")) return 8;
    if (n < at("a2-handover")) return 9;
    return 10;
  },

  claims: (n: number) => n === at("a1-lost"),
  frozen: (n: number) => n === at("a1-lost"),
  unresolved: (n: number) => n === at("a1-lost"),
  resolved: (n: number) => n >= at("a2-resolved"),
  closing: (n: number) => n >= at("a2-closing"),
};

export function TrustBuild({
  scene,
  className,
}: {
  scene: TrustBuildScene;
  className?: string;
}) {
  const [step, setStep] = useState<number>(REST);
  const [reduced, setReduced] = useState(false);
  const played = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scale, height: canvasH } = useStageScale(frameRef);
  const timer = useRef<number | undefined>(undefined);
  const { boxes, register, measure } = useBoxes(stageRef);

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = undefined;
  }, []);

  const playFrom = useCallback(
    (from: number) => {
      stop();
      played.current = true;
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
    const el = frameRef.current;
    if (!el || reduced) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !played.current) play();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, play]);

  useEffect(() => stop, [stop]);

  /* Re-measure on every beat, and again when a column finishes re-centring —
     the tally opens on a transition and the panel above it rides up over the
     same half second. Identical reasoning to TrustEngine; see the note
     there. */
  useEffect(() => {
    measure();
  }, [step, measure]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const onEnd = (e: TransitionEvent) => {
      if (e.propertyName === "grid-template-rows") measure();
    };
    stage.addEventListener("transitionend", onEnd);
    return () => stage.removeEventListener("transitionend", onEnd);
  }, [measure, stageRef]);

  const act = s.act(step);
  const stageIndex = held(STAGE_AT, step);
  const paid = held(PAID_AT, step);

  const title = (() => {
    for (let i = step; i >= 0; i--) {
      const entry = scene.narration[STEPS[i].id];
      if (entry) return entry;
    }
    return undefined;
  })();

  /* The ending replaces the narration rather than sitting under it: it is not
     a caption on a beat, it is what the piece has been for. */
  const line = s.resolved(step)
    ? { line: scene.resolved.headline, sub: undefined }
    : s.closing(step)
      ? { line: scene.closing, sub: undefined }
      : s.unresolved(step)
        ? { line: scene.unresolved.headline, sub: scene.unresolved.cost }
        : title;

  const leaders: LeaderSpec[] = scene.parties.map((p) => ({
    id: p.id,
    anchor: p.anchor,
    on: s.parties(step) && !s.detail(step),
  }));

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div
        ref={frameRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line-strong transition-[filter] md:aspect-[16/9]"
        style={{
          filter: s.frozen(step) ? "grayscale(0.85)" : "none",
          transitionDuration: "var(--duration-slow)",
        }}
      >
        <div
          ref={stageRef}
          className="absolute left-0 top-0 isolate origin-top-left"
          style={{
            width: `${DESIGN_W}px`,
            height: `${canvasH}px`,
            transform: `scale(${scale})`,
          }}
        >
          <StageGrid ground={scene.ground} />

          {/* ── The island ── */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity"
            style={{
              width: `${scene.assetBox.width}%`,
              top: `${scene.assetBox.top}%`,
              opacity: s.asset(step) ? (s.detail(step) ? 0.25 : 1) : 0,
              transitionDuration: s.intro(step)
                ? "var(--duration-cross)"
                : "var(--duration-slow)",
            }}
          >
            <IslandStack stages={scene.stages} index={stageIndex} />
          </div>

          <Leaders specs={leaders} boxes={boxes} className="z-10" />
          {leaders.map((l) => (
            <AnchorDot
              key={`${l.id}-dot`}
              at={l.anchor}
              on={l.on}
              className="z-20"
            />
          ))}

          {/* ── The money ──
              ACROSS THE TOP, and in both acts. It started under the island,
              which is where it reads best — but the narration block owns the
              bottom 19% of this stage and the bar sat inside it, labels
              overlapping the act marker.

              Up here it does something the other position could not: it stays
              on screen while the record fills beneath it in act two, so the
              two things a viewer is meant to weigh against each other — what
              has been paid, and what is known — are visible at the same time.
              It is the only thing on this stage that is identical in both
              acts and is not evidence, which is exactly its job. */}
          <PaymentBar
            schedule={scene.schedule}
            paid={paid}
            exposure={scene.exposure}
            on={s.schedule(step)}
            showExposure={s.exposure(step)}
          />

          {/* ── The counterparties ── */}
          <PartyColumn side="left">
            <PartyCard
              party={scene.parties[0]}
              on={s.parties(step) && !s.detail(step)}
              showClaim={s.claims(step)}
              boxRef={register(scene.parties[0].id)}
            />
          </PartyColumn>
          <PartyColumn side="right">
            <PartyCard
              party={scene.parties[1]}
              on={s.parties(step) && !s.detail(step)}
              showClaim={s.claims(step)}
              boxRef={register(scene.parties[1].id)}
            />
            <OutcomeList
              items={act === 2 ? scene.resolved.outcomes : scene.unresolved.outcomes}
              tone={act === 2 ? "verified" : "failed"}
              on={s.unresolved(step) || s.resolved(step)}
              spacing="pt-3"
            />
          </PartyColumn>

          {/* ── Act one's photographs ──
              Genuine, and that is the point: no metadata, no chrome, nothing
              wrong with them at all. They simply cannot say when or where. */}
          <PhotoPile
            stages={scene.stages}
            on={s.photos(step)}
            index={stageIndex}
          />

          {/* ── The record ──
              Act two only, and it never closes once open. */}
          <BuildRecord
            scene={scene}
            on={s.record(step)}
            count={s.recordsAt(step)}
            boxRef={register("record")}
          />

          {/* ── THE CONCEALMENT ──
              Above everything, because for these two beats it IS everything.
              One frame, two contents: the work, then the finish over it. The
              frame does not move, so a viewer watches the same place stop
              being visible rather than watching a cut between two pictures. */}
          <CoverPair
            covering={scene.covering}
            others={scene.concealed}
            on={s.detail(step)}
            covered={s.covered(step)}
            captured={s.detailCaptured(step)}
          />

          <TitleCard
            on={s.intro(step)}
            line={trustEngineCopy.intro}
            lineOn={s.introLine(step)}
            study={scene.study}
            studyOn={s.introStudy(step)}
          />

          <div
            className="absolute inset-x-0 bottom-0 z-40 flex min-h-[7.5rem] flex-col justify-end gap-1 px-6 pb-2 transition-opacity"
            style={{
              opacity: s.intro(step) ? 0 : 1,
              transitionDuration: "var(--duration-normal)",
            }}
          >
            <p className="font-mono text-mono-sm uppercase text-ink-muted">
              {act === 1 ? acts.one.marker : act === 2 ? acts.two.marker : acts.turn.marker}
              {act !== 0 && (
                <span className="ml-2 text-ink-secondary">
                  {act === 1 ? acts.one.title : acts.two.title}
                </span>
              )}
            </p>
            <p
              className="text-heading text-ink transition-opacity md:text-display"
              style={{ transitionDuration: "var(--duration-normal)" }}
            >
              {line?.line ?? " "}
            </p>
            <p className="text-body-sm text-ink-secondary">{line?.sub ?? " "}</p>
          </div>
        </div>
      </div>

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
        <ChapterBar
          step={step}
          onJump={playFrom}
          reduced={reduced}
          chapters={CHAPTERS}
          className="ml-auto"
        />
      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

/** The six states of the island, stacked and cross-faded in place.
 *
 *  All six mounted at all times rather than swapped: they are the same island
 *  from the same camera, so the dissolve only works if one is exactly on top
 *  of the other, and a component that mounts the next stage on the beat it is
 *  needed would fade in from nothing over whatever the browser had decoded.
 *  Mounted together they are also all decoded before the first dissolve. */
function IslandStack({
  stages,
  index,
}: {
  stages: readonly BuildStage[];
  index: number;
}) {
  return (
    <div className="relative" style={{ aspectRatio: "768 / 341" }}>
      {stages.map((st, i) => (
        <img
          key={st.id}
          src={`/assets/features/${st.image}-960.webp`}
          srcSet={`/assets/features/${st.image}-480.webp 480w, /assets/features/${st.image}-960.webp 768w`}
          sizes="(min-width: 1024px) 560px, 60vw"
          alt={i === index ? st.imageAlt : ""}
          aria-hidden={i !== index}
          width={768}
          height={341}
          loading={i === 0 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 block h-full w-full transition-opacity"
          style={{
            opacity: i === index ? 1 : 0,
            transitionDuration: "var(--duration-cross)",
          }}
        />
      ))}
    </div>
  );
}

/** The payment schedule, as a bar the width of the price.
 *
 *  Proportional segments rather than a list, because the argument is a
 *  proportion: the buyer is looking at how much of the bar is lit before the
 *  last segment, and that is a thing to SEE rather than a number to be told.
 *  The exposure marker draws where the last instalment begins — everything
 *  left of it falls due before anyone can walk in. */
function PaymentBar({
  schedule,
  paid,
  exposure,
  on,
  showExposure,
}: {
  schedule: readonly { pct: number; label: string }[];
  paid: number;
  exposure: { pct: number; line: string };
  on: boolean;
  showExposure: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 z-20 w-[56%] -translate-x-1/2 transition-opacity"
      style={{
        top: "4%",
        opacity: on ? 1 : 0,
        transitionDuration: "var(--duration-slow)",
      }}
    >
      <div className="relative flex gap-1">
        {schedule.map((p, i) => (
          <div
            key={p.label}
            className="flex flex-col gap-1"
            style={{ flexGrow: p.pct, flexBasis: 0 }}
          >
            <div
              className="h-2 rounded-xs transition-colors"
              style={{
                backgroundColor:
                  i < paid ? "var(--fx-accent-glow)" : "var(--callout-slot)",
                transitionDuration: "var(--duration-slow)",
              }}
            />
            <p
              className={cn(
                "truncate font-mono text-mono-xs transition-colors",
                i < paid ? "text-ink" : "text-ink-muted",
              )}
              style={{ transitionDuration: "var(--duration-slow)" }}
            >
              {p.pct}% {p.label}
            </p>
          </div>
        ))}
      </div>

      {/* THE HOOK, drawn as a bracket under the instalments it covers rather
          than written as a sentence beside them. Its width IS the claim: a
          reader sees how much of the bar falls before the last segment
          without reading the number, and the number then confirms what they
          have already seen. Taken from the schedule, so changing an instalment
          moves the bracket. */}
      <div
        className="mt-2 transition-opacity"
        style={{
          opacity: showExposure ? 1 : 0,
          transitionDuration: "var(--duration-slow)",
        }}
      >
        <div
          className="h-px"
          style={{
            width: `${exposure.pct}%`,
            backgroundColor: "var(--fx-accent-glow)",
          }}
        />
        <p
          className="mt-1 font-mono text-mono-xs text-ink"
          style={{ width: `${exposure.pct}%` }}
        >
          {exposure.pct}% {exposure.line}
        </p>
      </div>
    </div>
  );
}

function PartyColumn({
  side,
  children,
}: {
  side: "left" | "right";
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute top-1/2 z-30 flex w-[21%] min-w-[190px] -translate-y-1/2 flex-col items-stretch gap-2",
        side === "left" ? "left-[2%]" : "right-[2%]",
      )}
    >
      {children}
    </div>
  );
}

/** One counterparty.
 *
 *  The claim surfaces at the end of act one and is deliberately not an
 *  accusation in either direction: "It was built correctly" and "I have no
 *  way to see" are both true at the same time, which is the whole difficulty
 *  and the reason this scenario is not a dispute. */
function PartyCard({
  party,
  on,
  showClaim,
  boxRef,
}: {
  party: TrustBuildScene["parties"][number];
  on: boolean;
  showClaim: boolean;
  boxRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <AnnotationPanel on={on} width="w-full" boxRef={boxRef}>
      <p className="font-mono text-mono-xs uppercase text-callout-ink-muted">
        {party.label}
      </p>
      <p className="text-body-sm font-semibold text-callout-ink">{party.role}</p>
      <p className="text-body-sm text-callout-ink-muted">{party.holds}</p>
      {party.claim && (
        <div
          className="grid transition-[grid-template-rows]"
          style={{
            gridTemplateRows: showClaim ? "1fr" : "0fr",
            transitionDuration: "var(--duration-slow)",
          }}
        >
          <p className="overflow-hidden text-body-sm italic text-failed">
            <span className="block pt-2">“{party.claim}”</span>
          </p>
        </div>
      )}
    </AnnotationPanel>
  );
}

/** Act one's photographs.
 *
 *  Three frames, overlapped, slightly turned — a handful of pictures rather
 *  than a record. No date, no location, no code, no chrome of any kind, and
 *  that absence is the argument: there is nothing wrong with them, and there
 *  is nothing on them either. */
function PhotoPile({
  stages,
  on,
  index,
}: {
  stages: readonly BuildStage[];
  on: boolean;
  index: number;
}) {
  const shown = stages.slice(Math.max(0, index - 1), index + 1).slice(-2);
  const tilt = [-4, 3, -1.5];
  return (
    <div
      className="absolute right-[26%] z-30 flex w-[20%] transition-opacity"
      style={{
        top: "12%",
        opacity: on ? 1 : 0,
        transitionDuration: "var(--duration-slow)",
      }}
    >
      {shown.map((st, i) => (
        <div
          key={st.id}
          className="relative -ml-6 first:ml-0"
          style={{ transform: `rotate(${tilt[i % tilt.length]}deg)` }}
        >
          <img
            src={`/assets/features/${st.image}-480.webp`}
            alt=""
            width={768}
            height={341}
            loading="lazy"
            decoding="async"
            className="block w-full rounded-xs border"
            style={{
              borderColor: "var(--callout-slot)",
              backgroundColor: "var(--callout-ink)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/** THE CONCEALMENT.
 *
 *  One frame that changes what is inside it. The waterproofing, then the same
 *  bathroom finished — same camera, same corners, same drain — so a viewer
 *  watches a place stop being visible instead of watching two pictures.
 *
 *  In act two the same frame carries a capture mark and the other three
 *  concealed works stack behind it. Nothing about the BUILDING differs
 *  between the acts here, which is the rule at the head of this file: the wall
 *  closes either way, and only the record does not exist the first time. */
function CoverPair({
  covering,
  others,
  on,
  covered,
  captured,
}: {
  covering: TrustBuildScene["covering"];
  others: readonly ConcealedWork[];
  on: boolean;
  covered: boolean;
  captured: boolean;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 z-40 w-[42%] -translate-x-1/2 -translate-y-1/2 transition-opacity"
      style={{
        opacity: on ? 1 : 0,
        transitionDuration: "var(--duration-slow)",
      }}
    >
      <div
        className="relative overflow-hidden rounded-sm border"
        style={{
          borderColor: captured ? "var(--fx-accent-glow)" : "var(--callout-slot)",
          transition: "border-color var(--duration-slow)",
        }}
      >
        <div className="relative" style={{ aspectRatio: "906 / 510" }}>
          {[
            { src: covering.before.image, alt: covering.before.imageAlt, shown: !covered },
            { src: covering.after.image, alt: covering.after.imageAlt, shown: covered },
          ].map((f) => (
            <img
              key={f.src}
              src={`/assets/features/${f.src}-960.webp`}
              srcSet={`/assets/features/${f.src}-480.webp 480w, /assets/features/${f.src}-960.webp 906w`}
              sizes="(min-width: 1024px) 470px, 45vw"
              alt={f.shown ? f.alt : ""}
              aria-hidden={!f.shown}
              width={906}
              height={510}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 block h-full w-full object-cover transition-opacity"
              style={{
                opacity: f.shown ? 1 : 0,
                transitionDuration: "var(--duration-cross)",
              }}
            />
          ))}
        </div>

        <div
          className="flex items-center gap-2 px-2 py-1.5"
          style={{ backgroundColor: "var(--callout-ink)" }}
        >
          <span className="truncate font-mono text-mono-xs text-callout-ink">
            {covered ? covering.after.label : covering.before.label}
          </span>
          <span className="ml-auto shrink-0 font-mono text-mono-xs text-callout-ink-muted">
            {/* The date only exists in act two. In act one there is nothing
                standing behind one, so putting one here would be inventing
                the very thing the act is about not having. */}
            {captured ? covering.before.stamp : "No record"}
          </span>
        </div>
      </div>

      {/* The other three, as a row of small frames under the pair. They are
          not the beat — the bathroom is — but leaving them out would say the
          waterproofing was the only thing that disappeared. */}
      <div
        className="mt-2 flex gap-2 transition-opacity"
        style={{
          opacity: captured ? 1 : 0,
          transitionDuration: "var(--duration-slow)",
        }}
      >
        {others
          .filter((c) => c.image !== covering.before.image)
          .map((c) => (
            <div key={c.image} className="min-w-0 flex-1">
              <img
                src={`/assets/features/${c.image}-240.webp`}
                alt=""
                width={906}
                height={510}
                loading="lazy"
                decoding="async"
                className="block w-full rounded-xs border object-cover"
                style={{ borderColor: "var(--fx-accent-glow)" }}
              />
              <p className="mt-1 truncate font-mono text-mono-xs text-ink-muted">
                {c.label}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

/** The record: every capture, in the order it happened.
 *
 *  A STRIP, not a grid. The claim being made is chronological — this is what
 *  the asset looked like, in sequence, as it came into existence — and a grid
 *  says "a set of photographs" where a row says "a history". Read left to
 *  right it is also the shape of the story: four of the ten cluster in the
 *  fortnight before the roof goes on, which is exactly when things stop being
 *  visible.
 *
 *  ⚠️  TEN INDIVIDUAL RECORDS, NOT ONE. Each capture is its own certificate.
 *  Persistent asset passports are development direction rather than what
 *  ships — see the `passports` pillar in platform.ts — so the panel counts
 *  records and never implies a single document spanning the build. */
function BuildRecord({
  scene,
  on,
  count,
  boxRef,
}: {
  scene: TrustBuildScene;
  on: boolean;
  count: number;
  boxRef?: (el: HTMLElement | null) => void;
}) {
  /* Stages and concealed works interleaved by date — built here rather than
     authored so it cannot disagree with the two lists it comes from. */
  const entries = [
    ...scene.stages.map((st) => ({
      key: st.id,
      image: st.image,
      label: st.label,
      stamp: st.stamp,
      concealed: false,
    })),
    ...scene.concealed.map((c) => ({
      key: c.image,
      image: c.image,
      label: c.label,
      stamp: c.stamp,
      concealed: true,
    })),
  ].sort((a, b) => Date.parse(a.stamp) - Date.parse(b.stamp));

  return (
    <AnnotationPanel
      spec={{ panel: scene.record.panel, align: "top-center" }}
      on={on}
      width=""
      style={{ width: "min(58%, 38rem)" }}
      boxRef={boxRef}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-0.5 shrink-0 rounded-xs bg-verified"
          aria-hidden
        />
        <span className="truncate font-mono text-mono-xs text-callout-ink">
          Construction record
        </span>
        <span className="ml-auto shrink-0 font-mono text-mono-xs text-callout-ink-muted">
          {count} of {entries.length}
        </span>
      </div>

      <div className="mt-1.5 flex gap-1">
        {entries.map((e, i) => (
          <div key={e.key} className="min-w-0 flex-1">
            <div
              className="relative overflow-hidden rounded-xs border border-dotted transition-opacity"
              style={{
                aspectRatio: "16 / 9",
                borderColor: e.concealed
                  ? "var(--fx-accent-glow)"
                  : "var(--callout-slot)",
                backgroundColor: "var(--callout-halo)",
              }}
            >
              <img
                src={`/assets/features/${e.image}-240.webp`}
                alt=""
                width={768}
                height={341}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-opacity"
                style={{
                  opacity: i < count ? 1 : 0,
                  transitionDuration: "var(--duration-slow)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* The span, under the strip. What makes ten pictures a history is that
          they are dated and in order, so the dates are the caption. */}
      <p className="mt-1.5 flex justify-between font-mono text-mono-xs text-callout-ink-muted">
        <span>{entries[0].stamp}</span>
        <span>{entries[entries.length - 1].stamp}</span>
      </p>
    </AnnotationPanel>
  );
}
