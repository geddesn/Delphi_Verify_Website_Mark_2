import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { acts, trustEngineCopy } from "@/content/trust-scenes";
import type {
  StageGround,
  StagePoint,
  TrustCapture,
  TrustParty,
  TrustActId,
  TrustScene,
  TrustSurveyShot,
} from "@/content/trust-scenes";
import { AnchorDot, Leaders, type LeaderSpec } from "@/components/annotation/Leaders";
import { AnnotationPanel, PanelLogo } from "@/components/annotation/Panel";
import { PhoneFrame } from "@/components/renderings/PhoneFrame";
import {
  MobileCapture,
  type CaptureSubject,
} from "@/components/renderings/MobileCapture";
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
  /* The phone comes up ALONE, and before the record exists. Both of those
     matter. Alone, because it is the only new object in Act Two and a viewer
     needs a beat to notice it arrive; before the record, because the order is
     the argument — somebody starts capturing, and THEN there is a record for
     it to go into. Reverse the two and the record looks like it was waiting
     to be filled, which is the passive version of the same picture.

     1500ms because the reveal itself is 1200 (see revealDuration on the
     survey card). The beat has to outlast the fade or the phone is still
     arriving when the next thing happens, which is what made this jerky. */
  { id: "a2-phone", ms: 1500 },
  /* …and now the empty record opens, with somewhere for the captures to go. */
  { id: "a2-record", ms: 1200 },
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
  /* ⭐ THE CONTENT CHECK. All eight go at once and come back as each one
     finishes — see CHECK_MS. Long enough for the slowest to land and be seen
     landing; shorter and the beat would cut away mid-check, which would say
     the opposite of what it is here to say. */
  { id: "a2-check", ms: 4200 },
  { id: "a2-file", ms: 1500 },  // the pile goes into the record
  { id: "a2-capture", ms: 1500 }, // …and the record is what is left
  { id: "a2-charterer", ms: 1200 }, // arrives AFTER the record
  /* Capturing and sharing are two beats, not one. A record only settles an
     argument if every side had it BEFORE there was an argument, and that is a
     separate claim from having made it — so it gets its own moment. */
  { id: "a2-share", ms: 2000 },
  { id: "a2-charter", ms: 1000 },
  { id: "a2-incident", ms: 1700 }, // identical to a1-incident
  /* ⭐ THE SECOND SURVEY, and it is the same eight beats as the first on
     purpose. The argument is that redelivery is not a special event — the
     same walk, the same rooms, the same order — and the ONLY thing that comes
     back different is the saloon. Summarise it as a single beat and the
     viewer has to take that on trust; walk it again and they watch seven
     rooms come back identical before the eighth does not. */
  { id: "a2-rephone", ms: 1500 },
  { id: "a2-reshot-1", ms: 520 },
  { id: "a2-reshot-2", ms: 520 },
  { id: "a2-reshot-3", ms: 520 },
  { id: "a2-reshot-4", ms: 520 },
  { id: "a2-reshot-5", ms: 520 },
  { id: "a2-reshot-6", ms: 520 },
  { id: "a2-reshot-7", ms: 520 },
  { id: "a2-reshot-8", ms: 1100 }, // the saloon again, and it is torn
  /* The same check on the way out, because it is the same process. Showing it
     only at the start would say redelivery is inspected less carefully than
     delivery, which is the one asymmetry this act cannot afford. */
  { id: "a2-recheck", ms: 4200 },
  /* The second certificate's turn on the chain. a2-file is the first's —
     both exist so that publishing is something a viewer WAITS for rather
     than something that has already happened by the time they look. */
  { id: "a2-refile", ms: 1500 },
  { id: "a2-recapture", ms: 1800 },
  { id: "a2-reshare", ms: 1800 }, // the same again, at the other end
  /* Picked out before they are opened. The whole act has been building two
     sheets of eight; going straight to a full-size pair would show a viewer
     the answer without showing them where it came from. This beat rings the
     one cell in each sheet that matters, so the enlargement that follows
     reads as THOSE two frames rather than as two new pictures. */
  { id: "a2-select", ms: 1400 },
  { id: "a2-compare", ms: 2400 },
  /* And only THEN the marks. The pair gets a beat to be looked at before
     anything is drawn on it — a viewer who is shown where to look before they
     have looked has been told the answer rather than shown the evidence. */
  { id: "a2-spot", ms: 2600 },
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

/* THE ACTS, as ranges over the timeline above: where each one opens, and what
   the chapter bar calls it. A scenario names the ones it plays, and playback
   stops at the end of the last of them — see `lastStep`.

   `intro` carries no marker because it is not somewhere a reader jumps to; it
   is the way in, and a chapter button labelled "Intro" would invite someone
   to watch the titles again. It is still an act, and is listed as one, so
   that a scenario which plays only the intro is expressed the same way as one
   that plays everything.

   To add an act: put its beats in STEPS, add its id to TrustActId, and add a
   line here. Nothing else in this file needs to know. */
const ACTS: readonly {
  id: TrustActId;
  /** The step this act opens on. */
  from: number;
  /** Where the chapter button jumps to, if it differs from `from` — Act One
   *  starts at the titles, because that is where a reader means to go back
   *  to when they ask for the beginning. */
  jumpTo?: number;
  marker?: string;
}[] = [
  { id: "intro", from: 0 },
  { id: "act-one", from: at("a1-asset"), jumpTo: 0, marker: acts.one.marker },
  { id: "turn", from: TURN, marker: acts.turn.marker },
  { id: "act-two", from: at("a2-asset"), marker: acts.two.marker },
];

/** The last step a scenario plays: the beat before the first act it does NOT
 *  have, or the end of the piece. Acts run in order and a scenario is written
 *  from the front, so the first gap is the end. */
function lastStepOf(played: readonly TrustActId[]): number {
  const gap = ACTS.findIndex((a) => !played.includes(a.id));
  return gap === -1 ? REST : Math.max(0, ACTS[gap].from - 1);
}

/* The survey's length is a property of the NARRATIVE, not of the scene: the
   beats are written out in STEPS above, so the count lives here and a scene
   supplying a different number of shots is a mistake rather than a silent
   truncation. Resolved once, because at() answers 0 for an id it does not
   know and a survey silently gated on step zero would be very hard to see. */
