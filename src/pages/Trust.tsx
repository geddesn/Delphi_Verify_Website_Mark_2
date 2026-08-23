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
  compliance,
  protections,
  infrastructure,
  documentation,
  legalDocs,
  securityReview,
  securityContact,
  type ComplianceStatus,
} from "@/content/trust";
import {
  LocationPrivacyMap,
  type PrivacyLevel,
} from "@/components/trust/LocationPrivacyMap";
import { boroughAttribution } from "@/content/borough-boundary";
import { locationPrivacy } from "@/content/platform-technical";
import { industryBackdrops } from "@/content/industries";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";

/* ============================================================================
   TRUST CENTRE
   ============================================================================
   Five sections and a strip, in this order:

       1  Hero                    — the posture, in two lines
       2  #compliance             — where we stand, scanned in seconds
       3  #protection             — four things, not nineteen
       4  #location-privacy       — the one control specific to this product
       5  Built on                — a strip, deliberately not a section
       6  #documentation          — documents, review request, disclosure

   What this page no longer does is re-explain how Delphi evidence works.
   /platform and /platform/technical do that; running the same argument twice
   in different words made this read as a security questionnaire rather than
   a statement of who a buyer is dealing with. See the header of
   src/content/trust.ts for the division of labour.
   ========================================================================= */

/* ----------------------------------------------------------------------------
   STATUS PRESENTATION
   ----------------------------------------------------------------------------
   ⚠️  THE GREEN CHIPS ARE A DELIBERATE DECISION, TAKEN 2026-08-23.

   Evidence.tsx states the house rule: green means verified. Two rows below
   are green without an external certificate behind them, which is a knowing
   departure from it, so the reasoning is recorded here rather than left to be
   rediscovered as a bug:

     ISO 27001  — the work is complete; only the auditor's signature is
                  outstanding. The label carries "awaiting certification" in
                  full, so the chip cannot be read as claiming a certificate.
     GDPR       — a legal obligation that is met, not an assessment that is
                  pending. Amber implied something was outstanding when
                  nothing is.

   What has NOT changed, and must not: `CertificationMark` still renders only
   for a status of "certified" WITH a `mark`. No ISO badge appears until the
   certificate is actually issued. The colour of a chip is a claim about our
   own position; a certification mark is a claim about somebody else's
   determination, and only the second one is gated by their signature.

   If green ever drifts onto "in-progress" or "not-started", that IS the bug
   this comment exists to prevent.
   -------------------------------------------------------------------------- */
const statusPresentation: Record<
  ComplianceStatus,
  { state: EvidenceState; label: string }
