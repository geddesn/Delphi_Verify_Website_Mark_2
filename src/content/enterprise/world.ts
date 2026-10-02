import type { Bi } from "@/content/enterprise/lang";

/* ============================================================================
   ENTERPRISE SCALE — THE SHARED WORLD
   ============================================================================
   One development, modelled once, read by every screen on /platform/enterprise.

   ⚠️  SHARED BECAUSE FOUR SCREENS SHOW THE SAME TOWER. The portfolio, the
   tower explorer, the unit ledger and the contractor view all count the same
   units. Four screens each retyping "168 units" is the exact failure
   content/dashboard.ts warns about: "a viewer who notices they differ has
   learned only that neither is real." Every figure on the page is either
   defined here once or COMPUTED from what is defined here.

   ⚠️  THE DEVELOPER IS INVENTED, and it has to be. This page exists because
   of a conversation with a real Colombian developer, and putting their name
   on a picture of software they have not bought implies a customer
   relationship that does not exist — see the same note in dashboard.ts, where
   a real London agency's name was removed for the same reason. The cities are
   real because cities are not brands; the company is not.

   If "Constructora Aldamar" turns out to belong to somebody, change it. It
   was chosen to belong to nobody.

   ⚠️  THE VOCABULARY IS THE PRODUCT'S OWN. Workspace, Asset, Ledger,
   Certificate, Workflow, credits — these are the real entities, with the real
   constraints: a ledger belongs to exactly one asset and cannot be moved, a
   certificate carries 1–40 media items and costs one credit to publish. The
   page is more persuasive, not less, for mapping onto the model that exists.

   ⚠️  THIS IS AHEAD OF THE PRODUCT, AND THE PAGE SAYS SO ONCE. Several things
   drawn here do not exist yet: there is no development → tower → floor → unit
   hierarchy (that structure is naming conventions over assets today), no
   customer web dashboard, no photographer assignment and no submission
   sign-off. The page carries the site's standing "renderings, not screenshots"
   notice rather than annotating each screen, so read nothing here as shipped.

   Keep this list current as the product catches up — it is the source for the
   gap analysis that goes to the development team.
   ========================================================================= */

/* ── The workspace ───────────────────────────────────────────────────────── */

export const WORKSPACE = {
  /* A workspace is the tenant: the boundary for membership, credits, assets
     and certificates. For a developer of this size it is the company. */
  name: "Constructora Aldamar S.A.",
  city: { en: "Cali, Valle del Cauca", es: "Cali, Valle del Cauca" } as Bi,
  /* Scale in the same shape the real company described itself: delivered
     homes, developments, and what is live right now. */
  delivered: 32_400,
  developmentsDelivered: 248,
  developmentsActive: 31,
  developmentsPipeline: 19,
  member: { name: "Ramiro Céspedes", initials: "RC" },
  memberRole: {
    en: "Head of Construction · Workspace owner",
    es: "Director de Construcción · Propietario del espacio",
  } as Bi,
} as const;

/* ── Stages, and the level each one attaches to ──────────────────────────── */

/* THE LEVEL IS THE WHOLE IDEA. A slab is one physical thing per floor, not
   eight; siteworks happen once per tower; only what happens inside an
   apartment is per apartment. Attaching every stage to every unit is what
   turns a 504-unit development into 3,024 certificates, and it is also simply
   untrue to the building. */
export type StageLevel = "tower" | "floor" | "unit";

export type Stage = {
  /* Stable key — used for ledger names, status lookups and the URL of the
     unit screen. Not shown to a viewer. */
  key: string;
  level: StageLevel;
  name: Bi;
  /* What a contractor photographs at this stage. This is the capture
     checklist, and it is why a certificate holds a dozen media rather than
     one. */
  captures: Bi;
  /* Who does it. Drives the contractor screen — 70% of this work is
     subcontracted, which is the customer's own figure. */
  trade: Bi;
  /* ⚠️  HOW MANY CERTIFICATES THIS STAGE PRODUCES, which is not always one.
     A capture session has a single photographer, so a stage worked by two
     trades is two sessions and two certificates: at rough-in the plumber
     photographs the water and waste and the electrician photographs the
     conduit, on different days. Folded into certificateCount() below, because
     the apartment sheet SHOWS both crews and a total that counted one would
     contradict it. */
  sessions: number;
};

export const STAGES: Stage[] = [
  {
    key: "plot",
    level: "tower",
    name: { en: "Plot & siteworks", es: "Lote y obras preliminares" },
    captures: {
      en: "Boundaries, levels, existing conditions, services located",
      es: "Linderos, niveles, condiciones existentes, redes localizadas",
    },
    trade: { en: "Own workforce", es: "Personal propio" },
    sessions: 1,
  },
  {
    key: "foundations",
    level: "tower",
    name: { en: "Foundations", es: "Cimentación" },
    captures: {
      en: "Excavation, reinforcement, pour, as-built levels",
      es: "Excavación, refuerzo, vaciado, niveles construidos",
    },
    trade: { en: "Own workforce", es: "Personal propio" },
    sessions: 1,
  },
  {
    key: "structure",
    level: "floor",
    name: { en: "Structure & slab", es: "Estructura y placa" },
    captures: {
      en: "Formwork, reinforcement before pour, slab after pour, column faces",
      es: "Formaleta, refuerzo antes del vaciado, placa después, caras de columna",
    },
    trade: { en: "Own workforce", es: "Personal propio" },
    sessions: 1,
  },
  {
    key: "rough-in",
    level: "unit",
    name: { en: "Rough-in (MEP)", es: "Instalaciones (hidrosanitarias y eléctricas)" },
    /* The stage that matters most evidentially, because it is the one the
       next stage destroys. Once the walls are closed, the only record of what
       is behind them is the one made here. */
    captures: {
      en: "Electrical runs, water and waste, gas, before walls close",
      es: "Ductería eléctrica, agua y desagües, gas, antes de cerrar muros",
    },
    trade: { en: "Electrical & plumbing subcontractors", es: "Subcontratistas eléctricos e hidráulicos" },
    /* Two: the plumber and the electrician, separately. */
    sessions: 2,
  },
  {
    key: "finishes",
    level: "unit",
    name: { en: "Finishes", es: "Acabados" },
    captures: {
      en: "Plaster, tiling, carpentry, paint, fittings",
      es: "Pañete, enchape, carpintería, pintura, aparatos",
    },
    trade: { en: "Finishing subcontractors", es: "Subcontratistas de acabados" },
    sessions: 1,
  },
  {
    key: "handover",
    level: "unit",
    name: { en: "Handover condition", es: "Estado de entrega" },
    captures: {
      en: "Every room, meters, keys, snag list at the moment of handover",
      es: "Cada ambiente, medidores, llaves, lista de pendientes al entregar",
    },
    trade: { en: "Own workforce", es: "Personal propio" },
    sessions: 1,
  },
];

export const stageByKey = new Map(STAGES.map((s) => [s.key, s]));

/* ── The development ─────────────────────────────────────────────────────── */

/* Geometry, and it is PARAMETRIC — the tower explorer generates its massing
   from these numbers rather than loading a model. That is a deliberate
   product boundary as well as a drawing convenience: generating a block from
   a unit schedule claims nothing about ingesting BIM or IFC, which would be a
   real engineering commitment to anyone we showed it to.

   Metres, because the explorer projects in building units and labels them. */
export const GEOMETRY = {
  /* ⚠️  NO FLOOR COUNT AND NO PLATE SIZE HERE. Both belong to the tower: the
     three are different heights AND different widths, so anything asking "how
     tall" or "how many to a floor" must ask a Tower. What is left is the stuff
     that really is the same in all three — a storey is a storey and an
     apartment is an apartment, whichever block it is in. */
  bayWidth: 7.2,
  apartmentDepth: 8.0,
  /* Lifts, stair and the corridor the apartments open off. */
  corridorDepth: 2.4,
  /* Balconies project beyond the structure, which is why they are not part of
     the depth below — they hang off it, and the 3D view has to draw them that
     way or the elevation reads as a flat slab. */
  balconyDepth: 1.5,
  floorHeight: 2.8,
} as const;

/** Structural depth of the block, balconies excluded. Derived rather than
 *  typed: two apartments back to back with the corridor between them. */
export const BUILDING_DEPTH =
  GEOMETRY.apartmentDepth * 2 + GEOMETRY.corridorDepth;

/** Apartments along each long elevation: half the plate, front and back
 *  either side of the central corridor. */
export const baysOf = (tower: Tower) => tower.perFloor / 2;

/** How wide a tower is, which now differs between them. */
export const widthOf = (tower: Tower) => baysOf(tower) * GEOMETRY.bayWidth;

/** The widest of the three, for anything that has to frame all of them in one
 *  camera — the same reasoning as MAX_FLOORS. */
export const maxWidth = () => Math.max(...TOWERS.map(widthOf));

/* ── The apartment ───────────────────────────────────────────────────────── */

/* THE APARTAMENTO TIPO. 7.2 × 8.0 m — about 58 m² — with five rooms and a
   balcony off the sala. That is the small end of real Colombian stock, where
   listings run from roughly 57 m² with three habitaciones and two baños up to
   106 m² with a study; the type below is the two-bedroom plan a developer
   repeats 504 times, which is the point.

   ⚠️  ROOM COORDINATES ARE LOCAL TO THE APARTMENT, in metres: x across the
   facade from the left, z back from the facade. The floor plan and the
   elevation both read this one definition, which is what stops the balcony
   appearing on the kitchen side in one view and the sala in the other.

   The rooms tile the rectangle exactly. If you edit one, edit its neighbour:
   a gap reads as a wall that is not there, and an overlap draws one room on
   top of another. */
export type Room = {
  key: string;
  name: Bi;
  x: number;
  z: number;
  w: number;
  d: number;
};

export const APARTMENT = {
  width: GEOMETRY.bayWidth,
  depth: GEOMETRY.apartmentDepth,
  /* Off the sala-comedor, as every one of these plans has it — the social
     zone gets the balcony and the bedrooms do not. */
  balcony: { x: 0, width: 4.2, depth: GEOMETRY.balconyDepth },
  area: GEOMETRY.bayWidth * GEOMETRY.apartmentDepth,
  rooms: [
    {
      key: "sala",
      name: { en: "Living / dining", es: "Sala-comedor" },
      x: 0,
      z: 0,
      w: 4.2,
      d: 4.2,
    },
    {
      key: "principal",
      name: { en: "Main bedroom", es: "Alcoba principal" },
      x: 4.2,
      z: 0,
      w: 3.0,
      d: 4.2,
    },
    {
      key: "cocina",
      name: { en: "Kitchen", es: "Cocina" },
      x: 0,
      z: 4.2,
      w: 2.4,
      d: 3.8,
    },
    {
      key: "bano",
      name: { en: "Bathroom", es: "Baño" },
      x: 2.4,
      z: 4.2,
      w: 1.8,
      d: 1.8,
    },
    {
      key: "alcoba2",
      name: { en: "Bedroom 2", es: "Alcoba 2" },
      x: 4.2,
      z: 4.2,
      w: 3.0,
      d: 3.8,
    },
    {
      /* Circulation, not a room — it is drawn so the plan tiles, and it is
         excluded from the room count the page quotes. */
      key: "hall",
      name: { en: "Hall", es: "Hall" },
      x: 2.4,
      z: 6.0,
      w: 1.8,
      d: 2.0,
    },
  ] satisfies Room[],
} as const;

/** The five rooms, excluding circulation. Derived so the figure in the copy
 *  cannot disagree with the plan being drawn. */
export const ROOMS = APARTMENT.rooms.filter((r) => r.key !== "hall");

