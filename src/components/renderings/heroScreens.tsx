import type { ReactNode } from "react";
import { MobileEvidenceRecord } from "@/components/renderings/MobileEvidenceRecord";
import { WebEvidenceRecord } from "@/components/renderings/WebEvidenceRecord";
import { MobileTasks } from "@/components/renderings/MobileTasks";
import { MobileCapture } from "@/components/renderings/MobileCapture";
import { WebDashboard } from "@/components/renderings/WebDashboard";

/* ============================================================================
   THE TWO SCREENS THE HEROES SHOW
   ============================================================================
   ONE RECORD, TWO SURFACES — and that pairing is the rule, not a preference.

   A desktop frame only earns its place beside a phone when the two are
   showing the SAME thing. The first version of this hero put Guided Capture
   on the phone and the evidence record on the desktop, which looks fine and
   is quietly wrong: they are different moments in the workflow, so the
   composition claims a relationship between the two frames that does not
   exist. A viewer reading it as one product across two surfaces would be
   reading it correctly, and would be wrong.

   The certificate is the one screen drawn for both. Both frames read the same
   fixture in content/evidence-record.ts, which is what stops the phone and
   the desktop quietly disagreeing about how many captures there were — so the
   pair is not merely consistent, it cannot come apart.

   Show a desktop where there is a desktop rendering on its own, or where
   there is a matched pair. Never as a backdrop for an unrelated phone.

   Exists so the two heroes cannot drift: both / and /platform show these.

   ── WHY IT CYCLES IN STATES, NOT SCREENS ──
   The hero moves through three states, and BOTH FRAMES MOVE TOGETHER. Cycling
   the phone on its own against a fixed desktop would break the rule above on
   every turn: a certificate sitting behind a viewfinder claims the two are
   showing one thing when they are not.

   Guided Capture has no desktop counterpart, because a viewfinder has none —
   so on that state the desktop does not appear at all rather than showing
   something unrelated. `web` is optional here for exactly that reason, and an
   entry without one is a statement, not a gap to be filled later.

   The order is the order the work happens: the job is assigned, it is
   captured, it becomes a record.
   ========================================================================= */

export type HeroPair = {
  id: string;
  mobile: () => ReactNode;
  /** Omit where there is no honest desktop counterpart. The hero then shows
   *  the phone alone for that state rather than an unrelated card. */
  web?: () => ReactNode;
};

export const heroPairs: HeroPair[] = [
  {
    /* The same work from the two ends of it: the person it is assigned to,
       and the organisation watching it get done. */
    id: "work",
    mobile: () => <MobileTasks />,
    web: () => <WebDashboard />,
  },
  {
    /* Phone alone. The one state where the absence of a desktop is the
       point — this happens in a doorway, not at a desk. */
    id: "capture",
    mobile: () => <MobileCapture />,
  },
  {
    /* The record, on both surfaces. Literally the same fixture, so the two
       frames cannot disagree — see content/evidence-record.ts. */
    id: "record",
    mobile: () => <MobileEvidenceRecord />,
    web: () => <WebEvidenceRecord />,
  },
];
