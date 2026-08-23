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
  /** The reference a holder quotes to open this certificate — the same shape
   *  as a real one, four and four. Each certificate has its OWN: two records
   *  of one charter are two documents, and giving them one code between them
   *  would say they were one. */
  code?: string;
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

/** One frame of the condition survey Act Two opens with.
 *
 *  Deliberately NOT a TrustCapture. A capture is a record that gets issued to
 *  the parties and argued over; these are the raw walk-through — eight rooms
 *  on one morning, of which exactly one ever ends up in the argument. Giving
 *  them the same type would invite someone to render them the same way, and
 *  the whole point of the beat is that the record is made of ordinary
 *  photographs taken before anybody had a reason to take them. */
export type TrustSurveyShot = {
  /** What was photographed, in the crew's words. */
  label: string;
  /** Date and time, in full — this renders on a card about 220px wide, which
   *  fits it. The filed thumbnails carry no caption at all. */
  stamp: string;
  /** Basename under public/assets/features. */
  image: string;
  imageAlt: string;
  /** Where on the vessel this was taken, % of stage. See the anchor warning
   *  above — these are measured against the cut-out's box, not chosen. */
  anchor: StagePoint;
};

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

/** What EVERY scenario has, written or not.
 *
 *  The piece runs one sector at a time and the reader chooses which. A sector
 *  whose two acts have not been written yet still needs to exist: it has to be
 *  nameable in the selector and the stage has to be able to open on it, or the
 *  choice is between one thing and two disabled buttons.
 *
 *  So this is the head of TrustScene rather than a separate idea. A scenario
 *  in preparation carries exactly these fields; the day its acts are authored
 *  it becomes a TrustScene by gaining them, and nothing that reads it changes.
 *
 *  Note what is NOT here: the asset. The title card runs before the vessel,
 *  the building or the flat arrives, so a scenario that only plays its intro
 *  needs no photograph — and requiring one would mean inventing a cut-out for
 *  a scene nobody can watch yet. */
/** The acts a scenario plays, in order.
 *
 *  AN ACT IS A RANGE OVER ONE SHARED TIMELINE, not a timeline of its own. The
 *  beats are identical in every sector on purpose — that sameness is the
 *  claim the piece makes, that the platform does not change shape per
 *  industry — so what varies between scenarios is how many acts are written,
 *  not what the acts contain.
 *
 *  `intro` is one of these rather than a special case. A scenario in
 *  preparation plays exactly one act, and it is not a different kind of thing
 *  from one that plays four; it is the same thing, shorter.
 *
 *  A fifth act is an id here and an entry in ACTS in the component. */
export type TrustActId = "intro" | "act-one" | "turn" | "act-two";

export type TrustSceneIntro = {
  id: string;
  sector: string;
  /** Named on the opening title card, under the brand line. */
  study: string;
  ground: StageGround;
  /** How far this scenario runs.
   *
   *  ⚠️  A SCENARIO MUST NOT CLAIM AN ACT IT HAS NO DATA FOR. `intro` needs
   *  nothing beyond this type; every act after it needs the whole of
   *  TrustScene, and isPlayableScene is the type system's half of the same
   *  rule. Claiming "act-one" without a cast would put an empty stage on the
   *  page and call it a story. */
  acts: readonly TrustActId[];
};