/** Required captures in one apartment, across every room and every trade.
 *
 *  ⚠️  DERIVED FROM THE GRID, not from a per-room number. It was computed from
 *  a `captures` field on each room, which stopped being the source of truth
 *  the moment the checklist became rooms × trades — and a stale 14 beside a
 *  grid of 22 cells is the page contradicting itself in two places a reader
 *  can see at once. */
export const CAPTURES_PER_APARTMENT = () => REQUIREMENTS.length;

export type Tower = {
  key: string;
  name: string;
  /* ⚠️  EACH TOWER IS A DIFFERENT HEIGHT, and the explorer draws whatever is
     here. Three identical blocks read as a diagram of one tower repeated;
     three different ones read as a development.

     18, 21 and 24 — which is both a visible difference at a glance and,
     deliberately, 63 storeys of eight, so the development is exactly 504
     apartments. Change one and the headline figure moves with it, because
     everything downstream is summed rather than typed. */
  floors: number;
  /* ⚠️  AND HOW MANY APARTMENTS TO A FLOOR, which is also not shared. A
     developer does not build the same plate three times — the plot decides
     the footprint. Always even: the plate is two rows either side of a
     corridor, and an odd number would leave one row short with nothing
     sensible to draw in the gap. */
  perFloor: number;
  /* How far the build has got, in floors, per stage. Structure to floor 14
     means floors 1–14 have a sealed structure certificate. Monotonic by
     construction: you cannot finish an apartment on a floor whose slab is not
     poured, and the explorer would draw a lie if these were not ordered. */
  front: { structure: number; "rough-in": number; finishes: number; handover: number };
  siteworks: { plot: boolean; foundations: boolean };
  /* Where it stands. Three towers on one site, about 150 m apart, on the
     north edge of Jamundí where this kind of development actually goes.

     Real coordinates for a real town, because a town is not a brand — the
     same reasoning as the cities named at the top of this file. The developer
     is invented; the place is not. */
  at: { lat: number; lng: number };
  /* Days after the development broke ground that THIS tower started. Three
     towers on one site are not begun together — the crane moves. Without this
     every tower's certificates carried the same dates, which made the build
     fronts look like an arbitrary difference rather than a schedule. */
  startOffsetDays: number;
};

export const TOWERS: Tower[] = [
  {
    key: "t1",
    name: "Torre 1",
    floors: 18,
    perFloor: 6,
    /* Topped out and handing over — the tower that proves the far end of the
       process exists. */
    front: { structure: 18, "rough-in": 18, finishes: 15, handover: 9 },
    at: { lat: 3.2689, lng: -76.5392 },
    startOffsetDays: 0,
    siteworks: { plot: true, foundations: true },
  },
  {
    key: "t2",
    /* THE ONE THE EXPLORER OPENS ON. Part-built is the only interesting state:
       a finished tower is a uniform block and an empty one is a box. Torre 2
       has four distinct bands and you can see the build front in it. */
    name: "Torre 2",
    floors: 21,
    perFloor: 8,
    front: { structure: 14, "rough-in": 9, finishes: 5, handover: 2 },
    at: { lat: 3.2698, lng: -76.5378 },
    startOffsetDays: 150,
    siteworks: { plot: true, foundations: true },
  },
  {
    key: "t3",
    name: "Torre 3",
    floors: 24,
    perFloor: 10,
    /* Foundations only. Present so the portfolio is not three copies of the
       same picture, and so "nothing captured yet" is a visible state. */
    front: { structure: 0, "rough-in": 0, finishes: 0, handover: 0 },
    at: { lat: 3.2706, lng: -76.5365 },
    startOffsetDays: 330,
    siteworks: { plot: true, foundations: true },
  },
];

/** Apartments in one tower. Its own height times the plate. */
export const unitsIn = (tower: Tower) => tower.floors * tower.perFloor;

/** The tallest tower, for anything that has to size a frame to fit all three. */
export const MAX_FLOORS = Math.max(...TOWERS.map((t) => t.floors));

export const DEVELOPMENT = {
  name: "Ciudadela Altavista",
  city: { en: "Jamundí", es: "Jamundí" } as Bi,
  towers: TOWERS.length,
  units: TOWERS.reduce((n, t) => n + unitsIn(t), 0),
  /* The commercial shape the customer described: sold off-plan, deposit at the
     plot, monthly payments through the build, balance near completion. It is
     why a progress record has a buyer-facing value as well as an internal
     one — though the customer was clear he would rather show the finished
     apartment than every stage of it. */
  soldOffPlan: 0.86,
  started: "2025-02-17",
  /* The site, for a map that has to centre on something. Averaged from the
     towers rather than typed, so moving one moves the view with it. */
  at: {
    lat: TOWERS.reduce((n, t) => n + t.at.lat, 0) / TOWERS.length,
    lng: TOWERS.reduce((n, t) => n + t.at.lng, 0) / TOWERS.length,
  },
} as const;

/* ── Granularity: the answer to "how many Delphi Verifies?" ──────────────── */

/* The customer's own objection, and the most important thing on the page:
   a 500-apartment development documented naively is thousands of records, and
   he was right to flinch at it.

   It is a MODELLING choice, not a limit — a certificate carries up to 40 media
   items, so a floor's eight apartments can share one rough-in certificate if
   that is the trade-off you want. Coarser means fewer records and a claim you
   can only pin to a floor. Finer means you can pin it to the apartment.

   Every figure below is COMPUTED from STAGES, GEOMETRY and TOWERS. The naive
   count and the modelled count cannot drift apart because neither is typed. */

export type Granularity = "per-unit" | "by-level" | "batched-floor";

export const GRANULARITY: {
  key: Granularity;
  name: Bi;
  how: Bi;
  /* What you give up. Stated for every option including the recommended one —
     a comparison where only the rejected options have costs is a sales
     slide, not a decision aid. */
  tradeoff: Bi;
}[] = [
  {
    key: "per-unit",
    name: { en: "Every stage, every apartment", es: "Cada etapa, cada apartamento" },
    how: {
      en: "Every stage captured against each apartment, including the slab under it — and rough-in twice, once per trade.",
      es: "Cada etapa capturada por apartamento, incluida la placa que lo soporta — e instalaciones dos veces, una por oficio.",
    },
    tradeoff: {
      en: "The most records, and it documents the same slab eight times. Describes the paperwork rather than the building.",
      es: "La mayor cantidad de registros, y documenta la misma placa ocho veces. Describe el trámite, no el edificio.",
    },
  },
  {
    key: "by-level",
    name: { en: "Each stage at its own level", es: "Cada etapa en su propio nivel" },
    how: {
      en: "Siteworks once per tower, the slab once per floor, rough-in and finishes and handover per apartment.",
      es: "Obras preliminares por torre, la placa por piso, instalaciones, acabados y entrega por apartamento.",
    },
    tradeoff: {
      en: "A structural question is answered for the floor, not the apartment — which is the level the slab exists at anyway.",
      es: "Una duda estructural se responde para el piso, no para el apartamento — que es el nivel en que existe la placa.",
    },
  },
  {
    key: "batched-floor",
    name: { en: "A floor's apartments together", es: "Los apartamentos de un piso juntos" },
    how: {
      en: "One certificate per floor per stage, holding all eight apartments inside its 40-media allowance.",
      es: "Un certificado por piso y etapa, con los ocho apartamentos dentro del límite de 40 archivos.",
    },
    tradeoff: {
      en: "Fewest records and fewest credits, but a defect in apartment 1402 is evidenced as floor 14 — weaker in a dispute about one apartment.",
      es: "Menos registros y menos créditos, pero un defecto en el 1402 queda evidenciado como piso 14 — más débil en una disputa sobre un apartamento.",
    },
  },
];

/** Certificates a whole development needs under one modelling choice.
 *
 *  Computed, never typed. The three numbers on the panel are the output of
 *  this function, so a change to the stage list or the unit count moves all of
 *  them together and the page cannot contradict itself. */
export function certificateCount(g: Granularity) {
  /* Sessions, not stages — a stage worked by two trades publishes two
     certificates. See the note on Stage.sessions. */
  const atLevel = (level: StageLevel) =>
    STAGES.filter((s) => s.level === level).reduce((n, s) => n + s.sessions, 0);

  /* Summed PER TOWER rather than multiplied by a tower count, because the
     three towers are different heights. Multiplying a floor count by three
     was right when they were identical and became quietly wrong the moment
     they were not — the kind of arithmetic that keeps returning a plausible
     number while meaning nothing. */
  let total = 0;
  for (const tower of TOWERS) {
    const units = unitsIn(tower);

    if (g === "per-unit") {
      total += STAGES.reduce((n, s) => n + s.sessions, 0) * units;
      continue;
    }

    total += atLevel("tower");
    total += atLevel("floor") * tower.floors;
    total +=
      g === "by-level"
        ? atLevel("unit") * units
        : /* Batched: the unit stages collapse to the floor they are on. */
          atLevel("unit") * tower.floors;
  }
  return total;
}

/** Captures in a typical unit-level certificate.
 *
 *  ⚠️  DERIVED, because a typed figure beside a drawn checklist is a figure
 *  somebody will eventually catch. It is the grid's own average: 22 required
 *  captures across 4 jobs. The plumber's certificate holds two and the
 *  electrician's six — this is the middle of that, and the copy using it says
 *  "typical" rather than giving it false precision.
 *
 *  Defined after REQUIREMENTS, below. */

/** The product's hard ceiling, quoted where the batching option relies on it.
 *  Stated rather than implied — the whole batched model stands on this number
 *  and a reader should be able to check the arithmetic. */
export const MEDIA_LIMIT = 40;

/* ── Units, generated ────────────────────────────────────────────────────── */

/* ── What an apartment is doing ──────────────────────────────────────────── */

/* ⚠️  COLOUR MEANS "LOOK HERE", AND THE TWO COMMONEST STATES CARRY NONE.
   An earlier version shaded every apartment on a ramp of green by how many
   certificates it held, which made a working tower a wall of green and left
   nothing for the three apartments that actually needed somebody to do
   something. Finished work should go quiet.

   So pending is hollow and completed is a solid neutral: progress still reads
   as a mass rising out of an empty top, without spending the palette on it.
   Colour is reserved for the three states that are a call to action.

   ⚠️  BOTH FLAGGED STATES ARE ABOUT THE WORK, NOT THE PHOTOGRAPH. Amber says
   somebody should go and look at it; red says it has to be done again. Both
   are judgements a person makes from a record, and both show the defect that
   was photographed — see defectImage() at the foot of this file. */
export type UnitPhase =
  | "pending"
  | "active"
  | "complete"
  | "warning"
  | "problem";

export type UnitState = {
  /** 1402 — floor 14, unit 02. The numbering a Colombian site actually uses. */
  code: string;
  floor: number;
  /** 1-based position along the floor plate, 1…tower.perFloor. */
  position: number;
  /** How many of the six stages have a sealed certificate. 0…6. */
  sealed: number;
  /** The stage this apartment is working on now, or null if it is finished or
   *  has not started. */
  current: string | null;
};

/* Deterministic, and that is a correctness requirement rather than a
   preference. This page is prerendered: a Math.random() here would produce
   one set of apartments on the server and a different set in the browser, and
   React reports that as a hydration mismatch. A hash of the unit code gives
   the same scatter every time, on both sides. */
