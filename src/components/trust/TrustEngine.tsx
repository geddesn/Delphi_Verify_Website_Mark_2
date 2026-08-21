import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { acts, trustEngineCopy } from "@/content/trust-scenes";
import type {
  StageGround,
  StagePoint,
  TrustCapture,
  TrustParty,
  TrustScene,
} from "@/content/trust-scenes";
import { AnchorDot, Leaders, type LeaderSpec } from "@/components/annotation/Leaders";
import { AnnotationPanel, PanelImage, PanelLogo } from "@/components/annotation/Panel";
import type { Align, Box, Rect } from "@/components/annotation/geometry";
import { useBoxes } from "@/components/annotation/useBoxes";

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
   Boxes, leaders and dots are the shared annotation primitives in
   src/components/annotation/ — the same ones the expanded industry figures
   use. Nothing here draws its own line.

   Leaders are white, always. Colouring them by state turned the stage into a
   diagram of angry wires and fought with the panels, which is where state
   actually belongs: the incident dot, the certificates, the outcomes.
   ========================================================================= */

const STEPS = [
  /* ── ACT ONE — without a record ── */
  { id: "a1-asset", ms: 1600 },
  { id: "a1-captain", ms: 1400 },
  { id: "a1-charterer", ms: 1400 },
  { id: "a1-delivery", ms: 1200 }, // handover, unrecorded
  { id: "a1-charter", ms: 1400 },
  { id: "a1-incident", ms: 1800 },
  { id: "a1-redelivery", ms: 1300 },
  { id: "a1-photo", ms: 1600 }, // the only evidence anyone has
  { id: "a1-dispute", ms: 2800 },
  { id: "a1-unresolved", ms: 2800 }, // freeze, grey
  /* ── THE TURN ── */
  { id: "turn", ms: 1400 },
  /* ── ACT TWO — with a record ── */
  { id: "a2-asset", ms: 1100 },
  { id: "a2-captain", ms: 1100 }, // the person who will do the capturing
  { id: "a2-capture", ms: 2000 }, // ⭐ the one difference
  { id: "a2-charterer", ms: 1200 }, // arrives AFTER the record
  /* Capturing and sharing are two beats, not one. A record only settles an
     argument if every side had it BEFORE there was an argument, and that is a
     separate claim from having made it — so it gets its own moment. */
  { id: "a2-share", ms: 2000 },
  { id: "a2-charter", ms: 1000 },
  { id: "a2-incident", ms: 1700 }, // identical to a1-incident
  { id: "a2-recapture", ms: 1800 },
  { id: "a2-reshare", ms: 1800 }, // the same again, at the other end
  { id: "a2-compare", ms: 2400 },
  { id: "a2-resolved", ms: 0 }, // REST
] as const;

/* Steps are addressed BY ID, never by index.
   Two bugs came out of hard-coded indices while this was being built: a beat
   inserted in the middle silently re-pointed half the gates below it, and a
   reorder left the captain arriving after the capture he performs. An id
   survives both. */
const AT = Object.fromEntries(STEPS.map((s, i) => [s.id, i])) as Record<
  (typeof STEPS)[number]["id"],
  number
>;
const at = (id: string) => AT[id as (typeof STEPS)[number]["id"]] ?? 0;

const REST = STEPS.length - 1;
const TURN = at("turn");

/* ── Derived state — every visual is one of these ──────────────────────── */
const s = {
  act: (n: number) => (n < TURN ? 1 : n === TURN ? 0 : 2),
  /** A party is on from the step they enter, for the rest of that act. */
  party: (p: TrustParty, n: number) =>
    (n >= at(p.enters.one) && n < TURN) || n >= at(p.enters.two),

  /* Act One's occupant of the top slot: the photograph one side happens to
     have. Never in Act Two, where the record has the slot instead — the two
     are mutually exclusive by construction, which is the point. */
  ownerPhoto: (n: number) => n >= at("a1-photo") && n < TURN,
  delphi: (n: number) => n >= at("a2-capture"),

  /* Made, then handed out. The gap between these two is the beat. */
  deliveryCert: (n: number) => n >= at("a2-capture"),
  deliveryShared: (n: number) => n >= at("a2-share"),
  redeliveryCert: (n: number) => n >= at("a2-recapture"),
  redeliveryShared: (n: number) => n >= at("a2-reshare"),

  incident: (n: number) =>
    (n >= at("a1-incident") && n < TURN) || n >= at("a2-incident"),
  dispute: (n: number) => n >= at("a1-dispute") && n <= at("a1-unresolved"),
  frozen: (n: number) => n === at("a1-unresolved"),
  compare: (n: number) => n >= at("a2-compare"),
  resolved: (n: number) => n >= REST,
};

