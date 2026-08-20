import { cn } from "@/lib/cn";

/* ============================================================================
   EVIDENCE COMPONENTS
   ============================================================================
   The visual signature of the site. Monospace, hairlines and state colour are
   used as *material* here, not decoration — this is what makes Delphi read as
   an instrument of record rather than a SaaS landing page.

   Rule: the evidence colours (verified / pending / failed) may only ever be
   used to express verification state. If green appears anywhere on this site,
   it means "verified".
   ========================================================================= */

export type EvidenceState = "verified" | "pending" | "failed";

const stateStyles: Record<EvidenceState, string> = {
  verified: "text-verified bg-verified-tint",
  pending: "text-pending bg-pending-tint",
  failed: "text-failed bg-failed-tint",
};

const stateLabels: Record<EvidenceState, string> = {
  verified: "Verified",
  pending: "Pending",
  failed: "Failed",
};

export function StateDot({ state }: { state: EvidenceState }) {
  const colour =
    state === "verified"
      ? "bg-verified"
      : state === "pending"
        ? "bg-pending"
        : "bg-failed";
  return <span aria-hidden className={cn("h-1.5 w-1.5 rounded-full", colour)} />;
}

export function EvidenceChip({
  state,
  label,
  className,
}: {
  state: EvidenceState;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-2 py-1 font-mono text-mono-sm uppercase",
        stateStyles[state],
        className,
      )}
    >
      <StateDot state={state} />
      {label ?? stateLabels[state]}
    </span>
  );
}

/** A labelled monospace value — coordinates, timestamps, certificate IDs.
 *  The workhorse of the evidential aesthetic. */
export function DataRow({
  label,
  value,
  truncate = false,
}: {
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-line py-2.5">
      <span className="shrink-0 text-caption text-ink-muted">{label}</span>
      <span
        className={cn(
          "text-right font-mono text-mono text-ink tabular",
          truncate && "truncate",
        )}
        title={truncate ? value : undefined}
      >
        {value}
      </span>
    </div>
  );
}

/** The verification chain — each independent check, and whether it agreed.
 *  This is the single clearest expression of "we don't rely on one signal". */
export function ChainList({
  items,
  className,
}: {
  items: readonly { label: string; state: string }[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center justify-between gap-4 border-t border-line py-2.5"
        >
          <span className="text-body-sm text-ink-secondary">{item.label}</span>
          <EvidenceChip state={item.state as EvidenceState} />
        </li>
      ))}
    </ul>
  );
}

/** Hero/panel certificate preview. Deliberately restrained: this is meant to
 *  look like a record, not a dashboard. */
export function CertificatePanel({
  status,
  assetLabel,
  certificateId,
  capturedAt,
  coordinates,
  hash,
  chain,
  className,
}: {
  status: string;
  assetLabel: string;
  certificateId: string;
  capturedAt: string;
  coordinates: string;
  hash: string;
  chain: readonly { label: string; state: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full rounded-lg border border-line bg-surface-raised p-6 shadow-raised",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-eyebrow uppercase text-ink-muted">
            Evidence status
          </span>
          <span className="text-subheading text-ink">{status}</span>
        </div>
        <EvidenceChip state="verified" label={status} />
      </div>

      <p className="mt-1 text-caption text-ink-muted">{assetLabel}</p>

      <div className="mt-5">
        <DataRow label="Certificate" value={certificateId} />
        <DataRow label="Captured" value={capturedAt} />
        <DataRow label="Coordinates" value={coordinates} />
        <DataRow label="Evidence hash" value={hash} truncate />
      </div>

      <p className="mt-6 text-eyebrow uppercase text-ink-muted">
        Verification chain
      </p>
      <ChainList items={chain} className="mt-1" />
    </div>
  );
}

/** Illustrative only — makes clear that sample data is sample data. */
export function IllustrativeNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-caption text-ink-muted", className)}>
      Illustrative certificate. Values shown are examples.
    </p>
  );
}
