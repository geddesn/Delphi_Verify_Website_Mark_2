import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/* ============================================================================
   LAYOUT & TYPOGRAPHIC PRIMITIVES
   ============================================================================
   Every component here consumes semantic tokens only (bg-surface, text-ink,
   border-line …). No raw colour values appear in this file, or in any
   component file — see src/styles/theme.css.
   ========================================================================= */

export function Container({
  children,
  className,
  width = "content",
}: {
  children: ReactNode;
  className?: string;
  width?: "content" | "prose";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 md:px-8",
        width === "content" ? "max-w-[74rem]" : "max-w-[44rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Page section with consistent vertical rhythm and an optional inverted
 *  (deep navy) treatment. Inverted sections carry the argument; light
 *  sections read as documents. */
/* Vertical rhythm is a named choice, not an ad-hoc utility. Passing `py-*`
   through className does NOT work: Tailwind resolves conflicting utilities by
   CSS source order, not class-attribute order, so a base `py-20` silently wins
   over a caller's `py-10`. Use `padding` instead. */
const sectionPadding = {
  default: "py-20 md:py-28",
  tight: "py-12 md:py-16",
  flush: "pt-0 pb-20 md:pb-28",
  none: "",
} as const;

export function Section({
  children,
  className,
  tone = "default",
  padding = "default",
  id,
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "sunken" | "inverse";
  padding?: keyof typeof sectionPadding;
  id?: string;
}) {
  return (
    <section
      id={id}
      /* Re-maps the semantic token layer for this subtree, which is how an
         inverted section works without a single `dark:` variant. */
      data-theme={tone === "inverse" ? "dark" : undefined}
      className={cn(
        sectionPadding[padding],
        tone === "default" && "bg-canvas",
        tone === "sunken" && "bg-surface-sunken",
        tone === "inverse" && "bg-canvas",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Small uppercase label. A recurring structural device that makes sections
 *  read like numbered parts of a document rather than marketing blocks. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-eyebrow uppercase text-ink-accent",
        className,
      )}
    >
      <span aria-hidden className="h-px w-6 bg-current opacity-50" />
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  headline,
  standfirst,
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  headline: string;
  standfirst?: string;
  align?: "left" | "center";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="max-w-3xl text-display text-ink md:text-display-lg">
        {headline}
      </h2>
      {standfirst && (
        <p className="max-w-2xl text-body-lg text-ink-secondary">{standfirst}</p>
      )}
      {children}
    </div>
  );
}

/** Hairline rule. Used liberally — visible structure is a large part of what
 *  separates an evidential aesthetic from a soft SaaS one. */
export function Rule({ className }: { className?: string }) {
  return <hr className={cn("border-0 border-t border-line", className)} />;
}

export function Card({
  children,
  className,
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line bg-surface-raised p-6 shadow-card",
        interactive &&
          "transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-raised",
        className,
      )}
      style={interactive ? { transitionDuration: "var(--duration-normal)" } : undefined}
    >
      {children}
    </div>
  );
}

/** Numbered card used by the pattern and stage sections. The number is a
 *  deliberate device: it implies a sequence and a document. */
export function NumberedItem({
  n,
  title,
  children,
  className,
}: {
  n: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 border-t border-line pt-6", className)}>
      <span className="font-mono text-mono-sm uppercase text-ink-muted">{n}</span>
      <h3 className="text-subheading text-ink">{title}</h3>
      <div className="text-body-sm text-ink-secondary">{children}</div>
    </div>
  );
}
