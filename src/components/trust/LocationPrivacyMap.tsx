import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { cn } from "@/lib/cn";
import { useCookieConsent } from "@/app/privacy/cookie-consent-context";
import { MapConsentPlaceholder } from "@/components/renderings/CaptureMap";
import { CAPTURE_POINT } from "@/content/evidence-record";
import { boroughBoundary, boroughName } from "@/content/borough-boundary";

/* ============================================================================
   LOCATION PRIVACY MAPS
   ============================================================================
   Three panels under the Exact / Nearby / Area cards on /trust, showing the
   SAME capture at three disclosure levels. That is the whole argument of that
   section made visible: the evidence does not move, only what the certificate
   publishes about it.

   ── WHY THESE ARE INERT ────────────────────────────────────────────────────
   Every interaction Leaflet offers is switched off. Partly to match CaptureMap
   on /platform/renderings, which is pointer-events-none for the same reason —
   these are pictures of a product, not maps anyone should be panning. But
   mainly because a pannable Area panel could be zoomed back down to the
   individual house, which would demonstrate the exact opposite of what the
   panel is there to show. The restraint IS the illustration.

   ── WHY NO L.Marker ────────────────────────────────────────────────────────
   Leaflet's default marker is a PNG resolved by a runtime URL guess, which
   breaks under every bundler and is the single most common Leaflet-with-Vite
   bug. CircleMarker and friends are pure SVG, need no assets, and take colour
   from our own tokens. Nothing here needs a teardrop pin.

   ── THIRD PARTY, DECLARED ──────────────────────────────────────────────────
   Tiles come from tile.openstreetmap.org, so this hands the visitor's IP to
   the OSM Foundation. The shared maps consent category prevents Leaflet and
   its tile layer from loading until the visitor explicitly enables maps.

   OSM's tile usage policy asks that production services not be built on their
   donated infrastructure. Three small panels on a marketing site is light use,
   but if traffic grows this should move to a paid provider — which is a change
   to TILE_URL and TILE_ATTRIBUTION below, and nothing else.
   ========================================================================= */

const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = "&copy; OpenStreetMap contributors";

export type PrivacyLevel = "exact" | "nearby" | "area";

/* Grid cell for the Nearby panel, in degrees. Latitude and longitude are
   given separately on purpose: a degree of longitude at this latitude is
   about 0.62 of a degree of latitude, so equal values would draw a lattice of
   visibly wrong rectangles rather than the roughly square cells a snapping
   grid implies. ~0.0045° lat ≈ 500 m. */
const CELL_LAT = 0.0045;
const CELL_LNG = 0.0072;

/* How many cells to draw around the highlighted one. Enough to read as a
   lattice continuing past the frame, not so many that they become noise. */
const GRID_RADIUS = 3;

/* The record's stated capture accuracy, in metres — OPEN_DETAIL.accuracy is
   "±4.2 m" and this is the same figure as a number. Drawn to scale in the
   Exact panel. */
const ACCURACY_M = 4.2;

type Spec = {
  zoom?: number;
  label: string;
};

const SPECS: Record<PrivacyLevel, Spec> = {
  exact: {
    /* Building-level. The panel has to make "the specific position is itself
       the evidence" legible, which means the viewer should be able to see
       WHICH building — a street-level view only shows which street. */
    zoom: 18,
    label: `Map showing the exact capture position at ${CAPTURE_POINT.lat.toFixed(
      4,
    )}° N, ${Math.abs(CAPTURE_POINT.lng).toFixed(4)}° W`,
  },
  nearby: {
    zoom: 13,
    label:
      "Map showing the capture snapped to one cell of a coarse grid, with the surrounding grid visible",
  },
  area: {
    label: `Map showing the outline of the London Borough of ${boroughName}, without a specific position`,
  },
};

