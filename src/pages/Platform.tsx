import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
} from "@/components/ui/primitives";
import { ArrowRight } from "@/components/ui/Button";
import { EvidenceChip } from "@/components/evidence/Evidence";
import { EventIcon, type EventName } from "@/components/product/EventIcon";
import { PhoneShot, type ShotName } from "@/components/product/PhoneShot";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";
import { AppScreenCycle } from "@/components/product/AppScreenCycle";
import {
  platformHero,
  howItWorks,
  moreThanAPhotograph,
  moments,
  signals,
  corroboration,
  platformScreens,
} from "@/content/platform";
import { industryBackdrops, outcomes } from "@/content/industries";

/* ============================================================================
   PLATFORM — OVERVIEW  (/platform)
   ============================================================================
   MID-REWRITE. Four sections, built one at a time:

     hero                      what this is
     From capture to a…        what the product does
     More than a photograph    why the evidence is different
     Built for the moments…    where that difference is worth money

   Four more used to follow — six assurance pillars, a link across to the
   technical model, a strip of industry links and a closing CTA. They were
   removed deliberately and at once rather than edited in place: the pillars
   restated section two under the same four names, and leaving them there
   while the new argument was written around them would have meant reasoning
   about a page that was making its case twice.

   None of that copy is lost. It is still exported from content/platform.ts,
   marked as no longer rendered, and it is the source material for whatever
   replaces it. `corroboration` is also read by /industries, so it stays
   whatever happens here.

   The site footer is a layout component and was never part of this file.
   ========================================================================= */

