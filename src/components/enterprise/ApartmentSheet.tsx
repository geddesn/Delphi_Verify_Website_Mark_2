import { useMemo, useState } from "react";
import {
  APARTMENT,
  CAPTURE_ROOMS,
  JOBS,
  TRADE,
  capturesFor,
  sessionFor,
  shotSrc,
  stageByKey,
  inFocus,
  type CaptureFocus,
  type RequiredCapture,
  type Tower,
  type UnitPhase,
  type UnitState,
} from "@/content/enterprise/world";
import { fmtDate, useLang, useT, type Bi } from "@/content/enterprise/lang";

/* ============================================================================
   APARTMENT SHEET
   ============================================================================
   One apartment's checklist, as a grid: rooms down, trades across.

   ⚠️  THE GRID IS THE POINT, and it took a wrong turn to find it. An earlier
   version listed captures grouped by certificate, which reads well and is
   useless on site — it answers "what did Mario photograph" and never answers
   "has anybody done the bathroom plumbing". The work is a room and a trade
   together: a bathroom needs plumbing, a living room does not, a kitchen
   needs every trade there is. The blanks carry as much information as the
   cells.

   ⚠️  A COLUMN IS A CERTIFICATE. A capture session has one photographer, so
   the plumber's two rooms publish as one certificate and the electrician's six
   as another. The column header carries the person, the firm, the date and the
   code; the cells under it are what that certificate contains. The grid and
   the certificates are two readings of one set of facts, not two features.

   ⚠️  A COLUMN WITH NO CERTIFICATE IS NOT A FAILURE. Work in progress has
   captures but no published session yet — in the product they are a draft
   until the session is published. The header says so rather than showing an
   empty code.
   ========================================================================= */

