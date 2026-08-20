import { Container, Section, Eyebrow } from "@/components/ui/primitives";
import { EvidenceChip } from "@/components/evidence/Evidence";
import type { LegalSection } from "@/content/legal";

/** Shared renderer for the legal pages. Sections flagged `todo` render a
 *  visible reviewer's note, so an unfinished clause cannot ship unnoticed —
 *  the failure mode with legal scaffolding is that it quietly looks finished. */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: readonly LegalSection[];
}) {
  const outstanding = sections.filter((s) => s.todo).length;

  return (
    <>
      <Section tone="inverse" padding="tight">
        <Container width="prose">
          <div className="flex flex-col gap-5">
            <Eyebrow>Legal</Eyebrow>
            <h1 className="text-display text-ink md:text-display-lg">{title}</h1>
            <p className="font-mono text-mono text-ink-muted">{updated}</p>
            <p className="text-body-lg text-ink-secondary">{intro}</p>
          </div>
        </Container>
      </Section>

      {outstanding > 0 && (
        <Section padding="tight">
          <Container width="prose">
            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-pending p-6">
              <div className="flex items-center gap-3">
                <EvidenceChip state="pending" label="Draft" />
                <h2 className="text-subheading text-ink">Not yet legally reviewed</h2>
              </div>
              <p className="text-body-sm text-ink-secondary">
                {outstanding} section{outstanding === 1 ? "" : "s"} on this page
                still need{outstanding === 1 ? "s" : ""} completion or legal
                review, and {outstanding === 1 ? "is" : "are"} marked below. This
                page must not go live in this state — either port the existing
                published policy or have counsel complete it.
              </p>
            </div>
          </Container>
        </Section>
      )}

      <Section padding="flush">
        <Container width="prose">
          {/* Contents — legal pages are scanned, not read. */}
          <nav aria-label="Contents" className="mb-12 border-y border-line py-5">
            <h2 className="text-eyebrow uppercase text-ink-muted">Contents</h2>
            <ol className="mt-3 flex flex-col gap-1.5">
              {sections.map((s, i) => (
                <li key={s.id} className="flex gap-3">
                  <span className="font-mono text-mono-sm text-ink-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <a
                    href={`#${s.id}`}
                    className="text-body-sm text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
                  >
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex flex-col gap-12">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-24">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-mono-sm text-ink-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-heading text-ink">{s.heading}</h2>
                </div>
                <div className="mt-4 flex flex-col gap-4 pl-8">
                  {s.body.map((p) => (
                    <p key={p.slice(0, 28)} className="text-body text-ink-secondary">
                      {p}
                    </p>
                  ))}
                  {s.todo && (
                    <p className="border-l-2 border-pending pl-4 text-body-sm text-ink-muted">
                      <strong className="text-pending">Reviewer note —</strong>{" "}
                      this section requires completion or confirmation before
                      publication.
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
