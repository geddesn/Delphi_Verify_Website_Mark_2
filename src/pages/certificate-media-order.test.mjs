import assert from "node:assert/strict";
import test from "node:test";
import { sortMediaForDisplay } from "./certificate-media-order.ts";

test("certificate gallery order leaves capture indexes intact", () => {
  const media = [{ index: 2 }, { index: 0 }, { index: 1 }];
  assert.deepEqual(sortMediaForDisplay(media, null).map(({ index }) => index), [0, 1, 2]);
  assert.deepEqual(sortMediaForDisplay(media, [2, 0, 1]).map(({ index }) => index), [2, 0, 1]);
  assert.deepEqual(sortMediaForDisplay(media, [2, 9]).map(({ index }) => index), [2, 0, 1]);
  assert.deepEqual(media.map(({ index }) => index), [2, 0, 1]);
});
