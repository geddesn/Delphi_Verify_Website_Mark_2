/** Minimal class-name joiner. Kept dependency-free deliberately — this is the
 *  only utility the component layer needs, and it avoids pulling clsx +
 *  tailwind-merge into the bundle for a marketing site. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
