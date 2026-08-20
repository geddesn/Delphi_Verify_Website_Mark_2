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
      subtitle: "Supports a redelivery damage claim",
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
      subtitle: "Establishes condition at handback",
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
      subtitle: "Evidence for owner and charterer",
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
      subtitle: "Establishes condition at listing",
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
      subtitle: "Grounds for a remote buyer to commit",
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
      subtitle: "Reduces renegotiation on condition",
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
    alt: "The emptied living space of a modern city apartment at the end of a tenancy — scuffed wall, a pale rectangle where a picture hung, a chipped kitchen unit and a single set of keys on the worktop, with nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "wall",
      title: "Walls & decoration",
      subtitle: "Supports the deposit position",
      rows: [
        { icon: "date", text: "6 Aug 2026, 11:04 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 28, y: 60 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "floor",
      title: "Floor & wear",
      subtitle: "Supports the fair-wear assessment",
      rows: [
        { icon: "date", text: "6 Aug 2026, 11:09 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 46, y: 89 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "kitchen",
      title: "Kitchen & fittings",
      subtitle: "Evidence for an adjudicator",
      rows: [
        { icon: "date", text: "6 Aug 2026, 11:15 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 62, y: 76 },
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
      subtitle: "Substantiates the stage payment",
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
      subtitle: "Evidences work before it is buried",
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
      subtitle: "Supports remote sign-off",
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

export const claimInspection = {
  eyebrow: "Worked example",
  headline: "A loss, evidenced.",
  standfirst:
    "A claim is notified and the argument turns on what the room looked like before. Each capture becomes a certificate the policyholder, the adjuster and the underwriter can all open.",
  image: {
    base: "/assets/features/claim-inspection",
    width: 2720,
    height: 1530,
    alt: "A reception room after an escape of water — a tide mark and blistered plaster along the base of one wall, cupped floorboards, a sheeted sofa and a dehumidifier, with nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "wall",
      title: "Wall & plaster",
      subtitle: "Supports the claim at first notification",
      rows: [
        { icon: "date", text: "6 Aug 2026, 10:22 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 27, y: 73 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "floor",
      title: "Floor & skirting",
      subtitle: "Establishes the extent of loss",
      rows: [
        { icon: "date", text: "6 Aug 2026, 10:28 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 46, y: 90 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "contents",
      title: "Contents & furnishings",
      subtitle: "Evidence for adjuster and underwriter",
      rows: [
        { icon: "date", text: "6 Aug 2026, 10:35 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 66, y: 74 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const vehicleHandover = {
  eyebrow: "Worked example",
  headline: "A handover, evidenced.",
  standfirst:
    "A vehicle changes hands and comes back with damage nobody will own. Each capture becomes a certificate the fleet, the driver and the insurer can all open.",
  image: {
    base: "/assets/features/vehicle-handover",
    width: 2720,
    height: 1530,
    alt: "A dark executive saloon standing alone under a deep concrete canopy, palms and desert planting beyond, with nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "front",
      title: "Front wing & bumper",
      subtitle: "Establishes condition at handover",
      rows: [
        { icon: "date", text: "6 Aug 2026, 08:14 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 33, y: 62 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "flank",
      title: "Doors & sill",
      subtitle: "Supports recovery of damage cost",
      rows: [
        { icon: "date", text: "6 Aug 2026, 08:17 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 58, y: 68 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "rear",
      title: "Rear quarter & wheels",
      subtitle: "Evidence for fleet and driver",
      rows: [
        { icon: "date", text: "6 Aug 2026, 08:21 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 76, y: 60 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const assetInspection = {
  eyebrow: "Worked example",
  headline: "Collateral, evidenced.",
  standfirst:
    "An asset secures a facility, and the party financing it has never stood in front of it. Each capture becomes a certificate the lender, the operator and the surveyor can all open.",
  image: {
    base: "/assets/features/asset-inspection",
    width: 2720,
    height: 1530,
    alt: "A mid-size business jet standing alone in a clean maintenance hangar, a wheeled stand and coiled ground cables alongside, with nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "fuselage",
      title: "Forward fuselage",
      subtitle: "Evidences collateral in place",
      rows: [
        { icon: "date", text: "6 Aug 2026, 14:02 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 22, y: 68 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "wing",
      title: "Wing root & flap",
      subtitle: "Supports the periodic review",
      rows: [
        { icon: "date", text: "6 Aug 2026, 14:09 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 62, y: 74 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "engine",
      title: "Engine & pylon",
      subtitle: "Evidence for lender and operator",
      rows: [
        { icon: "date", text: "6 Aug 2026, 14:16 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 89, y: 60 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const consignmentHandover = {
  eyebrow: "Worked example",
  headline: "A handover, evidenced.",
  standfirst:
    "Custody passes through several pairs of hands, and if the work is damaged nobody can say at which. Each capture becomes a certificate the shipper, the handler, the receiver and the insurer can all open.",
  image: {
    base: "/assets/features/consignment-handover",
    width: 2720,
    height: 1530,
    alt: "An open birch ply crate on a wheeled dolly in a fine art inspection bay, a wrapped work inside and the removed front panel leaning beside it, with nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "crate",
      title: "Crate & contents",
      subtitle: "Fixes condition at this handover",
      rows: [
        { icon: "date", text: "6 Aug 2026, 15:31 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 40, y: 58 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "base",
      title: "Base & handling",
      subtitle: "Locates liability in the chain",
      rows: [
        { icon: "date", text: "6 Aug 2026, 15:36 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 44, y: 85 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "second",
      title: "Second consignment",
      subtitle: "Supports a cargo claim",
      rows: [
        { icon: "date", text: "6 Aug 2026, 15:42 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 59, y: 62 },
      panel: { x: 96, y: 8 },
      align: "top-right",
    },
  ] satisfies CalloutSpec[],
  note: "Illustrative certificate data. Values shown are examples.",
} as const;

export const equipmentReturn = {
  eyebrow: "Worked example",
  headline: "A return, evidenced.",
  standfirst:
    "Equipment comes back and responsibility for its condition is about to transfer. Each capture becomes a certificate the unit, the depot and the support contractor can all open.",
  image: {
    base: "/assets/features/equipment-return",
    width: 2720,
    height: 1530,
    alt: "An olive support truck with its tailgate lowered in a maintenance hangar, an inspection platform and tool bench alongside, with nobody present",
  },
  /* Illustrative. Values are examples, and the figure says so beneath. */
  callouts: [
    {
      id: "tailgate",
      title: "Tailgate & fittings",
      subtitle: "Establishes condition at return",
      rows: [
        { icon: "date", text: "6 Aug 2026, 16:05 UTC" },
        { icon: "location", text: "Location confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 34, y: 62 },
      panel: { x: 4, y: 8 },
      align: "top-left",
    },
    {
      id: "body",
      title: "Body & load bed",
      subtitle: "Supports the transfer of responsibility",
      rows: [
        { icon: "date", text: "6 Aug 2026, 16:11 UTC" },
        { icon: "device", text: "Captured on attested device" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 55, y: 45 },
      panel: { x: 36, y: 8 },
      align: "top-left",
    },
    {
      id: "running",
      title: "Wheels & running gear",
      subtitle: "Evidence for unit and contractor",
      rows: [
        { icon: "date", text: "6 Aug 2026, 16:18 UTC" },
        { icon: "chain", text: "Anchored on Base · confirmed" },
        { icon: "integrity", text: "Media integrity secured" },
      ],
      anchor: { x: 67, y: 75 },
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
  insurance: claimInspection,
  automotive: vehicleHandover,
  industrial: assetInspection,
  logistics: consignmentHandover,
  defence: equipmentReturn,
} as const;