/* The counterparty columns. Panels on a side are stacked and centred on the
   middle of the stage, so nothing here is a position — only how wide a column
   is, how far in it sits, and how far apart its panels stand.

   The fallback footprint below is used for exactly one frame: the server
   render and the first paint, before useBoxes has measured anything. After
   that the real rects win. */
const COLUMN = { inset: 4, width: 20, gap: 3, box: 17 };
const RECORD_BOX: Box = { w: 40, h: 30 };

/** The offset a certificate starts at, in CSS pixels: the vector from where
 *  it lands back to the record panel that issued it.
 *
 *  Pixels, not percentages — a transform percentage is a share of the ELEMENT
 *  being moved, not of the stage it is crossing, so a 40px chip would travel
 *  40px. Both rects are measured, so this is the real distance on screen and
 *  it stays right when the stage resizes.
 *
 *  Zero before anything is measured, which is also what the server renders:
 *  no flight, the certificates are simply there. */
function flightOrigin(
  source: Rect | undefined,
  target: Rect | undefined,
  stage: { w: number; h: number },
) {
  if (!source || !target || !stage.w) return { x: 0, y: 0 };
  return {
    x: ((source.x + source.w / 2 - (target.x + target.w / 2)) / 100) * stage.w,
    y: ((source.y + source.h / 2 - (target.y + target.h)) / 100) * stage.h,
  };
}

/** Where a panel would sit if the column were laid out by hand. Only ever
 *  seen before measurement — see COLUMN. */
