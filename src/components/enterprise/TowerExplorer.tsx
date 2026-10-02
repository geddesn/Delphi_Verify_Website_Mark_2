import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APARTMENT,
  BUILDING_DEPTH,
  baysOf,
  GEOMETRY,
  maxWidth,
  widthOf,
  ROOMS,
  STAGES,
  MAX_FLOORS,
  TOWERS,
  UNITS,
  capturesFor,
  roomFocusState,
  unitState,
  unitsIn,
  type UnitPhase,
  type CaptureFocus,
  type Tower,
  type UnitState,
} from "@/content/enterprise/world";
import { useLang, useT, type Bi } from "@/content/enterprise/lang";
import { ApartmentPane } from "@/components/enterprise/ApartmentSheet";
import { TowerProgress } from "@/components/enterprise/SiteProgress";
import { cn } from "@/lib/cn";

/* ============================================================================
   TOWER EXPLORER
   ============================================================================
   The one screen on this page that moves, and the only one that needed to.

   A developer's objection to documenting 500 apartments is not really about
   storage — it is that he cannot picture supervising it. So this draws the
   tower from its unit schedule, shades every apartment by how much sealed
   evidence it carries, and lets him turn it round, open a floor and open an
   apartment. The argument is made by the picture rather than by a paragraph
   next to it.

   ⚠️  THE MASSING IS GENERATED, NOT LOADED. Floors, bays, storey height, the
   apartment plan and the balconies all come from content/enterprise/world.ts
   and the block is projected from them. That is a product boundary as much as
   a drawing technique: a generated block claims only that we can read a unit
   schedule, where an imported model would claim BIM or IFC ingestion — a
   commitment to anybody we showed it to. Nothing here parses a building file.

   ⚠️  ONE SOURCE FOR THE PLAN. The elevation's balconies and the floor plan's
   balconies are the same APARTMENT.balcony rectangle, and the rooms in the
   plan are APARTMENT.rooms. A viewer who finds the balcony on the kitchen
   side in one view and the sala in the other has learned that neither drawing
   is of anything.

   ⚠️  DETERMINISTIC AT REST. This page is prerendered: the opening angle, the
   opening tower and the opening floor are constants, so the server's SVG and
   the browser's first render are identical. See the hash in world.ts for the
   same requirement applied to the apartments themselves.
   ========================================================================= */

/* ── Camera ────────────────────────────────────────────────────────────────
   A real perspective camera rather than the axonometric this started as.
   Parallel projection is what architects use for massing studies and it is
   genuinely easier to reason about — but it reads as a diagram, and this
   screen is trying to look like a building.

   The camera is placed once, from the TALLEST tower's height, and every tower
   is drawn through it. Framing each one individually would scale all three to
   the same apparent size and throw away the height difference — see the note
   at the call site. */
function cameraFor(height: number, overhead = 0) {
  /* Above the roof, so the block reads as a solid with a top rather than as a
     facade. Looking up at a tower is more dramatic and much less useful: the
     upper floors foreshorten into nothing and the floor you want to click
     becomes a sliver. */
  const restY = height * 1.18;
  /* Far enough back that the vertical convergence is noticeable but not
     lurid. Closer than about 3× the height and the tower starts to topple
     away from the viewer like a wide-angle photograph. */
  const restDistance = height * 2.9 + 60;
  /* Aimed a little below mid-height, which puts the busy part of the tower —
     the build front — in the middle of the frame. */
  const target = height * 0.45;

  /* ⚠️  PITCH IS A PARAMETER, NOT A DERIVED CONSTANT, and that is what lets
     the view fly to the floor plan rather than cut to it. `overhead` runs 0
     for the natural three-quarter view to 1 for straight down. */
  const natural = Math.atan2(restY - target, restDistance);
  const pitch = natural + (Math.PI / 2 - natural) * overhead;

  /* ⚠️  THE CAMERA RISES AND COMES OVER THE TOP; IT DOES NOT JUST TILT.
     Pitching to straight down while the camera sits 18% above the roof looked
     obviously right and was obviously wrong in motion: with the eye that close
     to the building, the roof is five times nearer than the ground, the fit
     has to zoom out to hold both, and the tower shrank to a speck instead of
     opening into a plan. Measured: the top slab went 242 × 35 units to
     20 × 13 on the way to the plan.

     So height and distance travel with the pitch — up to nine times the
     building's height and in over the centre. At that remove the depth across
     the block varies by about a tenth, which is near enough to parallel that
     the footprint reads as a true plan, with just enough perspective left
     that it never looks like a different drawing. */
  const y = restY + (height * 9 - restY) * overhead;
  const distance = restDistance * (1 - overhead);

  return { y, distance, target, pitch };
}

type Point = { x: number; y: number };

/** World metres to a normalised image plane. Rotate about the building's
 *  vertical axis, move into camera space, pitch down to the aim point, then
 *  divide by depth — the divide being the whole difference from the parallel
 *  projection this replaced. */
function project(
  x: number,
  y: number,
  z: number,
  angle: number,
  cam: ReturnType<typeof cameraFor>,
): Point {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const xr = x * c - z * s;
  const zr = x * s + z * c;

  /* Camera sits on -z looking toward +z, at height cam.y. */
  const yc = y - cam.y;
  const zc = zr + cam.distance;

  const cp = Math.cos(cam.pitch);
  const sp = Math.sin(cam.pitch);
  const y2 = yc * cp + zc * sp;
  const z2 = -yc * sp + zc * cp;

  /* z2 cannot reach zero: the camera stands further back than the building is
     deep, by construction of cameraFor. Guarded anyway, because a NaN here
     silently empties the whole drawing rather than failing loudly. */
  const depth = Math.max(z2, 1);
  return { x: xr / depth, y: -y2 / depth };
}

/* The SVG's own coordinate box. The projection fits the building into this and
   the viewBox scales to whatever the layout gives it. */
const VIEW = { w: 560, h: 620 };

const DEFAULT_ANGLE = -0.62;

/* ── The divider ──────────────────────────────────────────────────────────
   The panel starts at 23rem and can be dragged. Bounds rather than free rein:
   below about 17rem the five columns of figures stop fitting and the table
   starts eliding its own numbers, and past 34rem the stage is too narrow to
   turn a tower round in. */
/* 26rem rather than 23. The panel now carries a grouped table with five
   columns of figures and a group heading above each, and at 368px the longer
   room-and-task labels were truncating on their first word. The stage loses
   48px it was not using. */
const ASIDE_DEFAULT = 416;
const ASIDE_MIN = 272;
const ASIDE_MAX = 544;

/** Take or release the pointer, without letting a missing capture throw.
 *  Both calls raise NotFoundError when the pointer is not where the browser
 *  thinks it is, which is a condition to shrug at rather than one to abort a
 *  handler for. */
function capture(e: React.PointerEvent<Element>, take: boolean) {
  try {
    if (take) e.currentTarget.setPointerCapture(e.pointerId);
    else e.currentTarget.releasePointerCapture(e.pointerId);
  } catch {
    /* No capture to take or give back. */
  }
}

/* Left margin for the selected-floor label, in viewBox units. */
const LABEL_X = 10;



/* ⚠️  THE FRAME IS THE BIGGEST TOWER, NOT THIS ONE. The three differ in width
   as well as height now, and fitting each to its own extents would scale them
   all to the same apparent size — the same mistake the heights made before the
   camera was unified. One frame, three buildings, and the differences are
   visible because of it. */
const FRAME_W = maxWidth();
const D = BUILDING_DEPTH;

/** Scale and offset that fit a tower into VIEW at this angle. The balconies
 *  are included in the measured extent — they project 1.5 m past the structure
 *  on both long elevations, and a fit computed without them clips the ones
 *  nearest the camera. */
function fitFor(angle: number, height: number, cam: ReturnType<typeof cameraFor>) {
  const xs: number[] = [];
  const ys: number[] = [];
  const reach = D / 2 + GEOMETRY.balconyDepth;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      for (const y of [0, height]) {
        const p = project((sx * FRAME_W) / 2, y, sz * reach, angle, cam);
        xs.push(p.x);
        ys.push(p.y);
      }
    }
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const pad = 54;
  const scale = Math.min(
    (VIEW.w - pad * 2) / (maxX - minX),
    (VIEW.h - pad * 2) / (maxY - minY),
  );

  return {
    scale,
    dx: VIEW.w / 2 - ((minX + maxX) / 2) * scale,
    dy: VIEW.h / 2 - ((minY + maxY) / 2) * scale,
  };
}

/* ── Elevations ────────────────────────────────────────────────────────────
   Two long elevations carry the apartments — 01–04 on one, 05–08 on the other.
   The two short ends are the gable walls either side of the core and carry
   none. A face is drawn only when it turns toward the camera. */

