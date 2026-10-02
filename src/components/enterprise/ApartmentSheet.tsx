import { useMemo, useState } from "react";
import {
  APARTMENT,
  CAPTURE_ROOMS,
  TRADE,
  capturesFor,
  inFocus,
  shotSrc,
  stageByKey,
  type CaptureFocus,
  type RequiredCapture,
  type Tower,
  type UnitPhase,
  type UnitState,
} from "@/content/enterprise/world";
import { useT, type Bi } from "@/content/enterprise/lang";

/* ============================================================================
   APARTMENT PANE
   ============================================================================
   One apartment, drawn as its plan, with a marker on every required capture.

   ⚠️  THE PLAN IS THE WHOLE THING NOW, and the grid it replaced is worth
   recording. The captures were a table of rooms against trades with a
   thumbnail in each cell, under a small plan that acted as its key. It was
   accurate and it read as a spreadsheet: the picture of the apartment — the
   thing that tells you instantly which room something is in — was the smallest
   element on the screen, and the rest of it re-stated in words what the plan
   already said in shape.

   So the plan fills the pane and the captures are markers on it, in the rooms
   they are of. Colour is status, hover is the photograph. A supervisor sees
   what is outstanding, and where, without reading a row.

   ⚠️  A MARKER IS A REQUIRED CAPTURE, NOT A PHOTOGRAPH. Most have no image
   behind them yet — that is what a checklist is — so a marker exists whether
   or not the work is done, and its colour is the answer. Only the captured
   ones have anything to show on hover, and the rest say so.
   ========================================================================= */

/* The hover preview, in metres of the plan it is drawn on. Sized to sit inside
   a room without burying the markers either side of it. */
const PREVIEW = { w: 4.6, h: 3.1 };

