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

export function ApartmentSheet({
  unit,
  tower,
  onBack,
}: {
  unit: UnitState;
  tower: Tower;
  onBack: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const [open, setOpen] = useState<RequiredCapture | null>(null);

  const cells = useMemo(() => capturesFor(unit, tower), [unit, tower]);

  const sessions = useMemo(
    () => JOBS.map((job) => sessionFor(unit, tower, job)),
    [unit, tower],
  );

  const at = (room: string, stage: string, trade: string) =>
    cells.find(
      (c) =>
        c.requirement.room === room &&
        c.requirement.stage === stage &&
        c.requirement.trade === trade,
    ) ?? null;

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

        <div className="ml-auto flex items-baseline gap-5">
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

      <div className="min-h-0 flex-1 overflow-auto p-5">
        <table className="w-full border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-36 bg-canvas pb-2 pr-3 text-left align-bottom">
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {t({ en: "Room", es: "Ambiente" })}
                </span>
              </th>
              {JOBS.map((job, i) => (
                <th key={`${job.stage}-${job.trade}`} className="pb-2 pl-3 text-left align-bottom">
                  <JobHeader job={job} session={sessions[i]} lang={lang} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CAPTURE_ROOMS.map((room) => (
              <tr key={room.key}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 border-t border-line bg-canvas py-2 pr-3 text-left align-middle"
                >
                  <span className="text-body-sm text-ink">{t(room.name)}</span>
                </th>
                {JOBS.map((job) => {
                  const cell = at(room.key, job.stage, job.trade);
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

function JobHeader({
  job,
  session,
  lang,
}: {
  job: { stage: string; trade: string };
  session: ReturnType<typeof sessionFor>;
  lang: "en" | "es";
}) {
  const t = useT();
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
