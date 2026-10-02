import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CAPTURE_ROOMS,
  DEVELOPMENT,
  TODAY,
  TOWERS,
  TRADE,
  imageFor,
  openWork,
  recentCertificates,
  reviewQueue,
  shotSrc,
  stageByKey,
  towerProgress,
  unitsIn,
  workSummary,
  type Published,
  type RequiredCapture,
} from "@/content/enterprise/world";
import { fmtDate, fmtInt, useLang, useT } from "@/content/enterprise/lang";
import { CaptureZoom } from "./CaptureZoom";

/* ============================================================================
   HOME
   ============================================================================
   What a head of construction opens first thing: how the development is going,
   what needs them today, and what has just come in.

   ⚠️  THE LONDON DASHBOARD IS GONE. This page greeted "Sarah" with "Evidence
   operations · London Residential · 24 active jobs · 318 assets", three
   photographs of Cadogan Square, a yacht and a villa in the Maldives, and an
   activity feed in which James Williams completed a capture at 42 Eaton Place.
   None of it had anything to do with the development every other screen in
   this app is about, and all of it was typed rather than derived — the same
   fault as the assets map, the crew list and the jobs table before it. A
   recent-activity feed is the easiest thing on a dashboard to invent and the
   fastest to give the game away, because the viewer can click it.

   Everything here is read off the fixture. The figures agree with the Jobs
   page, the Analysis tabs and the tower explorer because they are the same
   figures, not a second set written to look like them.

   ⚠️  AND THE PRODUCT DOES NOT DO MOST OF IT. There is no job, no assignee, no
   review and no development hierarchy in Delphi today — see the warnings on
   JobsBoard and ReviewQueue. This is the shape of the thing a developer with
   70% of the work subcontracted needs, drawn so it can be argued with.
   ========================================================================= */

