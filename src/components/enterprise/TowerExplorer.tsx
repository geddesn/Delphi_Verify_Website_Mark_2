import { useCallback, useMemo, useRef, useState } from "react";
import {
  APARTMENT,
  BUILDING_DEPTH,
  BUILDING_WIDTH,
  CAPTURES_PER_APARTMENT,
  GEOMETRY,
  ROOMS,
  STAGES,
  MAX_FLOORS,
  TOWERS,
  UNITS,
  unitsIn,
  type Room,
  type Tower,
  type UnitState,
} from "@/content/enterprise/world";
import { useLang, useT, type Bi } from "@/content/enterprise/lang";
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
function cameraFor(height: number) {
  return {
    /* Above the roof, so the block reads as a solid with a top rather than as
       a facade. Looking up at a tower is more dramatic and much less useful:
       the upper floors foreshorten into nothing and the floor you want to
       click becomes a sliver. */
    y: height * 1.18,
    /* Far enough back that the vertical convergence is noticeable but not
       lurid. Closer than about 3× the height and the tower starts to topple
       away from the viewer like a wide-angle photograph. */
    distance: height * 2.9 + 60,
    /* Aimed a little below mid-height, which puts the busy part of the tower —
       the build front — in the middle of the frame. */
    target: height * 0.45,
  };
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

  const pitch = Math.atan2(cam.y - cam.target, cam.distance);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
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

/** Does this elevation face the camera at this angle? Computed from the
 *  rotated normal rather than switched on quadrant — a quadrant table is four
 *  chances to get a sign wrong. */
function faces(e: Elevation, angle: number) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return e.normal.x * s + e.normal.z * c < 0;
}

/* ── Shading ───────────────────────────────────────────────────────────────
   An apartment is shaded by how much sealed evidence it carries, nothing else.

   ⚠️  NOT A SCORE, AND NOT A HEALTH DIAL. The shade says how many certificates
   exist, which is a fact. It says nothing about whether the work is any good —
   the product screens photographs for reality and personal data, it does not
   certify construction quality, and a colour implying otherwise would be a
   claim the company explicitly disclaims. */
function sealedFill(sealed: number) {
  /* Nothing sealed is a flat neutral rather than the palest green. An
     apartment above the poured slab has no evidence at all, and the boundary
     between "not built" and "barely started" is the most useful edge on the
     picture — the build front. A ramp beginning at near-white would blur
     exactly the line a head of construction is looking for. */
  if (sealed === 0) return { fill: "var(--surface-sunken)", opacity: 1 };

  /* The ramp spans 1…6 rather than 0…6: a built apartment never scores below
     three — the tower's two siteworks certificates plus its own slab — and a
     ramp whose bottom third is unreachable wastes contrast where it is needed,
     between the four bands that do occur. */
  const step = (sealed - 1) / (STAGES.length - 1);
  return { fill: "var(--verified)", opacity: 0.22 + step * 0.76 };
}

/* ========================================================================= */

