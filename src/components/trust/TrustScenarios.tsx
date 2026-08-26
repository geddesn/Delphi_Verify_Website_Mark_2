import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import posthog from "@/lib/posthog";
import {
  DESIGN_W,
  StageGrid,
  TitleCard,
  TrustEngine,
  useIsomorphicLayoutEffect,
  useStageScale,
} from "@/components/trust/TrustEngine";
import { TrustBuild } from "@/components/trust/TrustBuild";
import {
  isBuildScene,
  isPlayableScene,
  trustEngineCopy,
  trustScenarios,
  type TrustSceneIntro,
} from "@/content/trust-scenes";

/* ============================================================================
   TRUST SCENARIOS
   ============================================================================
   One argument, three sectors, and a way to choose between them.

   ⚠️  WHAT IS THE SAME BETWEEN SECTORS, AND WHAT IS NOT.
   The CORE is the same everywhere and the piece must never suggest otherwise:
   controlled capture, corroborating signals, integrity sealing, certification.
   That is one technology, and it does not change shape per industry.

   The WORKFLOW on top of it does change, and is meant to — what gets
   captured, at which moments, by whom, and what the resulting record is used
   for. Building one is quick. That is a product claim in its own right, not a
   compromise of the first one.

   Which is why two of these look alike and one will not. Yachts and rentals
   share a shape because their workflows genuinely do: an asset handed over,
   used, and handed back, then argued about. Construction does not — it is a
   progression, and its evidence is destroyed by the ordinary course of the
   work rather than disputed afterwards. That difference DEMONSTRATES the
   argument instead of breaking it.

   So a reader who watches the yacht and switches to rentals should recognise
   the shape; one who switches to construction should recognise the RECORD.

   ⚠️  TWO OF THE THREE ARE INTROS ONLY, and they say so. The alternative was
   to stub them with placeholder parties and invented certificates so that
   something moved — which on a page whose entire subject is not inventing
   things would be the worst possible place to invent something. They open on
   their title card and stop, and the notice under the stage is honest about
   why.

   The selector sits ABOVE the stage and the chapter bar sits below it, which
   is the right way round: choosing the sector precedes watching it, and
   choosing where to jump within it follows.
   ========================================================================= */

/** Whether a scenario has been written far enough to watch, whichever shape
 *  it is. The button says "soon" when this is false, so it has to know about
 *  every workflow — a scene that plays but is labelled unwritten is worse
 *  than one that does not play at all. */
function written(scene: TrustSceneIntro) {
  return isPlayableScene(scene) || isBuildScene(scene);
}

/** How long an ending is held before the next sector starts.
 *
 *  The last beat of each piece is its payoff — a resolved tally, a completed
 *  record — and cutting away the instant the timeline runs out would throw
 *  away the thing the run was for. Six seconds is about the time it takes to
 *  read three outcomes.
 *
 *  It lives here rather than in the pieces because how long to dwell between
 *  scenarios is a property of the SEQUENCE, not of any one story in it. */
const SCENE_HOLD_MS = 6000;

/** The sectors that can actually be watched, in order. */
const PLAYABLE = trustScenarios.filter(written);