export function AppHome() {
  const t = useT();
  const { lang } = useLang();

  const work = useMemo(() => openWork(), []);
  const sum = useMemo(() => workSummary(work), [work]);
  const queue = useMemo(() => reviewQueue(), []);
  const recent = useMemo(() => recentCertificates(12), []);
  const [open, setOpen] = useState<{
    cell: RequiredCapture;
    code: string;
  } | null>(null);

  const sealed = useMemo(
    () => TOWERS.reduce((n, tower) => n + towerProgress(tower).done, 0),
    [],
  );

  return (
    <div className="mt-7 flex flex-col gap-7">
      <div className="grid grid-cols-4 gap-4">
        <Stat
          value={fmtInt(sealed, lang)}
          label={t({ en: "Captures sealed", es: "Capturas selladas" })}
          note={t({
            en: `across ${DEVELOPMENT.towers} towers and ${fmtInt(DEVELOPMENT.units, lang)} apartments`,
            es: `en ${DEVELOPMENT.towers} torres y ${fmtInt(DEVELOPMENT.units, lang)} apartamentos`,
          })}
        />
        <Stat
          value={fmtInt(sum.outstanding, lang)}
          label={t({ en: "Jobs outstanding", es: "Trabajos pendientes" })}
          note={t({
            en: `${sum.late} past due`,
            es: `${sum.late} vencidos`,
          })}
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
          value={fmtInt(queue.length, lang)}
          label={t({ en: "Awaiting review", es: "Por revisar" })}
          note={t({
            en: "nobody has looked at these yet",
            es: "nadie los ha revisado aún",
          })}
        />
      </div>

      {/* ⚠️  THE BAND IS A ROUTE, NOT A DECORATION. Each line is the count from
          the screen that can act on it, and goes there. A banner that says
          something needs attention and then cannot say where is worse than no
          banner. */}
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-[15px] font-semibold">
          {t({ en: "Needs you today", es: "Requiere tu atención hoy" })}
        </h2>
        <p className="mt-0.5 text-[12px] text-ink-secondary">
          {t({
            en: `As at ${fmtDate(TODAY, lang)}.`,
            es: `Al ${fmtDate(TODAY, lang)}.`,
          })}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Action
            to="/platform/app/jobs"
            count={sum.rework}
            tone="var(--failed)"
            title={t({ en: "Sent back for rework", es: "Devueltos para corrección" })}
            note={t({
              en: "the site team wants this done again",
              es: "el equipo de obra pide rehacerlo",
            })}
          />
          <Action
            to="/platform/app/jobs"
            count={sum.late}
            tone="var(--pending)"
            title={t({ en: "Jobs past due", es: "Trabajos vencidos" })}
            note={t({
              en: "oldest first on the jobs board",
              es: "los más antiguos primero en trabajos",
            })}
          />
          <Action
            to="/platform/app/analysis"
            count={queue.length}
            tone="var(--accent)"
            title={t({ en: "Certificates to review", es: "Certificados por revisar" })}
            note={t({
              en: "newest first, in Analysis",
              es: "del más reciente, en Análisis",
            })}
          />
        </div>
      </section>

      <section>
        <h2 className="text-[15px] font-semibold">
          {t({ en: "The development", es: "El proyecto" })}
        </h2>
        <p className="mt-0.5 text-[12px] text-ink-secondary">
          {DEVELOPMENT.name} · {t(DEVELOPMENT.city)}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {TOWERS.map((tower) => (
            <TowerCard key={tower.key} tower={tower} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-[1.7fr_1fr] gap-6">
        <section>
          <h2 className="text-[15px] font-semibold">
            {t({ en: "Just published", es: "Recién publicados" })}
          </h2>
          <p className="mt-0.5 mb-4 text-[12px] text-ink-secondary">
            {t({
              en: "The most recent certificates. Open one to see what it holds.",
              es: "Los certificados más recientes. Abre uno para ver qué contiene.",
            })}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {recent.slice(0, 6).map((item) => (
              <CertCard
                key={item.session.code}
                item={item}
                onOpen={(cell) => setOpen({ cell, code: item.session.code })}
              />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold">
            {t({ en: "Activity", es: "Actividad" })}
          </h2>
          <p className="mt-0.5 mb-4 text-[12px] text-ink-secondary">
            {t({ en: "Newest first.", es: "Del más reciente." })}
          </p>
          <ul className="overflow-hidden rounded-lg border border-line bg-surface">
            {recent.slice(0, 9).map((item) => (
              <Event key={item.session.code} item={item} />
            ))}
          </ul>
        </section>
      </div>

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

function TowerCard({ tower }: { tower: (typeof TOWERS)[number] }) {
  const t = useT();
  const { lang } = useLang();
  const p = towerProgress(tower);

  return (
    <Link
      to={`/platform/app/assets/${tower.name.toLowerCase().replace(/\s+/g, "-")}`}
      className="group rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[14px] font-semibold text-ink">{tower.name}</span>
        <span className="font-mono text-[12px] tabular-nums text-ink-secondary">
          {Math.round(p.share * 100)}%
        </span>
      </div>
      <p className="mt-0.5 text-[12px] text-ink-secondary">
        {tower.floors} {t({ en: "floors", es: "pisos" })} ·{" "}
        {fmtInt(unitsIn(tower), lang)} {t({ en: "apartments", es: "apartamentos" })}
      </p>

      {/* Captures sealed against captures the tower will ever need. A bar that
          measured anything else would disagree with the tower explorer. */}
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        {/* ⚠️  NOTHING MEANS NOTHING. A Math.max(1, …) floor drew Torre 3 — on
            which not one apartment has been started — with a visible sliver of
            progress beside its own "0 / 5,280". A bar that cannot show zero is
            a bar that lies about the only case anybody checks. */}
        {p.done > 0 && (
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(0.5, p.share * 100)}%`,
              backgroundColor: "var(--accent)",
            }}
          />
        )}
      </div>
      <p className="mt-1.5 font-mono text-[11px] tabular-nums text-ink-muted">
        {fmtInt(p.done, lang)} / {fmtInt(p.required, lang)}
        {p.flagged > 0 && (
          <span className="ml-2" style={{ color: "var(--pending)" }}>
            {p.flagged} {t({ en: "flagged", es: "marcadas" })}
          </span>
        )}
      </p>
    </Link>
  );
}

function CertCard({
  item,
  onOpen,
}: {
  item: Published;
  onOpen: (cell: RequiredCapture) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const stage = stageByKey.get(item.job.stage);
  const cover = item.cells[0];

  return (
    <button
      type="button"
      onClick={() => onOpen(cover)}
      className="group overflow-hidden rounded-lg border border-line bg-surface text-left transition-colors hover:border-line-strong"
    >
      <img
        alt={t(cover.requirement.what)}
        src={shotSrc(imageFor(cover), 480)}
        width={480}
        height={320}
        loading="lazy"
        className="block aspect-[3/2] w-full object-cover"
      />
      <span className="block p-3">
        <span className="block truncate text-[13px] font-medium text-ink">
          {t({ en: "Apt", es: "Apto" })} {item.unit.code} ·{" "}
          {stage ? t(stage.name) : item.job.stage}
        </span>
        <span className="block truncate text-[11px] text-ink-secondary">
          {item.tower.name} · {t(TRADE[item.job.trade])} · {item.session.by.name}
        </span>
        <span className="mt-1.5 flex items-center gap-2">
          <span className="rounded-sm border border-line px-1.5 py-px font-mono text-[10px] text-ink-secondary">
            {item.session.code}
          </span>
          <span className="font-mono text-[10px] text-ink-muted">
            {fmtDate(item.session.date, lang)}
          </span>
          {item.flagged > 0 && (
            <span
              className="font-mono text-[10px]"
              style={{ color: "var(--pending)" }}
            >
              {item.flagged} {t({ en: "flagged", es: "marcadas" })}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

function Event({ item }: { item: Published }) {
  const t = useT();
  const { lang } = useLang();
  const stage = stageByKey.get(item.job.stage);
  const rooms = item.cells
    .map((c) => CAPTURE_ROOMS.find((r) => r.key === c.requirement.room))
    .filter(Boolean)
    .slice(0, 2)
    .map((r) => t(r!.name))
    .join(", ");

  return (
    <li className="flex gap-3 border-b border-line px-4 py-3 last:border-b-0">
      <span className="shrink-0 font-mono text-[11px] tabular-nums text-ink-muted">
        {fmtDate(item.session.date, lang)}
      </span>
      <span className="min-w-0">
        <span className="block text-[12px] text-ink">
          <span className="font-medium">{item.session.by.name}</span>{" "}
          {t({ en: "published", es: "publicó" })} {item.cells.length}{" "}
          {t({ en: "captures", es: "capturas" })}
        </span>
        <span className="block truncate text-[11px] text-ink-secondary">
          {item.tower.name} · {t({ en: "apt", es: "apto" })} {item.unit.code} ·{" "}
          {stage ? t(stage.name) : item.job.stage}
          {rooms && ` · ${rooms}`}
        </span>
        {item.flagged > 0 && (
          <span
            className="mt-0.5 block text-[11px]"
            style={{ color: "var(--pending)" }}
          >
            {/* ⚠️  RAISED BY A PERSON, not decided by the product. */}
            {t({
              en: `${item.flagged} since flagged by the site team`,
              es: `${item.flagged} marcadas después por el equipo de obra`,
            })}
          </span>
        )}
      </span>
    </li>
  );
}

function Action({
  to,
  count,
  tone,
  title,
  note,
}: {
  to: string;
  count: number;
  tone: string;
  title: string;
  note: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-start gap-3 rounded-md border border-line p-3 transition-colors hover:border-line-strong hover:bg-surface-sunken"
    >
      <span
        className="mt-0.5 font-mono text-[20px] tabular-nums"
        style={{ color: count > 0 ? tone : "var(--ink-muted)" }}
      >
        {count}
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">{title}</span>
        <span className="block text-[11px] text-ink-secondary">{note}</span>
      </span>
    </Link>
  );
}

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
