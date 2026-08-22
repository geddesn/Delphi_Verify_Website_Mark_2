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
  type Rendering,
  type RenderingSurface,
} from "@/content/renderings";
import { MobileTasks } from "@/components/renderings/MobileTasks";
import { MobileCapture } from "@/components/renderings/MobileCapture";
import { PhoneFrame } from "@/components/renderings/PhoneFrame";
import { WebFrame } from "@/components/renderings/WebFrame";
import { WebEvidenceRecord } from "@/components/renderings/WebEvidenceRecord";
import { WebDashboard } from "@/components/renderings/WebDashboard";
import { WebAssetHistory } from "@/components/renderings/WebAssetHistory";
import { MobileEvidenceRecord } from "@/components/renderings/MobileEvidenceRecord";
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

/* Which rendering fills which slot. Absent ids fall through to the labelled
   placeholder, so the page works with any subset of the five drawn. */
const SCREENS: Record<
  string,
  { web?: () => ReactNode; mobile?: () => ReactNode }
> = {
  "mobile-tasks": { mobile: () => <MobileTasks /> },
  "mobile-capture": { mobile: () => <MobileCapture /> },
  /* Two frames, one record. Both read the same fixture in
     content/evidence-record.ts, which is what stops the phone and the desktop
     quietly disagreeing about how many captures there were. */
  "evidence-record": {
    web: () => <WebEvidenceRecord />,
    mobile: () => <MobileEvidenceRecord />,
  },
  "web-dashboard": { web: () => <WebDashboard /> },
  "web-case": { web: () => <WebAssetHistory /> },
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
  /* Three shapes, all driven by the artefact rather than by taste.

       mobile  the phone beside its brief — a 390x844 device given the full
               column is a sliver of picture in an acre of page
       web     the desktop frame above the brief — 1440x900 squeezed into a
               24rem column is unreadable
       both    the desktop at full width, then the phone beside the brief
               below it. The desktop has to keep its width to stay legible,
               which is the whole reason these are stacked rather than set
               side by side.

     The phone column is a custom property so the grid template and the frame
     are reading one number rather than two that must be kept in step. */
  const screens = SCREENS[r.id];
  const phoneRow = (
    <div
      className="grid gap-10 lg:grid-cols-[var(--phone-w)_1fr] lg:items-start lg:gap-14"
      style={{ "--phone-w": PHONE_WIDTH } as CSSProperties}
    >
      <FrameSlot surface="mobile">{screens?.mobile?.()}</FrameSlot>
      <Brief rendering={r} />
    </div>
  );

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

        {r.surface === "both" ? (
          /* Stacked, and deliberately plain. The hero on / overlaps the two
             devices to make one picture of a product; this page is a
             catalogue, and a reviewer here needs to see each screen whole and
             unobstructed rather than artfully composed. */
          <div className="mt-12 flex flex-col gap-14">
            <FrameSlot surface="web">{screens?.web?.()}</FrameSlot>
            {phoneRow}
          </div>
        ) : r.surface === "mobile" ? (
          <div className="mt-12">{phoneRow}</div>
        ) : (
          <div className="mt-12 grid gap-10">
            <FrameSlot surface="web">{screens?.web?.()}</FrameSlot>
            <Brief rendering={r} />
          </div>
        )}
      </Container>
    </Section>
  );
}

function FrameSlot({
  surface,
  children,
  /* PhoneFrame caps itself with an inline max-width, so a wider wrapper alone
     does nothing — the paired composition has to pass the width down here or
     the phone stays 24rem inside a 36rem box, and every offset computed from
     its width lands wrong. */
  phoneWidth = PHONE_WIDTH,
}: {
  surface: RenderingSurface;
  children?: ReactNode;
  phoneWidth?: string;
}) {
  return surface === "mobile" ? (
    <PhoneFrame width={phoneWidth}>
      {children ?? (
        <SlotLabel label="Mobile rendering" detail={surfaceFrame.mobile.label} />
      )}
    </PhoneFrame>
  ) : (
    <WebFrame>
      {children ?? (
        <SlotLabel label="Web rendering" detail={surfaceFrame.web.label} />
      )}
    </WebFrame>
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
