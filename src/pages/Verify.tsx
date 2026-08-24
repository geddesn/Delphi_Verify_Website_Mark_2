import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Section, Eyebrow } from "@/components/ui/primitives";
import { Button } from "@/components/ui/Button";
import { PhoneShot } from "@/components/product/PhoneShot";

const CODE_LENGTH = 8;

/** Strips formatting down to the eight significant characters. */
function normalise(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

/** Displays as XXXX-XXXX, matching how the app and certificate present a code
 *  (e.g. VQM0-DYK8). The hyphen is presentation only — it is stripped before
 *  lookup, so pasting either form works. */
function format(raw: string) {
  const n = normalise(raw);
  return n.length > 4 ? `${n.slice(0, 4)}-${n.slice(4)}` : n;
}

export default function Verify() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);

  const normalised = normalise(code);
  const valid = normalised.length === CODE_LENGTH;
  const showError = touched && !valid;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    navigate(`/v/${normalised}`);
  }

  return (
    <>
      <Section tone="inverse">
        <Container>
          {/* min-w-0 / minmax(0,…) for the same reason as the homepage hero:
              grid items default to min-width:auto, so a track cannot size
              below its content's min-content width. Here the offender is the
              code input — see below. */}
          <div className="grid gap-14 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-20">
            <div className="flex flex-col gap-6">
              <Eyebrow>Independent verification</Eyebrow>
              <h1 className="text-display-lg text-ink">
                Open a Delphi certificate.
              </h1>
              <p className="max-w-xl text-body-lg text-ink-secondary">
                Enter the eight-character code from a certificate or QR code — the
                form shown on the certificate itself, such as VQM0-DYK8. No
                account is required, and you do not need any relationship with
                Delphi to inspect the evidence.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-6 shadow-raised"
              noValidate
            >
              <label htmlFor="code" className="text-eyebrow uppercase text-ink-muted">
                Certificate code
              </label>

              <input
                id="code"
                name="code"
                value={format(code)}
                onChange={(e) => setCode(normalise(e.target.value))}
                onBlur={() => setTouched(true)}
                placeholder="XXXX-XXXX"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                inputMode="text"
                aria-describedby={showError ? "code-error" : "code-hint"}
                aria-invalid={showError || undefined}
                /* w-full and min-w-0 are load-bearing.

                   An <input> with no explicit width takes its intrinsic width
                   from the `size` attribute, which defaults to 20 characters.
                   At 28px monospace with 0.3em tracking that is a min-content
                   of 383px, which forced the grid track to 433px inside a
                   363px container and made the whole page scroll sideways on
                   a phone. Eight characters are ever typed here; twenty was
                   never intentional, just the HTML default showing through. */
                size={9}
                className="h-14 w-full min-w-0 rounded-md border border-line-strong bg-surface px-4 text-center font-mono text-heading uppercase tracking-[0.3em] text-ink placeholder:text-ink-muted placeholder:tracking-[0.3em]"
              />

              {showError ? (
                <p id="code-error" role="alert" className="text-body-sm text-failed">
                  A certificate code is exactly {CODE_LENGTH} characters, letters
                  and numbers only. You have entered {normalised.length}.
                </p>
              ) : (
                <p id="code-hint" className="text-body-sm text-ink-muted">
                  {CODE_LENGTH} characters, letters and numbers. Spaces and dashes
                  are ignored.
                </p>
              )}

              <Button type="submit" size="lg" disabled={!valid}>
                Open certificate
              </Button>
            </form>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mb-16 grid items-center gap-12 lg:grid-cols-[auto_1fr] lg:gap-20">
            <PhoneShot
              name="scan"
              alt="The Delphi Verify app scanning a certificate QR code"
              className="mx-auto lg:mx-0"
            />
            <div className="flex flex-col gap-4">
              <h2 className="text-display text-ink">
                Or scan the code.
              </h2>
              <p className="max-w-xl text-body-lg text-ink-secondary">
                Certificates carry a QR code alongside the eight-character
                reference. Scanning it in the Delphi Verify app opens the same
                report — and so does pointing any phone camera at it.
              </p>
            </div>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                title: "What you will see",
                body: "The evidence itself, the device-reported capture time, location and accuracy, the number and type of files, and the verification status of both capture and device.",
              },
              {
                title: "How to check it yourself",
                body: "The report includes an independent-verification section exposing decoded proof fields and SHA-256 media hashes, so you can recompute them rather than trusting the interface.",
              },
              {
                title: "What the anchor proves",
                body: "A confirmed certificate links to its Ethereum Attestation Service record on Base mainnet. That establishes the proof existed in that exact form at that time, on a record Delphi does not control.",
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col gap-3 border-t border-line pt-5">
                <h2 className="text-subheading text-ink">{item.title}</h2>
                <p className="text-body-sm text-ink-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
