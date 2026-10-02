import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ORG } from "@/content/dashboard";
import { AppShell } from "@/components/enterprise/AppShell";
import { SiteProgress } from "@/components/enterprise/SiteProgress";
import { AnalysisCharts } from "@/components/enterprise/AnalysisCharts";
import { ReviewQueue } from "@/components/enterprise/ReviewQueue";
import { JobsBoard } from "@/components/enterprise/JobsBoard";
import { WorkOverTime } from "@/components/enterprise/WorkOverTime";
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
    <AppShell active="Analysis" title="Analysis" eyebrow={ORG.workspace}>
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
          <Team />
        )}
      </div>
    </AppShell>
  );
}

/** Who did what, when — then the roster.
 *
 *  ⚠️  THE STRIPS COME FIRST. A tab that only lists eight names answers a
 *  question nobody opens a dashboard with. What the head of construction wants
 *  from the people tab is how much each of them recorded and when, so the
 *  activity table leads and the firm roster sits under it for the phone
 *  numbers. */
function Team() {
  const t = useT();
  return (
    <div className="flex flex-col gap-10">
      <WorkOverTime />
      <div>
        <h2 className="text-[18px] font-semibold">
          {t({ en: "Who is on site", es: "Quién está en obra" })}
        </h2>
        <p className="mt-0.5 mb-4 max-w-prose text-[12px] text-ink-secondary">
          {t({
            en: "Grouped by firm, because accountability runs to the company that was contracted rather than to the person holding the phone.",
            es: "Agrupado por empresa, porque la responsabilidad corresponde a la empresa contratada y no a la persona que sostiene el teléfono.",
          })}
        </p>
        <Crew />
      </div>
    </div>
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

  /* Grouped by firm — see the note in Team(). */
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

/** Who has been asked to photograph what, and whether they have.
 *
 *  ⚠️  THE LONDON TABLE IS GONE. This showed ActiveWork from the agency
 *  fixture behind /platform/renderings — five invented London addresses,
 *  workflow names and assignees that belong to a different product in a
 *  different country, sitting inside an app whose every other screen is about
 *  a development in Jamundí. It was the same fault as the assets map and the
 *  crew list before it: a real-looking table that contradicted the thing it
 *  sat next to.
 *
 *  ⚠️  AND THE PRODUCT STILL DOES NOT ASSIGN WORK. There is no job, assignee,
 *  due date or schedule in Delphi — see the warnings at the top of JobsBoard.
 *  This is the gap, drawn. */
function Jobs() {
  return (
    <AppShell
      active="Jobs"
      title="Jobs"
      eyebrow={ORG.workspace}
      standfirst="Apartment, room and trade — who has been asked, and what has come back."
    >
      <div className="mt-8">
        <JobsBoard />
      </div>
    </AppShell>
  );
}

