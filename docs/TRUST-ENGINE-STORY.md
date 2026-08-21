# Trust Engine — the two-act story

Supersedes the single-arc storyboard in `TRUST-MODEL-ANIMATION.md`.

Asset in the middle. Counterparties arrive around it. The same charter runs
twice — once without a record, once with one — and the only difference between
the two acts is *when* the evidence was captured.

---

## Why this structure is better than the first one

Worth naming, because it changes what the animation argues.

**The asset belongs in the middle.** Everyone in this story relates to the
yacht, not to each other. Owner, charterer and captain all connect *to the
vessel*, which is exactly how the relationships actually work — and it means
the diagram grows by adding spokes rather than by rearranging.

**Running the story twice is the persuasion.** The first version had Delphi
arriving mid-dispute to rescue it, which quietly framed the product as
*remedial* — something you call when it has already gone wrong. Two acts frame
it as *preventative*, captured before anyone needs it. That is the truth of the
product, and it is a stronger sell.

**The incident must be identical in both acts.** Same rip, same place, same
moment. Nothing about the accident changes. The only variable is whether a
record existed beforehand. That sameness *is* the argument — if the incident
differs, a viewer reads it as "Delphi prevents damage", which is not a claim we
can make.

---

## Two things to settle before building

### 1. Who does the captain work for?

This matters, and a broker will notice if we get it wrong.

- **Crewed charter** — the captain is the *owner's* employee. The charterer is
  a guest aboard the owner's operation.
- **Bareboat charter** — the charterer takes the vessel and runs it. The
  captain may be theirs.

The liability story is different in each. **Recommendation: crewed charter,
captain as the owner's representative** — and give the captain a job in the
story rather than a box on the diagram: *the captain is the person who performs
the Delphi capture at delivery and redelivery.* That answers "why is the
captain here?" and it is also what happens in practice — the person with the
phone is the person aboard.

### 2. ⚠️ Delphi does not decide liability

The brief says "charterer is liable, their insurance pays". Delphi cannot
establish that, and the site says so in `src/content/trust.ts`:

> Delphi establishes that a photograph was captured at a given time and place,
> through a verified device and application, and has not changed since. It does
> not interpret what the photograph means.

What Delphi establishes is narrower and stronger: **the interior was undamaged
at delivery, and damaged at redelivery, on dated records neither party
controls.** Liability then follows from the charter agreement, and the insurer
settles because there is nothing left to argue about.

That is a better ending than "Delphi ruled against you":

> **The argument ends because the facts are not in dispute.**

Act Two must resolve on that line, not on an adjudication.

---

## Stage geometry

Radial, not linear. Asset centre, counterparties on spokes, connected with the
**existing callout method** from the expanded industry figure — dot on the
asset, hairline leader with a dark halo, panel at the far end.

```
                    ┌──────────────┐
                    │    OWNER     │
                    └──────┬───────┘
                           │
          ┌──────────────┐ │ ┌──────────────┐
          │  CHARTERER   ├─●─┤   CAPTAIN    │
          └──────────────┘   └──────────────┘
                     ╲   ▲   ╱
                      ╲  │  ╱     ● = incident marker, on the asset
                    [ YACHT IMAGE ]
                           │
                    ┌──────┴───────┐
                    │    DELPHI    │   ← Act Two only, from below
                    └──────────────┘
```

Reusing `Callout.tsx`'s leader-and-halo treatment buys visual continuity with
the industry page for free, and it is already proven against arbitrary
photographic backgrounds.

**Mobile:** the same spokes, rotated. Asset at the top, parties stacking
beneath it, leaders running vertically. Delphi still enters from the bottom.

---

## ACT ONE — Without a record  (~14s, deliberately terse)

Act One is setup and pain. It must not outstay its welcome.

