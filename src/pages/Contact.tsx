import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Section,
  Eyebrow,
  Card,
} from "@/components/ui/primitives";
import { ArrowRight, Button } from "@/components/ui/Button";
import { contactPage } from "@/content/company";
import posthog from "@/lib/posthog";

const fieldClass =
  "mt-2 w-full rounded-md border border-line-strong bg-surface px-4 text-body text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const value = (name: string) => form.get(name)?.toString().trim() ?? "";

    setStatus("submitting");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("name"),
          email: value("email"),
          phone: value("phone") || undefined,
          sector: value("sector"),
          message: value("message"),
        }),
      });
      if (!response.ok) throw new Error("Contact request failed");
      formElement.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

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
          <Card className="grid gap-10 p-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:p-10">
            <div className="flex flex-col gap-4">
              <Eyebrow>Contact Delphi</Eyebrow>
              <h2 className="text-heading text-ink">Get in touch</h2>
              <p className="text-body text-ink-secondary">
                Tell us what you are trying to establish, and who needs to be
                convinced of it. That is usually enough for a first conversation.
              </p>
              <p className="mt-auto text-body-sm text-ink-muted">
                Holding a certificate code?{" "}
                <Link to="/verify" className="text-ink-accent underline underline-offset-4">
                  Open it directly
                </Link>{" "}
                — no account needed.
              </p>
            </div>

            <form className="grid gap-5" onSubmit={submit}>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-body-sm font-semibold text-ink">
                  Full name
                  <input
                    className={`${fieldClass} h-12`}
                    name="name"
                    autoComplete="name"
                    maxLength={120}
                    required
                  />
                </label>
                <label className="text-body-sm font-semibold text-ink">
                  Email
                  <input
                    className={`${fieldClass} h-12`}
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="text-body-sm font-semibold text-ink">
                  Enquiry
                  <select className={`${fieldClass} h-12`} name="sector" defaultValue="commercial">
                    <option value="commercial">Evaluating Delphi</option>
                    <option value="procurement">Security and procurement</option>
                    <option value="verificationSupport">Certificate support</option>
                    <option value="technicalReview">Technical review</option>
                  </select>
                </label>
                <label className="text-body-sm font-semibold text-ink">
                  Phone <span className="font-normal text-ink-muted">(optional)</span>
                  <input
                    className={`${fieldClass} h-12`}
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={40}
                  />
                </label>
              </div>

              <label className="text-body-sm font-semibold text-ink">
                Message
                <textarea
                  className={`${fieldClass} min-h-32 resize-y py-3`}
                  name="message"
                  maxLength={4000}
                  required
                />
              </label>

              <div aria-live="polite">
                {status === "success" ? (
                  <p role="status" className="rounded-md bg-verified-tint p-4 text-body-sm text-ink">
                    Thank you — your message has been sent.
                  </p>
                ) : null}
                {status === "error" ? (
                  <p role="alert" className="rounded-md bg-failed-tint p-4 text-body-sm text-failed">
                    We could not send your message. Please try again or email{" "}
                    <a className="underline underline-offset-4" href={`mailto:${contactPage.email}`}>
                      {contactPage.email}
                    </a>
                    .
                  </p>
                ) : null}
              </div>

              <Button
                className="justify-self-start"
                type="submit"
                size="lg"
                disabled={status === "submitting"}
                onClick={() => posthog.capture("contact_form_send_clicked")}
              >
                {status === "submitting" ? "Sending…" : "Send message"}
                <ArrowRight />
              </Button>
            </form>
          </Card>
        </Container>
      </Section>
    </>
  );
}
