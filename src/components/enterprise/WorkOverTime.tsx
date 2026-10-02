import { useMemo, useState } from "react";
import {
  CAPTURE_ROOMS,
  TRADE,
  activityMonths,
  jobActivity,
  jobsForPerson,
  peopleForJob,
  personActivity,
  stageByKey,
  type ActivityMonth,
  type CellActivity,
  type Crossing,
  type JobActivity,
  type PersonActivity,
} from "@/content/enterprise/world";
import { fmtInt, useLang, useT, type Bi } from "@/content/enterprise/lang";
import { cn } from "@/lib/cn";

/* ============================================================================
   WORK OVER TIME
   ============================================================================
   Fifteen months wide, one row per person — or per job type, which is the
   same data cut the other way.

   ⚠️  THIS IS NOT A PERFORMANCE SCORE, and the copy on screen says so. Delphi
   does not certify construction quality; it can say a photograph was taken at
   this place, at this time, on this device, and has not changed since. So the
   flag columns do not count mistakes. They count how many of somebody's
   captures the SITE TEAM later raised for inspection or rework, which is a
   tally of other people's decisions. This is the one screen on the page that
   would be misread as a league table, so it keeps saying whose judgement it is.

   ⚠️  AND THAT IS WHY THERE ARE TWO VIEWS, NOT ONE. A rate per person mixes up
   who did the work with how hard the work was. Bathroom tiling is raised
   against four times as often as a handover photograph; whoever is on wet
   areas and tiling all year carries a worse-looking number for doing a harder
   job. By person tells you who to ring. By job type tells you whether the
   number was ever about them. Shipping only the first would be a quiet
   slander, so both are here and each one points at the other.

   ── Why it is shaped like this ─────────────────────────────────────────────

   SMALL MULTIPLES, NOT EIGHT LINES ON ONE AXIS. Eight overlapping series need
   eight hues and still cross each other; a row each needs none, and the eye
   compares rows down the page without a legend.

   ONE SHARED SCALE FOR THE BARS. Every row is drawn against the same global
   peak, so a tall bar means a lot of work wherever it appears. Per-row scaling
   would make the quietest row look as busy as the busiest — the single easiest
   way for a chart like this to lie.

   FLAGS ARE PRINTED AS NUMBERS, NOT DRAWN AS BARS. On the best firm the rate
   is under 1%, so a proportional segment on a 96-capture bar is a pixel — there
   and not readable, which is the worst of both. A digit in the status colour is
   exact, and makes no claim about proportion that the geometry cannot keep.
   ========================================================================= */

/* Hard-coded rather than Intl, because this renders during the prerender and
   again in the browser, and the two must agree character for character. */
const MONTH: Bi[] = [
  { en: "Jan", es: "ene" },
  { en: "Feb", es: "feb" },
  { en: "Mar", es: "mar" },
  { en: "Apr", es: "abr" },
  { en: "May", es: "may" },
  { en: "Jun", es: "jun" },
  { en: "Jul", es: "jul" },
  { en: "Aug", es: "ago" },
  { en: "Sep", es: "sep" },
  { en: "Oct", es: "oct" },
  { en: "Nov", es: "nov" },
  { en: "Dec", es: "dic" },
];

const VIEW = [
  { key: "person", label: { en: "By person", es: "Por persona" } },
  { key: "job", label: { en: "By job type", es: "Por tipo de trabajo" } },
] as const;

type ViewKey = (typeof VIEW)[number]["key"];

const ORDER = [
  { key: "volume", label: { en: "Most captures", es: "Más capturas" } },
  { key: "rate", label: { en: "Most flagged", es: "Más marcadas" } },
] as const;

type OrderKey = (typeof ORDER)[number]["key"];

const BAR_H = 40;
const GRID = "216px minmax(220px, 1fr) 64px 56px 56px 64px";

/** What a row needs to draw, whichever side the data came from. */
type Row = {
  id: string;
  title: string;
  subtitle: string;
  initials?: string;
  months: ActivityMonth[];
  captures: number;
  inspection: number;
  rework: number;
  flagged: number;
  open: number;
  activeMonths: number;
};

