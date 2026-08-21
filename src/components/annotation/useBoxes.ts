import { useCallback, useEffect, useRef, useState } from "react";
import type { Rect } from "./geometry";

/* ============================================================================
   useBoxes — measure the panels instead of guessing their size
   ============================================================================
   A leader has to start on its box's edge. That needs the box's footprint,
   and a hand-written constant is wrong the moment the copy changes length,
   the panel wraps at a narrower stage, or — on the trust stage — the panel
   grows to admit a claim. The symptom is a line that starts in mid-air, or
   one that starts inside the panel and is clipped by it.

   So the boxes report their own rect — position as well as size, because a
   panel laid out by a flex column has no authored coordinates at all.

   Measured off the OUTER element, which carries only the positioning
   transforms. The reveal's scale() lives on the inner one, deliberately: read
   the inner and a panel animating in would report a footprint a few percent
   small for the length of the transition, and its leader would visibly creep
   toward it.

   Returns percentages of the stage, which is the coordinate space everything
   else in annotation/ speaks.

   Empty on the server and on first paint, so callers keep a declared `box` as
   the fallback — that is what the prerendered HTML is drawn with.

   ⚠️  A ResizeObserver IS NOT ENOUGH, which is why `measure` is returned.
   It fires on size, not on position. A panel in a column that centres its
   children MOVES whenever a sibling appears or grows, without changing size
   at all — no callback, and every rect that depends on it silently goes
   stale. Anything driving layout from state has to re-measure when that
   state changes.
   ========================================================================= */

const EPSILON = 0.15; // percent — below this a change is invisible

function unchanged(a: Record<string, Rect>, b: Record<string, Rect>) {
  const ka = Object.keys(a);
  if (ka.length !== Object.keys(b).length) return false;
  return ka.every(
    (k) =>
      b[k] &&
      Math.abs(a[k].x - b[k].x) < EPSILON &&
      Math.abs(a[k].y - b[k].y) < EPSILON &&
      Math.abs(a[k].w - b[k].w) < EPSILON &&
      Math.abs(a[k].h - b[k].h) < EPSILON,
  );
}

export function useBoxes(stageRef: React.RefObject<HTMLElement | null>) {
  const [boxes, setBoxes] = useState<Record<string, Rect>>({});
  const nodes = useRef(new Map<string, HTMLElement>());
  const callbacks = useRef(new Map<string, (el: HTMLElement | null) => void>());
  const observer = useRef<ResizeObserver | null>(null);
  const pending = useRef<number | undefined>(undefined);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const s = stage.getBoundingClientRect();
    if (!s.width || !s.height) return;

    const next: Record<string, Rect> = {};
    nodes.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = {
        x: ((r.left - s.left) / s.width) * 100,
        y: ((r.top - s.top) / s.height) * 100,
        w: (r.width / s.width) * 100,
        h: (r.height / s.height) * 100,
      };
    });
    setBoxes((prev) => (unchanged(prev, next) ? prev : next));
  }, [stageRef]);

  /* The observer's path through here is DEBOUNCED; the direct one is not.
     A panel with an animating width drives ResizeObserver at sixty frames a
     second, and each fire re-renders the whole stage — leaders, certificates,
     links and all — which is visible as stutter in the middle of the very
     transition being measured. Callers that need an exact rect at an exact
     moment (the step machine, on each beat) still call measure() directly. */
  const scheduleMeasure = useCallback(() => {
    if (pending.current) return;
    pending.current = window.setTimeout(() => {
      pending.current = undefined;
      measure();
    }, 120);
  }, [measure]);

  /* One cached ref callback per id. Returning a fresh closure each render
     would make React detach and reattach every panel on every frame. */
  const register = useCallback(
    (id: string) => {
      let fn = callbacks.current.get(id);
      if (!fn) {
        fn = (el: HTMLElement | null) => {
          const previous = nodes.current.get(id);
          if (previous) observer.current?.unobserve(previous);
          if (el) {
            nodes.current.set(id, el);
            observer.current?.observe(el);
          } else {
            nodes.current.delete(id);
          }
          measure();
        };
        callbacks.current.set(id, fn);
      }
      return fn;
    },
    [measure],
  );

  useEffect(() => {
    const obs = new ResizeObserver(() => scheduleMeasure());
    observer.current = obs;
    nodes.current.forEach((el) => obs.observe(el));
    if (stageRef.current) obs.observe(stageRef.current);
    measure();
    return () => {
      obs.disconnect();
      observer.current = null;
      if (pending.current) window.clearTimeout(pending.current);
    };
  }, [measure, scheduleMeasure, stageRef]);

  return { boxes, register, measure };
}
