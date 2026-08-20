import { Link } from "react-router-dom";
import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
} from "@/components/ui/primitives";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { EvidenceChip } from "@/components/evidence/Evidence";
import { IndustryShot } from "@/components/product/IndustryShot";
import { ExpandableFigure } from "@/components/product/ExpandableFigure";
import { featureFigures } from "@/content/features";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";
import {
  industries,
  industriesPage,
  industryBackdrops,
  industryShortcuts,
  outcomes,
  families,
  crossIndustry,
  industriesCta,
  type Industry,
} from "@/content/industries";
import { corroboration } from "@/content/platform";
import { pattern } from "@/content/home";
import { cn } from "@/lib/cn";

/* ============================================================================
   INDUSTRIES
   ============================================================================
   Restructured from a flat list of nine long cards into four families of short
   ones. Three things drove it:

   1. The scenario is the headline. "A charter returns with damage and the
      parties disagree about when it happened" sells the problem; "Yachts &
      marine" only names a market. The sector name is now the subhead.

   2. The universal evidence line and the nine per-sector roadmap markers are
      gone. Repeated nine times they dragged the page into implementation
      detail and made every vertical look like it was missing something. Both
      now appear once — the first on /platform, the second in the
      cross-industry section under a single direction marker.

   3. Commercial outcomes are surfaced. Each card carries two or three tags
      from one company-wide framework, so a reader sees the shape of the value
      before reading a word of the copy.

   Cards do not link anywhere yet. `pageHref` is optional in the content model
   and unset on all nine; when sector pages exist, setting it makes the card a
   link with no change here.
   ========================================================================= */