export function TrustScenarios({ className }: { className?: string }) {
  const [id, setId] = useState(trustScenarios[0].id);

  /* ZERO WHILE THE SERVER'S MARKUP IS ON SCREEN, and bumped by every
     client-side selection. It does two jobs.

     It tells the piece to open at its FIRST beat rather than its last: the
     prerendered scene is written at its final frame and hydrated onto that,
     which is right for the scene the server rendered and wrong for every one
     after it.

     And being part of the key, it forces a REMOUNT even when the same sector
     is selected again — which is what lets the cycle replay a sector, and what
     stops a random pick that happens to land on the first one from quietly
     leaving the server's finished frame on screen. */
  const [run, setRun] = useState(0);

  /* Whether to move on at the end of each piece. Off until the browser says
     it is wanted — see the effect below. */
  const [cycling, setCycling] = useState(false);
  const hold = useRef<number | undefined>(undefined);

  const scene = trustScenarios.find((s) => s.id === id) ?? trustScenarios[0];

  const show = useCallback((next: string) => {
    if (hold.current) window.clearTimeout(hold.current);
    hold.current = undefined;
    setId(next);
    setRun((r) => r + 1);
  }, []);

  /* WHICH SECTOR A VISITOR LANDS ON, decided once, in the browser.

     ⚠️  NOT DURING RENDER. This page is prerendered, and the markup the server
     writes always holds the first sector. A Math.random() in the render body
     would disagree with it, and React reports that as a hydration mismatch.
     After hydration is the only safe moment to choose.

     A LAYOUT effect rather than a plain one, so the swap lands before the
     browser paints. With a plain effect the first sector's finished frame
     shows for a beat before the chosen one starts, which is exactly the flash
     `run` and `fromStart` exist to prevent.

     ⚠️  AND NOT AT ALL UNDER REDUCED MOTION. A visitor who has asked for less
     movement should keep the still frame the server sent them; picking a
     sector at random and then rotating through the others is precisely the
     thing they turned off. matchMedia is read here rather than taken from
     state because state starts false, and a default of "animate" is the wrong
     way round for this decision. */
  useIsomorphicLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!PLAYABLE.length) return;
    setCycling(true);
    show(PLAYABLE[Math.floor(Math.random() * PLAYABLE.length)].id);
  }, [show]);

  /* On to the next sector once this one has finished having its ending
     looked at. The pieces report the end immediately; the wait is here. */
  const handleEnd = useCallback(() => {
    if (!cycling || PLAYABLE.length < 2) return;
    hold.current = window.setTimeout(() => {
      const i = PLAYABLE.findIndex((s) => s.id === id);
      show(PLAYABLE[(i + 1) % PLAYABLE.length].id);
    }, SCENE_HOLD_MS);
  }, [cycling, id, show]);

  useEffect(
    () => () => {
      if (hold.current) window.clearTimeout(hold.current);
    },
    [],
  );

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <nav
        aria-label="Worked example sector"
        className="flex flex-wrap items-center gap-2"
      >
        {trustScenarios.map((s) => {
          const on = s.id === scene.id;
          return (
            <button
              key={s.id}
              type="button"
              /* A click is just another selection: same remount, same
                 opening beat. It does NOT stop the cycle — the reader asked
                 for this sector now, not for the rotation to end, and Replay
                 is there for anyone who wants to hold on one. */
              onClick={() => {
                posthog.capture("trust_scenario_sector_selected", { sector: s.id });
                show(s.id);
              }}
              aria-current={on ? "true" : undefined}
              className={cn(
                "cursor-pointer rounded-sm border px-3 py-1.5 font-mono text-mono-sm uppercase transition-colors",
                on
                  ? "border-accent text-ink"
                  : "border-line text-ink-muted hover:text-ink-secondary",
              )}
              style={{ transitionDuration: "var(--duration-fast)" }}
            >
              {s.sector}
              {/* Said on the button, not only after the click. A reader who
                  picks a sector and gets a notice instead of a story has been
                  led somewhere; one who can see which sectors are written
                  chooses. */}
              {!written(s) && (
                <span className="ml-2 text-ink-muted">· soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* KEYED ON THE SCENE. The engine holds a step, a timer and a set of
          measured boxes, all of which belong to the scenario that was playing
          — switching sector has to be a new run, not the old one resuming at
          whatever beat it had reached. A key is the whole of that. */}
      {/* WHICH PIECE PLAYS IS THE SCENE'S OWN BUSINESS, and it is decided by
          the workflow rather than by the sector. Handover sectors run the
          two-act engine; a progression runs the construction piece, which has
          its own beats over the same core. A sector with neither yet opens on
          its title card and says so. See TrustWorkflow. */}
      {isBuildScene(scene) ? (
        <TrustBuild
          key={`${scene.id}-${run}`}
          scene={scene}
          fromStart={run > 0}
          onEnd={handleEnd}
        />
      ) : isPlayableScene(scene) ? (
        <TrustEngine
          key={`${scene.id}-${run}`}
          scene={scene}
          fromStart={run > 0}
          onEnd={handleEnd}
        />
      ) : (
        <ScenePreview key={`${scene.id}-${run}`} scene={scene} />
      )}
    </div>
  );
}

/** A scenario that has only its title card written.
 *
 *  The same frame, the same floor and the same title card as the real thing,
 *  held still. It is not a placeholder for the piece — it IS the piece, as far
 *  as it has been written, which is one act.
 *
 *  Everything it draws is imported from the engine rather than reproduced, so
 *  a scenario in preparation cannot drift into looking like a different
 *  product from the one it is going to become. */
function ScenePreview({ scene }: { scene: TrustSceneIntro }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const { scale, height } = useStageScale(frameRef);

  return (
    <div className="flex flex-col gap-6">
      <div
        ref={frameRef}
        className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border border-line-strong md:aspect-[16/9]"
      >
        <div
          className="absolute left-0 top-0 isolate origin-top-left"
          style={{
            width: `${DESIGN_W}px`,
            height: `${height}px`,
            transform: `scale(${scale})`,
          }}
        >
          <StageGrid ground={scene.ground} />
          {/* Every part on, and nothing moving. The card animates itself in
              three beats when the piece runs; there is no piece to run yet,
              so it is simply here. */}
          <TitleCard
            on
            line={trustEngineCopy.intro}
            lineOn
            study={scene.study}
            studyOn
          />
        </div>
      </div>

      <p className="text-body-sm text-ink-secondary">
        <span className="text-ink">{scene.sector}</span> is being written. The
        worked example runs in full for {trustScenarios[0].sector} — the same
        platform underneath, with the workflow shaped to the sector on top.
      </p>
    </div>
  );
}
