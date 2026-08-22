# Delphi Verify — Website

Marketing site. Vite + React + TypeScript + Tailwind v4, deployed static.

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # token guard → typecheck → client → ssr → prerender
npm run images       # regenerate product/industry/backdrop WebP from masters
npm run og           # regenerate the Open Graph social card
npm run check:tokens # design-system drift guard
```

## Where things live

| I want to change… | Edit |
|---|---|
| **Colours, fonts, sizes, radii, motion** | `src/styles/theme.css` — the only file with raw values |
| **Words on a page** | `src/content/*.ts` — all copy, no JSX |
| **Page structure** | `src/pages/*.tsx` |
| **Shared components** | `src/components/` |

Two things are centralised on purpose: **all styling** in one stylesheet, and
**all copy** in one folder. You should rarely need to open a component to change
how the site looks or what it says.

## The design system

Open **`/styleguide`** in the running app. Every token renders on one page —
change a value in `theme.css` and watch the whole system respond, rather than
clicking through six pages hunting for what broke.

Three layers, in `src/styles/theme.css`:

1. **Primitives** — the raw palette. Never used by components.
2. **Semantic** — roles: `--surface`, `--ink`, `--accent`, `--verified`. The only
   layer components reference.
3. **Tailwind binding** — exposes them as `bg-surface`, `text-ink`, `border-line`.

So: **rebrand → edit layer 1. Re-theme → edit layer 2.** Components never change.

### Rules the build enforces

`npm run check:tokens` fails on hard-coded hex, raw `rgb()`/`oklch()`, arbitrary
colour utilities (`bg-[#2d2a70]`), or Tailwind default palette colours
(`text-slate-500`) anywhere outside `theme.css`.

This exists because the previous site decayed exactly that way — stock grey
tokens with brand navy sprinkled on as one-off classes, and nothing to catch it.

### Gotcha: don't pass `py-*` to `<Section>`

Tailwind resolves conflicting utilities by **CSS source order, not the order of
classes in the attribute**. So `<Section className="py-10">` does not override
the component's base `py-20` — both are emitted and the base wins, silently.

Use the `padding` prop instead: `default`, `tight`, `flush`, `none`. The same
applies to any component with a baked-in utility you might want to override.

### Prerendering

`npm run build` renders every route to static HTML via `src/entry-server.tsx`,
so crawlers and social scrapers get real content, not an empty root div. The
route table in `src/routes.ts` drives three things at once: client lazy-loading,
prerendering, and sitemap generation. **Add a page there and it is routed,
prerendered and listed automatically.**

Page components are lazy on the client but imported eagerly on the server —
`renderToString` cannot resolve `React.lazy` and would emit the Suspense
fallback instead of the page.

### Product images

`npm run images` converts the app screenshots into responsive WebP.

Sources live outside the repo, in the shared Assets folder (override with
`DV_ASSETS`), and the generated files in `public/assets/product/` are
committed — so the build never depends on a path that exists on one machine.
Re-run it whenever the screenshots are refreshed from the admin site.

The masters are 1.2–3.4 MB PNGs; output is 20–99 kB per size, two widths each.

Use real product captures rather than stock photography. Illustrating an
authenticity product with licensed stock imagery undercuts its own argument.

### Dark mode

Driven by a `data-theme` attribute, falling back to OS preference. Because it is
an *attribute* selector rather than `:root`, any element can opt in locally —
which is how inverted sections work. There are **no `dark:` variants** in the
codebase, and there should not be.

## Content honesty rules

This site sells evidential integrity, so its own claims have to hold up.

- **Compliance status is literal.** `certified` means an auditor issued a
  certificate. `aligned` means designed against a framework with no audit.
  `planned` means not started. See the header of `src/content/trust.ts`.
- **Shipped vs roadmap is visible.** `/platform` separates them with a labelled
  divider. Do not promote a roadmap item without confirming it shipped.
- **Placeholders are gated, not faked.** Leadership, locations and legal entity
  in `src/content/company.ts` sit behind `false` flags. Never populate with
  invented names.

Product claims were written against `PRODUCT_TECHNICAL_DESCRIPTION.md`. If the
product changes, re-check `src/content/platform.ts` first.

## Before launch

- [ ] **Provision `www.delphiverify.com` in Firebase Hosting** — it currently
      serves a `firebaseapp.com` certificate, so every visitor typing `www.`
      hits a browser security warning. Live outage.
- [ ] **Install analytics** — there is currently none, so there is no baseline
      to measure this redesign against.
- [ ] **When the ISO 27001 certificate is issued** (expected ~Sept 2026), change
      its status to `certified` in `src/content/trust.ts` and add the certifying
      body and date. **Do not display the ISO badge asset before issuance.**
- [ ] Re-confirm every compliance status in `src/content/trust.ts`.
- [ ] Decide whether the partner and European Commission brand assets can be
      used as proof (deferred — see `docs/DESIGN-DECISIONS.md` §7).
- [ ] Fill in or keep hidden the company placeholders.
- [ ] **Legal review of `/privacy` and `/terms`** — they render draft content with visible reviewer notes and must not ship in that state.
- [x] ~~Point `/verify` at the real certificate report route.~~ The form now
      hands off to `https://delphiverify.com/v/<CODE>` — absolute, because that
      route is served by the verification app and not by this site.
- [ ] Replace the `mailto:` on `/contact` if a form endpoint exists.
- [ ] Decide the localisation plan (see `docs/DESIGN-DECISIONS.md` §7).

See **`docs/DESIGN-DECISIONS.md`** for why the site is built this way.
