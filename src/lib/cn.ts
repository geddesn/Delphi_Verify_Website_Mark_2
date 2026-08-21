/** Minimal class-name joiner. Kept dependency-free deliberately — this is the
 *  only utility the component layer needs, and it avoids pulling clsx +
 *  tailwind-merge into the bundle for a marketing site.
 *
 *  ⚠️  IT DOES NOT MERGE CONFLICTING UTILITIES. Passing `aspect-[5/2]` to a
 *  component whose base classes already say `aspect-[16/9]` leaves both in the
 *  attribute, and CSS source order decides — usually not the one you passed,
 *  and silently. Where a component needs a value overridden, give it a PROP
 *  and put the value in `style`, rather than letting a caller fight the base
 *  class list. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