export default function Industries() {
  return (
    <>
      <Section tone="inverse" className="relative">
        <SceneBackdrop frames={industryBackdrops} />
        <Container className="relative z-10">
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{industriesPage.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {industriesPage.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {industriesPage.standfirst}
            </p>
          </div>

          {/* The qualifying test, restated compactly. It is the thing that
              makes a visitor recognise themselves without a vertical page. */}
          <div className="mt-14 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {pattern.conditions.map((c) => (
              <div
                key={c.n}
                className="flex flex-col gap-2 border-t border-line-strong pt-4"
              >
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {c.n}
                </span>
                <h2 className="text-body font-semibold text-ink">{c.title}</h2>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── Jump grid ──
          padding="none" so the py below actually applies — a base py-* from
          sectionPadding wins over a className one on CSS source order. */}
      <Section tone="sunken" padding="none" className="py-8 md:py-10">
        <Container>
          <nav aria-label="Jump to an industry">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {industryShortcuts.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className={shortcutTile}>
                    {s.label}
                  </a>
                </li>
              ))}
              {/* Nine sectors in a ten-cell grid leaves a hole, and an empty
                  cell reads as a bug. */}
              <li>
                <Link to="/contact" className={cn(shortcutTile, "text-ink-accent")}>
                  Yours? →
                </Link>
              </li>
            </ul>
          </nav>
        </Container>
      </Section>

      {/* ── Commercial outcomes ── */}
      <Section padding="tight">
        <Container>
          <SectionHeader
            eyebrow={industriesPage.outcomesEyebrow}
            headline={industriesPage.outcomesHeadline}
          />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {outcomes.map((o) => (
              <li key={o.id} className="flex flex-col gap-2 bg-surface p-6">
                <h3 className="text-subheading text-ink">{o.label}</h3>
                <p className="text-body-sm text-ink-secondary">{o.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── The nine, in four families ── */}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={industriesPage.familiesEyebrow}
            headline={industriesPage.familiesHeadline}
          />

          <div className="mt-14 flex flex-col gap-16">
            {families.map((family) => {
              const members = industries.filter((i) => i.family === family.id);
              if (members.length === 0) return null;

              return (
                <section key={family.id} className="flex flex-col gap-6">
                  <h3 className="border-t border-line-strong pt-4 font-mono text-mono-sm uppercase text-ink-muted">
                    {family.title}
                  </h3>
                  <div className="flex flex-col gap-6">
                    {members.map((ind, i) => (
                      <IndustryCard
                        key={ind.id}
                        industry={ind}
                        reverse={i % 2 === 1}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── Why one platform spans all of it ── */}
      <Section tone="inverse">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div className="flex flex-col gap-5">
              <Eyebrow>{crossIndustry.eyebrow}</Eyebrow>
              <h2 className="text-display text-ink">{crossIndustry.headline}</h2>
              <p className="text-body-lg text-ink-secondary">
                {crossIndustry.body}
              </p>
              <Link
                to={crossIndustry.linkHref}
                className="mt-2 flex w-fit items-center gap-2 text-body text-ink-accent underline-offset-4 hover:underline"
              >
                {crossIndustry.linkLabel}
                <ArrowRight />
              </Link>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {corroboration.liveLabel}
                </span>
                <ul className="flex flex-wrap gap-2">
                  {corroboration.live.map((l) => (
                    <li
                      key={l}
                      className="rounded-md border border-line bg-surface-raised px-3 py-1.5 text-body-sm text-ink"
                    >
                      {l}
                    </li>
                  ))}
                </ul>
              </div>

              {/* The nine per-sector roadmap lines, consolidated into one
                  marker. See the header of content/industries.ts. */}
              <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-mono-sm uppercase text-ink-muted">
                    {corroboration.sectorLabel}
                  </span>
                  <EvidenceChip state="pending" label="Development direction" />
                </div>
                <ul className="flex flex-col gap-px overflow-hidden rounded-md border border-dashed border-line">
                  {corroboration.bySector.map((s) => (
                    <li
                      key={s.sector}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3"
                    >
                      <span className="min-w-[9rem] text-body-sm font-semibold text-ink-muted">
                        {s.sector}
                      </span>
                      <span aria-hidden className="text-ink-muted">
                        →
                      </span>
                      <span className="text-body-sm text-ink-muted">
                        {s.signal}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Close ── */}
      <Section>
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="text-display text-ink">{industriesCta.headline}</h2>
            <ul className="flex flex-col gap-2">
              {industriesCta.prompts.map((p) => (
                <li key={p} className="flex gap-3 text-body-lg text-ink-secondary">
                  <span aria-hidden className="mt-3.5 h-px w-4 shrink-0 bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <ButtonLink to={industriesCta.primary.href} size="lg">
                {industriesCta.primary.label}
                <ArrowRight />
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

/* Shared so the sector tiles and the contact tile cannot drift apart.
   Reads as a button rather than a table cell. */
const shortcutTile = cn(
  "flex h-full items-center justify-center rounded-md border border-line",
  "bg-surface-raised px-4 py-4 text-center shadow-raised",
  "text-body-sm font-semibold text-ink",
  "transition-colors hover:border-line-strong hover:text-ink-accent",
);

/* Outcome tags. Muted and small — they orient the reader, they are not the
   argument. Never coloured: evidence colours mean verification state. */
/* Capture moments, not commercial outcomes.
   The outcome tags that used to sit here resolved to nearly the same three
   labels on all nine cards, so they distinguished nothing. These are the
   sector's own vocabulary for the points at which evidence gets created —
   which is the question a reader actually has after "what is it?".
   The commercial framework still appears, once, in its own section above. */
function MomentTags({ moments }: { moments: Industry["moments"] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {moments.map((m) => {
        return (
          /* Filled rather than outlined: on the sunken section background an
             outline-only tag nearly disappeared. Surface fill plus a card
             shadow lifts it off the panel, and the text steps up from muted to
             secondary so it reads as content rather than as a faint label. */
          <li
            key={m}
            className="rounded-sm border border-line bg-surface-raised px-2.5 py-1 font-mono text-mono-sm uppercase text-ink-secondary shadow-raised"
          >
            {m}
          </li>
        );
      })}
    </ul>
  );
}

function IndustryCard({
  industry,
  reverse = false,
}: {
  industry: Industry;
  reverse?: boolean;
}) {
  /* Only the yacht composite exists so far. Keyed by industry id, so adding
     another is one line here plus an entry in features.ts. */
  /* Looked up by id rather than named here, so adding a worked example to
     another sector is a content change only. See featureFigures. */
  const figure =
    featureFigures[industry.id as keyof typeof featureFigures] ?? null;

  return (
    <article
      id={industry.id}
      className="scroll-mt-20 rounded-lg border border-line bg-surface-raised p-6 shadow-raised md:p-8"
    >
      {/* Sector name leads, the scenario supports it.

          It is also now the actual heading element rather than the quote,
          which matters beyond looks: the card's title is the sector, so that
          is what belongs in the document outline and in a screen reader's
          heading list. A quotation as the heading made the page navigable
          only by anecdote. */}
      <header>
        <div className="flex flex-wrap items-baseline gap-3">
          <h4 className="text-heading text-ink">{industry.name}</h4>
          {/* Not an EvidenceChip: those are green, and green on this site may
              only mean "verified". A maturity marker is not a verification
              state. */}
          {industry.featured && (
            <span className="rounded-sm border border-line-strong px-2 py-0.5 font-mono text-mono-sm uppercase text-ink-muted">
              Featured
            </span>
          )}
        </div>
      </header>

      <div className={cn("mt-5 grid gap-8", industry.image && "lg:grid-cols-12")}>
        {/* Fixed 16:9, at every breakpoint. The masters are 2720×1530 — exactly
            16:9 — so nothing is cropped. The previous `lg:aspect-auto` stretched
            this slot to the height of the text column and centre-cropped about
            36% of the width, which is how the scene shots ended up as portraits
            of a person's head. */}
        {industry.image && (
          <div
            className={cn(
              "flex flex-col gap-5 lg:col-span-5",
              reverse && "lg:order-last",
            )}
          >
            <div className="aspect-video">
              {figure ? (
                /* Where an annotated composite exists it replaces the scene
                   photograph. Inline it is just the photograph; the callout
                   panels open in the dialog, where they can be read. */
                <ExpandableFigure
                  src={`${figure.image.base}-1920.webp`}
                  srcSet={`${figure.image.base}-480.webp 480w, ${figure.image.base}-960.webp 960w, ${figure.image.base}-1920.webp 1920w`}
                  sizes="(min-width: 1024px) 500px, 100vw"
                  width={figure.image.width}
                  height={figure.image.height}
                  alt={figure.image.alt}
                  callouts={[...figure.callouts]}
                  caption={figure.note}
                  expandLabel="Expand"
                  dialogTitle={figure.headline}
                />
              ) : (
                <IndustryShot name={industry.image} alt={industry.imageAlt ?? ""} />
              )}
            </div>

            {/* Outcome tags sit under the image rather than at the foot of the
                prose: a 16:9 slot is shorter than the text beside it, and this
                fills that gap instead of leaving it blank. */}
            <MomentTags moments={industry.moments} />
          </div>
        )}

        <div
          className={cn(
            "flex flex-col gap-5",
            industry.image && "lg:col-span-7",
          )}
        >

          <div className="flex flex-col gap-3 pl-5">
            <p className="text-body text-ink-secondary">{industry.problem}</p>
            <p className="text-body text-ink">{industry.application}</p>
          </div>

          <ul className="flex flex-col gap-1.5 pl-5">
            {industry.value.map((v) => (
              <li key={v} className="flex gap-2 text-body-sm text-ink-secondary">
                <span aria-hidden className="mt-2 h-px w-3 shrink-0 bg-accent" />
                {v}
              </li>
            ))}
          </ul>

          {/* Without an image there is no left column, so the tags close the
              card here instead. */}
          {!industry.image && (
            <div className="pl-5">
              <MomentTags moments={industry.moments} />
            </div>
          )}
        </div>
      </div>

      {/* The scenario closes the card rather than opening it. As a kicker it
          reads as the consequence of everything above — the sector, the
          problem, the fix — instead of as a subtitle competing with the name.

          Separated by a hairline because it is a different voice: the
          customer's words, not Delphi's. Italic is the drawn face, imported in
          styles/index.css, not a synthesised slant. */}
      <p className="mt-8 border-t-2 border-line-strong pt-6 text-subheading font-semibold italic text-ink-secondary">
        “{industry.situation}”
      </p>
    </article>
  );
}
