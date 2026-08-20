import { cn } from "@/lib/cn";

/* ============================================================================
   ANNOTATED FIGURE — photograph + positionable callout panels
   ============================================================================
   After the reference composite "Delphi Verify for Staged Construction":
   a navy panel, a hairline leader, a small dot on the asset.

   WHY THE PANELS ARE HTML AND NOT PAINTED INTO THE IMAGE
   Generated lettering is unreliable — which is why every prompt in
   assets-src/ forbids text outright. Overlaying instead means the type is
   crisp, uses the real typeface, can be edited without regenerating, is
   readable by screen readers, and can be translated for the other locales.

   It also sidesteps cropping: positions are percentages of the CONTAINER, not
   of the image file, so a callout can never be cropped off the way a painted
   annotation would be.

   POSITIONING
   Every coordinate is a percentage of the container box, origin top-left:

     anchor : the dot on the asset
     panel  : the panel, positioned by `align` corner

   `align` decides which corner of the panel sits at `panel`, so a panel on the
   right of the frame can be anchored by its right edge and never overflow.

   The connector is drawn automatically between the panel's edge and the dot.
   Set `from` to force which edge it leaves, otherwise it is chosen from the
   relative position of the two points.

   TUNING
   Pass `debug` to overlay a 10% grid with labelled axes — read the numbers
   off the picture, type them in. Never ship with debug on; it is dev-only
   scaffolding, not a feature.
   ========================================================================= */

export type CalloutRow = {
  icon: "date" | "location" | "integrity" | "chain" | "device";
  text: string;
};

export type CalloutSpec = {
  id: string;
  title: string;
  subtitle?: string;
  rows: CalloutRow[];
  /** Dot on the asset, % of container. */
  anchor: { x: number; y: number };
  /** Panel position, % of container. */
  panel: { x: number; y: number };
  /** Which panel corner sits at `panel`. Default "top-left". */
  align?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Force the connector's departure edge. Default: inferred. */
  from?: "top" | "bottom" | "left" | "right";
};

const ICONS: Record<CalloutRow["icon"], React.ReactNode> = {
  date: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </>
  ),
  location: (
    <>
      <path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14Z" />
      <circle cx="8" cy="6.5" r="1.75" />
    </>
  ),
  integrity: (
    <>
      <path d="M8 2 13 4.2v3.4c0 3.1-2.1 5.2-5 6.4-2.9-1.2-5-3.3-5-6.4V4.2L8 2Z" />
      <path d="m5.9 8 1.5 1.5L10.4 6.5" />
    </>
  ),
  chain: (
    <>
      <rect x="2" y="6" width="5.5" height="4" rx="2" />
      <rect x="8.5" y="6" width="5.5" height="4" rx="2" />
      <path d="M6 8h4" />
    </>
  ),
  device: (
    <>
      <rect x="4.5" y="1.5" width="7" height="13" rx="1.5" />
      <path d="M7 12.5h2" />
    </>
  ),
};

function RowIcon({ icon }: { icon: CalloutRow["icon"] }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[icon]}
    </svg>
  );
}

/** Where the connector leaves the panel, in container %. */
function departurePoint(c: CalloutSpec, w: number, h: number) {
  const align = c.align ?? "top-left";
  const left = align.endsWith("left") ? c.panel.x : c.panel.x - w;
  const top = align.startsWith("top") ? c.panel.y : c.panel.y - h;
  const cx = left + w / 2;
  const cy = top + h / 2;

  const side =
    c.from ??
    (Math.abs(c.anchor.y - cy) >= Math.abs(c.anchor.x - cx)
      ? c.anchor.y > cy
        ? "bottom"
        : "top"
      : c.anchor.x > cx
        ? "right"
        : "left");

  switch (side) {
    case "top":
      return { x: cx, y: top };
    case "bottom":
      return { x: cx, y: top + h };
    case "left":
      return { x: left, y: cy };
    default:
      return { x: left + w, y: cy };
  }
}

