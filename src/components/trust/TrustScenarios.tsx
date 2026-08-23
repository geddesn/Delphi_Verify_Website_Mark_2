import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  DESIGN_W,
  StageGrid,
  TitleCard,
  TrustEngine,
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

export function TrustScenarios({ className }: { className?: string }) {
  const [id, setId] = useState(trustScenarios[0].id);
  const scene = trustScenarios.find((s) => s.id === id) ?? trustScenarios[0];

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
              onClick={() => setId(s.id)}
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
        <TrustBuild key={scene.id} scene={scene} />
      ) : isPlayableScene(scene) ? (
        <TrustEngine key={scene.id} scene={scene} />
      ) : (
        <ScenePreview key={scene.id} scene={scene} />
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
