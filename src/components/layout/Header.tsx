import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Container } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { primaryNav, ctas, brand } from "@/content/site";
import { cn } from "@/lib/cn";

/** The real Delphi mark, applied as a CSS mask and painted with --logo-ink.
 *  This themes correctly (brand navy on light, near-white on dark) without
 *  shipping two image files or inlining 13 kB of path data into the bundle. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn("flex shrink-0 items-center rounded-sm", className)}
      aria-label={`${brand.name} — home`}
    >
      <span
        role="img"
        aria-label={brand.name}
        className="block h-8 w-[113px]"
        style={{
          backgroundColor: "var(--logo-ink)",
          maskImage: "url(/assets/logo.svg)",
          WebkitMaskImage: "url(/assets/logo.svg)",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskPosition: "left center",
          WebkitMaskPosition: "left center",
        }}
      />
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "relative py-2 text-body-sm transition-colors",
      isActive ? "text-ink" : "text-ink-secondary hover:text-ink",
    );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6">
          <Wordmark />

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {primaryNav.map((item) => (
              <NavLink key={item.href} to={item.href} className={linkClass}>
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span
                        aria-hidden
                        className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <ButtonLink to={ctas.verify.href} variant="secondary">
              {ctas.verify.label}
            </ButtonLink>
            <ButtonLink to={ctas.primary.href} variant="primary">
              {ctas.primary.label}
            </ButtonLink>
            <ThemeToggle />
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />
            <button
              type="button"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
                {open ? (
                  <path
                    d="m3.5 3.5 9 9m0-9-9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                ) : (
                  <path
                    d="M2 4.5h12M2 8h12M2 11.5h12"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </Container>

      {open && (
        <div id="mobile-nav" className="border-t border-line bg-canvas lg:hidden">
          <Container className="py-6">
            <nav aria-label="Primary mobile" className="flex flex-col">
              {primaryNav.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className="flex flex-col gap-0.5 border-b border-line py-4"
                >
                  <span className="text-subheading text-ink">{item.label}</span>
                  {item.description && (
                    <span className="text-caption text-ink-muted">
                      {item.description}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              <ButtonLink to={ctas.primary.href} size="lg">
                {ctas.primary.label}
              </ButtonLink>
              <ButtonLink to={ctas.verify.href} variant="secondary" size="lg">
                {ctas.verify.label}
              </ButtonLink>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
