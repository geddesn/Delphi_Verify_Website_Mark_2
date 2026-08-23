import type {
  StageGround,
  StagePoint,
  TrustParty,
  TrustSceneIntro,
} from "@/content/trust-scenes";

/* ============================================================================
   TRUST ENGINE — SCENE DATA (construction)
   ============================================================================
   A DIFFERENT WORKFLOW, NOT A DIFFERENT PLATFORM. The core is the one the
   yacht and the tenancy use — controlled capture, corroborating signals,
   sealing, certification. What differs is the shape of the job it is doing,
   and that difference is the argument rather than an exception to it. See the
   note at the head of TrustScenarios.

   ⚠️  THE ARGUMENT HERE IS NOT A DISPUTE.
   A charter and a tenancy end in two honest accounts of one fact. A build
   does not. Nobody is lying and nobody has to be: the wall goes up, and the
   waterproofing behind it stops being observable by anyone, for the life of
   the building. The evidence is destroyed by the ORDINARY COURSE OF THE WORK.

   That is why this scene must never paint the developer as a probable fraud.
   The photographs they send are genuine. The problem is what a photograph
   cannot carry, and what a wall does to the thing behind it — not what anyone
   is hiding. Copy that puts suspicious questions over a developer's
   photographs would be making a different, worse argument, and developers are
   a customer.

   ⚠️  DELPHI DOES NOT CERTIFY THE MILESTONE.
   It does not decide that the foundations are complete, that the work is
   compliant, or that an instalment has fallen due. It records the observed
   physical state of the asset, and the circumstances of the capture, at a
   moment ASSOCIATED WITH a milestone. The contract decides who gets paid.
   Every line below is written to that limit — see the stated-limitations
   entry in src/content/trust.ts, and the identical warning about liability at
   the head of trust-scenes.ts.

   ⚠️  THE BUILD IS IDENTICAL IN BOTH ACTS.
   Same six stages, same concealed work, same wall closing over it, same day.
   If Act Two showed more care, better building or fewer defects, a viewer
   would read it as "Delphi improves construction", which is not a claim we
   can make. The ONLY difference between the acts is whether anything was
   recorded before it disappeared.
   ========================================================================= */

/** An instalment of the purchase price. */
export type BuildPayment = {
  /** Percentage of the price. The five must total 100. */
  pct: number;
  label: string;
};

/** One state of the asset, and the moment it was reached.
 *
 *  ⚠️  THE SIX IMAGES ARE A SEQUENCE AND MUST STAY REGISTERED. The stage
 *  dissolves one into the next in place, so the island outline and the villa
 *  footprint cannot drift between them or the dissolve reads as a cut to a
 *  different property. See build-stages.source.txt for how they were split to
 *  hold that. */
export type BuildStage = {
  id: string;
  /** Basename under public/assets/features. */
  image: string;
  imageAlt: string;
  /** What this moment is called, on the record and on the timeline. */
  label: string;
  stamp: string;
  /** The reference for the record made here. Its own, because each capture is
   *  its own certificate — persistent asset passports are development
   *  direction, not what ships, and a single code spanning the whole build
   *  would quietly claim one. See the `passports` pillar in platform.ts. */
  code: string;
  /** The instalment that falls due when this stage is reported complete.
   *  Absent where no money moves — fit-out is work, not a milestone. */
  payment?: BuildPayment;
};

/** Work that is observable for about a week and then never again.
 *
 *  This is the whole scenario in one type. Everything else here — the
 *  schedule, the exposure, the counterparties — is the setup for it. */
export type ConcealedWork = {
  label: string;
  stamp: string;
  image: string;
  imageAlt: string;
};

export type TrustBuildScene = TrustSceneIntro & {
  workflow: "progression";

  assetAlt: string;
  /** How the island stands on the stage, in stage percentages. See the note
   *  on assetBox in trust-scenes.ts — same rule, different aspect. */
  assetBox: { width: number; top: number };
  ground: StageGround;

  /** The six, in build order. */
  stages: readonly BuildStage[];

  /** The instalments, shown once at the opening and then referred to. */
  schedule: readonly BuildPayment[];

  /** THE HOOK, and it is arithmetic rather than rhetoric: everything except
   *  the last instalment falls due before the buyer can walk in. Stated here
   *  rather than summed in the component so that the sentence and the number
   *  are edited together — a schedule change that silently moved this would
   *  be the worst kind of wrong. */
  exposure: { pct: number; line: string };

  /** The four, in the order they are captured. */
  concealed: readonly ConcealedWork[];

  /** THE CONCEALMENT, shown rather than asserted: one frame before, one after,
   *  and the whole point is that they are the same place.
   *
   *  ⚠️  A MATCHED PAIR. Same bathroom, same camera, same corners, same
   *  drain — reshoot one and you reshoot both. Two different rooms side by
   *  side would prove nothing, which is the rule the yacht saloon pair
   *  follows for the same reason. */
  covering: {
    before: ConcealedWork;
    after: { label: string; image: string; imageAlt: string };
  };

  /** Two: the one on site, and the one who is not. */
  parties: TrustParty[];

  /** Where the record panel sits. */
  record: { panel: StagePoint };

  narration: Record<string, { line: string; sub?: string }>;

  unresolved: { headline: string; cost: string; outcomes: readonly string[] };
  resolved: { headline: string; outcomes: readonly string[] };

  /** The last thing said. Construction earns an ending the other two do not,
   *  because its record keeps paying after the argument it was made for has
   *  gone away. */
  closing: string;
};

