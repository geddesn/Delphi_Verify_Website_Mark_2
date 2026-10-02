import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ============================================================================
   BILINGUAL COPY — EN / ES
   ============================================================================
   Scoped to /platform/enterprise. Nothing else on the site is bilingual, and
   this deliberately is not a general i18n layer: no key catalogue, no message
   files, no library. One page needs two languages, and the cheapest honest
   way to do that is to keep both next to each other.

   ⚠️  WHY THE SPANISH SITS BESIDE THE ENGLISH, rather than in a parallel
   file. This codebase has one recurring failure mode and it is drift —
   content/renderings.ts keeps each brief beside the slot it describes "so the
   requirement and the artefact cannot drift apart", and content/dashboard.ts
   imports a certificate code rather than retyping it because "a viewer who
   notices they differ has learned only that neither is real".

   Parallel en.ts / es.ts files are a drift machine: somebody corrects a unit
   count in one and not the other, and the page tells a Colombian reader a
   different story from the English one. A key catalogue is worse for review —
   the Spanish ends up three files away from the screen it renders on, where
   nobody checking that screen will ever read it.

   Side by side, a missing translation is a TYPE ERROR rather than a silent
   fall back to English. That is the whole argument.

   ⚠️  FORMATTING IS PART OF THE TRANSLATION. es-CO writes 1.842 where English
   writes 1,842, and "22 ene 2026" for "22 Jan 2026". Every number and date on
   the page goes through the helpers below. Hardcode a thousands separator and
   the Spanish view reads as machine translation to the only people whose
   opinion of it matters.
   ========================================================================= */

export type Lang = "en" | "es";

/** A string in both languages. The shape every piece of copy in
 *  content/enterprise takes. */
export type Bi = { en: string; es: string };

/** A list in both languages — bullet sets, where the two languages may not
 *  even have the same number of items. */
export type BiList = { en: string[]; es: string[] };

/** Pick a language out of any bilingual value. Generic rather than
 *  Bi-specific so a `{ en: string[]; es: string[] }` resolves to string[]
 *  instead of widening. */
export function t<T>(value: { en: T; es: T }, lang: Lang): T {
  return value[lang];
}

/* ── The URL is the state ──────────────────────────────────────────────────
   ?lang=es, read on mount and written on switch.

   NOT localStorage, for two reasons. The site's ThemeToggle has to consult
   cookie consent before it may remember anything, which is correct for a
   preference and absurd for the language of one page. And a URL carries: the
   person showing this page can send a link that OPENS in Spanish, which is
   the actual use for the switch.

   history.replaceState rather than the router's useSearchParams — the
   provider then has no Router dependency and switching language does not
   push a navigation or re-run route-level effects. */
const PARAM = "lang";

function readLang(): Lang {
  if (typeof window === "undefined") return "en";
  return new URLSearchParams(window.location.search).get(PARAM) === "es"
    ? "es"
    : "en";
}

/* Local rather than imported from TrustEngine, which also exports one. That
   module is ~2,900 lines of animation engine and importing it here to borrow
   a four-line hook would pull the whole thing into this page's chunk. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type LangState = { lang: Lang; setLang: (next: Lang) => void };

const LangContext = createContext<LangState>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  /* "en" on the server, always — the prerendered HTML has to be deterministic
     or hydration reports a mismatch. The URL is consulted immediately after,
     in a LAYOUT effect so a ?lang=es visitor does not see a frame of English
     before the swap. */
  const [lang, setLang] = useState<Lang>("en");

  useIsomorphicLayoutEffect(() => {
    const fromUrl = readLang();
    if (fromUrl !== "en") setLang(fromUrl);
  }, []);

  /* The document's own language, for screen readers and for the browser's
     hyphenation and quote rules. Restored on unmount: the rest of the site is
     English, and leaving `lang="es"` behind would mislabel every page a
     visitor navigates to next. */
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.lang;
    root.lang = lang;
    return () => {
      root.lang = previous;
    };
  }, [lang]);

  const value = useMemo<LangState>(
    () => ({
      lang,
      setLang: (next) => {
        setLang(next);
        const url = new URL(window.location.href);
        /* ?lang=en is the default, so it is removed rather than written —
           a clean URL for the English case, and the link somebody copies
           after switching back is the one they started with. */
        if (next === "en") url.searchParams.delete(PARAM);
        else url.searchParams.set(PARAM, next);
        window.history.replaceState(null, "", url);
      },
    }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

/** The common case: resolve a bilingual value in the current language. */
export function useT() {
  const { lang } = useLang();
  return useCallback(
    <T,>(value: { en: T; es: T }) => value[lang],
    [lang],
  );
}

/* ── Locale-aware formatting ───────────────────────────────────────────────
   en-GB rather than en-US: the site's dates are already written 22 Jan 2026
   through content, and this page should not be the one place that says
   Jan 22, 2026. */
const LOCALE: Record<Lang, string> = { en: "en-GB", es: "es-CO" };

export function fmtInt(n: number, lang: Lang) {
  return new Intl.NumberFormat(LOCALE[lang]).format(n);
}

/** A whole-number percentage. The symbol's spacing differs between the two
 *  locales and Intl knows the rule; "48%" vs "48 %" is exactly the detail
 *  that makes a translated page feel written rather than processed. */
export function fmtPct(fraction: number, lang: Lang) {
  return new Intl.NumberFormat(LOCALE[lang], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(fraction);
}

/** ISO date → "22 Jan 2026" / "22 ene 2026". */
export function fmtDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** ISO date → "22 Jan" / "22 ene", for dense timelines where the year is
 *  already established by the heading above them. */
export function fmtDayMonth(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(LOCALE[lang], {
    day: "2-digit",
    month: "short",
  }).format(new Date(`${iso}T00:00:00Z`));
}
