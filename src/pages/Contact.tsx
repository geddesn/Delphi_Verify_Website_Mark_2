import { Link } from "react-router-dom";
import {
  Container,
  Section,
  Eyebrow,
  Card,
} from "@/components/ui/primitives";
import { ArrowRight } from "@/components/ui/Button";
import { contactPage } from "@/content/company";

export default function Contact() {
  return (
    <>
      <Section tone="inverse">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{contactPage.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {contactPage.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {contactPage.standfirst}
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {contactPage.routes.map((route) => (
              <Card key={route.title} className="flex flex-col gap-3">
                <h2 className="text-subheading text-ink">{route.title}</h2>
                <p className="flex-1 text-body-sm text-ink-secondary">{route.body}</p>
                <span className="flex items-center gap-2 text-body-sm text-ink-accent">
                  {route.action}
                  <ArrowRight />
                </span>
              </Card>
            ))}
          </div>

          {/* NOTE: no form is wired yet — a mailto is honest and works today.
              When a form endpoint exists, replace this block. Do not ship a
              form that silently discards submissions. */}
          <div className="mt-14 flex flex-col gap-4 rounded-lg border border-line bg-surface-sunken p-8">
            <h2 className="text-heading text-ink">Get in touch</h2>
            <p className="max-w-2xl text-body text-ink-secondary">
              Email us directly and tell us what you are trying to establish, and
              who needs to be convinced of it. That is usually enough for a first
              conversation.
            </p>
            <a
              href={`mailto:${contactPage.email}`}
              className="w-fit font-mono text-body text-ink-accent underline-offset-4 hover:underline"
            >
              {contactPage.email}
            </a>
            <p className="mt-2 text-body-sm text-ink-muted">
              Holding a certificate code?{" "}
              <Link to="/verify" className="text-ink-accent underline underline-offset-4">
                Open it directly
              </Link>{" "}
              — no account needed.
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
