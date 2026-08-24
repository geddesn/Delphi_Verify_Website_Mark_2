import QRCode from "qrcode";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { CaptureMap } from "@/components/renderings/CaptureMap";
import { EvidenceChip, type EvidenceState } from "@/components/evidence/Evidence";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, Container, Eyebrow, Section } from "@/components/ui/primitives";

type Gps = { lat: number; lng: number; accuracy: number; capturedAt: string };
type Address = {
  formattedAddress: string;
  city: string | null;
  county: string | null;
  region: string | null;
  country: string | null;
};
type Media = {
  index: number;
  type: "photo" | "video";
  sha256: string;
  downloadUrl: string;
  thumbnailDownloadUrl: string | null;
  durationMs: number | null;
  hasAudio: boolean | null;
  capturedAt: string;
  gps: Gps;
  metadataHashes?: { lat: string; lng: string; capturedAt: string };
};
type Report = {
  publicCode: string;
  title: string | null;
  description: string | null;
  capturedAt: string;
  gps: Gps;
  address: Address | null;
  media: Media[];
  verificationStatus: "pending" | "verified" | "failed";
  captureVerification: { status: "verified" | "retry_required" | "failed"; verifiedCaptures: number };
  deviceVerification: { status: "verified"; verifiedAt: string | null };
  anchor: {
    status: "pending" | "submitted" | "confirmed" | "failed";
    chainId: number;
    attestationUid: string | null;
    txHash: string | null;
    blockNumber: number | null;
    anchoredAt: string | null;
  };
  mediaProof: {
    version: 2 | 4;
    latE7?: number;
    lngE7?: number;
    capturedAt?: number;
    mediaCount?: number;
    hashSalt?: string;
  };
};
type LoadState =
  | { status: "loading" }
  | { status: "ready"; report: Report }
  | { status: "not-found" }
  | { status: "removed" }
  | { status: "error" };

const CODE_LENGTH = 8;

export default function Certificate() {
  const { code: pathCode } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const code = normalise(pathCode ?? searchParams.get("code") ?? "");

  useEffect(() => {
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);

  if (code.length !== CODE_LENGTH) {
    return <CertificateMessage eyebrow="Certificate not found" title="We could not open this certificate." code={code} description="Check the code and try again. Certificate codes contain eight letters and numbers." />;
  }
  return <CertificateLoader key={code} code={code} />;
}

function CertificateLoader({ code }: { code: string }) {
  const [revision, setRevision] = useState(0);
  const [load, setLoad] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    void fetch(`/api/verify/${encodeURIComponent(code)}`, { signal: controller.signal })
      .then(async (response) => {
        if (response.status === 404 || response.status === 400) return { status: "not-found" } as const;
        if (response.status === 410) return { status: "removed" } as const;
        if (!response.ok) return { status: "error" } as const;
        return { status: "ready", report: (await response.json()) as Report } as const;
      })
      .then((next) => setLoad(next))
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLoad({ status: "error" });
      });

    return () => controller.abort();
  }, [code, revision]);

  useEffect(() => {
    if (load.status !== "ready") return;
    const { status } = load.report.anchor;
    if (status !== "pending" && status !== "submitted") return;
    const timer = window.setTimeout(() => setRevision((value) => value + 1), 3000);
    return () => window.clearTimeout(timer);
  }, [load]);

  function retry() {
    setLoad({ status: "loading" });
    setRevision((value) => value + 1);
  }

  if (load.status === "loading") return <CertificateLoading />;
  if (load.status === "not-found") {
    return <CertificateMessage eyebrow="Certificate not found" title="We could not open this certificate." code={code} description="Check the code and try again. Certificate codes contain eight letters and numbers." />;
  }
  if (load.status === "removed") {
    return <CertificateMessage eyebrow="Certificate removed" title="This certificate is no longer available." code={code} description="The public record was permanently withdrawn. This certificate code will not be reused." />;
  }
  if (load.status === "error") {
    return (
      <CertificateMessage eyebrow="Temporarily unavailable" title="We could not retrieve this certificate." code={code} description="The verification service did not respond. Your code has not changed; please try again.">
        <Button onClick={retry}>Try again</Button>
      </CertificateMessage>
    );
  }
  return <CertificateReport report={load.report} />;
}