function columnFallback(side: "left" | "right", i: number, count: number) {
  const total = count * COLUMN.box + (count - 1) * COLUMN.gap;
  const y = 50 - total / 2 + i * (COLUMN.box + COLUMN.gap);
  const left = side === "left" ? COLUMN.inset : 100 - COLUMN.inset - COLUMN.width;
  return {
    panel: {
      x: side === "left" ? COLUMN.inset : 100 - COLUMN.inset,
      y,
    },
    align: (side === "left" ? "top-left" : "top-right") as Align,
    box: { w: COLUMN.width, h: COLUMN.box },
    rect: { x: left, y, w: COLUMN.width, h: COLUMN.box } as Rect,
  };
}

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
  /* A ref, not state. The scroll trigger's callback can be queued before a
     chapter button is pressed and still run after it, and a stale `played`
     captured in that closure let the observer restart the story from the top
     under someone who had just asked for Act two. A ref is current at the
     moment the callback actually runs. */
  const played = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  /* The panels report their own footprint, so a leader starts on the real
     edge of its box. Matters most for the counterparties, which grow when
     their claim surfaces during the dispute. */
  const { boxes, size, register } = useBoxes(stageRef);

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
    if (reduced) return;
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => {
        if (played.current) return;
        if (es.some((e) => e.isIntersecting)) {
          play();
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced, play]);

  useEffect(() => stop, [stop]);

  const act = s.act(step);
  const { incident, record } = scene;
  const showRecord = s.delphi(step);
  const showOwnerPhoto = s.ownerPhoto(step);

  /* Reading order down each column. Also the stacking order, so the panel on
     top is the one whose anchor sits highest on the vessel — otherwise their
     leaders cross on the way out. */
  const columns = {
    left: scene.parties.filter((p) => p.side === "left"),
    right: scene.parties.filter((p) => p.side === "right"),
  };

  /* Where a party's panel actually is. Measured once it exists; until then
     the fallback, which is what the server renders with. */
  const rectOf = (p: TrustParty): Rect => {
    const measured = boxes[p.id];
    if (measured) return measured;
    const list = columns[p.side];
    return columnFallback(p.side, list.indexOf(p), list.length).rect;
  };

  /* The title. The three turning points already exist as data and are not
     duplicated in scene.narration — they are composed in here, with the tone
     that makes a stalemate read differently from a resolution. */
  const narration = {
    ...scene.narration,
    turn: { line: acts.turn.line },
    "a1-unresolved": {
      line: scene.unresolved.headline,
      sub: scene.unresolved.cost,
    },
    "a2-resolved": { line: scene.resolved.headline },
  };

  /* Walk back to the last step that had a line of its own, so the title holds
     through the beats that only move the picture. */
  const title = (() => {
    for (let i = step; i >= 0; i--) {
      const entry = narration[STEPS[i].id as keyof typeof narration];
      if (entry) return entry as { line: string; sub?: string };
    }
    return undefined;
  })();

  const leaders: LeaderSpec[] = [
    ...scene.parties.map((p) => {
      const list = columns[p.side];
      return {
        id: p.id,
        anchor: p.anchor,
        ...columnFallback(p.side, list.indexOf(p), list.length),
        on: s.party(p, step),
      };
    }),
    {
      /* One leader for the top slot, its id following whichever panel is in
         there — so the measured footprint the line departs from is the one
         actually on screen. The two panels are different widths. */
      id: showRecord ? "record-verified" : "record-unverified",
      panel: record.panel,
      align: record.align,
      anchor: incident.anchor,
      box: RECORD_BOX,
      from: "bottom",
      on: showRecord || showOwnerPhoto,
    },
  ];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ChapterBar step={step} onJump={playFrom} reduced={reduced} />

      <div
        ref={stageRef}
        className="relative isolate aspect-[16/10] w-full overflow-hidden rounded-lg border border-line-strong transition-[filter] md:aspect-[16/9]"
        style={{
          /* Act One ends drained of colour. The freeze is the point. */
          filter: s.frozen(step) ? "grayscale(0.85)" : "none",
          transitionDuration: "var(--duration-slow)",
        }}
      >
        <StageGrid ground={scene.ground} />

        {/* ── The asset, centre ──
            A cut-out on the bare stage: no frame, no ground, nothing behind
            it. The master carries a real alpha channel and sharp keeps it all
            the way into WebP, so there is nothing to mask here. The box IS the
            vessel — the master is trimmed to its own bounding box — which is
            what makes the anchor percentages below mean something. */}
        <div
          className="absolute left-1/2 top-[57%] w-[44%] -translate-x-1/2 -translate-y-1/2 transition-opacity"
          style={{
            opacity: step === TURN ? 0.35 : 1,
            transitionDuration: "var(--duration-slow)",
          }}
        >
          <img
            src={`/assets/features/${scene.asset}-960.webp`}
            srcSet={`/assets/features/${scene.asset}-480.webp 480w, /assets/features/${scene.asset}-960.webp 960w`}
            sizes="(min-width: 1024px) 500px, 55vw"
            alt={scene.assetAlt}
            width={899}
            height={419}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full"
          />
        </div>

        <Leaders specs={leaders} boxes={boxes} className="z-10" />

        {/* The dot at the far end of each leader — the industry figures end
            every connector in one, and a line that stops in mid-air on a hull
            reads as unfinished. The saloon's is handled separately below: the
            record's leader lands there too, so one marker serves both. */}
        {leaders
          .filter((l) => !l.id.startsWith("record"))
          .map((l) => (
            <AnchorDot key={`${l.id}-dot`} at={l.anchor} on={l.on} className="z-20" />
          ))}

        {/* ── Counterparties. Each carries its own account of the damage,
               which surfaces beneath it when the dispute breaks out. ── */}
        {(["left", "right"] as const).map((side) => (
          <PartyColumn key={side} side={side}>
            {columns[side].map((p) => (
              <PartyPanel
                key={p.id}
                party={p}
                on={s.party(p, step)}
                showClaim={s.dispute(step)}
                boxRef={register(p.id)}
              />
            ))}
          </PartyColumn>
        ))}

        {/* ── The standing link back to the record ──
            Drawn from the inner corner of the record panel down the inside
            edge of each column to the certificates below it. That route is
            chosen, not incidental: it keeps the line clear of the panels and
            of the vessel, so it never has to cross something and be drawn
            over it. */}
        <AccessLinks
          on={s.deliveryShared(step)}
          links={scene.parties.flatMap((p) => {
            const rr = boxes["record-verified"];
            if (!rr || !size.w) return [];
            const pr = rectOf(p);
            const left = p.side === "left";
            /* Percentages everywhere else on this stage, but a path's `d` only
               accepts user units — and with no viewBox those are CSS pixels.
               Hence the conversion here rather than in the component. */
            const px = (x: number) => (x / 100) * size.w;
            const py = (y: number) => (y / 100) * size.h;
            return [
              {
                id: p.id,
                side: p.side,
                /* Out of the top of the party's box... */
                from: { x: px(pr.x + pr.w / 2), y: py(pr.y) },
                /* ...and into the near side of the record's. */
                to: {
                  x: px(left ? rr.x : rr.x + rr.w),
                  y: py(rr.y + rr.h / 2),
                },
              },
            ];
          })}
        />

        {/* ── The copies each party is handed ──
            A layer of its own, above everything, and NOT inside the panels.
            They were: the panel clips its contents so a photograph can sit
            flush to its edge, which meant a certificate crossing the stage
            was invisible until the instant it arrived. A flight nobody can
            see is just a fade-in.

            Positioned off the panels' measured rects, so they hang beneath
            whichever party is there without the column having to reserve
            room for them. */}
        {/* Always mounted, not gated on the act — a CSS animation starts when
            its element does, so a glow that appears nineteen seconds after
            the ones in the record panel can never be in phase with them
            whatever its delay is set to. Mounted together, they stay in step
            for good. Invisible until issued, which the tiles handle. */}
        <div className="pointer-events-none absolute inset-0 z-50">
            {scene.parties.map((p) => {
              const r = rectOf(p);
              return (
                <div
                  key={p.id}
                  className="absolute"
                  /* Riding up over the bottom of the panel by about a fifth
                     of their own height. Sat below it with a gap they read as
                     a separate row of things; overlapping, they read as
                     belonging to the party above them — which is the whole
                     claim being made. Above the panels in z-order, so the
                     overlap resolves the right way round. */
                  style={{
                    left: `${r.x}%`,
                    top: `calc(${r.y + r.h}% - ${CERT_OVERLAP})`,
                    width: `${r.w}%`,
                  }}
                >
                  <HeldCertificates
                    issued={[
                      s.deliveryShared(step) ? record.verified.delivery : undefined,
                      s.redeliveryShared(step) ? record.verified.redelivery : undefined,
                    ]}
                    /* One origin per certificate: each copy leaves the code on
                       the frame it certifies, so the two arrive from visibly
                       different places rather than along one shared path. */
                    from={[
                      flightOrigin(boxes["code-delivery"], r, size),
                      flightOrigin(boxes["code-redelivery"], r, size),
                    ]}
                  />
                </div>
              );
            })}
        </div>

        {/* ── The saloon marker ──
            One dot doing two jobs, because they are the same place: the far
            end of whatever is in the top slot, and the incident itself. It is
            white while it is only a location, red once the damage exists, and
            green once the two records agree about it. */}
        <AnchorDot
          at={incident.anchor}
          size="md"
          on={s.incident(step) || showOwnerPhoto || showRecord}
          className={cn(
            "z-30 transition-colors",
            s.compare(step)
              ? "bg-verified"
              : s.incident(step)
                ? "bg-failed"
                : "bg-callout-ink",
          )}
          style={{
            transitionDuration: "var(--duration-normal)",
            filter: s.incident(step)
              ? `drop-shadow(0 0 14px ${
                  s.compare(step) ? "var(--fx-verified-glow)" : "var(--fx-failed-glow)"
                })`
              : "none",
          }}
        />
        {/* ── THE TOP SLOT ──
            Act One's photograph and Act Two's record occupy the same
            position, never at once. Two panels rather than one that switches
            its contents: they are different widths, and cross-fading two
            fixed shapes reads as a REPLACEMENT, where a box that reshapes
            itself reads as the same object growing — which is the opposite of
            the point. */}
        <RecordPanel
          spec={record}
          on={showOwnerPhoto}
          width="w-[26%] min-w-[252px]"
          boxRef={register("record-unverified")}
          title={record.unverified.title}
          trusted={false}
        >
          <EvidenceCard
            cert={record.unverified.capture}
            tone="failed"
            trusted={false}
          />
        </RecordPanel>

        <RecordPanel
          spec={record}
          on={showRecord}
          width="w-[min(52%,34rem)]"
          boxRef={register("record-verified")}
          title={record.verified.title}
          trusted
        >
          <EvidenceCard
            cert={s.deliveryCert(step) ? record.verified.delivery : undefined}
            tone="verified"
            trusted
            codeRef={register("code-delivery")}
          />
          <EvidenceCard
            cert={s.redeliveryCert(step) ? record.verified.redelivery : undefined}
            tone="failed"
            trusted
            codeRef={register("code-redelivery")}
          />
        </RecordPanel>

        {/* ── The narration ──
            Down here on the floor, below the vessel, where the stage is empty
            and nothing has to move aside for it. It reads as the caption to
            the scene rather than a headline over it — and it is the one thing
            on the stage that changes on every beat, so it wants to be
            somewhere the eye can rest, not somewhere it competes.

            min-h with justify-end pins the BOTTOM: the block grows upward as
            lines wrap, so a two-line title does not shove the one-line title's
            baseline around between steps. */}
        <div className="absolute inset-x-0 bottom-0 z-40 flex min-h-[7.5rem] flex-col justify-end gap-1 px-6 pb-2">
          <p className="font-mono text-mono-sm uppercase text-ink-muted">
            {act === 1 ? acts.one.marker : act === 2 ? acts.two.marker : acts.turn.marker}
            {act !== 0 && (
              <span className="ml-2 text-ink-secondary">
                {act === 1 ? acts.one.title : acts.two.title}
              </span>
            )}
          </p>
          {/* One colour. The narration is the voice of the piece, and a voice
              that turns red when things go badly and green when they go well
              is doing the reader's thinking for them — it also puts the two
              endings in the palette of the evidence signals, which mean
              something specific elsewhere on this stage. The display step is
              already 700, so the line carries without help. */}
          <p
            className="text-heading text-ink transition-opacity md:text-display"
            style={{ transitionDuration: "var(--duration-normal)" }}
          >
            {title?.line ?? " "}
          </p>
          <p className="text-body-sm text-ink-secondary">{title?.sub ?? " "}</p>
        </div>
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
            <span
              aria-hidden
              className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-verified align-middle"
            />
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

