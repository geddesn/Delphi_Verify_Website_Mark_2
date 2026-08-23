import { useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  DESIGN_W,
  StageGrid,
  TitleCard,
  TrustEngine,
  useStageScale,
} from "@/components/trust/TrustEngine";
import {
  isPlayableScene,
  trustEngineCopy,
  trustScenarios,
  type TrustSceneIntro,
} from "@/content/trust-scenes";

/* ============================================================================
   TRUST SCENARIOS
   ============================================================================
   One argument, three sectors, and a way to choose between them.

   The piece below is deliberately identical whichever is picked — same beats,
   same turn, same ending — because that sameness IS the claim: the platform
   does not change shape per industry. What changes is the asset in the middle
   and the people standing round it. A reader who watches the yacht and then
   switches to rentals should recognise the shape immediately, which is the
   argument arriving without a word of copy.

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
              {!isPlayableScene(s) && (
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
      {isPlayableScene(scene) ? (
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
        worked example runs in full for {trustScenarios[0].sector} — the
        argument is the same one, and so are the beats.
      </p>
    </div>
  );
}
