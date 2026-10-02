import { JOBS } from "@/content/dashboard";

// Demo positions on the illustrated map, expressed as percentages.
export const APP_ASSETS = [
  { id: "18-cadogan-square", name: JOBS[0].asset, kind: "property", image: "/assets/captures/cadogan-front-elevation-240.webp", x: 43, y: 59 },
  { id: "42-eaton-place", name: JOBS[1].asset, kind: "property", image: "/assets/captures/cadogan-entrance-hall-240.webp", x: 55, y: 62 },
  { id: "9-chester-terrace", name: JOBS[2].asset, kind: "building", units: 24, image: "/assets/features/rental-front-elevation-480.webp", x: 63, y: 23 },
  { id: "16-grosvenor-square", name: JOBS[3].asset, kind: "building", units: 18, image: "/assets/renderings/townhouse-facade-368.webp", x: 54, y: 40 },
  { id: "27-wilton-crescent", name: JOBS[4].asset, kind: "building", units: 12, image: "/assets/captures/cadogan-front-elevation-878.webp", x: 64, y: 57 },
] as const;