export default function Platform() {
  return (
    <>
      {/* `isolate` gives the backdrop a stacking context to sit behind without
          escaping the section; `overflow-hidden` keeps the masked image inside
          it when the viewport is narrower than the image.

          TEMPORARY: borrowing the industries frames. Platform should get its
          own set — see platformBackdrops in content/platform.ts. */}
      <Section tone="inverse" className="relative z-10">
        <SceneBackdrop frames={industryBackdrops} />
        <AppScreenCycle shots={platformScreens} />
        <Container className="relative z-10">
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{platformHero.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {platformHero.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {platformHero.standfirst}
            </p>
            <p className="max-w-2xl border-l-2 border-accent pl-6 text-body text-ink-secondary">
              {platformHero.body}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── How it works ──
          The product, made tangible. Everything else on this page argues
          about assurance; this shows a system — someone standing in front of
          an asset, and a counterparty who later has to rely on what they
          saw. It sits directly under the hero because a reader cannot judge
          the assurance argument until they know what the thing is.

          Sunken, between the inverse hero and the pillars on canvas, so the
          three sections read as three distinct registers rather than one
          long scroll. */}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={howItWorks.eyebrow}
            headline={howItWorks.headline}
            standfirst={howItWorks.standfirst}
          />

          {/* An ordered list, because it is one. The three stages happen in
              sequence and each depends on the one before it — which is also
              why the arrows are here rather than being decoration. */}
          {/* SUBGRID, so the three columns line up on their own rows.
              The stage names are one line, two lines and one line, and their
              descriptions are one, two and two — so laid out independently
              each column's copy started and its points began at a different
              height, and three columns of the same thing read as three
              unrelated things. Each stage now spans the outer grid's rows
              instead of laying out its own, which pins the device, the copy
              block and the points to shared baselines. */}
          <ol className="mt-14 grid gap-14 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto] lg:gap-x-8 lg:gap-y-7">
            {howItWorks.stages.map((stage, i) => (
              /* Anchored. The footer links to /platform#capture and
                 /platform#verify, and until these ids existed both landed at
                 the top of the page — #capture matched a pillar that has
                 since gone, and #verify never matched anything at all. */
              <li
                key={stage.id}
                id={stage.id}
                className="scroll-mt-20 flex flex-col gap-7 lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-0"
              >
                {/* The phone is held to 240px rather than PhoneShot's own
                    340px, in a wrapper rather than by passing a class: cn()
                    joins, it does not merge, so a second max-w-* would leave
                    the winner to stylesheet order. See src/lib/cn.ts.

                    `relative` so the arrow can hang off its left edge and be
                    centred on the device without a magic offset. */}
                <div className="relative mx-auto w-full max-w-[240px]">
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="absolute right-full top-1/2 hidden -translate-y-1/2 pr-5 text-ink-muted lg:block"
                    >
                      <ArrowRight />
                    </span>
                  )}
                  <PhoneShot name={stage.shot as ShotName} alt={stage.shotAlt} />
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="font-mono text-mono-sm uppercase text-ink-muted">
                    {stage.n}
                  </span>
                  {/* The stage NAME is the heading, so the document outline
                      reads Capture / Create the evidence record / Verify —
                      which is the process. The line under it says what the
                      stage does, and is not a second heading competing with
                      it. */}
                  <h3 className="text-heading text-ink">{stage.kicker}</h3>
                  <p className="text-subheading text-ink-secondary">
                    {stage.title}
                  </p>
                  <p className="mt-1 text-body text-ink-secondary">{stage.body}</p>
                </div>

                {/* A definition list: each supporting point is a named thing
                    and its explanation, which is exactly what dt/dd are. */}
                <dl className="flex flex-col gap-4 border-t border-line pt-5">
                  {stage.points.map((point) => (
                    <div key={point.label} className="flex flex-col gap-1">
                      <dt className="text-body-sm font-semibold text-ink">
                        {point.label}
                      </dt>
                      <dd className="text-body-sm text-ink-secondary">
                        {point.body}
                      </dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ol>

          {/* ── The assurance model, in four words ──
              Deliberately secondary. The three stages above are what a
              customer uses; this is why the result can be relied on, and it
              is four words rather than four paragraphs because the four
              paragraphs are immediately below it.

              Each word links to its pillar. The pillars carry the same four
              names, so a strip that only repeated them would be duplication
              — one that navigates to them is a contents page. */}
          <div className="mt-16 border-t border-line-strong pt-10">
            <p className="font-mono text-mono-sm uppercase text-ink-muted">
              {howItWorks.assurance.label}
            </p>
            <ol className="mt-6 grid gap-x-6 gap-y-7 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.assurance.steps.map((step, i, all) => (
                <li key={step.label} className="relative flex flex-col gap-1.5">
                  {/* NOT LINKS. These four used to jump to the four pillars
                      that expanded them, and the pillars have gone with the
                      rest of the page. Rather than invent targets for three
                      of the four, they are what they always read as: a
                      four-word summary of the assurance model, which the
                      section below then makes the argument for. Re-link them
                      if the rewrite gives them somewhere to go. */}
                  <p className="flex w-fit items-center gap-2 font-mono text-mono-sm uppercase text-ink">
                    {step.label}
                    {/* Between the words, not after the last one — the
                        sequence ends at Verify. Hidden below lg, where the
                        grid wraps to two columns and an arrow would point at
                        the wrong neighbour. */}
                    {i < all.length - 1 && (
                      <span aria-hidden className="hidden text-ink-muted lg:inline">
                        →
                      </span>
                    )}
                  </p>
                  <p className="text-body-sm text-ink-secondary">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </Section>


      {/* ── More than a photograph ──
          The question every customer arrives with, answered commercially
          rather than technically. A reader should be able to take the whole
          section in without reading a sentence: the comparison carries it,
          the hub explains why it holds, and the strip says why it is a
          platform rather than a camera.

          Canvas, between the sunken section above and whatever the rewrite
          puts below, so the sunken column inside the comparison reads as
          recessed rather than as another band of the page. */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow={moreThanAPhotograph.eyebrow}
            headline={moreThanAPhotograph.headline}
          />
          <div className="mt-5 flex max-w-2xl flex-col gap-4">
            {moreThanAPhotograph.standfirst.map((line) => (
              <p key={line.slice(0, 24)} className="text-body-lg text-ink-secondary">
                {line}
              </p>
            ))}
          </div>

          {/* ── The comparison ──
              ONE grid, not two columns of cards. The pairing is the whole
              argument — row three on the left is answered by row three on
              the right — and two independently laid out lists go out of
              alignment the moment one line wraps and its opposite number
              does not. Grid siblings share a row height for free.

              The left column is recessed and muted, the right is on the
              page's own surface. No red, no crosses, no green ticks: an
              ordinary photograph has not failed a verification, it simply
              never had one, and on this site the evidence palette means
              something specific. */}
          <div className="mt-14 overflow-hidden rounded-lg border border-line">
            <div className="grid grid-cols-2">
              <p className="bg-surface-sunken px-4 py-3 font-mono text-mono-sm uppercase text-ink-muted sm:px-6">
                {moreThanAPhotograph.compare.plainLabel}
              </p>
              <p className="bg-surface px-4 py-3 font-mono text-mono-sm uppercase text-ink-accent sm:px-6">
                {moreThanAPhotograph.compare.delphiLabel}
              </p>

              {moreThanAPhotograph.compare.rows.map((row) => (
                <Fragment key={row.delphi.title}>
                  <div className="flex flex-col gap-1.5 border-t border-line bg-surface-sunken px-4 py-5 sm:px-6">
                    <p className="text-body-sm font-semibold text-ink-muted sm:text-body">
                      {row.plain.title}
                    </p>
                    <p className="text-caption text-ink-muted sm:text-body-sm">
                      {row.plain.body}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 border-t border-line bg-surface px-4 py-5 sm:px-6">
                    <p className="text-body-sm font-semibold text-ink sm:text-body">
                      {row.delphi.title}
                    </p>
                    <p className="text-caption text-ink-secondary sm:text-body-sm">
                      {row.delphi.body}
                    </p>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>

          {/* ── The corroboration model ──
              Anchored, because the footer's "Evidence corroboration" link
              points here. It used to point at /platform#corroborate, which
              has never been an id on this page — the pillar it was aiming at
              was #corroboration. */}
          <div id="corroboration" className="mt-20 scroll-mt-20">
            <div className="flex max-w-2xl flex-col gap-4">
              <h3 className="text-display text-ink">
                {moreThanAPhotograph.model.headline}
              </h3>
              <p className="text-body-lg text-ink-secondary">
                {moreThanAPhotograph.model.body}
              </p>
            </div>

            {/* Three signals, the certificate they produce, three more.
                A ring would be the obvious drawing and it is the wrong one:
                six nodes on a circle either carry a label and no question,
                or become unreadable below a desktop width. Split either side
                of the thing they feed, each node keeps its question and the
                whole diagram reflows to one column without redrawing. */}
            <p className="mt-12 font-mono text-mono-sm uppercase text-ink-muted">
              {moreThanAPhotograph.model.signalsLabel}
            </p>

            <ul className="mt-5 grid gap-4 sm:grid-cols-3">
              {signals.slice(0, 3).map((signal) => (
                <SignalNode key={signal.label} signal={signal} spur="below" />
              ))}
            </ul>

            <div className="flex items-center justify-center gap-3 rounded-md border-2 border-accent bg-surface-accent px-6 py-4 text-center">
              <span className="font-mono text-mono uppercase tracking-wide text-ink">
                {moreThanAPhotograph.model.hub}
              </span>
            </div>

            <ul className="grid gap-4 sm:grid-cols-3">
              {signals.slice(3).map((signal) => (
                <SignalNode key={signal.label} signal={signal} spur="above" />
              ))}
            </ul>
          </div>

          {/* ── Asset-specific corroboration ──
              ONE direction chip, on the heading, and one qualifying sentence
              — not a marker against every line. Five roadmap chips in a row
              make a shipped platform look like a plan.

              ⚠️  The chip and the sentence are both load-bearing. Every
              signal below is `available: false` in platform-technical.ts,
              and this is the only thing on the page saying so. */}
          <div className="mt-16 rounded-lg border border-line bg-surface-sunken p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
              <h3 className="text-heading text-ink">
                {moreThanAPhotograph.asset.headline}
              </h3>
              <EvidenceChip state="pending" label="Development direction" />
            </div>

            {/* Dashed rules rather than solid: the same quiet signal the
                sector list on /industries uses for the same list. */}
            <ul className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              {corroboration.bySector.map((sector) => (
                <li
                  key={sector.sector}
                  className="flex flex-col gap-1.5 border-t border-dashed border-line-strong pt-3"
                >
                  <span className="font-mono text-mono-sm uppercase text-ink-muted">
                    {sector.sector}
                  </span>
                  <span className="text-body-sm text-ink-secondary">
                    {sector.signal}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-7 max-w-2xl text-body-sm text-ink-secondary">
              {moreThanAPhotograph.asset.note}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── Built for the moments where physical reality matters ──
          The shortest section on the page, on purpose. Section three argued
          why the evidence is different; this only has to say where that
          difference turns into money, then get out of the way and hand off
          to /industries. */}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={moments.eyebrow}
            headline={moments.headline}
            standfirst={moments.standfirst}
          />

          {/* Eight moments, four across. NO ARROWS between them: these are
              alternatives, not stages — a claim does not follow an
              inspection — and this page already spends its arrows on the one
              thing that really is a sequence, at the foot of section two.

              A UL rather than an OL for the same reason. */}
          <ul className="mt-12 grid gap-x-8 gap-y-9 sm:grid-cols-2 lg:grid-cols-4">
            {moments.events.map((event) => (
              <li key={event.label} className="flex flex-col gap-2.5">
                <EventIcon
                  name={event.icon as EventName}
                  className="h-6 w-6 text-ink-accent"
                />
                <h3 className="text-subheading text-ink">{event.label}</h3>
                <p className="text-body-sm text-ink-secondary">{event.body}</p>
              </li>
            ))}
          </ul>

          {/* ── What that is worth ──
              The company-wide value framework, which already existed in
              content/industries.ts and is rendered here rather than being
              written a second time. It came off /industries when the
              abstract version of this section did; the per-sector tags that
              are typed against it never went anywhere. */}
          <div className="mt-20 border-t border-line-strong pt-12">
            <div className="flex max-w-2xl flex-col gap-4">
              <h3 className="text-display text-ink">{moments.value.headline}</h3>
              <p className="text-body-lg text-ink-secondary">
                {moments.value.body}
              </p>
            </div>

            <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {outcomes.map((outcome) => (
                <li
                  key={outcome.id}
                  className="flex flex-col gap-2 bg-surface p-6"
                >
                  <h4 className="text-subheading text-ink">{outcome.label}</h4>
                  <p className="text-body-sm text-ink-secondary">
                    {outcome.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Handoff ──
              A link, not a summary. /industries carries nine sectors in
              detail and section three above already lists the per-sector
              corroboration signals; naming them a third time here is how a
              page starts arguing with itself. */}
          <div className="mt-16 flex flex-col gap-5 rounded-lg border border-line bg-surface p-6 shadow-raised sm:p-8">
            <h3 className="max-w-2xl text-heading text-ink">
              {moments.industries.headline}
            </h3>
            <p className="max-w-2xl text-body text-ink-secondary">
              {moments.industries.body}
            </p>
            <Link
              to={moments.industries.href}
              className="flex w-fit items-center gap-2 text-body text-ink-accent underline-offset-4 hover:underline"
            >
              {moments.industries.label}
              <ArrowRight />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
}

/** One signal feeding the certificate.
 *
 *  The spur is a hairline, on the side facing the hub, and it is what turns
 *  six cards and a bar into a diagram. `flex-1` on the card matters more
 *  than it looks: grid items stretch to their row, so without it the three
 *  cards in a row end at different heights and their spurs start at three
 *  different places.
 *
 *  Hidden below sm, where the grid is one column and every card would carry
 *  a stub of line pointing at the card beneath it. */
function SignalNode({
  signal,
  spur,
}: {
  signal: { label: string; question: string; image: string };
  spur: "above" | "below";
}) {
  const rule = (
    <span
      aria-hidden
      className="mx-auto hidden h-5 w-px shrink-0 bg-line-strong sm:block"
    />
  );
  return (
    <li className="flex flex-col">
      {spur === "above" && rule}
      {/* `overflow-hidden` so the picture is clipped by the card's own
          corners — it sits flush to three edges rather than being inset,
          which is how every other photograph on this site meets a panel. */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-md border border-line bg-surface shadow-raised">
        {/* flex-1 on the TEXT, so the pictures line up across a row however
            long the questions run. Without it a two-line question and a
            three-line one push their images to different heights and six
            cards stop reading as one row. */}
        <div className="flex flex-1 flex-col gap-1.5 p-4">
          <p className="font-mono text-mono-sm uppercase text-ink-accent">
            {signal.label}
          </p>
          <p className="text-body-sm text-ink-secondary">{signal.question}</p>
        </div>
        {/* DECORATIVE, and marked so. These are abstract objects — a
            monolith, an iris, a stack of plates — and describing one to a
            screen reader would be reading out a still life in the middle of
            a list of what gets checked. The label and question above carry
            the whole meaning. */}
        <img
          aria-hidden
          alt=""
          src={`/assets/features/${signal.image}-320.webp`}
          srcSet={`/assets/features/${signal.image}-320.webp 320w, /assets/features/${signal.image}-640.webp 640w`}
          sizes="(min-width: 640px) 320px, 90vw"
          width={906}
          height={510}
          loading="lazy"
          decoding="async"
          className="block w-full"
          style={{ aspectRatio: "16 / 9" }}
        />
      </div>
      {spur === "below" && rule}
    </li>
  );
}
