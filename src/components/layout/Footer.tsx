import { Link } from "react-router-dom";
import { Container } from "@/components/ui/primitives";
import { Wordmark } from "@/components/layout/Header";
import { footerNav, footer, brand } from "@/content/site";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface-sunken">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:gap-8">
          <div className="flex flex-col gap-4">
            <Wordmark />
            <p className="max-w-sm text-body-sm text-ink-secondary">
              {footer.blurb}
            </p>
            <a
              href={`mailto:${brand.email}`}
              className="w-fit font-mono text-mono text-ink-accent underline-offset-4 hover:underline"
            >
              {brand.email}
            </a>
          </div>

          {footerNav.map((group) => (
            <nav key={group.heading} aria-label={group.heading} className="flex flex-col gap-3">
              <h2 className="text-eyebrow uppercase text-ink-muted">
                {group.heading}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      to={item.href}
                      className="text-body-sm text-ink-secondary underline-offset-4 hover:text-ink hover:underline"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-line py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-ink-muted">{footer.legalLine}</p>
          <p className="font-mono text-mono-sm uppercase text-ink-muted">
            Independent evidence verification
          </p>
        </div>
      </Container>
    </footer>
  );
}
