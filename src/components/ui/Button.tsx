import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold " +
  "transition-[background-color,border-color,color] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-hover",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-ink-muted",
  ghost:
    "text-ink-accent hover:text-ink underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-body-sm",
  lg: "h-12 px-6 text-body",
};

function classes(variant: Variant, size: Size, className?: string) {
  return cn(base, variants[variant], variant !== "ghost" && sizes[size], className);
}

const motion = { transitionDuration: "var(--duration-fast)" };

export function ButtonLink({
  to,
  children,
  variant = "primary",
  size = "md",
  className,
}: {
  to: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const external = to.startsWith("http") || to.startsWith("mailto:");

  if (external) {
    return (
      <a
        href={to}
        className={classes(variant, size, className)}
        style={motion}
        rel="noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={classes(variant, size, className)} style={motion}>
      {children}
    </Link>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      type={type}
      className={classes(variant, size, className)}
      style={motion}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Small right-pointing arrow used on forward links. Kept inline rather than
 *  pulling in an icon dependency for a single glyph. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      className={cn("h-4 w-4", className)}
    >
      <path
        d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
