import { useEffect, useRef } from "react";
/* ⚠️  LEAFLET'S OWN STYLESHEET, and it is not optional. Without it the tile
   images are not absolutely positioned and the map renders as a vertical
   stack of 256px squares. It is imported here as well as in
   trust/LocationPrivacyMap.tsx because a CSS import is scoped to the module
   that makes it — this page does not load that component. */
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { useNavigate } from "react-router-dom";
import { useCookieConsent } from "@/app/privacy/cookie-consent-context";
import { APP_ASSETS, APP_DEVELOPMENT } from "@/content/app-assets";
import { cn } from "@/lib/cn";

/* ============================================================================
   DEVELOPMENT MAP
   ============================================================================
   Where the towers actually are, on a real map.

   ⚠️  THIS REPLACED A SCREENSHOT OF GOOGLE MAPS, and the reasons are worth
   keeping. The asset page used a static JPEG grab of maps.google.com with the
   Google logo and "map data ©2026 Google" baked into the pixels. Three
   problems with that, in order of seriousness:

     1. Google Maps Platform does not licence screenshots as product assets.
        A company whose entire proposition is evidential rigour cannot ship a
        competitor's copyrighted tiles in a picture of its own product.
     2. The capture carried its author's locale, so an English-language page
        about London assets displayed "Londres" and "Rio Tamisa", with
        "Atalhos de teclado" and "Comunicar um erro no mapa" along the bottom.
     3. A raster cannot be panned, zoomed or re-centred, so the markers were
        positioned by percentage and bore no relation to the addresses they
        named — 27 Wilton Crescent was pinned four miles from Belgravia.

   The site already had the answer: components/trust/LocationPrivacyMap.tsx
   has been rendering OpenStreetMap through Leaflet, with attribution and
   behind the maps consent category, since the Trust page was built. This
   follows it exactly.

   ⚠️  NO L.Marker. Leaflet's default marker is a PNG resolved by a runtime URL
   guess, which breaks under every bundler and is the commonest
   Leaflet-with-Vite bug. CircleMarker is pure SVG and takes colour from our
   own tokens. Same reasoning, same note, as the Trust map.

   ⚠️  TILES ARE A THIRD PARTY. tile.openstreetmap.org sees the visitor's IP,
   so nothing loads until maps consent is given — and OSM asks that production
   services not run on their donated infrastructure. A demo page is light use;
   if this ever carries traffic, change TILE_URL and nothing else.
   ========================================================================= */

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors";

/* Close enough to read three towers 150 m apart as three separate buildings,
   wide enough to show they are one site. */
const ZOOM = 16;

export function DevelopmentMap({ className }: { className?: string }) {
  const { allowMaps, consent, ready } = useCookieConsent();
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const navigate = useNavigate();
  /* The click handler is held in a ref so the effect does not list `navigate`
     as a dependency and tear the whole map down on every render. */
  const go = useRef(navigate);
  go.current = navigate;

  useEffect(() => {
    if (!ready || !consent.maps) return;

    /* Leaflet reaches for `document` as it initialises and prerender.mjs runs
       this through renderToString in Node, so the import lives inside the
       effect — which also keeps it out of the initial client bundle. */
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !host.current || map.current) return;

      /* Leaflet paints through an options object rather than classes, so the
         colours arrive as strings — still read from theme.css, never written
         here, which is also what keeps check-tokens.mjs happy. */
      const css = getComputedStyle(host.current);
      const token = (name: string) => css.getPropertyValue(name).trim();
      const MARK = token("--map-mark");
      const RING = token("--map-mark-ring");

      const instance = L.map(host.current, {
        center: [APP_DEVELOPMENT.at.lat, APP_DEVELOPMENT.at.lng],
        zoom: ZOOM,
        /* The wheel zooms while the pointer is over the map. Leaflet defaults
           this on and the Trust page turns it OFF deliberately — those panels
           sit mid-article, where capturing the wheel traps a reader trying to
           scroll past. This map fills its own pane with nothing to scroll
           behind it, so the trap cannot happen and the gesture is simply what
           anybody expects of a map. */
        scrollWheelZoom: true,
        attributionControl: true,
        /* Leaflet puts its zoom control top-left by default, which is where
           the development panel sits — it clipped the title to "udadela
           Altavista". The panel owns that corner; the control moves. */
        zoomControl: false,
      });

      L.control.zoom({ position: "topright" }).addTo(instance);

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
      }).addTo(instance);

      for (const asset of APP_ASSETS) {
        const marker = L.circleMarker([asset.at.lat, asset.at.lng], {
          radius: 11,
          color: RING,
          weight: 2,
          fillColor: MARK,
          fillOpacity: 0.85,
        }).addTo(instance);

        marker.bindTooltip(
          `${asset.name} · ${asset.floors} floors · ${asset.units} apartments`,
          { direction: "top", offset: [0, -12] },
        );
        marker.on("click", () => go.current(`/platform/app/assets/${asset.id}`));
        /* Keyboard parity with the list below the map — a marker that only
           responds to a mouse is not a control. */
        marker.getElement()?.setAttribute("tabindex", "0");
        marker.getElement()?.addEventListener("keydown", (e) => {
          if ((e as KeyboardEvent).key !== "Enter") return;
          go.current(`/platform/app/assets/${asset.id}`);
        });
      }

      /* Frame all three rather than trusting the centre and zoom to contain
         them: the towers are derived from world.ts and could move. */
      instance.fitBounds(
        APP_ASSETS.map((a) => [a.at.lat, a.at.lng] as [number, number]),
        { padding: [90, 90], maxZoom: ZOOM },
      );

      map.current = instance;
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [consent.maps, ready]);

  if (!ready || !consent.maps) {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-sunken p-8 text-center",
          className,
        )}
      >
        <p className="text-body-sm text-ink-secondary">
          The map loads tiles from OpenStreetMap, which receives your IP
          address.
        </p>
        <button
          type="button"
          onClick={allowMaps}
          className="cursor-pointer rounded-md border border-line-strong bg-surface px-4 py-2 text-body-sm text-ink transition-colors hover:border-ink-muted"
        >
          Enable maps
        </button>
      </div>
    );
  }

  return (
    <div
      ref={host}
      /* Leaflet measures its container on init, so the host must already have
         a resolved height — a container still working one out initialises to
         zero and renders an empty box. */
      className={cn(
        "h-full w-full bg-surface-sunken",
        "[&_.leaflet-container]:h-full [&_.leaflet-container]:w-full",
        "[&_.leaflet-container]:bg-surface-sunken",
        "[&_.leaflet-control-attribution]:text-[10px]",
        "[&_.leaflet-interactive]:cursor-pointer",
        className,
      )}
    />
  );
}
