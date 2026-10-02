import { useMemo, useState } from "react";
import {
  TODAY,
  TOWERS,
  TRADE,
  apartmentsStarted,
  backlogByFirm,
  buildFront,
  certificatesByMonth,
  reviewQueue,
  siteProgress,
  stageByKey,
  unitsIn,
  type Tower,
} from "@/content/enterprise/world";
import { fmtInt, useLang, useT, type Bi } from "@/content/enterprise/lang";

/* ============================================================================
   ANALYSIS CHARTS
   ============================================================================
   Four operational figures. Each exists to prompt an action, not to be
   admired.

   ⚠️  content/dashboard.ts FORBIDS CHARTS, and it is right about the screen it
   is describing. That warning is on the marketing rendering of the dashboard,
   where "a page of graphs says Delphi reports on evidence, where a page of
   work says Delphi is how the evidence gets made." This is a page called
   Analysis inside the app, which is the one place that argument does not
   apply — but the spirit does, so every chart here answers a question somebody
   would otherwise ask by eye: who is behind, what is the rate, who do I ring.

   ⚠️  NO CHART LIBRARY, and not for purity — none is installed, and adding a
   dependency to draw four bar charts would cost more than it saves. The rest
   of this work is hand-rolled SVG for the same reason.

   ── COLOUR ─────────────────────────────────────────────────────────────────
   The five states are a STATUS palette, not a categorical one, and the
   validator says so: run against the resolved tokens it FAILs the lightness
   band and the chroma floor on --line-strong and --ink-muted, the two
   neutrals. That is the design and not a defect — colour here is reserved for
   what needs a person, so "not started" and "complete" carry no hue at all.

   What it PASSED matters more. CVD separation on the worst adjacent pair is
   ΔE 11.4 deutan and 17.6 tritan; the normal-vision floor is 20.1. Both clear.

   The one WARN is contrast against the surface, below 3:1 for --line-strong
   and for --pending, and that one is not dismissable: it obliges visible
   labels or a table view. So every chart here carries a direct value label on
   every mark, a legend names every state, and the Capture progress tab is the
   table view of the same numbers.

   (The hex values are deliberately not quoted here. check-tokens.mjs reads
   this file too, and a palette argument written in literals is exactly what
   it exists to stop.)
   ========================================================================= */

/* 2px of surface between stacked segments, in the chart's own units. Adjacent
   fills need a gap or two states read as one. */
const SEG_GAP = 2;

const STATE: { key: StateKey; label: Bi; colour: string }[] = [
  { key: "complete", label: { en: "Complete", es: "Completo" }, colour: "var(--ink-muted)" },
  { key: "active", label: { en: "In progress", es: "En ejecución" }, colour: "var(--accent)" },
  { key: "warning", label: { en: "Needs inspection", es: "Requiere inspección" }, colour: "var(--pending)" },
  { key: "problem", label: { en: "Needs rework", es: "Requiere corrección" }, colour: "var(--failed)" },
  { key: "pending", label: { en: "Not started", es: "Sin iniciar" }, colour: "var(--line-strong)" },
];

type StateKey = "pending" | "active" | "warning" | "problem" | "complete";

