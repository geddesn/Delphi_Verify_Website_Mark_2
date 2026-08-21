import { useEffect, useLayoutEffect, useRef, useState } from "react";

/* ============================================================================
   useDrawOnView — hold the leaders back until the figure is looked at
   ============================================================================
   A static annotated figure has no timeline to hang the draw on, so it uses
   the only cue available: arrival. The leaders retract before the first paint
   and grow out of their captions when the figure comes into view — and again
   whenever one is mounted fresh, which is what gives the expanded dialog its
   draw for free.

   ⚠️  IT STARTS DRAWN, ON PURPOSE.
   The initial state is `true` so the prerendered HTML carries complete
   leaders. Someone with JavaScript off, or a crawler, gets a finished figure
   rather than a photograph with invisible lines and nothing pointing at it.

   The retraction therefore happens in a LAYOUT effect, not an ordinary one:
   it has to land before the browser paints. In a plain effect the finished
   leaders would flash, snap away and redraw every time a dialog opened.
   ========================================================================= */

/* useLayoutEffect warns when React renders on the server, where it cannot
   run. There is nothing to retract there either — the server case is exactly
   the "start drawn" path above. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useDrawOnView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [drawn, setDrawn] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    setDrawn(false);

    /* Already on screen? The observer fires on its first callback and the
       draw runs immediately, which is the dialog case. */
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, drawn };
}
