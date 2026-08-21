# Trust Engine — technical direction

A polished, effects-capable, data-driven animation that demonstrates how Delphi
creates value between two counterparties. Sits **below** the existing static
diagram; the static one states the position, this one demonstrates it.

Intended to be reused on sector pages (e.g. `/industries/yachts`) with
different assets and copy.

---

## 1. The core architectural call

> **Fix the narrative in code. Make the content data.**

The tempting move is a fully generic timeline engine — JSON that describes
beats, targets, easings, effects. Resist it. That is how you end up having
invented a worse After Effects that only one person can operate, and every new
sector becomes an animation-authoring job rather than a copy job.

The six beats are identical for every industry. What changes is the asset, the
words, and the accent. So:

| Fixed in code | Supplied as data |
|---|---|
| Beat sequence and timing | Asset image + alt |
| Stage geometry and reflow | Party labels, roles, burden |
| Effect vocabulary (glow, draw, rise, settle) | The dispute line |
| Reduced-motion and mobile paths | Stage captions |
| Accessibility semantics | Outcomes |

A new sector is then a ~20-line JSON object and one image. That is the
reusability that actually matters.

**Where data *should* get expressive:** per-scene `accent` and `intensity`
hints. A yacht redelivery dispute is sharper than a property viewing; letting a
scene say `"tone": "adversarial" | "distance"` and having the code interpret
that is powerful without becoming a DSL.

---

## 2. Technology — a three-tier recommendation

Not one technology. A backbone, plus effects, plus an escape hatch.

### Tier 1 — Backbone: DOM + SVG, animated with Motion

React component, layout in DOM/SVG, motion via **Motion** (`motion.dev`, the
continuation of Framer Motion). Order of ~18–34 kB gzipped for the React
bindings; a mini variant exists at ~3 kB if we only need WAAPI.

Why not canvas or WebGL for the backbone:

- The labels stay **real text** — indexable, translatable for the other 15
  locales, readable by screen readers, and reflowing on a phone.
- It themes from the existing tokens for free.
- The prerendered resting state is real markup, so the section is not blank for
  crawlers or with JS disabled.

### Tier 2 — Effects: CSS, not filters

This is where "glow and 3D" actually gets delivered, and cheaply:

| Effect | Technique | Cost |
|---|---|---|
| **Glow / bloom** | Layered `filter: drop-shadow()` + a blurred pseudo-element behind the node | GPU-composited, cheap |
| **Depth / 3D** | `perspective` on the stage, `translateZ`/`rotateY` on nodes | Free, GPU, works on mobile |
| **Parallax** | Different `translateZ` per layer under one `perspective` | Free |
| **Beam / link draw** | SVG `stroke-dashoffset` | Cheap |
| **Scan / sweep** | `mask-image` with an animated gradient position | Cheap — same trick as the hero backdrop |
| **Grain / atmosphere** | One static tiling PNG at low opacity | Free |

⚠️ **Avoid animated SVG filters** (`feGaussianBlur`, `feTurbulence`). They are
re-rasterised every frame and are the single most reliable way to make a
diagram stutter on a mid-range Android. CSS `drop-shadow` is compositor-level;
SVG filters are not.

### Tier 3 — Escape hatch: WebGL, only if a beat genuinely needs it

React Three Fiber + postprocessing bloom if we want true volumetric glow,
particle fields or real dimensional rotation. Order of 200–300 kB gzipped
before any assets, plus real GPU and battery cost on phones.

**My honest read:** for a diagram whose subject is *two parties and a record
between them*, real 3D is more likely to dilute the argument than sharpen it.
CSS perspective gives most of the depth impression at none of the cost. But
this is a taste call, and if a beat is designed that genuinely needs shaders,
the backbone above can host a `<canvas>` layer without being rebuilt — which is
the point of separating the tiers.

### Explicitly not recommended

**Lottie / Rive.** Both are authored in an external editor and exported. Their
"JSON" is a compiled artifact, not the hand-editable config this brief asks
for — adding a sector would mean opening After Effects, not editing a content
file. They also render to canvas, so the text stops being text.

