import { cn } from "@/lib/cn";
import { RECORD } from "@/content/evidence-record";
import { useCookieConsent } from "@/app/privacy/cookie-consent-context";

/* ============================================================================
   CAPTURE MAP
   ============================================================================
   The real Google map, at the real address, inside the evidence-record
   renderings — the same thing the shipping certificate shows.

   The rendering defaults to its shared fixture address. Public certificates
   pass the address returned by the verification API, keeping the pin and the
   visible certificate data on the same source of truth.

   Google receives the visitor's IP when the frame loads, so the consent gate
   below keeps the iframe out of the document until maps are explicitly
   enabled. The same category also controls OpenStreetMap on /trust.

   The keyless `output=embed` form is used rather than the Maps Embed API, so
   there is no key to put in client HTML, restrict by referrer, or rotate.

   Product renderings disable pointer events so the iframe does not fight the
   surrounding demo scroll. Public certificates opt into interaction.
   ========================================================================= */

export function CaptureMap({
  className,
  interactive = false,
  query = RECORD.address,
}: {
  className?: string;
  interactive?: boolean;
  query?: string;
}) {
  const { allowMaps, consent, ready } = useCookieConsent();

  if (!ready || !consent.maps) {
    return <MapConsentPlaceholder className={className} onEnable={allowMaps} />;
  }

  const encodedQuery = encodeURIComponent(query);
  return (
    <iframe
      title={`Map of ${query}`}
      src={`https://maps.google.com/maps?q=${encodedQuery}&z=16&output=embed`}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      className={cn("block h-full w-full border-0", !interactive && "pointer-events-none", className)}
    />
  );
}

export function MapConsentPlaceholder({
  className,
  onEnable,
}: {
  className?: string;
  onEnable: () => void;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-sunken px-3 text-center",
        className,
      )}
    >
      <MapPinIcon />
      <p className="text-caption font-semibold text-ink">Map disabled</p>
      <button
        className="rounded-md border border-line-strong bg-surface-raised px-3 py-1 text-caption font-semibold text-ink-accent hover:border-ink-muted"
        onClick={onEnable}
        type="button"
      >
        Enable maps
      </button>
    </div>
  );
}

function MapPinIcon() {
  return (
    <svg aria-hidden className="h-5 w-5 text-ink-accent" fill="none" viewBox="0 0 20 20">
      <path d="M15.5 8.25c0 4-5.5 9.25-5.5 9.25S4.5 12.25 4.5 8.25a5.5 5.5 0 1 1 11 0Z" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="8.25" r="1.75" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
