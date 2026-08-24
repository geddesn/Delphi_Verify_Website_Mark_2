import { useState, type FormEvent, type ReactNode } from "react";
import { CaptureMap } from "@/components/renderings/CaptureMap";
import { EvidenceChip, IllustrativeNote } from "@/components/evidence/Evidence";
import { Button } from "@/components/ui/Button";
import { Card, Container, Eyebrow, Section } from "@/components/ui/primitives";
import { CAPTURES, OPEN_CAPTURE, OPEN_DETAIL, RECORD } from "@/content/evidence-record";

const proofHash = "c8f2a74d91e10e535bf41aa028c21d39a7e723dd5c9084e64c2eb6a489e89e23";
const transactionHash = "0x71c8251282945f4cd724b1f4413cf0b34704336a8fb8a576f586158589ba7a2f";

export default function Certificate() {
  const [active, setActive] = useState(OPEN_CAPTURE);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  async function copyCode() {
    await navigator.clipboard?.writeText(RECORD.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    const data = { title: `Certificate ${RECORD.code}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard?.writeText(data.url);
    } catch {
      // The native share sheet was dismissed.
    }
  }

  function report(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReported(true);
  }

  return (
    <>
      <Section tone="sunken" padding="tight">
        <Container className="flex flex-col gap-6">
          <Card className="grid gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:p-8">
            <div className="min-w-0">
              <Eyebrow>Public certificate</Eyebrow>
              <h1 className="mt-5 max-w-3xl text-display text-ink md:text-display-lg">
                {RECORD.job}
              </h1>
              <p className="mt-3 max-w-2xl text-body text-ink-secondary">
                A device-attested condition record captured at {RECORD.address}.
              </p>
              <p className="mt-8 text-caption text-ink-muted">Captured on (device-reported)</p>
              <p className="mt-1 font-mono text-mono text-ink">
                {RECORD.date} · {RECORD.window}
              </p>
            </div>

            <div className="flex flex-col items-start gap-5 lg:items-end">
              <EvidenceChip state="verified" label="Delphi verified" />
              <div className="lg:text-right">
                <p className="text-caption text-ink-muted">Certificate</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="font-mono text-subheading text-ink">{RECORD.code}</span>
                  <button
                    type="button"
                    onClick={() => void copyCode()}
                    className="text-caption text-ink-accent underline underline-offset-4"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <Button variant="secondary" onClick={() => void share()}>
                Share certificate
              </Button>
            </div>

            <div className="flex items-center justify-center rounded-md border border-line bg-surface p-4">
              <img
                src="/assets/certificate-code.webp"
                alt={`QR code for certificate ${RECORD.code}`}
                className="h-32 w-32"
              />
            </div>
          </Card>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)] [&>*]:min-w-0">
            <Card>
              <CardTitle>Evidence media</CardTitle>
              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_5.5rem]">
                <figure className="overflow-hidden rounded-md bg-surface-sunken">
                  <img
                    src={`/assets/captures/${active.name}-878.webp`}
                    alt={active.label}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                  <figcaption className="flex items-center justify-between gap-4 border-t border-line bg-surface p-3">
                    <span className="text-body-sm text-ink">{active.label}</span>
                    <span className="font-mono text-mono-sm text-ink-muted">{active.time}</span>
                  </figcaption>
                </figure>
                <div className="flex gap-2 overflow-x-auto md:max-h-[32rem] md:flex-col md:overflow-y-auto">
                  {CAPTURES.map((capture) => (
                    <button
                      key={capture.n}
                      type="button"
                      onClick={() => setActive(capture)}
                      aria-label={`Open ${capture.label}`}
                      aria-pressed={active.n === capture.n}
                      className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line aria-pressed:border-ink-accent"
                    >
                      <img
                        src={`/assets/captures/${capture.name}-240.webp`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                  <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-line bg-surface-sunken font-mono text-mono text-ink-muted">
                    +11
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Evidence details</CardTitle>
              <dl className="mt-5">
                <Detail label="Subject" value={RECORD.job} />
                <Detail label="Captured on (device-reported)" value={`${RECORD.date}, ${active.time}`} />
                <Detail label="Coordinates" value={OPEN_DETAIL.coordinates} mono />
                <Detail label="Accuracy" value={OPEN_DETAIL.accuracy} />
                <Detail label="Network" value={RECORD.network} />
                <Detail label="Certificate" value={RECORD.code} mono />
                <Detail label="Evidence files" value={`${RECORD.captureCount} photos`} />
              </dl>
            </Card>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] [&>*]:min-w-0">
            <Card>
              <CardTitle>Capture location</CardTitle>
              <div className="mt-5 grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
                <dl>
                  <Detail label="Coordinates" value={OPEN_DETAIL.coordinates} mono />
                  <Detail label="Accuracy" value={OPEN_DETAIL.accuracy} />
                  <Detail label="Address" value={RECORD.address} />
                </dl>
                <div className="h-72 overflow-hidden rounded-md border border-line">
                  <CaptureMap />
                </div>
              </div>
            </Card>

            <Card>
              <CardTitle>Blockchain verification</CardTitle>
              <div className="mt-5 rounded-md bg-verified-tint p-4">
                <EvidenceChip state="verified" label="Confirmed" />
                <p className="mt-3 text-body-sm text-ink-secondary">
                  This certificate has a confirmed integrity record on Base.
                </p>
              </div>
              <dl className="mt-4">
                <Detail label="Network" value="Base (Ethereum L2)" />
                <Detail label="Transaction hash" value={transactionHash} mono />
              </dl>
              <a
                href={`https://base.easscan.org/attestation/view/${transactionHash}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-10 items-center rounded-md bg-accent px-4 text-body-sm font-semibold text-accent-ink"
              >
                Open EAS explorer
              </a>
            </Card>
          </div>

          <details className="group rounded-lg border border-line bg-surface-raised p-6 shadow-card">
            <summary className="cursor-pointer list-none">
              <CardTitle>Independent verification</CardTitle>
              <span className="mt-2 block text-subheading text-ink">Decoded proof fields</span>
              <span className="mt-1 block text-body-sm text-ink-secondary group-open:hidden">
                Show proof
              </span>
            </summary>
            <div className="mt-6 border-t border-line pt-6">
              <dl className="grid gap-x-8 sm:grid-cols-2">
                <Detail label="Schema version" value="4" />
                <Detail label="Media count" value={String(RECORD.captureCount)} />
                <Detail label="Hash salt" value="0x7a4c1d905bee44a62174c73f28a90d11" mono />
                <Detail label="Captured timestamp (device-reported)" value="2026-08-22T14:38:21Z" mono />
              </dl>
              <p className="mt-6 text-eyebrow uppercase text-ink-muted">Media hashes</p>
              <ul className="mt-2">
                {CAPTURES.map((capture) => (
                  <li key={capture.n} className="grid gap-2 border-t border-line py-3 sm:grid-cols-[12rem_1fr]">
                    <span className="text-body-sm text-ink">#{capture.n} · {capture.label}</span>
                    <span className="min-w-0 truncate font-mono text-mono-sm text-ink-muted">
                      0x{capture.n.toString(16).padStart(2, "0")}{proofHash.slice(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <a href="/platform/technical" className="mt-4 inline-block text-body-sm text-ink-accent underline underline-offset-4">
                How to verify these fields
              </a>
            </div>
          </details>

          <details className="group rounded-lg border border-line bg-surface-raised p-6 shadow-card">
            <summary className="cursor-pointer list-none">
              <CardTitle>Certificate concern</CardTitle>
              <span className="mt-2 block text-subheading text-ink">Report this certificate</span>
              <span className="mt-1 block text-body-sm text-ink-secondary group-open:hidden">
                Show form
              </span>
            </summary>
            <div className="mt-6 border-t border-line pt-6">
              {reported ? (
                <div role="status" className="rounded-md bg-verified-tint p-4 text-body text-ink">
                  Report received. Our team will review the certificate.
                </div>
              ) : (
                <form onSubmit={report} className="flex max-w-3xl flex-col gap-5">
                  <p className="text-body text-ink-secondary">
                    Tell us if this certificate contains a privacy concern, sensitive content or an unauthorised image.
                  </p>
                  <fieldset className="grid gap-3 sm:grid-cols-2">
                    <legend className="mb-2 text-body-sm font-semibold text-ink">Reason</legend>
                    {["Privacy concern", "Sensitive content", "Unauthorised image", "Other"].map((reason) => (
                      <label key={reason} className="flex items-center gap-3 rounded-md border border-line p-3 text-body-sm text-ink">
                        <input type="radio" name="reason" value={reason} required />
                        {reason}
                      </label>
                    ))}
                  </fieldset>
                  <label className="text-body-sm font-semibold text-ink">
                    Your email
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      className="mt-2 h-12 w-full rounded-md border border-line-strong bg-surface px-4 text-body text-ink"
                    />
                  </label>
                  <p className="text-caption text-ink-muted">Reports are reviewed by the Delphi team.</p>
                  <Button type="submit" className="self-start">Submit report</Button>
                </form>
              )}
            </div>
          </details>

          <IllustrativeNote />
        </Container>
      </Section>
    </>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-eyebrow uppercase text-ink-accent">{children}</h2>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-t border-line py-3 first:border-t-0 first:pt-0">
      <dt className="text-caption text-ink-muted">{label}</dt>
      <dd className={`mt-1 text-body-sm text-ink ${mono ? "break-all font-mono text-mono-sm" : "break-words"}`}>
        {value}
      </dd>
    </div>
  );
}