type Elevation = {
  /** Apartments on this face, in screen order left to right once visible. */
  positions: number[];
  normal: { x: number; z: number };
  /** Corner at ground level, and the step along the face per apartment. */
  origin: { x: number; z: number };
  step: { x: number; z: number };
  bays: number;
  /** Which way a balcony projects from this face. */
  out: { x: number; z: number };
};

function elevationsFor(tower: Tower): Elevation[] {
  const W = widthOf(tower);
  const bays = baysOf(tower);
  /* 1…bays along the front, then the rest along the back, read right to left
     because walking round the block reverses the order — the numbering has to
     follow the building rather than the drawing or a viewer comparing the two
     views finds the apartments swapped. */
  const front = Array.from({ length: bays }, (_, i) => i + 1);
  const rear = Array.from({ length: bays }, (_, i) => tower.perFloor - i);

  return [
    {
      positions: front,
      normal: { x: 0, z: -1 },
      origin: { x: -W / 2, z: -D / 2 },
      step: { x: GEOMETRY.bayWidth, z: 0 },
      bays,
      out: { x: 0, z: -1 },
    },
    {
      positions: rear,
      normal: { x: 0, z: 1 },
      origin: { x: W / 2, z: D / 2 },
      step: { x: -GEOMETRY.bayWidth, z: 0 },
      bays,
      out: { x: 0, z: 1 },
    },
    {
      /* The two ends. No apartments — the core, the stairs and the lift shafts
         are behind these — so they are drawn as plain banded wall. */
      positions: [],
      normal: { x: -1, z: 0 },
      origin: { x: -W / 2, z: D / 2 },
      step: { x: 0, z: -D / 2 },
      bays: 2,
      out: { x: -1, z: 0 },
    },
    {
      positions: [],
      normal: { x: 1, z: 0 },
      origin: { x: W / 2, z: -D / 2 },
      step: { x: 0, z: D / 2 },
      bays: 2,
      out: { x: 1, z: 0 },
    },
  ];
}

/* ── Light ────────────────────────────────────────────────────────────────
   ⚠️  WITHOUT THIS THE BLOCK IS FLAT, and no amount of adjusting the fills
   fixes it. Every face was painted at the same value whichever way it pointed,
   so the two visible elevations met at the corner with nothing to separate
   them and the tower read as a pale silhouette rather than a solid. The
   apartments were not hard to see because they were too light; they were hard
   to see because the building had no form.

   A fixed light in the viewer's world, not the building's, so turning the
   tower swings the shadow across it — which is the cue that tells the eye it
   is looking at something three-dimensional. Front-left and slightly toward
   the camera, the convention for architectural massing. */
const LIGHT = { x: -0.55, z: -0.84 };

/** How much to darken an elevation, 0 for the lit face and up to MAX for the
 *  one turned away. Lambert against the rotated normal: the same arithmetic
 *  that decides whether a face is visible at all, reused. */
const MAX_SHADE = 0.3;

/* ⚠️  AMBIENT, OR THE LIT FACE RENDERS AS PAPER. With shading driven purely by
   the lambert term, the face square to the light gets a shadow of exactly zero
   and every white surface on it — and a facade of this plan has four balcony
   slabs per floor — stays pure --surface. The whole front of the building went
   back to washing out however dark the wall behind it was made.

   Real daylight has a sky term as well as a sun term. This is that: a floor
   under everything, so nothing in the drawing is ever quite paper-white. */
const AMBIENT = 0.12;

function shadeFor(e: Elevation, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const nx = e.normal.x * c - e.normal.z * s;
  const nz = e.normal.x * s + e.normal.z * c;
  const lambert = nx * LIGHT.x + nz * LIGHT.z;
  /* lambert runs -1 (facing away from the light) to 1 (square to it). */
  return AMBIENT + (0.5 - lambert * 0.5) * MAX_SHADE;
}

/** Does this elevation face the camera at this angle? Computed from the
 *  rotated normal rather than switched on quadrant — a quadrant table is four
 *  chances to get a sign wrong. */
function faces(e: Elevation, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return e.normal.x * s + e.normal.z * c < 0;
}

/** How an apartment is drawn.
 *
 *  ⚠️  SEVERITY FIRST, ALWAYS. The state comes from the apartment's captures,
 *  worst first — rework over inspection over work-in-progress over quiet — so
 *  the reds surface over the ambers over the blues over the greys without
 *  anybody hunting for them. It used to come from a `phase` rolled per
 *  apartment at generation time, which had nothing to do with the captures
 *  inside it: a flat with a rework-flagged bathroom could draw blue, and the
 *  tower disagreed with the sheet about the same flat.
 *
 *  ⚠️  "NOT ASKED" IS NOT "NOT STARTED". With a trade focused, an apartment
 *  that has no work of that kind is outside the question, which must not look
 *  like an outstanding capture. Those go to an inert tone rather than to the
 *  pending fill. It is rare at this level and common one level down — every
 *  apartment has a kitchen and a bathroom, so focusing a trade almost never
 *  leaves a whole flat out; it is the floor PLAN where this earns its keep.
 *
 *  The two quiet states keep a DENSITY as well, neutral grey deepening with
 *  sealed certificates, so progress reads without spending colour on it. */
function panelStyle(
  unit: UnitState,
  tower: Tower,
  focus: CaptureFocus | null,
): PhaseStyle {
  if (unit.sealed === 0) return PHASE.pending;

  const state = unitState(unit, tower, focus);
  if (state === null) {
    return {
      fill: "var(--surface-sunken)",
      fillOpacity: 1,
      stroke: "var(--line)",
      strokeWidth: 0.3,
    };
  }

  if (state !== "pending" && state !== "complete") return PHASE[state];

  /* The band is narrow and dark on purpose: only apartments below the poured
     slab are ever drawn, and those always carry at least three certificates —
     the tower's two siteworks plus their own floor — so a ramp starting near
     white wastes most of its range on states that cannot occur. */
  return {
    ...PHASE[state],
    fill: "var(--ink-muted)",
    fillOpacity: 0.26 + (unit.sealed / STAGES.length) * 0.34,
    stroke: "var(--line-strong)",
    strokeWidth: 0.6,
  };
}

/* ── The five states ───────────────────────────────────────────────────────
   One table, read by the elevation, the floor plan and the floor rail, so the
   three views cannot disagree about what a colour means.

   ⚠️  COLOUR IS FOR WHAT NEEDS A PERSON. Pending is hollow and completed is a
   solid neutral: between them they are most of the tower, and spending the
   palette on them leaves nothing to say about the handful of apartments that
   are actually stuck. Progress still reads perfectly well as a solid mass
   rising out of an empty top.

   ⚠️  NOT A SCORE, AND NOT A HEALTH DIAL. These say what stage an apartment
   has reached and whether anything is blocking it — both facts. They say
   nothing about whether the work is any good: the product screens photographs
   for reality and personal data, it does not certify construction quality,
   and a colour implying otherwise would be a claim the company disclaims.

   ⚠️  SELECTION IS INK, NOT ACCENT. Accent means "in progress" here, so the
   selected outline has to be a different thing or a selected pending
   apartment is indistinguishable from a working one. */
type PhaseStyle = {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
};

const PHASE: Record<UnitPhase, PhaseStyle> = {
  pending: {
    fill: "var(--surface)",
    fillOpacity: 1,
    stroke: "var(--line-strong)",
    strokeWidth: 0.6,
  },
  active: {
    /* The solid accent rather than --accent-subtle. The subtle token is
       delphi-50, which is almost white: on a 20-storey elevation the working
       floors were indistinguishable from the empty ones above them. Raised
       again when the fabric went darker — a state colour has to beat the
       material it sits in. */
    fill: "var(--accent)",
    fillOpacity: 0.55,
    stroke: "var(--accent)",
    strokeWidth: 1.3,
  },
  complete: {
    /* ⚠️  THIS VALUE IS THE DIFFERENCE BETWEEN BUILT AND NOT BUILT, and it was
       set far too low. At 0.18 a finished apartment and an untouched one were
       both pale grey rectangles a few percent apart, so the tower read as one
       flat mass and the build front — the single most useful edge on the
       picture — disappeared. Colour is still reserved for what needs a person;
       that was never an argument for the two commonest states being the same
       shade. */
    fill: "var(--ink-muted)",
    fillOpacity: 0.34,
    stroke: "var(--line-strong)",
    strokeWidth: 0.6,
  },
  warning: {
    fill: "var(--pending)",
    fillOpacity: 0.55,
    stroke: "var(--pending)",
    strokeWidth: 1.4,
  },
  problem: {
    fill: "var(--failed)",
    fillOpacity: 0.55,
    stroke: "var(--failed)",
    strokeWidth: 1.4,
  },
};


