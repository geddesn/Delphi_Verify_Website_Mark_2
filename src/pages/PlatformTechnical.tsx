import { Link } from "react-router-dom";
import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
  Card,
} from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { EvidenceChip } from "@/components/evidence/Evidence";
import { PhoneShot } from "@/components/product/PhoneShot";
import {
  technicalHero,
  stages,
  signals,
  roadmapNote,
  locationPrivacy,
  deployment,
} from "@/content/platform-technical";
import { closing } from "@/content/home";

/* ============================================================================
   PLATFORM — TECHNICAL MODEL  (/platform/technical)
   ============================================================================
   The depth page. /platform states the assurance proposition in a few hundred
   words and links here; this carries the mechanism for the reader who needs
   it — security review, architecture, technical procurement.

   Every stage keeps its own anchor id, so existing deep links into the model
   still resolve after the split.
   ========================================================================= */

export default function PlatformTechnical() {
  const shipped = signals.filter((s) => s.available);
  const roadmap = signals.filter((s) => !s.available);

  return (
    <>
      <Section tone="inverse">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{technicalHero.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {technicalHero.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {technicalHero.standfirst}
            </p>
            <Link
              to="/platform"
              className="mt-2 w-fit font-mono text-mono-sm uppercase text-ink-accent underline-offset-4 hover:underline"
            >
              ← {technicalHero.backLabel}
            </Link>
          </div>
        </Container>
      </Section>

      {/* Full five-stage model, each stage anchored for deep-linking. */}
      {stages.map((stage, i) => (
        <Section
          key={stage.id}
          id={stage.id}
          tone={i % 2 === 0 ? "default" : "sunken"}
          className="scroll-mt-20"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="flex flex-col gap-4">
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  Stage {stage.n}
                </span>
                <h2 className="text-display text-ink">{stage.title}</h2>
                <p className="text-body-lg text-ink-secondary">{stage.summary}</p>
              </div>
              <div className="flex flex-col gap-5 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                {stage.detail.map((p) => (
                  <p key={p.slice(0, 28)} className="text-body text-ink-secondary">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </Container>
        </Section>
      ))}

      {/* Shipped vs roadmap, stated explicitly rather than blurred. */}
      <Section tone="inverse">
        <Container>
          <SectionHeader
            eyebrow="Corroborating signals"
            headline="No single signal is trusted on its own."
            standfirst="Delphi accepts evidence only when several independent checks agree. Which signals are available differs by asset class — and that is the difference between a verification platform and a camera application."
          />

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shipped.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-2 rounded-md border border-line bg-surface-raised p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-body-sm font-semibold text-ink">{s.label}</h3>
                  <EvidenceChip state="verified" label="Live" />
                </div>
                <p className="text-caption text-ink-muted">{s.note}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-line-strong pt-8">
            <h3 className="text-subheading text-ink">{roadmapNote.headline}</h3>
            <p className="mt-3 max-w-2xl text-body-sm text-ink-secondary">
              {roadmapNote.body}
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {roadmap.map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-2 rounded-md border border-dashed border-line p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-body-sm font-semibold text-ink-muted">
                      {s.label}
                    </h4>
                    <EvidenceChip state="pending" label="Roadmap" />
                  </div>
                  <p className="text-caption text-ink-muted">{s.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Location privacy — mechanism and limits. */}
      <Section id="privacy" className="scroll-mt-20">
        <Container>
          <SectionHeader
            eyebrow={locationPrivacy.eyebrow}
            headline={locationPrivacy.headline}
            standfirst={locationPrivacy.standfirst}
          />
          <div className="mt-14 grid items-start gap-12 lg:grid-cols-[1fr_auto] lg:gap-20">
            <div>
              <div className="grid gap-6 sm:grid-cols-3">
                {locationPrivacy.levels.map((l) => (
                  <Card key={l.level} className="flex flex-col gap-3">
                    <span className="font-mono text-mono-sm uppercase text-ink-accent">
                      {l.level}
                    </span>
                    <p className="text-body-sm text-ink-secondary">{l.body}</p>
                  </Card>
                ))}
              </div>
              <p className="mt-8 border-l-2 border-accent pl-6 text-body text-ink-secondary">
                {locationPrivacy.note}
              </p>
            </div>
            <PhoneShot
              name="certificate-location"
              alt="A certificate's capture location on a map, with coordinates, an accuracy reading in metres and the resolved address"
              className="mx-auto lg:mx-0"
            />
          </div>
        </Container>
      </Section>

      {/* Deployment — split honestly into available and not-yet. */}
      <Section id="deployment" tone="sunken" className="scroll-mt-20">
        <Container>
          <SectionHeader
            eyebrow={deployment.eyebrow}
            headline={deployment.headline}
            standfirst={deployment.standfirst}
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line md:grid-cols-2">
            {deployment.points.map((p) => (
              <div key={p.title} className="flex flex-col gap-3 bg-surface p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-subheading text-ink">{p.title}</h3>
                  <EvidenceChip
                    state={p.available ? "verified" : "pending"}
                    label={p.available ? "Available" : "Not yet"}
                  />
                </div>
                <p className="text-body-sm text-ink-secondary">{p.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-body-sm text-ink-muted">{deployment.note}</p>
        </Container>
      </Section>

      <Section tone="inverse">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="text-display text-ink">{closing.headline}</h2>
            <ul className="flex flex-col gap-2">
              {closing.prompts.map((p) => (
                <li key={p} className="flex gap-3 text-body-lg text-ink-secondary">
                  <span aria-hidden className="mt-3.5 h-px w-4 shrink-0 bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-2">
              <ButtonLink to={closing.primary.href} size="lg">
                {closing.primary.label}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