function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }

  /* ⚠️  THE FINALISER IS NOT OPTIONAL HERE, and leaving it out was a real bug
     rather than a tidying matter.

     Apartment codes on one floor differ only in their LAST character —
     t2-901, t2-902, t2-903. Plain FNV-1a ends on a multiply with no further
     mixing, so a change to the final byte moves the result by a small,
     structured amount and barely touches the high bits, which are the bits
     the division below turns into the number. Every apartment on a floor came
     out within 0.02 of its neighbours: floor 9 was 0.31 0.31 0.31 0.33 …,
     floor 5 was 0.88 eight times.

     The visible consequence was that a whole floor lagged or none of it did,
     and the attention markers bunched onto a few storeys — the opposite of
     the scatter this function exists to produce.

     This is MurmurHash3's fmix32: two xorshift-multiply rounds that fold the
     low bits back into the high ones. */
  h ^= h >>> 16;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909);
  h ^= h >>> 16;

  /* >>> 0 to an unsigned 32-bit before dividing, or negative hashes give
     negative "probabilities" and the scatter leans one way. */
  return (h >>> 0) / 4294967296;
}

const UNIT_STAGES = ["rough-in", "finishes", "handover"] as const;

/** Every apartment in a tower, with how far it has got.
 *
 *  Derived from the tower's build front rather than listed: 504 hand-written
 *  apartment records would be unreviewable, and the first one somebody edited
 *  would contradict the floor it sits on. The front says floors 1–9 have
 *  rough-in; this turns that into eight apartments per floor that mostly
 *  agree with it and occasionally do not, because real sites have a flat left
 *  waiting on one trade. */
export function unitsForTower(tower: Tower): UnitState[] {
  const out: UnitState[] = [];
  for (let floor = 1; floor <= tower.floors; floor++) {
    for (let position = 1; position <= tower.perFloor; position++) {
      const code = `${tower.key}-${floor}${String(position).padStart(2, "0")}`;
      const jitter = hash01(code);

      /* ⚠️  AN APARTMENT ABOVE THE POURED SLAB CARRIES NOTHING. It does not
         physically exist: there is no floor under it and no walls round it.

         An earlier version let every apartment in the tower inherit the
         siteworks certificates, which shaded the unbuilt top seven storeys of
         Torre 2 as a third complete — a tower that looked part-finished all
         the way up, with no visible build front. The siteworks belong to the
         TOWER; only an apartment that exists can inherit them. */
      if (floor > tower.front.structure) {
        out.push({
          code: `${floor}${String(position).padStart(2, "0")}`,
          floor,
          position,
          sealed: 0,
          current: null,
        });
        continue;
      }

      /* Standing on a poured slab, so the tower's siteworks and this floor's
         own structure certificate all apply. */
      let sealed =
        (tower.siteworks.plot ? 1 : 0) +
        (tower.siteworks.foundations ? 1 : 0) +
        1;

      let current: string | null = null;

      /* Walk the unit stages in order. A stage is sealed if the floor is
         behind the front; the apartment one step past the front is the one
         being worked on. The jitter lets roughly a sixth of apartments lag a
         floor behind their neighbours, which is what a site looks like. */
      for (const key of UNIT_STAGES) {
        const front = tower.front[key];
        const lagging = jitter > 0.82;
        if (floor < front || (floor === front && !lagging)) sealed += 1;
        else {
          /* The stage being worked on now: the one immediately past the
             front. Further above that, nothing has started. */
          if (floor <= front + 1) current = key;
          break;
        }
      }

      out.push({
        code: `${floor}${String(position).padStart(2, "0")}`,
        floor,
        position,
        sealed,
        current,
      });
    }
  }

  return out;
}

/** The whole development's apartments, by tower key. Computed once at module
 *  scope — every screen reads the same 504 apartments rather than generating
 *  its own, which is what keeps the portfolio's counts and the explorer's
 *  plate telling the same story. */
export const UNITS: Record<string, UnitState[]> = Object.fromEntries(
  TOWERS.map((t) => [t.key, unitsForTower(t)]),
);

/** Sealed certificates actually present across the development, by the
 *  by-level model. The portfolio's headline figure, and it is a sum over the
 *  generated apartments rather than an estimate. */
export function sealedToDate(): number {
  let total = 0;
  for (const tower of TOWERS) {
    total += (tower.siteworks.plot ? 1 : 0) + (tower.siteworks.foundations ? 1 : 0);
    total += tower.front.structure;
    for (const unit of UNITS[tower.key]) {
      /* Only the unit-level stages count per apartment; the tower and floor
         stages were counted once above. */
      const inherited =
        (tower.siteworks.plot ? 1 : 0) +
        (tower.siteworks.foundations ? 1 : 0) +
        (unit.floor <= tower.front.structure ? 1 : 0);
      total += unit.sealed - inherited;
    }
  }
  return total;
}

/* ── Who captures what ───────────────────────────────────────────────────── */

/* ⚠️  A CAPTURE SESSION HAS ONE PHOTOGRAPHER, which is a real constraint of
   the product rather than a simplification — and it has a consequence worth
   drawing. Rough-in is not one inspection: the plumber photographs the water,
   waste and gas before the walls close, and the electrician photographs the
   conduit, and they are different people on different days. So an apartment's
   rough-in produces TWO certificates, not one.

   That is why `sessions` exists on a stage below, and why it is folded into
   the certificate arithmetic. A page that showed two crews on the apartment
   sheet while counting one certificate for them would be contradicting itself
   on the one subject this whole page is about.

   The subcontractors are invented, like the developer — see the warning at
   the top of this file. The split of trades is not: 70% of this work being
   subcontracted is the real figure the customer gave. */

export type Trade = "plumbing" | "electrical" | "finishes" | "own";

export const TRADE: Record<Trade, Bi> = {
  plumbing: { en: "Plumbing & drainage", es: "Hidrosanitarias" },
  electrical: { en: "Electrical", es: "Eléctricas" },
  finishes: { en: "Finishes", es: "Acabados" },
  own: { en: "Own workforce", es: "Personal propio" },
};

export type Capturer = {
  id: string;
  name: string;
  initials: string;
  trade: Trade;
  /* The firm, because accountability runs to the company rather than to the
     individual — which is the whole point of the contractor screen. */
  org: Bi;
  /** This person's own contribution to how often something is raised against
   *  their captures. Multiplied by the job's difficulty to get the rate for
   *  any one cell — see flagRateFor().
   *
   *  ⚠️  NOT THE RATE YOU WILL SEE ON SCREEN. Difficulty is centred on 1
   *  across all twenty-two cells but not within any one trade: the plumbers'
   *  two cells average 1.95 and the handover crew's seven average 0.49, so the
   *  same base comes out four times higher for a plumber. That is deliberate,
   *  and it is the thing the by-job-type view exists to expose.
   *
   *  ⚠️  A FIXTURE DIAL, AND IT IS NOT A CLAIM ABOUT ANY REAL FIRM. Every
   *  name on this page is invented. The spread exists because a demo where
   *  everybody sits between 0.8% and 3.5% shows a screen that cannot tell
   *  anybody apart, which is the opposite of what a developer with 70% of the
   *  work subcontracted opens it for.
   *
   *  ⚠️  AND IT IS NOT A QUALITY SCORE EITHER, even here. It is the rate at
   *  which OTHER PEOPLE raised something against the record. Delphi does not
   *  judge the work; the number is a tally of site-team decisions, and every
   *  screen that shows it has to say so. */
  flagRate: number;
};

export const CREW: Capturer[] = [
  {
    id: "mario",
    name: "Mario Restrepo",
    initials: "MR",
    trade: "plumbing",
    org: { en: "Instalaciones Restrepo Ltda.", es: "Instalaciones Restrepo Ltda." },
    flagRate: 0.018,
  },
  {
    /* ⚠️  THE REASON THE PER-PERSON SCREEN EXISTS. Restrepo looks like an
       ordinary firm at firm level — Mario is one of the steadier people on
       site — and the firm average hides that one of its two plumbers is
       raised against five times as often as anybody else here. A dashboard
       that only ever rolls up to the company cannot show this, and it is the
       single most useful thing on the page. */
    id: "luigi",
    name: "Luigi Bernal",
    initials: "LB",
    trade: "plumbing",
    org: { en: "Instalaciones Restrepo Ltda.", es: "Instalaciones Restrepo Ltda." },
    flagRate: 0.072,
  },
  {
    id: "nelson",
    name: "Nelson Quintero",
    initials: "NQ",
    trade: "electrical",
    org: { en: "Electricidad Quintero S.A.S.", es: "Electricidad Quintero S.A.S." },
    /* The best firm on the development, and both of its people are. */
    flagRate: 0.011,
  },
  {
    id: "yesica",
    name: "Yésica Arboleda",
    initials: "YA",
    trade: "electrical",
    org: { en: "Electricidad Quintero S.A.S.", es: "Electricidad Quintero S.A.S." },
    flagRate: 0.008,
  },
  {
    id: "diana",
    name: "Diana Ocampo",
    initials: "DO",
    trade: "finishes",
    org: { en: "Acabados del Valle", es: "Acabados del Valle" },
    /* The firm with a problem: both of its people, not one of them, which is
       what makes it a procurement conversation rather than a staffing one. */
    flagRate: 0.078,
  },
  {
    id: "fabian",
    name: "Fabián Lozano",
    initials: "FL",
    trade: "finishes",
    org: { en: "Acabados del Valle", es: "Acabados del Valle" },
    flagRate: 0.095,
  },
  {
    id: "camila",
    name: "Camila Ruiz",
    initials: "CR",
    trade: "own",
    org: { en: "Constructora Aldamar", es: "Constructora Aldamar" },
    /* The developer's own staff: middling, which is the honest place to put
       the people who cannot be swapped out. */
    flagRate: 0.041,
  },
  {
    /* ⚠️  A SECOND RESIDENTE, because one was not credible. Handover is the
       largest block of captures in the development — every room of every
       apartment, 1,792 of them — and with a single person on the trade the
       "by person" view put all of them against one name. Nobody hands over 504
       apartments alone, and a figure a viewer does not believe is worse than
       no figure. Two splits it the way the two plumbers and two electricians
       already split theirs. */
    id: "andres",
    name: "Andrés Villegas",
    initials: "AV",
    trade: "own",
    org: { en: "Constructora Aldamar", es: "Constructora Aldamar" },
    flagRate: 0.057,
  },
];

export const crewById = new Map(CREW.map((c) => [c.id, c]));

/* ── What a session actually contains ────────────────────────────────────── */

/* The photographs are REAL FILES from the site's own library, reused because
   this is a rendering rather than a photograph of shipped software and
   commissioning a shoot of a Colombian apartment at rough-in would not make
   it more honest. They were generated for this page: two 3x2 grids of one
   Colombian apartment, before and after the walls close.

   ⚠️  THE IMAGE IS CHOSEN BY ROOM AND STAGE, NOT AT RANDOM. A viewer who sees
   a bathroom photograph filed against the kitchen learns that none of it is
   real, which is the one thing this page cannot afford. */

/* ⚠️  THE UNIT OF WORK IS A ROOM AND A TRADE TOGETHER, not an apartment and
   not a stage. A bathroom needs a plumbing capture; a living room does not.
   The kitchen needs one from every trade. So the checklist for an apartment is
   a GRID — rooms down, trades across — and every cell is either a required
   capture with its own status or a blank because that trade has no work in
   that room.

   This is the level a site actually operates at. "Apartment 603 is at
   rough-in" is not actionable; "603's bathroom plumbing is captured and its
   kitchen plumbing is not" is a phone call to a named person.

   A capture session still has ONE photographer, so a column of this grid is
   exactly one certificate: the plumber's two rooms, the electrician's six.
   The grid and the certificates are two readings of the same data. */