const SURVEY_SHOTS = 8;
const SHOT_STEPS = Array.from({ length: SURVEY_SHOTS }, (_, i) =>
  at(`a2-shot-${i + 1}`),
);
/* The same eight, at the other end of the charter. */
const RESHOT_STEPS = Array.from({ length: SURVEY_SHOTS }, (_, i) =>
  at(`a2-reshot-${i + 1}`),
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
  collecting: (n: number) => n >= at("a2-record") && n < at("a2-capture"),

  /* The phone is on the stage for the WHOLE survey — from its own beat, all
     the way through the filing, and out only once the record is what is
     left. It used to be on exactly the eight beats a capture was being taken,
     which meant a 420ms reveal inside a 520ms beat: it popped in, changed
     picture eight times and popped out. Nothing was wrong with the fade, it
     was never given long enough to be one. */
  surveyPhone: (n: number) =>
    (n >= at("a2-phone") && n < at("a2-capture")) ||
    (n >= at("a2-rephone") && n < at("a2-recapture")),
  /* Which of the two surveys is running. The phone shows delivery shots in
     the first and redelivery shots in the second, and everything downstream
     of it — the leader's anchor, the flight's origin — follows from this. */
  resurveying: (n: number) => n >= at("a2-rephone"),

  reshotLive: (n: number, i: number) => n === RESHOT_STEPS[i],
  reshotFiled: (n: number, i: number) => n >= RESHOT_STEPS[i],

  /* The captures STAY in the record once they land. They used to fade out at
     a2-capture and be replaced by a single saloon photograph, which is the
     cross-fade that read as a glitch — and it also threw away the thing the
     survey had just spent eight beats building. */
  deliveryImages: (n: number) => n >= SHOT_STEPS[0],
  redeliveryImages: (n: number) => n >= RESHOT_STEPS[0],

  /* The second certificate OPENS, empty, when the captain comes back aboard
     — a beat before the first redelivery capture, for the same reason the
     first one did: the photographs need somewhere to go. Distinct from
     redeliveryCert below, which is when it is issued. */
  redeliveryOpen: (n: number) => n >= at("a2-rephone"),

  /* Act One's occupant of the top slot: the photograph one side happens to
     have. Never in Act Two, where the record has the slot instead — the two
     are mutually exclusive by construction, which is the point. */
  ownerPhoto: (n: number) => n >= at("a1-photo") && n < TURN,
  /* OPEN AND EMPTY before the first capture, so the captures have somewhere
     to go: a photograph flying to a point on a bare stage is a photograph
     flying into nothing, and the viewer has to be told afterwards that a
     record was being made. An empty certificate sitting there says it in
     advance, and then the survey visibly fills it.

     It opens AFTER the phone rather than with the captain, so the sequence
     reads phone, record, fill — see the note on the a2-phone beat. */
  delphi: (n: number) => n >= at("a2-record"),

  /* The content check, and what it leaves behind.

     Two predicates, not one, because they answer different questions.
     `checking` is the moment — the card says so, and the spinner turns. It
     is a single step, so it is === rather than >=.

     `checked` is the result, and it is a WINDOW rather than a latch: the
     ticks come up as each frame comes back and go again when the certificate
     is issued. They are the progress of a check, not a property of the
     photograph — once the certificate exists it is the thing making the
     claim, and eight ticks still sitting on the sheet underneath it would be
     a second, weaker claim competing with it. The sheet should end up clean.

     It also means the prerendered markup carries no ticks at all: at REST
     both windows are closed, so the server draws the finished record and the
     client agrees with it without a transition ever running. */
  checkingDelivery: (n: number) => n === at("a2-check"),
  checkingRedelivery: (n: number) => n === at("a2-recheck"),
  checkedDelivery: (n: number) =>
    n >= at("a2-check") && n < at("a2-capture"),
  checkedRedelivery: (n: number) =>
    n >= at("a2-recheck") && n < at("a2-recapture"),

  /* Made, then handed out. The gap between these two is the beat. */
  /* Between the last capture and the certificate: the record is complete
     and the chain has not confirmed it yet. It is a real gap in the product
     and showing it is worth more than hiding it — a certificate that simply
     appears is a claim, and one a viewer watched being written is not. */
  publishingDelivery: (n: number) =>
    n >= at("a2-file") && n < at("a2-capture"),
  publishingRedelivery: (n: number) =>
    n >= at("a2-refile") && n < at("a2-recapture"),

  deliveryCert: (n: number) => n >= at("a2-capture"),
  deliveryShared: (n: number) => n >= at("a2-share"),
  redeliveryCert: (n: number) => n >= at("a2-recapture"),
  redeliveryShared: (n: number) => n >= at("a2-reshare"),

  incident: (n: number) =>
    (n >= at("a1-incident") && n < TURN) || n >= at("a2-incident"),
  dispute: (n: number) => n >= at("a1-dispute") && n <= at("a1-unresolved"),
  frozen: (n: number) => n === at("a1-unresolved"),
  /* Ringed on the sheet, then open at full size. Two gates rather than one
     because the pair has to be seen being taken OUT OF the record — a
     comparison that simply appears is a claim, and one that visibly comes
     from the two sheets is evidence. */
  /* A WINDOW, not an open end. Everything it hides — the vessel, the
     counterparties, their connectors, the copies they hold — has to come
     back for the resolution, which is the beat that says what all of it was
     for. Left open-ended, the piece would finish on an empty stage. */
  selecting: (n: number) => n >= at("a2-select") && n < REST,
  compare: (n: number) => n >= at("a2-compare"),
  spotting: (n: number) => n >= at("a2-spot") && n < REST,
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
export const DESIGN_W = 1120;
const DESIGN_H = 630;

/* useLayoutEffect warns when React renders on the server, where there is
   nothing to measure — the fallback scale of 1 is the server's answer. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** How much to scale the canvas by, and how tall it has to be in canvas units
 *  to fill the frame. Height is derived rather than fixed because the frame is
 *  16:10 on a phone and 16:9 above it — the canvas stretches to match instead
 *  of letterboxing. */
export function useStageScale(ref: React.RefObject<HTMLElement | null>) {
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
export function flightOrigin(
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
  fromStart = false,
}: {
  scene: TrustScene;
  className?: string;
  /** Start at the FIRST beat instead of the last.
   *
   *  The stage sits at REST on mount so the prerendered markup is the finished
   *  piece and the client hydrates onto exactly that — see the note on `step`.
   *  That is right for the scene the server rendered, and wrong for every
   *  scene after it: picking a sector mounts a fresh component with no server
   *  markup to match, so it painted the ENDING for the frame or two before the
   *  observer started it from the top. That flash is the whole reason this
   *  prop exists.
   *
   *  Set by the selector once the reader has chosen something, and never on
   *  first load. */
  fromStart?: boolean;
}) {
  /* Where this scenario ends. Derived rather than passed: the acts it plays
     are its own data, and a second opinion about the same thing is a second
     thing to keep in step. */
  const lastStep = lastStepOf(scene.acts);

  /* At rest on server and first client render, so hydration matches and the
     prerendered markup is the finished state rather than an empty stage —
     which for a scenario that stops early is the end of ITS last act, not the
     end of the timeline.

     Unless the reader picked this scene, in which case there is no server
     markup to agree with and starting at the end shows them the answer for a
     frame. See fromStart. */
  const [step, setStep] = useState<number>(fromStart ? 0 : lastStep);
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

  /* What the chapter bar offers: the acts this scenario plays that are worth
     jumping to. One chapter is not a choice, so the bar hides itself. */
  const chapters = ACTS.filter(
    (a) => a.marker && scene.acts.includes(a.id),
  ).map((a) => ({ label: a.marker as string, at: a.jumpTo ?? a.from }));

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
        if (i >= lastStep) return;
        timer.current = window.setTimeout(() => {
          setStep(i + 1);
          advance(i + 1);
        }, STEPS[i].ms);
      };
      advance(from);
    },
    [stop, lastStep],
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

  /* Re-measure again when a column FINISHES re-centring.
     The beat effect above measures the instant the step changes, which is the
     instant the transition STARTS — so it records where the panels were, not
     where they are going. Everything that moves without resizing is caught by
     that effect only if it moves instantly, and the tally does not: it opens
     on a grid-template-rows transition, and the column re-centres over the
     same half second.

     The visible symptom was the counterparty's certificates. They hang off
     that party's measured rect, and on the last beat of Act Two — where the
     tally opens and nothing further changes the step — they were left at the
     panel's pre-move position for good, sitting across the first line of the
     tally. Only the side carrying the tally moved, which is why only that
     side was ever wrong.

     Filtered to the one property that moves a column rather than resizing
     something. Every other transition on this stage either changes a box's
     size, which the ResizeObserver already reports, or changes only opacity,
     which moves nothing. */
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
  const { incident, record } = scene;

  /* Which capture is being taken on this beat, if any. Resolved by index
     rather than searched for by id, so a scene carrying more shots than the
     narrative has beats simply never shows the extra ones — SHOT_STEPS is
     undefined past SURVEY_SHOTS and every comparison against it is false. */
  /* The redelivery survey: the SAME eight rooms, and only the saloon comes
     back different. Derived rather than authored so the two can never drift
     into being two different walks — which would quietly destroy the claim
     that nothing changed except the one thing that did. The saloon's own
     replacement is the record's redelivery capture, so that cannot drift
     either. */
  const resurvey = scene.survey.map((shot, i) =>
    i === scene.survey.length - 1
      ? {
          ...shot,
          image: scene.record.verified.redelivery.image,
          imageAlt: scene.record.verified.redelivery.imageAlt,
          stamp: scene.record.verified.redelivery.stamp,
        }
      : shot,
  );
  const resurveying = s.resurveying(step);
  const activeSurvey = resurveying ? resurvey : scene.survey;

  const liveShot = resurveying
    ? resurvey.findIndex((_, i) => s.reshotLive(step, i))
    : scene.survey.findIndex((_, i) => s.shotLive(step, i));
  /* The phone outlives the eight capture beats, so it needs something on it
     before the first and after the last: the first item of the plan waiting
     at 0 of 8, and the finished list at 8 of 8. Between, it is whichever
     capture is live. */
  const phoneOn = s.surveyPhone(step);
  const beforeSurvey = resurveying
    ? step < RESHOT_STEPS[0]
    : step < SHOT_STEPS[0];
  /* ALWAYS a shot, never undefined — the phone's visibility is `phoneOn` and
     nothing else. Gating the CONTENT on it as well unmounted the device the
     instant it was told to leave, so the panel spent its 1200ms fading an
     empty box and the phone simply vanished. A thing cannot fade out after it
     has already gone. */
  const shot =
    activeSurvey[
      liveShot >= 0 ? liveShot : beforeSurvey ? 0 : activeSurvey.length - 1
    ];
  /* The COUNT, which is not the index: mid-survey the live capture is the one
     being taken and is not finished yet, but once the survey is over all of
     them are. */
  const shotsDone =
    liveShot >= 0 ? liveShot : beforeSurvey ? 0 : activeSurvey.length;
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
        /* A leader outliving the panel it comes from, or the hull it
           lands on, is a line drawn between two things that are no longer
           there. */
        on: s.partyLeader(p, step) && !s.selecting(step),
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
      anchor: shot.anchor,
      box: SURVEY_CARD.box,
      from: "left",
      /* The SURVEY, not the phone. The two used to be the same span and are
         not any more: the device is on stage from its own beat until the
         record resolves, while this line should only exist while captures are
         actually being taken. Left tied to the phone it drew from an idle
         device to the hull before anything had been captured, and retracted
         on the same frame the phone began to leave — which is the flicker.

         `liveShot >= 0` is true on each of the eight beats and nowhere else,
         so it still draws once at the first capture and retracts once after
         the last, exactly as before. */
      on: liveShot >= 0,
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
         appears when the record actually holds the saloon.

         And it goes for the comparison. This is the white line running from
         the certificates down to the hull, and it was the one thing left
         drawing on the stage while the two frames were open — the anchor dot
         at its far end was gated but the leader itself was not, so the line
         stayed and ended in nothing. Both ends are hidden by then: the vessel
         it lands on and, visually, the record it leaves. */
      on: (s.deliveryCert(step) || showOwnerPhoto) && !s.selecting(step),
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
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity"
          style={{
            /* From the scene, because assets are not one shape — see
               assetBox. Inline rather than a class: these are measured
               numbers, and Tailwind cannot see an arbitrary value it is
               handed at runtime. */
            width: `${scene.assetBox.width}%`,
            top: `${scene.assetBox.top}%`,
            /* GONE for the comparison. Two frames of one saloon are the
               whole point of the act, and they were opening over a vessel,
               two counterparties and a set of connectors still claiming the
               stage. The vessel has said what it had to say by then; leaving
               it under the pair is not context, it is competition. */
            opacity: s.intro(step)
              ? 0
              : s.selecting(step)
                ? 0
                : step === TURN
                  ? 0.35
                  : 1,
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
                /* Off for the comparison, with the vessel they stand
                   around. Nobody is being addressed at that moment — the
                   frames are. */
                on={s.party(p, step) && !s.selecting(step)}
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
                /* AFTER the comparison in Act Two, not during it. This is
                   the conclusion drawn from the two frames, and putting it on
                   the stage while they are still being read answers the
                   question before the viewer has had it. */
                on={
                  act === 2
                    ? s.compare(step) && !s.selecting(step)
                    : s.dispute(step)
                }
                /* Clearing the certificates, which overlap the panel above
                   without taking any room in the flow — so this is the only
                   thing keeping the two apart, and it has to cover the whole
                   tile: code, gap and caption plate, less the overlap.

                   Padding, not margin: it lives inside the collapsing row so
                   it disappears with the list. */
                spacing={act === 2 ? "pt-16" : "pt-3"}
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
          /* Off for the comparison. They run from the record to the parties,
             and both ends of every one of them is hidden by then. */
          on={s.deliveryShared(step) && !s.selecting(step)}
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
                    /* Down for the comparison, with the parties holding
                       them. Two certificate codes glowing under an empty
                       column are the loudest thing on a stage that is meant
                       to have two photographs on it and nothing else. */
                    issued={[
                      s.deliveryShared(step) && !s.selecting(step)
                        ? record.verified.delivery
                        : undefined,
                      s.redeliveryShared(step) && !s.selecting(step)
                        ? record.verified.redelivery
                        : undefined,
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
          on={
            (s.incident(step) || showOwnerPhoto || s.deliveryCert(step)) &&
            !s.selecting(step)
          }
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
        {/* ── Act One's photograph ──
            A PHONE, and an ordinary one. Act One is somebody taking a picture;
            there is no application, no checklist, no record and no
            certificate, and the card that used to sit here was quietly
            lending it the shape of all four.

            It became actively misleading when the certificate turned into a
            contact sheet: Act One inherited a grid of eight slots for a
            record it does not have. The contrast between the two acts is the
            entire argument — one photograph on a phone against eight sealed
            captures in a record — and it only lands if the two look nothing
            alike.

            chrome={false} for the same reason SurveyCard turns it off: the
            device is already an object with its own edges, and a phone inside
            a tinted rounded rectangle reads as a picture of a phone pinned to
            a card rather than as the phone itself. */}
        <RecordPanel
          spec={record}
          on={showOwnerPhoto}
          /* Small. It is one phone with one photograph on it, standing
             against a record of sixteen sealed captures — and the size
             difference is part of what the two acts are saying. */
          width="w-[9%] min-w-[78px]"
          boxRef={register("record-unverified")}
          title={record.unverified.title}
          trusted={false}
          chrome={false}
        >
          <PhoneFrame>
            <PlainCapture
              capture={record.unverified.capture}
              phone={record.unverified.phone}
              framing={scene.incident.framing}
            />
          </PhoneFrame>
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
            width: s.redeliveryOpen(step) ? "min(52%, 34rem)" : "min(27%, 17.5rem)",
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
            {/* Visible from the moment the record opens, not from when the
                certificate is issued: the sheet has to be on the stage empty
                for the captures to fly into. `cert` is what arrives at
                a2-capture, and it is what turns an open slot into a
                certificate. */}
            <div
              className="flex gap-2 transition-opacity"
              style={{
                opacity: showRecord ? 1 : 0,
                transitionDuration: "var(--duration-slow)",
              }}
            >
              <div className="min-w-0 flex-1">
                <EvidenceCard
                  cert={record.verified.delivery}
                  issued={s.deliveryCert(step)}
                  checking={s.checkingDelivery(step)}
                  tone="verified"
                  trusted
                  codeRef={register("code-delivery")}
                  gridRef={register("record-grid")}
                  publishing={s.publishingDelivery(step)}
                />
              </div>
              {/* Always mounted, so its code has a position for the held
                  copies to fly out of — but with no width until the capture
                  is taken. It opens over the same duration the panel
                  widens. */}
              <div
                className="min-w-0 overflow-hidden"
                style={{
                  flex: s.redeliveryOpen(step) ? "1 1 0%" : "0 0 0%",
                  opacity: s.redeliveryOpen(step) ? 1 : 0,
                  transition:
                    "flex var(--duration-cross) var(--ease-out-quart), opacity var(--duration-slow) linear",
                }}
              >
                <EvidenceCard
                  cert={record.verified.redelivery}
                  issued={s.redeliveryCert(step)}
                  checking={s.checkingRedelivery(step)}
                  tone="failed"
                  trusted
                  codeRef={register("code-redelivery")}
                  gridRef={register("record-grid-2")}
                  publishing={s.publishingRedelivery(step)}
                />
              </div>
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
          index={shotsDone}
          plan={activeSurvey.map((v) => v.label)}
          on={phoneOn}
          boxRef={register("survey-card")}
          frameRef={register("survey-frame")}
        />
        {/* One flight per certificate. Both stay on once they have landed:
            the record IS the two contact sheets, so emptying them again to
            show something else would be undoing the argument. */}
        <SurveyFlight
          shots={scene.survey}
          taken={(i) => s.shotFiled(step, i)}
          checked={s.checkedDelivery(step)}
          on={s.deliveryImages(step)}
          frameRect={boxes["survey-frame"]}
          gridRect={boxes["record-grid"]}
          canvas={CANVAS}
        />
        <SurveyFlight
          shots={resurvey}
          taken={(i) => s.reshotFiled(step, i)}
          checked={s.checkedRedelivery(step)}
          on={s.redeliveryImages(step)}
          frameRect={boxes["survey-frame"]}
          gridRect={boxes["record-grid-2"]}
          canvas={CANVAS}
        />

        {/* ── The comparison ──
            Last, and above everything: the two saloon frames coming out of
            the record they were filed in. */}
        <ComparePair
          delivery={record.verified.delivery}
          redelivery={record.verified.redelivery}
          gridA={boxes["record-grid"]}
          gridB={boxes["record-grid-2"]}
          index={scene.survey.length - 1}
          spot={scene.incident.spot}
          selecting={s.selecting(step)}
          open={s.compare(step)}
          spotting={s.spotting(step)}
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
        <ChapterBar
          step={step}
          onJump={playFrom}
          reduced={reduced}
          chapters={chapters}
          className="ml-auto"
        />
      </div>
    </div>
  );
}

/* ── Pieces ─────────────────────────────────────────────────────────────── */

/** Somewhere to jump to, for each act the scenario actually plays.
 *
 *  Thirty-three seconds is a long time to ask for, and chapters let a viewer
 *  go straight to the comparison — the part that actually argues.
 *
 *  The list is PASSED IN rather than built here. It used to be three hard
 *  coded entries, which was wrong twice over: it assumed every scenario runs
 *  every act, and it re-stated beat ids that already live in ACTS. One
 *  scenario now plays four acts and two play one, and a bar offering chapters
 *  a scenario does not have would be a row of buttons that go nowhere. */
export function ChapterBar({
  step,
  onJump,
  reduced,
  chapters,
  className,
}: {
  step: number;
  onJump: (n: number) => void;
  reduced: boolean;
  chapters: readonly { label: string; at: number }[];
  className?: string;
}) {
  /* One chapter is not a choice, and none is not a bar. */
  if (reduced || chapters.length < 2) return null;

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
export function StageGrid({ ground }: { ground: StageGround }) {
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
  /* Narrower and much taller than the landscape card it replaced, because it
     is now a phone. 22% of the 1120 stage is ~246px, which leaves the capture
     screen legible at stage scale while the whole device still clears the
     630 the stage has to give it. Widen this and the phone runs off the
     bottom; the two are locked together by the frame's own 928:1824. */
  width: "w-[22%] min-w-[212px]",
  /* Fallback footprint only — the card is measured. */
  box: { w: 22, h: 78 } as Box,
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
/* EIGHT, in four columns — one cell per capture in the survey, not a
   generic nine. The record is a contact sheet of a specific walk round the
   vessel, and a ninth empty cell sitting under it for the whole piece is a
   promise of something that never arrives. */
const GRID_COLS = 4;
const GRID_CELLS = 8;
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
/** The tally, and it COLLAPSES when it has nothing to say.
 *
 *  It used to render its three items in flow at all times and animate only
 *  their opacity, which meant it held its full height — plus a 4rem clearance
 *  margin — for the entire act. The column it sits in centres its children,
 *  so the counterparty above spent the whole of Act Two pushed up towards the
 *  top of the stage making room for a list that was not there yet, while the
 *  captain opposite sat centred. The two sides looked misaligned, and the
 *  reason was invisible.
 *
 *  A 0fr/1fr grid row rather than a height: the tally has no height anyone can
 *  write down — it depends on how the three lines wrap at whatever width the
 *  column ends up — and auto is not a value a transition can interpolate
 *  from. The inner element must clip, or 0fr shows its contents anyway.
 *
 *  The clearance moves INSIDE the collapsing row, as padding rather than
 *  margin. A margin outside it would go on holding 4rem open and reintroduce
 *  the whole problem at a quarter of the size. */
export function OutcomeList({
  items,
  tone,
  on,
  spacing,
}: {
  items: readonly string[];
  tone: "verified" | "failed";
  on: boolean;
  /** Clearance above the list, applied inside the collapsing area. */
  spacing?: string;
}) {
  return (
    <div
      className="grid w-full"
      style={{
        gridTemplateRows: on ? "1fr" : "0fr",
        /* Slower than the items' own fade, so the panel above has finished
           settling before the first line arrives — a list that reads itself
           out while the page is still moving is hard to read. */
        transition:
          "grid-template-rows var(--duration-slow) var(--ease-out-quart)",
      }}
    >
    <ul className={cn("flex w-full flex-col gap-2 overflow-hidden", spacing)}>
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
    </div>
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
export function TitleCard({
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
export function HeldCertificates({
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
/* The survey, as the person aboard sees it.
 *
 *  This was a photograph in a bordered card — the shot, its room and its
 *  stamp. It is now the actual capture screen, in the actual device, running
 *  the actual plan: the same MobileCapture the platform pages show, handed a
 *  yacht instead of a house.
 *
 *  That is a claim about the product rather than a decoration. The old card
 *  said "a photograph was taken and labelled"; this says "somebody was walked
 *  through a defined list, and this is the item they are on". The eight beats
 *  of the survey step `done` through the plan, so the checklist ticks off and
 *  the viewfinder changes together — which is the argument Act Two is making.
 *
 *  The images are the survey's own, so the phone and the pile filling up
 *  opposite it are showing one set of captures rather than two. */
function surveySubject(
  shot: TrustSurveyShot,
  index: number,
  plan: readonly string[],
): CaptureSubject {
  return {
    asset: "MY Aurora",
    job: "Condition Survey · Charter Delivery",
    subject: shot.label,
    /* Written for the person holding the phone, in the sector's own words —
       see the note on user instructions versus system checks in
       components/renderings/MobileCapture.tsx. */
    instruction: `Record the ${shot.label.toLowerCase()} as found, before the charter party board.`,
    /* 960 rather than 480: the viewfinder is the largest thing on the card
       and these masters top out at 878 anyway, so this is the whole picture
       rather than a stretched half of it. */
    image: `/assets/features/${shot.image}-960.webp`,
    imageSrcSet: `/assets/features/${shot.image}-480.webp 480w, /assets/features/${shot.image}-960.webp 878w`,
    imageSizes: "220px",
    plan,
    /* The item in the viewfinder is the one at `done` — so the count of
       finished captures is the index itself. */
    done: index,
    total: plan.length,
  };
}

function SurveyCard({
  shot,
  index,
  plan,
  on,
  boxRef,
  frameRef,
}: {
  shot?: TrustSurveyShot;
  index: number;
  /* The plan IS the count — the screen renders its own "n of 8" from the
     length of it, so a separate total would be a second source for one
     number. */
  plan: readonly string[];
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
      /* No panel chrome. The phone is already an object with its own edges,
         and a tinted rounded rectangle around it turned it back into a
         picture of a phone pinned to a card. The mark and the survey title
         went with it: the screen states its own asset, job and progress, so
         the header was captioning something that captions itself. */
      chrome={false}
      /* Slower than a callout, because it is not one. This is the device the
         whole act is about arriving on the stage, and it gets long enough to
         be watched doing it — see revealDuration on AnnotationPanel. */
      revealDuration="var(--duration-cross)"
      className="z-20"
    >
      {/* `frameRef` reports the device, so the capture that flies out towards
          the record leaves the phone rather than a rectangle beside it. */}
      <div ref={frameRef}>
        {shot && (
          <PhoneFrame>
            <MobileCapture subject={surveySubject(shot, index, plan)} />
          </PhoneFrame>
        )}
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
function RecordGrid({
  gridRef,
}: {
  gridRef?: (el: HTMLElement | null) => void;
}) {
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
        /* Dotted rather than dashed: a dashed outline at this size reads as
           a solid one with gaps in it, and the point of the cell is that it
           is a placeholder. */
        <div
          key={i}
          className="rounded-xs border border-dotted"
          style={{
            backgroundColor: "var(--callout-halo)",
            borderColor: "var(--callout-slot)",
          }}
        />
      ))}
    </div>
  );
}

/* WHEN EACH TICK COMES BACK, in milliseconds from the start of the check.
   Spread across one to three seconds and deliberately out of order, because
   that is how the real thing behaves: eight requests go at once and each
   returns when it returns. Ordered delays would read as a progress bar
   sweeping left to right, which would be a picture of a queue rather than of
   parallel work.

   ⚠️  FIXED, NOT RANDOM, and that is not a compromise.

   This stage is prerendered. A Math.random() delay would be computed once on
   the server and again in the browser, and the two would disagree — a
   hydration mismatch on the style attribute of sixteen elements. It would
   also re-roll on every replay, so a viewer watching twice would see one
   deterministic process animate two different ways.

   Nobody can tell these eight numbers from random. React can tell a mismatch
   from a match. */
const CHECK_MS = [1240, 2610, 1020, 1880, 2950, 1450, 2210, 1660];

/* HOW THE FRAMES FOLLOW THEIR CELLS when the record itself moves.

   The photographs are positioned off the grid's MEASURED rect, and that rect
   only changes when useBoxes re-measures — which it debounces to every 120ms,
   deliberately: an animating panel drives its ResizeObserver at 60fps and
   re-measuring that often re-renders the whole stage.

   So when the record widens to admit the second certificate — 1200ms of CSS
   width transition — the eight frames were being handed about ten discrete
   positions and jumping between them. The panel glided; its contents
   stuttered.

   The fix is not to measure more often, which is the stutter the debounce
   exists to prevent. It is to let each frame EASE toward whatever position it
   was last given. At 200ms against 120ms steps a frame never quite arrives
   before the next target lands, and stepped input comes out as continuous
   motion — the same reason a low-pass filter smooths a staircase. The cost is
   about 80ms of lag behind the panel edge during the widen, which is not
   visible; the stepping was.

   Under reduced motion theme.css zeroes every transition-duration with
   !important, this one included, and the frames simply appear where they
   belong. */
const CELL_GLIDE = "left 200ms linear, top 200ms linear, width 200ms linear, height 200ms linear";

/** The result of the content check, on the frame it was run against.
 *
 *  Bottom-right of its own cell, which is the corner nothing else uses — the
 *  cell's own dotted border is behind the photograph by now, and the code and
 *  the caption are outside the sheet entirely.
 *
 *  Sized in design pixels rather than relative to the cell. The whole stage is
 *  drawn at DESIGN_W and scaled as one, so a fixed size here scales with
 *  everything else and stays the same size relative to the record whatever
 *  the viewport is. */
function CheckTick({ on, delay }: { on: boolean; delay: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute grid place-items-center rounded-full bg-verified"
      style={{
        width: "16px",
        height: "16px",
        /* A ring of the card's own dark under the green, so the tick still
           reads as a tick against the pale corner of a bathroom or a bedsheet
           rather than dissolving into it. */
        boxShadow: "0 0 0 1.5px var(--callout-surface)",
        opacity: on ? 1 : 0,
        transform: on ? "scale(1)" : "scale(0.5)",
        /* The delay applies on the way IN only. Replaying the act turns these
           off, and eight ticks disappearing on a stagger reads as the check
           being undone one frame at a time. */
        transitionDelay: on ? `${delay}ms` : "0ms",
        transition:
          "opacity var(--duration-fast) linear, transform var(--duration-normal) var(--ease-out-quart)",
      }}
    >
      <svg viewBox="0 0 10 10" className="h-[11px] w-[11px] text-callout-ink">
        <path
          d="M2 5.2 L4 7.2 L8 2.8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
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
  checked,
  on,
  /** The frame on the preview card — where each photograph flies out of. */
  frameRect,
  /** The record's grid, measured. Nothing flies until this exists. */
  gridRect,
  canvas,
}: {
  shots: readonly TrustSurveyShot[];
  taken: (i: number) => boolean;
  /** Whether the content check has run on this sheet. The ticks live here
   *  rather than in RecordGrid because the photographs land on THIS layer:
   *  a tick drawn in the cell underneath would be covered by the picture it
   *  is meant to be marking. */
  checked: boolean;
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
              transition: `transform var(--duration-fly) var(--ease-out-quart), opacity var(--duration-fast) linear, ${CELL_GLIDE}`,
            }}
          />
        );
      })}

      {/* ── The results, in a PASS OF THEIR OWN ──
          Not beside each photograph in the loop above, which is where they
          started. A tick is centred on its frame's bottom-right corner, so
          half of it hangs over the neighbouring cell — and painting order in
          a stack of absolutely positioned siblings is document order, so
          every tick was covered by whichever photographs came after it. Only
          the last frame's tick was ever fully visible.

          Drawn after all eight, every one of them clears every photograph.

          CENTRED ON THE CORNER rather than tucked inside it. Sat wholly
          within the cell it read as part of the photograph — something in the
          corner of the room — and it covered a real part of a frame only
          about sixty pixels wide. Straddling the edge, it reads as a mark
          made ON the picture from outside it, which is what it is. The offset
          is half the tick's own size. */}
      {shots.map((shot, i) => {
        const cell = cellRect(gridRect, i, canvas);
        return (
          <span
            key={`${shot.image}-checked`}
            className="absolute"
            style={{
              left: `calc(${cell.x + cell.w}% - 8px)`,
              top: `calc(${cell.y + cell.h}% - 8px)`,
              /* The same glide as the frame it marks, or the tick would
                 detach from its corner every time the record moves. */
              transition: CELL_GLIDE,
            }}
          >
            {/* Only once the frame is actually in the record: a tick on an
                empty cell would be claiming a result for a photograph that
                has not been taken. */}
            <CheckTick
              on={on && taken(i) && checked}
              delay={CHECK_MS[i % CHECK_MS.length]}
            />
          </span>
        );
      })}
    </div>
  );
}

/* Where the pair opens to. Two frames side by side, low enough on the stage
   to sit over the vessel rather than over the record they came out of, and
   sized so the tear is legible — which is the only reason any of this is
   here. 16:9 to match the masters, so nothing is cropped at the moment a
   viewer is being asked to compare two things. */
const COMPARE_W = 29;
const COMPARE_GAP = 3;
const COMPARE_Y = 45;
const COMPARE_H = (COMPARE_W * (496 / 882) * DESIGN_W) / DESIGN_H;
const COMPARE_X = (100 - (COMPARE_W * 2 + COMPARE_GAP)) / 2;

/** The two saloon frames, taken out of the record and opened.
 *
 *  The argument the whole piece has been building arrives here, and it only
 *  works if a viewer believes these two pictures came out of those two
 *  sheets. So they are not new elements that appear: each one starts life
 *  exactly on top of its own cell, at that cell's size, and grows out of it.
 *  Same technique as SurveyFlight and inverted — the element is positioned at
 *  its DESTINATION and transformed back to its origin, so one transform
 *  carries the whole journey and the landing is exact.
 *
 *  A layer above the stage rather than inside the record panel, for the same
 *  reason the captures fly on one: the panel clips, and a frame growing out
 *  of it would be cut off at its edge for most of the journey.
 *
 *  ⚠️  IT SHOWS, IT DOES NOT JUDGE. Two dated photographs side by side, each
 *  labelled with when it was taken. No verdict, no arrow between them, no
 *  ring around the tear. The viewer decides what they are looking at, which
 *  is the entire proposition — see the liability warning at the top of
 *  content/trust-scenes.ts. */
function ComparePair({
  delivery,
  redelivery,
  gridA,
  gridB,
  index,
  spot,
  selecting,
  open,
  spotting,
  canvas,
}: {
  delivery: TrustCapture;
  redelivery: TrustCapture;
  /** Where the damage is in the frame. See incident.spot. */
  spot: { x: number; y: number };
  /** The two contact sheets, measured. Nothing opens until both exist. */
  gridA?: Rect;
  gridB?: Rect;
  /** Which cell of each sheet the saloon is. */
  index: number;
  selecting: boolean;
  open: boolean;
  /** Draw the two marks and the line between them. */
  spotting: boolean;
  canvas: { w: number; h: number };
}) {
  if (!gridA || !gridB || !canvas.w) return null;

  /* The two marks, in stage percentages, derived from the frames rather than
     authored — move the frames and the rings follow them. */
  const markY = COMPARE_Y + spot.y * COMPARE_H;
  const markX = (i: number) =>
    COMPARE_X + i * (COMPARE_W + COMPARE_GAP) + spot.x * COMPARE_W;
  const cx = (i: number) => (markX(i) / 100) * canvas.w;
  const cy = (markY / 100) * canvas.h;
  /* Big enough to be a mark rather than a dot, small enough that it rings the
     tear instead of the cushion. */
  const r = ((COMPARE_W * 0.085) / 100) * canvas.w;

  const pair = [
    { cert: delivery, grid: gridA, tone: "verified" as const },
    { cert: redelivery, grid: gridB, tone: "failed" as const },
  ];

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-40">
      {pair.map(({ cert, grid, tone }, i) => {
        const cell = cellRect(grid, index, canvas);
        const target = {
          x: COMPARE_X + i * (COMPARE_W + COMPARE_GAP),
          y: COMPARE_Y,
          w: COMPARE_W,
          h: COMPARE_H,
        };
        /* Back to the cell it came from: the vector from the target to that
           cell, and how much smaller the cell is. In the target's own terms,
           so the transform is one value the whole way. */
        const origin = {
          x:
            ((cell.x + cell.w / 2 - (target.x + target.w / 2)) / 100) * canvas.w,
          y:
            ((cell.y + cell.h / 2 - (target.y + target.h / 2)) / 100) * canvas.h,
          scale: cell.w / target.w,
        };

        return (
          <div
            key={cert.image}
            className="absolute"
            style={{
              left: `${target.x}%`,
              top: `${target.y}%`,
              width: `${target.w}%`,
              height: `${target.h}%`,
              transform: open
                ? "none"
                : `translate(${origin.x}px, ${origin.y}px) scale(${origin.scale})`,
              opacity: selecting ? 1 : 0,
              transition:
                "transform var(--duration-fly) var(--ease-out-quart), opacity var(--duration-slow) linear",
            }}
          >
            {/* The ring is on the frame from the moment it is selected, so it
                is the thing that grows — a cell is ringed on the sheet, and
                that ringed cell becomes the picture. Draw it only once open
                and two frames arrive already framed, from nowhere. */}
            <div
              className="h-full w-full overflow-hidden rounded-xs"
              style={{
                boxShadow: `0 0 0 2px ${
                  tone === "verified" ? "var(--fx-verified-glow)" : "var(--fx-failed-glow)"
                }`,
              }}
            >
              <img
                src={`/assets/features/${cert.image}-960.webp`}
                srcSet={`/assets/features/${cert.image}-480.webp 480w, /assets/features/${cert.image}-960.webp 878w`}
                sizes="340px"
                alt=""
                width={882}
                height={496}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </div>

            {/* WHEN, on each frame. Two photographs of one room prove nothing
                without their dates — the dates are the entire content of the
                claim. Only once open: at cell size this is illegible, and an
                unreadable plate on a thumbnail is just a smudge. */}
            <div
              className="absolute left-1.5 top-1.5 rounded-sm px-1.5 py-1 transition-opacity"
              style={{
                backgroundColor: "var(--callout-caption)",
                opacity: open ? 1 : 0,
                transitionDuration: "var(--duration-slow)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2.5 w-0.5 shrink-0 rounded-xs",
                    tone === "verified" ? "bg-verified" : "bg-failed",
                  )}
                />
                <span className="font-mono text-mono-xs text-callout-ink">
                  {cert.event}
                </span>
              </div>
              <p className="font-mono text-mono-xs text-callout-ink-muted">
                {cert.stamp}
              </p>
            </div>
          </div>
        );
      })}

      {/* SPOT THE DIFFERENCE — two rings and a line, and nothing else.

          Green on the frame where the cushion is whole, red where it is not,
          and a live channel between them saying these are the same place in
          the same room. That is the entire finding, and it is stated without
          a word of copy.

          ⚠️  IT MARKS, IT DOES NOT CONCLUDE. The rings say "here, and here";
          they do not say who owes for it. Delphi records that the seat was
          undamaged on one date and damaged on another — the charter agreement
          decides the rest. See the liability warning at the top of
          content/trust-scenes.ts. */}
      <svg
        className="absolute inset-0 h-full w-full overflow-visible transition-opacity"
        style={{
          opacity: spotting ? 1 : 0,
          transitionDuration: "var(--duration-slow)",
        }}
        aria-hidden
      >
        {/* WHITE, OVER A DARK HALO — the same trick the leaders use, and for
            the same reason. These are drawn over photographs of a cream
            saloon, and a coloured line on a pale interior is a suggestion
            rather than a mark: the green ring in particular disappeared into
            the leather it was pointing at.

            The tone has not been thrown away, it has moved to where it still
            reads — each frame carries its own verified/failed glow on its
            border, against the dark stage rather than against the picture.

            Every shape is drawn twice: the halo first, at roughly double the
            width, then the white over it. Both passes carry the same dash and
            the same animation, so the dark reads as an outline around each
            moving dash rather than as a second line. */}
        {[
          { w: 7, colour: "var(--callout-halo)" },
          { w: 3.5, colour: "var(--callout-line)" },
        ].map(({ w, colour }) => (
          <g key={colour} fill="none" stroke={colour}>
            {/* Between the rings, not between the frames: the line is making
                a claim about two points, and drawing it edge to edge would
                make it about two pictures. */}
            <line
              x1={cx(0) + r}
              y1={cy}
              x2={cx(1) - r}
              y2={cy}
              className="trust-link"
              strokeWidth={w}
              strokeLinecap="round"
            />
            {[0, 1].map((i) => (
              <circle key={i} cx={cx(i)} cy={cy} r={r} strokeWidth={w} />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

/** The top slot's frame: a title row, then the evidence cards beneath it.
 *
 *  `trusted` is the whole distinction the piece turns on, so it is one prop
 *  and it changes three things at once — the mark on the title row, the
 *  border around the cards, and the weight of the type. A viewer should be
 *  able to tell the two apart at a glance and without reading. */
export function RecordPanel({
  spec,
  on,
  width,
  style,
  boxRef,
  title,
  trusted,
  chrome = true,
  children,
}: {
  spec: { panel: StagePoint; align: Align };
  on: boolean;
  width: string;
  style?: React.CSSProperties;
  boxRef?: (el: HTMLElement | null) => void;
  title: string;
  trusted: boolean;
  /** Off where the child is already an object with its own edges. */
  chrome?: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnnotationPanel
      spec={spec}
      on={on}
      width={width}
      style={style}
      boxRef={boxRef}
      chrome={chrome}
      className="z-20"
    >
      {/* No padding without chrome: the inset exists to hold the contents off
          a border that is not being drawn, and it pushes a bare device off
          the position the panel was placed at. */}
      <div className={chrome ? "p-2" : ""}>
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
  gridRef,
  publishing = false,
  checking = false,
  issued,
}: {
  /** ALWAYS. A slot that does not know what it is waiting for cannot say so,
   *  and an unlabelled grid of eight is a shape rather than a record. The
   *  event and the date are known from the moment the survey starts — what
   *  arrives later is the certificate, not the facts. */
  cert: TrustCapture;
  tone: "verified" | "failed";
  trusted: boolean;
  /** Whether the certificate exists yet. Was `cert !== undefined`, which
   *  conflated "we know what this is" with "it has been issued". */
  issued: boolean;
  /** Sealed, but not yet confirmed on the chain. */
  publishing?: boolean;
  /** Every frame is with Gemini, being read for what is in it. */
  checking?: boolean;
  /** Reports where this card's code sits, so the copies handed to the
   *  parties can fly out of it. */
  codeRef?: (el: HTMLElement | null) => void;
  /** Reports this card's contact sheet, so the captures know which cells to
   *  fly into. The photographs themselves live on a layer above the stage —
   *  see SurveyFlight — because this card clips its contents and a capture
   *  crossing the stage inside it would be invisible until it landed. */
  gridRef?: (el: HTMLElement | null) => void;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-sm border transition-opacity",
        /* Dashed while it is empty, whoever it belongs to. A slot with
           nothing in it is a slot waiting to be filled, and a dashed outline
           is the one convention that says so without a caption. */
        !issued && "border-dashed",
      )}
      style={{
        borderColor: issued ? "var(--fx-accent-glow)" : "var(--callout-slot)",
        /* 0.85, not 0.4. This was tuned when the empty state was a single
           blank frame briefly visible on the second slot. It is now the open
           sheet standing there for a whole eight-beat survey with photographs
           landing in it — and at 0.4 the dashed cells were so faint that the
           captures appeared to be flying into nothing. The card still reads
           as waiting rather than issued; it just does so visibly. */
        opacity: issued ? 1 : 0.85,
        transitionDuration: "var(--duration-normal)",
      }}
    >
      {/* A HEADER, A CONTACT SHEET AND A CODE — in that order, and none of
          them on top of another.

          This card used to be one photograph with its label burned into the
          top-left corner and its code into the bottom-right, which worked
          while the record held a single frame. It now holds the whole survey,
          and the captures land on a layer ABOVE this card: anything sitting
          over a cell would be covered by the photograph that flies into it.
          So the sheet gets the middle, and the two pieces of text get a strip
          each. */}
      <div className="flex flex-col gap-1.5 p-1.5">
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
          {/* The EVENT, not the label. The label names one frame — "Saloon ·
              torn" — and this is a sheet of eight, of which the saloon is one.
              Captioning the set with the name of a single member of it was
              accurate when the set had one member and is not any more. */}
          <span className="truncate font-mono text-mono-xs text-callout-ink">
            {cert.event}
          </span>
          <span
            className={cn(
              "ml-auto shrink-0 font-mono text-mono-xs",
              trusted ? "text-callout-ink-muted" : "text-failed",
            )}
          >
            {cert.stamp}
          </span>
        </div>

        <RecordGrid gridRef={gridRef} />

        {/* The code on the sheet it certifies — the same code the parties are
            each handed a copy of. Only on a verified card: a photograph with
            nothing standing behind it has no certificate to carry, and putting
            one there would say it did. */}
        {trusted && (
          <div className="flex items-end gap-2">
            {/* WHAT IS HAPPENING TO IT, in the two words that matter. The
                record is sealed the moment the last capture lands, but it is
                not independently checkable until the chain has it — and those
                are different claims. Collapsing them would be the one place
                this piece overstates what the product does. */}
            <p className="min-w-0 flex-1 font-mono text-mono-xs leading-tight text-callout-ink-muted">
              {/* THREE STATES, IN THE ORDER THEY HAPPEN, and each says only
                  what is true at that moment: the content is being read, the
                  record is being written to the chain, the certificate is
                  published. Three different claims — see the note below on
                  why the last two are not collapsed. */}
              {checking ? (
                trustEngineCopy.checking
              ) : publishing ? (
                "Publishing certificate on blockchain…"
              ) : issued ? (
                <>
                  Certificate published
                  <br />
                  <span className="text-callout-ink">{cert.code}</span>
                </>
              ) : (
                ""
              )}
            </p>
            <span
              ref={codeRef}
              /* Mounted from the start, not from when the certificate is
                 issued: the held copies fly FROM here, and a source that does
                 not exist until the moment of departure has no position to
                 depart from. */
              className="block shrink-0 transition-opacity"
              style={{
                opacity: issued || publishing || checking ? 1 : 0,
                transitionDuration: "var(--duration-normal)",
              }}
            >
              {/* Lit the same way as the copies it issues — same token, same
                  pulse. It is the source of the channel, so it should not look
                  like a colder version of what came out of it.

                  Only once published: a glow behind a spinner would say the
                  channel is live while the thing that makes it live is still
                  being written. */}
              <span className="relative block">
                <span
                  aria-hidden
                  className="trust-held-glow absolute -inset-1.5 rounded-sm transition-opacity"
                  style={{
                    backgroundColor: "var(--fx-link)",
                    filter: "blur(7px)",
                    opacity: issued ? 1 : 0,
                  }}
                />
                {/* The spinner stands exactly where the code will be, so the
                    one becomes the other rather than the card changing shape
                    under the reader. */}
                <span className="relative grid h-9 w-9 place-items-center rounded-xs bg-callout-ink">
                  {issued ? (
                    <img
                      src="/assets/certificate-code.webp"
                      alt=""
                      width={128}
                      height={128}
                      loading="lazy"
                      decoding="async"
                      className="block h-8 w-8"
                    />
                  ) : (
                    <PublishSpinner />
                  )}
                </span>
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Act One's photograph, on an ordinary phone.
 *
 *  ⚠️  DELIBERATELY NOT THE DELPHI APP. No mark, no checklist, no capture
 *  plan, no location or device row, no certificate code — nothing that would
 *  suggest anything was checked. It is a camera roll: a picture, and a date
 *  the phone itself is asserting.
 *
 *  That date is the whole point of showing it. The photograph is not a lie
 *  and nobody claims it is; it simply has nothing standing behind it, and a
 *  viewer who reads the timestamp and then remembers that a phone's clock is
 *  a setting has understood Act One without being told.
 *
 *  Kept in this file rather than components/renderings: the renderings are
 *  the product, and this is explicitly the absence of it. */
function PlainCapture({
  capture,
  phone,
  framing,
}: {
  capture: TrustCapture;
  /** The clock and the camera-roll date. See record.unverified.phone. */
  phone: { clock: string; date: string };
  /** Where to crop. See incident.framing. */
  framing: string;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-callout-ink">
      {/* Barely a status bar. Enough that it reads as a phone, not so much
          that it reads as a designed screen. */}
      <div className="flex shrink-0 items-center justify-between px-[24px] pb-[6px] pt-[46px] text-[13px] font-semibold text-callout-surface">
        <span>{phone.clock}</span>
        <span className="flex items-center gap-[4px]">
          <svg viewBox="0 0 18 12" className="h-[10px] w-[16px]" aria-hidden>
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
          <svg viewBox="0 0 26 12" className="h-[10px] w-[22px]" aria-hidden>
            <rect
              x="0.6"
              y="0.6"
              width="21"
              height="10.8"
              rx="3"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.5"
              strokeWidth="1.2"
            />
            <rect x="2.2" y="2.2" width="13" height="7.6" rx="1.8" fill="currentColor" />
          </svg>
        </span>
      </div>

      {/* The date the phone says it was. A camera roll header, not evidence
          — which is exactly the distinction Act One exists to draw. */}
      <p className="shrink-0 px-[20px] pb-[10px] text-center text-[15px] font-semibold text-callout-surface">
        {phone.date}
      </p>

      <div className="min-h-0 flex-1">
        <img
          src={`/assets/features/${capture.image}-960.webp`}
          srcSet={`/assets/features/${capture.image}-480.webp 480w, /assets/features/${capture.image}-960.webp 878w`}
          sizes="150px"
          alt={capture.imageAlt}
          width={882}
          height={496}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          /* THE DAMAGE HAS TO BE IN SHOT. This is a 16:9 photograph in a
             portrait screen, so cover crops the sides hard and keeps roughly
             a third of the width — and centring it throws away whatever is
             not in the middle. The whole of Act One is a photograph of the
             damage; a frame that does not contain it is a picture of a room.
             See incident.framing, and incident.spot for what it tracks. */
          style={{ objectPosition: `${framing} 50%` }}
        />
      </div>
    </div>
  );
}

/** Waiting on the chain. Deliberately a plain indeterminate spinner: a
 *  progress bar would promise a duration nobody can honour, and a percentage
 *  would be an invented number on a page about not inventing numbers. */
function PublishSpinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="var(--fx-link-halo)"
        strokeWidth="3"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="var(--fx-link)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ReplayIcon() {
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