/** The ground the asset stands on.
 *
 *  The floor is a mask ray-cast offline by scripts/render-ground.mjs, so no
 *  geometry is decided here — this only says which render to use and how hard
 *  to burn it. See StageGround in trust-scenes.ts for why the horizon and the
 *  vanishing point are measured off the asset rather than chosen.
 *
 *  Two empty divs and an image. Nothing runs. */
function StageGrid({ ground }: { ground: StageGround }) {
  return (
    <div
      aria-hidden
      className="stage-ground pointer-events-none"
      style={
        {
          "--ground-render": `url("/assets/ground/${ground.render}.webp")`,
          "--ground-opacity": ground.opacity,
        } as React.CSSProperties
      }
    >
      <div className="stage-floor" />
    </div>
  );
}

/** A side of the stage. Its panels stack and centre on the middle, so adding
 *  or removing one re-balances the column instead of leaving a hole — which
 *  is why the parties carry a `side` and not a coordinate.
 *
 *  Full height with justify-center, rather than a computed top: the panels
 *  grow when their claims surface, and a column that centres itself absorbs
 *  that where a hand-placed stack would drift off the middle. */
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
        "absolute inset-y-0 z-20 flex flex-col justify-center gap-5",
        side === "left" ? "left-[4%]" : "right-[4%]",
      )}
      style={{ width: `${COLUMN.width}%`, minWidth: "170px" }}
    >
      {children}
    </div>
  );
}