export function TowerExplorer() {
  const t = useT();
  const { lang } = useLang();

  const [towerKey, setTowerKey] = useState(TOWERS[1].key);
  const [angle, setAngle] = useState(DEFAULT_ANGLE);
  const [view, setView] = useState<"block" | "plan">("block");

  const tower = TOWERS.find((x) => x.key === towerKey) ?? TOWERS[1];
  const units = UNITS[tower.key];

  /* Opens on the build front — the floor where something is actually
     happening, which is the floor a head of construction would have opened
     himself. */
  const [floor, setFloor] = useState(Math.max(1, TOWERS[1].front.structure));
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
  const cam = useMemo(() => cameraFor(frameHeight), [frameHeight]);
  const fit = useMemo(
    () => fitFor(angle, frameHeight, cam),
    [angle, frameHeight, cam],
  );

  /* Top of the poured structure — the building as it stands today, as opposed
     to the finished envelope at tower.floors. */
  const deck = tower.front.structure * GEOMETRY.floorHeight;

  /* A floor selected on a taller tower has to survive switching to a shorter
     one, or the aside describes a storey that does not exist. */
  const shownFloor = Math.min(floor, tower.floors);

  const to = useCallback(
    (x: number, y: number, z: number) => {
      const p = project(x, y, z, angle, cam);
      return { x: p.x * fit.scale + fit.dx, y: p.y * fit.scale + fit.dy };
    },
    [angle, cam, fit],
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

  const plate = units.filter((u) => u.floor === shownFloor);
  const selected = plate.find((u) => u.position === position) ?? null;

  const selectTower = (key: string) => {
    setTowerKey(key);
    setPosition(null);
  };

  return (
    <div className="flex h-full w-full flex-col bg-canvas">
      <ExplorerHeader
        tower={tower}
        onTower={selectTower}
        view={view}
        onView={setView}
      />

      <div className="flex min-h-0 flex-1">
        <div className="relative flex min-w-0 flex-1 items-center justify-center border-r border-line">
          {view === "block" ? (
            <svg
              viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
              className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
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
                fill="var(--surface-sunken)"
                stroke="var(--line)"
                strokeWidth={1}
              />

              {/* Walls first, then every balcony on top of them. Balconies
                  project toward the camera and must paint over the elevation
                  they hang off; interleaving them floor by floor would let a
                  higher storey's wall cover the balcony below it. */}
              {ELEVATIONS.filter((e) => faces(e, angle)).map((e, i) => (
                <Elevation
                  key={`w${i}`}
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

              <GhostEnvelope tower={tower} to={to} path={path} />

              <SelectedSlab
                floor={shownFloor}
                to={to}
                path={path}
                lang={lang}
              />
            </svg>
          ) : (
            <FloorPlate
              units={plate}
              floor={shownFloor}
              selected={position}
              onSelect={setPosition}
            />
          )}

          <FloorRail
            floor={shownFloor}
            tower={tower}
            onFloor={setFloor}
          />
        </div>

        <aside className="flex w-[23rem] shrink-0 flex-col gap-4 overflow-hidden p-5">
          {selected ? (
            <ApartmentDetail
              unit={selected}
              tower={tower}
              onBack={() => setPosition(null)}
            />
          ) : shownFloor > tower.front.structure ? (
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

          <div className="mt-auto flex flex-col gap-1.5 border-t border-line pt-4">
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
  to,
  path,
  onFloor,
  onPosition,
}: {
  elevation: Elevation;
  tower: Tower;
  units: UnitState[];
  floor: number;
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
         the plate. Drawn, never shaded as though it carried evidence. */
      const shade = unit
        ? sealedFill(unit.sealed)
        : { fill: "var(--surface)", opacity: 1 };

      const on = storey === floor;

      quads.push(
        <path
          key={`${storey}-${bay}`}
          d={path([to(ax, y0, az), to(bx, y0, bz), to(bx, y1, bz), to(ax, y1, az)])}
          fill={shade.fill}
          fillOpacity={shade.opacity}
          stroke={
            unit?.attention
              ? "var(--pending)"
              : on
                ? "var(--accent)"
                : "var(--line)"
          }
          strokeWidth={unit?.attention || on ? 1.4 : 0.5}
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
        quads.push(opening(`door-${storey}-${bay}`, 0.14, 0.46, 0.04, 0.82));
        quads.push(opening(`win-${storey}-${bay}`, 0.68, 0.92, 0.3, 0.78));
      }
    }
  }

  return <>{quads}</>;
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
  to,
  path,
}: {
  elevation: Elevation;
  tower: Tower;
  units: UnitState[];
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
        parts.push(
          <path
            key={`p-${storey}-${bay}-${faceKeys[i]}`}
            d={path([a, b, tb, ta])}
            fill="var(--surface-sunken)"
            stroke="var(--line-strong)"
            strokeWidth={0.5}
            pointerEvents="none"
          />,
        );
      }
    }
  }

  return <>{parts}</>;
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
      <line
        x1={anchor.x}
        y1={anchor.y}
        x2={anchor.x - 52}
        y2={anchor.y + 13}
        stroke="var(--accent)"
        strokeWidth={1}
      />
      <text
        x={anchor.x - 56}
        y={anchor.y + 17}
        textAnchor="end"
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
        const sealed = on.reduce((n, u) => n + u.sealed, 0);
        const max = on.length * STAGES.length;
        const attention = on.some((u) => u.attention);
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
                className="absolute inset-y-0 left-0 bg-verified"
                style={{ width: `${(sealed / max) * 100}%` }}
              />
            </span>
            {attention && (
              <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-pending" />
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
  floor,
  selected,
  onSelect,
}: {
  units: UnitState[];
  floor: number;
  selected: number | null;
  onSelect: (p: number | null) => void;
}) {
  const t = useT();
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
      <p className="font-mono text-mono-sm uppercase text-ink-muted">
        {t({ en: "Floor", es: "Piso" })} {floor} ·{" "}
        {t({ en: "plate", es: "planta" })}
      </p>

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
            x={i * APARTMENT.width}
            y={GEOMETRY.balconyDepth}
            flip
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
            x={i * APARTMENT.width}
            y={GEOMETRY.balconyDepth + APARTMENT.depth + GEOMETRY.corridorDepth}
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
 *  single definition of the plan. */
function ApartmentPlan({
  unit,
  x,
  y,
  flip = false,
  selected,
  onSelect,
}: {
  unit: UnitState;
  x: number;
  y: number;
  flip?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const shade = sealedFill(unit.sealed);
  const { width, depth, balcony } = APARTMENT;

  /* z runs away from the facade. Flipped, the facade is at the bottom of the
     apartment's box instead of the top. */
  const at = (z: number, d: number) => (flip ? depth - z - d : z);
  const balconyY = flip ? y + depth : y - balcony.depth;

  return (
    <g className="cursor-pointer" onClick={onSelect}>
      {/* Balcony, outside the structure. */}
      <rect
        x={x + balcony.x}
        y={balconyY}
        width={balcony.width}
        height={balcony.depth}
        fill="var(--surface)"
        stroke="var(--line-strong)"
        strokeWidth={0.07}
      />

      {/* The apartment's own ground, shaded by sealed evidence. Drawn under
          the rooms so the room outlines stay legible at every shade. */}
      <rect x={x} y={y} width={width} height={depth} fill="var(--surface)" />
      <rect
        x={x}
        y={y}
        width={width}
        height={depth}
        fill={shade.fill}
        fillOpacity={shade.opacity}
      />

      {APARTMENT.rooms.map((r) => (
        <rect
          key={r.key}
          x={x + r.x}
          y={y + at(r.z, r.d)}
          width={r.w}
          height={r.d}
          fill="none"
          stroke="var(--line-strong)"
          strokeWidth={0.07}
        />
      ))}

      {/* The outline last, over the interior walls, so the apartment reads as
          one dwelling rather than six rooms that happen to be adjacent. */}
      <rect
        x={x}
        y={y}
        width={width}
        height={depth}
        fill="none"
        stroke={
          selected
            ? "var(--accent)"
            : unit.attention
              ? "var(--pending)"
              : "var(--ink-muted)"
        }
        strokeWidth={selected ? 0.22 : 0.12}
      />

      <text
        x={x + width / 2}
        y={y + depth / 2 + 0.3}
        textAnchor="middle"
        className="font-mono"
        fontSize={0.9}
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

/* ── Apartment detail ────────────────────────────────────────────────────── */

/** One apartment's rooms, and what a rough-in inspection photographs in each.
 *
 *  This is where the plan stops being decoration: the capture checklist is
 *  per room, which is why one certificate holds a dozen photographs rather
 *  than one. */
function ApartmentDetail({
  unit,
  tower,
  onBack,
}: {
  unit: UnitState;
  tower: Tower;
  onBack: () => void;
}) {
  const t = useT();

  return (
    <div className="flex min-h-0 flex-col gap-3">
      <button
        type="button"
        onClick={onBack}
        className="cursor-pointer text-left font-mono text-mono-sm uppercase text-ink-muted hover:text-ink-secondary"
      >
        ← {tower.name} · {t({ en: "floor", es: "piso" })} {unit.floor}
      </button>

      <div>
        <p className="text-heading text-ink">
          {t({ en: "Apartment", es: "Apartamento" })} {unit.code}
        </p>
        <p className="mt-1 text-body-sm text-ink-secondary">
          {APARTMENT.area.toFixed(0)} m² ·{" "}
          {t({
            en: `${unit.sealed} of ${STAGES.length} stages sealed`,
            es: `${unit.sealed} de ${STAGES.length} etapas selladas`,
          })}
        </p>
      </div>

      <ul className="flex flex-col gap-1.5 border-t border-line pt-3">
        {ROOMS.map((r: Room) => (
          <li key={r.key} className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate text-body-sm text-ink-secondary">
              {t(r.name)}
            </span>
            <span className="shrink-0 font-mono text-mono-sm text-ink-muted">
              {(r.w * r.d).toFixed(1)} m²
            </span>
            <span className="w-12 shrink-0 text-right font-mono text-mono-sm tabular-nums text-ink">
              {t({ en: `${r.captures} shots`, es: `${r.captures} tomas` })}
            </span>
          </li>
        ))}
      </ul>

      <p className="border-t border-line pt-3 text-body-sm text-ink-secondary">
        {t({
          en: `A rough-in inspection of this apartment is ${CAPTURES_PER_APARTMENT} captures in one certificate — well inside the 40 a certificate holds.`,
          es: `Una inspección de instalaciones de este apartamento son ${CAPTURES_PER_APARTMENT} capturas en un certificado — muy por debajo de las 40 que admite.`,
        })}
      </p>
    </div>
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
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  done ? "bg-verified" : "bg-line-strong",
                )}
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
            <span
              aria-hidden
              className={cn(
                "size-2 shrink-0 rounded-full",
                all ? "bg-verified" : done > 0 ? "bg-accent" : "bg-line-strong",
              )}
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
  const rows: [string, Bi][] = [
    ["var(--verified)", { en: "Sealed certificates", es: "Certificados sellados" }],
    ["var(--accent)", { en: "Selected", es: "Seleccionado" }],
    ["var(--pending)", { en: "Needs attention", es: "Requiere atención" }],
  ];

  return (
    <>
      {rows.map(([colour, label]) => (
        <div key={colour} className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: colour }}
          />
          <span className="text-body-sm text-ink-muted">{t(label)}</span>
        </div>
      ))}
    </>
  );
}