export type Requirement = {
  room: string;
  trade: Trade;
  /** Which stage it belongs to, which is what decides when it falls due. */
  stage: string;
  what: Bi;
  /** Basename under /assets/features or /assets/captures, no size suffix. */
  image: string;
  /** How much trouble this particular job gives, as a multiplier on whoever
   *  is doing it.
   *
   *  ⚠️  NOT EVERY JOB IS THE SAME JOB. Bathroom waterproofing and a handover
   *  photograph of a balcony are both one cell of this grid and nothing else
   *  about them is alike: one is the single most-rectified item in residential
   *  construction, the other is a picture of a finished floor. A model that
   *  gave them the same flag rate made the by-job-type view pointless, because
   *  every row came out the same.
   *
   *  ⚠️  AND IT IS WHY THE PER-PERSON NUMBERS NEED READING WITH CARE. Somebody
   *  on wet areas all year gets raised against more often than somebody on
   *  handover condition, with no difference in how well either of them works.
   *  That is the whole argument for the by-job-type breakdown sitting next to
   *  the by-person one, and the screen says so.
   *
   *  Centred on 1 across the twenty-two cells. */
  difficulty: number;
};

/* ⚠️  THE IMAGE IS CHOSEN BY ROOM AND TRADE, NOT AT RANDOM. A viewer who sees
   a bathroom photograph filed against the kitchen learns that none of it is
   real, which is the one thing this page cannot afford.

   These twelve were generated for this page rather than borrowed: the sheet
   previously used ONE conceal-electrical photograph for all six rooms'
   electrical captures, and prime-London interiors for the finished rooms of a
   mass-market apartment in Jamundi. Both read as stock on a second look.

   The two grids are the same apartment before and after the walls close, so a
   room's rough-in and finished shots are of the same room. See
   assets-src/features/co-roughin-grid.prompt.txt. */
export const REQUIREMENTS: Requirement[] = [
  /* Plumbing goes only where there is water. Two rooms out of seven, which is
     the whole reason this is a grid rather than a list. */
  /* Water, waste and gas in one wall, and the gas point is signed off separately. */
  { room: "cocina", trade: "plumbing", stage: "rough-in", image: "co-kitchen-plumbing", what: { en: "Water, waste and gas points", es: "Puntos de agua, desagüe y gas" }, difficulty: 1.5 },
  /* Waterproofing. The most-rectified item in residential construction, and the one that costs the most to find late. */
  { room: "bano", trade: "plumbing", stage: "rough-in", image: "co-bath-plumbing", what: { en: "Sanitary points and waterproofing", es: "Puntos sanitarios e impermeabilización" }, difficulty: 2.4 },

  /* Electrical goes everywhere, including the hall. */
  { room: "sala", trade: "electrical", stage: "rough-in", image: "co-sala-electrical", what: { en: "Conduit and outlet boxes", es: "Ductería y cajas de salida" }, difficulty: 0.8 },
  { room: "principal", trade: "electrical", stage: "rough-in", image: "co-bedroom-electrical", what: { en: "Bedroom circuits", es: "Circuitos de alcoba" }, difficulty: 0.7 },
  { room: "alcoba2", trade: "electrical", stage: "rough-in", image: "co-bedroom-electrical", what: { en: "Bedroom circuits", es: "Circuitos de alcoba" }, difficulty: 0.7 },
  /* Appliance circuits: more of them, heavier, and they have to miss the plumbing. */
  { room: "cocina", trade: "electrical", stage: "rough-in", image: "co-kitchen-electrical", what: { en: "Appliance circuits", es: "Circuitos de electrodomésticos" }, difficulty: 1.3 },
  { room: "bano", trade: "electrical", stage: "rough-in", image: "co-bedroom-electrical", what: { en: "Lighting and extractor", es: "Iluminación y extractor" }, difficulty: 1.1 },
  /* The board is the fiddliest thing an electrician does in an apartment. */
  { room: "hall", trade: "electrical", stage: "rough-in", image: "co-hall-board", what: { en: "Board and feed", es: "Tablero y acometida" }, difficulty: 1.6 },

  { room: "sala", trade: "finishes", stage: "finishes", image: "co-sala-finished", what: { en: "Floor, paint and skirting", es: "Piso, pintura y guardaescoba" }, difficulty: 1.2 },
  { room: "principal", trade: "finishes", stage: "finishes", image: "co-bedroom-finished", what: { en: "Finishes and wardrobe", es: "Acabados y closet" }, difficulty: 1.0 },
  { room: "alcoba2", trade: "finishes", stage: "finishes", image: "co-bedroom-finished", what: { en: "Finishes and wardrobe", es: "Acabados y closet" }, difficulty: 1.0 },
  /* Cabinetry and a worktop have to meet a wall that is never square. */
  { room: "cocina", trade: "finishes", stage: "finishes", image: "co-kitchen-finished", what: { en: "Cabinetry and worktop", es: "Mobiliario y mesón" }, difficulty: 1.8 },
  /* Tiling: every defect is visible from the door and none of it can be touched up. */
  { room: "bano", trade: "finishes", stage: "finishes", image: "co-bath-finished", what: { en: "Tiling and fittings", es: "Enchape y aparatos" }, difficulty: 2.2 },
  { room: "hall", trade: "finishes", stage: "finishes", image: "co-hall-finished", what: { en: "Door, frame and lock", es: "Puerta, marco y cerradura" }, difficulty: 1.4 },
  /* A handrail is a fixing nobody is allowed to get wrong. */
  { room: "balcon", trade: "finishes", stage: "finishes", image: "co-balcony-finished", what: { en: "Floor and handrail", es: "Piso y pasamanos" }, difficulty: 1.3 },

  { room: "sala", trade: "own", stage: "handover", image: "co-sala-handover", what: { en: "Condition at handover", es: "Estado de entrega" }, difficulty: 0.4 },
  { room: "principal", trade: "own", stage: "handover", image: "co-bedroom-handover", what: { en: "Condition at handover", es: "Estado de entrega" }, difficulty: 0.4 },
  { room: "alcoba2", trade: "own", stage: "handover", image: "co-bedroom-handover", what: { en: "Condition at handover", es: "Estado de entrega" }, difficulty: 0.4 },
  { room: "cocina", trade: "own", stage: "handover", image: "co-kitchen-finished", what: { en: "Appliances and meters", es: "Electrodomésticos y medidores" }, difficulty: 0.7 },
  { room: "bano", trade: "own", stage: "handover", image: "co-bath-finished", what: { en: "Condition at handover", es: "Estado de entrega" }, difficulty: 0.5 },
  { room: "hall", trade: "own", stage: "handover", image: "co-hall-finished", what: { en: "Keys and snag list", es: "Llaves y lista de pendientes" }, difficulty: 0.6 },
  { room: "balcon", trade: "own", stage: "handover", image: "co-balcony-finished", what: { en: "Condition at handover", es: "Estado de entrega" }, difficulty: 0.4 },
];

/** The columns of the grid: one per (stage, trade), in build order. Each is
 *  one capture session and therefore one certificate. Derived from
 *  REQUIREMENTS so a trade added above appears here without being listed
 *  twice. */
