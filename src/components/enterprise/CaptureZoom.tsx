import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  CAPTURE_ROOMS,
  TRADE,
  imageFor,
  shotSrc,
  stageByKey,
  type RequiredCapture,
} from "@/content/enterprise/world";
import { useT } from "@/content/enterprise/lang";

/* ============================================================================
   CAPTURE ZOOM
   ============================================================================
   A photograph, full screen, at the largest size we hold, with zoom and pan.

   Why this exists: a reviewer deciding whether to accept a certificate is
   looking for a hairline crack in a weld or a missing clip behind a pipe, and
   the review card shows that at 150px wide. The old lightbox was not much
   better — it capped at 960 and used object-cover, so the crop was thrown away
   and no amount of squinting got it back. Judging workmanship needs the pixels.

   ⚠️  ZOOMING IS NOT VERIFYING, and the footer says so. Delphi can say this
   photograph was taken at this place, at this time, on this device, and has
   not changed since. Looking at it closely is a person forming a view, which
   is what this screen is for — but the two claims must not blur.

   Zoom anchors on the pointer, not the centre. Centre-anchored zoom walks the
   thing you are looking at off screen and makes you chase it with the pan.

   ⚠️  PORTALLED TO <body>, NOT RENDERED IN PLACE. `position: fixed` is not
   enough on its own. A review card dims itself to 0.65 opacity once it has
   been reviewed, and opacity applies to the whole subtree — rendered in place,
   the viewer came up translucent on exactly the cards a reviewer revisits. An
   ancestor transform or filter would break it differently again, by making
   `fixed` resolve against that ancestor instead of the viewport. The portal
   settles all of it: the viewer has no ancestors but <body>.
   ========================================================================= */

const MIN = 1;
const MAX = 6;
const STEP = 1.25;

/** Keeps the point under the pointer fixed across a scale change.
 *
 *  The image sits centred in the frame and is drawn as
 *  `translate(o) scale(s)`, so a frame-relative vector `c` (measured from the
 *  frame centre) corresponds to the unscaled image vector `(c - o) / s`.
 *  Holding that still across `s -> s2` gives the offset below. */
function anchor(
  o: { x: number; y: number },
  s: number,
  s2: number,
  c: { x: number; y: number },
) {
  const k = s2 / s;
  return { x: c.x - k * (c.x - o.x), y: c.y - k * (c.y - o.y) };
}

