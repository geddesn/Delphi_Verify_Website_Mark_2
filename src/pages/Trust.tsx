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
import { InfraLogo, CertificationMark } from "@/components/trust/InfrastructureLogos";
import type { EvidenceState } from "@/components/evidence/Evidence";
import {
  trustHero,
  pillars,
  compliance,
  complianceNote,
  infrastructure,
  legalDocs,
  securityContact,
  type ComplianceStatus,
} from "@/content/trust";
import { locationPrivacy } from "@/content/platform-technical";
import { industryBackdrops } from "@/content/industries";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";

/* Status presentation is deliberately unflattering where it should be.
   "Planned" renders as pending, not as a soft green tick. */
const statusPresentation: Record<
  ComplianceStatus,
  { state: EvidenceState; label: string }
> = {
  certified: { state: "verified", label: "Certified" },
  /* Not a green "COMPLIANT" tick. Compliance with a legal obligation is not a
     certification anybody awarded us, and a self-awarded badge next to a real
     one invites the reader to treat them as equivalent. */
  compliant: { state: "pending", label: "Legal obligation met" },
  "pending-certification": { state: "pending", label: "Awaiting certification" },
  "in-progress": { state: "pending", label: "Audit in progress" },
  aligned: { state: "pending", label: "Aligned, not certified" },
  /* Still honest, but "Not started" as a red failure read as an alarm about
     the product rather than a factual statement about an assessment. */
  "not-started": { state: "pending", label: "Not currently certified" },
};

export default function Trust() {
  return (
    <>
      <Section tone="inverse" className="relative">
        <SceneBackdrop frames={industryBackdrops} />
        <Container className="relative z-10">
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{trustHero.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {trustHero.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {trustHero.standfirst}
            </p>
          </div>
        </Container>
      </Section>

      {/* Compliance first — it is what a procurement reviewer opens this page
          to find, and burying it would be its own kind of evasion. */}
      <Section id="compliance" className="scroll-mt-20">
        <Container>
          <SectionHeader
            eyebrow="Compliance status"
            headline="Where we actually stand."
          />
          <div className="mt-12 flex flex-col gap-px overflow-hidden rounded-lg border border-line bg-line">
            {compliance.map((c) => {
              const p = statusPresentation[c.status];
              return (
                <div
                  key={c.framework}
                  className="flex flex-col gap-3 bg-surface p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
                >
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-subheading text-ink">{c.framework}</h3>
                    <p className="max-w-2xl text-body-sm text-ink-secondary">
                      {c.statement}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    {/* Renders nothing unless the row is genuinely certified
                        AND carries a mark. That gate is the point: a badge
                        beside a "readiness" statement is what the previous
                        site did, and it asserted a certification we do not
                        hold. */}
                    <CertificationMark
                      status={c.status}
                      mark={c.mark}
                      framework={c.framework}
                    />
                    <EvidenceChip state={p.state} label={p.label} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 max-w-3xl border-l-2 border-accent pl-6">
            <h3 className="text-subheading text-ink">{complianceNote.headline}</h3>
            <p className="mt-2 text-body text-ink-secondary">{complianceNote.body}</p>
          </div>

          {/* ── Infrastructure attributions ──────────────────────────────
              Deliberately placed AFTER the compliance table, and visually
              distinct from it. These are technology marks, and a reviewer
              must never be able to mistake them for certification badges —
              which is precisely the confusion the old company page created
              by putting ISO and SOC 2 seals in a row of logos. */}
          <div className="mt-16 border-t border-line-strong pt-12">
            <div className="flex flex-col gap-4">
              <Eyebrow>{infrastructure.eyebrow}</Eyebrow>
              <h3 className="max-w-2xl text-display text-ink">
                {infrastructure.headline}
              </h3>
              <p className="max-w-2xl text-body-lg text-ink-secondary">
                {infrastructure.standfirst}
              </p>
            </div>

            <ul className="mt-10 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
              {infrastructure.items.map((item) => (
                <li key={item.name} className="flex gap-4 bg-surface p-6">
                  <InfraLogo name={item.logo} label={item.name} />
                  <div className="flex min-w-0 flex-col gap-1.5">
                    <h4 className="text-body font-semibold text-ink">{item.name}</h4>
                    <p className="text-body-sm text-ink-secondary">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 max-w-3xl text-body-sm text-ink-muted">
              {infrastructure.note}
            </p>
          </div>
        </Container>
      </Section>

      {/* The four pillars. */}
      {pillars.map((pillar, i) => (
        <Section
          key={pillar.id}
          id={pillar.id}
          tone={i % 2 === 0 ? "sunken" : "default"}
          className="scroll-mt-20"
        >
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div className="flex flex-col gap-4">
                <h2 className="text-display text-ink">{pillar.title}</h2>
                <p className="text-body-lg text-ink-secondary">{pillar.summary}</p>
              </div>
              <dl className="flex flex-col">
                {pillar.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col gap-1.5 border-t border-line py-5 first:border-t-0 first:pt-0 sm:flex-row sm:gap-8"
                  >
                    <dt className="shrink-0 text-body-sm font-semibold text-ink sm:w-56">
                      {item.label}
                    </dt>
                    <dd className="text-body-sm text-ink-secondary">{item.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Container>
        </Section>
      ))}

      {/* Location privacy is reused from the platform content — one source,
          two placements, no divergent copy to maintain. */}
      <Section id="location-privacy" className="scroll-mt-20" tone="inverse">
        <Container>
          <SectionHeader
            eyebrow={locationPrivacy.eyebrow}
            headline={locationPrivacy.headline}
            standfirst={locationPrivacy.standfirst}
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {locationPrivacy.levels.map((l) => (
              <Card key={l.level} className="flex flex-col gap-3">
                <span className="font-mono text-mono-sm uppercase text-ink-accent">
                  {l.level}
                </span>
                <p className="text-body-sm text-ink-secondary">{l.body}</p>
              </Card>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-body text-ink-secondary">
            {locationPrivacy.note}
          </p>
        </Container>
      </Section>

      {/* Legal documents + security contact. */}
      <Section tone="sunken">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-6">
              <SectionHeader eyebrow="Legal" headline="Documents." />
              <ul className="flex flex-col">
                {legalDocs.map((d) => (
                  <li key={d.label} className="border-t border-line py-4">
                    <Link
                      to={d.href}
                      className="flex items-baseline justify-between gap-4 group"
                    >
                      <span className="text-body text-ink group-hover:underline underline-offset-4">
                        {d.label}
                      </span>
                      <span className="text-right text-caption text-ink-muted">
                        {d.note}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <SectionHeader
                eyebrow="Disclosure"
                headline={securityContact.headline}
              />
              <p className="text-body text-ink-secondary">{securityContact.body}</p>
              <a
                href={`mailto:${securityContact.email}`}
                className="w-fit font-mono text-mono text-ink-accent underline-offset-4 hover:underline"
              >
                {securityContact.email}
              </a>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="text-display text-ink">
              Need documentation for a security review?
            </h2>
            <p className="text-body-lg text-ink-secondary">
              Tell us what your review process requires and we will provide what
              we have — including being straightforward about anything we do not.
            </p>
            <div className="mt-2">
              <ButtonLink to="/contact" size="lg">
                Request security documentation
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
