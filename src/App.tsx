import { Suspense, lazy, useEffect, useMemo } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/NotFound";
import { routes } from "@/routes";

/** Restores scroll on navigation and moves focus to the main landmark, so
 *  keyboard and screen-reader users are not stranded at the bottom of the
 *  previous page. Honours in-page anchors. */
function RouteChangeHandler() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      document.getElementById("main")?.focus({ preventScroll: true });
      return;
    }

    /* The anchor is usually NOT in the document yet. Every route is lazily
       imported (see routes.ts), so a link from one page to an anchor on
       another changes the location while the target page is still a Suspense
       fallback — one querySelector here finds nothing and the reader lands at
       the top of a page they asked to be dropped into the middle of. The
       homepage's industry tiles are all of this shape.

       So: look on each frame until it appears, and give up after a beat
       rather than leaving an observer running. Same-page fragments resolve on
       the first attempt and never reach the second frame. */
    let frame = 0;
    let raf = 0;
    const LIMIT = 60; // frames — about a second

    const settle = () => {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ block: "start" });
        return;
      }
      if (frame++ < LIMIT) {
        raf = requestAnimationFrame(settle);
        return;
      }
      window.scrollTo(0, 0);
    };
    settle();
    return () => cancelAnimationFrame(raf);
  }, [pathname, hash]);

  return null;
}

/** Keeps <title> and the meta description correct on client-side navigation.
 *  The prerendered HTML already carries the right tags for the initial load;
 *  this handles everything after it. */
function DocumentHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = routes.find((r) => r.path === pathname);
    if (!match) return;

    document.title = match.seo.title;

    const setMeta = (selector: string, attr: string, value: string) => {
      const el = document.head.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', "content", match.seo.description);
    setMeta('link[rel="canonical"]', "href", `https://delphiverify.com${pathname}`);
  }, [pathname]);

  return null;
}

function PageFallback() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="font-mono text-mono-sm uppercase text-ink-muted">Loading</span>
    </div>
  );
}

export default function App() {
  /* Lazily loaded on the client for code splitting; the prerender step imports
     the same modules eagerly. One route table, two loading strategies. */
  const lazyRoutes = useMemo(
    () => routes.map((r) => ({ path: r.path, Component: lazy(r.load) })),
    [],
  );

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-ink"
      >
        Skip to content
      </a>

      <RouteChangeHandler />
      <DocumentHead />
      <Header />

      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {lazyRoutes.map(({ path, Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
