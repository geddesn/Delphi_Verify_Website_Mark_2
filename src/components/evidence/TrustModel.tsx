import { trustModel } from "@/content/home";
import { cn } from "@/lib/cn";

/* ============================================================================
   TRUST MODEL  —  two counterparties, one independent record
   ============================================================================
   Built from markup and tokens, not from a picture of a diagram.

   The raster version this replaces was an image of text: it could not reflow,
   could not be read aloud, was invisible to search, and its copy could not
   live in src/content like every other word on the site. Everything here is
   real text in real elements, so all four of those problems disappear and the
   whole thing themes for free.

   Structure is the argument: A and B are drawn identically and symmetrically —
   same width, same border, same weight — because the point is that neither
   side is privileged. Delphi sits between them, raised by surface and an
   accent rule rather than by size or colour, because "authoritative" here
   should read as neutral, not loud.

   Evidence colours are reserved for verification state, so nothing here is
   green, amber or red. Structure is line and ink; the only accent is the
   centre column and the connector rules.
   ========================================================================= */

export function TrustModel({ className }: { className?: string }) {
  const [a, b] = trustModel.parties;

  return (
    <div className={cn("flex flex-col gap-px", className)}>
      {/* ── the three positions ── */}
      {/* Five tracks for five children: party, connector, centre, connector,
          party. A three-column track wraps them onto two rows. */}
      <div className="grid gap-px lg:grid-cols-[1fr_auto_minmax(0,22rem)_auto_1fr] lg:items-stretch">
        <PartyPanel party={a} />

        {/* Connectors. Horizontal on wide screens, vertical when the columns
            stack — an arrow pointing right into a panel that is now below it
            would be actively misleading. */}
        <Connector />

        <PanelCentre />

        <Connector flip />

        <PartyPanel party={b} align="end" />
      </div>

      {/* ── what is being recorded ── */}
      <div className="flex flex-col gap-3 border border-line bg-surface-sunken p-6 md:flex-row md:items-baseline md:gap-6">
        <span className="shrink-0 font-mono text-mono-sm uppercase text-ink-muted">
          {trustModel.event.label}
        </span>
        <div className="flex flex-col gap-2">
          <p className="text-body-sm text-ink">{trustModel.event.examples}</p>
          <p className="text-body-sm text-ink-secondary">
            {trustModel.event.note}
          </p>
        </div>
      </div>

      {/* ── what it produces ── */}
      <ul className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
        {trustModel.outcomes.map((o) => (
          <li
            key={o}
            className="flex items-center gap-3 border border-line bg-surface-raised px-5 py-4"
          >
            <span aria-hidden className="h-px w-4 shrink-0 bg-accent" />
            <span className="text-body-sm font-semibold text-ink">{o}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PartyPanel({
  party,
  align = "start",
}: {
  party: (typeof trustModel.parties)[number];
  align?: "start" | "end";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border border-line bg-surface-raised p-6 md:p-8",
        /* Mirrored on wide screens so both panels lean toward the centre. */
        align === "end" && "lg:text-right",
      )}
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-subheading text-ink">{party.label}</h3>
        <p className="font-mono text-mono-sm text-ink-muted">{party.roles}</p>
      </div>

      <p className="text-body-sm text-ink-secondary">{party.holds}</p>

      <p
        className={cn(
          "mt-auto border-l-2 border-line-strong pl-4 text-body-sm italic text-ink",
          align === "end" && "lg:border-l-0 lg:border-r-2 lg:pl-0 lg:pr-4",
        )}
      >
        “{party.concern}”
      </p>
    </div>
  );
}

function PanelCentre() {
  return (
    <div className="flex flex-col gap-5 border-2 border-accent bg-surface p-6 md:p-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-mono-sm uppercase text-ink-accent">
          Independent record
        </span>
        <h3 className="text-heading text-ink">Delphi Verify</h3>
      </div>

      <ol className="flex flex-col gap-3">
        {trustModel.stages.map((s) => (
          <li key={s.n} className="flex gap-4 border-t border-line pt-3">
            <span className="shrink-0 font-mono text-mono-sm text-ink-muted">
              {s.n}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="text-body-sm font-semibold text-ink">
                {s.title}
              </span>
              <span className="text-body-sm text-ink-secondary">{s.body}</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Hairline run with a arrowhead, pointing inward toward the centre column.
 *  Rotates to vertical when the layout stacks. */
function Connector({ flip = false }: { flip?: boolean }) {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center py-4 text-line-strong lg:px-4 lg:py-0"
    >
      <svg
        viewBox="0 0 40 8"
        className={cn(
          "h-2 w-10 rotate-90 lg:rotate-0",
          flip && "rotate-[270deg] lg:rotate-180",
        )}
        fill="none"
      >
        <path d="M0 4 H33" stroke="currentColor" />
        <path d="M40 4 L31 0.5 V7.5 Z" fill="currentColor" />
      </svg>
    </div>
  );
}