export function ApartmentPane({
  unit,
  tower,
  onBack,
  focus,
}: {
  unit: UnitState;
  tower: Tower;
  onBack: () => void;
  /** The progress table's selection. Markers outside it are dropped, so the
   *  plan shows exactly what was asked for. */
  focus: CaptureFocus | null;
}) {
  const t = useT();
  const [open, setOpen] = useState<RequiredCapture | null>(null);
  const [hover, setHover] = useState<RequiredCapture | null>(null);

  const cells = useMemo(() => capturesFor(unit, tower), [unit, tower]);
  const shown = useMemo(
    () => cells.filter((c) => inFocus(c, focus)),
    [cells, focus],
  );

  const done = cells.filter((c) => c.status === "complete").length;
  const blocked = cells.filter((c) => c.status === "problem").length;
  const chasing = cells.filter((c) => c.status === "warning").length;

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-canvas">
      <header className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer font-mono text-mono-sm uppercase text-ink-muted transition-colors hover:text-ink"
        >
          ← {t({ en: "floor", es: "piso" })} {unit.floor}
        </button>
        <h2 className="text-body font-semibold text-ink">
          {t({ en: "Apartment", es: "Apartamento" })} {unit.code}
        </h2>
        <span className="font-mono text-mono-sm text-ink-muted">
          {APARTMENT.area.toFixed(0)} m²
        </span>

        <div className="ml-auto flex items-baseline gap-4">
          {/* Counted over the whole apartment, never over what the filter
              leaves — a total that shrinks with the view is one nobody can
              trust. */}
          <Figure
            value={`${done}/${cells.length}`}
            label={t({ en: "Captures", es: "Capturas" })}
          />
          {chasing > 0 && (
            <Figure
              value={String(chasing)}
              label={t({ en: "Chasing", es: "Pendientes" })}
              tone="var(--pending)"
            />
          )}
          {blocked > 0 && (
            <Figure
              value={String(blocked)}
              label={t({ en: "Rejected", es: "Rechazadas" })}
              tone="var(--failed)"
            />
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 p-4">
        <PlanBoard
          cells={shown}
          hover={hover}
          onHover={setHover}
          onOpen={setOpen}
        />
      </div>

      {shown.length === 0 && (
        <p className="shrink-0 px-4 pb-4 text-body-sm text-ink-secondary">
          {t({
            en: "Nothing in this apartment matches the current selection.",
            es: "Nada en este apartamento coincide con la selección actual.",
          })}
        </p>
      )}

      {open && <Lightbox cell={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

/* ── The plan, with its markers ──────────────────────────────────────────── */

type Area = { key: string; name: Bi; x: number; z: number; w: number; d: number };

/** Where a room's markers sit: a row across the middle of it.
 *
 *  Laid out rather than scattered, because a room carries between one and four
 *  required captures and a scatter overlaps in the small ones. Spacing is
 *  bounded by the room's own width, so the kitchen's four and the balcony's two
 *  both sit comfortably. */
function markerPositions(area: Area, n: number) {
  const gap = Math.min(0.95, (area.w - 0.6) / Math.max(1, n));
  const startX = area.x + area.w / 2 - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => ({
    x: startX + i * gap,
    y: area.z + area.d / 2 + 0.5,
  }));
}

function areasOf(): Area[] {
  const { balcony } = APARTMENT;
  return [
    ...APARTMENT.rooms.map((r) => ({
      key: r.key,
      name: r.name,
      x: r.x,
      z: r.z,
      w: r.w,
      d: r.d,
    })),
    {
      /* Not one of APARTMENT.rooms — it hangs off the structure rather than
         sitting inside it — so it carries its own rectangle here. */
      key: "balcon",
      name: { en: "Balcony", es: "Balcón" },
      x: balcony.x,
      z: -balcony.depth,
      w: balcony.width,
      d: balcony.depth,
    },
  ];
}

function PlanBoard({
  cells,
  hover,
  onHover,
  onOpen,
}: {
  cells: RequiredCapture[];
  hover: RequiredCapture | null;
  onHover: (c: RequiredCapture | null) => void;
  onOpen: (c: RequiredCapture) => void;
}) {
  const t = useT();
  const { width, depth, balcony } = APARTMENT;
  const areas = areasOf();

  /* The balcony hangs off the structure, so the drawing is taller than the
     apartment and the viewBox has to take it in. */
  const pad = 0.5;
  const viewBox = `${-pad} ${-balcony.depth - pad} ${width + pad * 2} ${
    depth + balcony.depth + pad * 2
  }`;

  return (
    <svg
      viewBox={viewBox}
      className="h-full w-full"
      role="img"
      aria-label={t({ en: "Apartment plan", es: "Planta del apartamento" })}
    >
      {areas.map((area) => {
        const mine = cells.filter((c) => c.requirement.room === area.key);
        const spots = markerPositions(area, mine.length);

        return (
          <g key={area.key}>
            <rect
              x={area.x}
              y={area.z}
              width={area.w}
              height={area.d}
              fill={
                area.key === "balcon" ? "var(--surface-sunken)" : "var(--surface)"
              }
              stroke="var(--line-strong)"
              strokeWidth={0.06}
            />
            <text
              x={area.x + area.w / 2}
              y={area.z + area.d / 2 - 0.3}
              textAnchor="middle"
              className="font-mono"
              fontSize={0.4}
              fill="var(--ink-secondary)"
            >
              {t(area.name)}
            </text>

            {mine.map((cell, i) => (
              <Marker
                key={`${cell.requirement.stage}-${cell.requirement.trade}`}
                cell={cell}
                at={spots[i]}
                on={hover === cell}
                onHover={onHover}
                onOpen={onOpen}
              />
            ))}
          </g>
        );
      })}

      {/* The outline last, over the interior walls, so the apartment reads as
          one dwelling rather than six rooms that happen to be adjacent. */}
      <rect
        x={0}
        y={0}
        width={width}
        height={depth}
        fill="none"
        stroke="var(--ink-muted)"
        strokeWidth={0.1}
      />

      {/* ⚠️  DRAWN LAST, OUTSIDE THE ROOM GROUPS. Inside one it would be
          painted over by every room after it — SVG has no z-index, only
          document order. */}
      {hover && <Preview cell={hover} cells={cells} />}
    </svg>
  );
}

/* ── One marker ──────────────────────────────────────────────────────────── */

const MARKER: Record<UnitPhase, string> = {
  pending: "var(--line-strong)",
  active: "var(--accent)",
  complete: "var(--verified)",
  warning: "var(--pending)",
  problem: "var(--failed)",
};

function Marker({
  cell,
  at,
  on,
  onHover,
  onOpen,
}: {
  cell: RequiredCapture;
  at: { x: number; y: number };
  on: boolean;
  onHover: (c: RequiredCapture | null) => void;
  onOpen: (c: RequiredCapture) => void;
}) {
  const t = useT();
  const has = cell.status === "complete" || cell.status === "problem";

  return (
    <g
      className={has ? "cursor-pointer" : undefined}
      onPointerEnter={() => onHover(cell)}
      onPointerLeave={() => onHover(null)}
      onClick={() => has && onOpen(cell)}
    >
      {/* A disc under the dot, so a marker still reads against whatever the
          room is filled with. */}
      <circle cx={at.x} cy={at.y} r={on ? 0.42 : 0.3} fill="var(--surface)" />
      <circle
        cx={at.x}
        cy={at.y}
        r={on ? 0.34 : 0.23}
        fill={MARKER[cell.status]}
        stroke="var(--surface)"
        strokeWidth={0.06}
      />
      {/* ⚠️  A CAPTURED MARKER IS RINGED, not merely a different colour.
          Colour alone puts the whole distinction on hue, which is precisely
          what somebody who cannot separate green from amber cannot use. */}
      {has && (
        <circle
          cx={at.x}
          cy={at.y}
          r={0.45}
          fill="none"
          stroke={MARKER[cell.status]}
          strokeWidth={0.07}
        />
      )}
      <title>
        {t(cell.requirement.what)} · {t(TRADE[cell.requirement.trade])}
      </title>
    </g>
  );
}

/* ── Hover preview ───────────────────────────────────────────────────────── */

function Preview({
  cell,
  cells,
}: {
  cell: RequiredCapture;
  cells: RequiredCapture[];
}) {
  const t = useT();
  const areas = areasOf();
  const area = areas.find((a) => a.key === cell.requirement.room);
  if (!area) return null;

  const mine = cells.filter((c) => c.requirement.room === area.key);
  const spot = markerPositions(area, mine.length)[mine.indexOf(cell)];
  if (!spot) return null;

  const has = cell.status === "complete" || cell.status === "problem";

  /* Above the marker, and clamped to the drawing: a preview running off the
     edge is a preview of nothing. */
  const x = Math.min(
    Math.max(spot.x - PREVIEW.w / 2, -0.3),
    APARTMENT.width + 0.3 - PREVIEW.w,
  );
  const y = Math.max(
    spot.y - PREVIEW.h - 0.7,
    -APARTMENT.balcony.depth - 0.35,
  );

  return (
    <g pointerEvents="none">
      <rect
        x={x}
        y={y}
        width={PREVIEW.w}
        height={PREVIEW.h}
        fill="var(--canvas)"
        stroke="var(--line-strong)"
        strokeWidth={0.07}
      />
      {has ? (
        <image
          href={shotSrc(cell.requirement.image, 480)}
          x={x + 0.1}
          y={y + 0.1}
          width={PREVIEW.w - 0.2}
          height={PREVIEW.h - 0.75}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text
          x={x + PREVIEW.w / 2}
          y={y + (PREVIEW.h - 0.5) / 2}
          textAnchor="middle"
          className="font-mono"
          fontSize={0.34}
          fill="var(--ink-muted)"
        >
          {t({ en: "Not captured yet", es: "Aún sin capturar" })}
        </text>
      )}
      <text
        x={x + 0.18}
        y={y + PREVIEW.h - 0.22}
        className="font-mono"
        fontSize={0.3}
        fill="var(--ink)"
      >
        {t(cell.requirement.what)}
      </text>
    </g>
  );
}

/* ── Chrome ──────────────────────────────────────────────────────────────── */

function Figure({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone?: string;
}) {
  return (
    <div className="flex flex-col items-end">
      <span
        className="font-mono text-body tabular-nums"
        style={{ color: tone ?? "var(--ink)" }}
      >
        {value}
      </span>
      <span className="font-mono text-mono-sm uppercase text-ink-muted">
        {label}
      </span>
    </div>
  );
}

/** One capture, large, with who made it and when. */
function Lightbox({
  cell,
  onClose,
}: {
  cell: RequiredCapture;
  onClose: () => void;
}) {
  const t = useT();
  const room = CAPTURE_ROOMS.find((r) => r.key === cell.requirement.room);
  const stage = stageByKey.get(cell.requirement.stage);

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center p-8"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <div className="flex max-h-full w-full max-w-2xl flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-heading text-ink">
            {room ? t(room.name) : cell.requirement.room}
          </span>
          <span className="text-body-sm text-ink-secondary">
            {t(cell.requirement.what)}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="ml-auto cursor-pointer font-mono text-mono-sm uppercase text-ink-muted hover:text-ink"
          >
            {t({ en: "Close", es: "Cerrar" })} ✕
          </button>
        </div>

        <img
          alt={t(cell.requirement.what)}
          src={shotSrc(cell.requirement.image, 960)}
          className="block max-h-[55vh] w-full rounded-sm border border-line object-cover"
        />

        <p className="font-mono text-mono-sm text-ink-muted">
          {stage ? t(stage.name) : cell.requirement.stage} ·{" "}
          {t(TRADE[cell.requirement.trade])} · {cell.by.name}
          {cell.time ? ` · ${cell.time}` : ""}
        </p>
        <p className="text-body-sm text-ink-muted">
          {t({
            en: "Capture time, location and device are sealed with the image. This is a rendering; the photograph is from the Delphi library.",
            es: "La hora, la ubicación y el dispositivo quedan sellados con la imagen. Esta es una representación; la fotografía proviene de la biblioteca de Delphi.",
          })}
        </p>
      </div>
    </div>
  );
}
