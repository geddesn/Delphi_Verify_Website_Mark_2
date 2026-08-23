import { Container, Section, Eyebrow } from "@/components/ui/primitives";
import { EvidenceChip } from "@/components/evidence/Evidence";
import { cn } from "@/lib/cn";
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
                  {/* Enumerated clauses — the acceptable-use prohibitions and
                      the list of what a certificate does not establish. Both
                      run past ten items, and a reader checking whether one
                      specific thing is covered should not have to parse a
                      paragraph to find out. Renders after `body`, so a section
                      reads as lead-in prose then the list it introduces. */}
                  {s.list && (
                    <ul className="flex flex-col gap-2">
                      {s.list.map((item) => (
                        <li
                          key={item.slice(0, 28)}
                          className="flex gap-3 text-body text-ink-secondary"
                        >
                          <span aria-hidden className="text-ink-muted">
                            —
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {/* overflow-x-auto, not a responsive card stack: these are
                      cross-referenced facts, and a three-column row broken
                      into three stacked lines stops being a row. The wrapper
                      scrolls so the page body never does. */}
                  {s.table && (
                    <div className="-mx-1 overflow-x-auto px-1">
                      <table className="w-full min-w-[34rem] border-collapse text-left">
                        <thead>
                          <tr className="border-b border-line-strong">
                            {s.table.head.map((h) => (
                              <th
                                key={h}
                                scope="col"
                                className="py-2 pr-6 align-bottom text-eyebrow uppercase text-ink-muted last:pr-0"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {s.table.rows.map((row) => (
                            <tr key={row[0]} className="border-b border-line">
                              {row.map((cell, c) => (
                                <td
                                  key={cell.slice(0, 24)}
                                  className={cn(
                                    "py-3 pr-6 align-top text-body-sm last:pr-0",
                                    c === 0
                                      ? "font-semibold text-ink"
                                      : "text-ink-secondary",
                                  )}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {s.after?.map((p) => (
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
