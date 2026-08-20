import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
/* React Router v7 moved StaticRouter into the main package; the old
   "react-router-dom/server" entry point no longer exists. */
import { StaticRouter, Route, Routes } from "react-router-dom";
import type { ComponentType } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/NotFound";
import { routes, SITE_ORIGIN } from "@/routes";

/* Re-exported so the prerender script reads route metadata from the same
   bundle it renders with — one source of truth, no duplicate table. */
export { routes as routeTable, SITE_ORIGIN };

/* ============================================================================
   SERVER ENTRY — used only by scripts/prerender.mjs at build time.
   ============================================================================
   The previous site prerendered every route to real HTML, which is why search
   engines saw 83 kB of content rather than an empty root div. A client-only
   SPA would have been a meaningful SEO regression, so that behaviour is
   reproduced here.

   Routes are imported EAGERLY here (unlike the client, which lazy-loads them),
   because renderToString cannot resolve React.lazy — it would emit the Suspense
   fallback instead of the page. Both paths read the same table in src/routes.ts.
   ========================================================================= */

type Loaded = { path: string; Component: ComponentType };

export async function loadRoutes(): Promise<Loaded[]> {
  return Promise.all(
    routes.map(async (r) => ({
      path: r.path,
      Component: (await r.load()).default,
    })),
  );
}

/** Renders one route to static HTML. */
export function render(url: string, loaded: Loaded[]): string {
  return renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <div className="flex min-h-dvh flex-col bg-canvas">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-body-sm focus:text-accent-ink"
          >
            Skip to content
          </a>
          <Header />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            <Routes>
              {loaded.map(({ path, Component }) => (
                <Route key={path} path={path} element={<Component />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </StaticRouter>
    </StrictMode>,
  );
}