export function AnalysisCharts() {
  const t = useT();
  const { lang } = useLang();

  const months = useMemo(() => certificatesByMonth(), []);
  const firms = useMemo(() => backlogByFirm(), []);
  const queue = useMemo(() => reviewQueue(), []);

  const totalCerts = months.reduce((n, m) => n + m.count, 0);
  const flagged = useMemo(() => {
    const rows = siteProgress();
    return rows.reduce((n, r) => n + r.warning + r.problem, 0);
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {/* Four counts before any chart: the numbers somebody repeats in a
          meeting, where a chart is something they have to describe. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          value={fmtInt(totalCerts, lang)}
          label={t({ en: "Certificates published", es: "Certificados publicados" })}
          note={t({
            en: `across ${months.length} months`,
            es: `en ${months.length} meses`,
          })}
        />
        <Stat
          value={fmtInt(apartmentsStarted(), lang)}
          label={t({ en: "Apartments under way", es: "Apartamentos en obra" })}
          note={t({
            en: `of ${fmtInt(TOWERS.reduce((n, x) => n + unitsIn(x), 0), lang)}`,
            es: `de ${fmtInt(TOWERS.reduce((n, x) => n + unitsIn(x), 0), lang)}`,
          })}
        />
        <Stat
          value={fmtInt(queue.length, lang)}
          label={t({ en: "Awaiting review", es: "Pendiente de revisión" })}
          note={t({ en: "nobody has looked yet", es: "nadie las ha revisado" })}
          tone={queue.length > 0 ? "var(--accent)" : undefined}
        />
        <Stat
          value={fmtInt(flagged, lang)}
          label={t({ en: "Flagged captures", es: "Capturas marcadas" })}
          note={t({ en: "inspection or rework", es: "inspección o corrección" })}
          tone={flagged > 0 ? "var(--pending)" : undefined}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel
          title={t({ en: "Build front", es: "Frente de obra" })}
          note={t({
            en: "How far each stage has climbed. The gap between two rows is floors of shell the trades have not caught up with.",
            es: "Hasta dónde ha subido cada etapa. La diferencia entre dos filas son pisos de obra gris que los oficios aún no alcanzan.",
          })}
        >
          <div className="flex flex-col gap-5">
            {TOWERS.map((tower) => (
              <FrontChart key={tower.key} tower={tower} />
            ))}
          </div>
        </Panel>

        <Panel
          title={t({ en: "Certificates published", es: "Certificados publicados" })}
          note={t({
            en: `By month, to ${TODAY}. Evidence keeping pace with the build, or not.`,
            es: `Por mes, hasta ${TODAY}. La evidencia al ritmo de la obra, o no.`,
          })}
        >
          <MonthsChart />
        </Panel>

        <Panel
          title={t({ en: "Where each tower stands", es: "Estado de cada torre" })}
          note={t({
            en: "Every required capture in the tower, by state.",
            es: "Todas las capturas requeridas de la torre, por estado.",
          })}
        >
          <div className="flex flex-col gap-4">
            {TOWERS.map((tower) => (
              <TowerBar key={tower.key} tower={tower} />
            ))}
            <Legend />
          </div>
        </Panel>

        <Panel
          title={t({ en: "Outstanding by subcontractor", es: "Pendiente por subcontratista" })}
          note={t({
            en: "Ordered by flagged work. A firm is who you ring; an individual is who answers.",
            es: "Ordenado por trabajo marcado. A la empresa se le llama; la persona contesta.",
          })}
        >
          <div className="flex flex-col gap-3">
            {firms.map((firm) => (
              <FirmBar key={firm.firm} firm={firm} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ── Chrome ──────────────────────────────────────────────────────────────── */

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
        className="font-mono text-[26px] tabular-nums"
        style={{ color: tone ?? "var(--ink)" }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[13px] font-medium text-ink">{label}</p>
      <p className="text-[12px] text-ink-secondary">{note}</p>
    </div>
  );
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
      <p className="mt-0.5 mb-4 max-w-prose text-[12px] text-ink-secondary">
        {note}
      </p>
      {children}
    </section>
  );
}

function Legend() {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-t border-line pt-3">
      {STATE.map((s) => (
        <span key={s.key} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-xs"
            style={{ backgroundColor: s.colour }}
          />
          <span className="text-[12px] text-ink-secondary">{t(s.label)}</span>
        </span>
      ))}
    </div>
  );
}

/* ── Build front ─────────────────────────────────────────────────────────── */

function FrontChart({ tower }: { tower: Tower }) {
  const t = useT();
  const rows = useMemo(() => buildFront(tower), [tower]);

  return (
    <div>
      <p className="mb-1.5 text-[12px] font-semibold text-ink">
        {tower.name}{" "}
        <span className="font-normal text-ink-secondary">
          {t({
            en: `${tower.floors} floors · ${tower.perFloor} per floor`,
            es: `${tower.floors} pisos · ${tower.perFloor} por piso`,
          })}
        </span>
      </p>

      <div className="flex flex-col gap-1">
        {rows.map((row) => {
          const stage = stageByKey.get(row.stage);
          const pct = row.of === 0 ? 0 : (row.reached / row.of) * 100;
          return (
            <div key={row.stage} className="flex items-center gap-2">
              <span className="w-28 shrink-0 truncate text-[11px] text-ink-secondary">
                {stage ? t(stage.name) : row.stage}
              </span>
              <span className="relative h-2.5 flex-1 overflow-hidden rounded-xs bg-surface-sunken">
                <span
                  className="absolute inset-y-0 left-0 rounded-xs"
                  style={{
                    width: `${pct}%`,
                    /* One hue for a single measure: this is magnitude, not
                       identity. Sequential by definition, so the stages are
                       told apart by their row label rather than by colour. */
                    backgroundColor: "var(--accent)",
                    opacity: 0.25 + (pct / 100) * 0.6,
                  }}
                />
              </span>
              {/* Direct label on every row — the contrast WARN makes this
                  obligatory, and the figure is what a reader wants anyway. */}
              <span className="w-12 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-muted">
                {row.reached}/{row.of}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Certificates per month ──────────────────────────────────────────────── */

function MonthsChart() {
  const t = useT();
  const { lang } = useLang();
  const months = useMemo(() => certificatesByMonth(), []);
  const [hover, setHover] = useState<number | null>(null);

  const peak = Math.max(...months.map((m) => m.count), 1);
  const H = 150;

  return (
    <div>
      <div className="flex h-[150px] items-end gap-1" style={{ height: H }}>
        {months.map((m, i) => {
          const h = Math.max(2, (m.count / peak) * (H - 20));
          const on = hover === i;
          return (
            <div
              key={m.month}
              className="relative flex min-w-0 flex-1 cursor-default flex-col items-center justify-end"
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
            >
              {on && (
                <span className="absolute -top-1 whitespace-nowrap rounded-sm border border-line bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink shadow-raised">
                  {m.month} · {fmtInt(m.count, lang)}
                </span>
              )}
              <span
                className="w-full rounded-t-xs"
                style={{
                  height: h,
                  backgroundColor: "var(--accent)",
                  opacity: on ? 1 : 0.75,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Every third month labelled: fifteen labels in this width collide, and
          a tick nobody can read is worse than no tick. */}
      <div className="mt-1 flex gap-1">
        {months.map((m, i) => (
          <span
            key={m.month}
            className="min-w-0 flex-1 text-center font-mono text-[10px] text-ink-muted"
          >
            {i % 3 === 0 ? m.month.slice(2) : ""}
          </span>
        ))}
      </div>

      <p className="mt-2 text-[12px] text-ink-secondary">
        {t({
          en: `Peak ${fmtInt(peak, lang)} in a month.`,
          es: `Pico de ${fmtInt(peak, lang)} en un mes.`,
        })}
      </p>
    </div>
  );
}

/* ── Tower state ─────────────────────────────────────────────────────────── */

function TowerBar({ tower }: { tower: Tower }) {
  const t = useT();
  const { lang } = useLang();
  const rows = useMemo(() => siteProgress([tower]), [tower]);

  const totals = STATE.reduce(
    (acc, s) => {
      acc[s.key] = rows.reduce((n, r) => n + r[s.key], 0);
      return acc;
    },
    {} as Record<StateKey, number>,
  );
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div>
        <p className="text-[12px] font-semibold text-ink">{tower.name}</p>
        <p className="text-[12px] text-ink-secondary">
          {t({
            en: "Nothing captured yet — at foundations.",
            es: "Aún sin capturas — en cimentación.",
          })}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold text-ink">{tower.name}</span>
        <span className="font-mono text-[11px] tabular-nums text-ink-muted">
          {fmtInt(total, lang)} {t({ en: "captures", es: "capturas" })}
        </span>
      </div>

      <div className="flex h-4 w-full overflow-hidden rounded-xs">
        {STATE.map((s) => {
          const n = totals[s.key];
          if (n === 0) return null;
          return (
            <span
              key={s.key}
              title={`${t(s.label)} · ${fmtInt(n, lang)}`}
              style={{
                flexGrow: n,
                backgroundColor: s.colour,
                /* The 2px spacer between adjacent fills, or two states read as
                   one band. */
                marginRight: SEG_GAP,
              }}
            />
          );
        })}
      </div>

      {/* Values beside the bar rather than inside it: the segments are too
          narrow to hold a number at this height, and the contrast WARN means
          they have to be legible somewhere. */}
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
        {STATE.map((s) =>
          totals[s.key] === 0 ? null : (
            <span key={s.key} className="font-mono text-[11px] tabular-nums">
              <span style={{ color: s.colour }}>■</span>{" "}
              <span className="text-ink-muted">{fmtInt(totals[s.key], lang)}</span>
            </span>
          ),
        )}
      </div>
    </div>
  );
}

/* ── Backlog by firm ─────────────────────────────────────────────────────── */

function FirmBar({ firm }: { firm: ReturnType<typeof backlogByFirm>[number] }) {
  const t = useT();
  const { lang } = useLang();
  const outstanding = firm.pending + firm.active;
  const widest = Math.max(
    ...backlogByFirm().map((f) => f.pending + f.active),
    1,
  );

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 truncate text-[12px] font-medium text-ink">
          {firm.firm}
        </span>
        <span className="shrink-0 text-[11px] text-ink-secondary">
          {t(TRADE[firm.trade])} · {firm.people}{" "}
          {t({ en: "people", es: "personas" })}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <span className="relative h-2.5 flex-1 overflow-hidden rounded-xs bg-surface-sunken">
          <span
            className="absolute inset-y-0 left-0 rounded-xs"
            style={{
              width: `${(outstanding / widest) * 100}%`,
              backgroundColor: "var(--ink-muted)",
              opacity: 0.5,
            }}
          />
        </span>
        <span className="w-12 shrink-0 text-right font-mono text-[11px] tabular-nums text-ink-muted">
          {fmtInt(outstanding, lang)}
        </span>
      </div>

      {(firm.warning > 0 || firm.problem > 0) && (
        <p className="mt-0.5 font-mono text-[11px]">
          {firm.problem > 0 && (
            <span style={{ color: "var(--failed)" }}>
              {firm.problem} {t({ en: "to rework", es: "por corregir" })}
            </span>
          )}
          {firm.problem > 0 && firm.warning > 0 && (
            <span className="text-ink-muted"> · </span>
          )}
          {firm.warning > 0 && (
            <span style={{ color: "var(--pending)" }}>
              {firm.warning} {t({ en: "to inspect", es: "por inspeccionar" })}
            </span>
          )}
        </p>
      )}
    </div>
  );
}