export const buildScene: TrustBuildScene = {
  id: "development-construction",
  sector: "Development & Construction",
  study: "Villa Construction · Example Study",
  workflow: "progression",
  acts: ["intro", "act-one", "turn", "act-two"],

  assetAlt:
    "A private Maldivian island seen from above, with a villa under construction",

  /* 46% at 58%, against the yacht's 44% at 61% and the townhouse's 35.5%.
     This asset is 2.252:1 — far wider than either — so matching their
     VERTICAL extent would take 60% of the stage width and leave the
     counterparty panels nowhere to stand.

     It also sits HIGHER than the other two, because this stage carries a
     payment bar the others do not and the narration owns the bottom 19%.
     46% at 58% puts the island at x 27-73 and y 39.8-76.2, which clears the
     record panel above it and the narration below. Every anchor below is a
     percentage of that box — move it and re-derive them. */
  assetBox: { width: 46, top: 58 },

  /* The yacht's floor. Wrong in principle — its vanishing point was ray-cast
     from a waterline that is not this asset's — but the island is an opaque
     cut-out carrying its own sea and beach right to its edge, so almost none
     of the grid shows through. Re-derive it if the asset ever loses that. */
  ground: { render: "trust-ground", opacity: 1 },

  stages: [
    {
      id: "plot",
      image: "build-1-plot",
      imageAlt: "The island before construction begins, sand and palms",
      label: "Plot",
      stamp: "4 Mar 2025",
      code: "R2FD-N8YT",
    },
    {
      id: "foundations",
      image: "build-2-foundations",
      imageAlt: "Excavation, footings and slabs across the plot",
      label: "Foundations",
      stamp: "22 May 2025",
      code: "L7BC-K4HM",
      payment: { pct: 20, label: "Foundations" },
    },
    {
      id: "structure",
      image: "build-3-structure",
      imageAlt: "The concrete frame and columns of the villa standing",
      label: "Structure",
      stamp: "15 Sep 2025",
      code: "T9XW-P3QJ",
    },
    {
      id: "roof",
      image: "build-4-roof",
      imageAlt: "The villa roofed, glazed and watertight",
      label: "Roof",
      stamp: "8 Dec 2025",
      code: "D5KR-V6NB",
      payment: { pct: 30, label: "Structure & roofing" },
    },
    {
      id: "fitout",
      image: "build-5-fitout",
      imageAlt: "The villa complete, terraces laid and planting going in",
      label: "Fit-out",
      stamp: "19 Mar 2026",
      code: "G8MT-Z2LC",
    },
    {
      id: "handover",
      image: "build-6-handover",
      imageAlt: "The finished villa, furnished and landscaped",
      label: "Handover",
      stamp: "26 Jun 2026",
      code: "Q4WY-H7SD",
      payment: { pct: 15, label: "Handover" },
    },
  ],

  schedule: [
    { pct: 10, label: "Deposit" },
    { pct: 25, label: "Contract" },
    { pct: 20, label: "Foundations" },
    { pct: 30, label: "Structure & roofing" },
    { pct: 15, label: "Handover" },
  ],

  /* 10 + 25 + 20 + 30. Everything but the last instalment. */
  exposure: {
    pct: 85,
    line: "falls due before the buyer can stand in it.",
  },

  concealed: [
    {
      label: "Structural connections",
      stamp: "15 Sep 2025",
      image: "conceal-structural",
      imageAlt:
        "A reinforced concrete column and beam junction with the reinforcement cage exposed",
    },
    {
      label: "Waterproofing",
      stamp: "28 Nov 2025",
      image: "conceal-waterproofing",
      imageAlt:
        "A bathroom floor with waterproofing membrane laid across it and turned up the walls",
    },
    {
      label: "Pipework",
      stamp: "2 Dec 2025",
      image: "conceal-pipework",
      imageAlt: "Copper and plastic pipework running through an open blockwork wall",
    },
    {
      label: "Electrical services",
      stamp: "4 Dec 2025",
      image: "conceal-electrical",
      imageAlt: "Conduit and cabling routed through an open ceiling void",
    },
  ],

  covering: {
    before: {
      label: "Waterproofing",
      stamp: "28 Nov 2025",
      image: "conceal-waterproofing",
      imageAlt:
        "A bathroom floor with waterproofing membrane laid across it and turned up the walls",
    },
    after: {
      label: "The same bathroom, finished",
      image: "conceal-waterproofing-covered",
      imageAlt:
        "The same bathroom finished in pale stone, the membrane no longer visible",
    },
  },

  parties: [
    {
      id: "developer",
      label: "Developer",
      role: "Developer · On the island",
      /* The counterpart of the captain and the letting agent: the party who is
         physically there, and therefore the party who captures. */
      holds: "Builds, reports each stage, and requests the instalment.",
      side: "left",
      anchor: { x: 44.5, y: 58.9 },
      /* Not an accusation and not a defence. Both of these are true, which is
         the difficulty. */
      claim: "It was built correctly.",
      enters: { one: "a1-parties", two: "a2-parties" },
    },
    {
      id: "buyer",
      label: "Buyer",
      role: "Buyer · Four thousand miles away",
      holds: "Pays 85% of the price before seeing any of it.",
      side: "right",
      anchor: { x: 57.4, y: 53.4 },
      claim: "I have no way to see.",
      enters: { one: "a1-parties", two: "a2-parties" },
    },
  ],

  /* Below the payment bar, not at the very top: the two share the top of the
     stage in act two, and the money has to stay visible while the record
     fills or the piece stops being about what the buyer is exposed to. */
  record: { panel: { x: 50, y: 15 } },

  narration: {
    "a1-plot": {
      line: "A villa bought before it exists.",
      sub: "An island the buyer has never stood on.",
    },
    "a1-schedule": {
      line: "The price is paid in five instalments.",
    },
    "a1-parties": { line: "Two parties, four thousand miles apart." },
    "a1-contract": {
      line: "Deposit and contract: a third of the price, before a spade goes in.",
    },
    "a1-foundations": {
      line: "The foundations are reported complete.",
      sub: "Another fifth falls due.",
    },
    "a1-photos": {
      line: "Photographs arrive with the request for payment.",
      sub: "They are almost certainly genuine. Nothing on them says when, or where.",
    },
    "a1-structure": {
      line: "Structure and roofing: the largest instalment of all.",
    },
    "a1-detail": {
      line: "And underneath it, the work that matters most.",
      sub: "Waterproofing, pipework, services, structure.",
    },
    "a1-cover": {
      line: "Then it is covered.",
      sub: "No photograph taken after this can show what is behind it.",
    },
    "a1-handover": {
      line: "At handover the villa is beautiful.",
    },
    "a1-lost": {
      line: "And the build is behind the walls.",
      sub: "Nobody hid anything. It simply stopped being observable.",
    },

    "a2-plot": {
      line: "The same island. The same schedule.",
      sub: "This time the state of the site is recorded before anything is built.",
    },
    "a2-foundations": {
      line: "Each stage is recorded as it is reached.",
      sub: "Associated with the milestone — not a judgement that it was met.",
    },
    "a2-structure": { line: "The frame goes up, and is recorded." },
    "a2-conceal": {
      line: "And so is everything about to disappear.",
      sub: "Waterproofing before it is covered. Pipework before the walls close.",
    },
    "a2-cover": {
      line: "The wall closes exactly as it did before.",
      sub: "This time what is behind it is on record.",
    },
    "a2-fitout": { line: "Fit-out, finishes, landscaping." },
    "a2-handover": { line: "The same villa, on the same day." },
    "a2-record": {
      line: "Six dated records of one build.",
      sub: "Not photographs. The observed state of the asset, in the order it happened.",
    },
  },

  unresolved: {
    headline: "The build is behind the walls.",
    cost: "85% paid on photographs · no dated record of the concealed work",
    outcomes: [
      "No dated record of the work before it was covered",
      "A defect means reconstructing it from emails and memory",
      "The next buyer is told how it was built, not shown",
    ],
  },

  resolved: {
    headline: "Everything that was covered was recorded first.",
    outcomes: [
      "Every stage recorded while it was still observable",
      "Concealed work inspectable long after it was concealed",
      "The next buyer can look, rather than take it on trust",
    ],
  },

  closing:
    "A villa with a history is worth more than an identical villa whose history is behind the walls.",
} as const;
