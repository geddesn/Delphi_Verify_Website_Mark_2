import { cn } from "@/lib/cn";
import {
  AnnotationPanel,
  PanelLogo,
  PanelRows,
  RowIcon,
  type PanelRow,
} from "@/components/annotation/Panel";
import { AnchorDot, Leaders } from "@/components/annotation/Leaders";
import { useBoxes } from "@/components/annotation/useBoxes";
import { useDrawOnView } from "@/components/annotation/useDrawOnView";
import type { Align, Side } from "@/components/annotation/geometry";

/* ============================================================================
   ANNOTATED FIGURE — photograph + positionable callout panels
   ============================================================================
   After the reference composite "Delphi Verify for Staged Construction": a
   navy panel, a hairline leader, a small dot on the asset.

   The geometry, the leader treatment and the panel itself now live in
   src/components/annotation/ and are shared with the trust engine stage.
   What is left here is the one thing specific to a photograph: the below-lg
   fallback, where the panels would cover the picture and become illegible, so
   they turn into an ordinary list instead.

   POSITIONING — see annotation/geometry.ts. Every coordinate is a percentage
   of the CONTAINER, origin top-left, which is what makes a callout impossible
   to crop off.

   TUNING
   Pass `debug` to overlay a 10% grid with labelled axes — read the numbers off
   the picture, type them in. Never ship with debug on; it is dev-only
   scaffolding, not a feature.
   ========================================================================= */

export type CalloutRow = PanelRow;

export type CalloutSpec = {
  id: string;
  title: string;
  subtitle?: string;
  rows: CalloutRow[];
  /** Dot on the asset, % of container. */
  anchor: { x: number; y: number };
  /** Panel position, % of container. */
  panel: { x: number; y: number };
  /** Which part of the panel sits at `panel`. Default "top-left". */
  align?: Align;
  /** Force the connector's departure edge. Default: inferred. */
  from?: Side;
};

export function AnnotatedFigure({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  callouts,
  debug = false,
  panels = "auto",
  showStackedList = true,
  className,
}: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
  callouts: CalloutSpec[];
  debug?: boolean;
  /** "auto" hides panels below the lg VIEWPORT — correct only when the figure
   *  is full-width. Use "never" when it sits in a narrow container on a wide
   *  screen (panels would render unreadably small), and "always" inside the
   *  expanded dialog. */
  panels?: "auto" | "always" | "never";
  /** The below-lg fallback list. Off inside the dialog, which shows panels. */
  showStackedList?: boolean;
  className?: string;
}) {
  const overlayVisibility =
    panels === "always" ? "block" : panels === "never" ? "hidden" : "hidden lg:block";

  /* The leaders grow out of their panels when the figure is reached, and
     again each time one is mounted — which is what animates the dialog. */
  const { ref: frame, drawn } = useDrawOnView<HTMLDivElement>();
  const { boxes, register } = useBoxes(frame);
  const specs = callouts.map((c) => ({ ...c, on: drawn }));

  return (
    <figure className={cn("m-0", className)}>
      <div ref={frame} className="relative overflow-hidden rounded-lg border border-line">
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />

        <Leaders specs={specs} boxes={boxes} className={overlayVisibility} />

        {callouts.map((c) => (
          <AnchorDot
            key={`${c.id}-dot`}
            at={c.anchor}
            on={drawn}
            /* Dots stay visible even when panels are suppressed — they signal
               that there is something to expand. */
            className={panels === "never" ? "block" : overlayVisibility}
          />
        ))}

        {callouts.map((c) => (
          <AnnotationPanel
            key={`${c.id}-panel`}
            spec={c}
            boxRef={register(c.id)}
            className={overlayVisibility}
          >
            <div className="p-4 text-callout-ink">
              {/* 1.6x the original 16px height. Both axes move together —
                  maskSize:contain preserves the logo's ratio inside the box, so
                  the box has to keep roughly the same proportion or it just
                  leaves dead space. 2x was too heavy against the body text. */}
              <PanelLogo className="mb-3" />
              <h3 className="text-body font-semibold leading-tight">{c.title}</h3>
              {c.subtitle && (
                <p className="mt-0.5 text-body-sm text-callout-ink-muted">
                  {c.subtitle}
                </p>
              )}
              <PanelRows rows={c.rows} className="mt-3" />
            </div>
          </AnnotationPanel>
        ))}

        {debug && <DebugGrid callouts={callouts} />}
      </div>

      {/* Below lg the panels would cover the photograph and be illegible, so
          they become an ordinary list. Same content, same order, no overlay. */}
      {showStackedList && (
        <ul
          className={cn(
            "mt-4 grid gap-3 sm:grid-cols-2",
            panels === "auto" && "lg:hidden",
          )}
        >
          {callouts.map((c) => (
            <li
              key={`${c.id}-stacked`}
              className="rounded-md border border-line bg-surface-raised p-4"
            >
              <h3 className="text-body font-semibold text-ink">{c.title}</h3>
              {c.subtitle && (
                <p className="mt-0.5 text-body-sm text-ink-secondary">{c.subtitle}</p>
              )}
              <ul className="mt-3 flex flex-col gap-1.5">
                {c.rows.map((r) => (
                  <li
                    key={r.text}
                    className="flex gap-2 font-mono text-mono-sm text-ink-muted"
                  >
                    <RowIcon icon={r.icon} />
                    {r.text}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

/** Dev-only placement aid: a 10% grid with labelled axes, plus a readout of
 *  each callout's current coordinates. Read the numbers off, type them in. */
function DebugGrid({ callouts }: { callouts: CalloutSpec[] }) {
  const ticks = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);
  return (
    <div className="pointer-events-none absolute inset-0">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={t} y1="0" x2={t} y2="100" stroke="var(--callout-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <line x1="0" y1={t} x2="100" y2={t} stroke="var(--callout-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
      </svg>
      {ticks.map((t) => (
        <span key={`x${t}`} className="absolute top-0 font-mono text-mono-sm text-callout-ink" style={{ left: `${t}%` }}>
          {t}
        </span>
      ))}
      {ticks.map((t) => (
        <span key={`y${t}`} className="absolute left-0 font-mono text-mono-sm text-callout-ink" style={{ top: `${t}%` }}>
          {t}
        </span>
      ))}
      <div className="absolute bottom-2 right-2 rounded-md p-3 font-mono text-mono-sm text-callout-ink" style={{ backgroundColor: "var(--callout-surface)" }}>
        {callouts.map((c) => (
          <div key={c.id}>
            {c.id}: panel {c.panel.x},{c.panel.y} · anchor {c.anchor.x},{c.anchor.y}
          </div>
        ))}
      </div>
    </div>
  );
}
