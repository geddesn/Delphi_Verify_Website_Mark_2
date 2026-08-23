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
import { IndustryTiles } from "@/components/industries/IndustryTiles";
import { featureFigures } from "@/content/features";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";
import {
  industries,
  industriesPage,
  industryBackdrops,
  families,
  crossIndustry,
  industriesCta,
  type Industry,
} from "@/content/industries";
import { corroboration } from "@/content/platform";
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

   3. The commercial-outcomes framework — four ways verified evidence pays
      for itself — is no longer on this page. It abstracted the value into
      four headings a reader had to map back onto their own operation, which
      is work the nine scenarios already do concretely. `outcomes` and the
      per-sector tags are still in content/industries.ts and still typed;
      nothing renders them today.

   4. The four qualifying conditions have gone the same way, and for the same
      reason: they asked a reader to run an abstract test on their own
      operation before they had been shown a single concrete case. The jump
      tiles sit where they were — the same "is this for me?" question,
      answered by letting the reader find their own sector by name and
      picture. `pattern` in content/home.ts is no longer rendered anywhere.

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

          {/* ── Jump grid ──
              Where the four qualifying conditions used to be. The tiles answer
              the same question those conditions were asking — is this for me?
              — but concretely, by letting a reader find their own sector by
              name and picture and go straight to it.

              On the inverse tone they pick up the dark mapping of
              --tile-surface, so they read as they do in dark mode without a
              variant of their own. */}
          <IndustryTiles className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" />
        </Container>
      </Section>

      {/* ── The nine, in four families ──
          Full measure. The jump grid used to sit between this and the hero on
          the same sunken tone, so a thin top padding kept the two reading as
          one block; with the tiles moved up into the hero this section opens
          against a tone change and needs the space back. */}
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
                <BulletList
                  items={corroboration.live}
                  className="text-body-sm text-ink"
                />
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

/* Outcome tags. Muted and small — they orient the reader, they are not the
   argument. Never coloured: evidence colours mean verification state. */
/* Capture moments, not commercial outcomes.
   The outcome tags that used to sit here resolved to nearly the same three
   labels on all nine cards, so they distinguished nothing. These are the
   sector's own vocabulary for the points at which evidence gets created —
   which is the question a reader actually has after "what is it?".
   The commercial framework that used to sit above them has since gone too;
   see point 3 in the page header. */
/* ── A middot-separated line, NOT pills ───────────────────────────────────
   Both places this page listed short terms — the capture moments on every
   sector card, and the live corroboration signals — drew them as filled,
   bordered, padded boxes. That is the site's vocabulary for something you can
   press, and neither set is pressable; the moments sat directly above a real
   link, so the row read as a set of filters nobody could click.

   Stripping the box leaves the type doing the work it was already doing. The
   two callers keep their own treatment — the moments stay monospace uppercase
   because they are the sector's own vocabulary, the signals stay body text
   because they are content — and share only the separator, so the two rows
   cannot drift apart the way the pill styles had.

   The middot matches the same job elsewhere: the infrastructure strip and the
   document row on /trust. */
function BulletList({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}>
      {items.map((item, i) => (
        <li key={item} className="flex items-center gap-2">
          {/* Decorative. The list already conveys the grouping to a screen
              reader, and hearing "middot" between every item does not help. */}
          {i > 0 && (
            <span aria-hidden className="text-ink-muted">
              ·
            </span>
          )}
          {item}
        </li>
      ))}
    </ul>
  );
}

function MomentTags({ moments }: { moments: Industry["moments"] }) {
  return (
    <BulletList
      items={moments}
      className="font-mono text-mono-sm uppercase text-ink-secondary"
    />
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
                {/* Centred on the first line, not nudged with a margin.
                    `mt-2` was 8px against a 23.7px line box (0.9375rem × 1.58),
                    so the rule sat ~4px above the optical centre. A box one
                    line tall with the rule centred inside it stays correct if
                    the type scale ever changes. */}
                <span aria-hidden className="flex h-[1lh] w-3 shrink-0 items-center">
                  <span className="h-px w-full bg-accent" />
                </span>
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
