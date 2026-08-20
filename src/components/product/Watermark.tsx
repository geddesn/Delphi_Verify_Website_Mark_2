import { cn } from "@/lib/cn";

/* ============================================================================
   IMAGE WATERMARK
   ============================================================================
   The Delphi mark placed over scene photography, so a card reads as "Delphi
   Verify, for this industry" rather than as a stock picture of an asset.

   Computed at runtime rather than baked into the image files. Same reasoning
   as the callout panels: one source of truth for the mark, no regeneration
   when the logo changes, crisp at any resolution, and it can be repositioned
   or removed per image without touching a pixel.

   It is applied as a CSS mask painted with a token, not an <img>, because that
   is what allows it to be recoloured — an <img> of a navy logo would disappear
   against a dark hull.

   Contrast: photographs are arbitrary, so white alone is unreliable — the sky
   behind a yacht is nearly white. A drop-shadow in --watermark-shade sits under
   it, the same trick the callout leaders use.

   NOT used inside the expanded composite: the callout panels already carry the
   logo, and a third mark would be noise.
   ========================================================================= */

/* The logo is 284×80, so width is height × 3.55. Kept as explicit pairs rather
   than an aspect ratio because the mask needs a definite box to paint into. */
const SIZES = {
  sm: "h-4 w-[57px]",
  md: "h-8 w-[114px]",
} as const;

export function Watermark({
  className,
  position = "top-left",
  size = "md",
}: {
  className?: string;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  size?: keyof typeof SIZES;
}) {
  const place = {
    "top-left": "left-4 top-4",
    "top-right": "right-4 top-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
  }[position];

  return (
    <span
      role="img"
      aria-label="Delphi Verify"
      className={cn("pointer-events-none absolute", SIZES[size], place, className)}
      style={{
        backgroundColor: "var(--watermark-ink)",
        maskImage: "url(/assets/logo.svg)",
        WebkitMaskImage: "url(/assets/logo.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "left center",
        WebkitMaskPosition: "left center",
        /* A larger mark spans more of the photograph, so it meets more varied
           backgrounds — the shadow is scaled up with it to keep contrast. */
        filter: "drop-shadow(0 2px 4px var(--watermark-shade))",
      }}
    />
  );
}