export function WorkOverTime() {
  const t = useT();
  const { lang } = useLang();
  const people = useMemo(() => personActivity(), []);
  const jobs = useMemo(() => jobActivity(), []);
  const months = useMemo(() => activityMonths(), []);
  const [view, setView] = useState<ViewKey>("person");
  const [order, setOrder] = useState<OrderKey>("volume");
  const [open, setOpen] = useState<string | null>(null);

  const label = (m: string) => {
    const [y, mm] = m.split("-");
    return `${t(MONTH[Number(mm) - 1])} ${y.slice(2)}`;
  };

  const jobTitle = (job: { stage: string; trade: string }) => {
    const stage = stageByKey.get(job.stage);
    return stage ? t(stage.name) : job.stage;
  };

  const rows: Row[] = useMemo(() => {
    const out: Row[] =
      view === "person"
        ? people.map((p: PersonActivity) => ({
            ...p,
            id: p.id,
            title: p.name,
            subtitle: `${t(TRADE[p.trade])} · ${p.firm}`,
            initials: p.initials,
          }))
        : jobs.map((j: JobActivity) => ({
            ...j,
            id: j.key,
            title: jobTitle(j),
            /* The trade earns its place only when it tells you something the
               stage name has not: rough-in splits into two jobs, finishes and
               handover do not, and "Finishes · Finishes" is a stutter. */
            subtitle: [
              t(TRADE[j.trade]) === jobTitle(j) ? null : t(TRADE[j.trade]),
              `${j.cells.length} ${t({ en: "checklist cells", es: "celdas de lista" })}`,
            ]
              .filter(Boolean)
              .join(" · "),
          }));

    /* ⚠️  SORTED ON THE RATE, NOT THE COUNT, when the question is "who is
       flagged most". The busiest person collects the most flags simply by
       making the most captures, and a list ordered that way answers a question
       nobody asked. */
    return order === "rate"
      ? [...out].sort(
          (a, b) =>
            b.flagged / Math.max(1, b.captures) -
              a.flagged / Math.max(1, a.captures) || b.flagged - a.flagged,
        )
      : [...out].sort((a, b) => b.captures - a.captures);
  }, [view, order, people, jobs, t]);

  /* ⚠️  THE SHARED CEILING, computed across every row of BOTH views so the bar
     heights mean the same thing when you switch between them. */
  const peak = Math.max(
    1,
    ...people.flatMap((p) => p.months.map((m) => m.captures)),
    ...jobs.flatMap((j) => j.months.map((m) => m.captures)),
  );

  const total = people.reduce((n, p) => n + p.captures, 0);
  const inspection = people.reduce((n, p) => n + p.inspection, 0);
  const rework = people.reduce((n, p) => n + p.rework, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">
            {t({ en: "Work over time", es: "Trabajo en el tiempo" })}
          </h2>
          <p className="mt-0.5 max-w-prose text-[12px] text-ink-secondary">
            {t({
              en: `${fmtInt(total, lang)} captures across ${months.length} months. The bars share one scale, so heights compare across rows and across both views.`,
              es: `${fmtInt(total, lang)} capturas en ${months.length} meses. Las barras comparten una escala, así que las alturas se comparan entre filas y entre ambas vistas.`,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Switch
            options={VIEW}
            value={view}
            onChange={(v) => {
              setView(v);
              setOpen(null);
            }}
          />
          <Switch options={ORDER} value={order} onChange={setOrder} />
        </div>
      </div>

      {/* ⚠️  THE SENTENCE THAT STOPS THIS BEING A LEAGUE TABLE. It is on the
          page, not only in the source, because the misreading happens on
          screen. */}
      <p className="max-w-prose rounded-lg border border-line bg-surface-sunken px-4 py-3 text-[12px] text-ink-secondary">
        {view === "person"
          ? t({
              en: "Delphi records that a photograph was taken at a place, at a time, on a device, and has not changed since. It does not judge the work. These columns count how many of a person's captures the site team later raised for inspection or rework — other people's decisions, not a verdict on the tradesman. Some jobs are raised against far more often than others, so check by job type before reading anything into a name.",
              es: "Delphi registra que una fotografía se tomó en un lugar, a una hora, en un dispositivo, y que no ha cambiado desde entonces. No juzga el trabajo. Estas columnas cuentan cuántas capturas de cada persona fueron señaladas después por el equipo de obra para inspección o corrección — decisiones de otras personas, no un veredicto sobre el trabajador. Algunos trabajos se señalan mucho más que otros, así que revisa por tipo de trabajo antes de sacar conclusiones sobre un nombre.",
            })
          : t({
              en: "The same captures, grouped by what the job was rather than who did it. Bathroom tiling and waterproofing are raised against several times more often than a handover photograph — which is why a person's rate says as much about what they were given as about how they work.",
              es: "Las mismas capturas, agrupadas por el trabajo y no por quién lo hizo. El enchape y la impermeabilización de baños se señalan varias veces más que una fotografía de entrega — por eso la tasa de una persona dice tanto sobre lo que le asignaron como sobre cómo trabaja.",
            })}
      </p>

      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <div className="min-w-[840px]">
          {/* One month axis for the whole table, since every row shares it. */}
          <div
            className="grid items-end gap-x-4 border-b border-line px-5 py-2"
            style={{ gridTemplateColumns: GRID }}
          >
            <span className="font-mono text-[10px] uppercase text-ink-muted">
              {view === "person"
                ? t({ en: "Person", es: "Persona" })
                : t({ en: "Job type", es: "Tipo de trabajo" })}
            </span>
            <div className="flex gap-[2px]">
              {months.map((m, i) => (
                <span
                  key={m}
                  className="min-w-0 flex-1 text-center font-mono text-[9px] text-ink-muted"
                >
                  {/* Every third, or fifteen labels collide in this width. */}
                  {i % 3 === 0 ? label(m) : ""}
                </span>
              ))}
            </div>
            <Head>{t({ en: "Caps", es: "Capt" })}</Head>
            <Head tone="var(--pending)">{t({ en: "Insp", es: "Insp" })}</Head>
            <Head tone="var(--failed)">{t({ en: "Rwk", es: "Corr" })}</Head>
            <Head>{t({ en: "Flagged", es: "Marcadas" })}</Head>
          </div>

          {rows.map((row) => (
            <RowView
              key={row.id}
              row={row}
              view={view}
              peak={peak}
              label={label}
              jobTitle={jobTitle}
              open={open === row.id}
              onToggle={() => setOpen(open === row.id ? null : row.id)}
            />
          ))}

          <div
            className="grid items-center gap-x-4 border-t border-line bg-surface-sunken px-5 py-2.5"
            style={{ gridTemplateColumns: GRID }}
          >
            <span className="text-[12px] font-medium text-ink">
              {t({ en: "Whole development", es: "Todo el proyecto" })}
            </span>
            <span className="text-[12px] text-ink-secondary">
              {t({
                en: "raised by the site team, across every trade",
                es: "señaladas por el equipo de obra, en todos los oficios",
              })}
            </span>
            <Num>{fmtInt(total, lang)}</Num>
            <Num tone="var(--pending)">{fmtInt(inspection, lang)}</Num>
            <Num tone="var(--failed)">{fmtInt(rework, lang)}</Num>
            <Num>{rate(inspection + rework, total)}</Num>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
        <Key
          colour="var(--accent)"
          label={t({ en: "Captures in the month", es: "Capturas del mes" })}
        />
        <Key
          colour="var(--pending)"
          label={t({ en: "Inspection raised", es: "Inspección solicitada" })}
          digit
        />
        <Key
          colour="var(--failed)"
          label={t({ en: "Rework raised", es: "Corrección solicitada" })}
          digit
        />
        <span className="text-[12px] text-ink-muted">
          {t({
            en: `Tallest bar is ${fmtInt(peak, lang)} captures. Flags are printed as counts, not drawn to scale; a month holding both kinds is printed in the rework colour, and the two are separated on hover and in the figures. Click any row to open it.`,
            es: `La barra más alta son ${fmtInt(peak, lang)} capturas. Las marcas se imprimen como cifras, no a escala; un mes con ambos tipos se imprime en el color de corrección, y los dos se separan al pasar el cursor y en la tabla. Haz clic en cualquier fila para abrirla.`,
          })}
        </span>
      </div>
    </div>
  );
}

/** Flagged share, to one decimal. A rate below a tenth of a percent prints as
 *  "0.0%", which is honest — it is not zero and does not claim to be. */
function rate(flagged: number, captures: number) {
  if (captures === 0) return "—";
  return `${((flagged / captures) * 100).toFixed(1)}%`;
}

function RowView({
  row,
  view,
  peak,
  label,
  jobTitle,
  open,
  onToggle,
}: {
  row: Row;
  view: ViewKey;
  peak: number;
  label: (m: string) => string;
  jobTitle: (job: { stage: string; trade: string }) => string;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="border-b border-line last:border-b-0">
      <div
        className="grid cursor-pointer items-center gap-x-4 px-5 py-3 transition-colors hover:bg-surface-sunken"
        style={{ gridTemplateColumns: GRID }}
        onClick={onToggle}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {row.initials && (
            <span
              aria-hidden
              className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-mono text-[10px] text-ink-secondary"
            >
              {row.initials}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-medium text-ink">
              {row.title}
            </span>
            <span className="block truncate text-[11px] text-ink-secondary">
              {row.subtitle}
            </span>
          </span>
        </div>

        <div className="relative">
          <div className="flex items-end gap-[2px]" style={{ height: BAR_H }}>
            {row.months.map((m, i) => {
              /* A month with nothing in it gets a baseline sliver, not a
                 zero-height nothing — otherwise a gap in the middle of a run
                 is indistinguishable from the end of it. */
              const h =
                m.captures === 0 ? 1 : Math.max(2, (m.captures / peak) * BAR_H);
              return (
                <span
                  key={m.month}
                  className="relative flex min-w-0 flex-1 items-end"
                  style={{ height: BAR_H }}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover(null)}
                >
                  <span
                    className="w-full rounded-t-xs"
                    style={{
                      height: h,
                      backgroundColor:
                        m.captures === 0 ? "var(--line)" : "var(--accent)",
                      opacity: hover === i ? 1 : 0.78,
                    }}
                  />
                </span>
              );
            })}
          </div>

          {/* The flag ribbon: a digit under the month it landed in. */}
          <div className="mt-[3px] flex gap-[2px]">
            {row.months.map((m) => (
              <span
                key={m.month}
                className="min-w-0 flex-1 text-center font-mono text-[9px] leading-[11px] tabular-nums"
                style={{
                  /* Worst kind wins the colour; the split is on hover and in
                     the open panel, so nothing is lost, only compressed. */
                  color: m.rework > 0 ? "var(--failed)" : "var(--pending)",
                }}
              >
                {m.flagged > 0 ? m.flagged : ""}
              </span>
            ))}
          </div>

          {hover !== null && (
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-sm border border-line bg-canvas px-2 py-0.5 font-mono text-[11px] text-ink shadow-raised">
              {label(row.months[hover].month)} ·{" "}
              {fmtInt(row.months[hover].captures, lang)}{" "}
              {t({ en: "captures", es: "capturas" })}
              {row.months[hover].inspection > 0 &&
                ` · ${row.months[hover].inspection} ${t({ en: "insp", es: "insp" })}`}
              {row.months[hover].rework > 0 &&
                ` · ${row.months[hover].rework} ${t({ en: "rework", es: "corr" })}`}
            </span>
          )}
        </div>

        <Num>{fmtInt(row.captures, lang)}</Num>
        <Num tone={row.inspection > 0 ? "var(--pending)" : undefined} dash={row.inspection === 0}>
          {fmtInt(row.inspection, lang)}
        </Num>
        <Num tone={row.rework > 0 ? "var(--failed)" : undefined} dash={row.rework === 0}>
          {fmtInt(row.rework, lang)}
        </Num>
        <Num>{rate(row.flagged, row.captures)}</Num>
      </div>

      {open && (
        <Detail row={row} view={view} label={label} jobTitle={jobTitle} />
      )}
    </div>
  );
}

/** ⚠️  THE TABLE VIEW, WHICH IS NOT OPTIONAL. The strip encodes volume as
 *  height and flags as a digit; anybody who cannot use either needs the
 *  figures, and so does anybody who wants to check them.
 *
 *  It is also where the two views point at each other: a person opens to show
 *  what they were asked to do, and a job type opens to show who did it. */
function Detail({
  row,
  view,
  label,
  jobTitle,
}: {
  row: Row;
  view: ViewKey;
  label: (m: string) => string;
  jobTitle: (job: { stage: string; trade: string }) => string;
}) {
  const t = useT();
  const { lang } = useLang();

  const crossings: Crossing[] = useMemo(
    () => (view === "person" ? jobsForPerson(row.id) : peopleForJob(row.id)),
    [view, row.id],
  );
  const cells: CellActivity[] = useMemo(
    () =>
      view === "job"
        ? (jobActivity().find((j) => j.key === row.id)?.cells ?? [])
        : [],
    [view, row.id],
  );

  return (
    <div className="border-t border-line bg-surface-sunken px-5 py-4">
      <p className="mb-3 text-[12px] text-ink-secondary">
        {t({
          en: `${row.title} · ${fmtInt(row.captures, lang)} captures over ${row.activeMonths} months · ${fmtInt(row.open, lang)} flags still open`,
          es: `${row.title} · ${fmtInt(row.captures, lang)} capturas en ${row.activeMonths} meses · ${fmtInt(row.open, lang)} marcas aún abiertas`,
        })}
      </p>

      <div className="flex flex-wrap gap-x-10 gap-y-6">
        <Table
          title={
            view === "person"
              ? t({ en: "What they were asked to do", es: "Qué le asignaron" })
              : t({ en: "Who did it", es: "Quién lo hizo" })
          }
          note={
            view === "person"
              ? t({
                  en: "A rate is not comparable between people on different work.",
                  es: "Una tasa no es comparable entre personas en trabajos distintos.",
                })
              : t({
                  en: "Same job, different people — this is the comparison that is fair.",
                  es: "Mismo trabajo, distintas personas — esta es la comparación justa.",
                })
          }
          head={[
            view === "person"
              ? t({ en: "Job type", es: "Tipo de trabajo" })
              : t({ en: "Person", es: "Persona" }),
            t({ en: "Captures", es: "Capturas" }),
            t({ en: "Insp", es: "Insp" }),
            t({ en: "Rework", es: "Corr" }),
            t({ en: "Flagged", es: "Marcadas" }),
          ]}
          rows={crossings.map((c) => ({
            key: `${c.personId}:${c.jobKey}`,
            label:
              view === "person"
                ? `${jobTitle(c)} · ${t(TRADE[c.trade])}`
                : c.name,
            captures: c.captures,
            inspection: c.inspection,
            rework: c.rework,
          }))}
        />

        {view === "job" && cells.length > 0 && (
          <Table
            title={t({ en: "Which cell", es: "Qué celda" })}
            note={t({
              en: "Some jobs are harder than others, and the checklist is where that shows.",
              es: "Algunos trabajos son más difíciles que otros, y la lista es donde se nota.",
            })}
            head={[
              t({ en: "Room", es: "Espacio" }),
              t({ en: "Captures", es: "Capturas" }),
              t({ en: "Insp", es: "Insp" }),
              t({ en: "Rework", es: "Corr" }),
              t({ en: "Flagged", es: "Marcadas" }),
            ]}
            rows={cells.map((c) => {
              const room = CAPTURE_ROOMS.find((r) => r.key === c.room);
              return {
                key: c.room,
                label: `${room ? t(room.name) : c.room} — ${t(c.what)}`,
                captures: c.captures,
                inspection: c.inspection,
                rework: c.rework,
              };
            })}
          />
        )}

        <Table
          title={t({ en: "Month by month", es: "Mes a mes" })}
          note={t({
            en: "Months with no work are left out.",
            es: "Los meses sin trabajo se omiten.",
          })}
          head={[
            t({ en: "Month", es: "Mes" }),
            t({ en: "Captures", es: "Capturas" }),
            t({ en: "Insp", es: "Insp" }),
            t({ en: "Rework", es: "Corr" }),
            t({ en: "Flagged", es: "Marcadas" }),
          ]}
          rows={row.months
            .filter((m) => m.captures > 0)
            .map((m) => ({
              key: m.month,
              label: label(m.month),
              captures: m.captures,
              inspection: m.inspection,
              rework: m.rework,
            }))}
        />
      </div>
    </div>
  );
}

function Table({
  title,
  note,
  head,
  rows,
}: {
  title: string;
  note: string;
  head: string[];
  rows: {
    key: string;
    label: string;
    captures: number;
    inspection: number;
    rework: number;
  }[];
}) {
  const { lang } = useLang();
  return (
    <div className="min-w-[360px] flex-1">
      <h4 className="text-[12px] font-semibold text-ink">{title}</h4>
      <p className="mb-1.5 text-[11px] text-ink-muted">{note}</p>
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-line text-left font-mono text-[10px] uppercase text-ink-muted">
            {head.map((h, i) => (
              <th
                key={h + i}
                className={cn(
                  "py-1 font-normal",
                  /* ⚠️  PADDING ON THE NUMERIC HEADS. Without it the five
                     short uppercase words ran into one another and read as a
                     single string. */
                  i > 0 ? "pl-2.5 text-right" : "pr-3",
                )}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {rows.map((r) => (
            <tr key={r.key} className="border-b border-line/60">
              <td className="py-1 pr-3 text-ink-secondary">{r.label}</td>
              <td className="py-1 pl-2.5 text-right font-mono text-ink">
                {fmtInt(r.captures, lang)}
              </td>
              <td
                className="py-1 pl-2.5 text-right font-mono"
                style={{
                  color:
                    r.inspection > 0 ? "var(--pending)" : "var(--ink-muted)",
                }}
              >
                {r.inspection > 0 ? r.inspection : "—"}
              </td>
              <td
                className="py-1 pl-2.5 text-right font-mono"
                style={{
                  color: r.rework > 0 ? "var(--failed)" : "var(--ink-muted)",
                }}
              >
                {r.rework > 0 ? r.rework : "—"}
              </td>
              <td className="py-1 pl-2.5 text-right font-mono text-ink">
                {rate(r.inspection + r.rework, r.captures)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Switch<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { key: T; label: Bi }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const t = useT();
  return (
    <div className="flex items-center gap-1" role="group">
      {options.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          aria-pressed={value === o.key}
          className={cn(
            "cursor-pointer rounded-md border px-3 py-1.5 text-[13px] transition-colors",
            value === o.key
              ? "border-line-strong bg-surface-sunken text-ink"
              : "border-line text-ink-secondary hover:border-line-strong hover:text-ink",
          )}
        >
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}

function Head({ children, tone }: { children: string; tone?: string }) {
  return (
    <span
      className="text-right font-mono text-[10px] uppercase"
      style={{ color: tone ?? "var(--ink-muted)" }}
    >
      {children}
    </span>
  );
}

function Num({
  children,
  tone,
  dash,
}: {
  children: string;
  tone?: string;
  dash?: boolean;
}) {
  return (
    <span
      className="text-right font-mono text-[13px] tabular-nums"
      style={{ color: tone ?? (dash ? "var(--ink-muted)" : "var(--ink)") }}
    >
      {dash ? "—" : children}
    </span>
  );
}

function Key({
  colour,
  label,
  digit,
}: {
  colour: string;
  label: string;
  digit?: boolean;
}) {
  return (
    <span className="flex items-center gap-1.5">
      {digit ? (
        <span
          aria-hidden
          className="font-mono text-[11px] font-semibold"
          style={{ color: colour }}
        >
          2
        </span>
      ) : (
        <span
          aria-hidden
          className="size-2.5 shrink-0 rounded-xs"
          style={{ backgroundColor: colour }}
        />
      )}
      <span className="text-[12px] text-ink-secondary">{label}</span>
    </span>
  );
}
