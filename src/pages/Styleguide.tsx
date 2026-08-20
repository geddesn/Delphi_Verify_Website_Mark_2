import { Container, Section, Card, Rule } from "@/components/ui/primitives";
import { ButtonLink, Button } from "@/components/ui/Button";
import {
  EvidenceChip,
  DataRow,
  CertificatePanel,
} from "@/components/evidence/Evidence";
import { hero } from "@/content/home";
import { AnnotatedFigure } from "@/components/product/Callout";
import { yachtHandover as fig } from "@/content/features";

/* ============================================================================
   STYLEGUIDE  —  /styleguide
   ============================================================================
   Every token rendered on one page. Change a value in src/styles/theme.css and
   watch the entire system respond here, rather than clicking through six pages
   hunting for what broke.

   Not linked from the navigation. It is a working tool, not a public page.
   ========================================================================= */

const brandScale = [
  "50", "100", "200", "300", "400", "500",
  "600", "700", "800", "900", "950", "1000",
];

const semanticColours = [
  ["canvas", "Page background"],
  ["surface", "Card / panel"],
  ["surface-sunken", "Recessed section"],
  ["surface-accent", "Accent wash"],
  ["accent", "Primary action"],
  ["accent-subtle", "Accent background"],
  ["verified", "Evidence: verified"],
  ["pending", "Evidence: pending"],
  ["failed", "Evidence: failed"],
];

/* Class names are written out in full deliberately. Tailwind scans source
   statically, so an interpolated `text-${token}` would never be generated. */
const typeScale: { token: string; label: string; cls: string }[] = [
  { token: "display-xl", label: "Display XL — hero", cls: "text-display-xl" },
  { token: "display-lg", label: "Display LG", cls: "text-display-lg" },
  { token: "display", label: "Display", cls: "text-display" },
  { token: "heading", label: "Heading", cls: "text-heading" },
  { token: "subheading", label: "Subheading", cls: "text-subheading" },
  { token: "body-lg", label: "Body large", cls: "text-body-lg" },
  { token: "body", label: "Body", cls: "text-body" },
  { token: "body-sm", label: "Body small", cls: "text-body-sm" },
  { token: "caption", label: "Caption", cls: "text-caption" },
];