function PartyPanel({
  party,
  on,
  showClaim = false,
  boxRef,
}: {
  party: TrustParty;
  on: boolean;
  showClaim?: boolean;
  boxRef?: (el: HTMLElement | null) => void;
}) {
  const claim = party.claim;
  return (
    <AnnotationPanel on={on} width="w-full" boxRef={boxRef}>
      <div className="p-3">
        <p className="font-mono text-mono-sm uppercase text-callout-ink-muted">
          {party.label}
        </p>
        <p className="mt-0.5 text-body-sm font-semibold text-callout-ink">{party.role}</p>
        <p className="mt-1 text-caption text-callout-ink-muted">{party.holds}</p>

        {/* The claim grows the panel rather than floating beside it: the words
            belong to this party, and the dispute then reads as two boxes
            talking past each other with the evidence sitting between them.

            0fr→1fr is the one height transition that works without knowing the
            content height in advance. */}
        {claim && (
          <div
            className="grid transition-all"
            style={{
              gridTemplateRows: showClaim ? "1fr" : "0fr",
              opacity: showClaim ? 1 : 0,
              transitionDuration: "var(--duration-slow)",
              transitionTimingFunction: "var(--ease-out-quart)",
            }}
          >
            <div className="overflow-hidden">
              {/* Red on both sides. Neither account is the true one — that is
                  the whole difficulty — so neither gets to look like it. The
                  colour marks the dispute, not a verdict on who is lying.

                  Safe inside a theme-invariant panel: --failed is defined once
                  and only its tint is remapped per theme. */}
              <p className="mt-2 border-t border-callout-border pt-2 text-body-sm font-semibold italic text-failed">
                “{claim}”
              </p>
            </div>
          </div>
        )}
      </div>
    </AnnotationPanel>
  );
}

