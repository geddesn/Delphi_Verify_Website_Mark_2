import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeroPair } from "@/components/renderings/heroScreens";
import { PhoneFrame } from "@/components/renderings/PhoneFrame";
import { WebFrame } from "@/components/renderings/WebFrame";

/* ============================================================================
   HERO DEVICES
   ============================================================================
   A desktop card with a phone standing in front of it, over the SceneBackdrop
   and anchored right. The product's own claim — "a hybrid mobile and web
   platform" — made before a word of the standfirst is read.

   Replaces AppScreenCycle, which cross-faded flat WebP screenshots of the iOS
   app. The difference is not cosmetic: these are REAL DOM at true device
   scale, so the type is crisp at any display density, the screens theme with
   the site's own tokens rather than being baked at whatever the app looked
   like on the day, and changing one is an edit rather than a re-shoot.

   ⚠️  THEY ARE RENDERINGS, NOT SCREENSHOTS — the product as designed. That is
   deliberate, and the platform is being built to match; /platform/renderings
   labels them, these heroes do not. See the warning in content/renderings.ts.

   ── IT CYCLES, IN STATES ──
   Both frames change together — see heroScreens.tsx for why that is a rule
   and not a preference. Cycling the phone alone against a fixed desktop would
   claim a relationship between two unrelated moments in the workflow. A state
   either pairs a phone with a desktop showing the same thing, or shows the
   phone by itself; it never borrows an unrelated card as a backdrop.

   The dwell is long on purpose. A hero already carries one thing that moves
   by itself — the SceneBackdrop — and a second, faster clock in front of it
   turns the fold into a carousel: the eye keeps going back to see what the
   device did instead of reading the headline. Ten seconds is slow enough to
   read as "there is more here" rather than as an advert.

   EVERY SCREEN STAYS MOUNTED and the cycle only changes opacity. That is not
   an optimisation, it is a requirement: the evidence record contains a Google
   Maps iframe, and swapping the screens in and out would re-request the map
   from Google on every turn of the cycle, for the life of the page.

   ── THE WHOLE DEVICE FADES, CASE AND ALL ──
   Not a cross-fade, and not a fade of the screen inside a bezel that stays
   put. Both of those give the same tell: the case sits there while its
   contents dissolve, and a phone whose glass changes while the aluminium
   does not reads as a rendering fault rather than as a transition.

   So the fade is on the DEVICE, and the screen swap happens while it is
   invisible. One clock drives it — the device fades out over FADE_MS, the
   index advances, the device fades back in. The layers inside therefore need
   no transition of their own: nothing can see them change.

   That is also why FADE_MS is a JavaScript constant rather than the
   --duration-cross token. A setTimeout and a CSS transition have to agree on
   this number to the millisecond, and a value split across two languages is
   one that drifts. Reduced motion still wins: the global rule zeroes
   transition-duration with !important, and the cycle does not run at all.

   The desktop can leave entirely. Guided Capture has no web counterpart, so
   it simply does not come back on that state. Its BOX stays in the layout
   either way, which is what stops the phone jumping: the phone is positioned
   against that box, not against the card inside it.

   ── SIZE ──
   Both are deliberately small. Bigger, the desktop is a bright white
   rectangle that takes over a dark hero — at half the section's width it drew
   a hard vertical seam down the middle and the headline lost. Small enough to
   read as a card on the ground, it says "there is a web product" without
   arguing with the words. The phone is smaller still and in front, because
   the phone is where the evidence is made.

   Neither runs off the viewport, so neither hero needs to clip: the device
   block sits entirely inside the section, and the hero keeps the z-10 and the
   unclipped overflow it has always had.

   Decorative: aria-hidden. The screens repeat what the page already says in
   text, and a screen-reader user gains nothing from a description of a
   capture checklist rendered at 390 logical pixels.

   Hidden below lg — at narrow widths the device lands on the headline. The
   desktop waits for xl, where there is room for it to be worth showing.
   ========================================================================= */

/* Long enough to read the screen it lands on, and to forget it is coming. */
const DWELL_MS = 10_000;
/* Must match the transition on the device wrappers below — see the note in
   the header about why this is not a CSS token. */
const FADE_MS = 1400;

/** Which state is showing, and whether the device is currently on screen.
 *
 *  Still on the first state under reduced motion, and paused whenever the
 *  hero is out of view — a swap re-renders whole screen trees, and doing that
 *  to an empty viewport is waste. */
function useHeroCycle(count: number, ref: React.RefObject<HTMLElement | null>) {
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || count < 2) return;
    if (
      typeof matchMedia === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let tick = 0;
    let swap = 0;

    const start = () => {
      if (tick) return;
      tick = window.setInterval(() => {
        setShown(false);
        /* The index moves only once the device is invisible, which is what
           lets the case fade with the screen instead of hosting a change
           the reader can watch happen. */
        swap = window.setTimeout(() => {
          setIndex((n) => (n + 1) % count);
          setShown(true);
        }, FADE_MS);
      }, DWELL_MS);
    };

    const stop = () => {
      window.clearInterval(tick);
      window.clearTimeout(swap);
      tick = 0;
      swap = 0;
      /* Leaving mid-fade would strand the device at opacity 0 until the
         reader scrolled back and the next full cycle completed. */
      setShown(true);
    };

    if (typeof IntersectionObserver === "undefined") {
      start();
      return stop;
    }
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? start() : stop()),
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      stop();
    };
  }, [count, ref]);

  return { index, shown };
}

