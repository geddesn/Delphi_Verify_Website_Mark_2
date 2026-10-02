import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ActiveWork, Sidebar, TopBar } from "@/components/renderings/WebDashboard";
import { ORG } from "@/content/dashboard";
import { SiteProgress } from "@/components/enterprise/SiteProgress";
import { AnalysisCharts } from "@/components/enterprise/AnalysisCharts";
import { ReviewQueue } from "@/components/enterprise/ReviewQueue";
import { CREW, TRADE } from "@/content/enterprise/world";
import { useT } from "@/content/enterprise/lang";
import { cn } from "@/lib/cn";

/* ============================================================================
   JOBS AND ANALYSIS
   ============================================================================
   Two sections of the app demo that are lists rather than pictures.

   ⚠️  "TEAM" BECAME "ANALYSIS", and the people moved inside it. A nav item
   that only lists names is a thin thing to spend a quarter of the sidebar on;
   what a head of construction opens a dashboard for is the state of the work,
   with the crew as the second question — who owes me the rows that are
   outstanding. So the capture progress table is the first tab and the crew is
   the second, under one heading.
   ========================================================================= */

/* ⚠️  OVERVIEW FIRST, THEN THE DETAIL, THEN THE QUEUE, THEN THE PEOPLE. The
   order is the order somebody opens them: how is it going, where exactly, what
   needs me today, who do I ring. Team is last because it answers the question
   the other three raise, not one anybody arrives with. */
const TABS = [
  { key: "overview", label: "Overview" },
  { key: "progress", label: "Capture progress" },
  { key: "review", label: "Review" },
  { key: "team", label: "Team" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PlatformAppSection() {
  const section = useLocation().pathname.split("/").at(-1);
  const isAnalysis = section === "analysis";

  return isAnalysis ? <Analysis /> : <Jobs />;
}

/* ── Analysis ────────────────────────────────────────────────────────────── */

function Analysis() {
  const [tab, setTab] = useState<TabKey>("overview");

  return (
    <Shell active="Analysis" title="Analysis" eyebrow={ORG.workspace}>
      <div
        role="tablist"
        aria-label="Analysis"
        className="mt-6 flex gap-1 border-b border-line"
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "-mb-px cursor-pointer border-b-2 px-4 py-2.5 text-[13px] transition-colors",
              tab === t.key
                ? "border-accent font-medium text-ink"
                : "border-transparent text-ink-secondary hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" ? (
          <AnalysisCharts />
        ) : tab === "progress" ? (
          <SiteProgress />
        ) : tab === "review" ? (
          <ReviewQueue />
        ) : (
          <Crew />
        )}
      </div>
    </Shell>
  );
}

/** The people who make the captures.
 *
 *  ⚠️  THE CREW FROM world.ts, NOT THE LONDON DASHBOARD'S ASSIGNEES. This
 *  listed names pulled from content/dashboard.ts — Sarah Davies and colleagues,
 *  who belong to the London agency fixture on /platform/renderings and have
 *  nothing to do with the development every other screen in this app is about.
 *  These are the subcontractors whose names appear on the certificates. */
function Crew() {
  const t = useT();

  /* Grouped by firm, because accountability runs to the company rather than to
     the individual — which is the point of the contractor story. */
  const firms = [...new Map(CREW.map((c) => [t(c.org), c])).keys()];

  return (
    <div className="flex max-w-4xl flex-col gap-6">
      {firms.map((firm) => {
        const members = CREW.filter((c) => t(c.org) === firm);
        return (
          <section key={firm}>
            <h2 className="text-[13px] font-semibold">{firm}</h2>
            <p className="mt-0.5 text-[12px] text-ink-secondary">
              {t(TRADE[members[0].trade])} · {members.length}{" "}
              {members.length === 1 ? "person" : "people"}
            </p>

            <ul className="mt-3 overflow-hidden rounded-lg border border-line bg-surface">
              {members.map((person) => (
                <li
                  key={person.id}
                  className="flex items-center gap-3 border-b border-line px-5 py-3.5 last:border-b-0"
                >
                  <span
                    aria-hidden
                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-sunken font-mono text-[11px] text-ink-secondary"
                  >
                    {person.initials}
                  </span>
                  <span className="text-[13px] font-medium">{person.name}</span>
                  <span className="ml-auto text-[12px] text-ink-secondary">
                    {t(TRADE[person.trade])}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ── Jobs ────────────────────────────────────────────────────────────────── */

function Jobs() {
  return (
    <Shell
      active="Jobs"
      title="Jobs"
      eyebrow={ORG.workspace}
      standfirst="Active work across your organisation."
    >
      <div className="mt-8">
        <ActiveWork />
      </div>
    </Shell>
  );
}

/* ── Shared chrome ───────────────────────────────────────────────────────── */

function Shell({
  active,
  title,
  eyebrow,
  standfirst,
  children,
}: {
  active: string;
  title: string;
  eyebrow: string;
  standfirst?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-theme="light"
      className="h-dvh min-w-[1440px] overflow-hidden bg-surface-sunken text-ink"
    >
      <div className="flex h-full">
        <Sidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-10 py-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-[26px] font-semibold">{title}</h1>
            {standfirst && (
              <p className="mt-2 text-[13px] text-ink-secondary">{standfirst}</p>
            )}
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