export const JOBS: { stage: string; trade: Trade }[] = (() => {
  const seen = new Set<string>();
  const out: { stage: string; trade: Trade }[] = [];
  for (const r of REQUIREMENTS) {
    const key = `${r.stage}:${r.trade}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ stage: r.stage, trade: r.trade });
  }
  return out.sort(
    (a, b) =>
      STAGES.findIndex((s) => s.key === a.stage) -
      STAGES.findIndex((s) => s.key === b.stage),
  );
})();

/** The rooms the grid has rows for — the apartment's own rooms plus the
 *  balcony, which is not a room in the plan but is captured like one. */
export const CAPTURE_ROOMS: { key: string; name: Bi }[] = [
  ...APARTMENT.rooms.map((r) => ({ key: r.key, name: r.name })),
  { key: "balcon", name: { en: "Balcony", es: "Balcón" } },
];

/** Which image library a basename lives in. The room shots came from the
 *  Cadogan capture set and the concealed-work shots from the feature set; both
 *  are on disk at 240, 480, 960 and 1920. */
export function shotSrc(image: string, width: 240 | 480 | 960 | 1920) {
  /* ⚠️  EVERY CAPTURE IMAGE LIVES IN `features`, and must. The cadogan-*
     capture set is built at 240 and 878 only — it exists to be thumbnails on
     the evidence record — so asking it for 480 or 960 returned 404s that
     showed as empty frames with no console error. The apartment sheet asks
     for both. Anything added here has to be registered in the `features`
     group of scripts/optimise-images.mjs, which builds 240/480/960/1920.
     1920 is what the zoom viewer asks for, and was checked present for every
     capture image this fixture can reference before being allowed in here. */
  return `/assets/features/${image}-${width}.webp`;
}

/** One certificate: one job, one photographer, the captures it holds. */
export type PublishedSession = {
  stage: string;
  trade: Trade;
  by: Capturer;
  code: string;
  date: string;
};

/** One cell of the grid: a required capture and where it has got to. */
export type RequiredCapture = {
  requirement: Requirement;
  status: UnitPhase;
  /** Whose work it is — who made the capture, or who it is waiting on. */
  by: Capturer;
  /** Only once it exists. */
  time: string | null;
  /** Whether a certificate exists for this capture's job — see
   *  hasCertificate(). Every image shown anywhere is gated on it, so there is
   *  never a photograph without a record behind it. */
  published: boolean;
  /** What the site team raised against this capture, ever.
   *
   *  ⚠️  HISTORY, NOT STATE. `status` says where the cell is NOW; a stage the
   *  apartment has moved past is uniformly complete, because it could not have
   *  sealed otherwise. `raised` says what happened on the way, and it does not
   *  disappear when the work is put right.
   *
   *  Without this the whole record was amnesiac: flags existed only in the one
   *  stage being worked on, so every month before the current one showed a
   *  clean sheet for everybody, and a chart of anyone's work over time was
   *  empty until its last two columns. A development that has raised four
   *  hundred flags cannot show nothing happened. */
  raised: "none" | "inspection" | "rework";
  /** A raised flag that has since been closed out. Open flags are the ones
   *  somebody still has to do something about. */
  resolved: boolean;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function codeFor(seed: string) {
  /* Eight characters in two groups, matching the shape of a real certificate
     code. Derived from the seed so the same apartment always shows the same
     code — a viewer who clicks away and back to a different code has been
     shown that the codes mean nothing. */
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += CODE_ALPHABET[Math.floor(hash01(`${seed}:${i}`) * CODE_ALPHABET.length)];
  }
  return `${out.slice(0, 4)}-${out.slice(4)}`;
}

/** When a given stage on a given floor of a given tower was captured.
 *
 *  One function, used both by the certificates themselves and by the
 *  development's own handover date, so the two cannot disagree — which they
 *  did: handover certificates were dated March 2026 against a stated first
 *  handover of June 2027.
 *
 *  The shape of it: a tower starts when the crane reaches it, the structure
 *  climbs about a floor a month, and each stage follows the one below it up
 *  the building. */
function sessionDate(
  tower: Tower,
  floor: number,
  stageIndex: number,
  jitterDays: number,
) {
  const d = new Date(Date.parse(`${DEVELOPMENT.started}T00:00:00Z`));
  d.setUTCDate(
    d.getUTCDate() +
      tower.startOffsetDays +
      120 +
      floor * 24 +
      stageIndex * 46 +
      jitterDays,
  );
  return d.toISOString().slice(0, 10);
}

/** Who captures one job on one apartment.
 *
 *  ⚠️  IT DOES NOT WAIT FOR PUBLICATION. sessionFor() returns null until a
 *  stage is sealed, which is right for a certificate — there is no certificate
 *  until there is one. But the work is already somebody's: the plumber due on
 *  floor 14 is as real as the one who finished floor 9, and a backlog you
 *  cannot put a name to is not a backlog anybody can chase. So the crew member
 *  is derived from the same seed whether or not the session has published, and
 *  sessionFor() reads this rather than rolling its own.
 *
 *  ⚠️  THE PRODUCT CANNOT DO THIS YET. Photographer assignment is not
 *  implemented — a session's photographer is whoever is holding the phone. The
 *  gap analysis should carry it. */
export function capturerFor(
  unit: UnitState,
  tower: Tower,
  stage: string,
  trade: Trade,
): Capturer {
  const seed = `${tower.key}-${unit.code}-${stage}-${trade}`;
  const crew = CREW.filter((c) => c.trade === trade);
  return crew[Math.floor(hash01(`${seed}:who`) * crew.length)];
}

/** Does this job have a certificate on this apartment?
 *
 *  ⚠️  ONE PREDICATE, READ BY BOTH SIDES. The session and the capture used to
 *  decide this separately — a stage had to be fully sealed to have a
 *  certificate, but a capture inside a stage still being worked on could
 *  already be marked complete. Apartment 308 came out with three handover
 *  photographs and no handover certificate: evidence nobody could check,
 *  which is the one thing this product must never depict.
 *
 *  ⚠️  AND IT IS A SIMPLIFICATION, deliberately. In the product a certificate
 *  exists only once its session is PUBLISHED; captures before that sit in a
 *  draft on the device. Here a stage under way counts as certificated, so
 *  every capture belongs to one. It keeps the demo coherent at the cost of
 *  eliding the draft state — which belongs in the gap analysis, not hidden in
 *  a predicate. */
export function hasCertificate(
  unit: UnitState,
  stageKey: string,
  stageIndex: number,
): boolean {
  return unit.sealed > stageIndex || unit.current === stageKey;
}

/** The certificate for one job on one apartment, or null if there is none. */
export function sessionFor(
  unit: UnitState,
  tower: Tower,
  job: { stage: string; trade: Trade },
): PublishedSession | null {
  const stageIndex = STAGES.findIndex((s) => s.key === job.stage);
  if (!hasCertificate(unit, job.stage, stageIndex)) return null;

  const seed = `${tower.key}-${unit.code}-${job.stage}-${job.trade}`;

  return {
    stage: job.stage,
    trade: job.trade,
    by: capturerFor(unit, tower, job.stage, job.trade),
    code: codeFor(seed),
    date: sessionDate(
      tower,
      unit.floor,
      stageIndex,
      Math.floor(hash01(`${seed}:day`) * 9),
    ),
  };
}

/** Every cell of an apartment's checklist, with where each one has got to.
 *
 *  ⚠️  STATUS IS PER CELL, not per apartment and not per stage. An apartment
 *  mid-rough-in has some rooms captured, one being worked on now, and
 *  occasionally one whose photograph was rejected by screening and has to be
 *  retaken before the certificate can publish. Collapsing that to a single
 *  apartment state is what makes a progress report useless to the person who
 *  has to act on it. */
/** Was anything raised against a capture that is now complete, and closed?
 *
 *  Drawn on its own seed so it is independent of the status draw — sharing one
 *  would tie "did this finish" to "did it finish first time", which are not the
 *  same question and would correlate every chart on the page with every other.
 *
 *  The inspection / rework split is 11:9 across everybody. Rework is the rarer
 *  call because it costs somebody a day. */
/** How often this person, on this job, gets something raised against them.
 *
 *  ⚠️  BOTH TERMS MATTER, and separating them is the point of the two views on
 *  the team screen. Who did it is one thing; what they were asked to do is
 *  another, and a rate that mixes them silently is how a tiler on bathrooms
 *  comes to look worse than a labourer photographing balconies. */
export function flagRateFor(by: Capturer, requirement: Requirement): number {
  return by.flagRate * requirement.difficulty;
}

function history(
  seed: string,
  by: Capturer,
  requirement: Requirement,
  photographed: boolean,
): readonly ["none" | "inspection" | "rework", boolean] {
  if (!photographed) return ["none", false] as const;
  const rate = flagRateFor(by, requirement);
  const r = hash01(`${seed}:raised`);
  if (r >= rate) return ["none", false] as const;
  /* Rescaled within the band so the kind does not correlate with how close the
     draw came to the threshold. Rework is the rarer call, because it costs
     somebody a day. */
  const kind = r / rate < 0.55 ? "inspection" : "rework";
  return [kind, true] as const;
}

const capturesCache = new Map<string, RequiredCapture[]>();

export function capturesFor(unit: UnitState, tower: Tower): RequiredCapture[] {
  /* The elevation asks for this once per apartment per frame while the tower
     is being dragged — 84 panels times 22 requirements times a hash each. The
     answer never changes, so it is computed once. */
  const key = `${tower.key}:${unit.code}`;
  const hit = capturesCache.get(key);
  if (hit) return hit;

  const out = REQUIREMENTS.map((requirement) => {
    const stageIndex = STAGES.findIndex((s) => s.key === requirement.stage);
    const seed = `${tower.key}-${unit.code}-${requirement.stage}-${requirement.trade}-${requirement.room}`;
    const h = hash01(seed);

    /* The stage is sealed, so every cell in it is captured — a certificate
       cannot publish with a rejected or missing capture in it. */
    const by = capturerFor(unit, tower, requirement.stage, requirement.trade);
    const published = hasCertificate(unit, requirement.stage, stageIndex);

    /* ⚠️  SEALED, NOT PUBLISHED — the two are different and conflating them
       flattened the whole model. `published` is true for the stage being
       worked on as well as for finished ones, so testing it here returned
       "complete" for every cell in the live stage and made the mixed-status
       branch below unreachable: active, warning and problem went to zero
       across all three towers, and the tower drew as nothing but pending and
       done.

       A stage the apartment has got PAST is uniformly complete. The stage it
       is on is the only interesting one, and it is handled below. */
    if (unit.sealed > stageIndex) {
      /* It finished — but whether it finished first time is a separate draw,
         and a separate fact. The stage could not have sealed with a flag still
         open, so anything raised here was closed out. */
      const [raised, resolved] = history(seed, by, requirement, true);
      return {
        requirement,
        status: "complete" as const,
        by,
        time: timeFrom(seed),
        published,
        raised,
        resolved,
      };
    }

    /* The stage being worked on now: a mixed column, which is the only
       interesting state on the whole sheet. */
    if (unit.current === requirement.stage) {
      /* ⚠️  THE OPEN-FLAG BAND IS THE CAPTURER'S, NOT A CONSTANT. It used to be
         a fixed 12% inspection and 7% rework for everybody, which drew a tower
         where every trade looked alike and made the per-person screen pointless
         — the thing a developer with 70% of the work subcontracted is actually
         trying to see.

         It runs at three times their settled rate because this is the stage
         nobody has closed out yet: open flags are over-represented by
         definition, and the ones that get resolved leave the band as the work
         moves on. Capped so that even the worst firm's live column is mostly
         work rather than mostly flags. */
      const band = Math.min(0.36, flagRateFor(by, requirement) * 3);
      const rest = 1 - band;
      /* The remainder keeps the old complete / active / pending proportions,
         so changing the band moves flags in and out without quietly changing
         how much work appears done. */
      const complete = rest * 0.641;
      const active = complete + rest * 0.197;
      const warning = active + band * 0.6;
      const problem = warning + band * 0.4;

      const status: UnitPhase =
        h < complete
          ? "complete"
          : h < active
            ? "active"
            : h < warning
              ? "warning"
              : h < problem
                ? "problem"
                : "pending";

      /* An open flag IS the history, still running. A cell that came through
         clean this time may still carry an older, closed one. */
      const [raised, resolved] =
        status === "warning"
          ? (["inspection", false] as const)
          : status === "problem"
            ? (["rework", false] as const)
            : history(seed, by, requirement, status === "complete");

      return {
        requirement,
        status,
        by,
        time: status === "complete" || status === "problem" ? timeFrom(seed) : null,
        published,
        raised,
        resolved,
      };
    }

    /* Nobody has been yet, so there is nothing to have raised anything about. */
    return {
      requirement,
      status: "pending" as const,
      by,
      time: null,
      published,
      raised: "none" as const,
      resolved: false,
    };
  });

  capturesCache.set(key, out);
  return out;
}

/** What an apartment is doing, worst first.
 *
 *  ⚠️  DERIVED FROM ITS CAPTURES, NOT FROM ITS OWN HASH. UnitState used to
 *  carry a `phase` rolled at generation time from a single jitter value, which
 *  had nothing to do with the states of the captures inside it. An apartment
 *  with a rework-flagged bathroom could therefore draw blue, and the tower
 *  disagreed with the sheet about the same flat.
 *
 *  Worst first is the ordering a supervisor needs: rework outranks inspection,
 *  which outranks work in progress. Reds surface over ambers over blues over
 *  greys without anybody having to hunt. */
export function unitState(
  unit: UnitState,
  tower: Tower,
  focus: CaptureFocus | null = null,
): UnitPhase | null {
  if (unit.sealed === 0) return "pending";
  return unitFocusState(capturesFor(unit, tower), focus);
}

function timeFrom(seed: string) {
  const hour = 7 + Math.floor(hash01(`${seed}:hr`) * 9);
  const minute = Math.floor(hash01(`${seed}:min`) * 59);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** The first apartment in the development to be handed over.
 *
 *  ⚠️  DERIVED, NOT TYPED, and it had to become so. It was written as a
 *  constant and said June 2027 while the generated certificates were dating
 *  handovers from March 2026 — the exact class of contradiction the top of
 *  this file warns about, sitting in the file that warns about it. Computed
 *  from sessionDate(), it cannot drift again.
 *
 *  Floor 1 of whichever tower started first, at the handover stage. */
export const firstHandover = (() => {
  const handoverIndex = STAGES.findIndex((s) => s.key === "handover");
  const lead = TOWERS.reduce((a, b) =>
    a.startOffsetDays <= b.startOffsetDays ? a : b,
  );
  return sessionDate(lead, 1, handoverIndex, 0);
})();

/** Captures in a typical unit-level certificate — the grid's own average.
 *  See the note where this used to be a constant. */
export const MEDIA_PER_CERTIFICATE = Math.round(
  REQUIREMENTS.length / JOBS.length,
);

/* ── Progress across the whole site ───────────────────────────────────────
   Every required capture in the development, tallied by room and trade.

   This is the question a head of construction actually opens a dashboard to
   ask: not "how is apartment 1402" but "who still owes me bathroom plumbing,
   and how much of it". One row per cell of the apartment checklist, summed
   over all 504 apartments in all three towers.

   ⚠️  COMPUTED FROM THE SAME capturesFor() THE APARTMENT SHEET DRAWS. If a
   row here said 134 complete and the sheet showed a different state for an
   apartment in that row, one of them would be lying — so neither keeps its
   own tally. It costs 504 x 22 hashes, which is why the result is memoised
   below rather than recomputed per render. */

export type ProgressRow = {
  room: string;
  trade: Trade;
  stage: string;
  /** Whose cell this is. The tally is keyed by room, task AND person, so the
     three groupings are three collapses of one set of numbers rather than
     three tallies that could disagree. */
  capturer: string;
  pending: number;
  active: number;
  warning: number;
  problem: number;
  complete: number;
  total: number;
};

const progressCache = new Map<string, ProgressRow[]>();

/** Progress across whichever towers you ask for.
 *
 *  The whole development by default, or one tower when the asset view has
 *  drilled into it — the same rows, the same arithmetic, a narrower scope.
 *  Two tallies computed different ways would eventually disagree, and the
 *  disagreement would be between two screens a reader can hold side by side. */
export function siteProgress(
  towers: Tower[] = TOWERS,
  /* One storey, or every storey when omitted. The panel beside a tower uses
     this: the table is a summary of whatever the viewer has selected, and
     selecting a floor should narrow it rather than open a different screen. */
  floor?: number,
): ProgressRow[] {
  const key = `${towers.map((t) => t.key).join(",")}@${floor ?? "all"}`;
  const hit = progressCache.get(key);
  if (hit) return hit;

  /* Keyed by room and trade together, because that pair IS the unit of work —
     a bathroom needs plumbing and a living room does not. See REQUIREMENTS. */
  const rows = new Map<string, ProgressRow>();
  const keyOf = (room: string, trade: Trade, capturer: string) =>
    `${room}:${trade}:${capturer}`;

  for (const tower of towers) {
    for (const unit of UNITS[tower.key]) {
      /* An apartment whose slab is not poured has no checklist yet. Counting
         its captures as "pending" would bury the real backlog under thousands
         of rooms that do not exist — Torre 3 alone would contribute 192
         apartments of nothing. */
      if (unit.sealed === 0) continue;
      if (floor !== undefined && unit.floor !== floor) continue;

      for (const cell of capturesFor(unit, tower)) {
        const { room, trade, stage } = cell.requirement;
        const key = keyOf(room, trade, cell.by.id);
        let row = rows.get(key);
        if (!row) {
          row = {
            room,
            trade,
            stage,
            capturer: cell.by.id,
            pending: 0,
            active: 0,
            warning: 0,
            problem: 0,
            complete: 0,
            total: 0,
          };
          rows.set(key, row);
        }
        row[cell.status] += 1;
        row.total += 1;
      }
    }
  }

  const out = [...rows.values()];
  progressCache.set(key, out);
  return out;
}

/** Apartments the site progress is drawn from — those that physically exist.
 *  Quoted beside the table so a reader can check the arithmetic. */
export function apartmentsStarted(
  towers: Tower[] = TOWERS,
  floor?: number,
): number {
  let n = 0;
  for (const tower of towers) {
    n += UNITS[tower.key].filter(
      (u) => u.sealed > 0 && (floor === undefined || u.floor === floor),
    ).length;
  }
  return n;
}

/* ── What the views are focused on ───────────────────────────────────────── */

/** A selection made in the progress table, narrowing what the drawings show.
 *
 *  ⚠️  IT IS A FILTER OVER REQUIREMENTS, NOT OVER APARTMENTS. Picking
 *  "Rough-in · plumbing" does not hide apartments; it changes what each
 *  apartment is being asked about, so the tower stops showing overall progress
 *  and starts showing who still owes a plumbing capture. An apartment with no
 *  work of that kind — a living room has no plumbing — is not "not started",
 *  it is not in the question, and the drawings have to say those differently.
 *
 *  Either field may be null: a group header selects one dimension and leaves
 *  the other open. */
export type CaptureFocus = {
  room: string | null;
  stage: string | null;
  trade: Trade | null;
  /** A crew member's id. The three groupings are three ways of asking the same
   *  question — which room, which task, whose work — and any of them can be
   *  the thing selected. */
  capturer: string | null;
};

/** Does this requirement fall inside the focus? A null focus matches
 *  everything, which is what "nothing selected" means. */
export function inFocus(
  cell: RequiredCapture,
  focus: CaptureFocus | null,
): boolean {
  if (!focus) return true;
  if (focus.room && cell.requirement.room !== focus.room) return false;
  if (focus.stage && cell.requirement.stage !== focus.stage) return false;
  if (focus.trade && cell.requirement.trade !== focus.trade) return false;
  /* The capturer is a property of the CELL, not of the requirement — the same
     bathroom plumbing is Mario's on one floor and Luigi's on another, which is
     exactly why "by person" is worth having. */
  if (focus.capturer && cell.by.id !== focus.capturer) return false;
  return true;
}

/** The state of one room under the current focus, or null when that room has
 *  no work of the kind being asked about.
 *
 *  Worst-first: a rejected capture outranks an overdue one, which outranks
 *  work in progress. The room has to show the thing somebody must act on, not
 *  the cheeriest thing true about it. */
export function roomFocusState(
  cells: RequiredCapture[],
  room: string,
  focus: CaptureFocus | null,
): UnitPhase | null {
  const mine = cells.filter(
    (c) => c.requirement.room === room && inFocus(c, focus),
  );
  if (mine.length === 0) return null;
  if (mine.some((c) => c.status === "problem")) return "problem";
  if (mine.some((c) => c.status === "warning")) return "warning";
  if (mine.some((c) => c.status === "active")) return "active";
  if (mine.every((c) => c.status === "complete")) return "complete";
  return "pending";
}

/** The same for a whole apartment, which is what an elevation panel draws. */
export function unitFocusState(
  cells: RequiredCapture[],
  focus: CaptureFocus | null,
): UnitPhase | null {
  const mine = cells.filter((c) => inFocus(c, focus));
  if (mine.length === 0) return null;
  if (mine.some((c) => c.status === "problem")) return "problem";
  if (mine.some((c) => c.status === "warning")) return "warning";
  if (mine.some((c) => c.status === "active")) return "active";
  if (mine.every((c) => c.status === "complete")) return "complete";
  return "pending";
}

/* ── Defects ─────────────────────────────────────────────────────────────── */

/* ⚠️  A DEFECT IS IN THE WORK, NOT IN THE PHOTOGRAPH, and the two states that
   use these images say so. "Needs inspection" and "needs rework" are
   judgements a person makes looking at a record; Delphi does not certify
   construction quality and never claims the work is good or bad.

   That is the argument, not a caveat on it: a certificate showing a leaking
   joint is a perfectly good certificate, and being able to produce one — dated,
   attributed, sealed — is the whole reason to have the record. An evidence
   system that only ever showed work going well would be worth nothing in the
   dispute it exists for. */

const DEFECT_BY_TRADE: Record<Trade, string> = {
  plumbing: "co-defect-leak",
  electrical: "co-defect-wiring",
  finishes: "co-defect-tile",
  own: "co-defect-door",
};

/* Wet rooms fail wet. A damp patch in a bathroom reads; the same patch filed
   against a bedroom's finishes does not. */
const DEFECT_BY_ROOM: Record<string, string> = {
  bano: "co-defect-damp",
  cocina: "co-defect-leak",
  sala: "co-defect-plaster",
  principal: "co-defect-plaster",
  alcoba2: "co-defect-plaster",
};

/** The photograph a flagged capture shows.
 *
 *  Chosen by trade first, because a defect raised against electrical work had
 *  better be a picture of wiring — a cracked tile filed under the electrician
 *  is the kind of mismatch that tells a viewer none of it is real. Finishes
 *  and handover fall back to the room, which is where their defects differ. */
export function defectImage(requirement: Requirement): string {
  if (requirement.trade === "plumbing" || requirement.trade === "electrical") {
    return DEFECT_BY_TRADE[requirement.trade];
  }
  return (
    DEFECT_BY_ROOM[requirement.room] ?? DEFECT_BY_TRADE[requirement.trade]
  );
}

/** Does a photograph exist for this capture?
 *
 *  ⚠️  A FLAGGED CAPTURE HAS ONE. Inspection and rework are judgements raised
 *  by looking at a photograph, so a cell in either state must have one — this
 *  test excluded "warning" at first, which meant the inspection defect images
 *  were generated, wired and never once displayed. Only "pending" (nobody has
 *  been) and "active" (somebody is there now) have nothing to show.
 *
 *  Publication is the other half: a stage still being worked on holds its
 *  media in a draft, so there is no certificate and nothing to show. */
export function hasPhotograph(cell: RequiredCapture): boolean {
  return (
    cell.published &&
    (cell.status === "complete" ||
      cell.status === "warning" ||
      cell.status === "problem")
  );
}

/** The image a capture actually shows: its defect photograph when one has been
 *  raised against it, otherwise the ordinary record shot. */
export function imageFor(cell: RequiredCapture): string {
  return cell.status === "warning" || cell.status === "problem"
    ? defectImage(cell.requirement)
    : cell.requirement.image;
}

/* ── Figures for the analysis page ───────────────────────────────────────── */

/** How far each stage has climbed in each tower.
 *
 *  The chart a head of construction actually draws on a whiteboard: six stages
 *  against the height of the block, and the GAP between two lines is the thing
 *  being read. Structure at 14 and rough-in at 9 means five floors of shell
 *  standing empty — capacity the trades have not caught up with. */
export type FrontRow = { stage: string; reached: number; of: number };

export function buildFront(tower: Tower): FrontRow[] {
  return STAGES.map((stage) => {
    const reached =
      stage.level === "tower"
        ? tower.siteworks[stage.key as "plot" | "foundations"]
          ? tower.floors
          : 0
        : stage.key === "structure"
          ? tower.front.structure
          : (tower.front[stage.key as keyof Tower["front"]] ?? 0);
    return { stage: stage.key, reached, of: tower.floors };
  });
}

/** Certificates published per calendar month across the development.
 *
 *  ⚠️  COUNTED FROM THE SESSIONS THEMSELVES, not estimated from progress. Every
 *  apartment is asked for every job and the ones that have published are
 *  tallied by month, so the series is the same data the apartment sheets show.
 *  It is cached because it walks 516 apartments four times. */
export type MonthCount = { month: string; count: number };

let monthsCache: MonthCount[] | null = null;

export function certificatesByMonth(): MonthCount[] {
  if (monthsCache) return monthsCache;

  const counts = new Map<string, number>();
  for (const tower of TOWERS) {
    for (const unit of UNITS[tower.key]) {
      if (unit.sealed === 0) continue;
      for (const job of JOBS) {
        const session = sessionFor(unit, tower, job);
        if (!session) continue;
        const month = session.date.slice(0, 7);
        counts.set(month, (counts.get(month) ?? 0) + 1);
      }
    }
  }

  monthsCache = [...counts.entries()]
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
  return monthsCache;
}

/** Outstanding work by subcontractor, which is the level accountability runs
 *  at — a firm is who you ring, an individual is who answers. */
export type FirmRow = {
  firm: string;
  trade: Trade;
  people: number;
  pending: number;
  active: number;
  warning: number;
  problem: number;
  complete: number;
  total: number;
};

export function backlogByFirm(): FirmRow[] {
  const rows = new Map<string, FirmRow>();

  for (const row of siteProgress()) {
    const person = crewById.get(row.capturer);
    if (!person) continue;
    const firm = person.org.en;

    let entry = rows.get(firm);
    if (!entry) {
      entry = {
        firm,
        trade: person.trade,
        people: 0,
        pending: 0,
        active: 0,
        warning: 0,
        problem: 0,
        complete: 0,
        total: 0,
      };
      rows.set(firm, entry);
    }
    for (const k of ["pending", "active", "warning", "problem", "complete"] as const) {
      entry[k] += row[k];
    }
    entry.total += row.total;
  }

  for (const entry of rows.values()) {
    entry.people = CREW.filter((c) => c.org.en === entry.firm).length;
  }

  /* Most outstanding first: the point of the chart is who to ring. */
  return [...rows.values()].sort(
    (a, b) => b.problem + b.warning - (a.problem + a.warning) || b.pending - a.pending,
  );
}

/* ── The review queue ────────────────────────────────────────────────────── */

/** The latest day anything was captured — the demo's present.
 *
 *  Derived from the sessions rather than typed, so it cannot fall behind the
 *  data the way a hard-coded "today" does. */
export const TODAY: string = (() => {
  let latest: string = DEVELOPMENT.started;
  for (const tower of TOWERS) {
    for (const unit of UNITS[tower.key]) {
      if (unit.sealed === 0) continue;
      for (const job of JOBS) {
        const s = sessionFor(unit, tower, job);
        if (s && s.date > latest) latest = s.date;
      }
    }
  }
  return latest;
})();

const DAY = 86_400_000;

/** How many days before TODAY a certificate was published. */
function ageInDays(date: string) {
  return Math.round(
    (Date.parse(`${TODAY}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / DAY,
  );
}

/** Has somebody looked at this certificate yet?
 *
 *  ⚠️  REVIEW IS A HUMAN ACT, AND THE PRODUCT DOES NOT DO IT. There is no
 *  approval or sign-off workflow — a recipient opens a public certificate and
 *  forms a view. This models the thing a developer actually wants and does not
 *  have, which is why it belongs in the gap analysis rather than being quietly
 *  presented as shipped.
 *
 *  Recent work is unreviewed because nobody has got to it; a few older ones
 *  are unreviewed because they were missed, which is the backlog worth
 *  surfacing. */
export function isReviewed(
  unit: UnitState,
  tower: Tower,
  job: { stage: string; trade: Trade },
  date: string,
): boolean {
  const age = ageInDays(date);
  if (age <= 21) return false;
  /* About one older certificate in twelve was never looked at. */
  return hash01(`${tower.key}-${unit.code}-${job.stage}-${job.trade}:review`) > 0.08;
}

export type ReviewItem = {
  tower: Tower;
  unit: UnitState;
  job: { stage: string; trade: Trade };
  session: PublishedSession;
  shots: RequiredCapture[];
  ageDays: number;
};

let queueCache: ReviewItem[] | null = null;

/** Certificates nobody has looked at, newest first.
 *
 *  Newest first rather than oldest: a review queue sorted by age puts the
 *  stragglers at the top every morning and buries the work that just came in,
 *  which is the work somebody is waiting on. The age column is there for the
 *  stragglers. */
export function reviewQueue(): ReviewItem[] {
  if (queueCache) return queueCache;

  const out: ReviewItem[] = [];
  for (const tower of TOWERS) {
    for (const unit of UNITS[tower.key]) {
      if (unit.sealed === 0) continue;
      const cells = capturesFor(unit, tower);
      for (const job of JOBS) {
        const session = sessionFor(unit, tower, job);
        if (!session) continue;
        if (isReviewed(unit, tower, job, session.date)) continue;

        const shots = cells.filter(
          (c) =>
            hasPhotograph(c) &&
            c.requirement.stage === job.stage &&
            c.requirement.trade === job.trade,
        );
        if (shots.length === 0) continue;

        out.push({
          tower,
          unit,
          job,
          session,
          shots,
          ageDays: ageInDays(session.date),
        });
      }
    }
  }

  queueCache = out.sort((a, b) => b.session.date.localeCompare(a.session.date));
  return queueCache;
}
/* ── Work over time ──────────────────────────────────────────────────────── */

/* ⚠️  THIS IS A RECORD OF HUMAN JUDGEMENTS, NOT A VERDICT ON ANYBODY. Delphi
   does not certify construction quality, so nothing here says a person's work
   is poor. What it says is how many of their captures the SITE TEAM later
   raised for inspection or rework — a count of decisions other people made,
   which is a fact about the record rather than an opinion about the tradesman.

   The distinction matters more here than anywhere else on the page, because
   this is the screen somebody would misread as a performance score. The copy
   has to keep saying whose judgement is being counted.

   ⚠️  AND IT IS COUNTED TWO WAYS ON PURPOSE. A rate per person mixes together
   who did the work and how hard the work was: the bathroom waterproofing cell
   is raised against several times more often than a handover photograph, so
   whoever is on wet areas carries a worse-looking number for doing a harder
   job. Neither view is the truth on its own, which is why both are built here
   from one pass and shown side by side. */

export type ActivityMonth = {
  month: string;
  captures: number;
  /** Raised for a closer look. */
  inspection: number;
  /** Raised to be done again. */
  rework: number;
  /** inspection + rework, kept so callers need not add up to sort. */
  flagged: number;
  /** Of those, the ones still waiting on somebody. */
  open: number;
};

/** Kept for the callers that named it this before job rows existed. */
export type PersonMonth = ActivityMonth;

type Tally = {
  months: ActivityMonth[];
  captures: number;
  inspection: number;
  rework: number;
  flagged: number;
  open: number;
  /** Months between the first and last capture, inclusive. */
  activeMonths: number;
};

export type PersonActivity = Tally & {
  id: string;
  name: string;
  initials: string;
  trade: Trade;
  firm: string;
};

export type JobActivity = Tally & {
  key: string;
  stage: string;
  trade: Trade;
  /** The requirements this job is made of, hardest first — the "some jobs are
   *  harder than others" detail behind the row. */
  cells: CellActivity[];
};

/** One square of the checklist grid: a room and a trade together. */
export type CellActivity = {
  room: string;
  what: Bi;
  stage: string;
  trade: Trade;
  difficulty: number;
  captures: number;
  inspection: number;
  rework: number;
  flagged: number;
};

/** A person's work on one job type, or a job type's work by one person —
 *  the same cross-tabulation read from either side. */
export type Crossing = {
  personId: string;
  jobKey: string;
  stage: string;
  trade: Trade;
  name: string;
  captures: number;
  inspection: number;
  rework: number;
  flagged: number;
};

type Built = {
  people: PersonActivity[];
  jobs: JobActivity[];
  crossings: Crossing[];
  /** Keyed `personId:stage:trade:room`. */
  personCells: Map<string, CellActivity>;
};

let built: Built | null = null;

function blankMonths(all: string[]): ActivityMonth[] {
  return all.map((month) => ({
    month,
    captures: 0,
    inspection: 0,
    rework: 0,
    flagged: 0,
    open: 0,
  }));
}

function totalsOf(months: ActivityMonth[]): Tally {
  const captures = months.reduce((n, m) => n + m.captures, 0);
  const inspection = months.reduce((n, m) => n + m.inspection, 0);
  const rework = months.reduce((n, m) => n + m.rework, 0);
  const open = months.reduce((n, m) => n + m.open, 0);
  const first = months.findIndex((m) => m.captures > 0);
  const last = months.map((m) => m.captures > 0).lastIndexOf(true);
  return {
    months,
    captures,
    inspection,
    rework,
    flagged: inspection + rework,
    open,
    activeMonths: first === -1 ? 0 : last - first + 1,
  };
}

/** Walks the development once and fills every tally the team screen needs.
 *
 *  One pass because there are three of them over half a million cells, and
 *  because three passes is three chances for them to disagree. */
function buildActivity(): Built {
  if (built) return built;

  /* Every month the development has seen, so the strips line up across rows —
     a sparkline whose x-axis differs per row lies by omission. */
  const allMonths = certificatesByMonth().map((m) => m.month);
  const index = new Map(allMonths.map((m, i) => [m, i]));

  const personMonths = new Map<string, ActivityMonth[]>();
  const jobMonths = new Map<string, ActivityMonth[]>();
  const cells = new Map<string, CellActivity>();
  /* ⚠️  THE SAME TALLY, SCOPED TO ONE PERSON. Every member of the crew works a
     single trade, and a trade is a single job type here — so a person's split
     "by job type" was always one row, which told nobody anything. The useful
     grain for a person is the checklist cell: kitchen electrical and bedroom
     electrical are the same job type and not remotely the same job. */
  const personCells = new Map<string, CellActivity>();
  const cross = new Map<string, Crossing>();

  for (const tower of TOWERS) {
    for (const unit of UNITS[tower.key]) {
      if (unit.sealed === 0) continue;
      const captures = capturesFor(unit, tower);

      for (const job of JOBS) {
        const session = sessionFor(unit, tower, job);
        if (!session) continue;

        const i = index.get(session.date.slice(0, 7));
        if (i === undefined) continue;

        const jobKey = `${job.stage}:${job.trade}`;
        const personId = session.by.id;
        const crossKey = `${personId}:${jobKey}`;

        if (!personMonths.has(personId)) {
          personMonths.set(personId, blankMonths(allMonths));
        }
        if (!jobMonths.has(jobKey)) jobMonths.set(jobKey, blankMonths(allMonths));
        if (!cross.has(crossKey)) {
          cross.set(crossKey, {
            personId,
            jobKey,
            stage: job.stage,
            trade: job.trade,
            name: session.by.name,
            captures: 0,
            inspection: 0,
            rework: 0,
            flagged: 0,
          });
        }

        const pm = personMonths.get(personId)![i];
        const jm = jobMonths.get(jobKey)![i];
        const xs = cross.get(crossKey)!;

        for (const cell of captures) {
          if (cell.requirement.stage !== job.stage) continue;
          if (cell.requirement.trade !== job.trade) continue;
          if (!hasPhotograph(cell)) continue;

          const blankCell = (): CellActivity => ({
            room: cell.requirement.room,
            what: cell.requirement.what,
            stage: job.stage,
            trade: job.trade,
            difficulty: cell.requirement.difficulty,
            captures: 0,
            inspection: 0,
            rework: 0,
            flagged: 0,
          });

          const cellKey = `${jobKey}:${cell.requirement.room}`;
          if (!cells.has(cellKey)) cells.set(cellKey, blankCell());
          const cs = cells.get(cellKey)!;

          const mineKey = `${personId}:${cellKey}`;
          if (!personCells.has(mineKey)) personCells.set(mineKey, blankCell());
          const ps = personCells.get(mineKey)!;

          pm.captures += 1;
          jm.captures += 1;
          xs.captures += 1;
          cs.captures += 1;
          ps.captures += 1;

          /* ⚠️  `raised`, NOT `status`. Status is where the cell is now, and a
             stage that has sealed is uniformly complete — counting that way
             threw away every flag the moment it was closed, so every month
             before the current one showed a clean sheet for everybody and the
             whole history was blank. What a record holds is what was raised
             against the work, whether or not it has since been put right. */
          if (cell.raised === "inspection") {
            pm.inspection += 1;
            jm.inspection += 1;
            xs.inspection += 1;
            cs.inspection += 1;
            ps.inspection += 1;
          } else if (cell.raised === "rework") {
            pm.rework += 1;
            jm.rework += 1;
            xs.rework += 1;
            cs.rework += 1;
            ps.rework += 1;
          } else {
            continue;
          }

          pm.flagged += 1;
          jm.flagged += 1;
          xs.flagged += 1;
          cs.flagged += 1;
          ps.flagged += 1;
          if (!cell.resolved) {
            pm.open += 1;
            jm.open += 1;
          }
        }
      }
    }
  }

  const people: PersonActivity[] = CREW.map((person) => ({
    id: person.id,
    name: person.name,
    initials: person.initials,
    trade: person.trade,
    firm: person.org.en,
    ...totalsOf(personMonths.get(person.id) ?? blankMonths(allMonths)),
  })).sort((a, b) => b.captures - a.captures);

  const jobs: JobActivity[] = JOBS.map((job) => {
    const key = `${job.stage}:${job.trade}`;
    return {
      key,
      stage: job.stage,
      trade: job.trade,
      cells: [...cells.entries()]
        .filter(([k]) => k.startsWith(`${key}:`))
        .map(([, c]) => c)
        .sort((a, b) => b.difficulty - a.difficulty),
      ...totalsOf(jobMonths.get(key) ?? blankMonths(allMonths)),
    };
  }).sort((a, b) => b.captures - a.captures);

  built = { people, jobs, crossings: [...cross.values()], personCells };
  return built;
}

export function personActivity(): PersonActivity[] {
  return buildActivity().people;
}

export function jobActivity(): JobActivity[] {
  return buildActivity().jobs;
}

/** One person's work split by checklist cell — the room and the task together,
 *  which is the grain somebody actually schedules and chases.
 *
 *  Ordered by what was raised against it, because that is the question being
 *  asked when somebody opens a name. */
export function cellsForPerson(personId: string): CellActivity[] {
  const prefix = `${personId}:`;
  return [...buildActivity().personCells.entries()]
    .filter(([k]) => k.startsWith(prefix))
    .map(([, c]) => c)
    .sort((a, b) => b.flagged - a.flagged || b.captures - a.captures);
}

/** One person's work split by job type. */
export function jobsForPerson(personId: string): Crossing[] {
  return buildActivity()
    .crossings.filter((c) => c.personId === personId)
    .sort((a, b) => b.captures - a.captures);
}

/** One job type's work split by the people who did it. */
export function peopleForJob(jobKey: string): Crossing[] {
  return buildActivity()
    .crossings.filter((c) => c.jobKey === jobKey)
    .sort((a, b) => b.captures - a.captures);
}

/** Every month the strips span, so all rows share one axis. */
export function activityMonths(): string[] {
  return certificatesByMonth().map((m) => m.month);
}

/* ── Work still to do ────────────────────────────────────────────────────── */

/* ⚠️  THE PRODUCT DOES NOT ASSIGN WORK. Delphi has no concept of a job, a
   schedule, an assignee or a due date: somebody opens the app, takes a
   photograph, and a certificate exists. Everything below is the thing a
   developer with 70% of the work subcontracted actually needs in order to use
   any of it at scale, and it does not exist yet. It belongs near the top of
   the gap analysis — above the review queue, because you cannot review work
   nobody was asked to do.

   ⚠️  AND A JOB IS NOT A CERTIFICATE. Asking somebody to photograph a bathroom
   is an instruction; the certificate is what comes back. The instruction can
   be wrong, late, duplicated or ignored, and none of that touches the record —
   which is exactly why the two must stay separate objects. Marking a job done
   here would not make a certificate exist, and this screen never pretends
   otherwise.

   The unit is one checklist cell: apartment, room and trade together. That is
   the grain somebody can actually be sent to do — "apartment 1134, bathroom,
   plumbing" is a morning's work with a known answer, where "apartment 1134" is
   four trades and three weeks. */

/* The lifecycle of an instruction. It ends at "done", and "done" is not
   something this screen can declare — see the note on openWork(). */
export type WorkState =
  /** Due, and nobody's name on it. */
  | "unassigned"
  /** Somebody has it, not started. */
  | "pending"
  /** Being worked on now. */
  | "in-progress"
  /** Captured, and the site team asked for a second look. */
  | "inspection"
  /** Captured, and the site team sent it back. */
  | "rework"
  /** The photograph exists, so the instruction is discharged. */
  | "done";

export type WorkItem = {
  /** tower:unit:stage:trade:room — stable, so session edits survive a re-sort. */
  id: string;
  tower: Tower;
  unit: UnitState;
  requirement: Requirement;
  stage: string;
  trade: Trade;
  room: string;
  state: WorkState;
  /** Who it falls to. Null when nobody has been given it. */
  by: Capturer | null;
  /** ISO date. Past TODAY means late. For finished work, the day it was
   *  captured — a due date on something already done is noise. */
  due: string;
  /** Negative when it is still ahead, zero once it is done. */
  daysLate: number;
  /** The certificate this job's photograph belongs to, once one exists.
   *
   *  ⚠️  NULL UNTIL THERE IS A PHOTOGRAPH, and that is the honest half of the
   *  model: an instruction nobody has carried out has no record behind it, and
   *  a job screen that offered a certificate link on every row would be
   *  offering to open something that does not exist. Sent-back work has one —
   *  which is the point, because the first question about a rework is what the
   *  photograph actually showed. */
  certificate: string | null;
};

/** The crew who could take a given trade. */
export function crewForTrade(trade: Trade): Capturer[] {
  return CREW.filter((c) => c.trade === trade);
}

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY)
    .toISOString()
    .slice(0, 10);
}

