import { Container, Section, Eyebrow } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Section>
      <Container width="prose">
        <div className="flex flex-col gap-6">
          <Eyebrow>404</Eyebrow>
          <h1 className="text-display text-ink">This page does not exist.</h1>
          <p className="text-body-lg text-ink-secondary">
            The link may be out of date, or the address slightly wrong. If you
            were trying to open a certificate, you can do that directly with its
            eight-character code.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <ButtonLink to="/verify">Verify a certificate</ButtonLink>
            <ButtonLink to="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
