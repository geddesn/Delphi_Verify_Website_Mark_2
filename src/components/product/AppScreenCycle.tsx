import { useEffect, useState } from "react";
import type { ShotName } from "@/components/product/PhoneShot";
import { cn } from "@/lib/cn";

/* ============================================================================
   APP SCREEN CYCLE
   ============================================================================
   Real product screenshots cross-fading over a SceneBackdrop, anchored right.

   Two layers, two clocks. The dwell here is deliberately out of step with the
   backdrop's (5.5s against 7s) so the two never change together — synchronised
   changes read as a slideshow, drifting ones read as ambient.

   Deliberately overflows the hero. The masters are 1350×2760, so a phone tall
   enough to be legible is taller than the section — rather than clip it, the
   hero carries z-10 and the device spills over the section below, which reads
   as a device standing in front of the page rather than a cropped image.
   That is why the backdrop clips itself instead of the section clipping both.

   Sits at z-0 alongside the backdrop and later in the DOM, so it stacks above
   it. Both stay under the Container at z-10, so copy always wins.

   Decorative: aria-hidden with empty alt. The screens repeat what the page
   already says in text, and a screen-reader user gains nothing from five
   near-identical descriptions of a phone.

   Hidden below lg — at narrow widths the phone lands on top of the headline.
   ========================================================================= */

const DWELL_MS = 5500;
const FADE_MS = 1400;

/* Intrinsic ratio of the source masters. */
const RATIO_W = 1350;
const RATIO_H = 2760;

export function AppScreenCycle({
  shots,
  className,
}: {
  shots: readonly ShotName[];
  className?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (shots.length < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const id = setInterval(
      () => setActive((i) => (i + 1) % shots.length),
      DWELL_MS,
    );
    return () => clearInterval(id);
  }, [shots.length]);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute z-0 hidden select-none lg:block",
        "right-[7%] top-20 w-[280px] xl:right-[10%] xl:w-[320px]",
        /* Anchored top-centre: origin-top is transform-origin top center, so
           the device keeps its top edge and horizontal centre as it scales
           rather than drifting toward a corner.
           0.8 × 1.08 = 0.864. */
        "origin-top scale-[0.864]",
        className,
      )}
    >
      {shots.map((name, i) => (
        <img
          key={name}
          src={`/assets/product/${name}-680.webp`}
          srcSet={`/assets/product/${name}-340.webp 340w, /assets/product/${name}-680.webp 680w`}
          sizes="320px"
          width={RATIO_W}
          height={RATIO_H}
          alt=""
          /* Never lazy — see SceneBackdrop. A frame that has not fetched by
             its turn fades in blank, and at opacity 0 the failure is silent. */
          loading="eager"
          fetchPriority="low"
          decoding="async"
          className={cn(
            "h-auto w-full transition-opacity ease-in-out",
            /* Stack every frame on the first, which sets the box height. */
            i > 0 && "absolute inset-x-0 top-0",
          )}
          style={{
            transitionDuration: `${FADE_MS}ms`,
            opacity: i === active ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
