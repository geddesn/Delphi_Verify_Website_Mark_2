import { cn } from "@/lib/cn";
import { RECORD } from "@/content/evidence-record";

/* ============================================================================
   CAPTURE MAP
   ============================================================================
   The real Google map, at the real address, inside the evidence-record
   renderings — the same thing the shipping certificate shows.

   The rendering defaults to its shared fixture address. Public certificates
   pass the address returned by the verification API, keeping the pin and the
   visible certificate data on the same source of truth.

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

export function CaptureMap({ className, query = RECORD.address }: { className?: string; query?: string }) {
  const encodedQuery = encodeURIComponent(query);
  return (
    <iframe
      title={`Map of ${query}`}
      src={`https://maps.google.com/maps?q=${encodedQuery}&z=16&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("pointer-events-none block h-full w-full border-0", className)}
    />
  );
}