/* Panel footprint as a share of the container, used only to work out where the
   connector should start. Approximate on purpose: the line meets the panel
   edge, and a few tenths of a percent is invisible. Tune if the panel width
   class below changes materially. */
const PANEL_W = 21;
const PANEL_H = 17;

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
  return (
    <figure className={cn("m-0", className)}>
      <div className="relative overflow-hidden rounded-lg border border-line">
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

        {/* Connectors and dots. One SVG in container space so the geometry
            stays correct at any width. */}
        <svg
          className={cn(
            "pointer-events-none absolute inset-0 h-full w-full",
            overlayVisibility,
          )}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {callouts.map((c) => {
            const d = departurePoint(c, PANEL_W, PANEL_H);
            /* Two passes: a wider dark halo, then the white line over it. A
               single white hairline disappears against a pale sky, which is
               exactly the background these sit on most often.

               NOTE: with vectorEffect="non-scaling-stroke", strokeWidth is in
               SCREEN pixels rather than viewBox units. */
            return (
              <g key={c.id}>
                <line
                  x1={d.x}
                  y1={d.y}
                  x2={c.anchor.x}
                  y2={c.anchor.y}
                  stroke="var(--callout-halo)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <line
                  x1={d.x}
                  y1={d.y}
                  x2={c.anchor.x}
                  y2={c.anchor.y}
                  stroke="var(--callout-line)"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </g>
            );
          })}
        </svg>

        {/* Dots drawn outside the stretched SVG so they stay circular. */}
        {callouts.map((c) => (
          <span
            key={`${c.id}-dot`}
            aria-hidden
            /* Dark ring, not a white one — the dot usually lands on a pale
               hull or deck, where a white halo would vanish. */
            className={cn(
              "pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-callout-ink ring-[3px] ring-callout-halo",
              /* Dots stay visible even when panels are suppressed — they signal
                 that there is something to expand. */
              panels === "never" ? "block" : overlayVisibility,
            )}
            style={{ left: `${c.anchor.x}%`, top: `${c.anchor.y}%` }}
          />
        ))}

        {/* Panels. Hidden below lg — see the list underneath. */}
        {callouts.map((c) => {
          const align = c.align ?? "top-left";
          return (
            <div
              key={`${c.id}-panel`}
              className={cn(
                "absolute w-[21%] min-w-[210px] rounded-md border border-callout-border p-4 backdrop-blur-sm",
                overlayVisibility,
                align.endsWith("right") && "-translate-x-full",
                align.startsWith("bottom") && "-translate-y-full",
              )}
              style={{
                left: `${c.panel.x}%`,
                top: `${c.panel.y}%`,
                backgroundColor: "var(--callout-surface)",
              }}
            >
              <CalloutBody callout={c} />
            </div>
          );
        })}

        {debug && <DebugGrid callouts={callouts} />}
      </div>

      {/* Below lg the panels would cover the photograph and be illegible, so
          they become an ordinary list. Same content, same order, no overlay. */}
      {showStackedList && (
      <ul className={cn("mt-4 grid gap-3 sm:grid-cols-2", panels === "auto" && "lg:hidden")}>
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

function CalloutBody({ callout }: { callout: CalloutSpec }) {
  return (
    <div className="text-callout-ink">
      <span
        role="img"
        aria-label="Delphi Verify"
        className="mb-3 block h-4 w-[57px]"
        style={{
          backgroundColor: "var(--callout-ink)",
          maskImage: "url(/assets/logo.svg)",
          WebkitMaskImage: "url(/assets/logo.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
        }}
      />
      <h3 className="text-body font-semibold leading-tight">{callout.title}</h3>
      {callout.subtitle && (
        <p className="mt-0.5 text-body-sm text-callout-ink-muted">
          {callout.subtitle}
        </p>
      )}
      <ul className="mt-3 flex flex-col gap-1.5">
        {callout.rows.map((r) => (
          <li
            key={r.text}
            className="flex gap-2 font-mono text-mono-sm text-callout-ink-muted"
          >
            <RowIcon icon={r.icon} />
            <span className="leading-snug">{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
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
