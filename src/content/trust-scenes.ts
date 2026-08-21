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

import type { Align } from "@/components/annotation/geometry";

export type StagePoint = { x: number; y: number };

export type TrustCapture = {
  label: string;
  stamp: string;
  /** One word, for the copy of this certificate each party holds. */
  event: string;
  /** Basename under public/assets/features. */
  image: string;
  imageAlt: string;
};

/* ⚠️  ANCHORS ARE PERCENTAGES OF THE STAGE, NOT OF THE ASSET IMAGE.
   The asset is a cut-out trimmed to its own bounding box, so it occupies a
   known rectangle of the stage — currently x 28-72, y 37-85, from w-[44%] at
   top-[61%]. An
   anchor is therefore box.origin + (position on the vessel x box.size). Change
   the asset's width class or swap in an image of a different aspect ratio and
   every anchor below moves off the vessel; re-derive them, do not nudge. */

export type TrustParty = {
  id: string;
  label: string;
  role: string;
  /** One line, in their own terms. */
  holds: string;
  /** Which side of the asset the panel stands on. Not a coordinate: the
   *  panels on a side are stacked and centred on the middle of the stage, so
   *  where any one of them lands depends on how many others share the column
   *  and how tall their copy runs. The layout decides; the leader measures. */
  side: "left" | "right";
  /** Where the leader lands on the asset, % of stage. */
  anchor: StagePoint;
  /** What they say when the damage is found. Not every party has an account
   *  — the ones who do are the ones the argument is between. */
  claim?: string;
  /** The step at which they join each act, BY STEP ID rather than by index.
   *  Ids survive an edit to the running order; indices do not, and silently
   *  point at the wrong beat when they stop being right. */
  enters: { one: string; two: string };
};

/* The floor the asset stands on.

   Almost nothing is here, and that is the point. The geometry — horizon,
   vanishing point, field of view, grid, fog, the plane itself — is ray-cast
   offline into a mask by scripts/render-ground.mjs (`npm run ground`), and
   recorded beside it in <render>.params.json. A CSS floor could only manage
   one-point perspective with lines of a constant screen width, and both of
   those give it away as fake.

   Those parameters are derived from the ASSET, not chosen: the yacht's
   waterline rises 7.36 degrees to the right — measured off the cut-out's own
   alpha channel — and extending it to a horizon at 50% crosses x = 103%. Put
   the vanishing point there and the floor recedes along the vessel's own axis.
   Replace the asset and it has to be measured again, and re-rendered. */
export type StageGround = {
  /** Basename under public/assets/ground. */
  render: string;
  /** How hard to burn it in, 0-1. */
  opacity: number;
};

export type TrustScene = {
  id: string;
  sector: string;
  /** Named on the opening title card, under the brand line. */
  study: string;
  /** Basename under public/assets/features — the clean asset, no people. */
  asset: string;
  assetAlt: string;

  ground: StageGround;

  /** The cast, in reading order down each column.
   *
   *  An array, not a fixed set of roles: the number of counterparties is a
   *  property of the sector, not of the platform. A property sale has a buyer
   *  and a seller and no operator at all; a construction milestone has a
   *  contractor, an architect and a lender. Adding or removing one here is
   *  the whole change — the columns re-centre, the leaders re-measure, and
   *  the certificates are issued to whoever is in the list. */
  parties: TrustParty[];

  /** The single event. Rendered identically in both acts — a marker on the
   *  vessel, nothing more. What is SHOWN of it lives in `record` below,
   *  because the whole point is that the same damage is evidenced two
   *  different ways. */
  incident: {
    anchor: StagePoint;
    label: string;
  };

  /** The title above the stage, keyed by step id. Sparse on purpose: a step
   *  with no line of its own keeps the last one, so the title changes when the
   *  story turns rather than on every beat. The three lines that already exist
   *  as data — the turn, the stalemate, the resolution — are not repeated
   *  here; the component composes them in. */
  narration: Record<string, { line: string; sub?: string }>;

  /** Act One's ending. Deliberately bleak.
   *
   *  `outcomes` mirrors the resolved list line for line — same order, same
   *  subject, opposite result. That pairing is the argument: read down one
   *  and then the other and the only thing that changed is whether there was
   *  a record. Edit one and edit its opposite number. */
  unresolved: { headline: string; cost: string; outcomes: readonly string[] };

  /** Act Two's ending. Not an adjudication. */
  resolved: { headline: string; outcomes: readonly string[] };

  /** THE TOP SLOT, and the two things that can occupy it.
   *
   *  One position, filled by exactly one of these at a time. Act One puts
   *  there what the parties actually have — a photograph from one of them,
   *  with nothing to date it. Act Two puts the record there instead.
   *
   *  ⚠️  THEY MUST NEVER APPEAR TOGETHER. The swap IS the argument: same
   *  place on the stage, same damage, same photograph even — only the
   *  provenance changes. Show both and it becomes a feature comparison.
   *
   *  ⚠️  The verified pair is a MATCHED PAIR — same room, same angle, same
   *  framing, differing only in the damage. Two photographs of different
   *  things side by side prove nothing. Replace one and you replace both. */
  record: {
    panel: StagePoint;
    align: Align;
    /* No anchor of its own. Whatever is in this slot is a record of the
       saloon, so its leader lands on the saloon — the incident anchor — and
       shares the marker already there. Two dots a few percent apart, one
       connected and one not, read as a mistake. */
    unverified: { title: string; capture: TrustCapture };
    verified: {
      title: string;
      delivery: TrustCapture;
      redelivery: TrustCapture;
    };
  };
};

