import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import {
  APARTMENT,
  CAPTURE_ROOMS,
  JOBS,
  TRADE,
  capturesFor,
  hasPhotograph,
  imageFor,
  inFocus,
  sessionFor,
  shotSrc,
  stageByKey,
  type CaptureFocus,
  type RequiredCapture,
  type Tower,
  type UnitPhase,
  type UnitState,
} from "@/content/enterprise/world";
import { fmtDate, useLang, useT, type Bi } from "@/content/enterprise/lang";

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

/* ⚠️  EVERYTHING HERE IS IN METRES, AND THE PLAN DRAWS AT ROUGHLY 70 PIXELS
   TO THE METRE. A radius that looks modest in source is not: r=0.23 rendered
   as a 32px dot on a 58 m² flat. Measure in pixels, not in the numbers.

   The hover preview, in metres of the plan it is drawn on. Sized to sit inside
   a room without burying the markers either side of it. */
const PREVIEW = { w: 3.6, h: 2.5 };

export function ApartmentPane({
  unit,
  tower,
  onBack,
  focus,
  onClearFocus,
}: {
  unit: UnitState;
  tower: Tower;
  onBack: () => void;
  /** The progress table's selection. Markers outside it are dropped, so the
   *  plan shows exactly what was asked for. */
  focus: CaptureFocus | null;
  /** Clearing it from here. The filter is set in the panel on the right and
   *  felt one-way once you had drilled into an apartment — the row that set it
   *  is still there, but reaching back across the screen to unset something
   *  you can see in front of you is the wrong gesture. */
  onClearFocus: () => void;
}) {
  const t = useT();
  const [open, setOpen] = useState<RequiredCapture | null>(null);
  const [hover, setHover] = useState<RequiredCapture | null>(null);
  /* Two readings of one apartment: where the work is, and what was produced.
     The plan answers "which room still owes me something"; the certificates
     answer "what exactly am I holding, and who signed it". Neither contains
     the other. */
  const [tab, setTab] = useState<"plan" | "certificates">("plan");

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

        <div
          role="tablist"
          aria-label={t({ en: "Apartment", es: "Apartamento" })}
          className="ml-4 flex rounded-sm border border-line"
        >
          {(
            [
              ["plan", { en: "Plan", es: "Planta" }],
              ["certificates", { en: "Certificates", es: "Certificados" }],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "cursor-pointer px-3 py-1 text-body-sm transition-colors",
                tab === key
                  ? "bg-surface-sunken text-ink"
                  : "text-ink-muted hover:text-ink-secondary",
              )}
            >
              {t(label)}
            </button>
          ))}
        </div>

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
              label={t({ en: "Inspect", es: "Inspección" })}
              tone="var(--pending)"
            />
          )}
          {blocked > 0 && (
            <Figure
              value={String(blocked)}
              label={t({ en: "Rework", es: "Corrección" })}
              tone="var(--failed)"
            />
          )}
        </div>
      </header>

      {/* ⚠️  CLICKING OFF THE PLAN CLEARS THE FILTER, and the check is on the
          target rather than the handler's position: this div and the svg both
          fill their box, so a click on the margin round the drawing lands on
          one of them, while a click on a room or a marker lands on a child and
          must be left alone. */}
      {tab === "plan" ? (
        <div
          className="min-h-0 flex-1 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClearFocus();
          }}
        >
          <PlanBoard
            cells={shown}
            hover={hover}
            onHover={setHover}
            onOpen={setOpen}
            onClearFocus={onClearFocus}
          />
        </div>
      ) : (
        <Certificates
          unit={unit}
          tower={tower}
          cells={shown}
          onOpen={setOpen}
        />
      )}

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
  const gap = Math.min(0.5, (area.w - 0.4) / Math.max(1, n));
  const startX = area.x + area.w / 2 - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => ({
    x: startX + i * gap,
    y: area.z + area.d / 2 + 0.3,
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
  onClearFocus,
}: {
  cells: RequiredCapture[];
  hover: RequiredCapture | null;
  onHover: (c: RequiredCapture | null) => void;
  onOpen: (c: RequiredCapture) => void;
  onClearFocus: () => void;
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
      /* The svg keeps its aspect ratio, so there is letterbox inside it either
         side of the drawing. A click landing there is a click off the plan. */
      onClick={(e) => {
        if (e.target === e.currentTarget) onClearFocus();
      }}
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
              y={area.z + area.d / 2 - 0.25}
              textAnchor="middle"
              className="font-mono"
              fontSize={0.2}
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
  /* Published AND photographed — see hasPhotograph(), which is also what
     decides whether an inspection flag has an image behind it. */
  const has = hasPhotograph(cell);

  return (
    <g
      className={has ? "cursor-pointer" : undefined}
      onPointerEnter={() => onHover(cell)}
      onPointerLeave={() => onHover(null)}
      onClick={() => has && onOpen(cell)}
    >
      {/* A disc under the dot, so a marker still reads against whatever the
          room is filled with. */}
      <circle cx={at.x} cy={at.y} r={on ? 0.19 : 0.14} fill="var(--surface)" />
      <circle
        cx={at.x}
        cy={at.y}
        r={on ? 0.15 : 0.1}
        fill={MARKER[cell.status]}
        stroke="var(--surface)"
        strokeWidth={0.04}
      />
      {/* ⚠️  A CAPTURED MARKER IS RINGED, not merely a different colour.
          Colour alone puts the whole distinction on hue, which is precisely
          what somebody who cannot separate green from amber cannot use. */}
      {has && (
        <circle
          cx={at.x}
          cy={at.y}
          r={0.2}
          fill="none"
          stroke={MARKER[cell.status]}
          strokeWidth={0.04}
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

  const has = hasPhotograph(cell);

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
          href={shotSrc(imageFor(cell), 480)}
          x={x + 0.1}
          y={y + 0.1}
          width={PREVIEW.w - 0.2}
          height={PREVIEW.h - 0.55}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <text
          x={x + PREVIEW.w / 2}
          y={y + (PREVIEW.h - 0.5) / 2}
          textAnchor="middle"
          className="font-mono"
          fontSize={0.18}
          fill="var(--ink-muted)"
        >
          {/* Two different nothings: no photograph taken, versus one taken
              and sitting in a draft that has not been published. */}
          {cell.status === "pending"
            ? t({ en: "Not captured yet", es: "Aún sin capturar" })
            : t({
                en: "Captured — certificate not published",
                es: "Capturado — certificado sin publicar",
              })}
        </text>
      )}
      <text
        x={x + 0.18}
        y={y + PREVIEW.h - 0.18}
        className="font-mono"
        fontSize={0.17}
        fill="var(--ink)"
      >
        {t(cell.requirement.what)}
      </text>
      {/* The judgement, where one has been raised. The photograph alone does
          not say whether anybody has acted on what it shows. */}
      {(cell.status === "warning" || cell.status === "problem") && (
        <text
          x={x + PREVIEW.w - 0.18}
          y={y + PREVIEW.h - 0.18}
          textAnchor="end"
          className="font-mono"
          fontSize={0.17}
          fill={cell.status === "problem" ? "var(--failed)" : "var(--pending)"}
        >
          {cell.status === "problem"
            ? t({ en: "needs rework", es: "requiere corrección" })
            : t({ en: "inspect", es: "inspeccionar" })}
        </text>
      )}
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
          src={shotSrc(imageFor(cell), 960)}
          className="block max-h-[55vh] w-full rounded-sm border border-line object-cover"
        />

        <p className="font-mono text-mono-sm text-ink-muted">
          {stage ? t(stage.name) : cell.requirement.stage} ·{" "}
          {t(TRADE[cell.requirement.trade])} · {cell.by.name}
          {cell.time ? ` · ${cell.time}` : ""}
        </p>

        {(cell.status === "warning" || cell.status === "problem") && (
          <p
            className="text-body-sm"
            style={{
              color:
                cell.status === "problem"
                  ? "var(--failed)"
                  : "var(--pending)",
            }}
          >
            {/* ⚠️  RAISED BY A PERSON, and the wording has to say so. Delphi
                does not certify construction quality; it recorded what was
                photographed and somebody looked at it. */}
            {cell.status === "problem"
              ? t({
                  en: "Flagged for rework by the site team.",
                  es: "Marcado para corrección por el equipo de obra.",
                })
              : t({
                  en: "Flagged for inspection by the site team.",
                  es: "Marcado para inspección por el equipo de obra.",
                })}
          </p>
        )}
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

/* ── Certificates ────────────────────────────────────────────────────────── */

/** What this apartment has actually produced: one card per published session.
 *
 *  ⚠️  A CERTIFICATE IS WHAT A COUNTERPARTY IS GIVEN, so this view is built
 *  around the things that make it checkable — the eight-character code, who
 *  captured it, the day, the media count — rather than around the checklist.
 *  The plan answers "who still owes me something"; this answers "what am I
 *  holding and can somebody else verify it".
 *
 *  ⚠️  THE IMAGES ARE THE CONTENT. Everything else on a card is one line of
 *  monospace above them. A certificate whose photographs are thumbnails is a
 *  certificate nobody can check by looking, which is the only way most people
 *  will ever check one.
 *
 *  ⚠️  AN UNPUBLISHED JOB IS NOT A CERTIFICATE. Work in progress has captures
 *  and no session yet, so it does not appear here at all — showing it with a
 *  blank code would invent a record that does not exist. The plan is where
 *  outstanding work lives. */
function Certificates({
  unit,
  tower,
  cells,
  onOpen,
}: {
  unit: UnitState;
  tower: Tower;
  cells: RequiredCapture[];
  onOpen: (c: RequiredCapture) => void;
}) {
  const t = useT();
  const { lang } = useLang();

  const issued = useMemo(
    () =>
      JOBS.map((job) => ({
        job,
        session: sessionFor(unit, tower, job),
        shots: cells.filter(
          (c) =>
            hasPhotograph(c) &&
            c.requirement.stage === job.stage &&
            c.requirement.trade === job.trade,
        ),
      })).filter((x) => x.session && x.shots.length > 0),
    [unit, tower, cells],
  );

  if (issued.length === 0) {
    return (
      <div className="min-h-0 flex-1 p-6">
        <p className="text-body-sm text-ink-secondary">
          {t({
            en: "No certificates published for this apartment yet.",
            es: "Aún no hay certificados publicados para este apartamento.",
          })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-4">
      <div className="flex flex-col gap-5">
        {issued.map(({ job, session, shots }) => {
          const stage = stageByKey.get(job.stage);
          return (
            <section
              key={`${job.stage}-${job.trade}`}
              className="overflow-hidden rounded-lg border border-line bg-surface"
            >
              <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2.5">
                <span className="rounded-sm border border-line-strong px-2 py-0.5 font-mono text-mono text-ink">
                  {session!.code}
                </span>
                <span className="text-body-sm font-semibold text-ink">
                  {stage ? t(stage.name) : job.stage}
                </span>
                <span className="text-body-sm text-ink-secondary">
                  {t(TRADE[job.trade])}
                </span>

                <span className="ml-auto flex items-center gap-3 font-mono text-mono-sm text-ink-muted">
                  <span
                    aria-hidden
                    className="flex size-6 items-center justify-center rounded-full bg-surface-sunken text-ink-secondary"
                  >
                    {session!.by.initials}
                  </span>
                  <span className="text-ink-secondary">{session!.by.name}</span>
                  <span>{fmtDate(session!.date, lang)}</span>
                  <span>
                    {t({
                      en: `${shots.length} captures`,
                      es: `${shots.length} capturas`,
                    })}
                  </span>
                </span>
              </header>

              {/* Two across, which on this pane is roughly 300px a side —
                  large enough to see what the photograph is of, which is the
                  whole purpose of showing it. */}
              <div className="grid grid-cols-2 gap-3 p-3">
                {shots.map((cell) => (
                  <figure key={cell.requirement.room} className="flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpen(cell)}
                      className="block cursor-pointer overflow-hidden rounded-sm border"
                      style={{
                        borderColor:
                          cell.status === "problem"
                            ? "var(--failed)"
                            : "var(--line)",
                      }}
                    >
                      <img
                        alt={t(cell.requirement.what)}
                        src={shotSrc(imageFor(cell), 480)}
                        srcSet={`${shotSrc(imageFor(cell), 480)} 480w, ${shotSrc(imageFor(cell), 960)} 960w`}
                        sizes="320px"
                        width={480}
                        height={320}
                        loading="lazy"
                        className="block aspect-[3/2] w-full object-cover"
                      />
                    </button>
                    <figcaption className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-body-sm text-ink">
                        {t(
                          CAPTURE_ROOMS.find(
                            (r) => r.key === cell.requirement.room,
                          )?.name ?? { en: cell.requirement.room, es: cell.requirement.room },
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-mono-sm text-ink-muted">
                        {cell.time}
                      </span>
                    </figcaption>
                    <span className="truncate font-mono text-mono-sm text-ink-muted">
                      {t(cell.requirement.what)}
                    </span>
                  </figure>
                ))}
              </div>

              <p className="border-t border-line px-4 py-2 font-mono text-mono-sm text-ink-muted">
                {t({
                  en: "Sealed with capture time, location and device. Open the code to verify without an account.",
                  es: "Sellado con hora, ubicación y dispositivo de captura. Abra el código para verificar sin cuenta.",
                })}
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
