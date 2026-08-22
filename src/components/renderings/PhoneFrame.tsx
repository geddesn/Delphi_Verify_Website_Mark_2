import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { phoneFrame } from "@/content/renderings";

/* ============================================================================
   PHONE FRAME
   ============================================================================
   A real device frame with a rendering behind it, drawn at true device scale.

   Lifted out of pages/PlatformRenderings.tsx when the homepage hero started
   showing the same screens. Two copies of this would have been two places to
   remember when the frame image is re-shot and its four aperture percentages
   have to be measured again — and nothing fails loudly when those go stale,
   the renderings just sit crooked inside the bezel.

   The screen is a plain rectangle on the measured aperture. It needs no
   rounded corners and no notch cut-out: the bezel is opaque and paints over
   it, so the image does the masking the way glass does on a real phone. See
   the note beside `phoneFrame` in content/renderings.ts.
   ========================================================================= */

/* The canvas a mobile rendering is authored on: true iPhone logical pixels,
   so `text-[15px]` inside one really is 15px on the device.

   The screen box is a container and the canvas inside it is scaled by
   100cqi / 390px — a length divided by a LENGTH, which yields a number, so
   the scale is exact at any width with no JavaScript and no ResizeObserver.

   That matters more than it looks. TrustEngine solves the same problem with
   useStageScale, but it measures in an effect and returns 1 on the server, so
   its prerendered HTML is unscaled until React hydrates. Doing it in CSS
   means the markup is right in the HTML itself — which is what lets this sit
   in a prerendered hero without a frame of the wrong size on first paint. */
export const PHONE_CANVAS = { width: 390, height: 844 };

export function PhoneFrame({
  children,
  width,
  className,
  /* The hero paints the device over sector photography and wants it to load
     with the rest of the fold; the renderings page has five of them down a
     long scroll. */
  loading = "lazy",
}: {
  children?: ReactNode;
  /** Any CSS length. The frame is fluid — this only caps it. */
  width?: string;
  className?: string;
  loading?: "eager" | "lazy";
}) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={width ? { maxWidth: width } : undefined}
    >
      {/* The screen. First in the DOM so the frame — which is also positioned
          — paints on top of it. */}
      <div
        className="absolute overflow-hidden bg-surface-sunken"
        style={{
          left: phoneFrame.screen.left,
          top: phoneFrame.screen.top,
          width: phoneFrame.screen.width,
          height: phoneFrame.screen.height,
          /* `size`, not `inline-size`: the cover scale below reads cqb as
             well as cqi, and block-axis units need size containment. */
          containerType: "size",
        }}
      >
        {/* The canvas. Fixed at device pixels and scaled to the screen, so
            everything inside is authored at the size it is really held at.

            `relative`, so a caller stacking several screens can position them
            absolutely against it — which is how the hero cross-fades. */}
        <div
          className="relative"
          style={{
            width: PHONE_CANVAS.width,
            height: PHONE_CANVAS.height,
            transformOrigin: "top left",
            /* Cover, not fit. This frame's aperture is 774x1680 — a 0.4607
               ratio against the iPhone's own 0.4621 — so scaling on width
               alone leaves the canvas 2px short and a sliver of the wrong
               colour shows under the tab bar. Taking the larger of the two
               scales fills the aperture and spills ~1px sideways, which the
               bezel clips. It also means the next frame's ratio, whatever it
               is, needs no arithmetic here. */
            transform: `scale(max(calc(100cqi / ${PHONE_CANVAS.width}px), calc(100cqb / ${PHONE_CANVAS.height}px)))`,
          }}
        >
          {children}
        </div>
      </div>

      {/* Decorative: the device is a frame around the rendering, not
          information, so it is hidden from assistive technology. width and
          height carry the intrinsic ratio, which is what gives the screen box
          something to be a percentage of before the image loads. */}
      <img
        aria-hidden
        alt=""
        src={`${phoneFrame.base}-384.webp`}
        srcSet={`${phoneFrame.base}-384.webp 384w, ${phoneFrame.base}-768.webp 768w, ${phoneFrame.base}-928.webp 928w`}
        sizes={width}
        width={phoneFrame.width}
        height={phoneFrame.height}
        loading={loading}
        decoding="async"
        className="relative block w-full"
      />
    </div>
  );
}
