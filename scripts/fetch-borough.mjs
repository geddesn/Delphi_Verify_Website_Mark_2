#!/usr/bin/env node
/* ============================================================================
   FETCH BOROUGH  —  the Area panel's polygon, resolved once and committed
   ============================================================================
   Writes src/content/borough-boundary.ts: the outline of the London borough
   containing the evidence record's coordinates, for the "Area" panel of the
   location-privacy section on /trust.

   WHY THIS IS A SCRIPT AND NOT A FETCH IN THE COMPONENT
   Asking the browser for this would put a second third party in front of every
   visitor and need `connect-src` opened in firebase.json on top of the tile
   hosts. The shape of a London borough changes on a timescale of decades. It
   is data, so it ships as data.

   SOURCE AND LICENCE
   ONS Open Geography Portal, Local Authority Districts (May 2024) boundaries,
   full-resolution clipped. Crown copyright and database right, published under
   the Open Government Licence v3.0, which permits commercial reuse with
   attribution. The attribution is rendered in the panel.

   PROVENANCE
   The generated file records the query, the source URL and the vertex counts,
   for the same reason render-ground.mjs writes a .params.json: a committed
   artefact that nobody can regenerate is a liability.

   RUN:  node scripts/fetch-borough.mjs
   ========================================================================= */

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "src", "content", "borough-boundary.ts");

/* Must match RECORD.coordinates in src/content/evidence-record.ts. The three
   map panels and the certificate rendering have to agree about where the
   property is, or the page argues with itself. */
const POINT = { lat: 51.496612, lng: -0.161155 };
const BOROUGH = "Kensington and Chelsea";

/* Full-resolution clipped ("BFC") rather than generalised: the generalised
   layers round the Thames-side detail off in a way that is visible at the
   zoom this panel uses. We simplify ourselves below, on our own terms. */
const SERVICE =
  "https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/" +
  "Local_Authority_Districts_May_2024_Boundaries_UK_BFC/FeatureServer/0/query";

const params = new URLSearchParams({
  where: `LAD24NM='${BOROUGH}'`,
  outFields: "LAD24NM,LAD24CD",
  outSR: "4326", // WGS84 lat/lng, which is what Leaflet speaks.
  f: "geojson",
});

const url = `${SERVICE}?${params}`;
console.log(`  → ${BOROUGH}`);

const res = await fetch(url, {
  headers: { "User-Agent": "delphiverify.com boundary fetch (one-off)" },
});
if (!res.ok) throw new Error(`ONS returned ${res.status} ${res.statusText}`);

const gj = await res.json();
const feature = gj.features?.[0];
if (!feature) throw new Error(`No feature matched LAD24NM='${BOROUGH}'`);

/* ArcGIS hands back Polygon or MultiPolygon depending on the authority.
   Kensington and Chelsea is a single ring, but islands and detached parts are
   common enough in this dataset that assuming otherwise is a trap. */
const geom = feature.geometry;
const rings =
  geom.type === "Polygon"
    ? geom.coordinates
    : geom.coordinates.flat(1); /* MultiPolygon → list of ring-lists */

/* ----------------------------------------------------------------------------
   SIMPLIFY  —  Ramer–Douglas–Peucker
   ----------------------------------------------------------------------------
   The source ring is a few thousand vertices, which is survey-grade detail for
   a panel about 320 px wide. Tolerance is in degrees; 0.00012° is roughly 8–13
   metres here, comfortably under one screen pixel at the zoom this renders at.
   -------------------------------------------------------------------------- */
const TOLERANCE = 0.00012;

function perpendicularDistance([px, py], [x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(px - x1, py - y1);
  const t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  const cx = x1 + Math.max(0, Math.min(1, t)) * dx;
  const cy = y1 + Math.max(0, Math.min(1, t)) * dy;
  return Math.hypot(px - cx, py - cy);
}

function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

const before = rings.reduce((n, r) => n + r.length, 0);

/* Leaflet wants [lat, lng]; GeoJSON stores [lng, lat]. Getting this backwards
   puts Kensington in the Indian Ocean, which at least fails loudly. */
const simplified = rings
  .map((ring) => simplify(ring, TOLERANCE).map(([lng, lat]) => [lat, lng]))
  .filter((ring) => ring.length >= 4);

const after = simplified.reduce((n, r) => n + r.length, 0);

/* Sanity gate. A silently empty or wildly displaced ring would render as
   nothing, or as a spike across London, and either would ship unnoticed. */
const lats = simplified.flat().map(([lat]) => lat);
const lngs = simplified.flat().map(([, lng]) => lng);
const bounds = {
  south: Math.min(...lats),
  west: Math.min(...lngs),
  north: Math.max(...lats),
  east: Math.max(...lngs),
};
const contains =
  POINT.lat > bounds.south &&
  POINT.lat < bounds.north &&
  POINT.lng > bounds.west &&
  POINT.lng < bounds.east;
if (!contains) {
  throw new Error(
    `The record's coordinates fall outside the ${BOROUGH} bounding box. ` +
      `Either the point moved or lat/lng got transposed.`,
  );
}

const body = `/* ============================================================================
   BOROUGH BOUNDARY  —  GENERATED FILE, DO NOT EDIT BY HAND
   ============================================================================
   Regenerate with:  node scripts/fetch-borough.mjs

   ${BOROUGH} (${feature.properties.LAD24CD}), the London borough containing
   the evidence record's capture coordinates. Drawn as the "Area" panel of the
   location-privacy section on /trust, where it stands for the coarsest
   disclosure level a certificate can publish.

   Source:    ONS Open Geography Portal, Local Authority Districts (May 2024),
              full-resolution clipped.
   Licence:   Contains OS data © Crown copyright and database right 2024.
              Open Government Licence v3.0.
   Fetched:   ${new Date().toISOString().slice(0, 10)}
   Vertices:  ${before} source → ${after} after Douglas–Peucker at ${TOLERANCE}°
   ========================================================================= */

/** Ring(s) of [lat, lng] pairs, ready for Leaflet's Polygon. */
export const boroughBoundary: [number, number][][] = ${JSON.stringify(
  simplified.map((r) => r.map(([lat, lng]) => [round(lat), round(lng)])),
)};

export const boroughName = ${JSON.stringify(BOROUGH)};

/** Attribution required by the Open Government Licence. */
export const boroughAttribution =
  "Boundary: ONS / OS © Crown copyright and database right 2024";
`;

function round(n) {
  return Number(n.toFixed(5)); /* ~1 m. Beyond this is noise in a 320 px panel. */
}

writeFileSync(OUT, body, "utf8");
console.log(`  ✓ ${before} → ${after} vertices`);
console.log(`  ✓ bounds ${bounds.south.toFixed(4)},${bounds.west.toFixed(4)} → ${bounds.north.toFixed(4)},${bounds.east.toFixed(4)}`);
console.log(`  ✓ wrote src/content/borough-boundary.ts`);
