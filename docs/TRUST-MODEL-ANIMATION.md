# Trust Model — animated, industry-cycling

Storyboard and technical direction for replacing the static
"Neither side holds the pen" diagram (`src/components/evidence/TrustModel.tsx`).

---

## 1. What the current diagram already gets right

Worth stating before changing it, because these are the properties that must
survive:

- **It is real text in real elements.** It reflows, it is read aloud correctly,
  search engines index it, and its copy lives in `src/content/home.ts` like
  every other word on the site.
- **It themes for free** — no colour is baked in.
- **It is symmetrical on purpose.** A and B are drawn identically because the
  argument is that neither side is privileged.

Any animation approach that turns this back into a picture of text is a
regression, however impressive it looks.

---

## 2. Tooling — recommendation

| Option | Weight | Verdict |
|---|---|---|
| CSS keyframes only | 0 kB | Fine for loops; painful for a multi-beat narrative with holds and replays |
| **Inline SVG + Web Animations API** | **0 kB** | **Recommended.** Native timelines, `play/pause/finish/reverse`, real sequencing |
| Motion One (`motion`) | ~5 kB gz | Recommended *if* we want spring easing and stagger without hand-rolling |
| Framer Motion | ~35 kB gz | Idiomatic React, but heavy for one diagram |
| GSAP | ~50 kB gz | Best-in-class timelines; more than this needs |
| Lottie | ~250 kB | ❌ Requires After Effects, and renders to a canvas/SVG blob — loses real text, loses theming |
| Rive | ~100 kB wasm | ❌ Another editor and runtime; same text/theming loss |

**Recommendation: SVG + DOM, driven by a small state machine in React, animated
with the Web Animations API — adding Motion One only if the easing work starts
to feel hand-rolled.**

Reasons specific to this project:

- **CSP.** `firebase.json` sets `script-src 'self'`. Anything bundled via npm is
  fine; anything from a CDN needs the policy widened, which we should not do.
- **Prerendering.** All 11 routes render to static HTML. The diagram must be
  meaningful with no JS at all — so the *resolved* state is the markup, and the
  animation is progressive enhancement that plays on top of it.
- **Token discipline.** `npm run check:tokens` fails the build on raw colour.
  SVG strokes and fills must use `var(--…)`, which rules out any tool that
  emits its own colour values.

> ⚠️ Lottie and Rive are what people reach for when they hear "animation", and
> both are the wrong answer here for the same reason: they would undo the thing
> the current component was specifically built to fix.

---

## 3. A structural objection, before the storyboard

The brief describes cycling through every industry. Nine industries at ~15s
each is **over two minutes of animation**, and nobody watches a diagram for two
minutes. Auto-playing loops also tend to pull the eye away from the copy beside
them.

Proposed instead:

- The narrative plays **once**, triggered by `IntersectionObserver` when the
  diagram scrolls into view.
- It then **rests on the resolved state** — which is also the prerendered state.
- Industry is **user-selected** from a row of chips (Property · Rentals ·
  Construction · Yachts · …). Selecting one re-runs the narrative for that
  sector.
- Optional: after the first play, advance once to a second industry to signal
  that the selector exists — then stop.

This keeps the "same platform, many industries" point, without demanding
patience the visitor does not have.

---

## 4. Stage geometry

Five slots, stable across every beat so nothing jumps:

```
        ┌─────────────┐            ┌─────────────┐
        │   PARTY A   │            │   PARTY B   │
        │  + asset    │ ⇄  ⇄  ⇄   │             │
        └─────────────┘            └─────────────┘
                    ╲              ╱
                     ╲            ╱          ← trust links, drawn only from BEAT 3
                      ┌──────────┐
                      │  DELPHI  │            ← rises from below
                      └──────────┘
```

- **A (left)** carries the asset image. Same generated sector photography we
  already ship (`/assets/industries/<sector>-560.webp`) — not a new PNG set.
  It cross-fades on industry change; the frame does not move.
- **B (right)** is text only. Deliberately lighter than A: B holds no asset,
  which is the asymmetry the whole argument turns on.
- **Delphi (centre-bottom)** is absent until BEAT 3.
- **Exchange lane** runs A↔B across the top third.
- **Outcome rail** sits under the whole thing, empty until BEAT 5.

---

## 5. The narrative — six beats

Durations are the *animated* case. Under `prefers-reduced-motion` every beat
collapses to its end state and BEAT 5 is shown immediately (see §8).