export type TrustScene = TrustSceneIntro & {
  /** Basename under public/assets/features — the clean asset, no people. */
  asset: string;
  assetAlt: string;

  /** How the asset stands on the stage, in stage percentages.
   *
   *  ⚠️  DERIVED FROM THE CUT-OUT, NOT CHOSEN. Every anchor in this file is a
   *  point on the stage, so it is only a point on the ASSET while the asset
   *  occupies the box these two values give it. The width sets the box; the
   *  top is the vertical centre it hangs from.
   *
   *  It has to be scene data because assets are not one shape. The yacht is
   *  1.64:1 and 44% wide; a building is nearly square, and 44% of the stage
   *  would run it off the bottom. Pick the width that puts the asset's
   *  vertical extent where the yacht's is — roughly 37% to 85% — and every
   *  anchor stays comparable between sectors. */
  assetBox: { width: number; top: number };

  /** The cast, in reading order down each column.
   *
   *  An array, not a fixed set of roles: the number of counterparties is a
   *  property of the sector, not of the platform. A property sale has a buyer
   *  and a seller and no operator at all; a construction milestone has a
   *  contractor, an architect and a lender. Adding or removing one here is
   *  the whole change — the columns re-centre, the leaders re-measure, and
   *  the certificates are issued to whoever is in the list. */
  parties: TrustParty[];

  /** The condition survey. Act Two's whole difference from Act One is that
   *  this happened, so it is shown happening rather than asserted.
   *
   *  ⚠️  THE LAST SHOT IS THE ONE THE RECORD KEEPS. It must be the same image
   *  and the same moment as record.verified.delivery — the story is that the
   *  frame everybody later argues about was already sitting in an ordinary
   *  survey, taken before there was anything to argue about. Two different
   *  saloon photographs would quietly break that.
   *
   *  ⚠️  THE COUNT IS FIXED AT SURVEY_SHOTS IN THE COMPONENT. The narrative is
   *  the same for every sector, so the beats are; a scene that supplies a
   *  different number fails an assertion rather than silently losing its tail.
   *
   *  In capture order, which is also filing order: a walk from the top deck
   *  aft to the stern, then forward along the accommodation, ending where the
   *  damage will be. */
  survey: readonly TrustSurveyShot[];

  /** The single event. Rendered identically in both acts — a marker on the
   *  vessel, nothing more. What is SHOWN of it lives in `record` below,
   *  because the whole point is that the same damage is evidenced two
   *  different ways. */
  incident: {
    anchor: StagePoint;
    label: string;

    /** Where the damage sits WITHIN THE PHOTOGRAPH, 0-1 of the frame.
     *
     *  Distinct from `anchor` above, which is where the damage is on the
     *  asset as it stands on the stage. This one is where it is in the two
     *  frames the comparison opens, and it places the ring that is drawn
     *  round it.
     *
     *  ⚠️  MEASURE IT, DO NOT JUDGE IT. Both sets were measured off their
     *  master by isolating the mark — the pixels dark in the damaged frame
     *  and not dark in its twin — and taking the centroid of the largest
     *  connected mass, so the fireplace and the shadows do not drag it. Keep
     *  it far enough off the bottom edge that the ring, whose radius is about
     *  15% of the frame's height, still closes inside the picture.
     *
     *  The same fraction serves both frames: the pair is one photograph taken
     *  twice, so the mark is within a few pixels of the same place in each,
     *  and the ring is an order of magnitude larger than that difference. */
    spot: { x: number; y: number };

    /** object-position for Act One's phone, which crops this same photograph
     *  hard: a 16:9 frame in a portrait screen keeps only about a third of
     *  the width. THE DAMAGE HAS TO SURVIVE THAT CROP — the whole act is a
     *  photograph of it, and a frame that loses it is a picture of a room.
     *  Roughly `spot.x`, pulled back towards the middle when that would put
     *  the mark against the frame edge. */
    framing: string;
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
    unverified: {
      title: string;
      capture: TrustCapture;
      /** What the ordinary phone says around the photograph: the clock in its
       *  status bar, and the camera-roll date above the picture.
       *
       *  This is the only assertion in Act One, and it is the act's whole
       *  argument — a date that a phone is stating and nothing is standing
       *  behind. It has to be scene data because it is a date IN the story:
       *  it must be the day the damage was found in this sector's timeline,
       *  which is not the same day in a charter as in a tenancy. */
      phone: { clock: string; date: string };
    };
    verified: {
      title: string;
      /** The same panel, before anything is in it. See the note on the value. */
      pending: string;
      delivery: TrustCapture;
      redelivery: TrustCapture;
    };
  };
};

