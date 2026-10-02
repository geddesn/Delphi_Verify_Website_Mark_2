// Run after npm run build: node scripts/test-platform-app.mjs
import assert from "node:assert/strict";
import { loadRoutes, render, routeTable } from "../dist-ssr/entry-server.js";

const routes = await loadRoutes();
for (const path of ["/platform/app", "/platform/app/"]) {
  const html = render(path, routes);
  assert.doesNotMatch(html, /Ellerby London/);
  /* The home page used to be WebDashboard — the London agency demo, with
     "Evidence operations", Cadogan Square, a yacht and a villa in the
     Maldives — inside an app about a development in Jamundi. It is now read
     off the same fixture as every other screen, so the assertions are that
     the development is named and that London is nowhere in it. */
  assert.match(html, /Ciudadela Altavista/);
  assert.match(html, /Needs you today/);
  assert.doesNotMatch(html, /Evidence operations|Cadogan|Eaton Place|Grosvenor/);
  assert.match(html, /h-dvh w-full overflow-x-auto/);
  assert.doesNotMatch(html, /<header|<footer/);
}
const map = render("/platform/app/assets", routes);
/* Three towers, each listed beside the map with its own height and unit count.
   This used to assert three "Building · " labels and the path of a Google Maps
   screenshot; the screenshot is gone (unlicensed, and in the wrong language and
   the wrong country) and the assets are the development's real towers. The map
   itself is Leaflet, which mounts in an effect, so there is nothing of it in
   the server HTML to assert on — the list is the SSR-visible contract. */
assert.equal((map.match(/ floors · /g) ?? []).length, 3);
assert.doesNotMatch(map, /demo-london/);
assert.match(map, /Ciudadela Altavista/);
for (const route of routeTable.filter((item) => item.path.startsWith("/platform/app/assets/"))) {
  assert.ok(map.includes(`href="${route.path}"`), `Missing marker for ${route.path}`);
  const detail = render(route.path, routes);
  assert.match(detail, /Back to assets/);
  assert.doesNotMatch(detail, /Ciudadela Altavista/);
  assert.doesNotMatch(detail, /<footer|demo-london/);
}
const marketing = render("/platform/renderings", routes);
assert.match(marketing, /<header/);
assert.match(marketing, /<footer/);
console.log("Platform app layout checks passed");
