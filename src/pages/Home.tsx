import { Link } from "react-router-dom";
import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
  Card,
} from "@/components/ui/primitives";
import { ButtonLink, ArrowRight } from "@/components/ui/Button";
import {
  CertificatePanel,
  IllustrativeNote,
} from "@/components/evidence/Evidence";
import { PhoneShotRow } from "@/components/product/PhoneShot";
import { TrustModel } from "@/components/evidence/TrustModel";
import {
  hero,
  pattern,
  trustModel,
  value,
  product,
  howItWorks,
  trustStrip,
  closing,
} from "@/content/home";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";
import { industries, industryBackdrops } from "@/content/industries";
import { ctas } from "@/content/site";

export default function Home() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────
          Deep navy ground. The evidence panel is the hero image: the product
          shows itself rather than being illustrated with stock photography. */}
      {/* Two backdrop layers: the measured grid across the whole section, and
          the sector photography anchored right. The photograph sits behind the
          certificate panel rather than replacing it — the panel is still the
          hero image, per the note above. */}
      <Section tone="inverse" className="relative overflow-hidden">
        <GridBackdrop />
        <SceneBackdrop frames={industryBackdrops} />
        <Container className="relative z-10">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div className="flex flex-col gap-7">
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

            <div className="flex flex-col gap-3">
              <CertificatePanel {...hero.sample} />
              <IllustrativeNote />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── THE PATTERN ───────────────────────────────────────────────────
          The intellectual foundation: name the recurring situation, then
          show that it is the same situation everywhere. */}
      <Section>
        <Container>
          <SectionHeader
            eyebrow={pattern.eyebrow}
            headline={pattern.headline}
            standfirst={pattern.intro}
          />
          <div className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {pattern.conditions.map((c) => (
              <div key={c.n} className="flex flex-col gap-3 border-t-2 border-accent pt-5">
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {c.n}
                </span>
                <h3 className="text-subheading text-ink">{c.title}</h3>
                <p className="text-body-sm text-ink-secondary">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 border-l-2 border-accent pl-6">
            <p className="max-w-3xl text-body-lg text-ink">{pattern.conclusion}</p>
          </div>

        </Container>
      </Section>

      {/* ── THE TRUST MODEL ───────────────────────────────────────────────
          The pattern names the problem; this names Delphi's position in it.
          Built from markup rather than an image, so the copy lives in
          src/content and the whole thing themes with the rest of the site. */}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={trustModel.eyebrow}
            headline={trustModel.headline}
            standfirst={trustModel.standfirst}
          />
          <TrustModel className="mt-14" />
        </Container>
      </Section>

      {/* ── BUSINESS VALUE ────────────────────────────────────────────────
          Deliberately ahead of any technical explanation. */}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={value.eyebrow}
            headline={value.headline}
            standfirst={value.standfirst}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {value.pillars.map((p) => (
              <Card key={p.title} className="flex flex-col gap-3">
                <h3 className="text-subheading text-ink">{p.title}</h3>
                <p className="text-body-sm text-ink-secondary">{p.body}</p>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── INDUSTRIES ────────────────────────────────────────────────────*/}
      <Section>
        <Container>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            {/* No standfirst: the pattern section immediately above already
                makes the "built for a situation, not a sector" argument, and
                repeating it here was the homepage's clearest duplication. */}
            <SectionHeader
              eyebrow="Where it applies"
              headline="The same problem, across very different industries."
            />
            <ButtonLink to="/industries" variant="secondary" className="shrink-0">
              All industries
              <ArrowRight />
            </ButtonLink>
          </div>

          <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {industries.map((ind) => (
              <li key={ind.id} className="flex flex-col gap-2 bg-surface p-6">
                <h3 className="text-subheading text-ink">{ind.name}</h3>
                <p className="text-body-sm text-ink-secondary">{ind.situation}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── THE PRODUCT ───────────────────────────────────────────────────
          Real app captures. Placed after the commercial argument and before
          the technical model: by this point a reader knows why it matters and
          wants to see what it actually is. */}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={product.eyebrow}
            headline={product.headline}
            standfirst={product.standfirst}
          />
          <PhoneShotRow shots={[...product.shots]} className="mt-16" />
        </Container>
      </Section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────*/}
      <Section tone="inverse">
        <Container>
          <SectionHeader
            eyebrow={howItWorks.eyebrow}
            headline={howItWorks.headline}
            standfirst={howItWorks.standfirst}
          />
          {/* Four plain-language steps, not the five technical stages. The
              mechanism lives on /platform and /platform/technical. */}
          <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.chain.map((s) => (
              <li
                key={s.n}
                className="flex flex-col gap-3 border-t border-line-strong pt-5"
              >
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {s.n}
                </span>
                <h3 className="text-subheading text-ink">{s.title}</h3>
                <p className="text-body-sm text-ink-secondary">{s.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12">
            <ButtonLink to={howItWorks.linkHref} variant="secondary">
              {howItWorks.linkLabel}
              <ArrowRight />
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── TRUST ─────────────────────────────────────────────────────────*/}
      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow={trustStrip.eyebrow}
            headline={trustStrip.headline}
            standfirst={trustStrip.standfirst}
          />
          <div className="mt-10">
            <ButtonLink to={trustStrip.linkHref} variant="secondary">
              {trustStrip.linkLabel}
              <ArrowRight />
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── CLOSING CTA ───────────────────────────────────────────────────
          Prompts rather than a paragraph: each names a moment a buyer will
          recognise from their own operation. */}
      <Section tone="inverse" className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative z-10">
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