/* How far the held certificates ride up over their party's panel. Roughly a
   fifth of a tile's height — enough to read as attached, not so much that the
   codes start covering the copy. */
const CERT_OVERLAP = "0.7rem";

/* One crop for every view of the saloon — the callout and both certificates.
   The pair only proves anything if the two frames are identical apart from
   the damage, and a crop is part of the frame. */
const SALOON_CROP = "50% 66%";

/* The record is the photograph, so the photograph gets the whole card and the
   metadata sits on it. Short enough that two of these plus the panel around
   them do not bury the vessel they are describing. */
const CERT_RATIO = "2 / 1";

/** A live channel between the record and a party holding a copy of it.
 *
 *  Deliberately unlike a leader. Leaders are white hairlines that point at
 *  something and stop; this is accent, dashed and always moving, because it
 *  is making a different claim — not "here is the thing" but "you can look at
 *  the thing whenever you like". Two paths again, a soft wide one under a
 *  bright thin one, which is how the glow is done without a filter.
 *
 *  The curve leaves vertically and arrives horizontally. That is what makes
 *  it read as plumbing between two boxes rather than as an arrow between two
 *  points: it departs the way a cable leaves a socket, and meets the record
 *  square on its side. */
function AccessLinks({
  links,
  on,
}: {
  links: {
    id: string;
    side: "left" | "right";
    from: { x: number; y: number };
    to: { x: number; y: number };
  }[];
  on: boolean;
}) {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-30 h-full w-full"
      style={{ opacity: on ? 1 : 0, transition: "opacity var(--duration-slow)" }}
      aria-hidden
    >
      {links.map((l) => {
        const rise = Math.abs(l.from.y - l.to.y);
        const run = Math.abs(l.from.x - l.to.x);
        /* Control points, not magic numbers: the first straight up from the
           start so the curve leaves the box vertically, the second out to the
           side of the end so it arrives horizontally. */
        const c1 = { x: l.from.x, y: l.from.y - rise * 0.55 };
        const c2 = {
          x: l.to.x + (l.side === "left" ? -run * 0.45 : run * 0.45),
          y: l.to.y,
        };
        const d = `M ${l.from.x} ${l.from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${l.to.x} ${l.to.y}`;
        return (
          <g key={l.id}>
            <path
              d={d}
              fill="none"
              stroke="var(--fx-link-halo)"
              strokeWidth="5"
              strokeLinecap="round"
              className="trust-link"
            />
            <path
              d={d}
              fill="none"
              stroke="var(--fx-link)"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="trust-link"
            />
          </g>
        );
      })}
    </svg>
  );
}