function CertificateReport({ report }: { report: Report }) {
  const media = useMemo(() => [...report.media].sort((a, b) => a.index - b.index), [report.media]);
  const [activeIndex, setActiveIndex] = useState(media[0]?.index ?? 0);
  const [copied, setCopied] = useState(false);
  const [qr, setQr] = useState("");
  const [reportState, setReportState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const active = media.find((item) => item.index === activeIndex) ?? media[0];
  const gps = active?.gps ?? report.gps;
  const formattedCode = formatCode(report.publicCode);
  const title = report.title?.trim() || "Delphi certificate";
  const address = displayAddress(report.address, gps.accuracy);
  const verificationState = report.verificationStatus as EvidenceState;

  useEffect(() => {
    document.title = `Certificate ${formattedCode} | Delphi Verify`;
  }, [formattedCode]);

  useEffect(() => {
    void QRCode.toDataURL(`https://delphiverify.com/v/${report.publicCode}`, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 176,
    }).then(setQr);
  }, [report.publicCode]);

  async function copyCode() {
    await navigator.clipboard?.writeText(formattedCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    const data = { title: `Certificate ${formattedCode}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else await navigator.clipboard?.writeText(data.url);
    } catch {
      // The native share sheet was dismissed.
    }
  }

  async function submitConcern(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setReportState("submitting");
    try {
      const response = await fetch("/api/contact/certificate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicCode: report.publicCode,
          email: form.get("email"),
          reason: form.get("reason"),
        }),
      });
      setReportState(response.ok ? "success" : "error");
    } catch {
      setReportState("error");
    }
  }

  return (
    <Section tone="sunken" padding="tight">
      <Container className="flex flex-col gap-6">
        <Card className="grid min-w-0 gap-8 p-6 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:p-8">
          <div className="min-w-0">
            <Eyebrow>Public certificate</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-display text-ink md:text-display-lg">{title}</h1>
            {report.description ? <p className="mt-3 max-w-2xl text-body text-ink-secondary">{report.description}</p> : null}
            <p className="mt-8 text-caption text-ink-muted">Captured on</p>
            <p className="mt-1 font-mono text-mono text-ink">{formatDate(report.capturedAt)}</p>
          </div>
          <div className="flex flex-col items-start gap-5 lg:items-end">
            <EvidenceChip state={verificationState} label={`Delphi ${report.verificationStatus}`} />
            <div className="lg:text-right">
              <p className="text-caption text-ink-muted">Certificate</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="font-mono text-subheading text-ink">{formattedCode}</span>
                <button type="button" onClick={() => void copyCode()} className="text-caption text-ink-accent underline underline-offset-4">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
            <Button variant="secondary" onClick={() => void share()}>Share certificate</Button>
          </div>
          <div className="flex items-center justify-center rounded-md border border-line bg-surface p-4">
            {qr ? <img src={qr} alt={`QR code for certificate ${formattedCode}`} className="h-32 w-32" /> : <div className="h-32 w-32 animate-pulse rounded-md bg-surface-sunken" />}
          </div>
        </Card>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)] [&>*]:min-w-0">
          <Card>
            <CardTitle>Evidence media</CardTitle>
            {active ? (
              <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1fr)_5.5rem]">
                <figure className="overflow-hidden rounded-md bg-surface-sunken">
                  {active.type === "photo" ? (
                    <img src={active.downloadUrl} alt={`Evidence ${active.index}`} className="aspect-[4/3] h-full w-full object-contain" />
                  ) : (
                    <video src={active.downloadUrl} poster={active.thumbnailDownloadUrl ?? undefined} controls preload="metadata" className="aspect-[4/3] h-full w-full bg-ink object-contain" />
                  )}
                  <figcaption className="flex items-center justify-between gap-4 border-t border-line bg-surface p-3">
                    <span className="text-body-sm text-ink">Evidence #{active.index}</span>
                    <span className="font-mono text-mono-sm text-ink-muted">{formatDate(active.capturedAt)}</span>
                  </figcaption>
                </figure>
                <div className="flex gap-2 overflow-x-auto md:max-h-[32rem] md:flex-col md:overflow-y-auto">
                  {media.map((item) => (
                    <button key={item.index} type="button" onClick={() => setActiveIndex(item.index)} aria-label={`Open evidence ${item.index}`} aria-pressed={active.index === item.index} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-line aria-pressed:border-ink-accent">
                      <img src={item.thumbnailDownloadUrl ?? item.downloadUrl} alt="" className="h-full w-full object-cover" />
                      {item.type === "video" ? <span className="absolute inset-x-0 bottom-0 bg-surface-inverse px-1 py-0.5 font-mono text-mono-xs text-ink-inverse">Video</span> : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : <p className="mt-5 text-body text-ink-secondary">No evidence media is available.</p>}
          </Card>

          <Card>
            <CardTitle>Evidence details</CardTitle>
            <dl className="mt-5">
              <Detail label="Subject" value={title} />
              {report.description ? <Detail label="Description" value={report.description} /> : null}
              <Detail label="Captured on (device-reported)" value={formatDate(active?.capturedAt ?? report.capturedAt)} />
              <Detail label="Coordinates" value={`${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`} mono />
              <Detail label="Accuracy" value={formatAccuracy(gps.accuracy)} />
              <Detail label="Network" value={networkName(report.anchor.chainId)} />
              <Detail label="Certificate" value={formattedCode} mono />
              <Detail label="Evidence files" value={String(media.length)} />
            </dl>
          </Card>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)] [&>*]:min-w-0">
          <Card>
            <CardTitle>Capture location</CardTitle>
            <div className="mt-5 grid gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
              <dl>
                <Detail label="Coordinates" value={`${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`} mono />
                <Detail label="Accuracy" value={formatAccuracy(gps.accuracy)} />
                <Detail label="Address" value={address ?? "Address unavailable"} />
              </dl>
              <div className="h-72 overflow-hidden rounded-md border border-line">
                <CaptureMap query={address ?? `${gps.lat},${gps.lng}`} />
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Blockchain verification</CardTitle>
            <div className={`mt-5 rounded-md p-4 ${anchorBackground(report.anchor.status)}`}>
              <EvidenceChip state={anchorState(report.anchor.status)} label={report.anchor.status} />
              <p className="mt-3 text-body-sm text-ink-secondary">{anchorMessage(report.anchor.status)}</p>
            </div>
            <dl className="mt-4">
              <Detail label="Network" value={networkName(report.anchor.chainId)} />
              {report.anchor.txHash ? <Detail label="Transaction hash" value={report.anchor.txHash} mono /> : null}
              {report.anchor.blockNumber ? <Detail label="Block" value={String(report.anchor.blockNumber)} mono /> : null}
              {report.anchor.anchoredAt ? <Detail label="Anchored at" value={formatDate(report.anchor.anchoredAt)} /> : null}
            </dl>
            {report.anchor.attestationUid ? (
              <a href={`https://base.easscan.org/attestation/view/${report.anchor.attestationUid}`} target="_blank" rel="noreferrer" className="mt-5 inline-flex h-10 items-center rounded-md bg-accent px-4 text-body-sm font-semibold text-accent-ink">
                View blockchain record
              </a>
            ) : null}
          </Card>
        </div>

        <details className="group min-w-0 rounded-lg border border-line bg-surface-raised p-6 shadow-card">
          <summary className="cursor-pointer list-none">
            <CardTitle>Independent verification</CardTitle>
            <span className="mt-2 block text-subheading text-ink">Blockchain record details</span>
            <span className="mt-1 block text-body-sm text-ink-secondary group-open:hidden">Show proof</span>
          </summary>
          <div className="mt-6 min-w-0 border-t border-line pt-6">
            <dl className="grid min-w-0 gap-x-8 sm:grid-cols-2 [&>*]:min-w-0">
              <Detail label="Schema version" value={String(report.mediaProof.version)} />
              <Detail label="Media count" value={String(report.mediaProof.mediaCount ?? media.length)} />
              {report.mediaProof.hashSalt ? <Detail label="Hash salt" value={report.mediaProof.hashSalt} mono /> : null}
              {report.mediaProof.latE7 !== undefined ? <Detail label="Latitude" value={(report.mediaProof.latE7 / 10_000_000).toFixed(7)} mono /> : null}
              {report.mediaProof.lngE7 !== undefined ? <Detail label="Longitude" value={(report.mediaProof.lngE7 / 10_000_000).toFixed(7)} mono /> : null}
            </dl>
            <p className="mt-6 text-eyebrow uppercase text-ink-muted">Media hashes</p>
            <ul className="mt-2 min-w-0">
              {media.map((item) => (
                <li key={item.index} className="grid min-w-0 gap-2 border-t border-line py-3 sm:grid-cols-[12rem_minmax(0,1fr)]">
                  <span className="text-body-sm text-ink">#{item.index} · {item.type}</span>
                  <div className="min-w-0">
                    <Hash label="Media" value={item.sha256} />
                    {item.metadataHashes ? <><Hash label="Latitude" value={item.metadataHashes.lat} /><Hash label="Longitude" value={item.metadataHashes.lng} /><Hash label="Captured at" value={item.metadataHashes.capturedAt} /></> : null}
                  </div>
                </li>
              ))}
            </ul>
            <a href="/platform/technical" className="mt-4 inline-block text-body-sm text-ink-accent underline underline-offset-4">How to verify these fields</a>
          </div>
        </details>

        <details className="group rounded-lg border border-line bg-surface-raised p-6 shadow-card">
          <summary className="cursor-pointer list-none">
            <CardTitle>Certificate concern</CardTitle>
            <span className="mt-2 block text-subheading text-ink">Report this certificate</span>
            <span className="mt-1 block text-body-sm text-ink-secondary group-open:hidden">Show form</span>
          </summary>
          <div className="mt-6 border-t border-line pt-6">
            {reportState === "success" ? (
              <div role="status" className="rounded-md bg-verified-tint p-4 text-body text-ink">Report received. Our team will review the certificate.</div>
            ) : (
              <form onSubmit={submitConcern} className="flex max-w-3xl flex-col gap-5">
                <p className="text-body text-ink-secondary">Tell us if this certificate contains a privacy concern, sensitive content or an unauthorised image.</p>
                <fieldset className="grid gap-3 sm:grid-cols-2">
                  <legend className="mb-2 text-body-sm font-semibold text-ink">Reason</legend>
                  {[
                    ["privacy_concern", "Privacy concern"],
                    ["sensitive_content", "Sensitive content"],
                    ["unauthorized_image", "Unauthorised image"],
                    ["other", "Other"],
                  ].map(([value, label]) => (
                    <label key={value} className="flex items-center gap-3 rounded-md border border-line p-3 text-body-sm text-ink">
                      <input type="radio" name="reason" value={value} required />{label}
                    </label>
                  ))}
                </fieldset>
                <label className="text-body-sm font-semibold text-ink">Your email
                  <input type="email" name="email" required maxLength={254} placeholder="you@example.com" className="mt-2 h-12 w-full rounded-md border border-line-strong bg-surface px-4 text-body text-ink" />
                </label>
                {reportState === "error" ? <p role="alert" className="text-body-sm text-failed">We could not submit the report. Please try again.</p> : null}
                <p className="text-caption text-ink-muted">Reports are reviewed by the Delphi team.</p>
                <Button type="submit" disabled={reportState === "submitting"} className="self-start">{reportState === "submitting" ? "Submitting…" : "Submit report"}</Button>
              </form>
            )}
          </div>
        </details>
      </Container>
    </Section>
  );
}

function CertificateLoading() {
  return (
    <Section tone="sunken" padding="tight">
      <Container>
        <div className="flex animate-pulse flex-col gap-6" role="status" aria-live="polite" aria-label="Retrieving certificate">
        <Card className="grid gap-8 p-8 lg:grid-cols-[1fr_auto_auto]">
          <div><p className="font-mono text-mono-sm uppercase text-ink-accent">Retrieving certificate</p><div className="mt-6 h-12 max-w-2xl rounded-md bg-surface-sunken" /><div className="mt-4 h-5 max-w-xl rounded-md bg-surface-sunken" /><div className="mt-8 h-10 w-56 rounded-md bg-surface-sunken" /></div>
          <div className="h-28 w-48 rounded-md bg-surface-sunken" />
          <div className="h-40 w-40 rounded-md bg-surface-sunken" />
        </Card>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"><LoadingCard className="h-[34rem]" /><LoadingCard className="h-[34rem]" /></div>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><LoadingCard className="h-80" /><LoadingCard className="h-80" /></div>
        <p className="sr-only">Retrieving and validating the public record.</p>
        </div>
      </Container>
    </Section>
  );
}

function LoadingCard({ className }: { className: string }) {
  return <Card className={className}><div className="h-3 w-36 rounded bg-surface-sunken" /><div className="mt-6 h-5/6 rounded-md bg-surface-sunken" /></Card>;
}

function CertificateMessage({ eyebrow, title, code, description, children }: { eyebrow: string; title: string; code: string; description: string; children?: ReactNode }) {
  return (
    <Section tone="sunken">
      <Container width="prose">
        <Card className="flex min-h-96 flex-col items-center justify-center text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-display text-ink">{title}</h1>
          {code ? <p className="mt-4 font-mono text-mono text-ink-muted">{formatCode(code)}</p> : null}
          <p className="mt-4 max-w-lg text-body text-ink-secondary">{description}</p>
          <div className="mt-8 flex gap-3">{children ?? <ButtonLink to="/verify">Try another code</ButtonLink>}</div>
        </Card>
      </Container>
    </Section>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-eyebrow uppercase text-ink-accent">{children}</h2>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="min-w-0 border-t border-line py-3 first:border-t-0 first:pt-0"><dt className="text-caption text-ink-muted">{label}</dt><dd className={`mt-1 min-w-0 text-body-sm text-ink ${mono ? "break-all font-mono text-mono-sm" : "break-words"}`}>{value}</dd></div>;
}

function Hash({ label, value }: { label: string; value: string }) {
  return <p className="mt-1 min-w-0 truncate font-mono text-mono-sm text-ink-muted" title={value}>{label}: {value.startsWith("0x") ? value : `0x${value}`}</p>;
}

function normalise(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, CODE_LENGTH);
}

function formatCode(raw: string) {
  const code = normalise(raw);
  return code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "medium" }).format(new Date(value));
}

function formatAccuracy(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)} km` : `${Math.round(value)} m`;
}

function displayAddress(address: Address | null, accuracy: number) {
  if (!address) return null;
  const regional = [address.city ?? address.county, address.region, address.country].filter(Boolean).join(", ");
  return accuracy >= 250 ? regional || null : address.formattedAddress || regional || null;
}

function networkName(chainId: number) {
  return chainId === 8453 ? "Base (Ethereum L2)" : `Chain ${chainId}`;
}

function anchorState(status: Report["anchor"]["status"]): EvidenceState {
  if (status === "confirmed") return "verified";
  if (status === "failed") return "failed";
  return "pending";
}

function anchorBackground(status: Report["anchor"]["status"]) {
  if (status === "confirmed") return "bg-verified-tint";
  if (status === "failed") return "bg-failed-tint";
  return "bg-pending-tint";
}

function anchorMessage(status: Report["anchor"]["status"]) {
  if (status === "confirmed") return "This certificate has a confirmed integrity record on Base.";
  if (status === "failed") return "The certificate exists, but its blockchain publication failed.";
  if (status === "submitted") return "The record was submitted and is waiting for confirmation.";
  return "The certificate was created and blockchain publication is queued.";
}
