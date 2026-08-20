import { useCallback, useEffect, useRef, useState } from "react";
import { AnnotatedFigure } from "@/components/product/Callout";
import type { CalloutSpec } from "@/components/product/Callout";
import { cn } from "@/lib/cn";
import { Watermark } from "@/components/product/Watermark";

/* ============================================================================
   EXPANDABLE ANNOTATED FIGURE
   ============================================================================
   Inline: the photograph on its own, filling its card slot exactly like the
   scene shots beside it, with an expand affordance.

   Expanded: the full composite — callout panels, leaders and markers — at a
   size where the certificate data can actually be read.

   The panels are deliberately NOT shown inline. An earlier version rendered a
   transform-scaled miniature of the whole composite; at roughly a third size
   the panels read as decorative shapes rather than information, and the card
   sat awkwardly against its neighbours. Detail belongs behind the click. The
   card's job is to invite it, not to deliver it.

   Built on the native <dialog> element rather than a custom overlay. showModal()
   gives focus trapping, Escape to close, inert background content, scroll lock
   and focus restoration to the trigger — all behaviours a hand-rolled modal
   usually gets wrong, and all of them free and correct here.
   ========================================================================= */

export function ExpandableFigure({
  src,
  srcSet,
  sizes,
  alt,
  width,
  height,
  callouts,
  caption,
  expandLabel = "Expand",
  dialogTitle,
  fit = "cover",
  className,
}: {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  width: number;
  height: number;
  callouts: CalloutSpec[];
  caption?: string;
  expandLabel?: string;
  /** Announced to screen readers as the dialog's name. */
  dialogTitle: string;
  /** "cover" fills the slot like the neighbouring scene shots, and may crop.
   *  "contain" keeps the whole frame. */
  fit?: "cover" | "contain";
  className?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback(() => {
    dialogRef.current?.showModal();
    setOpen(true);
  }, []);

  const hide = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  /* `close` fires for Escape too, so state stays in step however it is
     dismissed. */
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const onClose = () => setOpen(false);
    el.addEventListener("close", onClose);
    return () => el.removeEventListener("close", onClose);
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {/* ── Inline: the photograph, with the badge as the only control ──

          Two things are deliberate here.

          The WRAPPER owns the aspect ratio and the image is absolutely
          positioned inside it. The previous shape asked WebKit to resolve
          height:100% against a box sized by aspect-ratio, which it does not
          reliably do — h-full collapsed to auto and the image fell back to
          its intrinsic 1120px width. That rendered enormous on iOS in both
          Safari and Chrome, since Chrome on iOS is also WebKit, while every
          desktop Chrome test passed.

          The BADGE is the button, not the whole picture. When the entire
          image is a control, a scroll-drag that starts on it can be
          interpreted as a tap and open the dialog by accident — on a page
          that is mostly photographs, that is most of the scrollable area.
          A discrete control cannot be triggered by scrolling past it. */}
      <div
        className="relative w-full overflow-hidden rounded-md border border-line"
        style={{ aspectRatio: `${width} / ${height}` }}
      >
        <img
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          width={width}
          height={height}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
          )}
        />

        {/* Inline only. The expanded composite carries the mark inside each
            callout panel already. */}
        <Watermark />

        {/* Always visible rather than hover-only — hover cues do not exist on
            touch, and this is the only signal that there is more to see. */}
        <button
          type="button"
          onClick={show}
          aria-haspopup="dialog"
          aria-label={`${expandLabel}: ${dialogTitle}`}
          className="absolute bottom-2.5 right-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-sm border border-callout-border px-2.5 py-1.5 text-caption text-callout-ink transition-[border-color] hover:border-callout-line"
          style={{
            backgroundColor: "var(--callout-surface)",
            transitionDuration: "var(--duration-fast)",
          }}
        >
          <ExpandIcon />
          {expandLabel}
        </button>
      </div>

      {/* ── Expanded ── */}
      <dialog
        ref={dialogRef}
        aria-label={dialogTitle}
        onClick={(e) => {
          /* The dialog element is itself the backdrop, so a click landing
             directly on it — rather than on the inner panel — means outside. */
          if (e.target === dialogRef.current) hide();
        }}
        className="m-auto w-[min(96vw,1400px)] max-w-none rounded-lg border border-line bg-canvas p-0 text-ink backdrop:bg-callout-halo backdrop:backdrop-blur-sm"
      >
        <div className="flex items-start justify-between gap-6 border-b border-line px-5 py-4">
          <h2 className="text-subheading text-ink">{dialogTitle}</h2>
          <button
            type="button"
            onClick={hide}
            className="-m-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-ink-secondary hover:text-ink"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="p-5">
          {/* Only mounted while open, so the large image is not fetched — and
              the panels are not laid out — until it is actually needed. */}
          {open && (
            <AnnotatedFigure
              src={src}
              srcSet={srcSet}
              sizes="(min-width: 1400px) 1360px, 96vw"
              alt={alt}
              width={width}
              height={height}
              callouts={callouts}
              /* "auto", not "always". Expanding on a phone gives a ~330px
                 image, and the panels have a 210px minimum — three of them
                 overlapped each other and the photograph. Below lg they become
                 the stacked list instead, which is what that mode is for.
                 Expanding still earns its place on mobile: the picture is
                 bigger and the callout text becomes readable prose. */
              panels="auto"
            />
          )}
          {caption && <p className="mt-3 text-caption text-ink-muted">{caption}</p>}
        </div>
      </dialog>
    </div>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
      <path
        d="m3.5 3.5 9 9m0-9-9 9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