| # | Beat | ~Time | What happens | Motion |
|---|---|---|---|---|
| 0 | **Two parties** | 0.0–1.2s | A and B fade up, symmetrical. Asset visible in A. No centre panel, no links. | Opacity + 8px rise, 400ms, `--ease-out-quart`, A and B staggered 80ms |
| 1 | **The exchange** | 1.2–3.6s | A token travels A→B along the lane, then B→A. Twice. Neutral, unremarkable — this is business as usual. | Token translates along a path, 900ms each leg, slight ease-in-out |
| 2 | **The dispute** | 3.6–6.4s | Third exchange stalls mid-lane. Token stops, shivers, turns `--failed`. A dispute label fades in above. Both parties gain a thin `--failed` outline. | Token halts at 55%, 3px shake ×2 over 200ms, colour cross-fade 300ms |
| 3 | **Delphi arrives** | 6.4–8.6s | Delphi panel rises from below the frame into the centre-bottom slot. Two hairlines draw outward from it to A and B. | Panel: 24px rise + fade, 600ms. Links: `stroke-dashoffset` draw, 500ms each, 120ms apart |
| 4 | **The record** | 8.6–12.4s | The four stages tick through inside the Delphi panel — Capture → Corroborate → Seal → Verify. As *Verify* lands, the stalled token clears to `--verified` and completes its journey to B. | Stage rows: 220ms each, 700ms apart. Token resumes, 800ms |
| 5 | **Resolved** | 12.4–14.6s | Dispute label dissolves. Outcome rail fills with this sector's outcomes, staggered. Everything holds. **This is the rest state and the prerendered state.** | Outcomes: 250ms each, 100ms stagger |

**Total ≈ 14.6s.** Long for a loop, appropriate for a once-through narrative.

---

## 6. Industry instantiation A — Property Sales

Asset image: `property-sales` (UAE villa).

| Slot | Copy |
|---|---|
| **Party A** | **Seller · Developer · Agent** — "Holds the property, and the burden of evidencing its condition." |
| **Party B** | **Buyer · Lender · Solicitor** — "Committing on an account of a property they may have seen once, or not at all." |
| **The exchange** | "Listing → offer → exchange" |
| **The dispute** (BEAT 2) | *"That is not the condition I was shown."* |
| **What stalls** | Exchange delayed pending re-inspection |
| **Delphi label** | Verified condition capture at listing, exchange and completion |
| **Outcomes** (BEAT 5) | Remote buyers commit earlier · Less renegotiation on condition · Condition at exchange, evidenced |

**Sector-specific note for the storyboard:** BEAT 2 should read as *distance*,
not dishonesty — the buyer is not accusing anyone, they simply cannot verify
from another country. That is the property-sales flavour of the same problem,
and it is what makes "more international buyers" a credible outcome.

---

## 7. Industry instantiation B — Yachts & Marine

Asset image: `yachts-marine`, or the `yacht-handover` feature composite.

| Slot | Copy |
|---|---|
| **Party A** | **Owner · Manager · Broker** — "Holds the vessel, and the burden of evidencing its condition." |
| **Party B** | **Charterer · Captain · Insurer** — "Carries the cost if the account of its condition is wrong." |
| **The exchange** | "Delivery → charter → redelivery" |
| **The dispute** (BEAT 2) | *"That damage was already there."* |
| **What stalls** | Redelivery contested; vessel off-hire while it is argued |
| **Delphi label** | Verified condition at delivery, incident and redelivery |
| **Outcomes** (BEAT 5) | Damage recovered on evidence · Less downtime in dispute · Vessel history that carries to resale |

**Sector-specific note:** here BEAT 2 *is* a genuine disagreement between two
parties with opposite incentives — sharper and more adversarial than property.
The two sectors deliberately show different *flavours* of the same failure,
which is the point of cycling them at all.

---

## 8. Reduced motion, and the no-JS case

Both matter more than usual here, because this diagram *is* the argument.

- **`prefers-reduced-motion: reduce`** → render BEAT 5 immediately. Not a
  faster animation, and not a blank frame: the resolved diagram, complete, with
  no transitions. The motion tokens already collapse to `0ms`, so most of this
  is automatic — but the *sequencing* must also be skipped, which is a code
  path, not a CSS one.
- **No JavaScript / prerendered HTML** → the markup is BEAT 5. The animation
  only ever removes and replays state that is already in the DOM.
- **Screen readers** → the stage is `aria-hidden` during animation and the
  resolved content is exposed as an ordinary list. Nobody should hear a
  narrative replay.
- **Industry chips** are real `<button>`s in a labelled group, keyboard
  operable, with the current one marked `aria-current`.

---

## 9. Content shape this needs

Extends the existing `trustModel` in `src/content/home.ts` rather than
replacing it — the `parties`, `stages` and `outcomes` already there stay as the
generic fallback.

```ts
export const trustScenes = {
  "property-sales": {
    asset: "property-sales",          // basename in /assets/industries
    a: { label, roles, holds },
    b: { label, roles, holds },
    exchange: "Listing → offer → exchange",
    dispute: "That is not the condition I was shown.",
    stall: "Exchange delayed pending re-inspection",
    delphi: "Verified condition capture at listing, exchange and completion",
    outcomes: [ "…", "…", "…" ],
  },
  "yachts-marine": { /* … */ },
} as const;
```

⚠️ **Claims discipline applies here as everywhere.** Outcomes must describe what
verified evidence *enables*, never a measured result. "Remote buyers commit
earlier" is a mechanism; "37% faster completion" is a statistic we do not have.

---

## 10. Build order

1. Refactor `TrustModel` to render from a scene object rather than the flat
   `trustModel` — static, no animation. Ship that; nothing regresses.
2. Add the industry chips and cross-fade the asset and copy. Still no narrative.
3. Add the six-beat timeline behind `IntersectionObserver`, with the reduced
   motion path written first, not last.
4. Extend to remaining sectors — content only, no code.

Steps 1 and 2 are worth shipping on their own: an industry-switchable diagram
is most of the value, and the narrative is the flourish on top.
