/* ============================================================================
   TRUST ENGINE — SCENE DATA (two-act)
   ============================================================================
   The asset sits in the middle. Counterparties arrive around it on spokes.
   The same charter then runs twice — once without a record, once with one —
   and the ONLY difference between the acts is when evidence was captured.

   ⚠️  THE INCIDENT MUST BE IDENTICAL IN BOTH ACTS. Same damage, same place,
   same moment. If it differs at all, a viewer reads the story as "Delphi
   prevents damage", which is not a claim we can make. The sameness IS the
   argument.

   ⚠️  DELPHI DOES NOT DECIDE LIABILITY. It establishes that the interior was
   undamaged at delivery and damaged at redelivery, on dated records neither
   party controls. Liability follows from the charter agreement; the insurer
   settles because nothing is left to argue about. Act Two therefore resolves
   on "the facts are not in dispute", never on an adjudication.
   See the stated-limitations entry in src/content/trust.ts.

   The NARRATIVE is fixed in the component. Only this data changes per sector.
   ========================================================================= */

export type StagePoint = { x: number; y: number };

export type TrustParty = {
  id: string;
  label: string;
  role: string;
  /** One line, in their own terms. */
  holds: string;
  /** Panel position, % of stage, by its `align` corner. */
  panel: StagePoint;
  align: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  /** Where the leader lands on the asset, % of stage. */
  anchor: StagePoint;
};

export type TrustScene = {
  id: string;
  sector: string;
  /** Basename under public/assets/features — the clean asset, no people. */
  asset: string;
  assetAlt: string;

  parties: {
    owner: TrustParty;
    counterparty: TrustParty;
    operator: TrustParty;
  };

  /** The single event. Rendered identically in both acts. */
  incident: {
    anchor: StagePoint;
    label: string;
    detail: string;
  };

  /** The two irreconcilable accounts of it. */
  claims: { by: "owner" | "counterparty"; text: string }[];

  /** Act One's ending. Deliberately bleak. */
  unresolved: { headline: string; cost: string };

  /** Act Two's two captures. */
  captures: {
    delivery: { label: string; stamp: string; state: string };
    redelivery: { label: string; stamp: string; state: string };
  };

  /** Act Two's ending. Not an adjudication. */
  resolved: { headline: string; outcomes: readonly string[] };

  delphi: { label: string; panel: StagePoint; anchor: StagePoint };
};

export const yachtsScene: TrustScene = {
  id: "yachts-marine",
  sector: "Yachts & Marine",
  asset: "yacht-handover",
  assetAlt:
    "A motor yacht lying at anchor in calm water, photographed with nobody aboard",

  parties: {
    owner: {
      id: "owner",
      label: "Owner",
      role: "Owner · Manager",
      holds: "Holds the vessel, and the burden of evidencing her condition.",
      panel: { x: 4, y: 6 },
      align: "top-left",
      anchor: { x: 38, y: 40 },
    },
    counterparty: {
      id: "charterer",
      label: "Charterer",
      role: "Charterer · Guest",
      holds: "Takes her for two weeks, and carries the cost if the account is wrong.",
      panel: { x: 96, y: 6 },
      align: "top-right",
      anchor: { x: 64, y: 40 },
    },
    operator: {
      id: "captain",
      label: "Captain",
      role: "Captain · Owner's representative",
      /* The captain has a job in this story rather than a box on the diagram:
         they are the person aboard, and therefore the person who captures.
         Crewed charter is assumed — on a bareboat the liability story differs
         and this copy would need revisiting. */
      holds: "Conducts delivery and redelivery — and holds the phone.",
      panel: { x: 4, y: 74 },
      align: "bottom-left",
      anchor: { x: 42, y: 64 },
    },
  },

  incident: {
    anchor: { x: 58, y: 54 },
    label: "Saloon · leather seating, torn",
    detail: "Discovered at redelivery. Nobody disputes that it is there.",
  },

  claims: [
    { by: "counterparty", text: "That was already there." },
    { by: "owner", text: "She was perfect at delivery." },
  ],

  unresolved: {
    headline: "Nobody can prove either version.",
    cost: "Vessel off-hire · weeks of correspondence · written off or fought",
  },

  captures: {
    delivery: {
      label: "Saloon · undamaged",
      stamp: "6 Aug 2026, 09:14 UTC",
      state: "Sealed · anchored on Base",
    },
    redelivery: {
      label: "Saloon · torn",
      stamp: "20 Aug 2026, 16:40 UTC",
      state: "Sealed · anchored on Base",
    },
  },

  resolved: {
    headline: "The argument ends because the facts are not in dispute.",
    outcomes: [
      "Undamaged at delivery, damaged at redelivery — both dated",
      "Settled without a survey or a site visit",
      "Vessel back on hire in days, not weeks",
    ],
  },

  delphi: {
    label: "Verified condition at delivery and redelivery",
    panel: { x: 50, y: 96 },
    anchor: { x: 55, y: 70 },
  },
} as const;

/* ── Act structure ─────────────────────────────────────────────────────────
   Fixed for every sector. The component reads this; it is not authored per
   scene, because the whole point is that the platform does not change by
   industry. */
export const acts = {
  one: {
    marker: "Act one",
    title: "Without a record",
  },
  turn: {
    marker: "The turn",
    line: "Run it again. Change one thing.",
  },
  two: {
    marker: "Act two",
    title: "With a record",
  },
} as const;

export const trustEngineCopy = {
  eyebrow: "How the value is created",
  headline: "The same charter, run twice.",
  standfirst:
    "One yacht, three counterparties and one accident — played through without a record, then again with one. Nothing about the accident changes. Only when the evidence was captured.",
  replay: "Replay",
  staticNote:
    "Shown as a comparison rather than an animation, because your system asks for reduced motion.",
} as const;

export const trustScenes = {
  "yachts-marine": yachtsScene,
} as const;
