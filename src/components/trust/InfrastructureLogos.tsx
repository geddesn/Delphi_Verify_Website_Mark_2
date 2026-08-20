import { cn } from "@/lib/cn";

/* ============================================================================
   INFRASTRUCTURE LOGOS
   ============================================================================
   Third-party technology marks, applied as CSS masks and painted with a token
   rather than rendered as coloured <img>. Three reasons:

   1. They theme. A dark navy mark vanishes on the inverted section and a white
      one vanishes on the light one; a mask follows --ink-secondary either way.
   2. They read as one set. Four brand palettes side by side is a logo soup
      that pulls attention away from the copy beside them.
   3. Monochrome treatment is what most brand guidelines actually prefer for
      attribution use, as opposed to endorsement use.

   That last point matters here. These are ATTRIBUTIONS — "Delphi runs on
   this" — not endorsements or partnerships, and the section says so in words
   as well. Never present them as customers, partners or certifications.
   ========================================================================= */

export function InfraLogo({
  name,
  label,
  className,
}: {
  /** Basename in public/assets/brand-logos. */
  name: string;
  label: string;
  className?: string;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("block h-7 w-7 shrink-0 bg-ink-secondary", className)}
      style={{
        maskImage: `url(/assets/brand-logos/${name}.svg)`,
        WebkitMaskImage: `url(/assets/brand-logos/${name}.svg)`,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}

/* ----------------------------------------------------------------------------
   CERTIFICATION MARK
   ----------------------------------------------------------------------------
   Rendered ONLY for a row whose status is "certified" and which carries a
   `mark`. Both conditions are required, and the type in trust.ts makes `mark`
   optional so no row has one by default.

   This is the gate, in code, that stops a certification badge appearing before
   the certificate exists. Do not add a fallback, and do not render this from a
   status of "pending-certification" — that is the exact conflation the old
   site made when it paired these badges with the word "readiness".
   -------------------------------------------------------------------------- */
export function CertificationMark({
  status,
  mark,
  framework,
}: {
  status: string;
  mark?: string;
  framework: string;
}) {
  if (status !== "certified" || !mark) return null;

  return (
    <img
      src={`/assets/certifications/${mark}`}
      alt={`${framework} certified`}
      width={64}
      height={64}
      loading="lazy"
      decoding="async"
      className="h-16 w-auto shrink-0"
    />
  );
}
