# Delphi Verify — Website Design Decisions

Record of what was decided, and why, during the redesign. Written 2026-08-20.

---

## 1. Positioning

The previous site sold a **narrow tool**: photographs captured in an iOS app,
hashed to blockchain. The new site sells **trust infrastructure**.

> Delphi Verify is a trusted evidence platform for the physical world. It helps
> counterparties establish what was true about a physical asset at a specific
> point in time — reducing information asymmetry, fraud, disputes and mistrust.

The iOS app is no longer the product. It is the capture mechanism — one input
into an evidence platform.

### The qualifying test

Four conditions that, together, define Delphi's market. They appear on the
homepage and again on `/industries`, and they do the work that eight separate
vertical landing pages would otherwise do:

1. Is there a valuable physical object?
2. Is there a transaction or handover?
3. Do the parties have different incentives or incomplete information?
4. Could disagreement about physical reality cost somebody meaningful money?

---

## 2. Audience and hierarchy

Four audiences were identified: businesses deploying it, professionals
self-serving, consumers in a dispute, and developers/API partners.

**Commercial reality set the hierarchy.** Pre-revenue, pursuing moderate deals
with large developers and agencies. So the front door is **B2B credibility →
request a demonstration**. The other three audiences are served by the
routing architecture rather than by the homepage's primary CTA.

### The credibility constraint

A pre-revenue company cannot use the normal B2B trust furniture — no customer
logos, no case studies, no testimonials, no volume statistics.

**The substitute is radical technical transparency.** Delphi's product *is*
proof, which makes "don't trust us, check it yourself" both differentiating and
consistent with what is being sold. This is the site's central argument, and it
is why `/verify-hashes`-style content was promoted out of the footer into a
homepage section.

Corollary: **precision about our own claims is load-bearing.** A company selling
evidential integrity that overstates its compliance position has contradicted
its own proposition. See §5.

---

## 3. Information architecture

Launch scope was deliberately narrowed from a ~35-page sitemap to a set where
**every page ships full**. Thin pages are worse than absent ones — a yacht
operator who lands on a generic Yachts page bounces harder than if it had not
existed.

| Page | Status | Notes |
|---|---|---|
| `/` | Rebuilt | 8 sections, closes with a CTA (the old site had none) |
| `/platform` | Rebuilt | 5-stage model, shipped vs roadmap made explicit |
| `/trust` | New | Trust centre; compliance status placed first |
| `/industries` | New | All 8 verticals on one page |
| `/company` | Rewritten | Crypto-flavoured language removed |
| `/contact` `/verify` | Rewritten | |
| `/privacy` `/terms` | Drafted | Structured scaffold; **needs legal review before launch** |

