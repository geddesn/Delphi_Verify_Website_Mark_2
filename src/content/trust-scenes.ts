/* ============================================================================
   TRUST ENGINE — SCENE DATA
   ============================================================================
   One entry per sector. The NARRATIVE is fixed in the component; only the
   asset, the words and the tone change here.

   That seam is deliberate. A generic timeline format — beats, targets,
   easings — would be a worse After Effects that only one person can operate,
   and every new sector would become an animation job instead of a copy job.
   Adding a sector should be this object plus an image, and nothing else.

   ⚠️  CLAIMS. Outcomes describe what verified evidence ENABLES. Never a
   measured result: "damage recovered on evidence" is a mechanism, "41% more
   damage recovered" is a statistic we do not have. See src/content/trust.ts.
   ========================================================================= */

export type TrustTone = "adversarial" | "distance";

export type TrustScene = {
  id: string;
  /** Sector name, for the selector and the accessible summary. */
  sector: string;
  /** Basename in public/assets/industries. */
  asset: string;
  assetAlt: string;
  /* Interpreted by the component, not a style value. "adversarial" is two
     parties who disagree; "distance" is a party who simply cannot check. The
     dispute beat is staged differently for each. */
  tone: TrustTone;
  a: { label: string; roles: string; holds: string };
  b: { label: string; roles: string; holds: string };
  /** The ordinary sequence, before anything goes wrong. */
  exchange: string;
  /** In the counterparty's own words. Short — it is rendered large. */
  dispute: string;
  /** What the dispute actually costs, in this sector's terms. */
  stall: string;
  /** What Delphi contributes. One line. */
  delphi: string;
  outcomes: readonly string[];
};

export const yachtsScene: TrustScene = {
  id: "yachts-marine",
  sector: "Yachts & Marine",
  asset: "yachts-marine",
  assetAlt:
    "A motor yacht photographed at the quayside, the moment condition is handed between parties",
  tone: "adversarial",
  a: {
    label: "Party A",
    roles: "Owner · Manager · Broker",
    holds: "Holds the vessel, and the burden of evidencing its condition.",
  },
  b: {
    label: "Party B",
    roles: "Charterer · Captain · Insurer",
    holds: "Carries the cost if the account of its condition is wrong.",
  },
  exchange: "Delivery → charter → redelivery",
  dispute: "That damage was already there.",
  stall: "Redelivery contested. The vessel is off-hire while it is argued.",
  delphi: "Verified condition at delivery, incident and redelivery.",
  outcomes: [
    "Damage recovered on documented evidence",
    "Less downtime spent arguing over responsibility",
    "Vessel history that carries value to resale",
  ],
} as const;

/* The four stages, shown ticking through inside the Delphi panel. Fixed for
   every sector — the platform does not change by industry, which is the whole
   argument the animation is making. */
export const trustStages = [
  { n: "01", title: "Capture", body: "In-app, on an attested device." },
  { n: "02", title: "Corroborate", body: "Device, time and precise location." },
  { n: "03", title: "Seal", body: "Hashed and anchored, so change is evident." },
  { n: "04", title: "Verify", body: "Openly checkable, without an account." },
] as const;

export const trustEngineCopy = {
  eyebrow: "How the value is created",
  headline: "Watch trust change hands.",
  standfirst:
    "The same platform, in every sector: two parties, one independent record, and neither of them holding the pen. This is that, in motion.",
  replay: "Replay",
  /* Shown instead of the animation when the visitor prefers reduced motion,
     so the control is never a dead end. */
  staticNote: "Shown as a still because your system asks for reduced motion.",
} as const;

export const trustScenes = {
  "yachts-marine": yachtsScene,
} as const;