export const yachtsScene: TrustScene = {
  id: "yachts-marine",
  sector: "Yachts & Marine",
  /* The written one, end to end. */
  acts: ["intro", "act-one", "turn", "act-two"],
  /* The title card's second line. Sector-specific, and it says "example"
     because that is what it is: an illustration of the mechanism, not a case
     study of a real charter. */
  study: "Yacht Charter · Example Study",
  /* A cut-out, not a photograph. The stage is a diagram, and a rectangular
     photograph in the middle of it reads as a picture pasted onto the scene
     rather than as the object everyone is standing around. */
  asset: "yacht-cutout",
  assetAlt: "A motor yacht lying in calm water, with nobody aboard",

  /* 44% and 61% put the bow, the stern and the waterline exactly where every
     anchor below was measured against, and let the mast run higher than the
     box — which is the part nothing else on the stage is measured against.
     The cut-out is 1.64:1, so this lands it on y 37.1-84.9. */
  assetBox: { width: 44, top: 61 },

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

  /* Anchors derived from the cut-out's box (x 28-72, y 37.1-84.9) by reading
     the render, not by taste — see scripts note in the anchor warning above.
     Times run across twelve minutes of one morning and end at 09:14, which is
     the stamp the delivery certificate carries: the last frame of the survey
     IS the record's delivery frame. */
  survey: [
    {
      label: "Flybridge",
      stamp: "6 Aug 2026, 09:02 UTC",
      image: "yacht-flybridge",
      imageAlt: "The yacht's flybridge, helm and sunpads, empty",
      anchor: { x: 56, y: 49.5 },
    },
    {
      label: "Bar",
      stamp: "6 Aug 2026, 09:04 UTC",
      image: "yacht-bar",
      imageAlt: "The upper-deck bar, bottles and glassware in place",
      anchor: { x: 61, y: 55.5 },
    },
    {
      label: "Aft deck",
      stamp: "6 Aug 2026, 09:06 UTC",
      image: "yacht-aft-deck",
      imageAlt: "The aft deck seating and table, looking out over the water",
      anchor: { x: 68.5, y: 60.5 },
    },
    {
      label: "Tender garage",
      stamp: "6 Aug 2026, 09:07 UTC",
      image: "yacht-tender-garage",
      imageAlt: "The tender garage open at the stern, tender and jet ski stowed",
      anchor: { x: 70.5, y: 65.5 },
    },
    {
      label: "Dining",
      stamp: "6 Aug 2026, 09:09 UTC",
      image: "yacht-dining",
      imageAlt: "The dining table laid, under a glass chandelier",
      anchor: { x: 43.5, y: 60.5 },
    },
    {
      label: "Master cabin",
      stamp: "6 Aug 2026, 09:11 UTC",
      image: "yacht-master-cabin",
      imageAlt: "The master cabin made up, sea visible through both windows",
      anchor: { x: 38.5, y: 62.5 },
    },
    {
      label: "Master ensuite",
      stamp: "6 Aug 2026, 09:12 UTC",
      image: "yacht-master-ensuite",
      imageAlt: "The master ensuite in book-matched marble, towels folded",
      anchor: { x: 34.5, y: 63.5 },
    },
    {
      /* Last, and the one the record keeps. Same image and same minute as
         record.verified.delivery — see the warning on the type. */
      label: "Saloon",
      stamp: "6 Aug 2026, 09:14 UTC",
      image: "yacht-saloon-delivery",
      imageAlt: "The yacht's saloon at delivery, the leather seating undamaged",
      anchor: { x: 48, y: 60.5 },
    },
  ],

  incident: {
    anchor: { x: 48, y: 60.5 },
    label: "Saloon · leather seating, torn",
    /* The gash is the one dark cluster on a cream settee; it centres at
       270,404 of 882x496. */
    spot: { x: 0.306, y: 0.814 },
    /* 25% rather than 0: hard left crops the room off the other side and
       leaves the tear against the frame edge. */
    framing: "25%",
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
    /* On the FIRST SHOT, not on a2-capture. The line introduces the survey,
       and the survey is what a2-shot-1 starts; by a2-capture the record is
       already being sealed and the sentence would be describing something
       three beats old. */
    "a2-shot-1": {
      line: "This time her condition is recorded first.",
      sub: "Before the charterer is anywhere near her.",
    },
    "a2-file": {
      line: "The whole vessel, in one record.",
      sub: "Made once, and held where neither side can revise it.",
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
      /* Redelivery day, a few hours after she came back. */
      phone: { clock: "16:41", date: "20 August 2026" },
      capture: {
        label: "Saloon · torn",
        /* Not "no timestamp". A phone photograph usually has one — it is just
           trivially editable and comes from a party with an interest in the
           answer, so the other side is under no obligation to accept it. The
           problem is not the absence of a date; it is that nothing can stand
           behind the one that is there. */
        stamp: "Date and time unverified",
        event: "Redelivery",
        image: "yacht-saloon-redelivery",
        imageAlt: "A tear across the cream leather seating in the yacht's saloon",
      },
    },

    verified: {
      title: "Verified condition at delivery and redelivery",
      /* What the panel says while it is OPEN AND EMPTY — from the moment the
         captain picks up the phone until the survey has been filed into it.
         It cannot use the title above: an empty certificate has verified
         nothing, and a panel claiming otherwise before a single photograph
         exists would undo the one thing this act is careful about.

         "Delivery", singular, for the same reason. At this point in the story
         redelivery is two weeks away and nobody knows there will be anything
         to record. */
      pending: "Condition record · delivery",
      delivery: {
        label: "Saloon · undamaged",
        stamp: "6 Aug 2026, 09:14 UTC",
        code: "7KQ2-M4XD",
        event: "Delivery",
        image: "yacht-saloon-delivery",
        imageAlt: "The yacht's saloon at delivery, the leather seating undamaged",
      },
      redelivery: {
        /* The same photograph the owner sent in Act One, deliberately. The
           frame does not improve — only what can be said about it does. */
        label: "Saloon · torn",
        stamp: "20 Aug 2026, 16:40 UTC",
        code: "9RT8-B2VC",
        event: "Redelivery",
        image: "yacht-saloon-redelivery",
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

/* ============================================================================
   THE SCENARIOS
   ============================================================================
   One argument, three sectors. The piece is the same in each — the same
   beats, the same turn, the same ending — because that sameness IS the claim:
   the platform does not change shape per industry, only the asset in the
   middle and the people standing round it do.

   ONE OF THESE IS AN INTRO ONLY, and is deliberately typed as such rather
   than stubbed with placeholder acts. A half-written scene that runs is worse
   than one that says it is not ready: it would put invented parties, invented
   surveys and invented certificates on a page whose entire subject is not
   inventing things. It opens on its title card and stops.

   To finish one, give it the rest of TrustScene — asset, parties, survey,
   incident, narration, unresolved, resolved, record — and it starts playing.
   Nothing in the component needs to know it happened; see isPlayableScene.
   ========================================================================= */

/** Development and construction. Evidence at the moments work is covered up
 *  and can no longer be inspected — a pour, a closed wall, a buried service. */
export const constructionScene: TrustSceneIntro = {
  id: "development-construction",
  sector: "Development & Construction",
  study: "Construction Milestone · Example Study",
  acts: ["intro"],
  /* The yacht's floor. It is a perspective grid rather than anything nautical,
     and re-rendering one per sector before the sector has a scene would be
     work in service of nothing. A scene that gains an asset has to derive its
     own — see the note on the yacht's ground. */
  ground: { render: "trust-ground", opacity: 1 },
};

/** Property rentals. The two ends of a tenancy, which is the same shape as a
 *  charter: an asset handed over, used, and handed back — and argued about
 *  afterwards by two people who were not both in the room.
 *
 *  ⚠️  DELIBERATELY THE SAME PIECE AS THE YACHT. Same beats, same turn, same
 *  ending, the same number of survey frames. What changes is the asset, the
 *  cast and the words. That is the claim the selector is making — the
 *  platform does not change shape per industry — and a rentals scene that
 *  invented a new structure would quietly withdraw it.
 *
 *  The LANDLORD is off the stage for the same reason the owner is: the agent
 *  is the landlord's representative and conducts both inspections, so that
 *  side of the argument is already in the room and a third panel would be one
 *  more box between the reader and the point. */
export const rentalsScene: TrustScene = {
  id: "property-rentals",
  sector: "Property Rentals",
  study: "Tenancy Handover · Example Study",
  acts: ["intro", "act-one", "turn", "act-two"],

  /* A cut-out with a real alpha channel, three-quarter on, carrying a small
     apron of pavement and kerb so the building has something to stand on
     rather than floating. Supplied by Nick, 23 Aug 2026, and trimmed here to
     its own alpha bounding box — 1412x1070 of a 1448x1086 canvas — which is
     what makes the box below a description of the BUILDING rather than of
     whatever transparent margin the render happened to leave.

     It is the same house as rental-front-elevation, which matters: the survey
     opens on that photograph and the stage is showing this, and a viewer who
     cannot see they are one building is being shown two properties. */
  asset: "rental-asset",
  assetAlt:
    "A white stucco London townhouse seen from the corner, railings and pavement, with nobody outside",

  /* 35.5%, not the yacht's 44%. This cut-out is 1.320:1 where the yacht is
     1.640:1, so an equal width would sit the building lower and taller. 35.5%
     instead gives it the SAME VERTICAL EXTENT as the yacht — y 37.1 to 84.9,
     to the tenth — which is what every anchor, leader and dot on this stage
     is really measured against. Horizontally it occupies x 32.3 to 67.8. */
  assetBox: { width: 35.5, top: 61 },

  /* The yacht's floor, unchanged and knowingly so. The grid's vanishing point
     was derived from the yacht's waterline; a building standing square to the
     viewer has no equivalent line to derive one from, and re-rendering it
     against a placeholder asset would be work thrown away the moment the real
     cut-out lands. Re-derive it then, with the ground it will actually stand
     on. */
  ground: { render: "trust-ground", opacity: 1 },

  parties: [
    {
      id: "captain",
      label: "Letting agent",
      role: "Letting agent · Landlord's representative",
      /* The counterpart of the captain, and for the same structural reason:
         the person who is physically there, and therefore the person who
         captures. */
      holds: "Runs check-in and check-out — and holds the phone.",
      side: "left",
      /* The front door under the portico: where an inventory starts and where
         the keys change hands. */
      anchor: { x: 48.7, y: 70.2 },
      claim: "It was spotless at check-in.",
      enters: { one: "a1-captain", two: "a2-captain" },
    },
    {
      id: "charterer",
      label: "Tenant",
      role: "Tenant · Assured shorthold",
      holds: "Lives there for a year, and carries the cost if the account is wrong.",
      side: "right",
      /* An upper window on the right — the part of the house they actually
         live behind, and far enough from the reception room below that the
         two dots never read as one. */
      anchor: { x: 55.5, y: 50.1 },
      claim: "That was already there.",
      enters: { one: "a1-charterer", two: "a2-charterer" },
    },
  ],

  /* An inventory clerk's walk through an empty house on the morning of
     check-in: in the front door, through the ground floor, up, and back down
     to the room that will matter. Seventeen minutes, ending at 10:22, which
     is the stamp the check-in certificate carries — the last frame of the
     survey IS the record's check-in frame.

     Anchors are points on the FACADE, since that is what the stage shows: a
     room is anchored to the window you would see it through. Derived from the
     asset's box (x 37-63, y 36.8-85.3), not chosen. */
  survey: [
    {
      label: "Front elevation",
      stamp: "6 Aug 2026, 10:05 UTC",
      image: "rental-front-elevation",
      imageAlt: "The front of the house from across the street, railings and a portico",
      anchor: { x: 48.6, y: 58.6 },
    },
    {
      label: "Entrance hall",
      stamp: "6 Aug 2026, 10:07 UTC",
      image: "rental-entrance-hall",
      imageAlt: "A chequerboard stone floor and a staircase rising away under a lantern",
      anchor: { x: 48.9, y: 69.6 },
    },
    {
      label: "Kitchen",
      stamp: "6 Aug 2026, 10:09 UTC",
      image: "rental-kitchen",
      imageAlt: "A pale shaker kitchen with an island and glazed doors to the garden",
      anchor: { x: 42.5, y: 69.1 },
    },
    {
      label: "Principal bedroom",
      stamp: "6 Aug 2026, 10:12 UTC",
      image: "rental-bedroom",
      imageAlt: "A bedroom made up in white linen, sash windows either side",
      anchor: { x: 42.9, y: 58.6 },
    },
    {
      label: "Bathroom",
      stamp: "6 Aug 2026, 10:14 UTC",
      image: "rental-bathroom",
      imageAlt: "A marble bathroom with a freestanding bath and brass tapware",
      anchor: { x: 43.6, y: 50.0 },
    },
    {
      label: "Study",
      stamp: "6 Aug 2026, 10:16 UTC",
      image: "rental-study",
      imageAlt: "A small study lined with painted shelving, a desk under the window",
      anchor: { x: 54.3, y: 49.5 },
    },
    {
      label: "Garden",
      stamp: "6 Aug 2026, 10:19 UTC",
      image: "rental-garden",
      imageAlt: "A narrow walled London garden, paved and planted, seen from the house",
      anchor: { x: 60.7, y: 71.5 },
    },
    {
      /* Last, and the one the record keeps. Same image and same minute as
         record.verified.delivery — see the warning on the type. */
      label: "Reception room",
      stamp: "6 Aug 2026, 10:22 UTC",
      image: "rental-reception-checkin",
      imageAlt: "The reception room at check-in, the oak floor unmarked",
      anchor: { x: 54.5, y: 68.7 },
    },
  ],

  incident: {
    anchor: { x: 54.5, y: 68.7 },
    label: "Reception room · oak floor, burned",
    /* Measured off the master, not judged: the burn is the one dark mass on a
       pale floor, and isolating it against its undamaged twin puts its
       largest connected component's centroid at 0.550, 0.857 of 814x458.
       Lifted to 0.82 so the ring — about 15% of the frame's height in radius
       — closes inside the picture instead of running off the bottom edge. */
    spot: { x: 0.55, y: 0.82 },
    /* Near enough the middle that the portrait crop keeps the burn without
       help, and 57% centres the visible third on it exactly. */
    framing: "57%",
  },

  narration: {
    "a1-asset": { line: "A house, between tenancies." },
    "a1-captain": { line: "Everyone with an interest in it arrives." },
    "a1-delivery": {
      line: "The keys are handed over.",
      sub: "The inventory is a page of ticks and a signature.",
    },
    "a1-charter": { line: "Twelve months pass." },
    "a1-incident": { line: "Something happens inside." },
    "a1-redelivery": {
      line: "The tenancy ends, and the damage is found.",
      sub: "Nobody disputes that it is there.",
    },
    "a1-photo": {
      line: "The damage is photographed.",
      sub: "Nothing stands behind the date on it.",
    },
    "a1-dispute": { line: "Two accounts of the same fact." },

    "a2-asset": { line: "The same tenancy, the same house." },
    "a2-shot-1": {
      line: "This time its condition is recorded first.",
      sub: "Before the tenant has the keys.",
    },
    "a2-file": {
      line: "Every room, in one record.",
      sub: "Made once, and held where neither side can revise it.",
    },
    "a2-charterer": { line: "Everything after this runs exactly as before." },
    "a2-share": {
      line: "Everyone gets the same copy.",
      sub: "Landlord, agent and tenant — before the tenant moves in.",
    },
    "a2-incident": { line: "The same damage, on the same day." },
    "a2-recapture": { line: "Check-out is recorded too." },
    "a2-reshare": {
      line: "And shared again, the same way.",
      sub: "Nobody is holding a record the others have not seen.",
    },
    "a2-compare": {
      line: "Two dated records, neither party controls.",
      sub: "Unmarked at check-in. Burned at check-out.",
    },
  },

  unresolved: {
    headline: "Nobody can prove either version.",
    cost: "Deposit held · weeks of correspondence · written off or adjudicated",
    outcomes: [
      "No record of its condition at check-in",
      "A scheme adjudication, months after the keys came back",
      "The house off the market while it is argued",
    ],
  },

  resolved: {
    headline: "The argument ends because the facts are not in dispute.",
    outcomes: [
      "Unmarked at check-in, burned at check-out — both dated",
      "Settled without an adjudication or a second inspection",
      "Re-let in days, not weeks",
    ],
  },

  record: {
    panel: { x: 50, y: 2 },
    align: "top-center",

    unverified: {
      title: "Landlord's photograph",
      /* Check-out day, a few hours after the keys came back. */
      phone: { clock: "15:12", date: "6 August 2027" },
      capture: {
        label: "Reception room · floor burned",
        stamp: "Date and time unverified",
        event: "Check-out",
        image: "rental-reception-checkout",
        imageAlt: "A large blackened burn across the pale oak floor of the reception room",
      },
    },

    verified: {
      title: "Verified condition at check-in and check-out",
      pending: "Condition record · check-in",
      delivery: {
        label: "Reception room · unmarked",
        stamp: "6 Aug 2026, 10:22 UTC",
        code: "K3PN-T7WQ",
        event: "Check-in",
        image: "rental-reception-checkin",
        imageAlt: "The reception room at check-in, the oak floor unmarked",
      },
      redelivery: {
        /* The same photograph the landlord sent in Act One, deliberately. The
           frame does not improve — only what can be said about it does. */
        label: "Reception room · floor burned",
        stamp: "6 Aug 2027, 11:20 UTC",
        code: "V8LH-C2RB",
        event: "Check-out",
        image: "rental-reception-checkout",
        imageAlt: "The same reception room at check-out, the oak floor burned through",
      },
    },
  },
} as const;

/** Everything the selector offers, in the order it offers it. The written one
 *  leads: a reader who picks nothing should land on the argument rather than
 *  on a notice that it is coming. */
export const trustScenarios: readonly TrustSceneIntro[] = [
  yachtsScene,
  constructionScene,
  rentalsScene,
];

/** Whether a scenario can actually be watched.
 *
 *  `survey` is the discriminator because it is the first thing Act Two needs
 *  and among the last things authored — a scene with a survey has had its
 *  argument written. Checking a `status` flag instead would let the flag and
 *  the data disagree, and the data is what the component renders. */
export function isPlayableScene(s: TrustSceneIntro): s is TrustScene {
  return "survey" in s;
}

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
  /* The header on the survey card. Brand-level rather than per scene: what
     the card is doing is the same in every sector, and only the pictures
     inside it change. */
  /* "Capturing", not "Recording". Capture is the product's own verb — the
     platform pages say trusted capture, in-app capture, capture moments — and
     the stage should not invent a second word for the same act. The present
     participle also does work here: the card is showing something in
     progress, one frame of eight. */
  survey: "Capturing condition",
  /* THE CONTENT CHECK, between the last capture and the chain.
     Every frame goes to Gemini, which reads it for whether the scene is real
     rather than a photograph of a photograph or a screen, and for people and
     personal information. It is a check on WHAT IS IN THE PICTURE, which is a
     different claim from everything else this record makes — those are all
     about how the capture happened. Hence its own beat and its own word.

     "Checking", present tense, because the ticks land while it is on screen.
     The card says what is happening, and the ticks say how far it has got. */
  checking: "Checking image content with AI…",
  replay: "Replay",
  staticNote:
    "Shown as a comparison rather than an animation, because your system asks for reduced motion.",
} as const;