export default function Styleguide() {
  return (
    <Section>
      <Container>
        <header className="flex flex-col gap-3">
          <span className="font-mono text-mono-sm uppercase text-ink-muted">
            Internal
          </span>
          <h1 className="text-display-lg text-ink">Design system</h1>
          <p className="max-w-2xl text-body-lg text-ink-secondary">
            Every token in one place. Edit{" "}
            <code className="rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-mono">
              src/styles/theme.css
            </code>{" "}
            and this page reflects the change immediately. Toggle the theme in the
            header to check both mappings.
          </p>
        </header>

        {/* ── Brand scale ── */}
        <SGSection title="Brand scale" note="Layer 1 primitives. Never used directly by components.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {brandScale.map((step) => (
              <div key={step} className="flex flex-col gap-2">
                <div
                  className="h-16 rounded-md border border-line"
                  style={{ background: `var(--delphi-${step})` }}
                />
                <span className="font-mono text-mono-sm text-ink-muted">
                  delphi-{step}
                </span>
              </div>
            ))}
          </div>
        </SGSection>

        {/* ── Semantic colours ── */}
        <SGSection title="Semantic tokens" note="Layer 2. The only layer components reference.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {semanticColours.map(([token, label]) => (
              <div
                key={token}
                className="flex items-center gap-4 rounded-md border border-line p-3"
              >
                <div
                  className="h-12 w-12 shrink-0 rounded-sm border border-line"
                  style={{ background: `var(--${token})` }}
                />
                <div className="flex flex-col">
                  <span className="font-mono text-mono-sm text-ink">--{token}</span>
                  <span className="text-caption text-ink-muted">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </SGSection>

        {/* ── Type scale ── */}
        <SGSection title="Type scale" note="Sections choose a role, never a pixel size.">
          <div className="flex flex-col gap-6">
            {typeScale.map((t) => (
              <div key={t.token} className="flex flex-col gap-1 border-t border-line pt-4">
                <span className="font-mono text-mono-sm text-ink-muted">{t.cls}</span>
                <p className={`${t.cls} text-ink`}>{t.label}</p>
              </div>
            ))}
            <div className="flex flex-col gap-1 border-t border-line pt-4">
              <span className="font-mono text-mono-sm text-ink-muted">text-eyebrow</span>
              <p className="text-eyebrow uppercase text-ink-accent">Eyebrow label</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-line pt-4">
              <span className="font-mono text-mono-sm text-ink-muted">font-mono</span>
              <p className="font-mono text-mono text-ink">
                9f2c4e8a71b3d05fca6e19b84d7c2035 · 50.9219, −1.3875
              </p>
            </div>
          </div>
        </SGSection>

        {/* ── Buttons ── */}
        <SGSection title="Actions">
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink to="/styleguide">Primary</ButtonLink>
            <ButtonLink to="/styleguide" variant="secondary">Secondary</ButtonLink>
            <ButtonLink to="/styleguide" variant="ghost">Ghost link</ButtonLink>
            <Button disabled>Disabled</Button>
            <ButtonLink to="/styleguide" size="lg">Large</ButtonLink>
          </div>
        </SGSection>

        {/* ── Evidence ── */}
        <SGSection title="Evidence components" note="State colour may only express verification state.">
          <div className="flex flex-wrap gap-3">
            <EvidenceChip state="verified" />
            <EvidenceChip state="pending" />
            <EvidenceChip state="failed" />
            <EvidenceChip state="pending" label="Roadmap" />
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Card>
              <DataRow label="Certificate" value="4K7M-92QX" />
              <DataRow label="Captured" value="2026-05-27 11:28:36" />
              <DataRow label="Coordinates" value="50.9219, −1.3875" />
              <DataRow label="Hash" value={hero.sample.hash} truncate />
            </Card>
            <CertificatePanel {...hero.sample} />
          </div>
        </SGSection>

        {/* ── Radii & elevation ── */}
        <SGSection title="Radii and elevation" note="Tight radii are deliberate — precision over friendliness.">
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {["xs", "sm", "md", "lg", "xl"].map((r) => (
              <div key={r} className="flex flex-col gap-2">
                <div
                  className="h-16 border border-line bg-surface-accent"
                  style={{ borderRadius: `var(--radius-${r})` }}
                />
                <span className="font-mono text-mono-sm text-ink-muted">
                  radius-{r}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {["card", "raised", "overlay"].map((s) => (
              <div
                key={s}
                className="rounded-lg border border-line bg-surface p-6"
                style={{ boxShadow: `var(--elev-${s})` }}
              >
                <span className="font-mono text-mono-sm text-ink-muted">
                  shadow-{s}
                </span>
              </div>
            ))}
          </div>
        </SGSection>
        {/* ── Annotated figure ── */}
        <SGSection
          title="Callout panels"
          note="Positions are % of the container. Toggle debug below to read coordinates off the picture."
        >
          <AnnotatedFigure
            src={`${fig.image.base}-1920.webp`}
            srcSet={`${fig.image.base}-480.webp 480w, ${fig.image.base}-960.webp 960w, ${fig.image.base}-1920.webp 1920w`}
            sizes="(min-width: 1280px) 1100px, 100vw"
            width={fig.image.width}
            height={fig.image.height}
            alt={fig.image.alt}
            callouts={[...fig.callouts]}
          />
          <p className="mt-3 text-caption text-ink-muted">{fig.note}</p>

          <h3 className="mt-12 text-subheading text-ink">With placement grid</h3>
          <p className="mb-6 text-body-sm text-ink-muted">
            Dev-only. Read coordinates off the axes, then edit
            <code className="mx-1 rounded-sm bg-surface-sunken px-1.5 py-0.5 font-mono text-mono">
              src/content/features.ts
            </code>
            — no component changes needed.
          </p>
          <AnnotatedFigure
            src={`${fig.image.base}-1920.webp`}
            width={fig.image.width}
            height={fig.image.height}
            alt=""
            callouts={[...fig.callouts]}
            debug
          />
        </SGSection>
      </Container>
    </Section>
  );
}

function SGSection({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <Rule className="mb-8" />
      <h2 className="text-heading text-ink">{title}</h2>
      {note && <p className="mt-1 text-body-sm text-ink-muted">{note}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}
