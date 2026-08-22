import { cn } from "@/lib/cn";
import { alignClasses, type AnnotationSpec } from "./geometry";

/* ============================================================================
   ANNOTATION PANEL — the navy box at the far end of a leader
   ============================================================================
   Positioned by the same spec that drives its connector, so a box and its
   line can never disagree about where the box is.

   THEME-INVARIANT ON PURPOSE
   These sit ON TOP of photography. The picture underneath does not flip with
   the theme, so neither do they — see the callout tokens in theme.css, which
   are deliberately absent from both dark blocks.

   WHY THE CONTENT IS HTML AND NOT PAINTED INTO THE IMAGE
   Generated lettering is unreliable, which is why every prompt in assets-src/
   forbids text outright. Overlaying means the type is crisp, uses the real
   typeface, is editable without regenerating, is readable by screen readers,
   and can be translated for the other locales.
   ========================================================================= */

export function AnnotationPanel({
  spec,
  on,
  width = "w-[21%] min-w-[210px]",
  boxRef,
  chrome = true,
  className,
  style,
  revealDuration = "var(--duration-slow)",
  children,
}: {
  /** Where to put it. Omit to render in flow instead, letting a parent lay it
   *  out — a column that centres its children cannot be expressed as a
   *  coordinate, and its leader measures the result rather than being told. */
  spec?: Pick<AnnotationSpec, "panel" | "align">;
  /** Reveal state. Undefined means "always shown" — the static case. */
  on?: boolean;
  /** Width classes. Overridden per surface: a stage panel is smaller than a
   *  panel over a full-bleed photograph. */
  width?: string;
  /** Reports this panel's footprint so its leader lands on the real edge
   *  rather than on a guessed one — see useBoxes. */
  boxRef?: (el: HTMLElement | null) => void;
  /** Draw the panel's own surface, border and blur. Turn it OFF when the
   *  child already is an object — a device, say. A phone inside a tinted
   *  rounded rectangle reads as a picture of a phone pinned to a card, and
   *  the point of putting a device on the stage is that it is the thing
   *  itself. Position, reveal and measurement are unaffected. */
  chrome?: boolean;
  className?: string;
  /** Merged onto the positioned element. For anything that has to be a
   *  transitionable value rather than a class — a width that animates, say. */
  style?: React.CSSProperties;
  /** How long the reveal takes. Defaults to the panel rhythm every other
   *  callout uses; override where a panel is the SUBJECT of a beat rather
   *  than an annotation on one — a device coming up on the stage wants to be
   *  watched arriving, and 420ms reads as a pop at that size. */
  revealDuration?: string;
  children: React.ReactNode;
}) {
  const animated = on !== undefined;
  return (
    /* Two elements, not one. The outer holds the position and the align
       transform; the inner holds the reveal transform. Collapsing them means
       the scale-in overwrites the align translate and the panel enters from
       the wrong place — and it is also what lets useBoxes read a rect that is
       unaffected by the reveal. */
    <div
      ref={boxRef}
      className={cn(
        spec ? "absolute" : "relative",
        spec && alignClasses(spec.align),
        width,
        className,
      )}
      style={{
        ...(spec?.panel
          ? { left: `${spec.panel.x}%`, top: `${spec.panel.y}%` }
          : {}),
        ...style,
      }}
    >
      <div
        className={cn(
          chrome &&
            "overflow-hidden rounded-md border border-callout-border backdrop-blur-sm",
          animated && "transition-all",
          /* pointer-events-none as well as invisible. A hidden panel is still
             a rectangle on the stage, and one that has faded out — or has not
             faded in yet — would otherwise go on swallowing clicks meant for
             whatever is behind it. Latent until the survey card began staying
             mounted for the whole piece rather than only while it was on. */
          animated && !on && "pointer-events-none opacity-0",
        )}
        style={{
          ...(chrome ? { backgroundColor: "var(--callout-surface)" } : {}),
          ...(animated
            ? {
                transform: on ? "scale(1)" : "scale(0.96)",
                transitionDuration: revealDuration,
                transitionTimingFunction: "var(--ease-out-quart)",
              }
            : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** The Delphi mark, as a mask so it takes the panel's ink colour. */
export function PanelLogo({
  className,
  color = "var(--callout-ink)",
}: {
  className?: string;
  /** Defaults to the callout panels' ink. Override where it appears on the
   *  stage itself rather than on a panel. */
  color?: string;
}) {
  return (
    <span
      role="img"
      aria-label="Delphi Verify"
      className={cn("block h-[26px] w-[91px]", className)}
      style={{
        backgroundColor: color,
        maskImage: "url(/assets/logo.svg)",
        WebkitMaskImage: "url(/assets/logo.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
    />
  );
}

/** A photograph inside a panel — the evidence itself, rather than a
 *  description of it. Sits flush to the panel's edges.
 *
 *  `position` is the object-position of the crop, and it matters more than it
 *  looks: these render two or three hundred pixels wide, so whatever the crop
 *  discards is gone. Where two images are meant to be compared, give them the
 *  SAME position — a pair cropped differently is no longer a pair. */
export function PanelImage({
  name,
  alt,
  width = 2720,
  height = 1530,
  position = "50% 50%",
  ratio = "16 / 9",
  sizes = "240px",
  className,
}: {
  /** Basename under /assets/features. */
  name: string;
  alt: string;
  width?: number;
  height?: number;
  position?: string;
  /** Displayed aspect ratio. A prop and not a class, because cn() does not
   *  merge conflicting utilities — see src/lib/cn.ts. */
  ratio?: string;
  sizes?: string;
  className?: string;
}) {
  return (
    <img
      src={`/assets/features/${name}-480.webp`}
      srcSet={`/assets/features/${name}-240.webp 240w, /assets/features/${name}-480.webp 480w`}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      decoding="async"
      className={cn("block w-full object-cover", className)}
      style={{ aspectRatio: ratio, objectPosition: position }}
    />
  );
}

export type PanelRow = {
  icon: "date" | "location" | "integrity" | "chain" | "device";
  text: string;
};

const ICONS: Record<PanelRow["icon"], React.ReactNode> = {
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

export function RowIcon({ icon }: { icon: PanelRow["icon"] }) {
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

export function PanelRows({
  rows,
  className,
}: {
  rows: readonly PanelRow[];
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-1.5", className)}>
      {rows.map((r) => (
        <li
          key={r.text}
          className="flex gap-2 font-mono text-mono-sm text-callout-ink-muted"
        >
          <RowIcon icon={r.icon} />
          <span className="leading-snug">{r.text}</span>
        </li>
      ))}
    </ul>
  );
}
