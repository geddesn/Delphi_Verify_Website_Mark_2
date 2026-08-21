import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { acts, trustEngineCopy } from "@/content/trust-scenes";
import type {
  StageGround,
  StagePoint,
  TrustCapture,
  TrustParty,
  TrustScene,
  TrustSurveyShot,
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
  /* ── THE TITLE CARD ──
     Five seconds of who this is and what it is about, before anything moves.
     A piece that opens mid-story has no beginning, and a viewer who arrives
     part-way through has nothing to catch up on. */
  { id: "intro-logo", ms: 1500 },
  { id: "intro-line", ms: 1500 },
  { id: "intro-study", ms: 2000 },
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
  /* ⭐ THE ONE DIFFERENCE, and it gets eight beats rather than one.
     "Her condition is recorded first" used to be a single step in which a
     finished certificate simply appeared, which asked a viewer to take the
     most important claim in the piece on trust. This walks the vessel: one
     ordinary photograph at a time, each pointing at where it was taken, all
     of them filed before anybody has a reason to argue. The saloon is last,
     and is the frame the record keeps. */
  { id: "a2-shot-1", ms: 520 },
  { id: "a2-shot-2", ms: 520 },
  { id: "a2-shot-3", ms: 520 },
  { id: "a2-shot-4", ms: 520 },
  { id: "a2-shot-5", ms: 520 },
  { id: "a2-shot-6", ms: 520 },
  { id: "a2-shot-7", ms: 520 },
  { id: "a2-shot-8", ms: 900 }, // the saloon, held a beat longer
  { id: "a2-file", ms: 1500 },  // the pile goes into the record
  { id: "a2-capture", ms: 1500 }, // …and the record is what is left
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

/* The survey's length is a property of the NARRATIVE, not of the scene: the
   beats are written out in STEPS above, so the count lives here and a scene
   supplying a different number of shots is a mistake rather than a silent
   truncation. Resolved once, because at() answers 0 for an id it does not
   know and a survey silently gated on step zero would be very hard to see. */
const SURVEY_SHOTS = 8;
const SHOT_STEPS = Array.from({ length: SURVEY_SHOTS }, (_, i) =>
  at(`a2-shot-${i + 1}`),
);

/* ── Derived state — every visual is one of these ──────────────────────── */
const s = {
  act: (n: number) => (n < TURN ? 1 : n === TURN ? 0 : 2),

  /* The title card, and the two lines that arrive under it. Nothing else is
     on the stage while these are — not the vessel, not the act marker. */
  intro: (n: number) => n < at("a1-asset"),
  introLine: (n: number) => n >= at("intro-line") && n < at("a1-asset"),
  introStudy: (n: number) => n >= at("intro-study") && n < at("a1-asset"),

  /** A party is on from the step they enter, for the rest of that act. */
  party: (p: TrustParty, n: number) =>
    (n >= at(p.enters.one) && n < TURN) || n >= at(p.enters.two),

  /** ...but their LEADER is only up while they are being introduced.
   *
   *  A leader's job is to say which of these boxes belongs to which part of
   *  the vessel. Once it has said that, it is a line across the picture — and
   *  by the end of Act Two there is a record panel, an evidence channel and
   *  two sets of certificates competing for the same space. So each one
   *  retracts once the introductions are over, and the stage is left to the
   *  things that are still saying something.
   *
   *  The last introduction in each act is the one that ends it: everyone is
   *  on by the time the handover happens. */
  partyLeader: (p: TrustParty, n: number) =>
    (n >= at(p.enters.one) && n < at("a1-delivery")) ||
    (n >= at(p.enters.two) && n < SHOT_STEPS[0]),

  /* ── The survey ──
     Two states per shot, and they are not the same thing. `shotLive` is the
     one being taken right now — big, captioned, with a leader down to the
     part of the vessel it shows. `shotFiled` is every shot taken so far,
     which stays on the stage as a thumbnail in a growing pile. The pile is
     the argument: by the eighth beat there are eight photographs of one
     morning sitting there before anyone has a reason to want them. */
  shotLive: (n: number, i: number) => n === SHOT_STEPS[i],
  /* From the MOMENT it is taken, not from the beat after. The thumbnail
     leaves the card while the card is still showing it, which is the gesture:
     a photograph is taken and a copy of it drops onto the pile. Wait a beat
     and the copy appears from nowhere instead. */
  shotFiled: (n: number, i: number) => n >= SHOT_STEPS[i],
  /** The record shows its empty grid from the moment it opens until it
   *  resolves to the frame the argument is actually about. */
  collecting: (n: number) => n >= at("a2-captain") && n < at("a2-capture"),

  /* Act One's occupant of the top slot: the photograph one side happens to
     have. Never in Act Two, where the record has the slot instead — the two
     are mutually exclusive by construction, which is the point. */
  ownerPhoto: (n: number) => n >= at("a1-photo") && n < TURN,
  /* OPEN AND EMPTY from the moment the captain arrives, which is a beat
     before the first capture. The captures have to have somewhere to go: a
     photograph flying to a point on a bare stage is a photograph flying into
     nothing, and the viewer has to be told afterwards that a record was
     being made. An empty certificate sitting there says it in advance, and
     then the survey visibly fills it. */
  delphi: (n: number) => n >= at("a2-captain"),

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

/* ── THE DESIGN CANVAS ────────────────────────────────────────────────────
   Everything inside the stage is laid out against a FIXED 1120x630 canvas
   which is then scaled to whatever size the stage actually is.

   The stage was a mix of two coordinate systems: percentages, which scale
   with the frame, and pixels — panel min-widths, type sizes, certificate
   tiles, padding — which do not. At the size it was tuned at that looked
   deliberate. Render the same markup at 1920 and every fixed thing stays put
   while the frame grows around it, so the panels shrink into the corners and
   the middle empties out.

   One transform fixes all of it at once, and it means the piece looks
   identical at 900px, in a 1080p recording, and on whatever comes next —
   there is only ever one layout to reason about.

   1120x630 rather than a rounder number because that is the width the stage
   renders at on a desktop page, which is where every position in this file
   was judged by eye. */
const DESIGN_W = 1120;
const DESIGN_H = 630;

/* useLayoutEffect warns when React renders on the server, where there is
   nothing to measure — the fallback scale of 1 is the server's answer. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** How much to scale the canvas by, and how tall it has to be in canvas units
 *  to fill the frame. Height is derived rather than fixed because the frame is
 *  16:10 on a phone and 16:9 above it — the canvas stretches to match instead
 *  of letterboxing. */
function useStageScale(ref: React.RefObject<HTMLElement | null>) {
  const [box, setBox] = useState({ scale: 1, height: DESIGN_H });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      const scale = w / DESIGN_W;
      const height = h / scale;
      setBox((prev) =>
        Math.abs(prev.scale - scale) < 0.0005 && Math.abs(prev.height - height) < 0.5
          ? prev
          : { scale, height },
      );
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return box;
}

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
  const frameRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scale, height: canvasH } = useStageScale(frameRef);
  const timer = useRef<number | undefined>(undefined);

  /* The panels report their own footprint, so a leader starts on the real
     edge of its box. Matters most for the counterparties, which grow when
     their claim surfaces during the dispute. */
  const { boxes, register, measure } = useBoxes(stageRef);

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

  /* Re-measure on every beat.
     The step is what drives the layout here — a claim opens, an outcome list
     appears, a column re-centres — and a ResizeObserver does not see a panel
     that has only MOVED. Without this the certificates and the access links
     keep pointing at where the charterer used to be. */
  useEffect(() => {
    measure();
  }, [step, measure]);

  const act = s.act(step);
  const { incident, record } = scene;

  /* Which capture is being taken on this beat, if any. Resolved by index
     rather than searched for by id, so a scene carrying more shots than the
     narrative has beats simply never shows the extra ones — SHOT_STEPS is
     undefined past SURVEY_SHOTS and every comparison against it is false. */
  const liveShot = scene.survey.findIndex((_, i) => s.shotLive(step, i));
  const shot = liveShot >= 0 ? scene.survey[liveShot] : undefined;
  const showRecord = s.delphi(step);
  const showOwnerPhoto = s.ownerPhoto(step);

  /* The canvas's own dimensions, for anything expressing a distance in pixels
     rather than as a percentage. */
  const CANVAS = { w: DESIGN_W, h: canvasH };

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
        on: s.partyLeader(p, step),
      };
    }),
    {
      /* ONE leader for all eight captures, not eight. It is the same card
         each time and only the far end moves, so a viewer reads it as a
         camera being walked round the vessel rather than as eight separate
         claims being made at once. Kept mounted with the anchor of whichever
         shot is live, so it draws once at the first capture and retracts once
         after the last instead of redrawing on every beat. */
      id: "survey-card",
      panel: SURVEY_CARD.panel,
      align: SURVEY_CARD.align,
      anchor: (shot ?? scene.survey[scene.survey.length - 1]).anchor,
      box: SURVEY_CARD.box,
      from: "left",
      on: !!shot,
    },
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
      /* Not `showRecord`. The panel is now on stage for the whole survey
         with nothing in it, and a leader from an empty box to a point on the
         hull claims a connection that does not exist yet — while competing
         with the survey's own leader for the same stretch of stage. It
         appears when the record actually holds the saloon. */
      on: s.deliveryCert(step) || showOwnerPhoto,
    },
  ];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* The FRAME holds the shape and the border; the STAGE inside it is a
          fixed canvas scaled to fit. Nothing below this line knows what size
          it is being drawn at — see DESIGN_W. */}
      <div
        ref={frameRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line-strong transition-[filter] md:aspect-[16/9]"
        style={{
          /* Act One ends drained of colour. The freeze is the point. */
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

        {/* ── The asset, centre ──
            A cut-out on the bare stage: no frame, nothing behind it. The
            master carries a real alpha channel and sharp keeps it all the way
            into WebP, so there is nothing to mask here.

            It brings its OWN water — a feathered patch of sea around the
            waterline, only about thirty pixels of which fall below the hull.

            WIDTH AND TOP ARE SET FROM THE HULL, not from the box. This render
            carries more vertical extent than the one it replaced (a taller
            mast in frame), so matching the box would have moved the waterline.
            44% and 54% instead put the bow, the stern and the waterline back
            exactly where they were and let the mast run higher, which is the
            part nothing else on the stage is measured against. */}
        <div
          className="absolute left-1/2 top-[61%] w-[44%] -translate-x-1/2 -translate-y-1/2 transition-opacity"
          style={{
            opacity: s.intro(step) ? 0 : step === TURN ? 0.35 : 1,
            /* The vessel arriving as the title card leaves is a dissolve
               between two scenes, not a state change within one, so it gets
               the longer duration. Everything later — the dimming at the
               turn — stays at UI speed. */
            transitionDuration:
              step <= at("a1-asset")
                ? "var(--duration-cross)"
                : "var(--duration-slow)",
          }}
        >
          <img
            src={`/assets/features/${scene.asset}-960.webp`}
            srcSet={`/assets/features/${scene.asset}-480.webp 480w, /assets/features/${scene.asset}-960.webp 960w`}
            sizes="(min-width: 1024px) 500px, 55vw"
            alt={scene.assetAlt}
            width={925}
            height={564}
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

            {/* The tally, under the last party on this side. IN FLOW, not
                positioned: the column centres whatever it is given, so the
                panel above simply rides up to make room and comes back down
                when the list empties. Nothing here has to know how tall it
                got. */}
            {side === OUTCOME_SIDE && (
              <OutcomeList
                items={
                  act === 2 ? scene.resolved.outcomes : scene.unresolved.outcomes
                }
                tone={act === 2 ? "verified" : "failed"}
                on={act === 2 ? s.compare(step) : s.dispute(step)}
                /* Clearing the certificates, which overlap the panel above
                   without taking any room in the flow — so this margin is the
                   only thing keeping the two apart, and it has to cover the
                   whole tile: code, gap and caption plate, less the overlap. */
                className={act === 2 ? "mt-16" : "mt-3"}
              />
            )}
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
            if (!rr) return [];
            const pr = rectOf(p);
            const left = p.side === "left";
            /* Percentages everywhere else on this stage, but a path's `d` only
               accepts user units — and with no viewBox those are CSS pixels.
               Hence the conversion here rather than in the component. */
            /* Canvas units, not screen pixels — the path is drawn inside the
               scaled canvas, so a screen measurement would be multiplied by
               the scale a second time. */
            const px = (x: number) => (x / 100) * DESIGN_W;
            const py = (y: number) => (y / 100) * canvasH;
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
                      flightOrigin(boxes["code-delivery"], r, CANVAS),
                      flightOrigin(boxes["code-redelivery"], r, CANVAS),
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
          /* deliveryCert, not showRecord. The record now opens a beat before
             the survey starts and stands there empty, and a marker on the
             hull with nothing attached to it is a dot the viewer has to
             explain to themselves. It lands when the record actually holds
             the saloon. */
          on={s.incident(step) || showOwnerPhoto || s.deliveryCert(step)}
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
          <div className="min-w-0 flex-1">
            <EvidenceCard
              cert={record.unverified.capture}
              tone="failed"
              trusted={false}
            />
          </div>
        </RecordPanel>

        {/* ONE CARD, THEN TWO — the panel widens rather than holding an
            empty slot open from the start.

            An empty frame beside the first capture promises a second one
            before there is any reason to expect it, and reads as a template
            waiting to be filled. Growing at the moment the second capture is
            taken says something happened. The width is inline rather than a
            class because it has to be a value a transition can interpolate. */}
        <RecordPanel
          spec={record}
          on={showRecord}
          width=""
          style={{
            width: s.redeliveryCert(step) ? "min(52%, 34rem)" : "min(27%, 17.5rem)",
            transition: "width var(--duration-cross) var(--ease-out-quart)",
          }}
          boxRef={register("record-verified")}
          title={
            s.deliveryCert(step) ? record.verified.title : record.verified.pending
          }
          trusted
        >
          {/* TWO LAYOUTS IN ONE BOX, cross-faded.
              The record is a grid of nine frames while it is being filled and
              a pair of evidence cards once it is being read — the same object
              at two moments, not two panels.

              THE CARDS OWN THE HEIGHT and the grid is laid over them, out of
              flow. Stacked in flow instead, the grid went on claiming its own
              height after it had faded out — and once the panel widens for
              two cards side by side those are half the width and so half the
              height, while a full-width 3x3 is not. The panel ended up twice
              as tall as its contents, with a band of empty navy under them. */}
          <div className="relative min-w-0 flex-1">
            <div
              className="flex gap-2 transition-opacity"
              style={{
                opacity: s.deliveryCert(step) ? 1 : 0,
                transitionDuration: "var(--duration-slow)",
              }}
            >
              <div className="min-w-0 flex-1">
                <EvidenceCard
                  cert={s.deliveryCert(step) ? record.verified.delivery : undefined}
                  tone="verified"
                  trusted
                  codeRef={register("code-delivery")}
                />
              </div>
              {/* Always mounted, so its code has a position for the held
                  copies to fly out of — but with no width until the capture
                  is taken. It opens over the same duration the panel
                  widens. */}
              <div
                className="min-w-0 overflow-hidden"
                style={{
                  flex: s.redeliveryCert(step) ? "1 1 0%" : "0 0 0%",
                  opacity: s.redeliveryCert(step) ? 1 : 0,
                  transition:
                    "flex var(--duration-cross) var(--ease-out-quart), opacity var(--duration-slow) linear",
                }}
              >
                <EvidenceCard
                  cert={record.verified.redelivery}
                  tone="failed"
                  trusted
                  codeRef={register("code-redelivery")}
                />
              </div>
            </div>

            <div
              className="pointer-events-none absolute inset-x-0 top-0 transition-opacity"
              style={{
                opacity: s.collecting(step) ? 1 : 0,
                transitionDuration: "var(--duration-slow)",
              }}
            >
              <RecordGrid gridRef={register("record-grid")} />
            </div>
          </div>
        </RecordPanel>

        {/* ── The survey ──
            The card stands where the charterer will later stand, and the
            pile builds in the opposite corner. Both are gone by the time the
            record opens: what is left on the stage is the one frame out of
            eight that anybody ever has cause to look at again. */}
        <SurveyCard
          shot={shot}
          index={liveShot}
          count={scene.survey.length}
          on={!!shot}
          boxRef={register("survey-card")}
          frameRef={register("survey-frame")}
        />
        <SurveyFlight
          shots={scene.survey}
          taken={(i) => s.shotFiled(step, i)}
          on={s.collecting(step)}
          frameRect={boxes["survey-frame"]}
          gridRect={boxes["record-grid"]}
          canvas={CANVAS}
        />

        {/* ── The title card ──
            One thing at a time, a beat and a half apart: the mark, then what
            it is for, then what this particular run is. Centred and alone —
            the vessel is held back until it is over, so there is nothing to
            read but this. */}
        <TitleCard
          on={s.intro(step)}
          line={trustEngineCopy.intro}
          lineOn={s.introLine(step)}
          study={scene.study}
          studyOn={s.introStudy(step)}
        />

        {/* ── The narration ──
            Down here on the floor, below the vessel, where the stage is empty
            and nothing has to move aside for it. It reads as the caption to
            the scene rather than a headline over it — and it is the one thing
            on the stage that changes on every beat, so it wants to be
            somewhere the eye can rest, not somewhere it competes.

            min-h with justify-end pins the BOTTOM: the block grows upward as
            lines wrap, so a two-line title does not shove the one-line title's
            baseline around between steps. */}
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
        {/* Right-aligned on the same row rather than above the frame, which is
            where these started. Three chapter buttons stacked over the stage
            read as a toolbar and made the piece look like something to be
            operated; down here beside Replay they are what they are — transport
            controls, available to anyone who wants them, in nobody's way. */}
        <ChapterBar step={step} onJump={playFrom} reduced={reduced} className="ml-auto" />
      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

function ChapterBar({
  step,
  onJump,
  reduced,
  className,
}: {
  step: number;
  onJump: (n: number) => void;
  reduced: boolean;
  className?: string;
}) {
  /* Thirty-three seconds is a long time to ask for. Chapters let a viewer go
     straight to the comparison, which is the part that actually argues. */
  /* By id, like every other reference to a beat. This was `at: 11` and adding
     the title card silently re-pointed it into the middle of Act One — the
     exact failure the gates were moved off indices to avoid, left behind here
     because a chapter button looks like configuration rather than code. */
  const chapters = [
    { label: acts.one.marker, at: at("intro-logo") },
    { label: acts.turn.marker, at: at("turn") },
    { label: acts.two.marker, at: at("a2-asset") },
  ];
  if (reduced) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
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

/* ── THE SURVEY'S GEOMETRY ────────────────────────────────────────────────
   The card showing the shot being taken stands in the RIGHT column, which is
   empty for the whole of the survey — the charterer does not arrive until the
   record already exists, and that is the entire claim of Act Two. Using their
   space to make the record says so without a word of copy.

   The pile goes top-left, as far from the card as the stage allows, so the
   flight into the record at the end is a journey across the stage rather than
   a shrink in place. */
const SURVEY_CARD = {
  /* TOP right, and big. It sat mid-height in the counterparty column at the
     width of a party panel, which made it one more box in a row of boxes —
     and the thing it is showing is the only thing happening on the stage for
     eight beats. Up in the corner at half again the size it is a monitor
     rather than an annotation, and it pairs across the top with the pile
     filling up opposite it: taken on the right, filed on the left. */
  panel: { x: 96, y: 4 } as StagePoint,
  align: "top-right" as Align,
  width: "w-[30%] min-w-[264px]",
  /* Fallback footprint only — the card is measured. */
  box: { w: 30, h: 33 } as Box,
};

/* The waiting certificate's contents: a grid of empty frames that the survey
   fills, left to right and then down.

   The captures used to gather in a fanned pile in the opposite corner and go
   in together at the end, which put them in mid-air for eight beats — flying
   to a spot on a bare stage, with nothing there to receive them. Straight
   into the record is both simpler and truer: every photograph is in the
   record from the moment it is taken, which is the entire claim.

   Nine cells for eight shots. The hole in the last one is not a mistake and
   is worth leaving: a record with room in it reads as open, and this one is —
   redelivery is two weeks away and nobody yet knows there will be anything
   else to put in it. */
const GRID_COLS = 3;
const GRID_CELLS = 9;
const GRID_GAP = 4; // canvas px

/** One cell of the record's grid, in stage percentages, derived from the
 *  measured grid rather than authored — so it stays exact whatever the panel
 *  ends up being sized at. */
function cellRect(grid: Rect, i: number, canvas: { w: number; h: number }) {
  const gapX = (GRID_GAP / canvas.w) * 100;
  const gapY = (GRID_GAP / canvas.h) * 100;
  const rows = GRID_CELLS / GRID_COLS;
  /* BOTH axes off the measured rect. Deriving the height from the width and
     CERT_RATIO would be a second, independent opinion about the cell's shape
     — and the grid's own rows are the one that is actually on screen. */
  const w = (grid.w - gapX * (GRID_COLS - 1)) / GRID_COLS;
  const h = (grid.h - gapY * (rows - 1)) / rows;
  return {
    x: grid.x + (i % GRID_COLS) * (w + gapX),
    y: grid.y + Math.floor(i / GRID_COLS) * (h + gapY),
    w,
    h,
  };
}

/* How far the held certificates ride up over their party's panel. Roughly a
   fifth of a tile's height — enough to read as attached, not so much that the
   codes start covering the copy. */
const CERT_OVERLAP = "0.7rem";

/* One crop for every view of the saloon — the callout and both certificates.
   The pair only proves anything if the two frames are identical apart from
   the damage, and a crop is part of the frame.

   It used to do far more work than it does now. The old masters were 1358×1530
   and this threw away most of them to reach 2:1; the current pair is 882×496,
   near enough 2:1 already that the crop trims about a ninth of the height. The
   value is kept rather than reset to centre because the bias is still the
   right one — it holds the ceiling cove, which is what reads as "yacht
   interior" at 300px, and keeps the torn cushion clear of the bottom edge. */
const SALOON_CROP = "50% 66%";

/* The record is the photograph, so the photograph gets the whole card and the
   metadata sits on it. Short enough that two of these plus the panel around
   them do not bury the vessel they are describing. */
const CERT_RATIO = "2 / 1";

/* Which column carries the tally. The counterparty's, deliberately: these are
   the consequences for the side that is exposed if the account turns out to be
   wrong, and they belong beside them rather than floating under the stage. */
const OUTCOME_SIDE: "left" | "right" = "right";

/** How each act ends, itemised.
 *
 *  Two lists that mirror each other line for line, so reading down one and
 *  then the other shows the same three subjects coming out the opposite way.
 *  Ticks and crosses rather than bullets, because the point is not that these
 *  are three items — it is that they went well or they did not. */
function OutcomeList({
  items,
  tone,
  on,
  className,
}: {
  items: readonly string[];
  tone: "verified" | "failed";
  on: boolean;
  className?: string;
}) {
  return (
    <ul className={cn("flex w-full flex-col gap-2", className)}>
      {items.map((o, i) => (
        <li
          key={o}
          className="flex gap-2 text-caption text-ink-secondary"
          style={{
            opacity: on ? 1 : 0,
            transform: on ? "none" : "translateY(6px)",
            transition:
              "opacity var(--duration-normal) linear, transform var(--duration-normal) var(--ease-out-quart)",
            /* Down the list rather than all at once: three things arriving
               together is a block of text, three things arriving in order is
               a tally being read out. */
            transitionDelay: on ? `${i * 130}ms` : "0ms",
          }}
        >
          <OutcomeMark tone={tone} />
          <span>{o}</span>
        </li>
      ))}
    </ul>
  );
}

function OutcomeMark({ tone }: { tone: "verified" | "failed" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={cn(
        "mt-0.5 h-3.5 w-3.5 shrink-0",
        tone === "verified" ? "text-verified" : "text-failed",
      )}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {tone === "verified" ? (
        <path d="m3 8.5 3.2 3.2L13 5" />
      ) : (
        <path d="m4 4 8 8M12 4l-8 8" />
      )}
    </svg>
  );
}

/** The opening title card.
 *
 *  Each line is held back by its own gate rather than a CSS delay, so the
 *  timing lives in the step machine with everything else — and jumping to a
 *  chapter lands on a coherent frame instead of halfway through an animation
 *  that was counting from mount. */
function TitleCard({
  on,
  line,
  lineOn,
  study,
  studyOn,
}: {
  on: boolean;
  line: string;
  lineOn: boolean;
  study: string;
  studyOn: boolean;
}) {
  const rise = (shown: boolean) => ({
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : "translateY(10px)",
    transition:
      "opacity var(--duration-slow) linear, transform var(--duration-slow) var(--ease-out-quart)",
  });

  return (
    <div
      aria-hidden={!on}
      className={cn(
        "pointer-events-none absolute inset-0 z-40 flex flex-col items-center justify-center gap-5 px-6 text-center transition-opacity",
        !on && "opacity-0",
      )}
      /* Out over the same span the vessel comes in over, so the two are one
         dissolve rather than a fade-out followed by a fade-in. */
      style={{ transitionDuration: "var(--duration-cross)" }}
    >
      {/* The mark itself, not the wordmark-in-a-panel version: on the stage
          rather than on a callout, so it takes the stage's ink. */}
      {/* Both axes together: maskSize:contain keeps the mark's ratio inside
          the box, so changing one alone just leaves dead space. */}
      <PanelLogo className="h-[104px] w-[364px]" color="var(--ink)" />
      <p className="text-heading text-ink md:text-display" style={rise(lineOn)}>
        {line}
      </p>
      <p
        className="font-mono text-mono uppercase tracking-wide text-ink-secondary"
        style={rise(studyOn)}
      >
        {study}
      </p>
    </div>
  );
}

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

/** The shot being taken, right now.
 *
 *  One card for all eight, with its contents keyed by image so each arrival
 *  is a mount rather than a swap — see .trust-shot-in in theme.css for why
 *  that matters. The card itself never moves, so the eye stays on one spot
 *  and only the picture, the caption and the leader change under it.
 *
 *  The counter is not decoration. It says the survey is systematic and
 *  finite: a viewer who sees "3 / 8" knows there are five more coming and
 *  reads the sequence as a procedure rather than as a slideshow. */
function SurveyCard({
  shot,
  index,
  count,
  on,
  boxRef,
  frameRef,
}: {
  shot?: TrustSurveyShot;
  index: number;
  count: number;
  on: boolean;
  boxRef?: (el: HTMLElement | null) => void;
  /** Reports the frame itself, not the card around it — the flight into the
   *  record starts on the photograph, and starting it on the panel would put
   *  the header row's height into the vector. */
  frameRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <AnnotationPanel
      spec={{ panel: SURVEY_CARD.panel, align: SURVEY_CARD.align }}
      on={on}
      width={SURVEY_CARD.width}
      boxRef={boxRef}
      className="z-20"
    >
      <div className="p-2">
        <div className="flex items-center gap-2 px-0.5">
          <PanelLogo className="h-3.5 w-[50px] shrink-0" />
          <p className="min-w-0 flex-1 text-caption text-callout-ink">
            {trustEngineCopy.survey}
          </p>
        </div>

        {/* The accent border is the same one the verified evidence cards
            carry. These ARE that evidence — it is simply being made rather
            than being quoted, and a different treatment here would suggest
            something changed between the taking and the keeping. */}
        <div
          ref={frameRef}
          className="relative mt-2 overflow-hidden rounded-sm border"
          style={{ borderColor: "var(--fx-accent-glow)" }}
        >
          {shot && (
            <div key={shot.image} className="trust-shot-in">
              <PanelImage
                name={shot.image}
                alt={shot.imageAlt}
                width={882}
                height={496}
                /* CERT_RATIO, like every other view of a survey frame. The
                   preview, the cell it flies into and the record card it may
                   become are the same photograph cropped the same way — a
                   frame that changes shape on the way in is a different
                   frame, and this piece is careful about that everywhere
                   else. */
                ratio={CERT_RATIO}
                sizes="(min-width: 640px) 320px, 45vw"
              />
              {/* Top left, like every other frame on this stage, and for the
                  same reason: the caption is a property of the photograph. */}
              <div
                className="absolute left-1.5 top-1.5 rounded-sm px-1.5 py-1"
                style={{ backgroundColor: "var(--callout-caption)" }}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2.5 w-0.5 shrink-0 rounded-xs bg-verified"
                  />
                  <span className="font-mono text-mono-xs text-callout-ink">
                    {shot.label}
                  </span>
                </div>
                <p className="font-mono text-mono-xs text-callout-ink-muted">
                  {shot.stamp}
                </p>
              </div>
              {/* On the frame, opposite the caption. It was in the header row
                  beside the mark, where the three of them did not fit and the
                  title truncated to "Conditio…" — and it belongs here anyway:
                  a frame number is a property of the shot, like the room and
                  the time, not of the panel holding it. */}
              <p
                className="absolute bottom-1.5 right-1.5 rounded-sm px-1.5 py-0.5 font-mono text-mono-xs text-callout-ink"
                style={{ backgroundColor: "var(--callout-caption)" }}
              >
                {Math.min(index + 1, count)} / {count}
              </p>
            </div>
          )}
        </div>
      </div>
    </AnnotationPanel>
  );
}

/** The record's empty frames, waiting.
 *
 *  Rendered INSIDE the panel and measured, so the photographs flying in know
 *  exactly where each cell is; the flight itself happens on a layer above the
 *  stage, because this panel clips its contents and a capture crossing the
 *  stage inside it would be invisible until the instant it landed. */
function RecordGrid({ gridRef }: { gridRef?: (el: HTMLElement | null) => void }) {
  return (
    <div
      ref={gridRef}
      className="grid gap-1"
      /* The GRID carries the card's ratio and the cells divide what is left,
         rather than each cell carrying it and the grid adding up. Nine 2:1
         cells plus two gaps come to a gap taller than one 2:1 card, every
         time and by construction — so a grid built that way can never sit
         exactly where the card it replaces sits. The cells come out at about
         2.06:1 instead, which is not a difference anyone can see. */
      style={{
        aspectRatio: CERT_RATIO,
        gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${GRID_CELLS / GRID_COLS}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: GRID_CELLS }, (_, i) => (
        <div
          key={i}
          className="rounded-xs border border-dashed border-callout-border"
          style={{ backgroundColor: "var(--callout-halo)" }}
        />
      ))}
    </div>
  );
}

/** Each capture going into the record, one at a time.
 *
 *  Straight from the frame on the preview card to its cell — no staging area,
 *  no gathering up at the end. The photograph is in the record from the beat
 *  it is taken, and a viewer watching the grid fill left to right is watching
 *  the claim being made rather than being told about it afterwards.
 *
 *  A layer of its own above everything, NOT inside the panel: the panel clips
 *  its contents so a photograph can sit flush to its edge, and a flight
 *  nobody can see is just a fade-in. Every cell is measured off the real
 *  grid, so the landing is exact at any stage size. */
function SurveyFlight({
  shots,
  taken,
  on,
  /** The frame on the preview card — where each photograph flies out of. */
  frameRect,
  /** The record's grid, measured. Nothing flies until this exists. */
  gridRect,
  canvas,
}: {
  shots: readonly TrustSurveyShot[];
  taken: (i: number) => boolean;
  on: boolean;
  frameRect?: Rect;
  gridRect?: Rect;
  canvas: { w: number; h: number };
}) {
  if (!gridRect || !canvas.w) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40">
      {shots.map((shot, i) => {
        const cell = cellRect(gridRect, i, canvas);
        /* Back to the preview card: the vector from this cell to the frame it
           was taken in, and how much bigger that frame is. Both in the cell's
           own terms, so one transform carries the whole journey. */
        const origin = frameRect
          ? {
              x:
                ((frameRect.x + frameRect.w / 2 - (cell.x + cell.w / 2)) / 100) *
                canvas.w,
              y:
                ((frameRect.y + frameRect.h / 2 - (cell.y + cell.h / 2)) / 100) *
                canvas.h,
              scale: frameRect.w / cell.w,
            }
          : { x: 0, y: 0, scale: 1 };
        const held = taken(i);

        return (
          <img
            key={shot.image}
            src={`/assets/features/${shot.image}-240.webp`}
            alt=""
            width={882}
            height={496}
            loading="lazy"
            decoding="async"
            className="absolute rounded-xs object-cover"
            style={{
              left: `${cell.x}%`,
              top: `${cell.y}%`,
              width: `${cell.w}%`,
              height: `${cell.h}%`,
              transform: held
                ? "none"
                : `translate(${origin.x}px, ${origin.y}px) scale(${origin.scale})`,
              opacity: on && held ? 1 : 0,
              transition:
                "transform var(--duration-fly) var(--ease-out-quart), opacity var(--duration-fast) linear",
            }}
          />
        );
      })}
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
  style,
  boxRef,
  title,
  trusted,
  children,
}: {
  spec: { panel: StagePoint; align: Align };
  on: boolean;
  width: string;
  style?: React.CSSProperties;
  boxRef?: (el: HTMLElement | null) => void;
  title: string;
  trusted: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnnotationPanel
      spec={spec}
      on={on}
      width={width}
      style={style}
      boxRef={boxRef}
      className="z-20"
    >
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

        {/* Flex, not grid.
            A grid re-columns in a single frame, so the moment a second card
            mounts the first one halves — while the panel around it is still a
            second into a 1.2s width transition. The card snaps, the panel
            glides, and the two disagree the whole way. Here the second child
            grows from nothing over the same span, so nothing jumps. */}
        <div className="mt-2 flex gap-2">{children}</div>
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
        /* Dashed while it is empty, whoever it belongs to. A slot with
           nothing in it is a slot waiting to be filled, and a dashed outline
           is the one convention that says so without a caption. */
        (!trusted || !cert) && "border-dashed",
      )}
      style={{
        borderColor:
          cert && trusted ? "var(--fx-accent-glow)" : "var(--callout-border)",
        /* 0.4, not 0.25. This used to be seen only on the second slot before
           redelivery, where it was deliberately easy to miss. It is now the
           open record waiting through the whole survey, which is something a
           viewer is meant to notice. */
        opacity: cert ? 1 : 0.4,
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
          width={882}
          height={496}
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
          filed beneath it.

          TOP left, not bottom. The saloon's seating runs along the lower half
          of the frame and the tear is on a seat cushion, so a caption in the
          bottom corner sat on the one detail the whole piece is about. The
          top-left of this crop is sea and window mullion — nothing to lose,
          and a dark plate reads well against it. */}
      {/* Only where there is something to caption. Empty, this rendered a
          bar and an em-dash on a plate — a label for a photograph that does
          not exist. */}
      {cert && (
      <div
        className="absolute left-1.5 top-1.5 rounded-sm px-1.5 py-1"
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
            {cert.label}
          </span>
        </div>
        <p
          className={cn(
            "font-mono text-mono-xs",
            trusted ? "text-callout-ink-muted" : "text-failed",
          )}
        >
          {cert.stamp}
        </p>
      </div>
      )}

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
