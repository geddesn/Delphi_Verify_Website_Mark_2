import { cn } from "@/lib/cn";
import { RECORD } from "@/content/evidence-record";

/* ============================================================================
   CAPTURE MAP
   ============================================================================
   The real Google map, at the real address, inside the evidence-record
   renderings — the same thing the shipping certificate shows.

   THE QUERY IS THE RECORD'S OWN ADDRESS. Google geocodes it and drops the
   pin, so the map cannot disagree with the heading above it, and correcting
   the address in one place corrects both. Do not replace this with a
   hardcoded lat/lng: that is a second copy of the same fact, and the two will
   drift the first time the address changes.

   ⚠️  THIS IS THE ONLY THIRD PARTY THE SITE TALKS TO. Everything else —
   fonts included — is self-hosted, specifically to avoid handing visitor IPs
   to anyone (see the typeface note in theme.css). This embed does hand them
   to Google, and it needed frame-src opening in firebase.json to work at all;
   the comment there records why. It was a deliberate call to show the real
   map rather than a drawing of one. If these renderings go, close the CSP
   again.

   The keyless `output=embed` form is used rather than the Maps Embed API, so
   there is no key to put in client HTML, restrict by referrer, or rotate.

   pointer-events-none, deliberately: this is a picture of a product, not a
   map anyone should be panning. It also stops the iframe swallowing wheel
   events and fighting the surrounding demo scroll.
   ========================================================================= */

const QUERY = encodeURIComponent(RECORD.address);

export function CaptureMap({ className }: { className?: string }) {
  return (
    <iframe
      title={`Map of ${RECORD.address}`}
      src={`https://maps.google.com/maps?q=${QUERY}&z=16&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("pointer-events-none block h-full w-full border-0", className)}
    />
  );
}
