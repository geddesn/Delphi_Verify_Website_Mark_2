// Run after npm run build: node scripts/test-platform-app.mjs
import assert from "node:assert/strict";
import { loadRoutes, render, routeTable } from "../dist-ssr/entry-server.js";

const routes = await loadRoutes();
for (const path of ["/platform/app", "/platform/app/"]) {
  const html = render(path, routes);
  assert.doesNotMatch(html, /Ellerby London/);
  assert.match(html, /Evidence operations/);
  assert.match(html, /h-dvh w-full overflow-x-auto/);
  assert.doesNotMatch(html, /<header|<footer/);
}
const map = render("/platform/app/assets", routes);
assert.equal((map.match(/Building · /g) ?? []).length, 3);
assert.match(map, /\/assets\/maps\/demo-london\.jpg/);
for (const route of routeTable.filter((item) => item.path.startsWith("/platform/app/assets/"))) {
  assert.ok(map.includes(`href="${route.path}"`), `Missing marker for ${route.path}`);
  const detail = render(route.path, routes);
  assert.match(detail, /Back to assets/);
  assert.doesNotMatch(detail, /Ciudadela Altavista/);
  assert.doesNotMatch(detail, /<footer|demo-london\.jpg/);
}
const marketing = render("/platform/renderings", routes);
assert.match(marketing, /<header/);
assert.match(marketing, /<footer/);
console.log("Platform app layout checks passed");
