import { Link } from "react-router-dom";
import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
} from "@/components/ui/primitives";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import { EvidenceChip } from "@/components/evidence/Evidence";
import { PhoneShot } from "@/components/product/PhoneShot";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";
import { AppScreenCycle } from "@/components/product/AppScreenCycle";
import {
  platformHero,
  pillars,
  corroboration,
  privacyLevels,
  sectorStrip,
  technicalLink,
  platformCta,
  platformScreens,
} from "@/content/platform";
import { industryBackdrops, industryShortcuts } from "@/content/industries";
import { cn } from "@/lib/cn";

/* ============================================================================
   PLATFORM — OVERVIEW  (/platform)
   ============================================================================
   Six pillars, a few hundred words, one link to the mechanism.

   This page used to carry the entire five-stage technical model — several
   thousand words of implementation detail. That reads as "look how many
   mechanisms we have"; this reads as "we understand the assurance problem
   architecturally, and you do not need to follow every mechanism in order to
   rely on it". The detail is not lost, it is one click away at
   /platform/technical for the people who actually need it.

   The corroboration pillar carries extra structure because it is the platform
   argument AND the honesty risk: what corroborates today is separated from
   what the model is designed to accept, and the second group is explicitly
   marked as direction. See the header of platform.ts.
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

      {/* ── The six pillars ── */}
      <Section>
        <Container>
          <div className="flex flex-col">
            {pillars.map((p) => (
              <article
                key={p.id}
                id={p.id}
                className="scroll-mt-20 grid gap-6 border-t border-line py-10 lg:grid-cols-[0.55fr_1fr] lg:gap-16 lg:py-12"
              >
                <div className="flex flex-col gap-3">
                  <span className="font-mono text-mono-sm uppercase text-ink-muted">
                    {p.n}
                  </span>
                  <h2 className="text-heading text-ink">{p.title}</h2>
                  {p.status === "direction" && (
                    <EvidenceChip
                      state="pending"
                      label="Development direction"
                      className="w-fit"
                    />
                  )}
                </div>

                <div className="flex flex-col gap-4">
                  {p.body.map((b) => (
                    <p key={b.slice(0, 28)} className="text-body-lg text-ink-secondary">
                      {b}
                    </p>
                  ))}

                  {/* Corroboration carries the platform argument, so it gets
                      the extra structure — and the honest split. */}
                  {p.id === "corroboration" && <CorroborationDetail />}

                  {p.id === "privacy" && (
                    <ul className="mt-2 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
                      {privacyLevels.map((l) => (
                        <li key={l.level} className="flex flex-col gap-1.5 bg-surface p-4">
                          <span className="font-mono text-mono-sm uppercase text-ink-accent">
                            {l.level}
                          </span>
                          <span className="text-body-sm text-ink-secondary">
                            {l.body}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {p.id === "passports" && (
                    <ol className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                      {["Condition", "Handover", "Incident", "Repair", "Inspection", "Sale"].map(
                        (step, i, arr) => (
                          <li key={step} className="flex items-center gap-3">
                            <span className="font-mono text-mono-sm uppercase text-ink-muted">
                              {step}
                            </span>
                            {i < arr.length - 1 && (
                              <span aria-hidden className="h-px w-4 bg-line-strong" />
                            )}
                          </li>
                        ),
                      )}
                    </ol>
                  )}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── What verification actually looks like ── */}
      <Section tone="sunken">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
            <div className="flex flex-col gap-5">
              <Eyebrow>{technicalLink.eyebrow}</Eyebrow>
              <h2 className="text-display text-ink">{technicalLink.headline}</h2>
              <p className="text-body-lg text-ink-secondary">{technicalLink.body}</p>
              <div className="mt-2">
                <ButtonLink to={technicalLink.href} variant="secondary">
                  {technicalLink.label}
                  <ArrowRight />
                </ButtonLink>
              </div>
            </div>
            <PhoneShot
              name="certificate"
              alt="A published certificate showing its evidence, verification status and blockchain anchor"
              className="mx-auto lg:mx-0"
            />
          </div>
        </Container>
      </Section>

      {/* ── One platform, many industries ── */}
      <Section tone="inverse">
        <Container>
          <SectionHeader headline={sectorStrip.headline} />
          <ul className="mt-12 flex flex-wrap gap-3">
            {industryShortcuts.map((s) => (
              <li key={s.id}>
                <Link
                  to={`/industries#${s.id}`}
                  className={cn(
                    "block rounded-md border border-line bg-surface-raised px-4 py-2.5",
                    "font-mono text-mono-sm uppercase text-ink",
                    "transition-colors hover:border-line-strong hover:text-ink-accent",
                  )}
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── Close ── */}
      <Section>
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="text-display text-ink">{platformCta.headline}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ButtonLink to={platformCta.primary.href} size="lg">
                {platformCta.primary.label}
                <ArrowRight />
              </ButtonLink>
              <Link
                to={platformCta.secondary.href}
                className="text-body text-ink-secondary underline-offset-4 hover:text-ink-accent hover:underline"
              >
                {platformCta.secondary.label} →
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

/* Live signals and sector signals are visually distinct on purpose. The second
   group is architecture, not inventory — every entry is `available: false` in
   platform-technical.ts, and a reader must not be able to mistake the two. */
function CorroborationDetail() {
  return (
    <div className="mt-2 flex flex-col gap-8">
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

      <div className="flex flex-col gap-3 border-t border-line-strong pt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-mono-sm uppercase text-ink-muted">
            {corroboration.sectorLabel}
          </span>
          <EvidenceChip state="pending" label="Development direction" />
        </div>
        <p className="max-w-2xl text-body-sm text-ink-secondary">
          {corroboration.sectorNote}
        </p>
        <ul className="mt-2 flex flex-col gap-px overflow-hidden rounded-md border border-dashed border-line">
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
              <span className="text-body-sm text-ink-muted">{s.signal}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