const PHASE_LABEL: Record<UnitPhase, Bi> = {
  pending: { en: "Not started", es: "Sin iniciar" },
  active: { en: "In progress", es: "En ejecución" },
  complete: { en: "Completed", es: "Terminado" },
  warning: { en: "Needs inspection", es: "Requiere inspección" },
  problem: { en: "Needs rework", es: "Requiere corrección" },
};

/* ── The flight between the two views ─────────────────────────────────────
   Block and plan are not two screens, they are two ends of one move: the
   camera tips to straight down while every floor but the chosen one clears
   out of the way. Cutting between them makes a viewer re-find the floor they
   had selected; flying makes it obvious that the plan IS that floor. */

const FLIGHT_MS = 760;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

/** Ease in and out. Slow at both ends so the camera settles rather than
 *  arriving; the middle is where the distance gets covered. */
const ease = (n: number) =>
  n < 0.5 ? 4 * n * n * n : 1 - Math.pow(-2 * n + 2, 3) / 2;

/* ========================================================================= */

export function TowerExplorer({ showHeader = true, initialTower = TOWERS[1] }: { showHeader?: boolean; initialTower?: Tower }) {
  const t = useT();
  const { lang } = useLang();

  const [towerKey, setTowerKey] = useState(initialTower.key);
  const [angle, setAngle] = useState(DEFAULT_ANGLE);
  const [view, setView] = useState<"block" | "plan" | "unit">("block");
  /* How far the view has flown from the block toward the plan. 0 is the
     three-quarter block, 1 is straight down with the room plan showing.
     `view` is the INTENTION and this is where the picture actually is — they
     differ for the 760ms in between. */
  const [morph, setMorph] = useState(0);

  const tower = TOWERS.find((x) => x.key === towerKey) ?? initialTower;
  const units = UNITS[tower.key];

  /* Opens on the build front — the floor where something is actually
     happening, which is the floor a head of construction would have opened
     himself. */
  /* ⚠️  NULL MEANS THE WHOLE TOWER, and that is the opening state. The panel
     beside the stage summarises whatever is selected; arriving with one
     arbitrary storey already picked would answer a question nobody asked and
     hide the tower-wide figures behind a click. Selecting a floor in the rail
     narrows the summary; "All floors" widens it again. */
  const [floor, setFloor] = useState<number | null>(null);
  const [position, setPosition] = useState<number | null>(null);
  const [asideWidth, setAsideWidth] = useState(ASIDE_DEFAULT);
  /* What the progress table has narrowed the drawings to, or null for
     everything. Lifted here because both the elevation and the plan read it
     and the table that sets it is a third component again. */
  const [focus, setFocus] = useState<CaptureFocus | null>(null);

  /* ⚠️  THE CAMERA IS FRAMED ON THE TALLEST TOWER, NOT ON THIS ONE, and that
     is the whole reason the three heights are visible.

     Framing each tower to fill the view is what any fitting routine does by
     default, and it silently cancels the thing being compared: an 18-storey
     block and a 24-storey block both filled the frame and rendered the same
     size on screen. The heights were right in the data and wrong in the
     picture. One camera and one scale for all three means Torre 1 is visibly
     shorter than Torre 3, which is the point of drawing them at all. */
  const frameHeight = MAX_FLOORS * GEOMETRY.floorHeight;

  /* ── The flight ──
     Eased once, here, and everything else reads the eased value: the camera
     pitch, the rotation squaring up, the floors fading and the crossfade. One
     clock means they cannot drift out of step with each other. */
  const e = ease(morph);

  /* The rotation unwinds to zero as the camera goes overhead, so the plan
     arrives square-on and in the same orientation as the drawing that
     replaces it. Landing on the plan at whatever angle the block happened to
     be turned to would make the two views look like different buildings. */
  const flyAngle = angle * (1 - e);
  const cam = useMemo(
    () => cameraFor(frameHeight, e),
    [frameHeight, e],
  );
  const fit = useMemo(
    () => fitFor(flyAngle, frameHeight, cam),
    [flyAngle, frameHeight, cam],
  );

  /* Crossfade, deliberately overlapping: the block is still on its way down
     when the plan starts arriving, so there is never an empty frame. */
  const blockOpacity = 1 - clamp01((e - 0.5) / 0.4);
  const planOpacity = clamp01((e - 0.55) / 0.45);
  /* Floors other than the selected one clear early, so the floor being opened
     is alone on screen well before the camera finishes its move. */
  const otherFloors = 1 - clamp01(e / 0.55);

  /* Top of the poured structure — the building as it stands today, as opposed
     to the finished envelope at tower.floors. */
  const deck = tower.front.structure * GEOMETRY.floorHeight;
  /* This tower's own footprint, as opposed to FRAME_W which frames all three
     through one camera. */
  const W = widthOf(tower);
  const elevations = useMemo(() => elevationsFor(tower), [tower]);

  /* A floor selected on a taller tower has to survive switching to a shorter
     one, or the aside describes a storey that does not exist. */
  const shownFloor = floor === null ? null : Math.min(floor, tower.floors);

  /* The plan has to draw SOME storey. With nothing selected it opens on the
     build front — the floor where work is actually happening, which is the one
     a head of construction would have opened. */
  const planFloor = shownFloor ?? Math.max(1, tower.front.structure);

  const to = useCallback(
    (x: number, y: number, z: number) => {
      const p = project(x, y, z, flyAngle, cam);
      return { x: p.x * fit.scale + fit.dx, y: p.y * fit.scale + fit.dy };
    },
    [flyAngle, cam, fit],
  );

  const path = useCallback(
    (pts: Point[]) =>
      `${pts
        .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(" ")} Z`,
    [],
  );

  /* ── Dragging ──
     Rotation from the pointer's horizontal travel as a FRACTION of the
     element's on-screen width. The explorer sits inside WebFrame, which scales
     a 1440px canvas by whatever the layout gives it, so raw client pixels
     would turn the block at different speeds on a phone and a monitor. */
  const drag = useRef<{ x: number; angle: number; width: number } | null>(null);
  /* ⚠️  A ROTATE ENDS IN A CLICK. Turning the tower is a pointer-down, a lot of
     movement and a pointer-up, and the browser fires `click` after that like
     any other — so without this every drag that happened to finish over empty
     sky would clear the floor selection. Set on pointer-up, read by the click
     handler a moment later. */
  const dragged = useRef(false);
  /* What the pointer went down on: an apartment, or the ground and sky. Read
     here because by pointer-up the capture has retargeted everything to the
     stage. */
  const hit = useRef<{ storey: number; position: number | null } | null>(null);

  /* ── Dragging the divider ──
     ⚠️  THE DELTA IS DIVIDED BY THE STAGE'S OWN SCALE. On /platform/enterprise
     the explorer lives inside WebFrame, which scales a 1440px canvas down to
     whatever the column gives it — so a pointer moving 100 screen pixels
     crosses rather more than 100 canvas pixels, and a handle that ignored that
     would race away from the cursor on one page and lag it on the other. The
     ratio of the rendered width to the layout width is that scale. */
  const root = useRef<HTMLDivElement>(null);
  const split = useRef<{ x: number; width: number; scale: number } | null>(null);

  const onSplitDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = root.current;
    const scale = el ? el.getBoundingClientRect().width / el.offsetWidth : 1;
    split.current = { x: e.clientX, width: asideWidth, scale: scale || 1 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onSplitMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = split.current;
    if (!d) return;
    const moved = (e.clientX - d.x) / d.scale;
    setAsideWidth(
      Math.min(ASIDE_MAX, Math.max(ASIDE_MIN, d.width - moved)),
    );
  };

  const onSplitUp = (e: React.PointerEvent<HTMLDivElement>) => {
    split.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = {
      x: e.clientX,
      angle,
      width: e.currentTarget.getBoundingClientRect().width,
    };
    dragged.current = false;

    const panel = (e.target as Element).closest?.("[data-storey]");
    const storey = panel?.getAttribute("data-storey");
    const pos = panel?.getAttribute("data-position");
    hit.current = storey
      ? { storey: Number(storey), position: pos ? Number(pos) : null }
      : null;

    capture(e, true);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    /* A few pixels of travel is a click with a shaky hand, not a drag. */
    if (Math.abs(e.clientX - d.x) > 3) dragged.current = true;
    setAngle(d.angle + ((e.clientX - d.x) / d.width) * Math.PI * 2);
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = null;

    /* ⚠️  SELECTION FIRST, CAPTURE RELEASE AFTER. releasePointerCapture throws
       NotFoundError if the capture is not held — a cancelled pointer, one
       released outside the element, a synthetic event — and an exception here
       used to abort the rest of the handler, so clicking the sky silently did
       nothing while clicking a floor worked. Nothing that matters belongs
       behind a call that can throw. */
    if (!dragged.current) {
      /* ⚠️  THE FLOOR, AND ONLY THE FLOOR. Setting the apartment too opened
         the capture sheet, which replaces the whole explorer — so a click
         meant to pick a storey threw the viewer out of the view they were
         working in. Choosing an apartment belongs to the plan, where the
         rooms are big enough to aim at and the sheet is a step forward rather
         than a surprise. */
      setFloor(hit.current ? hit.current.storey : null);
      setPosition(null);
    }
    hit.current = null;
    capture(e, false);
  };

  /* A cancelled pointer is not a click: the gesture was taken away rather than
     finished, so it selects nothing. */
  const onPointerCancel = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = null;
    hit.current = null;
    capture(e, false);
  };


  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = Math.PI / 24;
    if (e.key === "ArrowLeft") setAngle((a) => a - step);
    else if (e.key === "ArrowRight") setAngle((a) => a + step);
    else if (e.key === "ArrowUp")
      setFloor((f) => Math.min(tower.floors, (f ?? 0) + 1));
    else if (e.key === "ArrowDown")
      setFloor((f) => (f === null ? tower.floors : Math.max(1, f - 1)));
    else return;
    e.preventDefault();
  };

  /* ⚠️  THE TARGET IS `view`; THE LOOP CHASES IT. Starting a timed tween on
     each click would mean a viewer who changes their mind mid-flight gets two
     animations fighting over one value. This reads the current intention every
     frame and turns round wherever it is, so a double-click just reverses. */
  useEffect(() => {
    /* The unit view is reached from the plan and sits over it, so the camera
       stays where the plan left it rather than flying home and back. */
    const want = view === "block" ? 0 : 1;

    /* A viewer who has asked for less motion gets the destination, not the
       journey. The two views are both complete pictures; only the flight
       between them is decoration. */
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setMorph(want);
      return;
    }

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = (now - last) / FLIGHT_MS;
      last = now;
      let done = false;
      setMorph((m) => {
        const next = want > m ? Math.min(want, m + dt) : Math.max(want, m - dt);
        if (next === want) done = true;
        return next;
      });
      if (!done) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [view]);

  const plate = units.filter((u) => u.floor === planFloor);
  const selected = plate.find((u) => u.position === position) ?? null;

  /* ⚠️  THE PLAN IS ALWAYS ONE FLOOR, so entering it has to settle which. With
     nothing selected the plan opened on the build front while the selector
     still read "All floors" and the panel still summarised the whole tower —
     three parts of the screen describing different scopes at once. Entering
     the plan now commits to the storey it is about to draw. */
  const show = (next: "block" | "plan" | "unit") => {
    if (next !== "block" && floor === null) setFloor(planFloor);
    setView(next);
  };

  const selectTower = (key: string) => {
    setTowerKey(key);
    setPosition(null);
    /* Back to the whole tower. Carrying a floor selection across is carrying
       an answer to a question about a different building — and on a shorter
       tower it may not be a storey that exists. */
    setFloor(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-canvas">
      {showHeader && (
        <ExplorerHeader
          tower={tower}
          onTower={selectTower}
          view={view}
          onView={show}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 items-center justify-center">
          {/* The apartment, over the plan it was chosen from. The panel on the
              right is untouched: drilling in narrows the drawing, not the
              instruments beside it. */}
          {view === "unit" && selected && (
            <div className="absolute inset-0 z-20">
              <ApartmentPane
                unit={selected}
                tower={tower}
                focus={focus}
                onClearFocus={() => setFocus(null)}
                onBack={() => show("plan")}
              />
            </div>
          )}
          {/* Both layers are mounted through the flight and crossfade; only
              once the move has finished is the far one taken out of the tree.
              Unmounting either mid-flight is what produces the empty frame
              this whole transition exists to avoid. */}
          {morph < 1 && (
            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
              style={{
                opacity: blockOpacity,
                pointerEvents: morph === 0 ? "auto" : "none",
              }}
              role="img"
              tabIndex={0}
              aria-label={
                lang === "es"
                  ? `${tower.name}: ${tower.floors} pisos, ${unitsIn(tower)} apartamentos. Flechas para girar y cambiar de piso.`
                  : `${tower.name}: ${tower.floors} floors, ${unitsIn(tower)} apartments. Arrow keys rotate and change floor.`
              }
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              onKeyDown={onKeyDown}
            >
              <path
                d={path([
                  to(-FRAME_W * 1.6, 0, -D * 2.1),
                  to(FRAME_W * 1.6, 0, -D * 2.1),
                  to(FRAME_W * 1.6, 0, D * 2.1),
                  to(-FRAME_W * 1.6, 0, D * 2.1),
                ])}
                /* ⚠️  THE GROUND CARRIES THE WHOLE VALUE STRUCTURE. At
                   --surface-sunken it was within a few percent of the canvas
                   behind it and of the building standing on it, so the tower
                   had nothing to sit on and no silhouette. It wants to be the
                   darkest large area on the screen after the unlit elevation:
                   everything else is read relative to it. */
                fill="var(--ink)"
                fillOpacity={0.14}
                stroke="var(--line-strong)"
                strokeWidth={1}
              />

              {/* Walls first, then every balcony on top of them. Balconies
                  project toward the camera and must paint over the elevation
                  they hang off; interleaving them floor by floor would let a
                  higher storey's wall cover the balcony below it. */}
              {elevations.filter((e) => faces(e, angle)).map((e, i) => (
                <Elevation
                  key={`w${i}`}
                  fade={otherFloors}
                  shade={shadeFor(e, flyAngle)}
                  elevation={e}
                  tower={tower}
                  units={units}
                  focus={focus}
                  floor={shownFloor}
                  to={to}
                  path={path}
                />
              ))}

              {elevations.filter((e) => faces(e, angle) && e.positions.length).map(
                (e, i) => (
                  <Balconies
                    key={`b${i}`}
                    fade={otherFloors}
                    shade={shadeFor(e, flyAngle)}
                    elevation={e}
                    tower={tower}
                    units={units}
                    to={to}
                    path={path}
                  />
                ),
              )}

              {/* The working deck: the topmost poured slab, which is the real
                  top of the building today. Drawn after the elevations so it
                  caps them. */}
              <path
                d={path([
                  to(-W / 2, deck, -D / 2),
                  to(W / 2, deck, -D / 2),
                  to(W / 2, deck, D / 2),
                  to(-W / 2, deck, D / 2),
                ])}
                fill="var(--surface)"
                stroke="var(--line-strong)"
                strokeWidth={1.25}
              />
              {/* The deck faces straight up, so it is the lightest plane in
                  the drawing — but it still takes the ambient, or it reads as
                  a hole cut in the top of the building. */}
              <path
                d={path([
                  to(-W / 2, deck, -D / 2),
                  to(W / 2, deck, -D / 2),
                  to(W / 2, deck, D / 2),
                  to(-W / 2, deck, D / 2),
                ])}
                fill="var(--ink)"
                opacity={AMBIENT * 0.5}
                pointerEvents="none"
              />

              <GhostEnvelope tower={tower} width={W} to={to} path={path} />

              {/* No slab called out while the whole tower is selected —
                  highlighting an arbitrary storey would imply a selection
                  that has not been made. */}
              {shownFloor !== null && (
                <SelectedSlab
                  floor={shownFloor}
                  width={W}
                  to={to}
                  path={path}
                  lang={lang}
                />
              )}
            </svg>
          )}

          {morph > 0 && (
            <div
              className="absolute inset-0"
              style={{
                opacity: planOpacity,
                /* Inert until it is actually the thing on screen, so a click
                   during the flight lands on the view the viewer can see. */
                pointerEvents: morph === 1 ? "auto" : "none",
              }}
            >
              <FloorPlate
                units={plate}
                tower={tower}
                floor={planFloor}
                focus={focus}
                onClearFocus={() => setFocus(null)}
                selected={position}
                onSelect={setPosition}
              />
            </div>
          )}

          {/* ⚠️  BESIDE WHAT IT EXPLAINS. The key lived at the foot of the
              right-hand panel, which is the one part of the screen it says
              nothing about — the panel is figures, and these are the colours
              of the drawing. Over the stage it is where the eye already is
              when it meets a colour it does not recognise. */}
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm border border-line bg-canvas/85 px-3 py-2 backdrop-blur-sm">
            <Legend />
          </div>

        </div>

        {/* The handle. A hairline with a generous hit area either side of it —
            a 1px target is a 1px target however well it is drawn. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize panel"
          tabIndex={0}
          onPointerDown={onSplitDown}
          onPointerMove={onSplitMove}
          onPointerUp={onSplitUp}
          onPointerCancel={onSplitUp}
          onKeyDown={(e) => {
            /* Keyboard parity: a divider that only answers to a pointer is not
               a control, and this one changes layout. */
            const step = e.shiftKey ? 48 : 16;
            if (e.key === "ArrowLeft")
              setAsideWidth((w) => Math.min(ASIDE_MAX, w + step));
            else if (e.key === "ArrowRight")
              setAsideWidth((w) => Math.max(ASIDE_MIN, w - step));
            else if (e.key === "Enter") setAsideWidth(ASIDE_DEFAULT);
            else return;
            e.preventDefault();
          }}
          className="group relative z-10 -mx-1 w-2 shrink-0 cursor-col-resize touch-none"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-line transition-colors group-hover:bg-accent group-focus-visible:bg-accent"
          />
        </div>

        <aside
          style={{ width: asideWidth }}
          className="flex shrink-0 flex-col gap-4 overflow-hidden p-5"
        >
          <div>
            <p className="font-mono text-mono-sm uppercase text-ink-muted">
              {tower.name}
            </p>
            <p className="mt-1 text-heading text-ink">
              {shownFloor === null
                ? t({
                    en: `${unitsIn(tower)} apartments`,
                    es: `${unitsIn(tower)} apartamentos`,
                  })
                : t({
                    en: `Floor ${shownFloor} · ${tower.perFloor} apartments`,
                    es: `Piso ${shownFloor} · ${tower.perFloor} apartamentos`,
                  })}
            </p>
            <p className="mt-1 text-body-sm text-ink-secondary">
              {shownFloor === null
                ? t({
                    en: `${tower.floors} floors · ${tower.perFloor} per floor`,
                    es: `${tower.floors} pisos · ${tower.perFloor} por piso`,
                  })
                : t({
                    en: `${APARTMENT.area.toFixed(0)} m² · ${ROOMS.length} rooms and a balcony each`,
                    es: `${APARTMENT.area.toFixed(0)} m² · ${ROOMS.length} ambientes y un balcón cada uno`,
                  })}
            </p>
          </div>

          {/* ⚠️  THE ONLY FLOOR CONTROL, and it belongs to both views. It was a
              rail of 21 rows floating over the stage, which was tolerable above
              the block and ran straight under the floor plan — the plate is far
              wider than the tower is. A select costs one line here and works
              the same whichever view is showing. */}
          <FloorSelect
            tower={tower}
            floor={shownFloor}
            onFloor={setFloor}
          />

          {/* ⚠️  SELECTING IS NOT OPENING. Clicking an apartment on the plan
              used to drop you straight into its sheet, which is a view change
              nobody asked for — you were picking a flat, not leaving the
              floor. The click selects; these buttons are how you move, and
              each names where it goes.

              Both are present in the plan: going in and going back out are
              different journeys, and offering only the one you have not taken
              strands whoever wanted the other. */}
          <div className="flex flex-col gap-2">
            {view === "plan" && selected && (
              <button
                type="button"
                onClick={() => show("unit")}
                className="cursor-pointer rounded-sm border border-accent px-3 py-1.5 text-body-sm text-ink transition-colors hover:bg-surface-sunken"
              >
                {t({
                  en: `Apartment ${selected.code} details →`,
                  es: `Detalles del apartamento ${selected.code} →`,
                })}
              </button>
            )}

            <button
              type="button"
              /* One step back, not two: from an apartment you came from its
                 floor, and skipping the floor on the way out loses the place
                 you were working in. */
              onClick={() =>
                show(
                  view === "block" ? "plan" : view === "unit" ? "plan" : "block",
                )
              }
              className="cursor-pointer rounded-sm border border-line px-3 py-1.5 text-body-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
            >
              {view === "block"
                ? t({
                    en: `Floor ${planFloor} details →`,
                    es: `Detalles del piso ${planFloor} →`,
                  })
                : view === "unit"
                  ? t({
                      en: `← Back to floor ${planFloor}`,
                      es: `← Volver al piso ${planFloor}`,
                    })
                  : t({ en: "← Back to the tower", es: "← Volver a la torre" })}
            </button>
          </div>

          {/* The selector stays reachable whatever is selected, so a storey
              above the build front narrows only the panel below it rather than
              replacing the control that would let you leave. */}
          {shownFloor !== null && shownFloor > tower.front.structure ? (
            <NotBuiltYet tower={tower} floor={shownFloor} />
          ) : (
            <TowerProgress
              tower={tower}
              floor={shownFloor}
              focus={focus}
              onFocus={setFocus}
            />
          )}

        </aside>
      </div>
    </div>
  );
}

/* ── Header ──────────────────────────────────────────────────────────────── */

function ExplorerHeader({
  tower,
  onTower,
  view,
  onView,
}: {
  tower: Tower;
  onTower: (key: string) => void;
  view: "block" | "plan" | "unit";
  onView: (v: "block" | "plan") => void;
}) {
  const t = useT();

  return (
    <header className="flex shrink-0 items-center gap-4 border-b border-line px-5 py-3.5">
      <div className="flex items-baseline gap-2.5">
        <h2 className="text-heading text-ink">Ciudadela Altavista</h2>
        <span className="font-mono text-mono-sm text-ink-muted">
          {t({ en: "Development", es: "Proyecto" })}
        </span>
      </div>

      <div className="ml-4 flex gap-1">
        {TOWERS.map((x) => (
          <button
            key={x.key}
            type="button"
            onClick={() => onTower(x.key)}
            aria-current={x.key === tower.key ? "true" : undefined}
            className={cn(
              "flex cursor-pointer items-baseline gap-1.5 rounded-sm border px-2.5 py-1 text-body-sm transition-colors",
              x.key === tower.key
                ? "border-accent text-ink"
                : "border-line text-ink-muted hover:text-ink-secondary",
            )}
          >
            {x.name}
            {/* The height is on the button because the three towers differ and
                a viewer should not have to count storeys to find out. */}
            <span className="font-mono text-mono-sm text-ink-muted">
              {x.floors}
            </span>
          </button>
        ))}
      </div>

      <div className="ml-auto flex rounded-sm border border-line">
        {(
          [
            ["block", { en: "Block", es: "Volumen" }],
            ["plan", { en: "Floor plan", es: "Planta" }],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onView(key)}
            aria-pressed={view === key}
            className={cn(
              "cursor-pointer px-3 py-1 text-body-sm transition-colors",
              view === key
                ? "bg-surface-sunken text-ink"
                : "text-ink-muted hover:text-ink-secondary",
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>
    </header>
  );
}

/* ── One elevation ───────────────────────────────────────────────────────── */

function Elevation({
  elevation: e,
  tower,
  units,
  focus,
  floor,
  fade,
  shade,
  to,
  path,
}: {
  elevation: Elevation;
  tower: Tower;
  units: UnitState[];
  /** What the table has narrowed the question to, or null for overall
   *  progress. */
  focus: CaptureFocus | null;
  /** The selected storey, or null while the whole tower is selected. */
  floor: number | null;
  /** Opacity for every storey except the selected one, 1 at rest and 0 by the
   *  time the camera is overhead — the floor being opened is left alone on
   *  screen before the plan arrives to replace it. */
  fade: number;
  /** How far this elevation is turned away from the light. */
  shade: number;
  to: (x: number, y: number, z: number) => Point;
  path: (pts: Point[]) => string;
}) {
  const quads: React.ReactNode[] = [];

  /* ⚠️  ONLY WHAT IS BUILT GETS FABRIC. Storeys above the poured slab are
     drawn by GhostEnvelope as a dashed outline instead — solid walls and
     windows up there would show a tower that does not exist, which is the
     same lie the balconies are already suppressed for. */
  for (let f = 0; f < tower.front.structure; f++) {
    const y0 = f * GEOMETRY.floorHeight;
    const y1 = y0 + GEOMETRY.floorHeight;
    const storey = f + 1;

    for (let bay = 0; bay < e.bays; bay++) {
      const ax = e.origin.x + e.step.x * bay;
      const az = e.origin.z + e.step.z * bay;
      const bx = ax + e.step.x;
      const bz = az + e.step.z;

      const position = e.positions[bay];
      const unit = position
        ? units.find((u) => u.floor === storey && u.position === position)
        : undefined;

      /* A bay with no apartment behind it is the gable wall at either end of
         the plate. Drawn, never styled as though it held evidence. */
      const style: PhaseStyle = unit
        ? panelStyle(unit, tower, focus)
        : PHASE.pending;

      /* The selected storey is outlined in ink over whatever the apartment's
         own state is, so picking a floor never hides a blocked apartment on
         it — the two are different axes and are drawn as different things. */
      const on = storey === floor;

      quads.push(
        <path
          key={`${storey}-${bay}`}
          d={path([to(ax, y0, az), to(bx, y0, bz), to(bx, y1, bz), to(ax, y1, az)])}
          fill={style.fill}
          fillOpacity={style.fillOpacity}
          opacity={on ? 1 : fade}
          stroke={on ? "var(--ink)" : style.stroke}
          strokeWidth={on ? 1.6 : style.strokeWidth}
          className="cursor-pointer"
          /* ⚠️  NO onClick HERE, AND THAT IS NOT AN OVERSIGHT. The stage
             captures the pointer on pointer-down so it can be dragged to
             rotate, and a captured pointer retargets the following `click` to
             the capturing element — so a handler on this path never ran, and
             the stage's own handler cleared the selection instead. Selection
             is resolved from the pointer-DOWN target instead; these attributes
             are what it reads. */
          data-storey={storey}
        />,
      );

      /* Openings, so the elevation reads as a dwelling rather than a shaded
         rectangle — and so the balconies are reachable.

         Two of them, because the apartment has two kinds. The sala opens onto
         its balcony through a full-height sliding door, which is how every one
         of these plans works; the bedroom beside it gets an ordinary window
         with a sill. A balcony with no door onto it was the giveaway that
         these were decoration rather than a drawing of the plan. */
      if (unit) {
        const opening = (
          key: string,
          f0: number,
          f1: number,
          low: number,
          high: number,
          alpha: number,
        ) => {
          const y1 = y0 + GEOMETRY.floorHeight * high;
          const yl = y0 + GEOMETRY.floorHeight * low;
          return (
            <path
              key={key}
              d={path([
                to(ax + e.step.x * f0, yl, az + e.step.z * f0),
                to(ax + e.step.x * f1, yl, az + e.step.z * f1),
                to(ax + e.step.x * f1, y1, az + e.step.z * f1),
                to(ax + e.step.x * f0, y1, az + e.step.z * f0),
              ])}
              fill="var(--surface)"
              fillOpacity={0.62}
              opacity={alpha}
              stroke="var(--line)"
              strokeWidth={0.4}
              pointerEvents="none"
            />
          );
        };

        /* The door sits within the balcony's own frontage — 0 to 0.583 of the
           bay — so it opens onto the slab rather than onto thin air. Its foot
           is at floor level, which the parapet drawn later partly hides,
           exactly as it would on the building. */
        quads.push(opening(`door-${storey}-${bay}`, 0.14, 0.46, 0.04, 0.82, on ? 1 : fade));
        quads.push(opening(`win-${storey}-${bay}`, 0.68, 0.92, 0.3, 0.78, on ? 1 : fade));
      }
    }
  }

  /* The shadow goes over the whole elevation at once rather than into each
     panel's fill: one translucent quad is cheaper than recolouring 150
     rectangles, and it keeps a face's shading independent of what the
     apartments behind it happen to be doing. */
  const corner = (bay: number, y: number) =>
    to(e.origin.x + e.step.x * bay, y, e.origin.z + e.step.z * bay);
  const top = tower.front.structure * GEOMETRY.floorHeight;

  return (
    <>
      {quads}
      <path
        d={path([corner(0, 0), corner(e.bays, 0), corner(e.bays, top), corner(0, top)])}
        fill="var(--ink)"
        opacity={shade}
        pointerEvents="none"
      />
    </>
  );
}

/* ── The part that is not built yet ──────────────────────────────────────── */

/** The designed envelope above the topmost poured slab, as a dashed cage.
 *
 *  A head of construction looking at this needs two facts in one glance: how
 *  far the structure has got, and how far it has left to go. Drawing the
 *  remainder as solid fabric gives him the second and destroys the first —
 *  the tower reads as finished and the build front disappears. Drawing
 *  nothing at all gives him the first and loses the proportion.
 *
 *  So: storey lines and corner posts, dashed, no fill, no windows and no
 *  balconies. It is unmistakably a drawing of something that is not there. */
function GhostEnvelope({
  tower,
  width: W,
  to,
  path,
}: {
  tower: Tower;
  width: number;
  to: (x: number, y: number, z: number) => Point;
  path: (pts: Point[]) => string;
}) {
  const from = tower.front.structure;
  if (from >= tower.floors) return null;

  const corners: [number, number][] = [
    [-W / 2, -D / 2],
    [W / 2, -D / 2],
    [W / 2, D / 2],
    [-W / 2, D / 2],
  ];

  const lines: React.ReactNode[] = [];

  /* A storey line per remaining floor, including the finished roof. */
  for (let f = from; f <= tower.floors; f++) {
    const y = f * GEOMETRY.floorHeight;
    lines.push(
      <path
        key={`r${f}`}
        d={path(corners.map(([x, z]) => to(x, y, z)))}
        fill="none"
        stroke="var(--line-strong)"
        strokeWidth={f === tower.floors ? 1 : 0.5}
        strokeDasharray={f === tower.floors ? "4 3" : "2 4"}
      />,
    );
  }

  /* Corner posts, so the cage has verticals and does not read as a stack of
     floating rings. */
  for (const [x, z] of corners) {
    const a = to(x, from * GEOMETRY.floorHeight, z);
    const b = to(x, tower.floors * GEOMETRY.floorHeight, z);
    lines.push(
      <line
        key={`p${x}-${z}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        stroke="var(--line-strong)"
        strokeWidth={0.8}
        strokeDasharray="4 3"
      />,
    );
  }

  return <g pointerEvents="none">{lines}</g>;
}

/* ── Balconies ───────────────────────────────────────────────────────────── */

/** One projecting slab and its parapet per apartment, bottom to top.
 *
 *  Bottom to top matters: looking down from above the roof, a balcony's slab
 *  is drawn below the one on the storey above it, so later-drawn (higher)
 *  balconies never cover earlier ones. Reverse the order and every balcony is
 *  clipped by its upstairs neighbour's underside. */
function Balconies({
  elevation: e,
  tower,
  units,
  fade,
  shade,
  to,
  path,
}: {
  elevation: Elevation;
  tower: Tower;
  units: UnitState[];
  fade: number;
  /** ⚠️  BALCONIES ARE LIT TOO, and leaving them out undid the shading. They
   *  are drawn in a pass after the elevations so they can overlap the wall
   *  they hang off, which also put them in front of its shadow — two hundred
   *  white slabs and parapets covering the very surface that had just been
   *  darkened. The tower went back to looking flat. */
  shade: number;
  to: (x: number, y: number, z: number) => Point;
  path: (pts: Point[]) => string;
}) {
  const parts: React.ReactNode[] = [];
  const { balcony } = APARTMENT;
  /* How far along the bay the balcony starts and ends, as fractions — the
     balcony is 4.2 m of a 7.2 m frontage, sitting against the sala. */
  const f0 = balcony.x / APARTMENT.width;
  const f1 = (balcony.x + balcony.width) / APARTMENT.width;
  const parapet = 1.05;

  for (let f = 0; f < tower.floors; f++) {
    const y = f * GEOMETRY.floorHeight;
    const storey = f + 1;

    for (let bay = 0; bay < e.bays; bay++) {
      const position = e.positions[bay];
      const unit = units.find(
        (u) => u.floor === storey && u.position === position,
      );
      /* No balcony on a storey whose slab is not poured. The structure is what
         a balcony is cantilevered off; drawing one into the air above the
         build front would be the most visible possible lie on the screen. */
      if (!unit || unit.sealed === 0) continue;

      const ax = e.origin.x + e.step.x * f0;
      const az = e.origin.z + e.step.z * f0;
      const bx = e.origin.x + e.step.x * f1;
      const bz = e.origin.z + e.step.z * f1;
      const ox = e.out.x * GEOMETRY.balconyDepth;
      const oz = e.out.z * GEOMETRY.balconyDepth;

      const inA = { x: ax + e.step.x * bay, z: az + e.step.z * bay };
      const inB = { x: bx + e.step.x * bay, z: bz + e.step.z * bay };
      const outA = { x: inA.x + ox, z: inA.z + oz };
      const outB = { x: inB.x + ox, z: inB.z + oz };

      /* Slab: the surface you stand on, seen from above. */
      parts.push(
        <path
          key={`s-${storey}-${bay}`}
          d={path([
            to(inA.x, y, inA.z),
            to(inB.x, y, inB.z),
            to(outB.x, y, outB.z),
            to(outA.x, y, outA.z),
          ])}
          fill="var(--surface)"
          stroke="var(--line-strong)"
          strokeWidth={0.5}
          pointerEvents="none"
        />,
      );

      /* Parapet: the outer face, which is what actually reads as a balcony at
         this size — the slab alone looks like a ledge.

         Three faces, not one: the outer parapet and both side returns. A
         balcony walled only at the front is a thing you could step off the
         end of, and at this scale the eye reads the missing returns as a
         drawing error long before it reads them as a safety one. */
      const faceKeys = ["out", "sideA", "sideB"] as const;
      const faceCorners: [Point, Point][] = [
        [to(outA.x, y, outA.z), to(outB.x, y, outB.z)],
        [to(inA.x, y, inA.z), to(outA.x, y, outA.z)],
        [to(outB.x, y, outB.z), to(inB.x, y, inB.z)],
      ];
      const faceTops: [Point, Point][] = [
        [to(outA.x, y + parapet, outA.z), to(outB.x, y + parapet, outB.z)],
        [to(inA.x, y + parapet, inA.z), to(outA.x, y + parapet, outA.z)],
        [to(outB.x, y + parapet, outB.z), to(inB.x, y + parapet, inB.z)],
      ];

      for (let i = 0; i < faceKeys.length; i++) {
        const [a, b] = faceCorners[i];
        const [ta, tb] = faceTops[i];
        const d = path([a, b, tb, ta]);
        parts.push(
          <path
            key={`p-${storey}-${bay}-${faceKeys[i]}`}
            d={d}
            fill="var(--surface-sunken)"
            stroke="var(--line-strong)"
            strokeWidth={0.5}
            pointerEvents="none"
          />,
        );
        /* The outer parapet shares the elevation's normal and takes its
           shading; the two returns face sideways, so they sit between the lit
           and unlit extremes whichever way the block is turned. */
        parts.push(
          <path
            key={`sh-${storey}-${bay}-${faceKeys[i]}`}
            d={d}
            fill="var(--ink)"
            opacity={i === 0 ? shade : (shade + MAX_SHADE * 0.5) / 2}
            pointerEvents="none"
          />,
        );
      }
    }
  }

  /* Faded as one group: a balcony belongs to its storey and goes with it. */
  return (
    <g pointerEvents="none" opacity={fade}>
      {parts}
    </g>
  );
}

/* ── The selected slab, called out ───────────────────────────────────────── */

function SelectedSlab({
  floor,
  width: W,
  to,
  path,
  lang,
}: {
  floor: number;
  width: number;
  to: (x: number, y: number, z: number) => Point;
  path: (pts: Point[]) => string;
  lang: "en" | "es";
}) {
  const y = floor * GEOMETRY.floorHeight;
  const ring = [
    to(-W / 2, y, -D / 2),
    to(W / 2, y, -D / 2),
    to(W / 2, y, D / 2),
    to(-W / 2, y, D / 2),
  ];
  const anchor = to(-W / 2, y, D / 2);

  return (
    <g pointerEvents="none">
      <path d={path(ring)} fill="none" stroke="var(--accent)" strokeWidth={2} />
      {/* ⚠️  PINNED TO THE EDGE OF THE FRAME, NOT OFFSET FROM THE SLAB. A
          fixed offset is a guess about how wide the tower will draw, and it
          was wrong as soon as the explorer was embedded somewhere with
          different proportions — the label landed on the building it was
          naming. Anchored at the left margin it cannot overlap anything,
          whatever the container. */}
      <line
        x1={anchor.x}
        y1={anchor.y}
        x2={LABEL_X + 6}
        y2={anchor.y + 4}
        stroke="var(--accent)"
        strokeWidth={1}
      />
      <text
        x={LABEL_X}
        y={anchor.y + 8}
        textAnchor="start"
        className="font-mono"
        fontSize={13}
        fill="var(--ink)"
      >
        {lang === "es" ? `Piso ${floor}` : `Floor ${floor}`}
      </text>
    </g>
  );
}

/* ── Floor selector ──────────────────────────────────────────────────────── */

/** Which storey the panel and the stage are showing.
 *
 *  ⚠️  IT CARRIES WHAT THE RAIL CARRIED. The rail it replaced was not only a
 *  list of numbers — it showed a progress bar per storey and a dot where
 *  something needed chasing, which is how you found the floor worth opening.
 *  A bare list of 21 numbers would have lost that, so each option says what is
 *  wrong with its floor. The information survives the control changing shape.
 */
function FloorSelect({
  tower,
  floor,
  onFloor,
}: {
  tower: Tower;
  floor: number | null;
  onFloor: (f: number | null) => void;
}) {
  const t = useT();
  const units = UNITS[tower.key];

  const label = (f: number) => {
    const on = units.filter((u) => u.floor === f);
    if (f > tower.front.structure) {
      return t({ en: `Floor ${f} · not built`, es: `Piso ${f} · sin construir` });
    }
    const rework = on.filter((u) => unitState(u, tower) === "problem").length;
    const inspect = on.filter((u) => unitState(u, tower) === "warning").length;
    if (rework) {
      return t({
        en: `Floor ${f} · ${rework} to rework`,
        es: `Piso ${f} · ${rework} por corregir`,
      });
    }
    if (inspect) {
      return t({
        en: `Floor ${f} · ${inspect} to inspect`,
        es: `Piso ${f} · ${inspect} por inspeccionar`,
      });
    }
    return t({ en: `Floor ${f}`, es: `Piso ${f}` });
  };

  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-mono-sm uppercase text-ink-muted">
        {t({ en: "Showing", es: "Mostrando" })}
      </span>
      <select
        value={floor ?? "all"}
        onChange={(e) =>
          onFloor(e.target.value === "all" ? null : Number(e.target.value))
        }
        className="w-full cursor-pointer rounded-sm border border-line bg-surface px-2.5 py-1.5 text-body-sm text-ink transition-colors hover:border-line-strong"
      >
        <option value="all">
          {t({ en: "All floors", es: "Todos los pisos" })}
        </option>
        {/* Top down, the way the rail read and the way a tower is drawn. */}
        {Array.from({ length: tower.floors }, (_, i) => tower.floors - i).map(
          (f) => (
            <option key={f} value={f}>
              {label(f)}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

/* ── Floor plan ──────────────────────────────────────────────────────────── */

/** The selected floor from above: eight apartments either side of the core,
 *  each drawn with its rooms and its balcony.
 *
 *  ⚠️  IT HAS TO AGREE WITH THE BLOCK. Apartments 01–04 are one long
 *  elevation and 05–08 the other, in both views — see ELEVATIONS — and the
 *  balcony is on the sala side in both, because both read APARTMENT. */
function FloorPlate({
  units,
  tower,
  floor,
  selected,
  onSelect,
  focus,
  onClearFocus,
}: {
  units: UnitState[];
  tower: Tower;
  floor: number;
  focus: CaptureFocus | null;
  /** Clicking off the plate clears the row filter, exactly as it does in the
   *  apartment pane — the same gesture should mean the same thing in both
   *  drawings or it is not a gesture, it is a quirk of one screen. */
  onClearFocus: () => void;
  selected: number | null;
  onSelect: (p: number | null) => void;
}) {
  const t = useT();
  /* Half the plate to a row, which is no longer four. */
  const half = baysOf(tower);
  const front = units
    .filter((u) => u.position <= half)
    .sort((a, b) => a.position - b.position);
  const rear = units
    .filter((u) => u.position > half)
    .sort((a, b) => b.position - a.position);

  /* Plan coordinates in metres, balconies included on both sides. */
  const planW = widthOf(tower);
  const planD = BUILDING_DEPTH + GEOMETRY.balconyDepth * 2;

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 p-6"
      /* The svg is capped at max-w-3xl, so on a wide stage the space either
         side of it belongs to this div rather than to the drawing. Without
         this, half the "off the plan" area did nothing. */
      onClick={(e) => {
        if (e.target === e.currentTarget) onClearFocus();
      }}
    >
      <p className="font-mono text-mono-sm uppercase text-ink-muted">
        {t({ en: "Floor", es: "Piso" })} {floor} ·{" "}
        {t({ en: "plate", es: "planta" })}
      </p>

      <svg
        viewBox={`0 0 ${planW} ${planD}`}
        className="max-h-full w-full max-w-3xl"
        /* Target-checked rather than position-checked: the svg keeps its
           aspect ratio, so a click landing on the element itself is a click on
           the margin round the drawing, while an apartment or a room is a
           child and must be left alone. */
        onClick={(e) => {
          if (e.target === e.currentTarget) onClearFocus();
        }}
        role="img"
        aria-label={
          t({ en: "Floor plan", es: "Planta" }) + ` ${floor}`
        }
      >
        {/* Rear row, balconies facing up the page. */}
        {rear.map((u, i) => (
          <ApartmentPlan
            key={u.code}
            unit={u}
            tower={tower}
            focus={focus}
            x={i * APARTMENT.width}
            y={GEOMETRY.balconyDepth}
            selected={selected === u.position}
            onSelect={() => onSelect(selected === u.position ? null : u.position)}
          />
        ))}

        {/* The core, between the two rows. */}
        <rect
          x={0}
          y={GEOMETRY.balconyDepth + APARTMENT.depth}
          width={planW}
          height={GEOMETRY.corridorDepth}
          fill="var(--surface-sunken)"
          stroke="var(--line-strong)"
          strokeWidth={0.08}
        />
        <text
          x={planW / 2}
          y={GEOMETRY.balconyDepth + APARTMENT.depth + GEOMETRY.corridorDepth / 2 + 0.25}
          textAnchor="middle"
          className="font-mono"
          fontSize={0.62}
          fill="var(--ink-muted)"
        >
          {t({ en: "Core · lifts & stair", es: "Núcleo · ascensores y escala" })}
        </text>

        {front.map((u, i) => (
          <ApartmentPlan
            key={u.code}
            unit={u}
            tower={tower}
            focus={focus}
            x={i * APARTMENT.width}
            y={GEOMETRY.balconyDepth + APARTMENT.depth + GEOMETRY.corridorDepth}
            flip
            selected={selected === u.position}
            onSelect={() => onSelect(selected === u.position ? null : u.position)}
          />
        ))}
      </svg>
    </div>
  );
}

/** One apartment in plan: five rooms, a hall and a balcony.
 *
 *  `flip` mirrors it about its own depth, for the row on the other side of the
 *  core — their facades point the opposite way, so their balconies and salas
 *  do too. Mirroring here rather than storing two layouts keeps APARTMENT the
 *  single definition of the plan.
 *
 *  ⚠️  THE FLIPPED ROW IS THE ONE AT THE BOTTOM, not the top. Both rows face
 *  AWAY from the core — that is what a central-corridor plan is. Getting this
 *  backwards put both balconies inside the building, overlapping the lifts,
 *  and painted out the core's own label. If a balcony is ever drawn over the
 *  corridor again, this is the line. */
function ApartmentPlan({
  unit,
  tower,
  focus,
  x,
  y,
  flip = false,
  selected,
  onSelect,
}: {
  unit: UnitState;
  tower: Tower;
  /** What the table has narrowed the question to, or null for all of it. */
  focus: CaptureFocus | null;
  x: number;
  y: number;
  flip?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  /* The apartment's own outline takes the same severity-first state the
     elevation gives it, so the two drawings agree about the same flat. */
  const style = panelStyle(unit, tower, focus);
  const { width, depth, balcony } = APARTMENT;
  const cells = capturesFor(unit, tower);

  /* Shared with the elevation, so the two views cannot disagree about what a
     room is doing under the same focus. */
  const roomStatus = (room: string): UnitPhase | "none" =>
    roomFocusState(cells, room, focus) ?? "none";

  /* z runs away from the facade. Flipped, the facade is at the bottom of the
     apartment's box instead of the top. */
  const at = (z: number, d: number) => (flip ? depth - z - d : z);
  const balconyY = flip ? y + depth : y - balcony.depth;

  return (
    <g className="cursor-pointer" onClick={onSelect}>
      {/* Balcony, outside the structure — and captured like a room, so it is
          shaded like one. */}
      {(() => {
        const st = roomStatus("balcon");
        const rs = st === "none" ? null : PHASE[st];
        return (
          <rect
            x={x + balcony.x}
            y={balconyY}
            width={balcony.width}
            height={balcony.depth}
            fill={rs ? rs.fill : "none"}
            fillOpacity={rs ? rs.fillOpacity : 0}
            stroke={rs ? rs.stroke : "var(--line)"}
            strokeWidth={0.07}
            strokeOpacity={st === "none" ? 0.4 : 1}
          />
        );
      })()}

      {/* Plain ground. The apartment's overall state used to be painted here,
          which now fights the per-room states drawn on top of it — two
          different answers to "how is this flat doing" in the same square.
          The outline below carries the apartment's state instead. */}
      <rect x={x} y={y} width={width} height={depth} fill="var(--surface)" />

      {APARTMENT.rooms.map((r) => {
        const st = roomStatus(r.key);
        /* A room this trade has no work in is drawn faint and unfilled. It is
           not "not started" — nobody owes anything here — and the two must
           never look alike or the plate overstates what is outstanding. */
        const rs = st === "none" ? null : PHASE[st];
        return (
          <rect
            key={r.key}
            x={x + r.x}
            y={y + at(r.z, r.d)}
            width={r.w}
            height={r.d}
            fill={rs ? rs.fill : "none"}
            fillOpacity={rs ? rs.fillOpacity : 0}
            stroke={rs ? rs.stroke : "var(--line)"}
            strokeWidth={rs && st !== "complete" && st !== "pending" ? 0.12 : 0.07}
            strokeOpacity={st === "none" ? 0.4 : 1}
          />
        );
      })}

      {/* The outline last, over the interior walls, so the apartment reads as
          one dwelling rather than six rooms that happen to be adjacent. */}
      <rect
        x={x}
        y={y}
        width={width}
        height={depth}
        fill="none"
        stroke={selected ? "var(--ink)" : style.stroke}
        strokeWidth={selected ? 0.26 : 0.12}
      />

      <text
        x={x + width / 2}
        y={y + depth / 2 + 0.3}
        textAnchor="middle"
        className="font-mono"
        fontSize={0.72}
        fill="var(--ink)"
      >
        {unit.code}
      </text>
      <text
        x={x + width - 0.25}
        y={y + depth - 0.3}
        textAnchor="end"
        className="font-mono"
        fontSize={0.55}
        fill="var(--ink-muted)"
      >
        {unit.sealed}/{STAGES.length}
      </text>
      <title>
        {t({ en: "Apartment", es: "Apartamento" })} {unit.code}
      </title>
    </g>
  );
}

/* ── A floor that is not there yet ───────────────────────────────────────── */

/** What is true about a storey above the build front.
 *
 *  Which is not "nothing". The tower's plot and foundation certificates are
 *  sealed and they are the only reason anybody can stand on the site at all;
 *  what is absent is this floor's slab and everything above it. Saying so is
 *  more use to a head of construction than six zeros. */
function NotBuiltYet({ tower, floor }: { tower: Tower; floor: number }) {
  const t = useT();
  const reached = tower.front.structure;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="font-mono text-mono-sm uppercase text-ink-muted">
          {t({ en: "Floor", es: "Piso" })} {floor}
        </p>
        <p className="mt-1 text-heading text-ink">
          {t({ en: "Not built yet", es: "Aún sin construir" })}
        </p>
        <p className="mt-1 text-body-sm text-ink-secondary">
          {reached === 0
            ? t({
                en: "No slabs poured. The tower is at foundations.",
                es: "Sin placas vaciadas. La torre está en cimentación.",
              })
            : t({
                en: `The structure has reached floor ${reached} of ${tower.floors}.`,
                es: `La estructura va en el piso ${reached} de ${tower.floors}.`,
              })}
        </p>
      </div>

      <ul className="flex flex-col gap-2 border-t border-line pt-3">
        {STAGES.filter((s) => s.level === "tower").map((stage) => {
          const done = tower.siteworks[stage.key as "plot" | "foundations"];
          return (
            <li key={stage.key} className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: done ? "var(--ink-muted)" : "var(--line-strong)",
                  opacity: done ? 0.55 : 1,
                }}
              />
              <span className="min-w-0 flex-1 truncate text-body-sm text-ink-secondary">
                {t(stage.name)}
              </span>
              <span className="shrink-0 font-mono text-mono-sm text-ink-muted">
                {done
                  ? t({ en: "sealed", es: "sellado" })
                  : t({ en: "—", es: "—" })}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="text-body-sm text-ink-muted">
        {t({
          en: "These are the tower's certificates, not this floor's — every apartment above them inherits them once its slab is poured.",
          es: "Son certificados de la torre, no de este piso — cada apartamento los hereda cuando se vacía su placa.",
        })}
      </p>
    </div>
  );
}

/* ── Legend ──────────────────────────────────────────────────────────────── */

function Legend() {
  const t = useT();
  /* Driven off PHASE so the key and the drawing cannot drift — a legend
     maintained by hand is a legend that eventually lies. */
  const order: UnitPhase[] = [
    "pending",
    "active",
    "complete",
    "warning",
    "problem",
  ];

  /* One column now that it sits on the stage rather than at the foot of the
     panel. It was two to stop the fifth state — "capture rejected", the one a
     reader most needs the key for — being silently clipped off the bottom of a
     23rem column. Over the drawing there is vertical room to spare and the
     horizontal room is whatever the divider leaves, so stacking is the shape
     that cannot overflow. */
  return (
    <div className="flex flex-col gap-1.5">
      {order.map((phase) => {
        const style = PHASE[phase];
        return (
          <div key={phase} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-xs border"
              style={{
                backgroundColor: style.fill,
                opacity: style.fillOpacity,
                borderColor: style.stroke,
              }}
            />
            <span className="truncate text-body-sm text-ink-muted">
              {t(PHASE_LABEL[phase])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

