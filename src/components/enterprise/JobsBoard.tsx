import { useMemo, useState } from "react";
import { CaptureZoom } from "./CaptureZoom";
import {
  CAPTURE_ROOMS,
  SCHEDULABLE_JOBS,
  TOWERS,
  TRADE,
  candidateWork,
  captureFor,
  crewForTrade,
  openWork,
  roomsForJob,
  stageByKey,
  TODAY,
  workSummary,
  type Capturer,
  type RequiredCapture,
  type Trade,
  type WorkItem,
  type WorkState,
} from "@/content/enterprise/world";
import { fmtDate, fmtInt, useLang, useT, type Bi } from "@/content/enterprise/lang";
import { cn } from "@/lib/cn";

/* ============================================================================
   JOBS
   ============================================================================
   Who has been asked to photograph what, and whether they have.

   ⚠️  THE PRODUCT DOES NOT DO THIS. Delphi has no job, no assignee, no due
   date and no schedule: somebody opens the app, takes a photograph, and a
   certificate exists. Everything on this screen is the thing a developer with
   70% of the work subcontracted needs before any of that is usable at scale,
   and none of it is built. It goes near the top of the gap analysis — above
   the review queue, because you cannot review work nobody was asked to do.

   ⚠️  A JOB IS NOT A CERTIFICATE, and the two must never blur. Asking somebody
   to photograph a bathroom is an instruction; the certificate is what comes
   back. The instruction can be wrong, late, duplicated or ignored and none of
   that touches the record, which is sealed. Nothing on this screen marks work
   as done — only the capture can do that, and it does it by existing.

   ⚠️  THE GRAIN IS THE CHECKLIST CELL. "Apartment 1134 · bathroom · plumbing"
   is a morning's work with a known answer. "Apartment 1134" is four trades
   over three weeks and cannot be given to anybody.

   ── The two halves ─────────────────────────────────────────────────────────

   MONITORING is the work in flight: the cells of an apartment's current stage
   that have no photograph yet, plus anything the site team sent back. There
   are 127 of them, and 69 are late.

   CREATING is everything else. Torre 3 has not begun a single apartment and 56
   of Torre 2's have not either — some three hundred apartments nobody has
   raised a job against. That is what the panel at the top schedules, a floor
   range at a time, because raising 120 jobs one at a time is not a feature.
   ========================================================================= */

const STATE: Record<WorkState, { label: Bi; colour: string }> = {
  unassigned: {
    label: { en: "Unassigned", es: "Sin asignar" },
    colour: "var(--ink-muted)",
  },
  pending: {
    label: { en: "Pending", es: "Pendiente" },
    colour: "var(--ink-secondary)",
  },
  "in-progress": {
    label: { en: "In progress", es: "En ejecución" },
    colour: "var(--accent)",
  },
  inspection: {
    label: { en: "Needs inspection", es: "Requiere inspección" },
    colour: "var(--pending)",
  },
  rework: {
    label: { en: "Needs rework", es: "Requiere corrección" },
    colour: "var(--failed)",
  },
  /* ⚠️  DONE MEANS THE PHOTOGRAPH EXISTS. Nothing on this screen puts a job
     here; only a capture does, and it does it by existing.
     ⚠️  AND IT IS GREY, NOT GREEN. --verified is the token for "sealed and
     unaltered", which is the one claim this product actually makes; spending
     it on "somebody took the photograph" would say the work had been checked.
     The tower legend and the analysis charts already draw complete as muted,
     so this matches them. */
  done: {
    label: { en: "Completed", es: "Completado" },
    colour: "var(--ink-muted)",
  },
};

/* Worst first, finished last: the order somebody works the board in. */
const ORDER: WorkState[] = [
  "rework",
  "inspection",
  "in-progress",
  "pending",
  "unassigned",
  "done",
];

const GRID =
  "32px minmax(200px, 1.6fr) minmax(130px, 1fr) minmax(150px, 1fr) 128px 150px";

/** Session edits, keyed by job id. A rendering, not a store. */
type Edit = { by?: Capturer | null; due?: string };

