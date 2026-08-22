import type { CSSProperties, ReactNode } from "react";
import {
  Container,
  Section,
  Eyebrow,
  SectionHeader,
} from "@/components/ui/primitives";
import {
  renderings,
  renderingsPage,
  surfaceFrame,
  phoneFrame,
  type Rendering,
  type RenderingSurface,
} from "@/content/renderings";
import { MobileTasks } from "@/components/renderings/MobileTasks";
import { cn } from "@/lib/cn";

/* ============================================================================
   PLATFORM RENDERINGS
   ============================================================================
   Scaffolding. The five slots are addressable, framed at the right shape and
   carry their brief; none of them is drawn yet, and the frames say so rather
   than sitting empty and reading as a loading failure.

   The briefs live in content/renderings.ts beside the slot each describes, so
   the requirement and the artefact cannot drift. A finished rendering is
   passed as `children` to its frame — nothing else on this page moves.

   ⚠️  These are renderings, not screenshots. See the warning at the top of
   content/renderings.ts; the standfirst says so, and anything added here has
   to keep saying so.
   ========================================================================= */

/* Sticky arithmetic, in one place because three things have to agree on it:
   the site header is h-16 (4rem) and sticks at top-0, this page's screen nav
   is h-14 (3.5rem) and sticks directly beneath it, so an anchored section has
   to clear 7.5rem to land under both rather than behind them. Change either
   height and change this with it. */
const SUBNAV_TOP = "top-16";
const ANCHOR_CLEARANCE = "scroll-mt-[7.5rem]";

/* One number, three dependents: the phone column's width on large screens,
   the phone's own ceiling when that column collapses to one, and the `sizes`
   hint that decides which file is fetched. 24rem = 384px, which is exactly
   the 1x WebP, and 768 the 2x — see the `device` group in
   scripts/optimise-images.mjs. Change this and those widths change with it. */
const PHONE_WIDTH = "24rem";

/* The canvas a mobile rendering is authored on: true iPhone logical pixels.
   The screen box is a container, and the canvas inside it is scaled by
   100cqi / 390px — a length divided by a LENGTH, which yields a number, so
   the scale is exact at any width with no JavaScript and no ResizeObserver.

   That matters more here than it looks. TrustEngine solves the same problem
   with useStageScale, but it measures in an effect and returns 1 on the
   server, so the prerendered HTML is unscaled until React hydrates. This page
   is prerendered and mostly static; doing it in CSS means the markup is right
   in the HTML itself. */
const PHONE_CANVAS = { width: 390, height: 844 };

/* Which rendering fills which slot. Absent ids fall through to the labelled
   placeholder, so the page works with any subset of the five drawn. */
const SCREENS: Record<string, () => ReactNode> = {
  "mobile-tasks": () => <MobileTasks />,
};

const ordinal = (i: number) => String(i + 1).padStart(2, "0");

export default function PlatformRenderings() {
  return (
    <>
      <Section tone="inverse">
        <Container>
          <div className="flex max-w-3xl flex-col gap-6">
            <Eyebrow>{renderingsPage.eyebrow}</Eyebrow>
            <h1 className="text-display-lg text-ink md:text-display-xl">
              {renderingsPage.headline}
            </h1>
            <p className="text-body-lg text-ink-secondary">
              {renderingsPage.standfirst}
            </p>
          </div>
        </Container>
      </Section>

      {/* ── Screen nav ──
          Outside a <Section> deliberately: it needs its own fixed height
          rather than section rhythm, and a Section's padding would fight the
          sticky offset. Plain fragment links — the anchors are on this page,
          so App.tsx's hash retry is not in play. */}
      <div
        className={cn(
          "sticky z-30 border-b border-line bg-canvas/85 backdrop-blur-md",
          SUBNAV_TOP,
        )}
      >
        <Container>
          <nav
            aria-label="Renderings"
            /* Scrolls rather than wraps: wrapping would change the bar's own
               height on narrow screens, and the offset above assumes it does
               not. */
            className="flex h-14 items-center gap-1 overflow-x-auto"
          >
            {renderings.map((r, i) => (
              <a
                key={r.id}
                href={`#${r.id}`}
                className="flex shrink-0 items-center gap-2 rounded-sm px-3 py-2 text-body-sm text-ink-secondary transition-colors hover:bg-surface-sunken hover:text-ink"
              >
                <span className="font-mono text-mono-sm uppercase text-ink-muted">
                  {ordinal(i)}
                </span>
                {r.navLabel}
              </a>
            ))}
          </nav>
        </Container>
      </div>

      {renderings.map((r, i) => (
        <ScreenSlot
          key={r.id}
          rendering={r}
          index={i}
          tone={i % 2 === 1 ? "sunken" : "default"}
        />
      ))}
    </>
  );
}

