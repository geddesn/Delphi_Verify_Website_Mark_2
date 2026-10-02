import { useState } from "react";
import {
  Container,
  Section,
  Eyebrow,
  SectionHeader,
} from "@/components/ui/primitives";
import { WebFrame } from "@/components/renderings/WebFrame";
import { TowerExplorer } from "@/components/enterprise/TowerExplorer";
import {
  LangProvider,
  fmtInt,
  fmtPct,
  useLang,
  useT,
  type Bi,
} from "@/content/enterprise/lang";
import {
  DEVELOPMENT,
  GRANULARITY,
  MEDIA_LIMIT,
  CAPTURES_PER_APARTMENT,
  MEDIA_PER_CERTIFICATE,
  MAX_FLOORS,
  TOWERS,
  WORKSPACE,
  certificateCount,
  type Granularity,
} from "@/content/enterprise/world";
import { cn } from "@/lib/cn";

/* ============================================================================
   ENTERPRISE SCALE
   ============================================================================
   One development of 504 apartments, documented without drowning the site team
   that has to do it.

   The page answers three questions a large developer asks in this order, and
   it is ordered that way rather than by feature: how many records does this
   actually come to, how do I supervise a tower I cannot walk round, and how do
   I hold a subcontractor to what they did. Everything here serves one of
   those; anything that serves none of them does not belong on the page.

   ⚠️  RENDERINGS, NOT SCREENSHOTS, and this page is further ahead of the
   product than /platform/renderings is. See the warning at the top of
   content/enterprise/world.ts for what specifically does not exist yet. The
   standfirst says so once, plainly, and must keep saying so.

   ⚠️  NOT LINKED FROM NAV OR THE FOOTER. Reached from /platform/renderings and
   nowhere else, and `indexable: false` in routes.ts keeps it out of the
   sitemap and adds a robots Disallow. Findable with the link, not stumbled
   into — which is the only honest way to publish a page that runs ahead of
   what ships.
   ========================================================================= */

export default function PlatformEnterprise() {
  /* The provider wraps the whole page rather than each screen: the language
     switch in the hero has to reach the tower explorer four sections down. */
  return (
    <LangProvider>
      <PageBody />
    </LangProvider>
  );
}

function PageBody() {
  const t = useT();

  return (
    <>
      <Section tone="inverse">
        <Container>
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Eyebrow>{t(copy.eyebrow)}</Eyebrow>
              <LangSwitch />
            </div>
            <h1 className="max-w-3xl text-display-lg text-ink md:text-display-xl">
              {t(copy.headline)}
            </h1>
            <p className="max-w-3xl text-body-lg text-ink-secondary">
              {t(copy.standfirst)}
            </p>
            <p className="max-w-3xl border-t border-line-strong pt-4 text-body-sm text-ink-muted">
              {t(copy.disclaimer)}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── The volume question ──
          First, because it is the objection that stops the conversation. A
          developer who believes this means thousands of separate verifications
          never gets as far as looking at the tower. */}
      <Section id="volume">
        <Container>
          <SectionHeader
            eyebrow={t(copy.volume.eyebrow)}
            headline={t(copy.volume.headline)}
            standfirst={t(copy.volume.standfirst)}
          />
          <GranularityPanel />
        </Container>
      </Section>

      {/* ── The tower ── */}
      <Section id="tower" tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={t(copy.tower.eyebrow)}
            headline={t(copy.tower.headline)}
            standfirst={t(copy.tower.standfirst)}
          />
          <div className="mt-12 flex flex-col gap-8">
            <WebFrame>
              <TowerExplorer />
            </WebFrame>
            <Shows items={t(copy.tower.shows)} message={t(copy.tower.message)} />
          </div>
        </Container>
      </Section>
    </>
  );
}

/* ── Language switch ─────────────────────────────────────────────────────── */

/** Two buttons, and the choice lands in the URL — so the link somebody copies
 *  after switching opens in the language they switched to. See lang.tsx for why
 *  this is not a remembered preference. */
function LangSwitch() {
  const { lang, setLang } = useLang();

  return (
    <div
      className="flex rounded-sm border border-line"
      role="group"
      aria-label="Language / Idioma"
    >
      {(["en", "es"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          lang={code}
          className={cn(
            "cursor-pointer px-3 py-1.5 font-mono text-mono-sm uppercase transition-colors",
            lang === code
              ? "bg-surface-sunken text-ink"
              : "text-ink-muted hover:text-ink-secondary",
          )}
        >
          {code === "en" ? "English" : "Español"}
        </button>
      ))}
    </div>
  );
}

/* ── Granularity ─────────────────────────────────────────────────────────── */

/** Three ways to model the same development, and what each comes to.
 *
 *  ⚠️  THE NUMBERS ARE COMPUTED. certificateCount() derives every figure from
 *  the stage list, the geometry and the tower count — see
 *  content/enterprise/world.ts. A typed number here would be the one thing on
 *  the page a buyer could catch us getting wrong, on the one subject where
 *  being caught is fatal.
 *
 *  The control matters more than the table. A developer who moves it himself
 *  and watches 3,024 become 258 has answered his own objection, which is worth
 *  more than being told the answer. */
