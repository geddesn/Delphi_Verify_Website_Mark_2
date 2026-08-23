import { Link } from "react-router-dom";
import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
} from "@/components/ui/primitives";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { TrustScenarios } from "@/components/trust/TrustScenarios";
import { trustEngineCopy } from "@/content/trust-scenes";
import { hero, closing } from "@/content/home";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";
import { HeroDevices } from "@/components/product/HeroDevices";
import { heroPairs } from "@/components/renderings/heroScreens";
import { industryBackdrops } from "@/content/industries";
import { IndustryTiles } from "@/components/industries/IndustryTiles";
import { ctas } from "@/content/site";

/* ============================================================================
   HOME
   ============================================================================
   Three sections: say what this is, show it working, ask.

   It used to carry six more — the pattern, the trust model, business value,
   industries, the product, how it works and a trust strip — each making some
   part of the argument in prose. The trust stage now makes the whole argument
   in one piece, and it makes it better than a page of headings could: a
   reader watches the same charter run twice and sees for themselves that the
   only thing that changed was when the evidence was captured.

   None of that material is lost, with one exception. The mechanism is
   /platform and /platform/technical, and the posture is /trust — which is
   where a reader who wants the argument written down goes anyway. The
   pattern was the head of /industries until the jump tiles took that slot;
   it is still in content/home.ts, and nothing renders it now.
   ========================================================================= */

export default function Home() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────
          Deep navy ground, and the product as the hero image: the app shows
          itself rather than being illustrated with stock photography.

          Three layers behind the copy — the measured grid across the whole
          section, the sector photography anchored right, and the phone in
          front of both. This was a certificate panel in a second column; the
          phone makes the same point without asking anyone to read a panel of
          example data, and the stage below proves it properly.

          z-10 and NO overflow-hidden: the backdrop clips itself, so the
          section does not have to clip both, and a device that ever grows
          past the section can stand in front of the page rather than being
          cut off by it. An earlier version of the device block ran off the
          right edge and did need the clip — see the size note in
          HeroDevices for why it does not any more. */}
      {/* padding="none" so the pt/pb below are unopposed — a base py-* from
          sectionPadding beats a className one on source order, not intent.
          The top is the top of the page and keeps its full measure; the
          bottom is halved so all three sections are separated by the same
          distance. See the note on the trust section. */}
      <Section
        tone="inverse"
        padding="none"
        className="relative z-10 pb-12 pt-20 md:pb-16 md:pt-28"
      >
        <GridBackdrop />
        <SceneBackdrop frames={industryBackdrops} />
        <HeroDevices pairs={heroPairs} />
        <Container className="relative z-10">
          <div className="flex max-w-3xl flex-col gap-7">
            <Eyebrow>{hero.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {hero.headline}
            </h1>
            <p className="max-w-xl text-body-lg text-ink-secondary">
              {hero.standfirst}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink to={ctas.primary.href} size="lg">
                {ctas.primary.label}
              </ButtonLink>
              <ButtonLink to={ctas.secondary.href} variant="secondary" size="lg">
                {ctas.secondary.label}
              </ButtonLink>
            </div>
            <Link
              to={ctas.verify.href}
              className="flex w-fit items-center gap-2 text-body-sm text-ink-accent underline-offset-4 hover:underline"
            >
              {ctas.verify.label}
              <ArrowRight />
            </Link>
          </div>
        </Container>
      </Section>

      {/* ── TRUST ENGINE ──────────────────────────────────────────────────
          The argument, made rather than asserted. There used to be a static
          diagram stating it — two parties, one record, neither holding the
          pen — and this replaced it: a diagram claims, where this runs the
          same charter twice and lets a reader watch it hold.

          It is now the whole of the page below the hero, which is why the
          sections that used to sit between the two are gone. Anything between
          them was a reader being told the thing they are about to be shown.

          Prototype — Yachts only. The narrative is fixed in the component and
          the sector is data, so adding Property is a content change. */}
      {/* Every section here is the same tone, so the seams between them are
          invisible and read purely as empty space. At the default measure
          that was 224px of navy on either side of the stage — enough that
          the piece stopped feeling like part of the page. tight on both
          sides of every seam puts it at 128px, against 32px inside the
          header, which is the hierarchy the eye wants. */}
      <Section tone="inverse" padding="tight">
        <Container>
          <SectionHeader
            eyebrow={trustEngineCopy.eyebrow}
            headline={trustEngineCopy.headline}
            standfirst={trustEngineCopy.standfirst}
          />
          {/* Three sectors, one argument. The selector sits above the stage
              — choosing which sector to watch precedes watching it, where the
              chapter bar below chooses where to jump within it. */}
          <TrustScenarios className="mt-8" />
        </Container>
      </Section>

      {/* ── CLOSING CTA ───────────────────────────────────────────────────
          Prompts rather than a paragraph: each names a moment a buyer will
          recognise from their own operation.

          Kept when the rest of the middle went, and it earns it: the stage
          above ends on a resolution, and a reader who has just watched an
          argument get settled is the likeliest they will ever be to want to
          talk about their own. Ending on the animation would waste that. */}
      <Section tone="inverse" padding="tight" className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-16">
            <div className="flex max-w-3xl flex-col gap-6">
              <h2 className="text-display text-ink md:text-display-lg">
                {closing.headline}
              </h2>
              <ul className="flex flex-col gap-2">
                {closing.prompts.map((p) => (
                  <li key={p} className="flex gap-3 text-body-lg text-ink-secondary">
                    <span aria-hidden className="mt-3.5 h-px w-4 shrink-0 bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <ButtonLink to={closing.primary.href} size="lg">
                  {closing.primary.label}
                </ButtonLink>
                <ButtonLink to={closing.secondary.href} variant="secondary" size="lg">
                  {closing.secondary.label}
                </ButtonLink>
              </div>
            </div>

            {/* The nine sectors, as the answer to the question beside them.
                The homepage lost its industries section when the middle went,
                which left /industries reachable only from the top nav — this
                puts it back without reinstating a section of prose, and it
                does it at the one moment a reader is being asked to place
                themselves.

                Three wide, so the nine land as a square and the tenth gets a
                row of its own: "Yours?" is the tile for the reader who does
                not see their sector, and it should not be mistaken for a
                tenth sector. */}
            <div className="flex flex-col gap-3">
              <span className="font-mono text-mono-sm uppercase text-ink-muted">
                {closing.tilesLabel}
              </span>
              <IndustryTiles
                to="page"
                label="Find your industry"
                className="grid grid-cols-2 gap-3 sm:grid-cols-3"
                yoursClassName="col-span-2 sm:col-span-3"
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

/* ── Supporting visuals ─────────────────────────────────────────────────── */

/** Faint measured grid. Reinforces the "instrument of record" language
 *  without resorting to decorative gradients. */
function GridBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.18]"
      style={{
        backgroundImage:
          "linear-gradient(to right, var(--line-strong) 1px, transparent 1px)," +
          "linear-gradient(to bottom, var(--line-strong) 1px, transparent 1px)",
        backgroundSize: "72px 72px",
        maskImage: "var(--mask-hero-fade)",
        WebkitMaskImage: "var(--mask-hero-fade)",
      }}
    />
  );
}
