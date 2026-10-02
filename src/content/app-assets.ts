import {
  DEVELOPMENT,
  GEOMETRY,
  TOWERS,
  unitsIn,
  type Tower,
} from "@/content/enterprise/world";

/* ============================================================================
   ASSETS IN THE APP DEMO
   ============================================================================
   The three towers of Ciudadela Altavista, which is the development the whole
   demo is about.

   ⚠️  DERIVED FROM THE TOWERS, NEVER TYPED. The previous version was five
   invented London addresses with hand-written unit counts, and every one of
   them disagreed with what was drawn when you opened it: the map said
   "9 Chester Terrace · Building · 24 units" and the explorer behind it drew an
   eighteen-storey block of 144 apartments — the same block for all three,
   because the page passed TOWERS[0] whichever asset you clicked. Three
   addresses, one building, and no number on the screen true of any of them.

   Reading the towers means a label cannot drift from its drawing: change a
   tower's height in content/enterprise/world.ts and the count on the map
   changes with it.

   ⚠️  COORDINATES ARE REAL, THE DEVELOPER IS NOT. Jamundí exists and the
   towers stand where a development of this kind would; Constructora Aldamar
   is invented. See the warnings at the top of world.ts. */

export type AppAsset = {
  id: string;
  name: string;
  tower: Tower;
  units: number;
  floors: number;
  at: { lat: number; lng: number };
  /* Cover photograph. The balcony frame reads as a residential tower at
     thumbnail size where a rough-in shot of bare blockwork does not. */
  image: string;
};

const slug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

export const APP_ASSETS: AppAsset[] = TOWERS.map((tower) => ({
  id: slug(tower.name),
  name: tower.name,
  tower,
  units: unitsIn(tower),
  floors: tower.floors,
  at: tower.at,
  image: "/assets/features/co-balcony-finished-480.webp",
}));

/** The development the towers belong to, for the panel over the map. */
export const APP_DEVELOPMENT = {
  name: DEVELOPMENT.name,
  place: DEVELOPMENT.city.en,
  towers: TOWERS.length,
  units: TOWERS.reduce((n, t) => n + unitsIn(t), 0),
  apartmentsPerFloor: GEOMETRY.unitsPerFloor,
  at: DEVELOPMENT.at,
} as const;
