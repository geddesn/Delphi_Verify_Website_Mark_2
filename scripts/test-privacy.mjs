import assert from "node:assert/strict";
import {
  redactAnalyticsProperties,
  redactAnalyticsString,
} from "../src/lib/analytics-privacy.ts";
import { parseCookieConsent } from "../src/lib/cookie-consent.ts";

assert.equal(
  redactAnalyticsString("https://delphiverify.com/v/VQM0-DYK8?source=share"),
  "https://delphiverify.com/v/[redacted]?source=share",
);
assert.deepEqual(
  redactAnalyticsProperties({
    $current_url: "https://delphiverify.com/v/ABCD1234",
    outcome: "ready",
    count: 2,
  }),
  {
    $current_url: "https://delphiverify.com/v/[redacted]",
    outcome: "ready",
    count: 2,
  },
);

const legacyConsent = encodeURIComponent(JSON.stringify({
  version: 1,
  decided: true,
  authentication: true,
  maps: true,
  preferences: true,
  updatedAt: "2026-08-01T00:00:00.000Z",
}));
assert.deepEqual(parseCookieConsent(legacyConsent), {
  version: 1,
  decided: false,
  analytics: false,
  authentication: true,
  maps: true,
  preferences: true,
  updatedAt: "2026-08-01T00:00:00.000Z",
});
assert.equal(parseCookieConsent("not-json").decided, false);

console.log("Privacy checks passed");