---

## 3. Mobile — the hard part, taken seriously

The instinct is to scale the desktop stage down. That fails: a three-node
horizontal diagram at 390px is unreadable, and the effect budget that is fine
on a laptop GPU is not fine on a four-year-old Android.

**Reflow the composition; do not scale it.**

```
DESKTOP                              MOBILE
                                     ┌──────────────┐
┌─────┐          ┌─────┐             │   PARTY A    │
│  A  │ ⇄  ⇄  ⇄ │  B  │             │   + asset    │
└─────┘          └─────┘             └──────────────┘
    ╲            ╱                          ↕  ← exchange runs vertically
     ┌──────────┐                     ┌──────────────┐
     │  DELPHI  │                     │   PARTY B    │
     └──────────┘                     └──────────────┘
                                             ↑
                                     ┌──────────────┐
                                     │    DELPHI    │  ← still rises from below
                                     └──────────────┘
```

The narrative is unchanged — two parties, an exchange, a dispute, Delphi
arriving from below. Only the axis rotates. "Delphi comes in underneath" is
even more legible vertically than horizontally.

**Effect budget by tier**, decided once and applied throughout:

| | Desktop | Mobile |
|---|---|---|
| Glow layers | 2–3 | 1 |
| Parallax | Yes | No |
| Particles | Optional | Never |
| Timeline | Full ~15s | Trimmed ~9s |
| Trigger | On scroll into view | On scroll into view |

**Do not use a video fallback.** It is the obvious answer and it is wrong here:
it loses the text, cannot be translated, is a large download on mobile data,
and on iOS inline autoplay needs `muted` + `playsinline` and still fails in
Low Power Mode — which is exactly when you least want a blank rectangle where
the centrepiece should be.

**Instrument before optimising.** If we want confidence rather than hope, run
the animation behind a frame-time check on a real mid-range device and drop to
the reduced effect tier when frames slip. That is a small amount of code and it
is the difference between "looks great on my laptop" and "looks great".

---

## 4. Data shape

```jsonc
// src/content/trust-scenes.ts  —  one entry per sector
{
  "yachts-marine": {
    "asset": { "image": "yachts-marine", "alt": "…" },
    "tone": "adversarial",                    // interpreted by code, not a style
    "a": { "label": "Owner · Manager · Broker",
           "holds": "Holds the vessel, and the burden of evidencing it." },
    "b": { "label": "Charterer · Captain · Insurer",
           "holds": "Carries the cost if the account is wrong." },
    "exchange": "Delivery → charter → redelivery",
    "dispute":  "That damage was already there.",
    "stall":    "Redelivery contested; vessel off-hire while it is argued.",
    "delphi":   "Verified condition at delivery, incident and redelivery.",
    "outcomes": ["Damage recovered on evidence",
                 "Less downtime in dispute",
                 "Vessel history that carries to resale"]
  }
}
```

Assets referenced by basename and resolved by the existing pipeline, so the
sector photography and icons already in `public/assets/` are reused rather than
duplicated.

⚠️ **Claims discipline still applies.** Outcomes describe what verified evidence
*enables*. Never a measured result — "fewer disputes" is a mechanism, "41%
fewer disputes" is a statistic we do not have.

---

## 5. Suggested route

1. **Prototype one sector end to end at full polish** — Yachts, since the
   asset exists. Desktop only. Get the effects right on one scene before
   generalising; a half-polished generic version teaches us nothing about
   whether the idea lands.
2. **Reflow for mobile**, with the reduced effect tier.
3. **Extract the scene data**, add Property Sales as the second — this is the
   test of whether the seam is in the right place. If adding it needs code, the
   seam is wrong.
4. **Reduced-motion and no-JS paths**, written as first-class states rather
   than retrofitted.
5. Then the remaining sectors, content only.

Step 1 is deliberately throwaway-tolerant. It is cheaper to discover that a
beat does not work at 60fps on a prototype than inside a generalised component.
