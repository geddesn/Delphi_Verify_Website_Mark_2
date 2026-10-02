import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  APARTMENT,
  BUILDING_DEPTH,
  BUILDING_WIDTH,
  GEOMETRY,
  JOBS,
  ROOMS,
  STAGES,
  MAX_FLOORS,
  TOWERS,
  TRADE,
  UNITS,
  capturesFor,
  unitsIn,
  type UnitPhase,
  type Tower,
  type Trade,
  type UnitState,
} from "@/content/enterprise/world";
import { useLang, useT, type Bi } from "@/content/enterprise/lang";
import { ApartmentSheet } from "@/components/enterprise/ApartmentSheet";
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

/* Left margin for the selected-floor label, in viewBox units. */
const LABEL_X = 10;

const W = BUILDING_WIDTH;
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
        const p = project((sx * W) / 2, y, sz * reach, angle, cam);
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

const ELEVATIONS: Elevation[] = [
  {
    positions: [1, 2, 3, 4],
    normal: { x: 0, z: -1 },
    origin: { x: -W / 2, z: -D / 2 },
    step: { x: GEOMETRY.bayWidth, z: 0 },
    bays: GEOMETRY.baysX,
    out: { x: 0, z: -1 },
  },
  {
    /* Walking round the block reverses the order, so 08 is leftmost. The
       numbering follows the building rather than the drawing — otherwise a
       viewer comparing the two views finds the apartments swapped. */
    positions: [8, 7, 6, 5],
    normal: { x: 0, z: 1 },
    origin: { x: W / 2, z: D / 2 },
    step: { x: -GEOMETRY.bayWidth, z: 0 },
    bays: GEOMETRY.baysX,
    out: { x: 0, z: 1 },
  },
  {
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

/** How an apartment is drawn, from its state AND how much of it is done.
 *
 *  ⚠️  PHASE ALONE WAS NOT ENOUGH, and the tower proved it. An apartment with
 *  five of its six stages sealed — rough-in and finishes complete, waiting
 *  only on handover — is not "in progress" and is certainly not "not started",
 *  so phaseFor() classed it pending and drew it the same white as a storey
 *  whose slab had only just been poured. Torre 1 is nearly finished and
 *  rendered as an empty box.
 *
 *  So the two quiet states carry a DENSITY as well: neutral grey deepening
 *  with the number of sealed certificates. The build front is visible, partial
 *  progress is visible, and colour is still spent only on the three states
 *  that are a call to action — which was the whole point of the change.
 */
function styleFor(unit: UnitState): PhaseStyle {
  const base = PHASE[unit.phase];
  if (unit.phase !== "pending" && unit.phase !== "complete") return base;

  /* Nothing at all: an apartment above the poured slab. Left white so the
     top of a part-built tower is unmistakably empty. */
  if (unit.sealed === 0) return PHASE.pending;

  /* ⚠️  THE BAND IS NARROW AND DARK ON PURPOSE. Only apartments below the
     poured slab are ever drawn, and those always carry at least three
     certificates — the tower's two siteworks plus their own floor — so a ramp
     starting near white wasted most of its range on states that cannot occur
     and left the ones that do a few percent apart. Starting at a mid value
     makes the fabric read as masonry rather than as paper, and the difference
     between a shell and a finished flat is then visible across the width of a
     facade. */
  return {
    ...base,
    fill: "var(--ink-muted)",
    fillOpacity: 0.26 + (unit.sealed / STAGES.length) * 0.34,
    stroke: "var(--line-strong)",
    strokeWidth: 0.6,
  };
}

const PHASE_LABEL: Record<UnitPhase, Bi> = {
  pending: { en: "Not started", es: "Sin iniciar" },
  active: { en: "In progress", es: "En ejecución" },
  complete: { en: "Completed", es: "Terminado" },
  warning: { en: "Needs chasing", es: "Requiere seguimiento" },
  problem: { en: "Capture rejected", es: "Captura rechazada" },
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
  const [view, setView] = useState<"block" | "plan">("block");
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
  const [floor, setFloor] = useState(Math.max(1, initialTower.front.structure));
  const [position, setPosition] = useState<number | null>(null);

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

  /* A floor selected on a taller tower has to survive switching to a shorter
     one, or the aside describes a storey that does not exist. */
  const shownFloor = Math.min(floor, tower.floors);

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

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = {
      x: e.clientX,
      angle,
      width: e.currentTarget.getBoundingClientRect().width,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d) return;
    setAngle(d.angle + ((e.clientX - d.x) / d.width) * Math.PI * 2);
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: React.KeyboardEvent<SVGSVGElement>) => {
    const step = Math.PI / 24;
    if (e.key === "ArrowLeft") setAngle((a) => a - step);
    else if (e.key === "ArrowRight") setAngle((a) => a + step);
    else if (e.key === "ArrowUp") setFloor((f) => Math.min(tower.floors, f + 1));
    else if (e.key === "ArrowDown") setFloor((f) => Math.max(1, f - 1));
    else return;
    e.preventDefault();
  };

  /* ⚠️  THE TARGET IS `view`; THE LOOP CHASES IT. Starting a timed tween on
     each click would mean a viewer who changes their mind mid-flight gets two
     animations fighting over one value. This reads the current intention every
     frame and turns round wherever it is, so a double-click just reverses. */
  useEffect(() => {
    const want = view === "plan" ? 1 : 0;

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

  const plate = units.filter((u) => u.floor === shownFloor);
  const selected = plate.find((u) => u.position === position) ?? null;

  const selectTower = (key: string) => {
    setTowerKey(key);
    setPosition(null);
  };

  /* ⚠️  THE SHEET REPLACES THE EXPLORER RATHER THAN SHARING IT. An
     apartment's captures are a dozen photographs grouped into certificates,
     and squeezing them into the 23rem aside made thumbnails too small to be
     evidence of anything. Tower → floor → apartment is a drill-down, and the
     last step gets the whole frame like the two before it. */
  if (selected) {
    return (
      <ApartmentSheet
        unit={selected}
        tower={tower}
        onBack={() => setPosition(null)}
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-canvas">
      {showHeader && (
        <ExplorerHeader
          tower={tower}
          onTower={selectTower}
          view={view}
          onView={setView}
        />
      )}

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 items-center justify-center border-r border-line">
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
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
            >
              <path
                d={path([
                  to(-W * 1.6, 0, -D * 2.1),
                  to(W * 1.6, 0, -D * 2.1),
                  to(W * 1.6, 0, D * 2.1),
                  to(-W * 1.6, 0, D * 2.1),
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
              {ELEVATIONS.filter((e) => faces(e, angle)).map((e, i) => (
                <Elevation
                  key={`w${i}`}
                  fade={otherFloors}
                  shade={shadeFor(e, flyAngle)}
                  elevation={e}
                  tower={tower}
                  units={units}
                  floor={shownFloor}
                  to={to}
                  path={path}
                  onFloor={setFloor}
                  onPosition={setPosition}
                />
              ))}

              {ELEVATIONS.filter((e) => faces(e, angle) && e.positions.length).map(
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

              <GhostEnvelope tower={tower} to={to} path={path} />

              <SelectedSlab
                floor={shownFloor}
                to={to}
                path={path}
                lang={lang}
              />
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
                floor={shownFloor}
                selected={position}
                onSelect={setPosition}
              />
            </div>
          )}

          <FloorRail
            floor={shownFloor}
            tower={tower}
            onFloor={setFloor}
          />
        </div>

        <aside className="flex w-[23rem] shrink-0 flex-col gap-4 overflow-hidden p-5">
          {shownFloor > tower.front.structure ? (
            /* A floor above the poured structure has no apartments on it, so
               describing it as "8 apartments, 58 m²" with six zeros beside it
               is wrong twice over — the apartments do not exist, and the
               tower's siteworks certificates, which do, are reported as
               absent. */
            <NotBuiltYet tower={tower} floor={shownFloor} />
          ) : (
            <>
              <div>
                <p className="font-mono text-mono-sm uppercase text-ink-muted">
                  {t({ en: "Floor", es: "Piso" })} {shownFloor}
                </p>
                <p className="mt-1 text-heading text-ink">
                  {t({
                    en: `${GEOMETRY.unitsPerFloor} apartments`,
                    es: `${GEOMETRY.unitsPerFloor} apartamentos`,
                  })}
                </p>
                <p className="mt-1 text-body-sm text-ink-secondary">
                  {t({
                    en: `${APARTMENT.area.toFixed(0)} m² · ${ROOMS.length} rooms and a balcony each`,
                    es: `${APARTMENT.area.toFixed(0)} m² · ${ROOMS.length} ambientes y un balcón cada uno`,
                  })}
                </p>

                {/* The way into the floor, next to the floor it opens —
                    rather than only in the view switch up in the header,
                    which is a long way from the thing it acts on. */}
                <button
                  type="button"
                  onClick={() => setView(view === "plan" ? "block" : "plan")}
                  className="mt-3 cursor-pointer rounded-sm border border-line px-3 py-1.5 text-body-sm text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
                >
                  {view === "plan"
                    ? t({ en: "← Back to the tower", es: "← Volver a la torre" })
                    : t({ en: "Details →", es: "Detalles →" })}
                </button>
              </div>

              <StageLadder units={plate} tower={tower} floor={shownFloor} />

              <p className="text-body-sm text-ink-muted">
                {t({
                  en: "Open an apartment on the floor plan to see its rooms.",
                  es: "Abra un apartamento en la planta para ver sus ambientes.",
                })}
              </p>
            </>
          )}

          <div className="mt-auto border-t border-line pt-4">
            <Legend />
          </div>
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
  view: "block" | "plan";
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
  floor,
  fade,
  shade,
  to,
  path,
  onFloor,
  onPosition,
}: {
  elevation: Elevation;
  tower: Tower;
  units: UnitState[];
  floor: number;
  /** Opacity for every storey except the selected one, 1 at rest and 0 by the
   *  time the camera is overhead — the floor being opened is left alone on
   *  screen before the plan arrives to replace it. */
  fade: number;
  /** How far this elevation is turned away from the light. */
  shade: number;
  to: (x: number, y: number, z: number) => Point;
  path: (pts: Point[]) => string;
  onFloor: (f: number) => void;
  onPosition: (p: number | null) => void;
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
      const style: PhaseStyle = unit ? styleFor(unit) : PHASE.pending;

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
          onClick={() => {
            onFloor(storey);
            onPosition(position ?? null);
          }}
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
  to,
  path,
}: {
  tower: Tower;
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
  to,
  path,
  lang,
}: {
  floor: number;
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

/* ── Floor rail ──────────────────────────────────────────────────────────── */

function FloorRail({
  floor,
  tower,
  onFloor,
}: {
  floor: number;
  tower: Tower;
  onFloor: (f: number) => void;
}) {
  const t = useT();
  const floors = Array.from({ length: tower.floors }, (_, i) => tower.floors - i);

  return (
    <div className="absolute right-3 top-3 bottom-3 flex w-24 flex-col justify-center gap-px">
      <p className="mb-1 font-mono text-mono-sm uppercase text-ink-muted">
        {t({ en: "Floors", es: "Pisos" })}
      </p>
      {floors.map((f) => {
        const on = UNITS[tower.key].filter((u) => u.floor === f);
        /* The bar is how much of the floor is FINISHED, not how many
           certificates it has accumulated. A part-sealed apartment is work in
           progress, and a bar that creeps forward on every certificate makes a
           floor look nearly done when none of its apartments are. */
        const sealed = on.reduce((n, u) => n + u.sealed, 0);
        const max = on.length * STAGES.length;
        const issue = on.some((u) => u.phase === "problem")
          ? "problem"
          : on.some((u) => u.phase === "warning")
            ? "warning"
            : null;
        const working = on.some((u) => u.phase === "active");
        return (
          <button
            key={f}
            type="button"
            onClick={() => onFloor(f)}
            aria-current={f === floor ? "true" : undefined}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-sm px-1 text-left",
              f === floor && "bg-surface-sunken",
            )}
          >
            <span
              className={cn(
                "w-4 shrink-0 font-mono text-mono-sm tabular-nums",
                f === floor ? "text-ink" : "text-ink-muted",
              )}
            >
              {f}
            </span>
            <span className="relative h-1.5 flex-1 bg-surface-sunken">
              <span
                className="absolute inset-y-0 left-0"
                style={{
                  width: `${(sealed / max) * 100}%`,
                  /* Neutral while a floor is merely progressing; accent only
                     once somebody is actually working on it. */
                  backgroundColor: working
                    ? "var(--accent)"
                    : "var(--ink-muted)",
                  opacity: working ? 1 : 0.45,
                }}
              />
            </span>
            {issue && (
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    issue === "problem" ? "var(--failed)" : "var(--pending)",
                }}
              />
            )}
          </button>
        );
      })}
    </div>
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
}: {
  units: UnitState[];
  tower: Tower;
  floor: number;
  selected: number | null;
  onSelect: (p: number | null) => void;
}) {
  const t = useT();
  /* ⚠️  THE FILTER IS WHY THE PLAN DRAWS ROOMS AT ALL. Without it the rooms
     are decoration — eight identical little layouts. Pick a trade and the
     plate answers the question a site actually asks: who still owes me a
     bathroom plumbing capture on this floor, and in which flats. Rooms that
     trade has no work in recede, which is as much of the answer as the rooms
     that light up. */
  const [job, setJob] = useState<string | null>(null);
  const chosen = JOBS.find((j) => `${j.stage}:${j.trade}` === job) ?? null;
  const front = units
    .filter((u) => u.position <= 4)
    .sort((a, b) => a.position - b.position);
  const rear = units
    .filter((u) => u.position > 4)
    .sort((a, b) => b.position - a.position);

  /* Plan coordinates in metres, balconies included on both sides. */
  const planW = BUILDING_WIDTH;
  const planD = BUILDING_DEPTH + GEOMETRY.balconyDepth * 2;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-6">
      <div className="flex w-full max-w-3xl items-center gap-2">
        <p className="font-mono text-mono-sm uppercase text-ink-muted">
          {t({ en: "Floor", es: "Piso" })} {floor} ·{" "}
          {t({ en: "plate", es: "planta" })}
        </p>
        <div className="ml-auto flex gap-1">
          <FilterChip on={job === null} onClick={() => setJob(null)}>
            {t({ en: "All trades", es: "Todos" })}
          </FilterChip>
          {JOBS.map((j) => {
            const key = `${j.stage}:${j.trade}`;
            return (
              <FilterChip
                key={key}
                on={job === key}
                onClick={() => setJob(job === key ? null : key)}
              >
                {t(TRADE[j.trade])}
              </FilterChip>
            );
          })}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${planW} ${planD}`}
        className="max-h-full w-full max-w-3xl"
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
            job={chosen}
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
            job={chosen}
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
  job,
  x,
  y,
  flip = false,
  selected,
  onSelect,
}: {
  unit: UnitState;
  tower: Tower;
  /** The trade being looked at, or null for all of them. */
  job: { stage: string; trade: Trade } | null;
  x: number;
  y: number;
  flip?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const style = styleFor(unit);
  const { width, depth, balcony } = APARTMENT;
  const cells = capturesFor(unit, tower);

  /* A room's state under the current filter. Worst-first: a rejected capture
     outranks an overdue one, which outranks work in progress — the room needs
     to show the thing somebody has to act on, not the cheeriest thing true
     about it. */
  const roomStatus = (room: string): UnitPhase | "none" => {
    const mine = cells.filter(
      (c) =>
        c.requirement.room === room &&
        (!job ||
          (c.requirement.stage === job.stage &&
            c.requirement.trade === job.trade)),
    );
    if (mine.length === 0) return "none";
    if (mine.some((c) => c.status === "problem")) return "problem";
    if (mine.some((c) => c.status === "warning")) return "warning";
    if (mine.some((c) => c.status === "active")) return "active";
    if (mine.every((c) => c.status === "complete")) return "complete";
    return "pending";
  };

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

/* ── Stage ladder ────────────────────────────────────────────────────────── */

function StageLadder({
  units,
  tower,
  floor,
}: {
  units: UnitState[];
  tower: Tower;
  floor: number;
}) {
  const t = useT();

  return (
    <ul className="flex flex-col gap-2">
      {STAGES.map((stage, i) => {
        /* A stage's level decides what "done" even means here. Siteworks are
           the tower's and the whole floor inherits them; the slab is the
           floor's own; only the last three are counted per apartment. */
        const done =
          stage.level === "tower"
            ? tower.siteworks[stage.key as "plot" | "foundations"] &&
              floor <= tower.front.structure
              ? units.length
              : 0
            : stage.level === "floor"
              ? floor <= tower.front.structure
                ? units.length
                : 0
              : units.filter((u) => u.sealed > i).length;

        const all = units.length > 0 && done === units.length;

        return (
          <li key={stage.key} className="flex items-center gap-2.5">
            {/* Same palette as the drawing: a finished stage goes quiet, a
                stage with work in it takes the accent. Green here would
                reintroduce exactly the wall of colour the apartments were
                changed to avoid. */}
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: all
                  ? "var(--ink-muted)"
                  : done > 0
                    ? "var(--accent)"
                    : "var(--line-strong)",
                opacity: all ? 0.55 : 1,
              }}
            />
            <span className="min-w-0 flex-1 truncate text-body-sm text-ink-secondary">
              {t(stage.name)}
            </span>
            <span className="shrink-0 font-mono text-mono-sm tabular-nums text-ink-muted">
              {done}/{units.length}
            </span>
          </li>
        );
      })}
    </ul>
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

  /* Two columns: five states stacked in one ran past the bottom of the panel
     and silently clipped the last of them — which was "capture rejected", the
     one state a reader most needs the key for. */
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
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

/** A filter chip on the floor plate. */
function FilterChip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "cursor-pointer rounded-sm border px-2 py-0.5 text-body-sm transition-colors",
        on
          ? "border-accent text-ink"
          : "border-line text-ink-muted hover:text-ink-secondary",
      )}
    >
      {children}
    </button>
  );
}
