/* ============================================================================
   EVENT ICONS
   ============================================================================
   The eight moments a certificate gets made: handover, inspection, delivery,
   incident, claim, milestone, repair, return.

   Drawn rather than sourced, in the same idiom as every other mark on this
   site — a 16-unit box, no fill, currentColor, round joins — so they sit
   beside the evidence marks and the panel icons without looking imported.

   Deliberately plain. These are labels for a scannable row, not illustration:
   a reader takes in eight of them at once, and eight detailed drawings at
   20px read as texture rather than as eight different things.
   ========================================================================= */

export type EventName =
  | "handover"
  | "inspection"
  | "delivery"
  | "incident"
  | "claim"
  | "milestone"
  | "repair"
  | "return";

const PATHS: Record<EventName, React.ReactNode> = {
  /* One thing passing from one party to another. */
  handover: (
    <>
      <path d="M2.5 3v10M13.5 3v10" />
      <path d="M5 8h6M8.5 5.5 11 8l-2.5 2.5" />
    </>
  ),
  /* A lens over a surface. */
  inspection: (
    <>
      <circle cx="7" cy="7" r="4.2" />
      <path d="m10.2 10.2 3.3 3.3" />
    </>
  ),
  /* A parcel, with its seam. */
  delivery: (
    <>
      <path d="M2.5 5.2 8 2.5l5.5 2.7v5.6L8 13.5l-5.5-2.7Z" />
      <path d="M2.5 5.2 8 8m0 0 5.5-2.8M8 8v5.5" />
    </>
  ),
  /* Something has gone wrong, and it is being flagged. */
  incident: (
    <>
      <path d="M8 2.2 14.3 13H1.7Z" />
      <path d="M8 6.4v3M8 11.3h.01" />
    </>
  ),
  /* A statement being put forward. */
  claim: (
    <>
      <path d="M3.5 1.8h5.3L12.5 5.4v8.8h-9Z" />
      <path d="M8.6 2v3.6h3.7" />
      <path d="m5.8 10 1.4 1.4 2.9-3" />
    </>
  ),
  /* A marker planted at a point in a project. */
  milestone: (
    <>
      <path d="M4.2 14V2" />
      <path d="M4.2 2.6h7.6l-1.7 2.5 1.7 2.5H4.2Z" />
    </>
  ),
  /* An intervention. */
  repair: (
    <>
      <path d="M9.8 2.4a3.6 3.6 0 0 0 3.9 5.9l-8 8a1.6 1.6 0 0 1-2.3-2.3l8-8a3.6 3.6 0 0 1-1.6-3.6Z" />
    </>
  ),
  /* Coming back, changed or not. */
  return: (
    <>
      <path d="M2.4 6.6h7.9a3.3 3.3 0 0 1 0 6.6H6.2" />
      <path d="M5.4 3.2 2 6.6l3.4 3.4" />
    </>
  ),
};

export function EventIcon({
  name,
  className,
}: {
  name: EventName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}