export function CaptureZoom({
  shots,
  start,
  onClose,
}: {
  shots: RequiredCapture[];
  start: number;
  onClose: () => void;
}) {
  const t = useT();
  const [i, setI] = useState(start);
  /* ⚠️  ONE PIECE OF STATE, NOT THREE. Scale and offset are computed from each
     other — zooming at the pointer needs both — and holding them apart meant
     every handler read whichever values the last render closed over. A
     trackpad fires wheel events faster than React re-renders, so five of them
     landed in one tick, all computed from scale = 1, and four were thrown
     away: a hard flick of the wheel moved the image one step and no further.
     Kept together, the functional update composes and every event counts. */
  const [tf, setTf] = useState({ s: 1, x: 0, y: 0 });
  const scale = tf.s;
  const off = { x: tf.x, y: tf.y };
  const frame = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const cell = shots[Math.min(i, shots.length - 1)];
  const room = CAPTURE_ROOMS.find((r) => r.key === cell.requirement.room);
  const stage = stageByKey.get(cell.requirement.stage);
  const flagged = cell.status === "warning" || cell.status === "problem";

  const reset = useCallback(() => setTf({ s: 1, x: 0, y: 0 }), []);

  /* Panning may not uncover empty space: clamp the offset to however much of
     the image is actually outside the frame at this scale. At 1x that is zero
     in both axes, which pins the image rather than letting it drift off. */
  const clamp = useCallback((next: { x: number; y: number }, s: number) => {
    const el = img.current;
    if (!el) return next;
    const maxX = Math.max(0, (el.clientWidth * s - el.clientWidth) / 2);
    const maxY = Math.max(0, (el.clientHeight * s - el.clientHeight) / 2);
    return {
      x: Math.max(-maxX, Math.min(maxX, next.x)),
      y: Math.max(-maxY, Math.min(maxY, next.y)),
    };
  }, []);

  /** `by` multiplies the current scale rather than naming one, so successive
   *  events compound instead of fighting over an absolute value. */
  const zoomBy = useCallback(
    (by: number, at?: { x: number; y: number }) => {
      const c = at ?? { x: 0, y: 0 };
      setTf((v) => {
        const s2 = Math.max(MIN, Math.min(MAX, v.s * by));
        const o = clamp(anchor({ x: v.x, y: v.y }, v.s, s2, c), s2);
        return { s: s2, x: o.x, y: o.y };
      });
    },
    [clamp],
  );

  /* Re-clamp once the image has laid out, which can leave an offset further
     out than the scale allows. */
  useLayoutEffect(() => {
    setTf((v) => {
      const o = clamp({ x: v.x, y: v.y }, v.s);
      return o.x === v.x && o.y === v.y ? v : { s: v.s, ...o };
    });
  }, [clamp]);

  /* A different photograph starts unzoomed, rather than inheriting a crop that
     belonged to the last one. */
  useEffect(reset, [i, reset]);

  /* ⚠️  A MANUAL LISTENER, because React registers `wheel` at the root as
     passive, where preventDefault() is ignored — the page then scrolls behind
     the viewer while the image zooms. */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const box = el.getBoundingClientRect();
      const at = {
        x: e.clientX - (box.left + box.width / 2),
        y: e.clientY - (box.top + box.height / 2),
      };
      zoomBy(e.deltaY < 0 ? STEP : 1 / STEP, at);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomBy]);

  /* Keys a person reaches for without being told. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight")
        setI((n) => Math.min(shots.length - 1, n + 1));
      else if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
      else if (e.key === "+" || e.key === "=") zoomBy(STEP);
      else if (e.key === "-" || e.key === "_") zoomBy(1 / STEP);
      else if (e.key === "0") reset();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, shots.length, zoomBy, reset]);

  /* The viewer covers the page, so the page must not scroll under it. */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  /* Drag to pan. `moved` is what separates a pan from a click on the backdrop:
     without it, releasing a drag whose pointer happened to be over the
     backdrop closed the viewer you were working in. */
  const drag = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const view = (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ backgroundColor: "var(--canvas)" }}
      role="dialog"
      aria-modal="true"
      aria-label={t({ en: "Capture", es: "Captura" })}
    >
      <header className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-line px-5 py-3">
        <span className="text-[15px] font-semibold text-ink">
          {room ? t(room.name) : cell.requirement.room}
        </span>
        <span className="text-[13px] text-ink-secondary">
          {t(cell.requirement.what)}
        </span>
        {flagged && (
          <span
            className="text-[12px]"
            style={{
              color:
                cell.status === "problem" ? "var(--failed)" : "var(--pending)",
            }}
          >
            {/* ⚠️  RAISED BY A PERSON. The product did not decide this. */}
            {cell.status === "problem"
              ? t({
                  en: "Rework raised by the site team",
                  es: "Corrección solicitada por el equipo de obra",
                })
              : t({
                  en: "Inspection raised by the site team",
                  es: "Inspección solicitada por el equipo de obra",
                })}
          </span>
        )}

        <div className="ml-auto flex items-center gap-1">
          <Btn
            onClick={() => zoomBy(1 / STEP)}
            label="−"
            disabled={scale <= MIN}
          />
          <span className="w-14 text-center font-mono text-[12px] text-ink-secondary">
            {Math.round(scale * 100)}%
          </span>
          <Btn
            onClick={() => zoomBy(STEP)}
            label="+"
            disabled={scale >= MAX}
          />
          <Btn
            onClick={reset}
            label={t({ en: "Fit", es: "Ajustar" })}
            disabled={scale === 1}
          />
          <button
            type="button"
            onClick={onClose}
            className="ml-3 cursor-pointer font-mono text-[12px] uppercase text-ink-muted hover:text-ink"
          >
            {t({ en: "Close", es: "Cerrar" })} ✕
          </button>
        </div>
      </header>

      <div
        ref={frame}
        className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4"
        style={{ cursor: scale > 1 ? "grab" : "zoom-in", touchAction: "none" }}
        onPointerDown={(e) => {
          drag.current = {
            x: e.clientX - off.x,
            y: e.clientY - off.y,
            moved: false,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d) return;
          if (
            Math.abs(e.clientX - d.x - off.x) +
              Math.abs(e.clientY - d.y - off.y) >
            2
          ) {
            d.moved = true;
          }
          if (scale > 1) {
            setTf((v) => ({
              s: v.s,
              ...clamp({ x: e.clientX - d.x, y: e.clientY - d.y }, v.s),
            }));
          }
        }}
        onPointerUp={(e) => {
          const d = drag.current;
          drag.current = null;
          /* ⚠️  DECIDE BEFORE RELEASING. releasePointerCapture throws when the
             capture is not held, and an exception here skips everything after
             it — which is how clicking the backdrop came to do nothing. */
          const onBackdrop = e.target === e.currentTarget;
          const clicked = d !== null && !d.moved;
          try {
            e.currentTarget.releasePointerCapture(e.pointerId);
          } catch {
            /* nothing was held */
          }
          if (clicked && onBackdrop) onClose();
        }}
        onDoubleClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const at = {
            x: e.clientX - (box.left + box.width / 2),
            y: e.clientY - (box.top + box.height / 2),
          };
          if (scale > 1) reset();
          else zoomBy(3, at);
        }}
      >
        <img
          ref={img}
          alt={t(cell.requirement.what)}
          /* The biggest size we hold. The detail is the whole point. */
          src={shotSrc(imageFor(cell), 1920)}
          draggable={false}
          className="max-h-full max-w-full select-none rounded-sm border border-line object-contain"
          style={{
            transform: `translate(${off.x}px, ${off.y}px) scale(${scale})`,
            transformOrigin: "center",
            transition: drag.current ? "none" : "transform 90ms linear",
          }}
        />

        {shots.length > 1 && (
          <>
            <Step
              side="left"
              onClick={() => setI((n) => Math.max(0, n - 1))}
              disabled={i === 0}
            />
            <Step
              side="right"
              onClick={() => setI((n) => Math.min(shots.length - 1, n + 1))}
              disabled={i === shots.length - 1}
            />
          </>
        )}
      </div>

      <footer className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line px-5 py-3">
        <span className="font-mono text-[12px] text-ink-secondary">
          {stage ? t(stage.name) : cell.requirement.stage} ·{" "}
          {t(TRADE[cell.requirement.trade])} · {cell.by.name}
          {cell.time ? ` · ${cell.time}` : ""}
        </span>
        {shots.length > 1 && (
          <span className="font-mono text-[12px] text-ink-muted">
            {i + 1} / {shots.length}
          </span>
        )}
        <span className="ml-auto max-w-prose text-[12px] text-ink-muted">
          {/* ⚠️  THE LINE THAT KEEPS THE CLAIM HONEST. */}
          {t({
            en: "Scroll or double-click to zoom, drag to pan. Capture time, location and device are sealed with the image; looking closely is your judgement, not the record's. This is a rendering — the photograph is from the Delphi library.",
            es: "Desplaza o haz doble clic para ampliar, arrastra para mover. La hora, la ubicación y el dispositivo quedan sellados con la imagen; mirar de cerca es tu criterio, no el del registro. Esta es una representación — la fotografía proviene de la biblioteca de Delphi.",
          })}
        </span>
      </footer>
    </div>
  );

  /* The viewer only ever mounts from a click, so <body> is there — the guard
     is for the prerender, which must not touch the DOM. */
  return typeof document === "undefined"
    ? view
    : createPortal(view, document.body);
}

function Btn({
  onClick,
  label,
  disabled,
}: {
  onClick: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="cursor-pointer rounded-md border border-line px-2.5 py-1 text-[13px] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink disabled:cursor-default disabled:opacity-40"
    >
      {label}
    </button>
  );
}

/** Previous / next within one certificate. Sits over the image, so it carries
 *  its own surface rather than relying on whatever is behind it. */
function Step({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={side === "left" ? "Previous" : "Next"}
      className={`absolute top-1/2 ${side === "left" ? "left-3" : "right-3"} -translate-y-1/2 cursor-pointer rounded-full border border-line bg-surface px-3 py-2 text-[15px] text-ink-secondary transition-colors hover:border-line-strong hover:text-ink disabled:cursor-default disabled:opacity-30`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
