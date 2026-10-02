import { useMemo, useState } from "react";
import {
  CAPTURE_ROOMS,
  TRADE,
  apartmentsStarted,
  crewById,
  siteProgress,
  stageByKey,
  type ProgressRow,
  type CaptureFocus,
  type Tower,
  type Trade,
} from "@/content/enterprise/world";
import { useT, type Bi } from "@/content/enterprise/lang";
import { cn } from "@/lib/cn";

/* ============================================================================
   SITE PROGRESS
   ============================================================================
   Every required capture in the development, by room and trade.

   ⚠️  THE ROW IS A ROOM AND A TRADE TOGETHER, which is the unit of work on a
   site and the reason this is a table rather than a progress bar. "The
   development is 62% captured" is not actionable. "Bathroom plumbing: 123
   outstanding, one rejected" is a phone call to a named subcontractor.

   ⚠️  IT COUNTS APARTMENTS THAT EXIST. Torre 3 is at foundations, so its 192
   apartments have no checklist yet and are left out — including them would
   bury the real backlog under rooms that have not been built. The figure is
   stated above the table so the arithmetic can be checked.

   The columns are the same five states the tower is drawn in, in the order
   work passes through them, so a row reads left to right as a pipeline.
   ========================================================================= */

type Column = {
  key: keyof Pick<
    ProgressRow,
    "pending" | "active" | "warning" | "problem" | "complete"
  >;
  label: Bi;
  /* Only the states that are a call to action get a colour, which is the same
     rule the tower itself follows. */
  tone?: string;
};

const COLUMNS: Column[] = [
  { key: "pending", label: { en: "Pending", es: "Pendiente" } },
  {
    key: "active",
    label: { en: "In progress", es: "En ejecución" },
    tone: "var(--accent)",
  },
  {
    key: "warning",
    label: { en: "At risk", es: "En riesgo" },
    tone: "var(--pending)",
  },
  {
    key: "problem",
    label: { en: "Rejected", es: "Rechazada" },
    tone: "var(--failed)",
  },
  { key: "complete", label: { en: "Completed", es: "Completado" } },
];

type Sort = Column["key"] | "room";

/* ⚠️  --accent-subtle WAS TOO FAINT TO FIND. It is delphi-50, which is nearly
   white — right behind a button, hopeless for picking one row out of twenty.
   The replacement is a TOKEN, --row-selected, defined in theme.css alongside
   it in all three themes.

   The first attempt mixed the accent in this file instead, which passes as
   CSS and fails the point: colour decisions live in the theme layer so that
   light and dark stay in step and nobody has to grep components to find out
   what a selected row looks like. check-tokens.mjs caught it. */

/* ⚠️  TWO WAYS INTO THE SAME 22 ROWS, because two different people open this
   table. A head of construction asks "how is the bathroom doing" and wants the
   trades under it; a contract manager asks "how is the plumber doing" and
   wants the rooms under it. Neither is a sub-view of the other, and flattening
   to one of them makes the table answer only half the people who open it.

   The rows themselves never change — only how they are stacked and what the
   subtotal line sums. */
type Grouping = "room" | "trade" | "person";

/** What to call a row in the Task view.
 *
 *  ⚠️  NOT THE TRADE ON ITS OWN. The trade field says who does the work, and
 *  for handover that is "the developer's own crew" — which rendered as a task
 *  called "Own workforce", which is not a task. The task is the STAGE, with
 *  the trade added only where a stage is split between two of them, which
 *  rough-in is and nothing else is. So: Rough-in · plumbing, Rough-in ·
 *  electrical, Finishes, Handover condition. It also puts the view in build
 *  order rather than alphabetical-by-accident. */
export function taskLabel(stageKey: string, trade: Trade): Bi {
  const stage = stageByKey.get(stageKey);
  if (!stage) return { en: stageKey, es: stageKey };
  if (stage.sessions < 2) return stage.name;
  return {
    en: `${stage.name.en} · ${TRADE[trade].en.toLowerCase()}`,
    es: `${stage.name.es} · ${TRADE[trade].es.toLowerCase()}`,
  };
}