**Deferred:** individual vertical pages, and the Solutions axis. Solutions and
Industries overlap heavily ("Incident & Claims Evidence" vs "Insurance &
Claims"), which doubles content burden and confuses navigation. Enterprise
buyers self-identify by *who they are* before *what job they need done*, so
Industries leads. Solutions slots in later as a second lens.

**Dropped:** Government & Defence. Defence procurement gates on accreditation
(List X, Cyber Essentials Plus, FedRAMP) that Delphi does not hold; claiming the
vertical invites questions that cannot yet be answered.

---

## 4. Visual direction

**Principle: evidence, not marketing.** The design language borrows from
instruments of record — certificates, ledgers, technical reports.

- **Deep navy as ground, not garnish.** Inverted sections carry the argument, so
  light sections read as documents.
- **Monospace as signal material.** Hashes, coordinates, timestamps and
  certificate IDs in mono, used as texture. This is what makes the site *look*
  evidential rather than like a SaaS landing page.
- **Precision over softness.** Radii reduced from the stock `0.625rem` to
  2–8px. Hairline rules used liberally. This is the single most effective lever
  against "generic template".
- **The product as its own hero image.** A live certificate panel rather than
  stock photography — an authenticity product illustrated with licensed stock
  imagery undercuts itself.
- **Restrained motion.** Evidence systems do not bounce.

Real app screenshots are used throughout (homepage product row, platform
location-privacy section, verify page). They come from the admin screenshots
page and are processed by `npm run images`: 10.2 MB of source PNG becomes
~350 kB of WebP.

### Typography

**IBM Plex Sans + IBM Plex Mono**, self-hosted via `@fontsource`.

Chosen over a neutral geometric grotesque because Plex was drawn as a
corporate/technical typeface, and because Sans and Mono share a skeleton — so a
hash sits beside body text as part of one system. Given how much monospace
evidence data appears throughout, that cohesion does real work.

Self-hosting (not the Google Fonts CDN) is deliberate: faster, makes font swaps
local, and removes a **GDPR exposure** — German courts have held that the Google
Fonts CDN leaks visitor IPs unlawfully, which a procurement security review at
an EU company selling evidence integrity would reasonably flag.

### Colour

Brand navy taken directly from the logo. The wordmark is **#2D3187**, which is
exactly `oklch(36.7% 0.141 275)`, so `--delphi-700` *is* the brand colour and
the scale is built around it at hue 275 with even lightness steps.

An earlier revision shifted the hue to 267 on generic "avoid AI purple" advice.
That was wrong: it moved the palette away from the actual mark. **Do not shift
the hue** — anything other than 275 makes the site subtly disagree with the logo
sitting in the header.

**Evidence colours are reserved.** Green, amber and red may *only* express
verification state. If green appears anywhere on this site, it means "verified".

---

## 5. Honesty rules

These are not stylistic preferences. They are the product's proposition applied
to its own marketing.

**Compliance language.** `certified` = an auditor issued a certificate.
`pending-certification` = implementation complete, auditor has not yet issued.
`in-progress` = audit genuinely underway. `compliant` = a legal obligation met
(GDPR), not a certification. `aligned` = designed against a framework, no audit.
`not-started` = no assessment begun. Never upgrade one without the underlying
fact changing. See `src/content/trust.ts`.

Confirmed with Delphi 2026-08-20: **ISO 27001** implementation complete,
awaiting independent certification (~2–4 weeks); **GDPR** compliant; **SOC 2**
not started. The ISO badge asset must not appear on the site until the
certificate is issued.

`not-started` deliberately renders in the *failed* colour rather than amber.
Not having begun an assessment is not a partial success, and presenting it as
one is the habit this page exists to avoid.

**Shipped vs roadmap.** `/platform` renders capabilities above a divider and
development direction below it, visibly labelled. Asset passports and the
partner API are marked as direction, not capability.

**Claims corrected during the build** (against `PRODUCT_TECHNICAL_DESCRIPTION.md`):

- Removed an implied partner/enterprise API — the API surface is mobile-facing.
- Removed "asset identifiers (VIN, serial, title)" as an available signal.
- Downgraded implied GPS anti-spoofing to what actually happens: accuracy
  filtering and rejection of stale/invalid samples.
- Added video support (was written as photo-only).
- Named Apple App Attest, SHA-256, and EAS on Base mainnet (chain 8453) —
  specificity is a credibility asset that vagueness was throwing away.
- Added location privacy levels (`exact` / `nearby` / `area`).

**Placeholders that must not ship as-is** — leadership, locations and legal
entity in `src/content/company.ts` are gated behind `showLeadership`,
`showLocations`, `showEntity` flags, all `false`. Never populate with invented
names.

---

## 6. Technical decisions

**Stack kept:** Vite + React + Tailwind, deploying static to Firebase Hosting.
The previous problems were fixable without migrating.

| Previous problem | Fix |
|---|---|
| 1.03 MB single JS chunk | Route-level `React.lazy` + vendor split → **95.6 kB gzip** homepage load (−64%) |
| Stock greyscale shadcn tokens | Three-layer token system, brand in the system |
| No dark mode | Full dark mapping at the semantic layer |
| No `prefers-reduced-motion` | Motion tokens collapse to `0ms` globally |
| Breakpoints stop at 1024px | `xl` / `2xl` available |
| Canonical `/product` vs served `/product/` | Fixed — prerender writes directory-form paths and generates matching canonicals |
| Sitemap lists redirecting URLs | Fixed — generated from the route table, lists served URLs |
| No prerendering in the new SPA (regression I introduced) | Fixed — all 10 routes prerender; `/platform` serves 1,816 words |
| No analytics | **Must be installed before launch** — no baseline otherwise |
| **`www.` serves a `firebaseapp.com` cert** | **Provision `www` in Firebase Hosting — live outage** |

### Token architecture

`src/styles/theme.css` is the only file where raw values may exist.

1. **Primitives** — raw palette. Never referenced by components.
2. **Semantic** — roles (`--surface`, `--ink`, `--accent`). The only layer
   components touch.
3. **Tailwind binding** — `@theme inline` exposes them as utilities.

Rebrand = edit layer 1. Re-theme = edit layer 2. Components never change.

Dark mode uses an **attribute selector** (`[data-theme="dark"]`), not `:root`, so
any element can opt into the dark mapping locally. That is how inverted sections
work — no `dark:` variants anywhere in the codebase.

**`npm run check:tokens`** fails the build on hard-coded hex, raw colour
functions, arbitrary colour utilities, or Tailwind default palette colours
outside `theme.css`. It caught a violation in the first build. This guard is what
would have prevented the previous site's decay.

**`/styleguide`** renders every token on one page. Change a value, see the whole
system react.

---

## 7. Open questions

- **Localisation.** The old site ran 16 locales. New content × 16 is a large
  burden, and machine-translated technical/legal copy is a liability with
  enterprise buyers. Recommendation: ship English first, reintroduce locales
  deliberately. **Not yet decided.**
- **Contact form.** No endpoint exists; `/contact` uses `mailto:` rather than a
  form that silently discards submissions. Replace when a backend exists.
- **Logo asset.** Header/footer use a placeholder mark. Drop in the real logo.
- **Verify report route.** `/verify` validates and normalises an 8-character
  code, then redirects to `/verify/{code}`. That report route must exist or be
  repointed at wherever the report is served.