/** How far back finished jobs stay on the board. */
const DONE_WINDOW_DAYS = 28;

let workCache: WorkItem[] | null = null;

/** Everything outstanding, across all three towers.
 *
 *  ⚠️  THE CURRENT STAGE ONLY, plus anything sent back. A list that also held
 *  every cell of every stage a tower has not reached would be forty thousand
 *  rows of work nobody can start, and would bury the eleven hundred somebody
 *  can. Future stages are a programme, not a job list. */
export function openWork(): WorkItem[] {
  if (workCache) return workCache;

  const out: WorkItem[] = [];
  for (const tower of TOWERS) {
    for (const unit of UNITS[tower.key]) {
      if (unit.sealed === 0) continue;

      /* When each job was photographed, so finished work can be dated by the
         capture rather than by an instruction nobody needs any more. */
      const captured = new Map<string, string>();
      for (const job of JOBS) {
        const session = sessionFor(unit, tower, job);
        if (session) captured.set(`${job.stage}:${job.trade}`, session.date);
      }

      for (const cell of capturesFor(unit, tower)) {
        const r = cell.requirement;
        const seed = `${tower.key}-${unit.code}-${r.stage}-${r.trade}-${r.room}`;
        const when = captured.get(`${r.stage}:${r.trade}`);

        /* ⚠️  FLAGGED FIRST, AND THAT ORDER IS THE WHOLE POINT. A capture the
           site team sent back HAS a photograph — hasPhotograph() is true for
           inspection and rework alike — so testing for the photograph first
           filed every flagged job as finished and took inspection and rework
           to zero on a board whose entire job is to surface them. The
           photograph existing is not the instruction being discharged when
           somebody has asked for it again. */
        if (cell.status === "warning" || cell.status === "problem") {
          out.push({
            id: seed,
            tower,
            unit,
            requirement: r,
            stage: r.stage,
            trade: r.trade,
            room: r.room,
            state: cell.status === "problem" ? "rework" : "inspection",
            by: cell.by,
            certificate: certificateCode(unit, tower, r.stage, r.trade),
            /* Dated from when it was raised, so sent-back work surfaces as the
               oldest thing on the board — which is what it is, and what nobody
               wants to find at handover. */
            due: addDays(TODAY, Math.round(hash01(`${seed}:due`) * 26) - 20),
            daysLate: -Math.round(hash01(`${seed}:due`) * 26) + 20,
          });
          continue;
        }

        /* ⚠️  FINISHED WORK EARNS A PLACE, BUT ONLY RECENTLY. A job list that
           hides everything the moment it is done cannot show you that the
           hundred you raised last week came back — which is half of what
           monitoring means. One that keeps all three thousand buries the
           hundred that have not. Four weeks is the window somebody still
           cares about. */
        if (hasPhotograph(cell)) {
          if (!when || ageInDays(when) > DONE_WINDOW_DAYS) continue;
          out.push({
            id: seed,
            tower,
            unit,
            requirement: r,
            stage: r.stage,
            trade: r.trade,
            room: r.room,
            state: "done",
            by: cell.by,
            due: when,
            daysLate: 0,
            certificate: certificateCode(unit, tower, r.stage, r.trade),
          });
          continue;
        }

        const open = cell.status === "pending" || cell.status === "active";
        if (!open) continue;
        /* Pending in a stage the apartment has not reached is not work yet. */
        if (cell.status === "pending" && unit.current !== r.stage) continue;

        /* ⚠️  SOME OF IT HAS NOBODY ON IT, which is the point of the screen.
           The fixture hands every cell a capturer, so without this the job
           list would open with nothing to do and the create flow would have
           no reason to exist. Roughly a third of what has not been started is
           unallocated — which is also what a site office looks like on a
           Monday. */
        const loose =
          cell.status === "pending" && hash01(`${seed}:assigned`) < 0.34;

        const state: WorkState =
          cell.status === "active"
            ? "in-progress"
            : loose
              ? "unassigned"
              : "pending";

        /* Spread either side of today, so the list has work in hand and work
           that has slipped. Sent-back work is dated from when it was raised,
           so it surfaces as the oldest thing on the page — which is what it
           is, and what nobody wants to discover at handover. */
        const due = addDays(TODAY, Math.round(hash01(`${seed}:due`) * 34) - 12);

        out.push({
          id: seed,
          tower,
          unit,
          requirement: r,
          stage: r.stage,
          trade: r.trade,
          room: r.room,
          state,
          by: loose ? null : cell.by,
          due,
          daysLate: ageInDays(due),
          /* Nothing captured yet, so nothing to open. */
          certificate: null,
        });
      }
    }
  }

  /* Latest first would bury what has slipped. Oldest due date first is the
     order somebody works a list in. */
  workCache = out.sort((a, b) => a.due.localeCompare(b.due));
  return workCache;
}