function ScreenSlot({
  rendering: r,
  index,
  tone,
}: {
  rendering: Rendering;
  index: number;
  tone: "default" | "sunken";
}) {
  /* A phone beside its brief; a desktop frame above one. Driven by the
     artefact's shape rather than by taste — a 390x844 device in a full-width
     column is a sliver of picture in an acre of page, and 1440x900 in a 24rem
     one is unreadable. */
  const beside = r.surface === "mobile";

  return (
    <Section id={r.id} tone={tone} className={ANCHOR_CLEARANCE}>
      <Container>
        {/* The house section header rather than a hand-rolled one. Its h2 is
            text-display/md:text-display-lg — the weight every other section on
            the site gives its own heading, which is what these are. An earlier
            version invented text-display-sm and -md; neither is in the scale,
            Tailwind dropped them silently, and the titles rendered smaller
            than the copy beneath them. */}
        <SectionHeader
          eyebrow={`${surfaceFrame[r.surface].device} · ${ordinal(index)}`}
          headline={r.title}
          standfirst={r.purpose}
        />

        <div
          className={cn(
            "mt-12 grid gap-10",
            beside &&
              "lg:grid-cols-[var(--phone-w)_1fr] lg:items-start lg:gap-14",
          )}
          style={
            beside ? ({ "--phone-w": PHONE_WIDTH } as CSSProperties) : undefined
          }
        >
          <FrameSlot surface={r.surface}>{SCREENS[r.id]?.()}</FrameSlot>
          <Brief rendering={r} />
        </div>
      </Container>
    </Section>
  );
}

function FrameSlot({
  surface,
  children,
}: {
  surface: RenderingSurface;
  children?: ReactNode;
}) {
  return surface === "mobile" ? (
    <PhoneFrame>{children}</PhoneFrame>
  ) : (
    <WebFrame>{children}</WebFrame>
  );
}

/** A real device frame, with the rendering behind it.
 *
 *  The screen is a plain rectangle on the measured aperture. It needs no
 *  rounded corners and no notch cut-out: the bezel is opaque and paints over
 *  it, so the image does the masking, the way the glass does on a real phone.
 *  See the note beside `phoneFrame` in content/renderings.ts. */
function PhoneFrame({ children }: { children?: ReactNode }) {
  return (
    <div className="relative w-full" style={{ maxWidth: PHONE_WIDTH }}>
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
            everything inside is authored at the size it is really held at. */}
        <div
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
          {children ?? (
            <SlotLabel
              label="Mobile rendering"
              detail={surfaceFrame.mobile.label}
            />
          )}
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
        srcSet={`${phoneFrame.base}-384.webp 384w, ${phoneFrame.base}-768.webp 768w`}
        sizes={PHONE_WIDTH}
        width={phoneFrame.width}
        height={phoneFrame.height}
        loading="lazy"
        decoding="async"
        className="relative block w-full"
      />
    </div>
  );
}

/** No browser chrome yet — a plain frame at the target viewport's aspect, so
 *  the page's rhythm is already right before anything is drawn. */
function WebFrame({ children }: { children?: ReactNode }) {
  return (
    <div
      className="w-full overflow-hidden rounded-lg border border-dashed border-line-strong bg-surface"
      style={{ aspectRatio: surfaceFrame.web.ratio }}
    >
      {children ?? (
        <SlotLabel label="Web rendering" detail={surfaceFrame.web.label} />
      )}
    </div>
  );
}

/** What the slot is waiting for. An empty box reads as something that failed
 *  to load rather than something not yet made. */
function SlotLabel({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-4 text-center">
      <span className="font-mono text-mono-sm uppercase text-ink-muted">
        {label}
      </span>
      <span className="font-mono text-mono-sm text-ink-muted">{detail}</span>
    </div>
  );
}

/** The checklist the finished rendering has to satisfy, and the one sentence
 *  it has to leave a viewer with. Kept on the page rather than in a document
 *  so that reviewing the rendering and reviewing its brief are the same act. */
function Brief({ rendering: r }: { rendering: Rendering }) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-eyebrow uppercase text-ink-muted">What it shows</h3>
      <ul className="flex flex-col gap-2.5">
        {r.shows.map((s) => (
          <li key={s} className="flex gap-3 text-body-sm text-ink-secondary">
            {/* Optically centred on the first line of its own text rather than
                nudged with a margin — the same pattern as /industries. */}
            <span aria-hidden className="flex h-[1lh] w-3 shrink-0 items-center">
              <span className="h-px w-full bg-accent" />
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ul>
      <p className="border-t border-line-strong pt-4 text-body text-ink">
        {r.message}
      </p>
    </div>
  );
}
