import { cn } from "@/lib/cn";
import { departurePoint, type AnnotationSpec, type Rect } from "./geometry";

/* ============================================================================
   LEADERS — the connector line, and the dot it lands on
   ============================================================================
   The house connector, after the reference composite "Delphi Verify for
   Staged Construction". Every leader on the site is drawn by this component
   so they cannot drift apart.

   TWO PASSES, ALWAYS
   A white hairline vanishes against a pale sky — and a pale sky is exactly
   what these sit on most often. So each line is drawn twice: a wider dark
   halo underneath, the white line over it. The same trick that keeps map
   labels legible over arbitrary terrain.

   THE DRAW
   A leader grows out of its caption toward the thing it names, over
   --duration-draw. That direction is the whole point: the caption is the
   claim, the dot is the evidence, and the line is the eye being walked from
   one to the other. It is stroke-dashoffset running to zero, which extends
   the visible dash from (x1,y1) — so x1,y1 must be the CAPTION end.

   ⚠️  WHY THERE IS NO viewBox HERE, AND NO non-scaling-stroke
   The obvious build is viewBox="0 0 100 100" + preserveAspectRatio="none", so
   percentages become plain numbers, plus vectorEffect="non-scaling-stroke" to
   undo the resulting stroke distortion. That combination CANNOT be animated:
   under non-scaling-stroke the dash array is measured in screen pixels and
   the pathLength normalisation is ignored, so strokeDasharray={1} renders as
   one-pixel dashes — a permanently dotted line.

   Percentage coordinates on a plain SVG give the identical geometry with none
   of that. x resolves against the viewport width, y against its height, one
   user unit is one CSS pixel, so stroke widths are already screen-accurate
   and pathLength behaves.

   The dots are drawn OUTSIDE the SVG so a percentage width and a percentage
   height cannot render them as ellipses.

   COLOUR
   Leaders are white. They are not a status readout — colouring them by state
   turns a stage into a diagram of angry wires, and it competes with the dots
   and panels, which is where state actually belongs.
   ========================================================================= */

export type LeaderSpec = AnnotationSpec & {
  /** Drawn state. Undefined means "always drawn" — the static case. */
  on?: boolean;
};

export function Leaders({
  specs,
  boxes,
  className,
}: {
  specs: LeaderSpec[];
  /** Measured rects by spec id, from useBoxes. Wins over the authored
   *  position and footprint both. */
  boxes?: Record<string, Rect>;
  className?: string;
}) {
  return (
    <svg
      className={cn("pointer-events-none absolute inset-0 h-full w-full", className)}
      aria-hidden
    >
      {specs.map((spec) => {
        const d = departurePoint(spec, boxes?.[spec.id]);
        const animated = spec.on !== undefined;
        const on = spec.on ?? true;

        /* pathLength normalises the line to 1, so one dash of 1 covers it
           whole and an offset of 1 hides it completely. */
        const draw = animated
          ? {
              pathLength: 1,
              strokeDasharray: 1,
              strokeDashoffset: on ? 0 : 1,
              style: {
                transition: "stroke-dashoffset var(--duration-draw) var(--ease-out-quart)",
              },
            }
          : {};

        return (
          <g
            key={spec.id}
            style={
              animated
                ? {
                    /* Guards the round caps. A dash of exactly zero length
                       still paints its caps in some engines, which would leave
                       a stray dot sitting on the panel edge when the leader is
                       meant to be absent. Snapped, not eased — the draw is the
                       animation the eye should follow. */
                    opacity: on ? 1 : 0,
                    transition: "opacity var(--duration-fast) linear",
                  }
                : undefined
            }
          >
            <line
              x1={`${d.x}%`}
              y1={`${d.y}%`}
              x2={`${spec.anchor.x}%`}
              y2={`${spec.anchor.y}%`}
              stroke="var(--callout-halo)"
              strokeWidth="3.5"
              strokeLinecap="round"
              {...draw}
            />
            <line
              x1={`${d.x}%`}
              y1={`${d.y}%`}
              x2={`${spec.anchor.x}%`}
              y2={`${spec.anchor.y}%`}
              stroke="var(--callout-line)"
              strokeWidth="1.25"
              strokeLinecap="round"
              {...draw}
            />
          </g>
        );
      })}
    </svg>
  );
}

/** The dot at the far end of a leader. Dark ring, not a white one — it
 *  usually lands on a pale hull or deck, where a white halo would vanish.
 *
 *  `on` lands it after the line arrives rather than with it, so the gesture
 *  reads as caption → line → evidence rather than as three things appearing
 *  at once. */
export function AnchorDot({
  at,
  on,
  className,
  style,
  size = "sm",
}: {
  at: { x: number; y: number };
  on?: boolean;
  className?: string;
  style?: React.CSSProperties;
  size?: "sm" | "md";
}) {
  const animated = on !== undefined;
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-callout-ink",
        size === "sm" ? "h-2.5 w-2.5 ring-[3px]" : "h-3 w-3 ring-4",
        "ring-callout-halo",
        className,
      )}
      style={{
        left: `${at.x}%`,
        top: `${at.y}%`,
        ...(animated
          ? {
              opacity: on ? 1 : 0,
              transition: "opacity var(--duration-normal) var(--ease-out-quart)",
              transitionDelay: on ? "var(--duration-draw)" : "0ms",
            }
          : {}),
        ...style,
      }}
    />
  );
}