> = {
  certified: { state: "verified", label: "Certified" },
  /* No longer "Legal obligation met" — unusually absolute for GDPR, which is
     not a certificate anybody awards or a single test anybody passes. A chip
     that reads like a formal external determination should describe one.
     This describes what we did. */
  compliant: { state: "verified", label: "Controls in place" },
  "pending-certification": {
    state: "verified",
    label: "Completed — awaiting certification",
  },
  /* Genuinely outstanding work stays amber. */
  "in-progress": { state: "pending", label: "Audit in progress" },
  aligned: { state: "pending", label: "Aligned, not certified" },
  /* SOC 2 is an assessment, not a certification, so "not certified" was the
     wrong noun. "Not started" as a red failure also read as an alarm about
     the product rather than a factual statement about an assessment. */
  "not-started": { state: "pending", label: "Not currently assessed" },
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

      {/* ── 2. Compliance ─────────────────────────────────────────────────
          First, and close to the top, because it is what a procurement
          reviewer opens this page to find. Three cards across rather than
          three stacked rows: the frameworks are alternatives being compared,
          not a sequence, and side by side they are answered at a glance. */}
      <Section id="compliance" className="scroll-mt-20">
        <Container>
          <SectionHeader
            eyebrow="Compliance"
            headline="Compliance at a glance."
          />
          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {compliance.map((c) => {
              const p = statusPresentation[c.status];
              return (
                <div
                  key={c.framework}
                  className="flex flex-col gap-4 bg-surface p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-subheading text-ink">{c.framework}</h3>
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
                  </div>
                  <p className="text-body-sm text-ink-secondary">
                    {c.statement}
                  </p>
                  <EvidenceChip
                    state={p.state}
                    label={p.label}
                    className="mt-auto w-fit"
                  />
                </div>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── 3. Protection ─────────────────────────────────────────────────
          Four cards where there were four sections. Two across rather than
          four: these carry a sentence each, and four columns would set that
          sentence in a column too narrow to read. */}
      <Section id="protection" tone="sunken" className="scroll-mt-20">
        <Container>
          <SectionHeader
            eyebrow={protections.eyebrow}
            headline={protections.headline}
          />
          <ul className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2">
            {protections.items.map((item) => (
              <li
                key={item.title}
                className="flex flex-col gap-3 bg-surface p-6 sm:p-8"
              >
                <h3 className="text-heading text-ink">{item.title}</h3>
                <p className="text-body text-ink-secondary">{item.body}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── 4. Location privacy ───────────────────────────────────────────
          Kept at length, and inverted so it carries weight, because it is the
          one control on this page that is specific to Delphi rather than
          generic to SaaS. Backups and monitoring are table stakes; having
          thought about what publishing a location does to the person at that
          location is not.

          `briefStandfirst`, not `standfirst`: the long version and the note
          belong to /platform/technical, which is read by someone who wants
          the mechanism. One source, two registers. */}
      <Section id="location-privacy" className="scroll-mt-20" tone="inverse">
        <Container>
          <SectionHeader
            eyebrow={locationPrivacy.eyebrow}
            headline={locationPrivacy.headline}
            standfirst={locationPrivacy.briefStandfirst}
          />
          {/* One capture, three disclosures. The map under each card plots the
              SAME position at that card's level, which is the argument the
              section is making — the evidence does not change, only what the
              certificate says about it. See LocationPrivacyMap for why the
              lower two levels deliberately omit the dot. */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {locationPrivacy.levels.map((l) => (
              <Card key={l.level} className="flex flex-col gap-4">
                <span className="font-mono text-mono-sm uppercase text-ink-accent">
                  {l.level}
                </span>
                <p className="text-body-sm text-ink-secondary">{l.body}</p>
                <LocationPrivacyMap
                  level={l.level.toLowerCase() as PrivacyLevel}
                  className="mt-auto"
                />
              </Card>
            ))}
          </div>
          <p className="mt-6 text-caption text-ink-muted">
            {boroughAttribution}
          </p>
        </Container>
      </Section>

      {/* ── 5. Built on ───────────────────────────────────────────────────
          A strip: tight padding, a heading rather than a display size, no
          per-item paragraphs. The transparency is worth keeping and the
          detail is not worth a page section — it is one click away on
          /platform/technical, which is where a reviewer who wants it goes. */}
      <Section padding="tight">
        <Container>
          <div className="flex flex-col gap-8 rounded-lg border border-line bg-surface p-6 sm:p-8">
            <div className="flex flex-col gap-3">
              <Eyebrow>{infrastructure.eyebrow}</Eyebrow>
              <h2 className="text-heading text-ink">
                {infrastructure.headline}
              </h2>
            </div>

            <ul className="flex flex-wrap items-center gap-x-10 gap-y-5">
              {infrastructure.items.map((item) => (
                <li key={item.name} className="flex items-center gap-3">
                  <InfraLogo
                    name={item.logo}
                    label={item.name}
                    className="h-6 w-6"
                  />
                  <span className="text-body-sm font-semibold text-ink">
                    {item.name}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
              <p className="max-w-xl text-body-sm text-ink-muted">
                {infrastructure.note}
              </p>
              <Link
                to={infrastructure.link.href}
                className="flex w-fit shrink-0 items-center gap-2 text-body-sm text-ink-accent underline-offset-4 hover:underline"
              >
                {infrastructure.link.label}
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 6. Documentation, review request, disclosure ──────────────────
          One closing section carrying what used to be three. The old page
          finished with a Legal block, a Disclosure block and then a separate
          full-height CTA section asking for the security-review conversation
          a second time. */}
      <Section id="documentation" tone="sunken" className="scroll-mt-20">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="flex flex-col gap-6">
              <SectionHeader
                eyebrow={documentation.eyebrow}
                headline={documentation.headline}
              />
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

            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <h3 className="text-heading text-ink">
                  {securityReview.headline}
                </h3>
                <p className="text-body text-ink-secondary">
                  {securityReview.body}
                </p>
                <div className="mt-1">
                  <ButtonLink to={securityReview.cta.href} size="lg">
                    {securityReview.cta.label}
                  </ButtonLink>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-line pt-10">
                <h3 className="text-heading text-ink">
                  {securityContact.headline}
                </h3>
                <p className="text-body text-ink-secondary">
                  {securityContact.body}
                </p>
                <a
                  href={`mailto:${securityContact.email}`}
                  className="w-fit font-mono text-mono text-ink-accent underline-offset-4 hover:underline"
                >
                  {securityContact.email}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
