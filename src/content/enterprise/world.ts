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
  /* NO FLOOR COUNT HERE — it belongs to the tower, because the three towers
     are different heights. Anything needing "how tall" must ask a Tower. */
  unitsPerFloor: 8,
  /* 4 apartments along each long elevation, front and back, either side of a
     central corridor — the arrangement a Colombian residential tower of this
     size actually uses. */
  baysX: 4,
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

export const BUILDING_WIDTH = GEOMETRY.baysX * GEOMETRY.bayWidth;

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
  /* What a rough-in inspection photographs in this room. The bridge between a
     plan and a capture checklist — and the reason the room layout is here at
     all rather than being decoration. */
  captures: number;
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
      captures: 3,
    },
    {
      key: "principal",
      name: { en: "Main bedroom", es: "Alcoba principal" },
      x: 4.2,
      z: 0,
      w: 3.0,
      d: 4.2,
      captures: 2,
    },
    {
      key: "cocina",
      name: { en: "Kitchen", es: "Cocina" },
      x: 0,
      z: 4.2,
      w: 2.4,
      d: 3.8,
      /* The most photographed room at rough-in: gas, water, waste and the
         laundry point all land here. */
      captures: 4,
    },
    {
      key: "bano",
      name: { en: "Bathroom", es: "Baño" },
      x: 2.4,
      z: 4.2,
      w: 1.8,
      d: 1.8,
      captures: 3,
    },
    {
      key: "alcoba2",
      name: { en: "Bedroom 2", es: "Alcoba 2" },
      x: 4.2,
      z: 4.2,
      w: 3.0,
      d: 3.8,
      captures: 2,
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
      captures: 0,
    },
  ] satisfies Room[],
} as const;

/** The five rooms, excluding circulation. Derived so the figure in the copy
 *  cannot disagree with the plan being drawn. */
export const ROOMS = APARTMENT.rooms.filter((r) => r.key !== "hall");

/** Captures a full rough-in inspection of one apartment comes to. Summed from
 *  the rooms rather than stated — this is the number that makes the case that
 *  one certificate holds a dozen photographs rather than one. */
export const CAPTURES_PER_APARTMENT = APARTMENT.rooms.reduce(
  (n, r) => n + r.captures,
  0,
);

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
  /* How far the build has got, in floors, per stage. Structure to floor 14
     means floors 1–14 have a sealed structure certificate. Monotonic by
     construction: you cannot finish an apartment on a floor whose slab is not
     poured, and the explorer would draw a lie if these were not ordered. */
  front: { structure: number; "rough-in": number; finishes: number; handover: number };
  siteworks: { plot: boolean; foundations: boolean };
};

export const TOWERS: Tower[] = [
  {
    key: "t1",
    name: "Torre 1",
    floors: 18,
    /* Topped out and handing over — the tower that proves the far end of the
       process exists. */
    front: { structure: 18, "rough-in": 18, finishes: 15, handover: 9 },
    siteworks: { plot: true, foundations: true },
  },
  {
    key: "t2",
    /* THE ONE THE EXPLORER OPENS ON. Part-built is the only interesting state:
       a finished tower is a uniform block and an empty one is a box. Torre 2
       has four distinct bands and you can see the build front in it. */
    name: "Torre 2",
    floors: 21,
    front: { structure: 14, "rough-in": 9, finishes: 5, handover: 2 },
    siteworks: { plot: true, foundations: true },
  },
  {
    key: "t3",
    name: "Torre 3",
    floors: 24,
    /* Foundations only. Present so the portfolio is not three copies of the
       same picture, and so "nothing captured yet" is a visible state. */
    front: { structure: 0, "rough-in": 0, finishes: 0, handover: 0 },
    siteworks: { plot: true, foundations: true },
  },
];

/** Apartments in one tower. Its own height times the plate. */
export const unitsIn = (tower: Tower) => tower.floors * GEOMETRY.unitsPerFloor;

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
  handoverFrom: "2027-06-01",
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
      en: "All six stages captured against each apartment, including the slab under it.",
      es: "Las seis etapas capturadas por apartamento, incluida la placa que lo soporta.",
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
  const atLevel = (level: StageLevel) =>
    STAGES.filter((s) => s.level === level).length;

  /* Summed PER TOWER rather than multiplied by a tower count, because the
     three towers are different heights. Multiplying a floor count by three
     was right when they were identical and became quietly wrong the moment
     they were not — the kind of arithmetic that keeps returning a plausible
     number while meaning nothing. */
  let total = 0;
  for (const tower of TOWERS) {
    const units = unitsIn(tower);

    if (g === "per-unit") {
      total += STAGES.length * units;
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

/** Media items a development's evidence amounts to, at a representative dozen
 *  per certificate. Deliberately a range in the copy that uses it: the real
 *  figure depends on the checklist, and a precise-looking number here would be
 *  false precision. */
export const MEDIA_PER_CERTIFICATE = 12;

/** The product's hard ceiling, quoted where the batching option relies on it.
 *  Stated rather than implied — the whole batched model stands on this number
 *  and a reader should be able to check the arithmetic. */
export const MEDIA_LIMIT = 40;

/* ── Units, generated ────────────────────────────────────────────────────── */

export type UnitState = {
  /** 1402 — floor 14, unit 02. The numbering a Colombian site actually uses. */
  code: string;
  floor: number;
  /** 1-based position along the floor plate, 1…unitsPerFloor. */
  position: number;
  /** How many of the six stages have a sealed certificate. 0…6. */
  sealed: number;
  /** The stage this apartment is working on now, or null if it is finished or
   *  has not started. */
  current: string | null;
  /** Something a person has to deal with: a capture rejected by screening, a
   *  checklist left incomplete, a subcontractor who has not been back. */
  attention: boolean;
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
  const { unitsPerFloor } = GEOMETRY;

  for (let floor = 1; floor <= tower.floors; floor++) {
    for (let position = 1; position <= unitsPerFloor; position++) {
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
          attention: false,
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
        /* About one in fourteen, and only where there is work to have a
           problem with. A plate speckled with warnings reads as a broken
           system rather than a site with three things to chase. */
        attention: current !== null && jitter > 0.93,
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