| # | Beat | ~ms | What happens | Notes |
|---|---|---|---|---|
| 1 | **The asset** | 1600 | The yacht alone, centre frame, quiet. `yacht-handover` — no people in it. | Establishes the subject before any party exists |
| 2 | **Owner** | 1400 | Panel fades in above; leader draws down to the vessel. | "Owner · Holds the vessel and the burden of evidencing it." |
| 3 | **Charterer** | 1400 | Panel left; leader draws. | "Charterer · Takes her for two weeks." |
| 4 | **Captain** | 1400 | Panel right; leader draws. | "Captain · Conducts delivery and redelivery." |
| 5 | **Delivery** | 1200 | A brief pulse along the owner→charterer path. Handover happens. Nothing is recorded. | Under-stated on purpose |
| 6 | **The charter** | 1400 | Quiet time passing. Subtle drift on the image. | |
| 7 | **The incident** | 1800 | A marker blooms on the vessel interior. Label: *"Saloon — leather seating, torn."* | Same mark, same place, in both acts |
| 8 | **Redelivery** | 1200 | Both owner and charterer leaders re-point at the incident marker. | |
| 9 | **The dispute** | 2600 | Two claims surface at once: *"That was already there."* / *"She was perfect at delivery."* Both leaders turn `--failed` and pull against each other. | The visual is a tug-of-war with no referee |
| 10 | **Unresolved** | hold | Everything greys and freezes. One line stands: **"Nobody can prove either version."** Cost line beneath: *vessel off-hire, weeks of correspondence, written off or fought.* | Act One does not resolve. That is the point. |

**Ending frame of Act One is a stalemate.** Resist the temptation to soften it.

---

## The turn  (~1.2s)

A fast, unmistakable rewind. The stage desaturates, the parties retract along
their own leaders, the incident marker withdraws, and we are back to the yacht
alone.

One line carries the pivot:

> **"Run it again. Change one thing."**

This has to read as *a replay of the same events*, not as a new scenario. If a
viewer thinks Act Two is a different charter, the comparison collapses.

---

## ACT TWO — With a record  (~18s)

Identical staging. Identical incident. One addition, placed *before* anything
goes wrong.

| # | Beat | ~ms | What happens | Notes |
|---|---|---|---|---|
| 11 | **The asset** | 1200 | Same yacht, same frame. Shorter — the viewer knows this now. | |
| 12 | **Owner** | 1100 | As before. | |
| 13 | **⭐ Delphi capture at delivery** | 2400 | Delphi rises from below. The captain's leader lights. A certificate forms: `Saloon · undamaged · 6 Aug, 09:14 · sealed`. | **The one difference.** Before the charterer exists |
| 14 | **Charterer** | 1200 | Arrives — *after* the record. | Order is the message |
| 15 | **Captain / delivery** | 1200 | Handover, now against a sealed record. | |
| 16 | **The charter** | 1200 | As before. | |
| 17 | **The same incident** | 1800 | The identical marker, identical position, identical label. | Must be pixel-identical to beat 7 |
| 18 | **Redelivery capture** | 2000 | Second certificate: `Saloon · torn · 20 Aug, 16:40 · sealed`. | |
| 19 | **The comparison** | 2400 | The two certificates align side by side. The difference is visible, dated and bounded — undamaged at delivery, damaged at redelivery. Both leaders turn `--verified`. | No adjudication shown |
| 20 | **Resolved** | hold | **"The argument ends because the facts are not in dispute."** Outcomes settle beneath: damage recovered on evidence · vessel back on hire · claim settled without a survey. | See the claims note above |

---

## What the viewer is left with

Two frames, side by side in memory:

| Act One | Act Two |
|---|---|
| Same yacht | Same yacht |
| Same rip, same day | Same rip, same day |
| Two accounts, no record | Two accounts, one record |
| **Unresolved** | **Resolved** |

The only variable is when the evidence was captured. Nothing else in the story
moved — and that is what makes the point land without a single claim about
outcomes we cannot measure.

---

## Practical notes for the build

- **Total ~33s.** Long. Add chapter markers (Act One / The turn / Act Two) so a
  viewer can jump, and keep the Replay control. Do not autoplay a second loop.
- **Act One must feel shorter than Act Two**, even though it carries fewer
  beats — pacing does that work, not duration alone.
- **Reuse `Callout.tsx`** for the leaders, halo and dots rather than
  reimplementing. Panels there are already theme-invariant and proven over
  photography.
- **The incident marker** is the one genuinely new visual primitive. It wants a
  bloom on entry and nothing else — no pulsing loop, which would read as an
  alert rather than an event.
- **Data shape extends `trust-scenes.ts`**: parties become an ordered array
  with arrival timing, plus `incident: { anchor, label, detail }` and two
  `capture` entries. Adding Property Sales stays a content change.
- **Reduced motion** shows the Act Two resolved frame with an Act One summary
  beside it — the comparison, static. Not a frozen mid-animation.