/** ── The certificates a party holds ──
 *
 *  Deliberately identical for everyone. That is the whole content of the
 *  beat: the owner, the captain and the charterer end up holding the same
 *  record, and none of them is the one who keeps it. A version personalised
 *  per party would quietly say the opposite.
 *
 *  They fly in from the record panel rather than fading in place, because
 *  where they came FROM is the point. */
function HeldCertificates({
  issued,
  from,
}: {
  issued: (TrustCapture | undefined)[];
  from?: { x: number; y: number }[];
}) {
  return (
    <div className="mt-2 flex gap-1.5">
      {issued.map((cert, i) => (
        <div
          key={i}
          /* Wide enough for "Redelivery" at this size. The two tiles are one
             fixed width whatever they say, because they are copies of the
             same thing and a pair of different-sized cards would not read
             that way. */
          className="flex w-[4.4rem] flex-col items-center gap-1"
          style={{
            opacity: cert ? 1 : 0,
            /* Lands where it belongs; starts where it was issued. */
            transform: cert
              ? "translate(0, 0) scale(1)"
              : `translate(${from?.[i]?.x ?? 0}px, ${from?.[i]?.y ?? 0}px) scale(0.55)`,
            transition:
              "transform var(--duration-fly) var(--ease-out-quart), opacity var(--duration-normal) linear",
            /* The second a beat behind the first, so two certificates crossing
               the stage read as two and not as one thick line. */
            transitionDelay: cert ? `${i * 140}ms` : "0ms",
          }}
        >
          {/* The white sits tight around the code and nowhere else. A plate
              wide enough to hold the caption as well was mostly empty paper,
              and the label belongs to the certificate rather than being
              printed on it. */}
          <span className="relative block">
            {/* The channel's colour, breathing behind the code. Same token as
                the link, because it is the same thing arriving — a different
                accent here would read as an unrelated status light.

                No per-tile delay: in unison they read as one system with one
                heartbeat, which is the claim. Staggered they read as six
                independent status lights, which is not. */}
            <span
              aria-hidden
              className="trust-held-glow absolute -inset-1.5 rounded-sm"
              style={{ backgroundColor: "var(--fx-link)", filter: "blur(7px)" }}
            />
            <span className="relative block rounded-xs bg-callout-ink p-0.5">
              <img
                src="/assets/certificate-code.webp"
                alt=""
                width={128}
                height={128}
                loading="lazy"
                decoding="async"
                className="block h-9 w-9"
              />
            </span>
          </span>
          {/* Its own plate now that these float over the scene rather than
              sitting on a panel: mono at this size over a grid and a hull is
              otherwise unreadable half the time. */}
          <span
            className="rounded-xs px-1 py-0.5 font-mono text-mono-xs leading-none text-callout-ink"
            style={{ backgroundColor: "var(--callout-caption)" }}
          >
            {cert?.event ?? " "}
          </span>
        </div>
      ))}
    </div>
  );
}

/** The top slot's frame: a title row, then the evidence cards beneath it.
 *
 *  `trusted` is the whole distinction the piece turns on, so it is one prop
 *  and it changes three things at once — the mark on the title row, the
 *  border around the cards, and the weight of the type. A viewer should be
 *  able to tell the two apart at a glance and without reading. */
function RecordPanel({
  spec,
  on,
  width,
  boxRef,
  title,
  trusted,
  children,
}: {
  spec: { panel: StagePoint; align: Align };
  on: boolean;
  width: string;
  boxRef?: (el: HTMLElement | null) => void;
  title: string;
  trusted: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnnotationPanel spec={spec} on={on} width={width} boxRef={boxRef} className="z-20">
      <div className="p-2">
        <div className="flex items-center gap-2.5 px-0.5">
          {trusted ? (
            <PanelLogo className="h-3.5 w-[50px] shrink-0" />
          ) : (
            <span className="shrink-0 rounded-xs border border-callout-border px-1.5 py-0.5 font-mono text-mono-xs uppercase text-callout-ink-muted">
              Unverified
            </span>
          )}
          <p
            className={cn(
              "text-caption",
              trusted ? "text-callout-ink" : "text-callout-ink-muted",
            )}
          >
            {title}
          </p>
        </div>

        <div className="mt-2 grid gap-2 sm:auto-cols-fr sm:grid-flow-col">
          {children}
        </div>
      </div>
    </AnnotationPanel>
  );
}