function GranularityPanel() {
  const t = useT();
  const { lang } = useLang();
  /* Opens on the middle option — the one that matches how a building is
     actually made, and the recommendation. */
  const [choice, setChoice] = useState<Granularity>("by-level");

  const chosen = GRANULARITY.find((g) => g.key === choice) ?? GRANULARITY[1];
  const count = certificateCount(choice);
  const naive = certificateCount("per-unit");

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      {/* The three options, as rows that are the control. */}
      <div className="flex flex-col gap-2">
        {GRANULARITY.map((g) => {
          const on = g.key === choice;
          const n = certificateCount(g.key);
          return (
            <button
              key={g.key}
              type="button"
              onClick={() => setChoice(g.key)}
              aria-pressed={on}
              className={cn(
                "flex cursor-pointer flex-col gap-2 rounded-sm border p-5 text-left transition-colors",
                on
                  ? "border-accent bg-surface"
                  : "border-line hover:border-line-strong",
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-body text-ink">{t(g.name)}</span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-heading tabular-nums",
                    on ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {fmtInt(n, lang)}
                </span>
              </div>
              <span className="text-body-sm text-ink-secondary">{t(g.how)}</span>
            </button>
          );
        })}
      </div>

      {/* What the chosen option costs, and the arithmetic behind it. */}
      <aside className="flex flex-col gap-5 rounded-sm border border-line-strong bg-surface p-6">
        <div>
          <p className="font-mono text-mono-sm uppercase text-ink-muted">
            {t({ en: "Certificates", es: "Certificados" })}
          </p>
          <p className="mt-1 font-mono text-display text-ink tabular-nums">
            {fmtInt(count, lang)}
          </p>
          <p className="mt-1 text-body-sm text-ink-secondary">
            {t({
              en: `for ${fmtInt(DEVELOPMENT.units, lang)} apartments across ${DEVELOPMENT.towers} towers`,
              es: `para ${fmtInt(DEVELOPMENT.units, lang)} apartamentos en ${DEVELOPMENT.towers} torres`,
            })}
          </p>
        </div>

        {count < naive && (
          <p className="text-body-sm text-ink-secondary">
            {t({
              en: `${fmtPct(1 - count / naive, lang)} fewer than documenting every stage against every apartment.`,
              es: `${fmtPct(1 - count / naive, lang)} menos que documentar cada etapa en cada apartamento.`,
            })}
          </p>
        )}

        <div className="border-t border-line pt-4">
          <p className="font-mono text-mono-sm uppercase text-ink-muted">
            {t({ en: "What you give up", es: "Lo que se pierde" })}
          </p>
          <p className="mt-1.5 text-body-sm text-ink-secondary">
            {t(chosen.tradeoff)}
          </p>
        </div>

        <div className="border-t border-line pt-4">
          <p className="text-body-sm text-ink-secondary">
            {t({
              en: `Each certificate carries up to ${MEDIA_LIMIT} photographs or videos — around ${MEDIA_PER_CERTIFICATE} is typical, and a full apartment checklist is ${CAPTURES_PER_APARTMENT()} captures across its rooms and trades. This development's evidence is roughly ${fmtInt(count * MEDIA_PER_CERTIFICATE, lang)} captures held in ${fmtInt(count, lang)} sealed records.`,
              es: `Cada certificado admite hasta ${MEDIA_LIMIT} fotografías o videos — unas ${MEDIA_PER_CERTIFICATE} es lo habitual, y la lista completa de un apartamento son ${CAPTURES_PER_APARTMENT()} capturas entre sus ambientes y oficios. La evidencia de este proyecto son unas ${fmtInt(count * MEDIA_PER_CERTIFICATE, lang)} capturas en ${fmtInt(count, lang)} registros sellados.`,
            })}
          </p>
        </div>
      </aside>
    </div>
  );
}

/* ── Shared brief block ──────────────────────────────────────────────────── */

/** The same `shows` / `message` shape /platform/renderings uses, for the same
 *  reason: reviewing the rendering and reviewing what it was meant to prove
 *  should be one act. */
function Shows({ items, message }: { items: string[]; message: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12">
      <ul className="flex flex-col gap-2.5">
        {items.map((s) => (
          <li key={s} className="flex gap-3 text-body-sm text-ink-secondary">
            <span aria-hidden className="flex h-[1lh] w-3 shrink-0 items-center">
              <span className="h-px w-full bg-accent" />
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line-strong pt-4 text-body text-ink lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
        {message}
      </p>
    </div>
  );
}

/* ── Copy ────────────────────────────────────────────────────────────────── *
   Kept in the page rather than content/ because every string here is about the
   ARGUMENT the page makes, not about the world it depicts. The world lives in
   content/enterprise/world.ts and is shared between screens; this is the prose
   around it, which nothing else reads.                                       */

type ShowsCopy = {
  eyebrow: Bi;
  headline: Bi;
  standfirst: Bi;
  shows: { en: string[]; es: string[] };
  message: Bi;
};

const copy = {
  eyebrow: { en: "Enterprise scale", es: "Escala empresarial" } as Bi,
  headline: {
    en: "504 apartments, evidenced as they are built.",
    es: "504 apartamentos, evidenciados a medida que se construyen.",
  } as Bi,
  standfirst: {
    en: `A workspace for a developer the size of ${WORKSPACE.name} holds tens of thousands of delivered homes and dozens of live projects. This page follows one of them — ${DEVELOPMENT.name}, ${DEVELOPMENT.towers} towers of ${TOWERS.map((x) => x.floors).join(', ')} storeys — and shows how its construction becomes evidence without asking a site team to do thousands of separate verifications.`,
    es: `El espacio de trabajo de una constructora del tamaño de ${WORKSPACE.name} contiene decenas de miles de viviendas entregadas y docenas de proyectos activos. Esta página sigue uno de ellos — ${DEVELOPMENT.name}, ${DEVELOPMENT.towers} torres de ${TOWERS.map((x) => x.floors).join(', ')} pisos — y muestra cómo su construcción se convierte en evidencia sin pedirle a la obra miles de verificaciones por separado.`,
  } as Bi,
  disclaimer: {
    en: "These are interface renderings rather than screenshots of shipped software, and this page runs further ahead of the product than the rest of the site. The developer, the development and every figure on it are invented.",
    es: "Estas son representaciones de interfaz, no capturas de pantalla de software en producción, y esta página va más allá del producto actual que el resto del sitio. La constructora, el proyecto y todas las cifras son ficticias.",
  } as Bi,

  volume: {
    eyebrow: { en: "The volume question", es: "La pregunta del volumen" } as Bi,
    headline: {
      en: "How many verifications does a 504-apartment development actually need?",
      es: "¿Cuántas verificaciones necesita realmente un proyecto de 504 apartamentos?",
    } as Bi,
    standfirst: {
      en: `Every stage against every apartment — with rough-in captured twice, once by the plumber and once by the electrician — is ${fmtInt(certificateCount("per-unit"), "en")} certificates, which is why the question gets asked. But the level a certificate attaches to is a choice, not a limit — a slab exists once per floor, siteworks once per tower, and a certificate holds up to ${MEDIA_LIMIT} captures. Move the choice and watch the number.`,
      es: `Cada etapa por apartamento — con instalaciones capturadas dos veces, una por el plomero y otra por el electricista — son ${fmtInt(certificateCount("per-unit"), "es")} certificados, y por eso surge la pregunta. Pero el nivel al que se asocia un certificado es una decisión, no un límite — una placa existe una vez por piso, las obras preliminares una vez por torre, y un certificado admite hasta ${MEDIA_LIMIT} capturas. Cambie la decisión y observe la cifra.`,
    } as Bi,
  },

  tower: {
    eyebrow: { en: "Supervision", es: "Supervisión" } as Bi,
    headline: {
      en: "A tower you can turn round, and a floor you can open.",
      es: "Una torre que se puede girar y un piso que se puede abrir.",
    } as Bi,
    standfirst: {
      en: "The block is generated from the unit schedule — eight apartments to a floor, five rooms and a balcony to an apartment — and every apartment is shaded by how much sealed evidence it carries. The build front is visible as a boundary rather than something to work out from a report.",
      es: "El volumen se genera a partir del cuadro de áreas — ocho apartamentos por piso, cinco ambientes y un balcón por apartamento — y cada apartamento se sombrea según la evidencia sellada que tiene. El frente de obra se ve como un límite, no como algo que haya que deducir de un informe.",
    } as Bi,
    shows: {
      en: [
        "A tower drawn from its unit schedule, not from an imported building model",
        "Every apartment shaded by how many of its six stages are sealed",
        `A floor rail covering all ${MAX_FLOORS} storeys, so the build front reads as a boundary`,
        "A floor plan that agrees with the block about which apartment is where",
        "The six stages for the selected floor, counted across its eight apartments",
        "Apartments needing attention marked in amber, not red",
      ],
      es: [
        "Una torre dibujada a partir de su cuadro de áreas, no de un modelo importado",
        "Cada apartamento sombreado según cuántas de sus seis etapas están selladas",
        `Una regleta de los ${MAX_FLOORS} pisos, donde el frente de obra se lee como un límite`,
        "Una planta que coincide con el volumen sobre la ubicación de cada apartamento",
        "Las seis etapas del piso seleccionado, contadas en sus ocho apartamentos",
        "Los apartamentos que requieren atención marcados en ámbar, no en rojo",
      ],
    },
    message: {
      en: "A head of construction can see the state of 504 apartments without reading a report about any of them.",
      es: "Un director de construcción puede ver el estado de 504 apartamentos sin leer un informe de ninguno.",
    } as Bi,
  } satisfies ShowsCopy,
};