export function ApartmentPane({
  unit,
  tower,
  onBack,
  focus,
}: {
  unit: UnitState;
  tower: Tower;
  onBack: () => void;
  /** The table's current selection — a room, a task, or a person. */
  focus: CaptureFocus | null;
}) {
  const t = useT();
  const [open, setOpen] = useState<RequiredCapture | null>(null);
  /* Which room the plan has been clicked on. Null means the whole apartment,
     which is how it opens. */
  const [room, setRoom] = useState<string | null>(null);

  const cells = useMemo(() => capturesFor(unit, tower), [unit, tower]);

  const sessions = useMemo(
    () => JOBS.map((job) => sessionFor(unit, tower, job)),
    [unit, tower],
  );

  /* Photographs per room, for the plan above the grid. Only captures that
     exist are counted — a room with four requirements and none met should not
     advertise a four. */
  const perRoom = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of cells) {
      if (c.status !== "complete" && c.status !== "problem") continue;
      counts.set(c.requirement.room, (counts.get(c.requirement.room) ?? 0) + 1);
    }
    return counts;
  }, [cells]);

  const at = (room: string, stage: string, trade: string) =>
    cells.find(
      (c) =>
        c.requirement.room === room &&
        c.requirement.stage === stage &&
        c.requirement.trade === trade,
    ) ?? null;

  /* ⚠️  WHAT IS SHOWN IS WHAT IS SELECTED, from either direction: the room
     clicked on the plan and the row clicked in the progress table, together.
     Pick Mario and you see Mario's captures; pick the kitchen and you see the
     kitchen's; pick both and you see his work in that room.

     They FILTER rather than dim. Dimming was the first attempt and it keeps
     the shape of the whole checklist on screen, which is honest but useless at
     this size — twenty-two cells at thirty percent opacity around the four you
     asked for. The header keeps counting the whole apartment, so the total
     never silently shrinks with the view. */
  const shown = cells.filter(
    (c) => inFocus(c, focus) && (!room || c.requirement.room === room),
  );
  const shownRooms = CAPTURE_ROOMS.filter((r) =>
    shown.some((c) => c.requirement.room === r.key),
  );
  const shownJobs = JOBS.filter((j) =>
    shown.some(
      (c) => c.requirement.stage === j.stage && c.requirement.trade === j.trade,
    ),
  );

  const done = cells.filter((c) => c.status === "complete").length;
  const blocked = cells.filter((c) => c.status === "problem").length;
  const chasing = cells.filter((c) => c.status === "warning").length;

  return (
    <div className="flex h-full w-full flex-col bg-canvas">
      <header className="flex shrink-0 items-center gap-4 border-b border-line px-5 py-3">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer font-mono text-mono-sm uppercase text-ink-muted transition-colors hover:text-ink"
        >
          ← {tower.name} · {t({ en: "floor", es: "piso" })} {unit.floor}
        </button>
        <h2 className="text-heading text-ink">
          {t({ en: "Apartment", es: "Apartamento" })} {unit.code}
        </h2>
        <span className="font-mono text-mono-sm text-ink-muted">
          {APARTMENT.area.toFixed(0)} m²
        </span>

        <div className="ml-auto flex items-baseline gap-4">
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

      {/* ⚠️  THE PLAN TAKES A FIXED SLICE AND THE CAPTURES TAKE THE REST. This
          pane is far narrower than the full-screen sheet it replaced — the
          progress panel keeps its place on the right — so both halves cannot
          be given room to breathe. The plan is the one that gives way: it is
          an index, and you only have to recognise a room in it. */}
      {/* ⚠️  THE PLAN IS THE CONTROL, not an illustration. It was a 132px
          thumbnail under the header and the grid below it showed all 22 cells
          at once — which is the whole checklist whether or not you care about
          the kitchen. Clicking a room now narrows what is shown, so the plan
          earns the room it takes. */}
      <div className="shrink-0 border-b border-line px-4 py-3">
        <RoomPlan
          counts={perRoom}
          selected={room}
          onSelect={(key) => setRoom(key === room ? null : key)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        {/* ⚠️  AN EMPTY RESULT HAS TO SAY SO. A person focus can legitimately
            match nothing in one apartment — Mario plumbed the kitchen on this
            floor and Luigi did the one next door — and a blank pane reads as
            a bug rather than as an answer. */}
        {shown.length === 0 && (
          <p className="text-body-sm text-ink-secondary">
            {t({
              en: "Nothing in this apartment matches the current selection.",
              es: "Nada en este apartamento coincide con la selección actual.",
            })}
          </p>
        )}

        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-28 bg-canvas pb-2 pr-3 text-left align-bottom">
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {t({ en: "Room", es: "Ambiente" })}
                </span>
              </th>
              {shownJobs.map((job) => (
                <th key={`${job.stage}-${job.trade}`} className="pb-2 pl-3 text-left align-bottom">
                  <JobHeader
                    job={job}
                    session={sessions[JOBS.indexOf(job)]}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shownRooms.map((row) => (
              <tr key={row.key}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-t border-line bg-canvas py-2 pr-3 text-left align-middle"
                >
                  <span className="text-body-sm text-ink">{t(row.name)}</span>
                </th>
                {shownJobs.map((job) => {
                  const cell = at(row.key, job.stage, job.trade);
                  return (
                    <td
                      key={`${job.stage}-${job.trade}`}
                      className="border-t border-line py-2 pl-3 align-middle"
                    >
                      {cell ? (
                        <Cell cell={cell} onOpen={() => setOpen(cell)} />
                      ) : (
                        /* No work of this trade in this room. A dash, not an
                           empty box — "nothing required here" and "required
                           and not done" must never look alike. */
                        <span
                          aria-label={t({
                            en: "Not required",
                            es: "No aplica",
                          })}
                          className="block text-center font-mono text-mono-sm text-ink-muted"
                        >
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && <Lightbox cell={open} onClose={() => setOpen(null)} />}
    </div>
  );
}

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

/* ── A column: one job, one certificate ──────────────────────────────────── */

/** The apartment in plan, as an index to the grid below it. Small on purpose:
 *  the grid is the content and this is the key to it. */
function RoomPlan({
  counts,
  selected,
  onSelect,
}: {
  counts: Map<string, number>;
  selected: string | null;
  onSelect: (key: string) => void;
}) {
  const t = useT();
  const { width, depth, balcony } = APARTMENT;

  return (
    <svg
      viewBox={`-0.3 ${-balcony.depth - 0.3} ${width + 0.6} ${depth + balcony.depth + 0.6}`}
      className="h-[232px] w-full"
      role="img"
      aria-label={t({ en: "Apartment plan", es: "Planta del apartamento" })}
    >
      <g className="cursor-pointer" onClick={() => onSelect("balcon")}>
        <rect
          x={balcony.x}
          y={-balcony.depth}
          width={balcony.width}
          height={balcony.depth}
          fill={selected === "balcon" ? "var(--accent-subtle)" : "var(--surface-sunken)"}
          stroke={selected === "balcon" ? "var(--accent)" : "var(--line-strong)"}
          strokeWidth={selected === "balcon" ? 0.14 : 0.06}
        />
        <text
          x={balcony.x + balcony.width / 2}
          y={-balcony.depth / 2 + 0.14}
          textAnchor="middle"
          className="font-mono"
          fontSize={0.34}
          fill="var(--ink-muted)"
        >
          {t({ en: "Balcony", es: "Balcón" })}
        </text>
      </g>
      {APARTMENT.rooms.map((r) => (
        <g
          key={r.key}
          className="cursor-pointer"
          onClick={() => onSelect(r.key)}
        >
          <rect
            x={r.x}
            y={r.z}
            width={r.w}
            height={r.d}
            fill={selected === r.key ? "var(--accent-subtle)" : "var(--surface)"}
            stroke={selected === r.key ? "var(--accent)" : "var(--line-strong)"}
            strokeWidth={selected === r.key ? 0.14 : 0.06}
          />
          <text
            x={r.x + r.w / 2}
            y={r.z + r.d / 2 + 0.1}
            textAnchor="middle"
            className="font-mono"
            fontSize={0.36}
            fill="var(--ink-secondary)"
          >
            {t(r.name)}
          </text>
          {(counts.get(r.key) ?? 0) > 0 && (
            <text
              x={r.x + r.w / 2}
              y={r.z + r.d / 2 + 0.72}
              textAnchor="middle"
              className="font-mono"
              fontSize={0.32}
              fill="var(--ink-muted)"
            >
              {counts.get(r.key)}
            </text>
          )}
        </g>
      ))}
      <rect
        x={0}
        y={0}
        width={width}
        height={depth}
        fill="none"
        stroke="var(--ink-muted)"
        strokeWidth={0.09}
      />
    </svg>
  );
}

/* ── A column: one job, one certificate ──────────────────────────────────── */

function JobHeader({
  job,
  session,
}: {
  job: { stage: string; trade: string };
  session: ReturnType<typeof sessionFor>;
}) {
  const t = useT();
  const { lang } = useLang();
  const stage = stageByKey.get(job.stage);

  return (
    <div className="flex min-w-44 flex-col gap-1">
      <span className="text-body-sm text-ink">
        {t(TRADE[job.trade as keyof typeof TRADE])}
      </span>
      <span className="font-mono text-mono-sm text-ink-muted">
        {stage ? t(stage.name) : job.stage}
      </span>

      {session ? (
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-mono text-ink-secondary"
            style={{ fontSize: "0.5rem" }}
          >
            {session.by.initials}
          </span>
          <span className="truncate text-body-sm text-ink-secondary">
            {session.by.name}
          </span>
        </span>
      ) : (
        <span className="text-body-sm text-ink-muted">
          {t({ en: "Not published yet", es: "Aún sin publicar" })}
        </span>
      )}

      {session && (
        <span className="flex items-center gap-2">
          <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-mono-sm text-ink">
            {session.code}
          </span>
          <span className="font-mono text-mono-sm text-ink-muted">
            {fmtDate(session.date, lang)}
          </span>
        </span>
      )}
    </div>
  );
}

/* ── A cell: one room, one trade ─────────────────────────────────────────── */

/* The same five states as the tower, and the same rule: colour is for what
   needs a person. A captured cell shows the photograph and no colour at all —
   the picture is the status. */
const CELL: Record<UnitPhase, { border: string; label: Bi }> = {
  pending: {
    border: "var(--line)",
    label: { en: "Not started", es: "Sin iniciar" },
  },
  active: {
    border: "var(--accent)",
    label: { en: "In progress", es: "En ejecución" },
  },
  complete: {
    border: "var(--line-strong)",
    label: { en: "Captured", es: "Capturado" },
  },
  warning: {
    border: "var(--pending)",
    label: { en: "Overdue", es: "Vencido" },
  },
  problem: {
    border: "var(--failed)",
    label: { en: "Rejected — retake", es: "Rechazada — repetir" },
  },
};

function Cell({
  cell,
  onOpen,
}: {
  cell: RequiredCapture;
  onOpen: () => void;
}) {
  const t = useT();
  const style = CELL[cell.status];
  const shown = cell.status === "complete" || cell.status === "problem";

  if (!shown) {
    return (
      <span
        className="flex h-[68px] w-full items-center justify-center rounded-sm border px-2 text-center"
        style={{
          borderColor: style.border,
          backgroundColor:
            cell.status === "active" ? "var(--accent-subtle)" : "var(--surface)",
        }}
      >
        <span className="text-body-sm text-ink-secondary">{t(style.label)}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full cursor-pointer items-center gap-2.5 rounded-sm border p-1 text-left transition-colors"
      style={{
        borderColor: style.border,
        /* A rejected capture keeps its photograph — somebody has to look at it
           to see why screening refused it — but the frame says it cannot be
           used. */
        borderWidth: cell.status === "problem" ? 1.5 : 1,
      }}
    >
      <img
        alt={t(cell.requirement.what)}
        src={shotSrc(cell.requirement.image, 240)}
        srcSet={`${shotSrc(cell.requirement.image, 240)} 240w, ${shotSrc(cell.requirement.image, 480)} 480w`}
        sizes="90px"
        width={240}
        height={160}
        loading="lazy"
        className="block h-[60px] w-[90px] shrink-0 rounded-xs object-cover"
      />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-sm text-ink">
          {t(cell.requirement.what)}
        </span>
        <span className="truncate font-mono text-mono-sm text-ink-muted">
          {cell.status === "problem" ? t(style.label) : cell.time}
        </span>
      </span>
    </button>
  );
}

/* ── One capture, large ──────────────────────────────────────────────────── */

function Lightbox({
  cell,
  onClose,
}: {
  cell: RequiredCapture;
  onClose: () => void;
}) {
  const t = useT();
  const room = CAPTURE_ROOMS.find((r) => r.key === cell.requirement.room);

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center p-10"
      style={{ backgroundColor: "var(--canvas)" }}
    >
      <div className="flex max-h-full w-full max-w-3xl flex-col gap-3">
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
          className="block max-h-[60vh] w-full rounded-sm border border-line object-cover"
        />

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
