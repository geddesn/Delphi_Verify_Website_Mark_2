import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { surfaceFrame } from "@/content/renderings";

/* ============================================================================
   WEB FRAME
   ============================================================================
   No browser chrome yet — a plain frame at the target viewport's aspect, so a
   page's rhythm is already right before anything is drawn into it.

   Lifted out of pages/PlatformRenderings.tsx alongside PhoneFrame when the
   heroes started showing the same renderings. Same reason: one definition of
   the canvas and the cover-scale, so a desktop screen cannot render at one
   size on the renderings page and another in a hero.
   ========================================================================= */

/* The canvas a web rendering is authored on: true desktop pixels, matching
   surfaceFrame.web. Same idea as PHONE_CANVAS — the box is a container and
   the canvas inside it is scaled by 100cqi / 1440px, a length over a LENGTH,
   which yields a number. Exact at any width, in CSS, with no ResizeObserver
   and nothing to go wrong between the server render and hydration. */
export const WEB_CANVAS = { width: 1440, height: 900 };

export function WebFrame({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) {
  const drawn = Boolean(children);
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-lg bg-surface",
        /* The dashed rule says "nothing here yet". Once something is, it is a
           border around a screenshot and reads as a mistake. */
        drawn
          ? "border border-line shadow-raised"
          : "border border-dashed border-line-strong",
        className,
      )}
      style={{
        aspectRatio: surfaceFrame.web.ratio,
        containerType: "size",
      }}
    >
      {/* `relative`, so a caller stacking several screens can position them
          absolutely against it — which is how the hero cross-fades. Matches
          PhoneFrame, deliberately: the two frames are used together and a
          caller should not have to remember which of them can stack. */}
      <div
        className="relative"
        style={{
          width: WEB_CANVAS.width,
          height: WEB_CANVAS.height,
          transformOrigin: "top left",
          transform: `scale(max(calc(100cqi / ${WEB_CANVAS.width}px), calc(100cqb / ${WEB_CANVAS.height}px)))`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
