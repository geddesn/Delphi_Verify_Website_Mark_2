import { useMemo, useState } from "react";
import {
  CAPTURE_ROOMS,
  TRADE,
  apartmentsStarted,
  siteProgress,
  stageByKey,
  type ProgressRow,
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

export function SiteProgress({ className }: { className?: string }) {
  const t = useT();
  const [sort, setSort] = useState<Sort>("room");

  const rows = useMemo(() => {
    const all = siteProgress();
    if (sort === "room") return all;
    /* Descending: a reader sorting by "rejected" wants the worst row first,
       and every one of these columns is a backlog rather than a score. */
    return [...all].sort((a, b) => b[sort] - a[sort]);
  }, [sort]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          for (const c of COLUMNS) acc[c.key] += r[c.key];
          acc.total += r.total;
          return acc;
        },
        { pending: 0, active: 0, warning: 0, problem: 0, complete: 0, total: 0 },
      ),
    [rows],
  );

  const roomName = (key: string) =>
    CAPTURE_ROOMS.find((r) => r.key === key)?.name ?? { en: key, es: key };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
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

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full border-collapse text-[13px]">
          <thead>
            <tr className="border-b border-line">
              <Th onClick={() => setSort("room")} active={sort === "room"} align="left">
                {t({ en: "Room", es: "Ambiente" })}
              </Th>
              <Th align="left">{t({ en: "Trade", es: "Oficio" })}</Th>
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

          <tbody>
            {rows.map((row) => {
              const stage = stageByKey.get(row.stage);
              return (
                <tr
                  key={`${row.room}-${row.trade}`}
                  className="border-b border-line last:border-b-0"
                >
                  <td className="px-4 py-2.5 font-medium">
                    {t(roomName(row.room))}
                  </td>
                  <td className="px-4 py-2.5 text-ink-secondary">
                    {t(TRADE[row.trade])}
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

          <tfoot>
            <tr className="border-t border-line-strong bg-surface-sunken">
              <td className="px-4 py-2.5 font-semibold" colSpan={3}>
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