type Section = {
  key: string;
  label: Bi;
  /* The other dimension, which is what the member rows are labelled by. */
  rows: ProgressRow[];
  totals: Record<Column["key"], number> & { total: number };
};

function sectionsFor(
  rows: ProgressRow[],
  grouping: Grouping,
  roomName: (key: string) => Bi,
): Section[] {
  const out = new Map<string, Section>();

  const blank = () => ({
    pending: 0,
    active: 0,
    warning: 0,
    problem: 0,
    complete: 0,
    total: 0,
  });

  for (const row of rows) {
    /* The group, and the dimension the member rows are collapsed onto. The
       tally is keyed by room, task AND person, so each grouping sums over the
       two it is not using — which is why the three views always agree. */
    const groupKey =
      grouping === "room"
        ? row.room
        : grouping === "trade"
          ? `${row.stage}:${row.trade}`
          : row.capturer;

    const memberKey =
      grouping === "person"
        ? `${row.stage}:${row.trade}`
        : grouping === "room"
          ? `${row.stage}:${row.trade}`
          : row.room;

    let section = out.get(groupKey);
    if (!section) {
      section = {
        key: groupKey,
        label:
          grouping === "room"
            ? roomName(row.room)
            : grouping === "trade"
              ? taskLabel(row.stage, row.trade)
              : personName(row.capturer),
        rows: [],
        totals: blank(),
      };
      out.set(groupKey, section);
    }

    let member = section.rows.find((m) => memberKeyOf(m, grouping) === memberKey);
    if (!member) {
      member = { ...row, ...blank() };
      section.rows.push(member);
    }
    for (const c of COLUMNS) member[c.key] += row[c.key];
    member.total += row.total;

    for (const c of COLUMNS) section.totals[c.key] += row[c.key];
    section.totals.total += row.total;
  }

  return [...out.values()];
}

/** Which dimension a member row stands for, under a given grouping. */
function memberKeyOf(row: ProgressRow, grouping: Grouping) {
  return grouping === "trade" ? row.room : `${row.stage}:${row.trade}`;
}

function personName(id: string): Bi {
  const person = crewById.get(id);
  return person ? { en: person.name, es: person.name } : { en: id, es: id };
}