/** The code of the certificate covering a job, if one has published. */
function certificateCode(
  unit: UnitState,
  tower: Tower,
  stage: string,
  trade: Trade,
): string | null {
  const session = sessionFor(unit, tower, { stage, trade });
  return session?.code ?? null;
}

/** The capture behind a job, so a row can open the photograph it is about. */
export function captureFor(item: WorkItem): RequiredCapture | null {
  return (
    capturesFor(item.unit, item.tower).find(
      (c) =>
        c.requirement.stage === item.stage &&
        c.requirement.trade === item.trade &&
        c.requirement.room === item.room,
    ) ?? null
  );
}

/** How the backlog splits, for the figures above the table. */
export function workSummary(items: WorkItem[]) {
  const by = (s: WorkState) => items.filter((i) => i.state === s).length;
  return {
    total: items.length,
    /* Outstanding is what somebody still has to do — "done" rows are on the
       board to be seen, not to be counted as work. */
    outstanding: items.filter((i) => i.state !== "done").length,
    unassigned: by("unassigned"),
    pending: by("pending"),
    inProgress: by("in-progress"),
    inspection: by("inspection"),
    rework: by("rework"),
    done: by("done"),
    late: items.filter((i) => i.state !== "done" && i.daysLate > 0).length,
  };
}