/** One frame of evidence. Identical construction whoever it came from —
 *  deliberately, because the photograph really is the same photograph. Only
 *  the border and the stamp underneath it say where it came from. */
function EvidenceCard({
  cert,
  tone,
  trusted,
  codeRef,
}: {
  cert?: TrustCapture;
  tone: "verified" | "failed";
  trusted: boolean;
  /** Reports where this card's code sits, so the copies handed to the
   *  parties can fly out of it. */
  codeRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border transition-opacity",
        !trusted && "border-dashed",
      )}
      style={{
        borderColor:
          cert && trusted ? "var(--fx-accent-glow)" : "var(--callout-border)",
        opacity: cert ? 1 : 0.25,
        transitionDuration: "var(--duration-normal)",
      }}
    >
      {/* The frame the record holds, not a description of it. The empty box is
          always rendered so the panel does not change height when the second
          capture lands — the comparison should slide into place beside the
          first, not shove it upward. */}
      {cert ? (
        <PanelImage
          name={cert.image}
          alt={cert.imageAlt}
          width={1358}
          height={1530}
          position={SALOON_CROP}
          sizes="(min-width: 640px) 300px, 45vw"
          ratio={CERT_RATIO}
        />
      ) : (
        <div
          aria-hidden
          className="w-full bg-callout-halo"
          style={{ aspectRatio: CERT_RATIO }}
        />
      )}

      {/* The metadata belongs ON the photograph, the way a timestamp burned
          into a frame does — it is a property of that image, not a caption
          filed beneath it. */}
      <div
        className="absolute bottom-1.5 left-1.5 rounded-sm px-1.5 py-1"
        style={{ backgroundColor: "var(--callout-caption)" }}
      >
        <div className="flex items-center gap-1.5">
          {/* A bar, not a dot. Round markers on this stage mean "the end of a
              connector"; a small circle sitting in a caption with no line
              attached reads as one that has lost its leader. */}
          <span
            className={cn(
              "h-2.5 w-0.5 shrink-0 rounded-xs",
              tone === "verified" ? "bg-verified" : "bg-failed",
            )}
            aria-hidden
          />
          <span className="font-mono text-mono-xs text-callout-ink">
            {cert?.label ?? "—"}
          </span>
        </div>
        <p
          className={cn(
            "font-mono text-mono-xs",
            trusted ? "text-callout-ink-muted" : "text-failed",
          )}
        >
          {cert?.stamp ?? " "}
        </p>
      </div>

      {/* The code on the frame it certifies — the same code the parties are
          each handed a copy of. Only on a verified card: a photograph with
          nothing standing behind it has no certificate to carry, and putting
          one there would say it did. */}
      {trusted && (
        <span
          ref={codeRef}
          /* Mounted from the start, not from when the certificate is issued:
             the held copies fly FROM here, and a source that does not exist
             until the moment of departure has no position to depart from. */
          className="absolute bottom-1.5 right-1.5 transition-opacity"
          style={{
            opacity: cert ? 1 : 0,
            transitionDuration: "var(--duration-normal)",
          }}
        >
          {/* Lit the same way as the copies it issues — same token, same
              pulse. It is the source of the channel, so it should not look
              like a colder version of what came out of it. */}
          <span className="relative block">
            <span
              aria-hidden
              className="trust-held-glow absolute -inset-1.5 rounded-sm"
              style={{ backgroundColor: "var(--fx-link)", filter: "blur(7px)" }}
            />
            <span className="relative block rounded-xs bg-callout-ink p-0.5">
              <img
                src="/assets/certificate-code.webp"
                alt=""
                width={128}
                height={128}
                loading="lazy"
                decoding="async"
                className="block h-8 w-8"
              />
            </span>
          </span>
        </span>
      )}
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