export function LocationPrivacyMap({
  level,
  className,
}: {
  level: PrivacyLevel;
  className?: string;
}) {
  const { allowMaps, consent, ready } = useCookieConsent();
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!ready || !consent.maps) return;

    /* Leaflet reaches for `document` as it initialises, and prerender.mjs runs
       this component through renderToString in Node. Importing inside the
       effect keeps the whole library off the server path — and off the initial
       client bundle, since Vite splits a dynamic import out on its own. */
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !host.current || map.current) return;

      /* Leaflet paints its SVG through an options object, so it cannot take a
         utility class and the colours have to arrive as strings. They are
         still read from theme.css rather than written here — see the map-mark
         group there, and check-tokens.mjs, which fails the build on any raw
         colour in a component. */
      const css = getComputedStyle(host.current);
      const token = (name: string) => css.getPropertyValue(name).trim();
      const MARK = token("--map-mark");
      const RING = token("--map-mark-ring");
      const HALO = token("--map-mark-halo");
      const GRID = token("--map-grid");
      const CELL = token("--map-cell-fill");

      const spec = SPECS[level];
      const instance = L.map(host.current, {
        center: [CAPTURE_POINT.lat, CAPTURE_POINT.lng],
        zoom: spec.zoom ?? 12,
        /* Every one of these defaults to true. */
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        touchZoom: false,
        zoomControl: false,
        attributionControl: true,
      });

      /* The Area panel settles its viewport BEFORE any tile layer exists.
         Adding tiles first and calling fitBounds afterwards makes Leaflet
         request a screenful at the opening zoom and then abort every one of
         them mid-flight when the view jumps — four wasted round trips to
         donated infrastructure, per visitor, for pixels nobody ever sees.
         getBounds works on an unattached layer, so the polygon can size the
         map before it is added to it. */
      const boroughLayer =
        level === "area"
          ? L.polygon(boroughBoundary, {
              color: MARK,
              weight: 2,
              opacity: 0.9,
              fillColor: CELL,
              fillOpacity: 1,
              interactive: false,
            })
          : null;

      if (boroughLayer) {
        instance.fitBounds(boroughLayer.getBounds(), {
          padding: [8, 8],
          animate: false,
        });
      }

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
        /* Named so the OSM Foundation can see who is asking, which their
           usage policy requires of anything that is not a browser default. */
        className: "delphi-osm-tiles",
      }).addTo(instance);

      boroughLayer?.addTo(instance);

      if (level === "exact") {
        /* Two circles: the accuracy halo, then the dot on top.

           The halo is L.circle, whose radius is in METRES, so it rescales with
           the zoom and keeps telling the truth about ground distance. The dot
           is L.circleMarker, whose radius is in PIXELS, so it stays legible at
           any zoom. Mixing the two units here is deliberate.

           ACCURACY_M is the record's own ±4.2 m, not a number chosen to look
           good. An earlier draft drew this at 40 m because it read better —
           which is to say it drew a precision claim ten times looser than the
           evidence supports, on the page about not overstating things. If it
           looks too tight at some future zoom, change the zoom. */
        L.circle([CAPTURE_POINT.lat, CAPTURE_POINT.lng], {
          radius: ACCURACY_M,
          color: MARK,
          weight: 1,
          opacity: 0.6,
          fillColor: HALO,
          fillOpacity: 1,
          interactive: false,
        }).addTo(instance);

        L.circleMarker([CAPTURE_POINT.lat, CAPTURE_POINT.lng], {
          radius: 5,
          color: RING,
          weight: 2,
          fillColor: MARK,
          fillOpacity: 1,
          interactive: false,
        }).addTo(instance);
      }

      if (level === "nearby") {
        /* Snap the point down to its cell origin — the same floor-to-grid a
           reduced-precision certificate performs before publishing. */
        const originLat = Math.floor(CAPTURE_POINT.lat / CELL_LAT) * CELL_LAT;
        const originLng = Math.floor(CAPTURE_POINT.lng / CELL_LNG) * CELL_LNG;

        for (let i = -GRID_RADIUS; i <= GRID_RADIUS; i++) {
          for (let j = -GRID_RADIUS; j <= GRID_RADIUS; j++) {
            const south = originLat + i * CELL_LAT;
            const west = originLng + j * CELL_LNG;
            const isSelected = i === 0 && j === 0;

            L.rectangle(
              [
                [south, west],
                [south + CELL_LAT, west + CELL_LNG],
              ],
              {
                color: isSelected ? MARK : GRID,
                weight: isSelected ? 2 : 1,
                opacity: 1,
                fillColor: CELL,
                fillOpacity: isSelected ? 1 : 0,
                interactive: false,
              },
            ).addTo(instance);
          }
        }

        /* Deliberately no dot. At this level the certificate publishes the
           cell, and showing the true position inside it would undo the point
           of the panel. */
      }

      if (level === "area") {
        const polygon = L.polygon(boroughBoundary, {
          color: MARK,
          weight: 2,
          opacity: 0.9,
          fillColor: CELL,
          fillOpacity: 1,
          interactive: false,
        }).addTo(instance);

        instance.fitBounds(polygon.getBounds(), { padding: [8, 8] });
        /* Same reasoning as Nearby: no dot, no cell. The borough is all a
           certificate at this level discloses. */
      }

      map.current = instance;
    })();

    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
  }, [consent.maps, level, ready]);

  if (!ready || !consent.maps) {
    return (
      <MapConsentPlaceholder
        className={cn("h-40 rounded-md border border-line", className)}
        onEnable={allowMaps}
      />
    );
  }

  return (
    <div
      ref={host}
      role="img"
      aria-label={SPECS[level].label}
      /* Height is fixed rather than aspect-ratio'd: Leaflet measures its
         container on init, and a container still resolving its own height
         initialises to zero and renders nothing. */
      className={cn(
        "h-40 w-full overflow-hidden rounded-md border border-line bg-surface-sunken",
        /* Leaflet paints its own focus outlines and z-indexes; keeping the
           panel out of the tab order matches its inert behaviour. */
        "[&_.leaflet-container]:h-full [&_.leaflet-container]:w-full",
        "[&_.leaflet-control-attribution]:text-[9px] [&_.leaflet-control-attribution]:leading-tight",
        className,
      )}
    />
  );
}
