import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { PhoneFrame } from "@/components/renderings/PhoneFrame";
import { MobileCapture } from "@/components/renderings/MobileCapture";
import { MobileEvidenceRecord } from "@/components/renderings/MobileEvidenceRecord";
import { MobileTasks } from "@/components/renderings/MobileTasks";

/* ============================================================================
   PHONE RENDERINGS, BY SHOT NAME
   ============================================================================
   The bridge from the old flat screenshots to the drawn screens.

   Pages across the site ask for a phone by a `shot` name — "capture",
   "certificate", "scan" — and used to get a WebP of the iOS app. Where a
   rendering now exists for that name it is used instead: real DOM at true
   device scale, crisp at any density, themed with the site's own tokens, and
   an edit rather than a re-shoot when the design moves.

   ⚠️  NOT EVERY SHOT HAS ONE, AND THE FALLBACK IS THE POINT. `scan` has no
   rendering, so /verify and the third step of /platform still serve the
   photograph. Returning null for an unknown name lets a caller keep
   PhoneShot for those, rather than forcing a wrong screen into the slot
   because it was the nearest one to hand. Add a name here only when the
   screen it maps to genuinely IS that moment.

   DECORATIVE. These are product shots beside copy that already makes the
   point, so the wrapper is aria-hidden: without it a screen reader would read
   out an entire capture checklist rendered at 390 logical pixels. That is the
   one thing the flat screenshots did better, and it is cheap to keep.
   ========================================================================= */

const BY_SHOT: Record<string, () => ReactNode> = {
  /* Guided Capture — the moment evidence is made. */
  capture: () => <MobileCapture />,
  /* The sealed record. What "create the certificate" produces. */
  certificate: () => <MobileEvidenceRecord />,
  /* The record carries its capture location on a map, which is what the old
     certificate-location screenshot was for. */
  "certificate-location": () => <MobileEvidenceRecord />,
  /* Assigned work. Not currently asked for by name anywhere, but it is the
     third drawn phone screen and leaving it out would make this list read as
     the whole set. */
  tasks: () => <MobileTasks />,
};

/** Whether a drawn screen exists for this shot name. */
export function hasRendering(shot: string): boolean {
  return shot in BY_SHOT;
}

/** A phone rendering in its frame, or nothing if the shot has no rendering.
 *  Callers pair it with PhoneShot for the names that do not. */
export function PhoneRendering({
  shot,
  className,
  width,
}: {
  shot: string;
  className?: string;
  /** Any CSS length; the frame is fluid and this only caps it. */
  width?: string;
}) {
  const render = BY_SHOT[shot];
  if (!render) return null;

  return (
    <div aria-hidden className={cn("w-full", className)}>
      <PhoneFrame width={width}>{render()}</PhoneFrame>
    </div>
  );
}
