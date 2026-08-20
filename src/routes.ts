/* ============================================================================
   ROUTE TABLE — single source of truth
   ============================================================================
   Used three ways, all from this one definition:

     1. The client router lazy-loads each `load()` (code splitting).
     2. The prerender step awaits `load()` eagerly and renders static HTML.
     3. The sitemap generator reads `path` and `changefreq`.

   Add a page here and it is routed, prerendered and listed in the sitemap
   with no other edits.
   ========================================================================= */

import type { ComponentType } from "react";

export type RouteDef = {
  path: string;
  load: () => Promise<{ default: ComponentType }>;
  seo: {
    /* Full <title>. Front-loaded with the distinctive part — search results
       truncate around 60 characters, and "| Delphi Verify" is not the bit that
       earns the click. */
    title: string;
    description: string;
  };
  /* Excluded from the sitemap when false (404, internal tools). */
  indexable?: boolean;
  changefreq?: "weekly" | "monthly" | "yearly";
  priority?: number;
};

export const SITE_ORIGIN = "https://delphiverify.com";

export const routes: RouteDef[] = [
  {
    path: "/",
    load: () => import("@/pages/Home"),
    seo: {
      title: "Trusted evidence for the physical world | Delphi Verify",
      description:
        "Establish the condition, location and state of physical assets at the moments that matter — with evidence counterparties can verify independently.",
    },
    changefreq: "monthly",
    priority: 1.0,
  },
  {
    path: "/platform",
    load: () => import("@/pages/Platform"),
    seo: {
      title: "Evidence counterparties can rely on | Delphi Verify",
      description:
        "Trusted capture, multi-signal corroboration, cryptographic integrity and independent verification — how Delphi Verify produces a record of a physical asset that both sides of a transaction can rely on.",
    },
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    /* The depth page. Split out of /platform so the overview can state the
       assurance proposition in a few hundred words while the mechanism stays
       available in full for technical review. */
    path: "/platform/technical",
    load: () => import("@/pages/PlatformTechnical"),
    seo: {
      title: "How Delphi decides evidence can be trusted | Delphi Verify",
      description:
        "Apple App Attest device attestation, in-app capture, reproduction screening, SHA-256 sealing and an Ethereum Attestation Service anchor on Base. The full technical model.",
    },
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/industries",
    load: () => import("@/pages/Industries"),
    seo: {
      title: "Where verified evidence applies | Delphi Verify",
      description:
        "Property sales, rentals, construction, insurance, marine, automotive, industrial assets and logistics — one verification model across eight sectors.",
    },
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/trust",
    load: () => import("@/pages/Trust"),
    seo: {
      title: "Trust centre — security, privacy and compliance | Delphi Verify",
      description:
        "Security architecture, privacy and location handling, evidence integrity, business continuity, and exactly where our certification position stands.",
    },
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/company",
    load: () => import("@/pages/Company"),
    seo: {
      title: "About Delphi Verify | Delphi Verify",
      description:
        "Photographs stopped being evidence. Delphi Verify restores the ability to prove what was physically true — and to let the other party check it.",
    },
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/contact",
    load: () => import("@/pages/Contact"),
    seo: {
      title: "Speak with Delphi Verify | Delphi Verify",
      description:
        "Request a demonstration, ask for security documentation for a procurement review, or open a certificate you have been sent.",
    },
    changefreq: "yearly",
    priority: 0.7,
  },
  {
    path: "/verify",
    load: () => import("@/pages/Verify"),
    seo: {
      title: "Verify a certificate | Delphi Verify",
      description:
        "Open a Delphi certificate with its eight-character code. No account required — inspect the evidence and check the proof yourself.",
    },
    changefreq: "yearly",
    priority: 0.8,
  },
  {
    path: "/privacy",
    load: () => import("@/pages/Privacy"),
    seo: {
      title: "Privacy policy | Delphi Verify",
      description: "How Delphi Verify collects, uses and protects personal data.",
    },
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    path: "/terms",
    load: () => import("@/pages/Terms"),
    seo: {
      title: "Terms of service | Delphi Verify",
      description: "The terms governing use of Delphi Verify.",
    },
    changefreq: "yearly",
    priority: 0.3,
  },
  {
    /* Internal design-system tool. Prerendered so it works on a static host,
       but kept out of the sitemap and disallowed in robots.txt. */
    path: "/styleguide",
    load: () => import("@/pages/Styleguide"),
    seo: {
      title: "Design system | Delphi Verify",
      description: "Internal design system reference.",
    },
    indexable: false,
  },
];

export const indexableRoutes = routes.filter((r) => r.indexable !== false);