export const yachtsScene: TrustScene = {
  id: "yachts-marine",
  sector: "Yachts & Marine",
  /* The title card's second line. Sector-specific, and it says "example"
     because that is what it is: an illustration of the mechanism, not a case
     study of a real charter. */
  study: "Yacht Charter · Example Study",
  /* A cut-out, not a photograph. The stage is a diagram, and a rectangular
     photograph in the middle of it reads as a picture pasted onto the scene
     rather than as the object everyone is standing around. */
  asset: "yacht-cutout",
  assetAlt: "A motor yacht lying in calm water, with nobody aboard",

  /* Derived from the vessel, not chosen. Its waterline rises 7.36 degrees to
     the right — measured off the cut-out's own alpha channel — and extending
     that line to a horizon at 50% crosses x = 103%. Put the vanishing point
     there and the floor recedes along the vessel's axis. Replace the asset and
     this has to be measured again. */
  ground: {
    render: "trust-ground",
    opacity: 1,
  },



  /* Two parties for this scene. The owner is off it deliberately: the
     captain is the owner's representative aboard, so the owner's side of the
     argument is already in the room, and a third panel was one more box
     between the reader and the point.

     The layout does not care — sides are columns that centre whatever they
     are given. */
  parties: [
    {
      id: "captain",
      label: "Captain",
      role: "Captain · Owner's representative",
      /* The captain has a job in this story rather than a box on the diagram:
         they are the person aboard, and therefore the person who captures.
         Crewed charter is assumed — on a bareboat the liability story differs
         and this copy would need revisiting. */
      holds: "Conducts delivery and redelivery — and holds the phone.",
      side: "left",
      /* The wheelhouse — the captain is the person conning the vessel. */
      anchor: { x: 54, y: 50.5 },
      claim: "She was perfect at delivery.",
      enters: { one: "a1-captain", two: "a2-captain" },
    },
    {
      id: "charterer",
      label: "Charterer",
      role: "Charterer · Guest",
      holds: "Takes her for two weeks, and carries the cost if the account is wrong.",
      side: "right",
      /* The aft deck, where a charter party actually boards. */
      anchor: { x: 68, y: 59.5 },
      claim: "That was already there.",
      enters: { one: "a1-charterer", two: "a2-charterer" },
    },
  ],

  incident: {
    anchor: { x: 48, y: 60.5 },
    label: "Saloon · leather seating, torn",
  },

  narration: {
    "a1-asset": { line: "A vessel, between charters." },
    "a1-captain": { line: "Everyone with an interest in her arrives." },
    "a1-delivery": {
      line: "She is handed over.",
      sub: "Nothing is written down beyond a signature.",
    },
    "a1-charter": { line: "Two weeks pass." },
    "a1-incident": { line: "Something happens aboard." },
    "a1-redelivery": {
      line: "She comes back, and the damage is found.",
      sub: "Nobody disputes that it is there.",
    },
    "a1-photo": {
      line: "The damage is photographed.",
      sub: "Nothing stands behind the date on it.",
    },
    "a1-dispute": { line: "Two accounts of the same fact." },

    "a2-asset": { line: "The same charter, the same vessel." },
    "a2-capture": {
      line: "This time her condition is recorded first.",
      sub: "Before the charterer is anywhere near her.",
    },
    "a2-charterer": { line: "Everything after this runs exactly as before." },
    "a2-share": {
      line: "Everyone gets the same copy.",
      sub: "Owner, captain and charterer — before she leaves.",
    },
    "a2-incident": { line: "The same damage, on the same day." },
    "a2-recapture": { line: "Redelivery is recorded too." },
    "a2-reshare": {
      line: "And shared again, the same way.",
      sub: "Nobody is holding a record the others have not seen.",
    },
    "a2-compare": {
      line: "Two dated records, neither party controls.",
      sub: "Undamaged at delivery. Torn at redelivery.",
    },
  },

  unresolved: {
    headline: "Nobody can prove either version.",
    cost: "Vessel off-hire · weeks of correspondence · written off or fought",
    outcomes: [
      "No record of her condition at delivery",
      "A surveyor, a lawyer, or both",
      "Vessel off-hire while it is argued",
    ],
  },

  resolved: {
    headline: "The argument ends because the facts are not in dispute.",
    outcomes: [
      "Undamaged at delivery, damaged at redelivery — both dated",
      "Settled without a survey or a site visit",
      "Vessel back on hire in days, not weeks",
    ],
  },

  record: {
    /* Top centre, between the two parties who will disagree — the evidence
       sits literally in the middle of the argument. */
    panel: { x: 50, y: 2 },
    align: "top-center",

    unverified: {
      title: "Owner's photograph",
      capture: {
        label: "Saloon · torn",
        /* Not "no timestamp". A phone photograph usually has one — it is just
           trivially editable and comes from a party with an interest in the
           answer, so the other side is under no obligation to accept it. The
           problem is not the absence of a date; it is that nothing can stand
           behind the one that is there. */
        stamp: "Date and time unverified",
        event: "Redelivery",
        image: "saloon-redelivery",
        imageAlt: "A tear across the cream leather seating in the yacht's saloon",
      },
    },

    verified: {
      title: "Verified condition at delivery and redelivery",
      delivery: {
        label: "Saloon · undamaged",
        stamp: "6 Aug 2026, 09:14 UTC",
        event: "Delivery",
        image: "saloon-delivery",
        imageAlt: "The yacht's saloon at delivery, the leather seating undamaged",
      },
      redelivery: {
        /* The same photograph the owner sent in Act One, deliberately. The
           frame does not improve — only what can be said about it does. */
        label: "Saloon · torn",
        stamp: "20 Aug 2026, 16:40 UTC",
        event: "Redelivery",
        image: "saloon-redelivery",
        imageAlt: "The same saloon at redelivery, the leather seating torn",
      },
    },
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
  /* The title card. Brand-level, so it does not change with the sector — the
     whole argument of the piece is that the platform does not either. */
  intro: "Enhancing Trust",
  /* Section copy. Generic on purpose now that this is the whole of the
     homepage below the hero: the yacht is the worked example, not the subject,
     and the title card inside the piece already says which sector it is. A
     headline naming charters told a reader arriving cold that this page was
     about boats.

     The invariant survives the rewrite and has to: nothing about the incident
     differs between the acts, only when the evidence was captured. That
     sentence is the argument — see the warning at the head of this file. */
  eyebrow: "A worked example",
  headline: "Enhancing Trust — Creating Value",
  /* ⚠️  "SITS BETWEEN THEM", NOT "STEPS IN".
     Stepping in is remedial — it says the record arrives once there is
     already an argument, which is the opposite of what the piece then shows:
     Act Two captures the condition before the other party is anywhere near
     the asset. The order is the entire point, so the copy above it must not
     contradict it.

     "Two honest accounts" rather than two claims, for the same reason the
     piece colours both red: neither side is lying, and a buyer who recognises
     themselves in this should not be told they are the dishonest one. */
  standfirst:
    "Two or more counterparties, one asset, and two honest accounts of the same thing. Delphi Verify sits between them as an impartial third party — a record neither side owns, and either can check. Disagreements are resolved, or avoided altogether. Value is protected rather than argued away.",
  replay: "Replay",
  staticNote:
    "Shown as a comparison rather than an animation, because your system asks for reduced motion.",
} as const;

export const trustScenes = {
  "yachts-marine": yachtsScene,
} as const;
