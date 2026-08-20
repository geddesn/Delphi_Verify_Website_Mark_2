import {
  Container,
  Section,
  SectionHeader,
  Eyebrow,
} from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import {
  companyHero,
  story,
  principles,
  showLeadership,
  leadership,
  showLocations,
  locations,
  showEntity,
  entity,
} from "@/content/company";
import { industryBackdrops } from "@/content/industries";
import { SceneBackdrop } from "@/components/product/SceneBackdrop";

export default function Company() {
  return (
    <>
      <Section tone="inverse" className="relative">
        <SceneBackdrop frames={industryBackdrops} />
        <Container className="relative z-10">
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{companyHero.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {companyHero.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {companyHero.standfirst}
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="prose">
          <Eyebrow>{story.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-display text-ink">{story.headline}</h2>
          <div className="mt-8 flex flex-col gap-5">
            {story.body.map((p) => (
              <p key={p.slice(0, 28)} className="text-body-lg text-ink-secondary">
                {p}
              </p>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sunken">
        <Container>
          <SectionHeader
            eyebrow="How we work"
            headline="Principles we are willing to be held to."
          />
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {principles.map((p) => (
              <div key={p.title} className="flex flex-col gap-3 border-t-2 border-accent pt-5">
                <h3 className="text-subheading text-ink">{p.title}</h3>
                <p className="text-body-sm text-ink-secondary">{p.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* These three blocks stay hidden until real details are supplied.
          See src/content/company.ts — never ship invented names. */}
      {showLeadership && leadership.length > 0 && (
        <Section>
          <Container>
            <SectionHeader
              eyebrow="Leadership"
              headline="Who you are dealing with."
              standfirst="An enterprise buyer is not only choosing a product; they are choosing a counterparty. These are the people accountable for it."
            />
            <div className="mt-14 grid gap-10 md:grid-cols-2">
              {leadership.map((person) => (
                <div
                  key={person.name}
                  className="flex flex-col gap-5 border-t border-line-strong pt-6 sm:flex-row sm:gap-6"
                >
                  <img
                    src={`/assets/team/${person.portrait}-360.webp`}
                    srcSet={`/assets/team/${person.portrait}-180.webp 180w, /assets/team/${person.portrait}-360.webp 360w`}
                    sizes="180px"
                    alt=""
                    width={180}
                    height={180}
                    loading="lazy"
                    decoding="async"
                    /* Decorative: the name is in the heading beside it, so a
                       screen reader gains nothing from "Portrait of …". */
                    className="h-[120px] w-[120px] shrink-0 rounded-md border border-line object-cover object-top"
                  />

                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-subheading text-ink">{person.name}</h3>
                      <p className="font-mono text-mono-sm uppercase text-ink-accent">
                        {person.role}
                      </p>
                      <p className="font-mono text-mono-sm uppercase text-ink-muted">
                        {person.location}
                      </p>
                    </div>

                    <p className="text-body-sm text-ink-secondary">{person.bio}</p>

                    <ul className="flex flex-wrap gap-2">
                      {person.highlights.map((h) => (
                        <li
                          key={h}
                          className="rounded-sm border border-line px-2.5 py-1 text-caption text-ink-muted"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {showLocations && locations.length > 0 && (
        <Section tone="sunken">
          <Container>
            <SectionHeader eyebrow="Locations" headline="Where we operate." />
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {locations.map((l) => (
                <div key={l.city} className="flex flex-col gap-2 border-t border-line pt-5">
                  <h3 className="text-subheading text-ink">{l.city}</h3>
                  <p className="font-mono text-mono-sm uppercase text-ink-muted">
                    {l.country}
                  </p>
                  <p className="text-body-sm text-ink-secondary">{l.note}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {showEntity && entity.legalName && (
        <Section>
          <Container>
            <SectionHeader eyebrow="Corporate" headline="Legal entity." />
            <dl className="mt-10 max-w-xl">
              <div className="flex justify-between gap-6 border-t border-line py-3">
                <dt className="text-body-sm text-ink-muted">Registered name</dt>
                <dd className="font-mono text-mono text-ink">{entity.legalName}</dd>
              </div>
              <div className="flex justify-between gap-6 border-t border-line py-3">
                <dt className="text-body-sm text-ink-muted">Jurisdiction</dt>
                <dd className="text-right text-body-sm text-ink">
                  {entity.jurisdiction}
                </dd>
              </div>
              {/* Hidden until a real file number exists — an empty row reads
                  as an oversight, and a placeholder would be worse. */}
              {entity.registrationNumber && (
                <div className="flex justify-between gap-6 border-t border-line py-3">
                  <dt className="text-body-sm text-ink-muted">Registration number</dt>
                  <dd className="font-mono text-mono text-ink">
                    {entity.registrationNumber}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-6 border-t border-line py-3">
                <dt className="text-body-sm text-ink-muted">Registered address</dt>
                <dd className="text-right text-body-sm text-ink">
                  {entity.registeredAddress}
                </dd>
              </div>
            </dl>
          </Container>
        </Section>
      )}

      <Section tone="inverse">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <h2 className="text-display text-ink">
              We would rather have a specific conversation than a general one.
            </h2>
            <p className="text-body-lg text-ink-secondary">
              If there is a dispute that keeps recurring in your business, or an
              inspection cost you cannot justify, that is the useful starting point.
            </p>
            <div className="mt-2">
              <ButtonLink to="/contact" size="lg">
                Request a demonstration
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
