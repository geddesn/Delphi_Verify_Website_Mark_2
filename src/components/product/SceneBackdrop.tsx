import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/* ============================================================================
   SCENE BACKDROP
   ============================================================================
   Sector photography cycling behind a hero, anchored right and masked out
   before it reaches the headline. Used on the industries and platform heroes.

   The mask does the real work. A dark scrim over the whole image would dim the
   photograph AND the text together; a horizontal alpha mask removes the image
   entirely on the left instead, so the headline sits on clean canvas and the
   picture only exists where nothing is competing with it. Fully transparent at
   the halfway line, fully present by the right edge.

   Shape and strength live in theme.css as --backdrop-fade and
   --backdrop-opacity. Tune them there, not here.

   Motion: cross-fade only, no movement, long dwell. `prefers-reduced-motion`
   stops the cycle outright rather than merely slowing it — an image that
   changes under you is exactly what that setting is for, and a hero reads fine
   on a single still. Evidence systems do not bounce.

   Decorative: aria-hidden, no alt text, not focusable. Everything it conveys
   is already in the headline beside it.

   Frames are passed in rather than imported, so a page can carry its own set.
   ========================================================================= */

export type BackdropFrame = {
  /** Basename in public/assets/backdrops, e.g. "yacht". */
  readonly name: string;
  /** Internal note only — never rendered, these are decorative. */
  readonly label: string;
};

/* Long enough to stop feeling like a slideshow. */
const DWELL_MS = 7000;
const FADE_MS = 1800;

export function SceneBackdrop({
  frames,
  className,
}: {
  frames: readonly BackdropFrame[];
  className?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (frames.length < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const id = setInterval(
      () => setActive((i) => (i + 1) % frames.length),
      DWELL_MS,
    );
    return () => clearInterval(id);
  }, [frames.length]);

  return (
    <div
      aria-hidden
      className={cn(
        /* z-0, not a negative z. A negative z-index child paints behind its
           parent's own background once the parent forms a stacking context,
           which silently blanks the whole layer. The section keeps content
           above this by putting its Container at z-10.

           Clipping lives here rather than on the section, so a sibling layer
           (the app screens) can deliberately overflow the hero. */
        "pointer-events-none absolute inset-y-0 right-0 z-0 w-full select-none overflow-hidden lg:w-3/5",
        className,
      )}
      style={{
        /* Both spellings — Safari still wants the prefixed property. */
        maskImage: "var(--backdrop-fade)",
        WebkitMaskImage: "var(--backdrop-fade)",
      }}
    >
      {frames.map((b, i) => (
        <img
          key={b.name}
          src={`/assets/backdrops/${b.name}-1440.webp`}
          srcSet={`/assets/backdrops/${b.name}-720.webp 720w, /assets/backdrops/${b.name}-1440.webp 1440w`}
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt=""
          /* Never lazy. A lazy frame that has not fetched by the time its turn
             comes round fades in blank, and because these sit at opacity 0 the
             failure is silent — the cycle just appears to skip. Subsequent
             frames load at low priority instead, so they queue behind the
             hero and the card photography without ever being skipped. */
          loading="eager"
          fetchPriority={i === 0 ? "auto" : "low"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 transition-opacity ease-in-out"
          style={{
            transitionDuration: `${FADE_MS}ms`,
            opacity: i === active ? "var(--backdrop-opacity)" : 0,
          }}
        />
      ))}
    </div>
  );
}
