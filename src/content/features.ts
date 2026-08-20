/* ============================================================================
   ANNOTATED FEATURE FIGURES
   ============================================================================
   Photograph + callout panels, after the "Staged Construction" reference.

   COORDINATES are percentages of the container box, origin top-left:
     anchor — the dot on the asset
     panel  — the panel, positioned by its `align` corner

   To reposition: pass `debug` to <AnnotatedFigure> to overlay a labelled 10%
   grid, read the numbers off the picture, and type them in here. Nothing in
   the component needs touching.

   ⚠️ CLAIMS. These panels look like product output, so they must not assert
   anything the product does not do. Every row below maps to something real:
   capture time, location confirmation, media integrity, and the on-chain
   anchor. Do NOT add rows for asset identity (VIN, hull number, registry) —
   that is roadmap in platform.ts and would be an overclaim here.
   ========================================================================= */

import type { CalloutSpec } from "@/components/product/Callout";

export const yachtHandover = {
  eyebrow: "Worked example",
  headline: "A redelivery, evidenced.",
  standfirst:
    "A charter ends and the vessel is handed back. Condition at that moment decides who pays for what — and it is exactly the moment nobody can later agree on. Each capture becomes a certificate the owner, the charterer, the yard and the insurer can all open.",
  image: {
    base: "/assets/features/yacht-handover",
    width: 2720,
    height: 1530,
    alt: "A large white motor yacht lying at anchor in calm Mediterranean water, seen from just above the surface, with nobody aboard",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "bow",
      title: "Bow & anchor gear",
      subtitle: "Condition captured at redelivery",
      rows: [
        { icon: "date", text: "6 Aug 2026, 13:08 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 21, y: 62 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "topsides",
      title: "Topsides & hull",
      subtitle: "No new damage recorded",
      rows: [
        { icon: "date", text: "6 Aug 2026, 13:14 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 47, y: 74 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "aft",
      title: "Aft deck & tender",
      subtitle: "Inventory and stowage verified",
      rows: [
        { icon: "date", text: "6 Aug 2026, 13:21 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 74, y: 60 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const villaListing = {
  eyebrow: "Worked example",
  headline: "A listing, evidenced.",
  /* No comparison against the listing photographs. Delphi records what was
     observed at a known moment; it does not evaluate anybody else's brochure,
     and implying otherwise would be a capability claim we cannot support. */
  standfirst:
    "A buyer is committing to a property they may have seen once, or not at all. A verified capture records its condition at a known moment — in a form the buyer, their solicitor and their lender can each open, without an account.",
  image: {
    base: "/assets/features/villa-listing",
    width: 2720,
    height: 1530,
    alt: "A contemporary limestone villa in the UAE seen from the garden in morning light, a still reflecting pool across the foreground and nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "elevation",
      title: "Entrance & elevation",
      subtitle: "Condition captured at listing",
      rows: [
        { icon: "date", text: "6 Aug 2026, 09:12 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 40, y: 72 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "glazing",
      title: "Glazing & upper terrace",
      subtitle: "Recorded in the same session",
      rows: [
        { icon: "date", text: "6 Aug 2026, 09:19 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 69, y: 60 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "terrace",
      title: "Terrace & pool",
      subtitle: "Grounds captured to the boundary",
      rows: [
        { icon: "date", text: "6 Aug 2026, 09:26 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 62, y: 92 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const villaCheckout = {
  eyebrow: "Worked example",
  headline: "A check-out, evidenced.",
  standfirst:
    "A tenancy ends and the deposit is contested. Condition at check-out decides who pays for what — and it is the moment the two accounts diverge. Each capture becomes a certificate the tenant, the landlord and an adjudicator can all open.",
  image: {
    base: "/assets/features/villa-checkout",
    width: 2720,
    height: 1530,
    alt: "The emptied living and sleeping space of a high-end villa at changeover, linen squared, a single set of keys on the table and nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "room",
      title: "Room & finishes",
      subtitle: "Condition recorded at check-out",
      rows: [
        { icon: "date", text: "6 Aug 2026, 11:04 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 43, y: 60 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "furnishings",
      title: "Furnishings & floor",
      subtitle: "Captured in the same session",
      rows: [
        { icon: "date", text: "6 Aug 2026, 11:09 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 56, y: 77 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "doors",
      title: "Doors & terrace",
      subtitle: "Recorded to the boundary",
      rows: [
        { icon: "date", text: "6 Aug 2026, 11:15 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 74, y: 55 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const constructionMilestone = {
  eyebrow: "Worked example",
  headline: "A milestone, evidenced.",
  standfirst:
    "A stage payment falls due for work nobody off-site has seen, and much of it is about to be covered for good. Each capture becomes a certificate the developer, the contractor, the funder and the surveyor can all open.",
  image: {
    base: "/assets/features/construction-milestone",
    width: 2720,
    height: 1530,
    alt: "The exposed concrete frame of a villa under construction in low sun, materials stacked square on swept ground and nobody on site",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "frame",
      title: "Frame & slabs",
      subtitle: "Build state at milestone",
      rows: [
        { icon: "date", text: "6 Aug 2026, 07:41 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 33, y: 46 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "infill",
      title: "Blockwork infill",
      subtitle: "Recorded before covering",
      rows: [
        { icon: "date", text: "6 Aug 2026, 07:48 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 36, y: 73 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "upper",
      title: "Upper level & access",
      subtitle: "Captured in the same session",
      rows: [
        { icon: "date", text: "6 Aug 2026, 07:55 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 65, y: 57 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

/* Keyed by industry id, so adding a worked example to another sector is a
   content change rather than a page change. Industries.tsx looks the figure up
   here; it does not name sectors. */
export const featureFigures = {
  "yachts-marine": yachtHandover,
  "property-sales": villaListing,
  rentals: villaCheckout,
  construction: constructionMilestone,
} as const;
