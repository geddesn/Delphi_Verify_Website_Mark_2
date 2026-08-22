import { useEffect, useRef } from "react";

/* ============================================================================
   useDemoScroll — walk a rendering down its own page and back
   ============================================================================
   The renderings are real pages, taller than the frame they sit in, and they
   scroll. That solves the honesty problem — nothing is a crop of a screen that
   never existed — but it creates a discovery one: a reader looking at a phone
   on a marketing page does not know there is more below the fold, and will not
   try to find out.

   So the frame walks itself down and back up once it is looked at. It is a
   demonstration, not a carousel: one slow pass, held at each end long enough
   to read, then repeating.

   THREE THINGS IT MUST NOT DO, and each is a real failure mode:

   1. Fight the reader. The container is genuinely scrollable, so the moment
      anyone touches it the animation stands down for good. An element that
      scrolls back to where it wants to be is worse than one that never moved.

   2. Run off screen. Five of these on one page, all animating whether or not
      they are visible, is five timers and five layout passes a second for
      nothing. An IntersectionObserver gates it.

   3. Override prefers-reduced-motion. Scrolling content is exactly what that
      setting exists to stop. It bails before observing anything — and because
      the container is a real scroller, the content is still reachable, which
      is the whole reason this is scroll rather than a transform.

   Scroll position rather than a transform, deliberately: a transform would
   move the pixels without moving the scrollport, so the scrollbar, the reader
   and any future anchor link would all disagree about where the page is.
   ========================================================================= */

/* One full pass. Long, because the point is to be read rather than noticed —
   at ten seconds it reads as a fidget, at thirty nobody waits. */
const CYCLE_MS = 19_000;

/* Where the pass holds still, as fractions of the cycle: at the top, then at
   the bottom. The rest is spent travelling. */
const HOLD_TOP = 0.1;
const RUN_DOWN = 0.36;
const HOLD_BOTTOM = 0.16;

const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/** Where the scroll should be, 0 to 1, at this point in the cycle. */
function progress(t: number): number {
  const downEnd = HOLD_TOP + RUN_DOWN;
  const bottomEnd = downEnd + HOLD_BOTTOM;
  if (t < HOLD_TOP) return 0;
  if (t < downEnd) return easeInOut((t - HOLD_TOP) / RUN_DOWN);
  if (t < bottomEnd) return 1;
  return 1 - easeInOut(Math.min(1, (t - bottomEnd) / (1 - bottomEnd)));
}

export function useDemoScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof matchMedia === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    let raf = 0;
    /* The clock is anchored the first time the frame becomes visible rather
       than at mount, so a rendering low down the page begins its pass at the
       top when the reader arrives at it — not somewhere in the middle,
       already scrolled, having animated to nobody. */
    let startedAt = 0;
    let surrendered = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /* Any deliberate input and it never runs again. Not a pause: a reader who
       has taken hold of this wants to look at something, and giving it back
       four seconds later would take it away from them. */
    const surrender = () => {
      surrendered = true;
      stop();
    };

    const tick = (now: number) => {
      const travel = el.scrollHeight - el.clientHeight;
      if (travel > 0) {
        if (!startedAt) startedAt = now;
        const t = ((now - startedAt) % CYCLE_MS) / CYCLE_MS;
        el.scrollTop = travel * progress(t);
      }
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.some((e) => e.isIntersecting);
        if (seen && !surrendered && !raf) {
          startedAt = 0;
          raf = requestAnimationFrame(tick);
        } else if (!seen) {
          stop();
        }
      },
      /* Most of the frame, so a rendering only starts once it is properly
         being looked at rather than as its top edge clips the viewport. */
      { threshold: 0.55 },
    );

    io.observe(el);
    for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) {
      el.addEventListener(ev, surrender, { passive: true });
    }

    return () => {
      io.disconnect();
      stop();
      for (const ev of ["wheel", "touchstart", "pointerdown", "keydown"]) {
        el.removeEventListener(ev, surrender);
      }
    };
  }, []);

  return ref;
}
