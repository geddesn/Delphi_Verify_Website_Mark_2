import { useMemo, useState } from "react";
import {
  CAPTURE_ROOMS,
  TRADE,
  imageFor,
  reviewQueue,
  shotSrc,
  stageByKey,
  type ReviewItem,
} from "@/content/enterprise/world";
import { fmtDate, fmtInt, useLang, useT, type Bi } from "@/content/enterprise/lang";
import { cn } from "@/lib/cn";

/* ============================================================================
   REVIEW QUEUE
   ============================================================================
   Certificates nobody has looked at yet.

   ⚠️  THE PRODUCT CANNOT DO THIS. There is no approval or sign-off workflow —
   a recipient opens a public certificate by its code and forms a view, and
   that is the end of it. Everything on this screen is the thing a developer
   with 70% of the work subcontracted actually wants and does not have. It
   belongs at the top of the gap analysis, not quietly in a demo.

   ⚠️  AND REVIEWING IS NOT VERIFYING. Delphi can say this photograph was taken
   at this place at this time on this device and has not changed since. It
   cannot say the pipework is any good. The three outcomes below are a person's
   judgement recorded against a record, and the wording keeps saying so.

   Newest first. A queue sorted by age puts the stragglers on top every morning
   and buries the work that just came in, which is the work somebody is waiting
   on; the age column is there for the stragglers.
   ========================================================================= */

/** What a reviewer decided. Held in this session only — a rendering, not a
 *  store. */
type Verdict = "accepted" | "warning" | "problem";

const VERDICT: Record<Verdict, { label: Bi; colour: string }> = {
  accepted: {
    label: { en: "Accepted", es: "Aceptado" },
    colour: "var(--ink-muted)",
  },
  warning: {
    label: { en: "Inspection raised", es: "Inspección solicitada" },
    colour: "var(--pending)",
  },
  problem: {
    label: { en: "Rework raised", es: "Corrección solicitada" },
    colour: "var(--failed)",
  },
};

