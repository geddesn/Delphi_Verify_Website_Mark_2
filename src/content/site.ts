/* ============================================================================
   SITE-WIDE CONTENT
   ============================================================================
   All navigation, brand and footer copy lives here — edit text in this folder,
   never inside components. Same principle as the design tokens: one place to
   change, no hunting through JSX.
   ========================================================================= */

export const brand = {
  name: "Delphi Verify",
  /* The one-line definition of the company. If this changes, the whole
     positioning changes — treat it as the source of truth. */
  positioning:
    "Trusted evidence for the physical world.",
  descriptor:
    "Delphi Verify helps organisations establish the condition, location and state of physical assets at moments that matter — creating evidence that counterparties can rely on.",
  /* Used in <meta> tags and structured data. */
  legalEntity: "Delphi Verify",
  email: "contact@delphiverify.com",
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

/* Flat navigation. Deliberately not a mega-menu: at six pages a dropdown adds
   friction without adding clarity. This grows into grouped menus once the
   individual vertical pages land. */
export const primaryNav: NavItem[] = [
  { label: "Platform", href: "/platform", description: "How Delphi works" },
  { label: "Industries", href: "/industries", description: "Where it applies" },
  { label: "Trust & Security", href: "/trust", description: "Why you can rely on it" },
  { label: "Company", href: "/company", description: "Who you are dealing with" },
];

export const ctas = {
  /* Primary conversion event. The old site led with "Create Certificate",
     which framed Delphi as a consumer utility — wrong signal for the
     developers, agencies and insurers now being pursued. */
  primary: { label: "Request a demonstration", href: "/contact" },
  secondary: { label: "Explore the platform", href: "/platform" },
  /* Kept prominent but demoted from hero: the public verification tool is
     proof the system is real, not the company's proposition. */
  verify: { label: "Verify a certificate", href: "/verify" },
} as const;

export const footerNav: { heading: string; items: NavItem[] }[] = [
  {
    heading: "Platform",
    items: [
      { label: "How Delphi works", href: "/platform" },
      { label: "Trusted capture", href: "/platform#capture" },
      { label: "Evidence corroboration", href: "/platform#corroborate" },
      { label: "Integrity & verification", href: "/platform#verify" },
      { label: "Verify a certificate", href: "/verify" },
    ],
  },
  {
    heading: "Industries",
    items: [
      { label: "All industries", href: "/industries" },
      { label: "Property sales", href: "/industries#property-sales" },
      { label: "Rentals & hospitality", href: "/industries#rentals" },
      { label: "Development & construction", href: "/industries#construction" },
      { label: "Insurance & claims", href: "/industries#insurance" },
    ],
  },
  {
    heading: "Trust",
    items: [
      { label: "Trust centre", href: "/trust" },
      { label: "Security", href: "/trust#security" },
      { label: "Privacy", href: "/trust#privacy" },
      { label: "Evidence integrity", href: "/trust#integrity" },
      { label: "Compliance status", href: "/trust#compliance" },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "About Delphi", href: "/company" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export const footer = {
  blurb:
    "Independent evidence that a physical asset existed in a given condition, at a given place, at a given moment — recorded so that another party can check it without taking anyone's word for it.",
  legalLine: `© ${new Date().getFullYear()} ${brand.legalEntity}. All rights reserved.`,
} as const;
