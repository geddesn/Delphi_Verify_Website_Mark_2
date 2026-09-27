import assert from "node:assert/strict";
import { displayAddress, googleMapsLocationUrl } from "./certificate-location.ts";

const address = {
  formattedAddress: "Via Roma 12, Dolceacqua, Liguria, Italy",
  city: "Dolceacqua",
  county: null,
  region: "Liguria",
  country: "Italy",
};
const gps = { lat: 43.852857, lng: 7.635702, accuracy: 1000 };

assert.equal(displayAddress(address, 1000), "Liguria, Italy");
assert.equal(displayAddress(address, 250), "Dolceacqua, Liguria, Italy");
assert.equal(displayAddress(address, 10), address.formattedAddress);
assert.notEqual(new URL(googleMapsLocationUrl(gps)).searchParams.get("center"), "43.852857,7.635702");
assert.equal(new URL(googleMapsLocationUrl(gps)).searchParams.get("zoom"), "13");
gps.accuracy = 250;
assert.equal(new URL(googleMapsLocationUrl(gps)).searchParams.get("zoom"), "15");
assert.notEqual(new URL(googleMapsLocationUrl(gps)).searchParams.get("center"), "43.852857,7.635702");
gps.accuracy = 10;
assert.equal(new URL(googleMapsLocationUrl(gps)).searchParams.get("query"), "43.852857,7.635702");