export function ReviewQueue() {
  const t = useT();
  const { lang } = useLang();
  const queue = useMemo(() => reviewQueue(), []);
  const [decided, setDecided] = useState<Map<string, Verdict>>(new Map());
  const [showDone, setShowDone] = useState(false);

  const keyOf = (item: ReviewItem) => item.session.code;
  const outstanding = queue.filter((i) => !decided.has(keyOf(i)));
  const shown = showDone ? queue : outstanding;

  const decide = (item: ReviewItem, verdict: Verdict) =>
    setDecided((m) => new Map(m).set(keyOf(item), verdict));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-semibold">
            {t({ en: "Awaiting review", es: "Pendiente de revisión" })}
          </h2>
          <p className="mt-0.5 max-w-prose text-[12px] text-ink-secondary">
            {t({
              en: `${fmtInt(outstanding.length, lang)} certificates nobody has looked at, newest first. Reviewing records a judgement against a record — it does not change the record, which is sealed.`,
              es: `${fmtInt(outstanding.length, lang)} certificados sin revisar, del más reciente al más antiguo. Revisar registra un juicio sobre el registro — no lo modifica, porque está sellado.`,
            })}
          </p>
        </div>

        {decided.size > 0 && (
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="cursor-pointer rounded-md border border-line px-3 py-1.5 text-[13px] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink"
          >
            {showDone
              ? t({ en: "Hide reviewed", es: "Ocultar revisados" })
              : t({
                  en: `Show ${decided.size} reviewed`,
                  es: `Ver ${decided.size} revisados`,
                })}
          </button>
        )}
      </div>

      {outstanding.length === 0 && !showDone ? (
        <p className="rounded-lg border border-line bg-surface px-5 py-6 text-[13px] text-ink-secondary">
          {t({
            en: "Nothing left to review.",
            es: "No queda nada por revisar.",
          })}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {shown.slice(0, 40).map((item) => (
            <Card
              key={keyOf(item)}
              item={item}
              verdict={decided.get(keyOf(item))}
              onDecide={(v) => decide(item, v)}
            />
          ))}

          {shown.length > 40 && (
            <p className="text-[12px] text-ink-secondary">
              {t({
                en: `${fmtInt(shown.length - 40, lang)} more not shown.`,
                es: `${fmtInt(shown.length - 40, lang)} más sin mostrar.`,
              })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Card({
  item,
  verdict,
  onDecide,
}: {
  item: ReviewItem;
  verdict?: Verdict;
  onDecide: (v: Verdict) => void;
}) {
  const t = useT();
  const { lang } = useLang();
  const stage = stageByKey.get(item.job.stage);
  const flagged = item.shots.filter((s) => s.status === "problem").length;

  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border bg-surface",
        verdict ? "border-line" : "border-line-strong",
      )}
      style={{ opacity: verdict ? 0.65 : 1 }}
    >
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2.5">
        <span className="rounded-sm border border-line-strong px-2 py-0.5 font-mono text-[12px] text-ink">
          {item.session.code}
        </span>
        <span className="text-[13px] font-semibold text-ink">
          {item.tower.name} · {t({ en: "apt", es: "apto" })} {item.unit.code}
        </span>
        <span className="text-[13px] text-ink-secondary">
          {stage ? t(stage.name) : item.job.stage} · {t(TRADE[item.job.trade])}
        </span>

        <span className="ml-auto flex items-center gap-3 font-mono text-[11px] text-ink-muted">
          <span className="text-ink-secondary">{item.session.by.name}</span>
          <span>{fmtDate(item.session.date, lang)}</span>
          {/* Age earns its place only when it is embarrassing. */}
          {item.ageDays > 21 && (
            <span style={{ color: "var(--pending)" }}>
              {t({
                en: `${item.ageDays} days old`,
                es: `${item.ageDays} días`,
              })}
            </span>
          )}
          <span>
            {item.shots.length} {t({ en: "captures", es: "capturas" })}
          </span>
        </span>
      </header>

      <div className="flex gap-2 overflow-x-auto p-3">
        {item.shots.map((cell) => {
          const room = CAPTURE_ROOMS.find(
            (r) => r.key === cell.requirement.room,
          );
          return (
            <figure
              key={cell.requirement.room}
              className="flex w-[150px] shrink-0 flex-col gap-1"
            >
              <img
                alt={t(cell.requirement.what)}
                src={shotSrc(imageFor(cell), 480)}
                width={480}
                height={320}
                loading="lazy"
                className="block aspect-[3/2] w-full rounded-sm border object-cover"
                style={{
                  borderColor:
                    cell.status === "problem"
                      ? "var(--failed)"
                      : "var(--line)",
                }}
              />
              <figcaption className="truncate text-[11px] text-ink-secondary">
                {room ? t(room.name) : cell.requirement.room}
              </figcaption>
            </figure>
          );
        })}
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
        {flagged > 0 && (
          <span className="text-[12px]" style={{ color: "var(--failed)" }}>
            {t({
              en: `${flagged} already flagged on site`,
              es: `${flagged} ya marcadas en obra`,
            })}
          </span>
        )}

        {verdict ? (
          <span
            className="text-[13px] font-medium"
            style={{ color: VERDICT[verdict].colour }}
          >
            {t(VERDICT[verdict].label)}
          </span>
        ) : (
          <>
            {/* ⚠️  A JUDGEMENT, NOT A VERIFICATION. The record is sealed and
                these buttons do not touch it — they say what a person thought
                of what it shows. The wording has to keep that straight,
                because the product's whole claim depends on the difference. */}
            <Action onClick={() => onDecide("accepted")}>
              {t({ en: "Accept", es: "Aceptar" })}
            </Action>
            <Action tone="var(--pending)" onClick={() => onDecide("warning")}>
              {t({ en: "Raise inspection", es: "Solicitar inspección" })}
            </Action>
            <Action tone="var(--failed)" onClick={() => onDecide("problem")}>
              {t({ en: "Raise rework", es: "Solicitar corrección" })}
            </Action>
          </>
        )}

        <span className="ml-auto font-mono text-[11px] text-ink-muted">
          {t({
            en: "The record itself is unchanged by any of this.",
            es: "El registro en sí no cambia con ninguna de estas acciones.",
          })}
        </span>
      </footer>
    </section>
  );
}

function Action({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer rounded-md border px-3 py-1 text-[13px] transition-colors hover:bg-surface-sunken"
      style={{
        borderColor: tone ?? "var(--line-strong)",
        color: tone ?? "var(--ink)",
      }}
    >
      {children}
    </button>
  );
}
