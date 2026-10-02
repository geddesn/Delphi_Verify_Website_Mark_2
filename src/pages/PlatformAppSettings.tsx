import { ORG } from "@/content/dashboard";
import { Sidebar } from "@/components/renderings/WebDashboard";

export default function PlatformAppSettings() {
  return (
    <div data-theme="light" className="h-dvh min-w-[1440px] overflow-hidden bg-surface-sunken text-ink">
      <div className="flex h-full">
        <Sidebar active="Settings" />
        <main className="flex-1 overflow-y-auto px-10 py-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
            {ORG.workspace}
          </p>
          <h1 className="mt-2 text-[26px] font-semibold">Settings</h1>
          <p className="mt-2 text-[13px] text-ink-secondary">
            Manage your organisation and account preferences.
          </p>

          <section className="mt-8 max-w-3xl overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[15px] font-semibold">Organisation</h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                Organisation details for this workspace.
              </p>
            </div>
            <dl className="divide-y divide-line px-6">
              <div className="flex items-center justify-between py-4">
                <dt className="text-[13px] text-ink-secondary">Name</dt>
                <dd className="text-[13px] font-medium">{ORG.workspace}</dd>
              </div>
              <div className="flex items-center justify-between py-4">
                <dt className="text-[13px] text-ink-secondary">Portfolio</dt>
                <dd className="text-[13px] font-medium">{ORG.scope}</dd>
              </div>
            </dl>
          </section>

          <section className="mt-5 max-w-3xl overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-6 py-4">
              <h2 className="text-[15px] font-semibold">Your account</h2>
              <p className="mt-1 text-[12px] text-ink-muted">
                The account currently signed in to this workspace.
              </p>
            </div>
            <dl className="flex items-center justify-between px-6 py-4">
              <dt className="text-[13px] text-ink-secondary">Name</dt>
              <dd className="text-[13px] font-medium">{ORG.user.name}</dd>
            </dl>
          </section>
        </main>
      </div>
    </div>
  );
}