export function SiteProgress({ className }: { className?: string }) {
  const t = useT();
  const [sort, setSort] = useState<Sort>("room");
  const [grouping, setGrouping] = useState<Grouping>("room");

  const roomName = (key: string) =>
    CAPTURE_ROOMS.find((r) => r.key === key)?.name ?? { en: key, es: key };

  const sections = useMemo(() => {
    const all = siteProgress();
    const grouped = sectionsFor(all, grouping, roomName);
    if (sort === "room") return grouped;
    /* Sorting runs INSIDE each group and over the groups themselves, so the
       worst group comes first and the worst row inside it comes first.
       Descending throughout: every one of these columns is a backlog. */
    return [...grouped]
      .map((s) => ({ ...s, rows: [...s.rows].sort((a, b) => b[sort] - a[sort]) }))
      .sort((a, b) => b.totals[sort] - a.totals[sort]);
  }, [grouping, sort]);

  const totals = useMemo(
    () =>
      sections.reduce(
        (acc, s) => {
          for (const c of COLUMNS) acc[c.key] += s.totals[c.key];
          acc.total += s.totals.total;
          return acc;
        },
        { pending: 0, active: 0, warning: 0, problem: 0, complete: 0, total: 0 },
      ),
    [sections],
  );

  /* A member row is labelled by whichever dimension is NOT the grouping. */
  const memberLabel = (row: ProgressRow) =>
    grouping === "room" ? taskLabel(row.stage, row.trade) : roomName(row.room);

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">
            {t({ en: "Capture progress", es: "Avance de capturas" })}
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-secondary">
            {t({
              en: `Every required capture across ${apartmentsStarted()} apartments under construction. Apartments whose slab is not yet poured are excluded.`,
              es: `Todas las capturas requeridas en ${apartmentsStarted()} apartamentos en construcción. Se excluyen los apartamentos cuya placa aún no se vacía.`,
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
            {t({ en: "Group by", es: "Agrupar por" })}
          </span>
          <div className="flex rounded-md border border-line">
            {(
              [
                ["room", { en: "Room", es: "Ambiente" }],
                ["trade", { en: "Task", es: "Tarea" }],
                ["person", { en: "Person", es: "Persona" }],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setGrouping(key)}
                aria-pressed={grouping === key}
                className={cn(
                  "cursor-pointer px-3 py-1.5 text-[13px] transition-colors",
                  grouping === key
                    ? "bg-surface-sunken font-medium text-ink"
                    : "text-ink-secondary hover:text-ink",
                )}
              >
                {t(label)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <Th onClick={() => setSort("room")} active={sort === "room"} align="left">
                {grouping === "room"
                  ? t({ en: "Room · task", es: "Ambiente · tarea" })
                  : grouping === "trade"
                    ? t({ en: "Task · room", es: "Tarea · ambiente" })
                    : t({ en: "Person · task", es: "Persona · tarea" })}
              </Th>
              <Th align="left">{t({ en: "Stage", es: "Etapa" })}</Th>
              {COLUMNS.map((c) => (
                <Th
                  key={c.key}
                  onClick={() => setSort(c.key)}
                  active={sort === c.key}
                >
                  {t(c.label)}
                </Th>
              ))}
              <Th>{t({ en: "Total", es: "Total" })}</Th>
            </tr>
          </thead>

          {sections.map((section) => (
            <tbody key={section.key}>
              <tr className="border-b border-line bg-surface-sunken">
                <td className="px-4 py-2 font-semibold" colSpan={2}>
                  {t(section.label)}
                </td>
                {COLUMNS.map((c) => (
                  <Cell key={c.key} value={section.totals[c.key]} tone={c.tone} strong />
                ))}
                <td className="px-4 py-2 text-right font-mono font-semibold tabular-nums">
                  {section.totals.total}
                </td>
              </tr>

              {section.rows.map((row) => {
                const stage = stageByKey.get(row.stage);
                return (
                  <tr
                    key={`${row.room}-${row.trade}`}
                    className="border-b border-line last:border-b-0"
                  >
                    <td className="py-2.5 pl-8 pr-4 text-ink-secondary">
                      {t(memberLabel(row))}
                    </td>
                    <td className="px-4 py-2.5 text-ink-secondary">
                      {stage ? t(stage.name) : row.stage}
                    </td>
                    {COLUMNS.map((c) => (
                      <Cell key={c.key} value={row[c.key]} tone={c.tone} />
                    ))}
                    <td className="px-4 py-2.5 text-right font-mono tabular-nums text-ink-muted">
                      {row.total}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ))}

          <tfoot>
            <tr className="border-t border-line-strong bg-surface-sunken">
              <td className="px-4 py-2.5 font-semibold" colSpan={2}>
                {t({ en: "All captures", es: "Todas las capturas" })}
              </td>
              {COLUMNS.map((c) => (
                <Cell key={c.key} value={totals[c.key]} tone={c.tone} strong />
              ))}
              <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums">
                {totals.total}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  align = "right",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  align?: "left" | "right";
}) {
  const label = (
    <span
      className={cn(
        "text-[11px] font-semibold uppercase tracking-[0.08em]",
        active ? "text-ink" : "text-ink-muted",
      )}
    >
      {children}
    </span>
  );

  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-2.5",
        align === "left" ? "text-left" : "text-right",
      )}
      aria-sort={active ? "descending" : undefined}
    >
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="cursor-pointer hover:underline"
        >
          {label}
        </button>
      ) : (
        label
      )}
    </th>
  );
}

/** One figure. A zero is drawn muted rather than bold: on a table this size
 *  the eye should land on the counts that need somebody, and most cells in the
 *  rejected column are correctly empty. */
function Cell({
  value,
  tone,
  strong,
}: {
  value: number;
  tone?: string;
  strong?: boolean;
}) {
  return (
    <td className="px-4 py-2.5 text-right font-mono tabular-nums">
      <span
        className={cn(strong && "font-semibold")}
        style={{
          color: value === 0 ? "var(--ink-muted)" : (tone ?? "var(--ink)"),
          opacity: value === 0 ? 0.5 : 1,
        }}
      >
        {value}
      </span>
    </td>
  );
}

/* ── The same table, scoped and small ─────────────────────────────────────
   For the panel beside a tower, where the full table will not fit and is not
   the question anyway: having drilled into an asset, you want to know where
   THAT asset stands.

   ⚠️  IT REPLACED THE STAGE LADDER, which answered a narrower question badly.
   The ladder reported the six stages for one floor — "Rough-in 0/8 flats" —
   which tells you nothing about the tower you are looking at and everything
   about a floor you may have selected by accident. Same rows as the full
   table, same arithmetic, one tower's worth.

   Zero columns are dropped rather than drawn as a column of noughts: on a
   panel this narrow, four digits of nothing crowd out the two that matter. */
export function TowerProgress({
  tower,
  floor,
  focus,
  onFocus,
}: {
  tower: Tower;
  /** What the drawings are currently focused on, and how to change it. A row
   *  is a control, not a readout — clicking one asks the tower a narrower
   *  question. */
  focus: CaptureFocus | null;
  onFocus: (f: CaptureFocus | null) => void;
  /** The storey selected in the rail, or null for the whole tower. The table
   *  is a summary of what is selected — selecting a floor narrows it rather
   *  than opening something else. */
  floor: number | null;
}) {
  const t = useT();
  const [grouping, setGrouping] = useState<Grouping>("room");

  const scope = floor ?? undefined;
  const rows = useMemo(() => siteProgress([tower], scope), [tower, scope]);
  const started = useMemo(
    () => apartmentsStarted([tower], scope),
    [tower, scope],
  );

  const roomName = (key: string) =>
    CAPTURE_ROOMS.find((r) => r.key === key)?.name ?? { en: key, es: key };

  /* ⚠️  SAME GROUPING AS THE ANALYSIS TABLE, from the same function. The panel
     is that table filtered to one asset, so a reader who groups by room there
     and opens a tower here should find the rows stacked the way they left
     them — and a second implementation would eventually stack them
     differently. */
  const sections = useMemo(
    () => sectionsFor(rows, grouping, roomName),
    [rows, grouping],
  );

  const memberLabel = (row: ProgressRow) =>
    grouping === "trade" ? roomName(row.room) : taskLabel(row.stage, row.trade);

  /* A click toggles: picking the row already selected clears it, so there is
     always a way back to the whole picture without hunting for one. */
  const pick = (next: CaptureFocus) => {
    const same =
      focus &&
      focus.room === next.room &&
      focus.stage === next.stage &&
      focus.trade === next.trade &&
      focus.capturer === next.capturer;
    onFocus(same ? null : next);
  };

  const isOn = (f: CaptureFocus) =>
    !!focus &&
    focus.room === f.room &&
    focus.stage === f.stage &&
    focus.trade === f.trade &&
    focus.capturer === f.capturer;

  if (started === 0) {
    return (
      <p className="text-body-sm text-ink-secondary">
        {floor === null
          ? t({
              en: "No apartments started in this tower yet — it is at foundations.",
              es: "Aún no hay apartamentos iniciados en esta torre — está en cimentación.",
            })
          : t({
              en: `Floor ${floor} is not built yet — its slab is not poured.`,
              es: `El piso ${floor} aún no está construido — su placa no se ha vaciado.`,
            })}
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="truncate font-mono text-mono-sm uppercase text-ink-muted">
          {/* The heading names the scope, because the same table with
              different numbers is otherwise indistinguishable from the same
              table with the same numbers. */}
          {floor === null
            ? t({ en: "All floors", es: "Todos los pisos" })
            : t({ en: `Floor ${floor}`, es: `Piso ${floor}` })}
        </h3>
        <span className="shrink-0 font-mono text-mono-sm text-ink-muted">
          {t({ en: `${started} flats`, es: `${started} aptos` })}
        </span>
      </div>

      <div className="flex rounded-sm border border-line">
        {(
          [
            ["room", { en: "Room", es: "Ambiente" }],
            ["trade", { en: "Task", es: "Tarea" }],
            ["person", { en: "Person", es: "Persona" }],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setGrouping(key)}
            aria-pressed={grouping === key}
            className={cn(
              "flex-1 cursor-pointer px-2 py-1 text-body-sm transition-colors",
              grouping === key
                ? "bg-surface-sunken text-ink"
                : "text-ink-muted hover:text-ink-secondary",
            )}
          >
            {t(label)}
          </button>
        ))}
      </div>

      <div className="min-h-0 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="pb-1 text-left font-mono text-mono-sm uppercase text-ink-muted">
                {grouping === "room"
                  ? t({ en: "Room", es: "Ambiente" })
                  : grouping === "trade"
                    ? t({ en: "Task", es: "Tarea" })
                    : t({ en: "Person", es: "Persona" })}
              </th>
              {COLUMNS.map((c) => (
                <th
                  key={c.key}
                  /* Initials, because five words will not fit across 23rem and
                     the colour under each number says which is which. */
                  title={t(c.label)}
                  className="pb-1 pl-1 text-right font-mono text-mono-sm uppercase text-ink-muted"
                >
                  {t(c.label).slice(0, 1)}
                </th>
              ))}
            </tr>
          </thead>

          {sections.map((section) => (
            <tbody key={section.key}>
              <tr
                className="cursor-pointer border-t border-line-strong"
                style={
                  isOn(sectionFocus(section, grouping))
                    ? { backgroundColor: "var(--row-selected)" }
                    : undefined
                }
                onClick={() => pick(sectionFocus(section, grouping))}
              >
                <td className="py-1 pr-2 text-body-sm font-semibold text-ink">
                  <span className="block truncate">{t(section.label)}</span>
                </td>
                {COLUMNS.map((c) => (
                  <td
                    key={c.key}
                    className="py-1 pl-1 text-right font-mono text-mono-sm font-semibold tabular-nums"
                  >
                    <Figure value={section.totals[c.key]} tone={c.tone} />
                  </td>
                ))}
              </tr>

              {section.rows.map((row) => (
                <tr
                  key={`${row.room}-${row.trade}`}
                  className="cursor-pointer"
                  style={
                    isOn(rowFocus(row, grouping))
                      ? { backgroundColor: "var(--row-selected)" }
                      : undefined
                  }
                  onClick={() => pick(rowFocus(row, grouping))}
                >
                  <td className="py-0.5 pl-2 pr-2 text-body-sm text-ink-secondary">
                    <span className="block truncate">{t(memberLabel(row))}</span>
                  </td>
                  {COLUMNS.map((c) => (
                    <td
                      key={c.key}
                      className="py-0.5 pl-1 text-right font-mono text-mono-sm tabular-nums"
                    >
                      <Figure value={row[c.key]} tone={c.tone} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}

/** What a group header selects: its own dimension, the other left open. */
function sectionFocus(section: Section, grouping: Grouping): CaptureFocus {
  const first = section.rows[0];
  if (grouping === "room")
    return { room: first.room, stage: null, trade: null, capturer: null };
  if (grouping === "trade")
    return { room: null, stage: first.stage, trade: first.trade, capturer: null };
  return { room: null, stage: null, trade: null, capturer: section.key };
}

/** What a member row selects: the exact cell of the checklist. */
function rowFocus(row: ProgressRow, grouping: Grouping): CaptureFocus {
  /* Under "by person" a member row is that person's work on one task, so the
     capturer has to travel with it — otherwise clicking Mario's rough-in
     selects everybody's rough-in. */
  return {
    room: grouping === "trade" ? row.room : null,
    stage: grouping === "trade" ? null : row.stage,
    trade: grouping === "trade" ? null : row.trade,
    capturer: grouping === "person" ? row.capturer : null,
  };
}

/** One number in the compact panel. Zeros recede so the handful that need
 *  somebody are what the eye lands on. */
function Figure({ value, tone }: { value: number; tone?: string }) {
  return (
    <span
      style={{
        color: value === 0 ? "var(--ink-muted)" : (tone ?? "var(--ink)"),
        opacity: value === 0 ? 0.35 : 1,
      }}
    >
      {value}
    </span>
  );
}
