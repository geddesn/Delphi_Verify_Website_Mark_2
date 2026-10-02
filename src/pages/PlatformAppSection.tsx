import { useLocation } from "react-router-dom";
import { ActiveWork, Sidebar, TopBar } from "@/components/renderings/WebDashboard";
import { JOBS, ORG } from "@/content/dashboard";

const sections = {
  jobs: {
    title: "Jobs",
    description: "Active work across your organisation.",
    rows: JOBS.map((job) => ({ title: job.asset, detail: `${job.workflow} · ${job.status}` })),
  },
  team: {
    title: "Team",
    description: "People currently assigned to work in this workspace.",
    rows: [
      ...new Map(
        JOBS.filter((job) => job.assignee).map((job) => [job.assignee!.name, {
          title: job.assignee!.name,
          detail: job.assignee!.role,
        }]),
      ).values(),
    ],
  },
} as const;

export default function PlatformAppSection() {
  const section = useLocation().pathname.split("/").at(-1) as keyof typeof sections;
  const page = sections[section] ?? sections.jobs;
  const active = page.title;

  return (
    <div data-theme="light" className="h-dvh min-w-[1440px] overflow-hidden bg-surface-sunken text-ink">
      <div className="flex h-full">
        <Sidebar active={active} />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 overflow-y-auto px-10 py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {ORG.workspace}
          </p>
          <h1 className="mt-2 text-[26px] font-semibold">{page.title}</h1>
          <p className="mt-2 text-[13px] text-ink-secondary">{page.description}</p>
          {section === "jobs" ? (
            <div className="mt-8"><ActiveWork /></div>
          ) : (
            <div className="mt-8 max-w-4xl overflow-hidden rounded-lg border border-line bg-surface">
              {page.rows.map((row) => (
                <div key={row.title} className="flex items-center justify-between gap-8 border-b border-line px-6 py-4 last:border-b-0">
                  <span className="text-[13px] font-medium">{row.title}</span>
                  <span className="text-[12px] text-ink-secondary">{row.detail}</span>
                </div>
              ))}
            </div>
          )}
          </main>
        </div>
      </div>
    </div>
  );
}
