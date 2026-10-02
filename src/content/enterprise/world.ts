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
};

export const CREW: Capturer[] = [
  {
    id: "mario",
    name: "Mario Restrepo",
    initials: "MR",
    trade: "plumbing",
    org: { en: "Instalaciones Restrepo Ltda.", es: "Instalaciones Restrepo Ltda." },
  },
  {
    id: "luigi",
    name: "Luigi Bernal",
    initials: "LB",
    trade: "plumbing",
    org: { en: "Instalaciones Restrepo Ltda.", es: "Instalaciones Restrepo Ltda." },
  },
  {
    id: "nelson",
    name: "Nelson Quintero",
    initials: "NQ",
    trade: "electrical",
    org: { en: "Electricidad Quintero S.A.S.", es: "Electricidad Quintero S.A.S." },
  },
  {
    id: "yesica",
    name: "Yésica Arboleda",
    initials: "YA",
    trade: "electrical",
    org: { en: "Electricidad Quintero S.A.S.", es: "Electricidad Quintero S.A.S." },
  },
  {
    id: "diana",
    name: "Diana Ocampo",
    initials: "DO",
    trade: "finishes",
    org: { en: "Acabados del Valle", es: "Acabados del Valle" },
  },
  {
    id: "fabian",
    name: "Fabián Lozano",
    initials: "FL",
    trade: "finishes",
    org: { en: "Acabados del Valle", es: "Acabados del Valle" },
  },
  {
    id: "camila",
    name: "Camila Ruiz",
    initials: "CR",
    trade: "own",
    org: { en: "Constructora Aldamar", es: "Constructora Aldamar" },
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
  { room: "cocina", trade: "plumbing", stage: "rough-in", image: "co-kitchen-plumbing", what: { en: "Water, waste and gas points", es: "Puntos de agua, desagüe y gas" } },
  { room: "bano", trade: "plumbing", stage: "rough-in", image: "co-bath-plumbing", what: { en: "Sanitary points and waterproofing", es: "Puntos sanitarios e impermeabilización" } },

  /* Electrical goes everywhere, including the hall. */
  { room: "sala", trade: "electrical", stage: "rough-in", image: "co-sala-electrical", what: { en: "Conduit and outlet boxes", es: "Ductería y cajas de salida" } },
  { room: "principal", trade: "electrical", stage: "rough-in", image: "co-bedroom-electrical", what: { en: "Bedroom circuits", es: "Circuitos de alcoba" } },
  { room: "alcoba2", trade: "electrical", stage: "rough-in", image: "co-bedroom-electrical", what: { en: "Bedroom circuits", es: "Circuitos de alcoba" } },
  { room: "cocina", trade: "electrical", stage: "rough-in", image: "co-kitchen-electrical", what: { en: "Appliance circuits", es: "Circuitos de electrodomésticos" } },
  { room: "bano", trade: "electrical", stage: "rough-in", image: "co-bedroom-electrical", what: { en: "Lighting and extractor", es: "Iluminación y extractor" } },
  { room: "hall", trade: "electrical", stage: "rough-in", image: "co-hall-board", what: { en: "Board and feed", es: "Tablero y acometida" } },

  { room: "sala", trade: "finishes", stage: "finishes", image: "co-sala-finished", what: { en: "Floor, paint and skirting", es: "Piso, pintura y guardaescoba" } },
  { room: "principal", trade: "finishes", stage: "finishes", image: "co-bedroom-finished", what: { en: "Finishes and wardrobe", es: "Acabados y closet" } },
  { room: "alcoba2", trade: "finishes", stage: "finishes", image: "co-bedroom-finished", what: { en: "Finishes and wardrobe", es: "Acabados y closet" } },
  { room: "cocina", trade: "finishes", stage: "finishes", image: "co-kitchen-finished", what: { en: "Cabinetry and worktop", es: "Mobiliario y mesón" } },
  { room: "bano", trade: "finishes", stage: "finishes", image: "co-bath-finished", what: { en: "Tiling and fittings", es: "Enchape y aparatos" } },
  { room: "hall", trade: "finishes", stage: "finishes", image: "co-hall-finished", what: { en: "Door, frame and lock", es: "Puerta, marco y cerradura" } },
  { room: "balcon", trade: "finishes", stage: "finishes", image: "co-balcony-finished", what: { en: "Floor and handrail", es: "Piso y pasamanos" } },

  { room: "sala", trade: "own", stage: "handover", image: "co-sala-handover", what: { en: "Condition at handover", es: "Estado de entrega" } },
  { room: "principal", trade: "own", stage: "handover", image: "co-bedroom-handover", what: { en: "Condition at handover", es: "Estado de entrega" } },
  { room: "alcoba2", trade: "own", stage: "handover", image: "co-bedroom-handover", what: { en: "Condition at handover", es: "Estado de entrega" } },
  { room: "cocina", trade: "own", stage: "handover", image: "co-kitchen-finished", what: { en: "Appliances and meters", es: "Electrodomésticos y medidores" } },
  { room: "bano", trade: "own", stage: "handover", image: "co-bath-finished", what: { en: "Condition at handover", es: "Estado de entrega" } },
  { room: "hall", trade: "own", stage: "handover", image: "co-hall-finished", what: { en: "Keys and snag list", es: "Llaves y lista de pendientes" } },
  { room: "balcon", trade: "own", stage: "handover", image: "co-balcony-finished", what: { en: "Condition at handover", es: "Estado de entrega" } },
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
export function shotSrc(image: string, width: 240 | 480 | 960) {
  /* ⚠️  EVERY CAPTURE IMAGE LIVES IN `features`, and must. The cadogan-*
     capture set is built at 240 and 878 only — it exists to be thumbnails on
     the evidence record — so asking it for 480 or 960 returned 404s that
     showed as empty frames with no console error. The apartment sheet asks
     for both. Anything added here has to be registered in the `features`
     group of scripts/optimise-images.mjs, which builds 240/480/960/1920. */
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
      return {
        requirement,
        status: "complete" as const,
        by,
        time: timeFrom(seed),
        published,
      };
    }

    /* The stage being worked on now: a mixed column, which is the only
       interesting state on the whole sheet. */
    if (unit.current === requirement.stage) {
      const status: UnitPhase =
        h < 0.52
          ? "complete"
          : h < 0.68
            ? "active"
            : h < 0.8
              ? "warning"
              : h < 0.87
                ? "problem"
                : "pending";
      return {
        requirement,
        status,
        by,
        time: status === "complete" || status === "problem" ? timeFrom(seed) : null,
        published,
      };
    }

    return { requirement, status: "pending" as const, by, time: null, published };
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

/** The image a capture actually shows: its defect photograph when one has been
 *  raised against it, otherwise the ordinary record shot. */
export function imageFor(cell: RequiredCapture): string {
  return cell.status === "warning" || cell.status === "problem"
    ? defectImage(cell.requirement)
    : cell.requirement.image;
}