/** Work that could be raised but has not been: the forward pipeline.
 *
 *  ⚠️  THE TWO HALVES OF THIS SCREEN ARE DIFFERENT SETS. openWork() is what is
 *  in flight — 127 cells across the two towers that have started. This is
 *  everything else: Torre 3 has not begun a single apartment and 56 of Torre
 *  2's have not either, which is some three hundred apartments of work nobody
 *  has asked for yet. Monitoring is the first set; creating jobs is the
 *  second, and conflating them would either bury the live work in forty
 *  thousand rows or leave nothing to schedule.
 *
 *  Excludes anything already photographed, and anything already in flight. */
export function candidateWork(opts: {
  towerKey: string;
  stage: string;
  trade: Trade;
  rooms?: string[];
  floorFrom?: number;
  floorTo?: number;
}): { tower: Tower; unit: UnitState; requirement: Requirement }[] {
  const tower = TOWERS.find((t) => t.key === opts.towerKey);
  if (!tower) return [];

  const live = new Set(openWork().map((w) => w.id));
  const from = opts.floorFrom ?? 1;
  const to = opts.floorTo ?? tower.floors;
  const rooms = opts.rooms?.length ? new Set(opts.rooms) : null;

  const out: { tower: Tower; unit: UnitState; requirement: Requirement }[] = [];
  for (const unit of UNITS[tower.key]) {
    if (unit.floor < from || unit.floor > to) continue;
    for (const cell of capturesFor(unit, tower)) {
      const r = cell.requirement;
      if (r.stage !== opts.stage || r.trade !== opts.trade) continue;
      if (rooms && !rooms.has(r.room)) continue;
      if (hasPhotograph(cell)) continue;
      const id = `${tower.key}-${unit.code}-${r.stage}-${r.trade}-${r.room}`;
      if (live.has(id)) continue;
      out.push({ tower, unit, requirement: r });
    }
  }
  return out;
}

/** The rooms a given stage and trade actually asks for. A trade has no work in
 *  most rooms, and offering all seven would invite jobs that cannot exist. */
export function roomsForJob(stage: string, trade: Trade): string[] {
  return REQUIREMENTS.filter((r) => r.stage === stage && r.trade === trade).map(
    (r) => r.room,
  );
}

/** Job types that can be raised: the unit-level ones. Plot, foundations and
 *  structure are not somebody's morning. */
export const SCHEDULABLE_JOBS = JOBS.filter((j) =>
  REQUIREMENTS.some((r) => r.stage === j.stage && r.trade === j.trade),
);