export function JobsBoard() {
  const t = useT();
  const { lang } = useLang();

  const derived = useMemo(() => openWork(), []);
  const [raised, setRaised] = useState<WorkItem[]>([]);
  const [edits, setEdits] = useState<Map<string, Edit>>(new Map());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  /* The certificate being looked at, if any. Held here rather than per row so
     only one is ever open. */
  const [open, setOpen] = useState<{ cell: RequiredCapture; code: string } | null>(
    null,
  );

  const [tower, setTower] = useState("all");
  const [trade, setTrade] = useState("all");
  const [state, setState] = useState("all");
  const [who, setWho] = useState("all");
  const [find, setFind] = useState("");

  /* Edits are applied on the way out rather than written back into the
     fixture, so the derived backlog stays the thing it is derived from. */
  const all: WorkItem[] = useMemo(() => {
    const merged = [...raised, ...derived].map((item) => {
      const e = edits.get(item.id);
      if (!e) return item;
      const by = e.by === undefined ? item.by : e.by;
      const due = e.due ?? item.due;
      return {
        ...item,
        by,
        due,
        daysLate: daysBetween(due),
        /* Giving unallocated work a name is the one state change an
           assignment can make. It cannot make work done. */
        /* ⚠️  THE ONLY TRANSITION AN ASSIGNMENT CAN MAKE is between having a
           name on it and not. It cannot start work and it certainly cannot
           finish it, so a completed job is left exactly as it is. */
        state:
          item.state === "unassigned" && by
            ? ("pending" as WorkState)
            : item.state === "pending" && !by
              ? ("unassigned" as WorkState)
              : item.state,
      };
    });
    return merged.sort(
      (a, b) =>
        ORDER.indexOf(a.state) - ORDER.indexOf(b.state) ||
        a.due.localeCompare(b.due),
    );
  }, [raised, derived, edits]);

  const rows = useMemo(
    () =>
      all.filter((i) => {
        if (tower !== "all" && i.tower.key !== tower) return false;
        if (trade !== "all" && i.trade !== trade) return false;
        if (state !== "all" && i.state !== state) return false;
        if (who !== "all" && (i.by?.id ?? "none") !== who) return false;
        if (find.trim() && !i.unit.code.includes(find.trim())) return false;
        return true;
      }),
    [all, tower, trade, state, who, find],
  );

  const sum = workSummary(all);
  const chosen = rows.filter((r) => picked.has(r.id));

  const apply = (ids: string[], edit: Edit) =>
    setEdits((m) => {
      const next = new Map(m);
      for (const id of ids) next.set(id, { ...next.get(id), ...edit });
      return next;
    });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          value={fmtInt(sum.outstanding, lang)}
          label={t({ en: "Outstanding", es: "Pendientes" })}
          note={t({
            en: "one apartment, one room, one trade",
            es: "un apartamento, un espacio, un oficio",
          })}
        />
        <Stat
          value={fmtInt(sum.late, lang)}
          label={t({ en: "Past due", es: "Vencidos" })}
          note={t({ en: "oldest first below", es: "los más antiguos abajo" })}
          tone={sum.late > 0 ? "var(--pending)" : undefined}
        />
        <Stat
          value={fmtInt(sum.rework + sum.inspection, lang)}
          label={t({ en: "Sent back", es: "Devueltos" })}
          note={t({
            en: `${sum.rework} rework, ${sum.inspection} inspection`,
            es: `${sum.rework} corrección, ${sum.inspection} inspección`,
          })}
          tone={sum.rework > 0 ? "var(--failed)" : undefined}
        />
        <Stat
          value={fmtInt(sum.done, lang)}
          label={t({ en: "Completed", es: "Completados" })}
          note={t({
            en: `in the last 4 weeks · ${sum.unassigned} jobs have nobody on them`,
            es: `en las últimas 4 semanas · ${sum.unassigned} sin responsable`,
          })}
        />
      </div>

      <Create
        open={creating}
        onOpen={() => setCreating((v) => !v)}
        onCreate={(items) => {
          setRaised((r) => [...items, ...r]);
          setCreating(false);
        }}
        existing={useMemo(
          () => new Set([...raised, ...derived].map((i) => i.id)),
          [raised, derived],
        )}
      />

      <div className="flex flex-wrap items-end gap-3">
        <Select
          label={t({ en: "Tower", es: "Torre" })}
          value={tower}
          onChange={setTower}
          options={[
            { value: "all", label: t({ en: "All towers", es: "Todas" }) },
            ...TOWERS.map((x) => ({ value: x.key, label: x.name })),
          ]}
        />
        <Select
          label={t({ en: "Trade", es: "Oficio" })}
          value={trade}
          onChange={setTrade}
          options={[
            { value: "all", label: t({ en: "All trades", es: "Todos" }) },
            ...[...new Set(SCHEDULABLE_JOBS.map((j) => j.trade))].map(
              (x: Trade) => ({ value: x, label: t(TRADE[x]) }),
            ),
          ]}
        />
        <Select
          label={t({ en: "State", es: "Estado" })}
          value={state}
          onChange={setState}
          options={[
            { value: "all", label: t({ en: "Any state", es: "Cualquiera" }) },
            ...ORDER.map((x) => ({ value: x, label: t(STATE[x].label) })),
          ]}
        />
        <Select
          label={t({ en: "Assigned to", es: "Asignado a" })}
          value={who}
          onChange={setWho}
          options={[
            { value: "all", label: t({ en: "Anybody", es: "Cualquiera" }) },
            { value: "none", label: t({ en: "Nobody", es: "Nadie" }) },
            ...[
              ...new Map(
                all
                  .map((i) => i.by)
                  .filter((c): c is Capturer => c !== null)
                  .map((c) => [c.id, c] as const),
              ).values(),
            ].map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">
            {t({ en: "Apartment", es: "Apartamento" })}
          </span>
          <input
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="1134"
            className="w-28 rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink placeholder:text-ink-muted"
          />
        </label>

        <span className="ml-auto text-[12px] text-ink-secondary">
          {t({
            en: `${fmtInt(rows.length, lang)} of ${fmtInt(all.length, lang)} shown`,
            es: `${fmtInt(rows.length, lang)} de ${fmtInt(all.length, lang)}`,
          })}
        </span>
      </div>

      {chosen.length > 0 && (
        <Bulk
          count={chosen.length}
          trades={new Set(chosen.map((c) => c.trade))}
          onAssign={(c) => apply(chosen.map((x) => x.id), { by: c })}
          onDue={(d) => apply(chosen.map((x) => x.id), { due: d })}
          onClear={() => setPicked(new Set())}
        />
      )}

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <div className="min-w-[900px]">
          <div
            className="grid items-center gap-x-4 border-b border-line px-4 py-2"
            style={{ gridTemplateColumns: GRID }}
          >
            <input
              type="checkbox"
              aria-label={t({ en: "Select all shown", es: "Seleccionar todo" })}
              checked={rows.length > 0 && chosen.length === rows.length}
              onChange={(e) =>
                setPicked(
                  e.target.checked ? new Set(rows.map((r) => r.id)) : new Set(),
                )
              }
              className="size-3.5 cursor-pointer accent-[var(--accent)]"
            />
            <Th>{t({ en: "Job", es: "Trabajo" })}</Th>
            <Th>{t({ en: "Stage", es: "Etapa" })}</Th>
            <Th>{t({ en: "Assigned to", es: "Asignado a" })}</Th>
            <Th>{t({ en: "Due", es: "Vence" })}</Th>
            <Th>{t({ en: "State", es: "Estado" })}</Th>
          </div>

          {rows.length === 0 ? (
            <p className="px-4 py-8 text-[13px] text-ink-secondary">
              {t({
                en: "Nothing matches those filters.",
                es: "Nada coincide con esos filtros.",
              })}
            </p>
          ) : (
            rows
              .slice(0, 120)
              .map((item) => (
                <Row
                  key={item.id}
                  item={item}
                  picked={picked.has(item.id)}
                  onPick={(on) =>
                    setPicked((p) => {
                      const next = new Set(p);
                      if (on) next.add(item.id);
                      else next.delete(item.id);
                      return next;
                    })
                  }
                  onAssign={(c) => apply([item.id], { by: c })}
                  onOpen={() => {
                    const cell = captureFor(item);
                    if (cell && item.certificate) {
                      setOpen({ cell, code: item.certificate });
                    }
                  }}
                />
              ))
          )}

          {rows.length > 120 && (
            <p className="border-t border-line px-4 py-2.5 text-[12px] text-ink-secondary">
              {t({
                en: `${fmtInt(rows.length - 120, lang)} more not shown — narrow the filters.`,
                es: `${fmtInt(rows.length - 120, lang)} más sin mostrar — ajusta los filtros.`,
              })}
            </p>
          )}
        </div>
      </div>

      {/* ⚠️  THE LINE THAT KEEPS THE CLAIM HONEST, on the page and not only in
          the source. */}
      <p className="max-w-prose text-[12px] text-ink-muted">
        {t({
          en: "A job is an instruction, not a record. Nothing here can mark work as done — only a capture does that, and it does it by existing. Assignments and dates made on this screen are held for this session.",
          es: "Un trabajo es una instrucción, no un registro. Nada aquí puede dar por hecho el trabajo — eso solo lo hace una captura, y lo hace al existir. Las asignaciones y fechas de esta pantalla se guardan solo durante esta sesión.",
        })}
      </p>

      {open && (
        <CaptureZoom
          shots={[open.cell]}
          start={0}
          code={open.code}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function daysBetween(due: string) {
  return Math.round(
    (Date.parse(`${TODAY}T00:00:00Z`) - Date.parse(`${due}T00:00:00Z`)) /
      86400000,
  );
}

function Row({
  item,
  picked,
  onPick,
  onAssign,
  onOpen,
}: {
  item: WorkItem;
  picked: boolean;
  onPick: (on: boolean) => void;
  onAssign: (c: Capturer | null) => void;
  onOpen: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const room = CAPTURE_ROOMS.find((r) => r.key === item.room);
  const stage = stageByKey.get(item.stage);
  const crew = crewForTrade(item.trade);

  return (
    <div
      className="grid items-center gap-x-4 border-b border-line px-4 py-2.5 last:border-b-0 hover:bg-surface-sunken"
      style={{ gridTemplateColumns: GRID }}
    >
      <input
        type="checkbox"
        aria-label={`${item.unit.code} ${item.room}`}
        checked={picked}
        onChange={(e) => onPick(e.target.checked)}
        className="size-3.5 cursor-pointer accent-[var(--accent)]"
      />

      <span className="min-w-0">
        <span className="block truncate text-[13px] text-ink">
          <span className="font-medium">
            {t({ en: "Apt", es: "Apto" })} {item.unit.code}
          </span>
          {" · "}
          {room ? t(room.name) : item.room}
          {" · "}
          {t(TRADE[item.trade])}
        </span>
        <span className="flex min-w-0 items-center gap-2 text-[11px] text-ink-secondary">
          <span className="truncate">
            {item.tower.name} · {t({ en: "floor", es: "piso" })}{" "}
            {item.unit.floor} · {t(item.requirement.what)}
          </span>

          {/* ⚠️  ONLY WHERE A RECORD EXISTS. The first question about a
              sent-back job is what the photograph actually showed, so the
              certificate is one click from the row. Work nobody has done yet
              has no certificate and gets no link — offering one would be
              offering to open something that does not exist. */}
          {item.certificate && (
            <button
              type="button"
              onClick={onOpen}
              title={t({
                en: "Open the certificate",
                es: "Abrir el certificado",
              })}
              className="shrink-0 cursor-pointer rounded-sm border border-line px-1.5 py-px font-mono text-[10px] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
              style={
                item.state === "rework" || item.state === "inspection"
                  ? { borderColor: STATE[item.state].colour }
                  : undefined
              }
            >
              {item.certificate}
            </button>
          )}
        </span>
      </span>

      <span className="truncate text-[12px] text-ink-secondary">
        {stage ? t(stage.name) : item.stage}
      </span>

      {/* ⚠️  ONLY THE TRADE'S OWN CREW. Offering a tiler for a plumbing job is
          a dropdown that invents work nobody can do. And finished work is not
          reassignable: the photograph has a name on it already, and that name
          is a fact rather than a plan. */}
      {item.state === "done" ? (
        <span className="truncate text-[12px] text-ink-secondary">
          {item.by?.name}
        </span>
      ) : (
      <select
        value={item.by?.id ?? ""}
        onChange={(e) =>
          onAssign(crew.find((c) => c.id === e.target.value) ?? null)
        }
        className={cn(
          "w-full cursor-pointer rounded-md border bg-surface px-2 py-1 text-[12px]",
          item.by ? "border-line text-ink" : "border-line-strong text-ink-muted",
        )}
      >
        <option value="">{t({ en: "— nobody —", es: "— nadie —" })}</option>
        {crew.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      )}

      <span className="font-mono text-[12px] tabular-nums">
        <span className="text-ink-secondary">{fmtDate(item.due, lang)}</span>
        {/* A due date on finished work is noise — the date IS the capture. */}
        {item.state !== "done" && item.daysLate > 0 && (
          <span className="ml-1.5" style={{ color: "var(--pending)" }}>
            +{item.daysLate}d
          </span>
        )}
      </span>

      <span
        className="flex items-center gap-1.5 text-[12px]"
        style={{ color: STATE[item.state].colour }}
      >
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: STATE[item.state].colour }}
        />
        {t(STATE[item.state].label)}
      </span>
    </div>
  );
}

/** Raise jobs for work nobody has asked for yet, a floor range at a time. */
function Create({
  open,
  onOpen,
  onCreate,
  existing,
}: {
  open: boolean;
  onOpen: () => void;
  onCreate: (items: WorkItem[]) => void;
  existing: Set<string>;
}) {
  const t = useT();
  const { lang } = useLang();

  const [towerKey, setTowerKey] = useState(TOWERS[TOWERS.length - 1].key);
  const [jobKey, setJobKey] = useState(
    `${SCHEDULABLE_JOBS[0].stage}:${SCHEDULABLE_JOBS[0].trade}`,
  );
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(6);
  const [rooms, setRooms] = useState<string[]>([]);
  const [assignee, setAssignee] = useState("");
  const [due, setDue] = useState(() => {
    const d = new Date(Date.parse(`${TODAY}T00:00:00Z`) + 14 * 86400000);
    return d.toISOString().slice(0, 10);
  });

  const tower = TOWERS.find((x) => x.key === towerKey)!;
  /* ⚠️  THROUGH A MEMO, NOT A DESTRUCTURE. `const [stage, trade] =
     jobKey.split(":")` makes a fresh array on every render, and values pulled
     out of it cannot be shown to be stable — so every memo downstream of them
     was abandoned, and the candidate count re-walked three hundred apartments
     on each keystroke in the date field. */
  const job = useMemo(() => {
    const [stage, trade] = jobKey.split(":") as [string, Trade];
    return { stage, trade };
  }, [jobKey]);
  const crew = crewForTrade(job.trade);

  /* Memoised because it is a memo dependency below. */
  const possible = useMemo(() => roomsForJob(job.stage, job.trade), [job]);

  /* Rooms reset when the job type changes, or a bathroom selection survives
     into a job that has no bathroom and silently creates nothing. */
  const chosenRooms = useMemo(
    () => rooms.filter((r) => possible.includes(r)),
    [rooms, possible],
  );

  const candidates = useMemo(
    () =>
      candidateWork({
        towerKey,
        stage: job.stage,
        trade: job.trade,
        rooms: chosenRooms,
        floorFrom: from,
        floorTo: to,
      }).filter(
        (c) =>
          !existing.has(
            `${c.tower.key}-${c.unit.code}-${c.requirement.stage}-${c.requirement.trade}-${c.requirement.room}`,
          ),
      ),
    [towerKey, job, chosenRooms, from, to, existing],
  );

  const create = () => {
    const by = crew.find((c) => c.id === assignee) ?? null;
    onCreate(
      candidates.map(({ tower: tw, unit, requirement }) => ({
        id: `${tw.key}-${unit.code}-${requirement.stage}-${requirement.trade}-${requirement.room}`,
        tower: tw,
        unit,
        requirement,
        stage: requirement.stage,
        trade: requirement.trade,
        room: requirement.room,
        /* ⚠️  NO CAST HERE. This read `as WorkState` and said "scheduled",
           a state that had been renamed to "pending" — the cast swallowed the
           error and the board threw on the first job it raised. A literal the
           compiler is allowed to check is worth more than a tidy-looking one
           it is told to trust. */
        state: by ? "pending" : "unassigned",
        /* Raised, not carried out — there is nothing to open yet. */
        certificate: null,
        by,
        due,
        daysLate: daysBetween(due),
      })),
    );
  };

  if (!open) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpen}
          className="cursor-pointer rounded-md border border-line-strong bg-surface px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-surface-sunken"
        >
          {t({ en: "Raise jobs", es: "Crear trabajos" })}
        </button>
        <span className="text-[12px] text-ink-secondary">
          {t({
            en: "for a floor range that has not been started",
            es: "para un rango de pisos que aún no ha empezado",
          })}
        </span>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-line-strong bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[15px] font-semibold text-ink">
          {t({ en: "Raise jobs", es: "Crear trabajos" })}
        </h3>
        <button
          type="button"
          onClick={onOpen}
          className="cursor-pointer font-mono text-[11px] uppercase text-ink-muted hover:text-ink"
        >
          {t({ en: "Close", es: "Cerrar" })} ✕
        </button>
      </div>
      <p className="mt-0.5 mb-4 max-w-prose text-[12px] text-ink-secondary">
        {t({
          en: "One job per apartment, per room, per trade. A range of floors at a time, because raising a hundred of them one at a time is not a plan.",
          es: "Un trabajo por apartamento, por espacio y por oficio. Un rango de pisos a la vez, porque crear cien de uno en uno no es un plan.",
        })}
      </p>

      <div className="flex flex-wrap items-end gap-3">
        <Select
          label={t({ en: "Tower", es: "Torre" })}
          value={towerKey}
          onChange={setTowerKey}
          options={TOWERS.map((x) => ({ value: x.key, label: x.name }))}
        />
        <Select
          label={t({ en: "Job type", es: "Tipo de trabajo" })}
          value={jobKey}
          onChange={(v) => {
            setJobKey(v);
            setRooms([]);
          }}
          options={SCHEDULABLE_JOBS.map((j) => {
            const st = stageByKey.get(j.stage);
            return {
              value: `${j.stage}:${j.trade}`,
              label: `${st ? t(st.name) : j.stage} · ${t(TRADE[j.trade])}`,
            };
          })}
        />
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">
            {t({ en: "Floors", es: "Pisos" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Num value={from} max={tower.floors} onChange={setFrom} />
            <span className="text-[12px] text-ink-muted">–</span>
            <Num value={to} max={tower.floors} onChange={setTo} />
          </span>
        </label>
        <Select
          label={t({ en: "Assign to", es: "Asignar a" })}
          value={assignee}
          onChange={setAssignee}
          options={[
            { value: "", label: t({ en: "Nobody yet", es: "Nadie aún" }) },
            ...crew.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[10px] uppercase text-ink-muted">
            {t({ en: "Due", es: "Vence" })}
          </span>
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink"
          />
        </label>
      </div>

      <div className="mt-4">
        <span className="font-mono text-[10px] uppercase text-ink-muted">
          {t({ en: "Rooms", es: "Espacios" })}
        </span>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {possible.map((key) => {
            const room = CAPTURE_ROOMS.find((r) => r.key === key);
            const on = chosenRooms.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setRooms((r) =>
                    r.includes(key) ? r.filter((x) => x !== key) : [...r, key],
                  )
                }
                className={cn(
                  "cursor-pointer rounded-md border px-2.5 py-1 text-[12px] transition-colors",
                  on
                    ? "border-line-strong bg-surface-sunken text-ink"
                    : "border-line text-ink-secondary hover:border-line-strong",
                )}
              >
                {room ? t(room.name) : key}
              </button>
            );
          })}
          <span className="self-center pl-1 text-[11px] text-ink-muted">
            {chosenRooms.length === 0
              ? t({ en: "none chosen = all", es: "ninguno = todos" })
              : ""}
          </span>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-line pt-4">
        <button
          type="button"
          onClick={create}
          disabled={candidates.length === 0}
          className="cursor-pointer rounded-md px-3.5 py-2 text-[13px] font-medium text-ink-inverse transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-40"
          style={{ backgroundColor: "var(--accent)" }}
        >
          {t({
            en: `Raise ${fmtInt(candidates.length, lang)} jobs`,
            es: `Crear ${fmtInt(candidates.length, lang)} trabajos`,
          })}
        </button>
        <span className="max-w-prose text-[12px] text-ink-secondary">
          {candidates.length === 0
            ? t({
                en: "Nothing to raise: every apartment in that range has either been photographed already or has a job open.",
                es: "Nada que crear: cada apartamento del rango ya fue fotografiado o ya tiene un trabajo abierto.",
              })
            : t({
                en: `${fmtInt(candidates.length, lang)} apartments in floors ${from}–${to} have no photograph and no job for this.`,
                es: `${fmtInt(candidates.length, lang)} apartamentos en los pisos ${from}–${to} no tienen fotografía ni trabajo para esto.`,
              })}
        </span>
      </div>
    </section>
  );
}

function Bulk({
  count,
  trades,
  onAssign,
  onDue,
  onClear,
}: {
  count: number;
  trades: Set<Trade>;
  onAssign: (c: Capturer | null) => void;
  onDue: (d: string) => void;
  onClear: () => void;
}) {
  const t = useT();
  /* ⚠️  ONE TRADE AT A TIME for a bulk assign. A selection spanning plumbing
     and finishes has no single person who could take it, and a dropdown that
     offered one would be lying about what it was about to do. */
  const single = trades.size === 1 ? [...trades][0] : null;
  const crew = single ? crewForTrade(single) : [];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-line-strong bg-surface-sunken px-4 py-2.5">
      <span className="text-[13px] font-medium text-ink">
        {t({ en: `${count} selected`, es: `${count} seleccionados` })}
      </span>

      {single ? (
        <label className="flex items-center gap-2 text-[12px] text-ink-secondary">
          {t({ en: "Assign to", es: "Asignar a" })}
          <select
            defaultValue=""
            onChange={(e) =>
              onAssign(crew.find((c) => c.id === e.target.value) ?? null)
            }
            className="cursor-pointer rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink"
          >
            <option value="">{t({ en: "— nobody —", es: "— nadie —" })}</option>
            {crew.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <span className="text-[12px] text-ink-muted">
          {t({
            en: "Mixed trades — filter to one trade to assign in bulk.",
            es: "Oficios mezclados — filtra por un oficio para asignar en lote.",
          })}
        </span>
      )}

      <label className="flex items-center gap-2 text-[12px] text-ink-secondary">
        {t({ en: "Due", es: "Vence" })}
        <input
          type="date"
          onChange={(e) => e.target.value && onDue(e.target.value)}
          className="rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink"
        />
      </label>

      <button
        type="button"
        onClick={onClear}
        className="ml-auto cursor-pointer font-mono text-[11px] uppercase text-ink-muted hover:text-ink"
      >
        {t({ en: "Clear", es: "Limpiar" })}
      </button>
    </div>
  );
}

/* ── Small pieces ────────────────────────────────────────────────────────── */

function Stat({
  value,
  label,
  note,
  tone,
}: {
  value: string;
  label: string;
  note: string;
  tone?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <p
        className="font-mono text-[24px] tabular-nums"
        style={{ color: tone ?? "var(--ink)" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-ink">{label}</p>
      <p className="text-[12px] text-ink-secondary">{note}</p>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase text-ink-muted">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer rounded-md border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function Num({
  value,
  max,
  onChange,
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
}) {
  return (
    <input
      type="number"
      min={1}
      max={max}
      value={value}
      onChange={(e) =>
        onChange(Math.max(1, Math.min(max, Number(e.target.value) || 1)))
      }
      className="w-16 rounded-md border border-line bg-surface px-2 py-1.5 text-[13px] tabular-nums text-ink"
    />
  );
}

function Th({ children }: { children: string }) {
  return (
    <span className="font-mono text-[10px] uppercase text-ink-muted">
      {children}
    </span>
  );
}
