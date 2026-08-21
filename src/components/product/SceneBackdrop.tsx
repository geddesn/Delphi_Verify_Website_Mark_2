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

/* The backdrop runs everywhere, but in two shapes. Position, size and mask all
   live in theme.css under .scene-backdrop — the mask has to change between
   portrait and landscape, and an inline style cannot carry a media query.

   Phone: a 16:9 band pinned to the bottom of the hero, fading upward, so the
   picture sits below the text rather than under it.
   Desktop: the original — full height, right-hand side, fading left to right.

   An earlier revision disabled this below lg. That fixed a real bug — a
   full-height portrait box scaled a 16:9 image to a ~4x zoomed sliver — but
   threw the effect away on mobile to do it. The band keeps both.

   What stays mobile-aware is how many frames load. They are eager by
   necessity (a lazy frame fades in blank when its turn arrives), so six is
   real bandwidth on a phone. Mobile cycles a subset. */
const DESKTOP = "(min-width: 1024px)";
const MOBILE_FRAMES = 3;

export function SceneBackdrop({
  frames,
  className,
}: {
  frames: readonly BackdropFrame[];
  className?: string;
}) {
  const [active, setActive] = useState(0);
  /* False during prerender and on first client paint, so the prerendered HTML
     carries no <img> at all and a phone never queues the fetches. Desktop
     mounts them after hydration; they fade in regardless, so the delay is not
     perceptible. */
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP);
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  /* Fewer frames on a phone, and the cycle indexes into this list rather than
     the full one, so it can never select a frame that was not rendered. */
  const shown = isDesktop ? frames : frames.slice(0, MOBILE_FRAMES);

  useEffect(() => {
    if (shown.length < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    const id = setInterval(
      () => setActive((i) => (i + 1) % shown.length),
      DWELL_MS,
    );
    return () => clearInterval(id);
  }, [shown.length]);

  /* Keep the index in range when the breakpoint changes under us. */
  useEffect(() => {
    setActive((i) => (i < shown.length ? i : 0));
  }, [shown.length]);

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
        /* Geometry and mask come from .scene-backdrop in theme.css — see the
           note there. Both breakpoints are handled in one place. */
        "scene-backdrop pointer-events-none z-0 select-none overflow-hidden",
        className,
      )}
    >
      {shown.map((b, i) => (
        <img
          key={b.name}
          src={`/assets/backdrops/${b.name}-1440.webp`}
          srcSet={`/assets/backdrops/${b.name}-720.webp 720w, /assets/backdrops/${b.name}-1440.webp 1440w`}
          /* Desktop-only component, so the small-screen branch is dead. */
          /* 60vw beside the headline on desktop; full width as a band on a
             phone. */
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
          className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity ease-in-out"
          style={{
            /* Which slice of the photograph is shown. The desktop panel is
               narrower than 16:9, so object-cover always crops horizontally —
               this decides where. Pushed right so the left of the frame is
               dropped, which is the part the mask was dissolving away anyway.
               Tune --backdrop-position in theme.css, not here.

               No effect on the mobile band, which is exactly 16:9 and so is
               not cropped at all. */
            objectPosition: "var(--backdrop-position)",
            transitionDuration: `${FADE_MS}ms`,
            opacity: i === active ? "var(--backdrop-opacity)" : 0,
          }}
        />
      ))}
    </div>
  );
}