/** Fades a whole device — case, screen and all. */
function Device({ shown, children }: { shown: boolean; children: ReactNode }) {
  return (
    <div
      className="h-full transition-opacity"
      style={{
        opacity: shown ? 1 : 0,
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** One screen in the stack.
 *
 *  Mounted always — the evidence record holds a Google Maps iframe, and
 *  unmounting it would re-request the map on every turn of the cycle. Shown
 *  or hidden with no transition at all: the device around it is already at
 *  opacity 0 whenever this changes. */
function Layer({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div className={cn("absolute inset-0", show ? "opacity-100" : "opacity-0")}>
      {children}
    </div>
  );
}

export function HeroDevices({
  pairs,
  className,
}: {
  pairs: HeroPair[];
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const { index: active, shown } = useHeroCycle(pairs.length, root);
  /* Any desktop at all means the card's box is reserved for the whole cycle;
     whether the card is IN it depends on the state currently up. */
  const hasDesktop = pairs.some((p) => p.web);
  /* Two different questions, and conflating them is a visible bug.

     activeHasWeb changes only when the index does — which happens while the
     device is at opacity 0, so anything keyed to it (the phone's position and
     size) changes unseen.

     desktopShown also folds in `shown`, because the card has to fade with
     everything else. Key the phone's POSITION to this one and it slides
     across the hero every time the fade begins, in full view. */
  const activeHasWeb = Boolean(pairs[active]?.web);
  const desktopShown = shown && activeHasWeb;

  return (
    <div
      ref={root}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[46%] select-none lg:block",
        className,
      )}
      /* A container, so the phone can be anchored to the desktop's corner in
         cqw — a share of THIS block's width — while still being a child of it
         rather than of the card. It has to be a sibling of the card: a phone
         nested inside the desktop box can only ever be centred on the box,
         and the box's middle is barely 200px down, which put a 560px phone
         through the top of the section. */
      style={{ containerType: "inline-size" }}
    >
      {/* The desktop, on the ground behind. A card with its own corners and
          shadow rather than something cropped by the viewport — at this size
          a crop reads as a mistake, where a whole small card reads as an
          object sitting further away. */}
      {hasDesktop ? (
        /* The desktop's BOX exists from lg even though the card itself only
           appears at xl — aspect-[1440/900] gives it height with nothing in
           it. That is what lets the phone be positioned against the desktop
           rather than at coordinates that happen to look right: one anchor,
           correct at both breakpoints, and still correct if the card moves.

           The alternative was a second copy of the phone for the lg case, and
           two phones that must be kept in step is exactly the kind of pair
           that drifts. */
        <div className="absolute right-[9%] top-[5rem] aspect-[1440/900] w-[60%]">
          <div className="hidden h-full xl:block">
            <Device shown={desktopShown}>
              <WebFrame>
                {pairs.map((p, i) =>
                  p.web ? (
                    <Layer key={p.id} show={i === active}>
                      {p.web()}
                    </Layer>
                  ) : null,
                )}
              </WebFrame>
            </Device>
          </div>

        </div>
      ) : null}

      {hasDesktop ? (
        /* PAIRED: the phone's middle sits on the desktop card's bottom-left
           corner, so a quarter of it overlaps the card, a quarter hangs left
           and half hangs below — two devices at different distances rather
           than one screen pasted on another.

           SOLO: no card to stand in front of, so the phone takes the middle
           of the whole block and grows. A small device hanging off the corner
           of an empty rectangle reads as a layout that lost something.

           The corner is derived, not eyeballed. The card is right-[9%]
           w-[60%], so its left edge is 100 - 9 - 60 = 31% from this block's
           left; its height is 60% x 900/1440 = 37.5% of the same width, which
           in a container is 37.5cqw. Move the card and these two follow it.

           Both changes happen at the instant the index advances — which is the
           instant the device is at opacity 0 — so nothing is ever seen moving
           or resizing. */
        <div
          className={cn(
            "absolute -translate-x-1/2 -translate-y-1/2",
            activeHasWeb
              ? "left-[31%] top-[calc(5rem+37.5cqw)] w-[198px] xl:w-[222px]"
              : "left-1/2 top-1/2 w-[248px] xl:w-[286px]",
          )}
        >
          {/* eager, not lazy. The bezel is above the fold and it is the shape
              the screen is positioned against — arriving late would leave the
              rendering floating unframed for a beat. */}
          <Device shown={shown}>
            <PhoneFrame loading="eager">
              {pairs.map((p, i) => (
                <Layer key={p.id} show={i === active}>
                  {p.mobile()}
                </Layer>
              ))}
            </PhoneFrame>
          </Device>
        </div>
      ) : (
        /* No desktop behind it, so nothing to anchor to: the phone is the
           whole composition and keeps its own place. */
        <div className="absolute right-[14%] top-20 w-[240px] xl:right-[20%] xl:w-[272px]">
          <Device shown={shown}>
            <PhoneFrame loading="eager">
              {pairs.map((p, i) => (
                <Layer key={p.id} show={i === active}>
                  {p.mobile()}
                </Layer>
              ))}
            </PhoneFrame>
          </Device>
        </div>
      )}
    </div>
  );
}
